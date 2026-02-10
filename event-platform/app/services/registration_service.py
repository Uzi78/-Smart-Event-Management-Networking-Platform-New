from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from bson import ObjectId

from app.config import settings
from app.database import get_database
from app.models.registration import PaymentStatus, Registration, RegistrationStatus
from app.models.waitlist import WaitlistEntry
from app.services.email_service import email_service
from app.services.pricing_service import pricing_service
from app.services.qrcode_service import qrcode_service


class RegistrationService:
    async def create_registration(
        self,
        registration_data: Dict[str, Any],
        user_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        db = await get_database()

        availability = await pricing_service.check_availability(
            registration_data["ticket_type_id"],
            registration_data.get("group_size", 1),
        )

        if not availability["available"]:
            if availability.get("waitlist_available"):
                waitlist_entry = await self._add_to_waitlist(registration_data)
                return {
                    "success": False,
                    "reason": "sold_out",
                    "waitlist": True,
                    "waitlist_entry": waitlist_entry,
                }
            return {
                "success": False,
                "reason": availability["reason"],
                "waitlist": False,
            }

        pricing = await pricing_service.calculate_price(
            registration_data["ticket_type_id"],
            registration_data.get("group_size", 1),
            registration_data.get("discount_code"),
        )

        temp_id = str(ObjectId())
        qr_code, qr_code_image = qrcode_service.generate_qr_code(temp_id)

        registration = Registration(
            event_id=registration_data["event_id"],
            user_id=user_id,
            ticket_type_id=registration_data["ticket_type_id"],
            first_name=registration_data["first_name"],
            last_name=registration_data["last_name"],
            email=registration_data["email"],
            phone=registration_data.get("phone"),
            company=registration_data.get("company"),
            job_title=registration_data.get("job_title"),
            form_responses=registration_data.get("form_responses"),
            group_size=registration_data.get("group_size", 1),
            original_price=pricing["subtotal"],
            discount_amount=pricing["total_discount"],
            final_price=pricing["final_price"],
            discount_code=registration_data.get("discount_code"),
            qr_code=qr_code,
            qr_code_image=qr_code_image,
            status=RegistrationStatus.PENDING,
            payment_status=PaymentStatus.PENDING,
            discount_details=pricing.get("discount_details"),
        )

        result = await db.registrations.insert_one(
            registration.model_dump(by_alias=True, exclude={"id"})
        )
        registration_id = str(result.inserted_id)

        await db.ticket_types.update_one(
            {"_id": ObjectId(registration_data["ticket_type_id"])},
            {"$inc": {"reserved": registration_data.get("group_size", 1)}},
        )

        event = await db.events.find_one({"_id": ObjectId(registration_data["event_id"])})
        ticket_type = await db.ticket_types.find_one(
            {"_id": ObjectId(registration_data["ticket_type_id"])}
        )

        return {
            "success": True,
            "registration_id": registration_id,
            "qr_code": qr_code,
            "qr_code_image": qr_code_image,
            "pricing": pricing,
            "payment_required": pricing["final_price"] > 0,
            "event_name": event.get("name") if event else "",
            "ticket_type_name": ticket_type.get("name") if ticket_type else "",
        }

    async def confirm_payment(
        self,
        registration_id: str,
        payment_data: Dict[str, Any],
    ) -> bool:
        db = await get_database()

        update_data = {
            "status": RegistrationStatus.CONFIRMED,
            "payment_status": PaymentStatus.COMPLETED,
            "payment_method": payment_data.get("payment_method"),
            "payment_intent_id": payment_data.get("payment_intent_id"),
            "paypal_order_id": payment_data.get("paypal_order_id"),
            "payment_date": datetime.utcnow(),
            "transaction_id": payment_data.get("transaction_id"),
            "updated_at": datetime.utcnow(),
        }

        result = await db.registrations.update_one(
            {"_id": ObjectId(registration_id)},
            {"$set": update_data},
        )

        if result.modified_count == 0:
            return False

        registration = await db.registrations.find_one({"_id": ObjectId(registration_id)})

        await db.ticket_types.update_one(
            {"_id": ObjectId(registration["ticket_type_id"])},
            {
                "$inc": {
                    "reserved": -registration["group_size"],
                    "sold_count": registration["group_size"],
                }
            },
        )

        ticket_type = await db.ticket_types.find_one(
            {"_id": ObjectId(registration["ticket_type_id"])}
        )
        if ticket_type.get("is_early_bird") and ticket_type.get("early_bird_capacity"):
            pricing_details = registration.get("discount_details", {})
            if "early_bird" in pricing_details:
                await db.ticket_types.update_one(
                    {"_id": ObjectId(registration["ticket_type_id"])},
                    {"$inc": {"early_bird_sold": registration["group_size"]}},
                )

        event = await db.events.find_one({"_id": ObjectId(registration["event_id"])})
        ticket = ticket_type or {}

        email_data = {
            "first_name": registration["first_name"],
            "last_name": registration["last_name"],
            "email": registration["email"],
            "event_name": event.get("name", ""),
            "ticket_type": ticket.get("name", ""),
            "final_price": f"{registration['final_price']:.2f}",
            "discount_amount": f"{registration['discount_amount']:.2f}",
            "qr_code": registration["qr_code"],
            "registration_id": registration_id,
            "event_date": event.get("start_date").strftime("%B %d, %Y")
            if event.get("start_date")
            else "",
            "venue": event.get("location", "TBD"),
            "event_url": f"{settings.app_url}/events/{event.get('slug')}",
        }

        email_sent = await email_service.send_confirmation_email(
            registration["email"],
            email_data,
            registration["qr_code_image"],
        )

        if email_sent:
            await db.registrations.update_one(
                {"_id": ObjectId(registration_id)},
                {
                    "$set": {
                        "confirmation_email_sent": True,
                        "confirmation_email_sent_at": datetime.utcnow(),
                    }
                },
            )

        return True

    async def _add_to_waitlist(self, registration_data: Dict[str, Any]) -> Dict[str, Any]:
        db = await get_database()
        count = await db.waitlist_entries.count_documents(
            {
                "event_id": registration_data["event_id"],
                "ticket_type_id": registration_data["ticket_type_id"],
                "converted": False,
            }
        )

        waitlist_entry = WaitlistEntry(
            event_id=registration_data["event_id"],
            ticket_type_id=registration_data["ticket_type_id"],
            first_name=registration_data["first_name"],
            last_name=registration_data["last_name"],
            email=registration_data["email"],
            phone=registration_data.get("phone"),
            position=count + 1,
            expires_at=datetime.utcnow() + timedelta(hours=24),
        )

        result = await db.waitlist_entries.insert_one(
            waitlist_entry.model_dump(by_alias=True, exclude={"id"})
        )

        return {"waitlist_id": str(result.inserted_id), "position": waitlist_entry.position}

    async def process_waitlist(self, event_id: str, ticket_type_id: str) -> None:
        db = await get_database()
        availability = await pricing_service.check_availability(ticket_type_id, 1)
        if not availability["available"]:
            return

        waitlist_entry = await db.waitlist_entries.find_one(
            {
                "event_id": event_id,
                "ticket_type_id": ticket_type_id,
                "converted": False,
                "notified": False,
            },
            sort=[("position", 1)],
        )

        if not waitlist_entry:
            return

        event = await db.events.find_one({"_id": ObjectId(event_id)})
        ticket_type = await db.ticket_types.find_one({"_id": ObjectId(ticket_type_id)})

        await email_service.send_waitlist_notification(
            waitlist_entry["email"],
            event.get("name", ""),
            ticket_type.get("name", ""),
            waitlist_entry["position"],
            waitlist_entry["expires_at"].strftime("%B %d, %Y %I:%M %p")
            if waitlist_entry.get("expires_at")
            else None,
        )

        await db.waitlist_entries.update_one(
            {"_id": waitlist_entry["_id"]},
            {
                "$set": {
                    "notified": True,
                    "notified_at": datetime.utcnow(),
                }
            },
        )


registration_service = RegistrationService()
