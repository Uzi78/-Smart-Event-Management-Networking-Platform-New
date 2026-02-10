from datetime import datetime
from typing import List, Optional

from bson import ObjectId
from fastapi import APIRouter, HTTPException

from app.database import get_database
from app.services.registration_service import registration_service

router = APIRouter(prefix="/api/waitlist", tags=["waitlist"])


@router.get("/event/{event_id}", response_model=List[dict])
async def get_event_waitlist(event_id: str, ticket_type_id: Optional[str] = None):
    db = await get_database()
    query = {"event_id": event_id, "converted": False}
    if ticket_type_id:
        query["ticket_type_id"] = ticket_type_id

    entries = await db.waitlist_entries.find(query).sort("position", 1).to_list(100)
    for entry in entries:
        entry["_id"] = str(entry["_id"])
    return entries


@router.post("/{waitlist_id}/convert")
async def convert_waitlist_entry(waitlist_id: str, registration_data: dict):
    db = await get_database()
    if not ObjectId.is_valid(waitlist_id):
        raise HTTPException(status_code=400, detail="Invalid waitlist id")

    waitlist_entry = await db.waitlist_entries.find_one({"_id": ObjectId(waitlist_id)})
    if not waitlist_entry:
        raise HTTPException(status_code=404, detail="Waitlist entry not found")
    if waitlist_entry["converted"]:
        raise HTTPException(status_code=400, detail="Already converted")

    result = await registration_service.create_registration(registration_data)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result.get("reason", "Registration failed"))

    await db.waitlist_entries.update_one(
        {"_id": ObjectId(waitlist_id)},
        {
            "$set": {
                "converted": True,
                "converted_at": datetime.utcnow(),
            }
        },
    )

    await db.waitlist_entries.update_many(
        {
            "event_id": waitlist_entry["event_id"],
            "ticket_type_id": waitlist_entry["ticket_type_id"],
            "position": {"$gt": waitlist_entry["position"]},
            "converted": False,
        },
        {"$inc": {"position": -1}},
    )

    await registration_service.process_waitlist(
        waitlist_entry["event_id"],
        waitlist_entry["ticket_type_id"],
    )

    return {"success": True, "registration_id": result["registration_id"]}
