import io
from datetime import datetime
from typing import List, Optional

from bson import ObjectId
from fastapi import APIRouter, BackgroundTasks, HTTPException
from fastapi.responses import StreamingResponse

from app.database import get_database
from app.schemas.registration import (
    PricingCalculation,
    RegistrationCreate,
)
from app.services.pricing_service import pricing_service
from app.services.registration_service import registration_service
from app.utils.export import export_service

router = APIRouter(prefix="/api/registrations", tags=["registrations"])


@router.post("/calculate-price", response_model=PricingCalculation)
async def calculate_registration_price(
    ticket_type_id: str,
    quantity: int = 1,
    discount_code: Optional[str] = None,
):
    try:
        pricing = await pricing_service.calculate_price(
            ticket_type_id,
            quantity,
            discount_code,
        )
        return pricing
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/", response_model=dict)
async def create_registration(
    registration: RegistrationCreate,
    background_tasks: BackgroundTasks,
    user_id: Optional[str] = None,
):
    try:
        result = await registration_service.create_registration(
            registration.model_dump(),
            user_id,
        )

        if not result["success"]:
            if result.get("waitlist"):
                return {
                    "success": False,
                    "message": "Tickets sold out. You've been added to the waitlist.",
                    "waitlist": result["waitlist_entry"],
                }
            raise HTTPException(status_code=400, detail=result["reason"])

        return {
            "success": True,
            "registration_id": result["registration_id"],
            "qr_code": result["qr_code"],
            "qr_code_image": result["qr_code_image"],
            "pricing": result["pricing"],
            "payment_required": result["payment_required"],
        }
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/{registration_id}", response_model=dict)
async def get_registration(registration_id: str):
    db = await get_database()
    if not ObjectId.is_valid(registration_id):
        raise HTTPException(status_code=400, detail="Invalid registration id")

    registration = await db.registrations.find_one({"_id": ObjectId(registration_id)})
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")

    event = await db.events.find_one({"_id": ObjectId(registration["event_id"])})
    ticket_type = await db.ticket_types.find_one(
        {"_id": ObjectId(registration["ticket_type_id"])}
    )

    registration["_id"] = str(registration["_id"])
    registration["event_name"] = event.get("name") if event else None
    registration["ticket_type_name"] = ticket_type.get("name") if ticket_type else None

    return registration


@router.post("/{registration_id}/confirm-payment")
async def confirm_payment(
    registration_id: str,
    payment_data: dict,
    background_tasks: BackgroundTasks,
):
    try:
        success = await registration_service.confirm_payment(
            registration_id,
            payment_data,
        )
        if not success:
            raise HTTPException(status_code=400, detail="Payment confirmation failed")
        return {"success": True, "message": "Payment confirmed successfully"}
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/event/{event_id}", response_model=List[dict])
async def get_event_registrations(
    event_id: str,
    status: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
):
    db = await get_database()
    query = {"event_id": event_id}

    if status:
        query["status"] = status

    if search:
        query["$or"] = [
            {"first_name": {"$regex": search, "$options": "i"}},
            {"last_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"company": {"$regex": search, "$options": "i"}},
        ]

    registrations = (
        await db.registrations.find(query).skip(skip).limit(limit).to_list(limit)
    )
    for reg in registrations:
        reg["_id"] = str(reg["_id"])
    return registrations


@router.post("/{registration_id}/check-in")
async def check_in_attendee(registration_id: str):
    db = await get_database()
    result = await db.registrations.update_one(
        {"_id": ObjectId(registration_id), "status": "confirmed"},
        {"$set": {"checked_in": True, "check_in_time": datetime.utcnow()}},
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Check-in failed")

    return {"success": True, "message": "Checked in successfully"}


@router.post("/qr-code/{qr_code}/check-in")
async def check_in_by_qr(qr_code: str):
    db = await get_database()
    result = await db.registrations.update_one(
        {"qr_code": qr_code, "status": "confirmed"},
        {"$set": {"checked_in": True, "check_in_time": datetime.utcnow()}},
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=400, detail="Invalid QR code or already checked in"
        )

    registration = await db.registrations.find_one({"qr_code": qr_code})
    return {
        "success": True,
        "message": "Checked in successfully",
        "attendee": {
            "name": f"{registration['first_name']} {registration['last_name']}",
            "email": registration["email"],
            "company": registration.get("company"),
        },
    }


@router.get("/event/{event_id}/export/csv")
async def export_registrations_csv(event_id: str):
    db = await get_database()
    registrations = await db.registrations.find({"event_id": event_id}).to_list(10000)

    for reg in registrations:
        reg["_id"] = str(reg["_id"])
        ticket_type = await db.ticket_types.find_one({"_id": ObjectId(reg["ticket_type_id"])})
        reg["ticket_type_name"] = ticket_type.get("name") if ticket_type else ""

    csv_data = await export_service.export_registrations_csv(registrations)

    return StreamingResponse(
        io.BytesIO(csv_data),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=registrations_{event_id}_{datetime.utcnow().strftime('%Y%m%d')}.csv",
        },
    )


@router.get("/event/{event_id}/export/excel")
async def export_registrations_excel(event_id: str):
    db = await get_database()
    registrations = await db.registrations.find({"event_id": event_id}).to_list(10000)

    for reg in registrations:
        reg["_id"] = str(reg["_id"])
        ticket_type = await db.ticket_types.find_one({"_id": ObjectId(reg["ticket_type_id"])})
        reg["ticket_type_name"] = ticket_type.get("name") if ticket_type else ""

    excel_data = await export_service.export_registrations_excel(registrations)

    return StreamingResponse(
        io.BytesIO(excel_data),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment; filename=registrations_{event_id}_{datetime.utcnow().strftime('%Y%m%d')}.xlsx",
        },
    )
