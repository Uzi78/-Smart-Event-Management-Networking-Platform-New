from datetime import datetime
from typing import Optional

from bson import ObjectId

from app.database import get_database
from app.models.discount_code import DiscountCode, DiscountType
from app.models.ticket import TicketType


class PricingService:
    async def calculate_price(
        self,
        ticket_type_id: str,
        quantity: int = 1,
        discount_code: Optional[str] = None,
    ) -> dict:
        db = await get_database()
        ticket_data = await db.ticket_types.find_one({"_id": ObjectId(ticket_type_id)})
        if not ticket_data:
            raise ValueError("Ticket type not found")

        ticket = TicketType(**ticket_data)
        base_price = float(ticket.base_price)
        per_ticket_price = base_price

        early_bird_discount = 0.0
        group_discount = 0.0
        promo_code_discount = 0.0
        discount_details: dict = {}

        if ticket.is_early_bird and ticket.early_bird_price:
            now = datetime.utcnow()
            early_bird_active = True

            if ticket.early_bird_ends and now > ticket.early_bird_ends:
                early_bird_active = False

            if (
                ticket.early_bird_capacity
                and ticket.early_bird_sold >= ticket.early_bird_capacity
            ):
                early_bird_active = False

            if early_bird_active:
                early_bird_price = float(ticket.early_bird_price)
                early_bird_discount = (base_price - early_bird_price) * quantity
                per_ticket_price = early_bird_price
                discount_details["early_bird"] = {
                    "original_price": base_price,
                    "discounted_price": early_bird_price,
                    "discount_per_ticket": base_price - early_bird_price,
                    "total_discount": early_bird_discount,
                }

        subtotal = per_ticket_price * quantity

        if ticket.group_discount_enabled and ticket.group_discount_rules and quantity > 1:
            applicable_rule = None
            for rule in sorted(
                ticket.group_discount_rules, key=lambda x: x.min_quantity, reverse=True
            ):
                if quantity >= rule.min_quantity:
                    applicable_rule = rule
                    break

            if applicable_rule:
                group_discount = subtotal * (applicable_rule.discount_percent / 100)
                discount_details["group_discount"] = {
                    "quantity": quantity,
                    "min_quantity": applicable_rule.min_quantity,
                    "discount_percent": applicable_rule.discount_percent,
                    "discount_amount": group_discount,
                }

        if discount_code:
            promo_discount = await self._apply_promo_code(
                discount_code,
                ticket.event_id,
                ticket_type_id,
                subtotal - group_discount,
            )
            if promo_discount:
                promo_code_discount = promo_discount["discount_amount"]
                discount_details["promo_code"] = promo_discount

        total_discount = early_bird_discount + group_discount + promo_code_discount
        final_price = max(0, subtotal - group_discount - promo_code_discount)

        return {
            "base_price": base_price,
            "quantity": quantity,
            "subtotal": subtotal,
            "early_bird_discount": early_bird_discount,
            "group_discount": group_discount,
            "promo_code_discount": promo_code_discount,
            "total_discount": total_discount,
            "final_price": final_price,
            "per_ticket_price": final_price / quantity if quantity > 0 else 0,
            "discount_details": discount_details,
        }

    async def _apply_promo_code(
        self,
        code: str,
        event_id: str,
        ticket_type_id: str,
        amount: float,
    ) -> Optional[dict]:
        db = await get_database()
        promo_data = await db.discount_codes.find_one(
            {
                "event_id": event_id,
                "code": code,
                "is_active": True,
            }
        )

        if not promo_data:
            return None

        promo = DiscountCode(**promo_data)
        now = datetime.utcnow()

        if promo.valid_from and now < promo.valid_from:
            return None
        if promo.valid_until and now > promo.valid_until:
            return None
        if promo.max_uses and promo.used_count >= promo.max_uses:
            return None
        if promo.min_purchase_amount and amount < promo.min_purchase_amount:
            return None
        if promo.applicable_ticket_types and ticket_type_id not in promo.applicable_ticket_types:
            return None

        if promo.discount_type == DiscountType.PERCENTAGE:
            discount_amount = amount * (promo.value / 100)
        else:
            discount_amount = min(promo.value, amount)

        return {
            "code": code,
            "discount_type": promo.discount_type,
            "value": promo.value,
            "discount_amount": discount_amount,
        }

    async def check_availability(self, ticket_type_id: str, quantity: int = 1) -> dict:
        db = await get_database()
        ticket_data = await db.ticket_types.find_one({"_id": ObjectId(ticket_type_id)})

        if not ticket_data:
            raise ValueError("Ticket type not found")

        ticket = TicketType(**ticket_data)

        if not ticket.is_active:
            return {
                "available": False,
                "reason": "Ticket type is not active",
                "waitlist_available": False,
            }

        now = datetime.utcnow()
        if ticket.valid_from and now < ticket.valid_from:
            return {
                "available": False,
                "reason": "Sales have not started yet",
                "waitlist_available": False,
            }

        if ticket.valid_until and now > ticket.valid_until:
            return {
                "available": False,
                "reason": "Sales have ended",
                "waitlist_available": False,
            }

        if ticket.capacity:
            available = ticket.capacity - ticket.sold_count - ticket.reserved

            if available < quantity:
                return {
                    "available": False,
                    "reason": "Not enough tickets available",
                    "available_quantity": max(0, available),
                    "waitlist_available": ticket.waitlist_enabled,
                }

        return {
            "available": True,
            "available_quantity": ticket.capacity - ticket.sold_count if ticket.capacity else None,
        }


pricing_service = PricingService()
