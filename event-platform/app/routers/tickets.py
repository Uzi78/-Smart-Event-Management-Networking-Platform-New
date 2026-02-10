from datetime import datetime
from typing import List

from bson import ObjectId
from fastapi import APIRouter, HTTPException

from app.database import get_database
from app.models.ticket import TicketType
from app.schemas.ticket import TicketTypeCreate

router = APIRouter(prefix="/api/tickets", tags=["tickets"])


@router.post("/", response_model=dict)
async def create_ticket_type(ticket: TicketTypeCreate):
    db = await get_database()
    ticket_doc = TicketType(**ticket.model_dump())
    result = await db.ticket_types.insert_one(
        ticket_doc.model_dump(by_alias=True, exclude={"id"})
    )
    return {"success": True, "ticket_id": str(result.inserted_id)}


@router.get("/event/{event_id}", response_model=List[dict])
async def get_event_tickets(event_id: str, active_only: bool = True):
    db = await get_database()
    query = {"event_id": event_id}
    if active_only:
        query["is_active"] = True

    tickets = await db.ticket_types.find(query).sort("sort_order", 1).to_list(100)
    now = datetime.utcnow()

    for ticket in tickets:
        ticket["_id"] = str(ticket["_id"])
        current_price = ticket["base_price"]

        if ticket.get("is_early_bird") and ticket.get("early_bird_price"):
            early_bird_active = True
            if ticket.get("early_bird_ends") and now > ticket["early_bird_ends"]:
                early_bird_active = False
            if ticket.get("early_bird_capacity") and ticket.get("early_bird_sold", 0) >= ticket["early_bird_capacity"]:
                early_bird_active = False
            if early_bird_active:
                current_price = ticket["early_bird_price"]

        ticket["current_price"] = current_price

        if ticket.get("capacity"):
            available = ticket["capacity"] - ticket["sold_count"] - ticket.get("reserved", 0)
            ticket["available_quantity"] = max(0, available)
            if available <= 0:
                if ticket.get("waitlist_enabled"):
                    ticket["availability"] = "waitlist"
                else:
                    ticket["availability"] = "sold_out"
            else:
                ticket["availability"] = "available"
        else:
            ticket["available_quantity"] = None
            ticket["availability"] = "available"

    return tickets


@router.patch("/{ticket_id}", response_model=dict)
async def update_ticket_type(ticket_id: str, update_data: dict):
    db = await get_database()
    update_data["updated_at"] = datetime.utcnow()
    result = await db.ticket_types.update_one(
        {"_id": ObjectId(ticket_id)},
        {"$set": update_data},
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Ticket type not found")
    return {"success": True, "message": "Ticket type updated"}
