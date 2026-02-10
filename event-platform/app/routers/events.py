from datetime import datetime
from typing import List, Optional

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Query

from app.database import get_database
from app.models.event import Event
from app.schemas.event import EventCreate, EventResponse

router = APIRouter(prefix="/api/events", tags=["events"])


def _build_slug(name: str) -> str:
    base = name.lower().strip().replace(" ", "-")
    return "".join(ch for ch in base if ch.isalnum() or ch == "-")


@router.get("/", response_model=List[EventResponse])
async def list_events(status: Optional[str] = None, search: Optional[str] = None):
    db = await get_database()
    query: dict = {}

    if status:
        query["status"] = status

    if search:
        query["name"] = {"$regex": search, "$options": "i"}

    events = await db.events.find(query).sort("start_date", 1).to_list(1000)
    for event in events:
        event["id"] = str(event["_id"])
        event["_id"] = str(event["_id"])
    return events


@router.post("/", response_model=EventResponse)
async def create_event(event_payload: EventCreate):
    db = await get_database()
    slug = event_payload.slug or _build_slug(event_payload.name)

    existing = await db.events.find_one({"slug": slug})
    if existing:
        slug = f"{slug}-{int(datetime.utcnow().timestamp())}"

    payload = event_payload.model_dump()
    payload["slug"] = slug
    event = Event(**payload)
    result = await db.events.insert_one(event.model_dump(by_alias=True, exclude={"id"}))
    created = await db.events.find_one({"_id": result.inserted_id})
    created["id"] = str(created["_id"])
    created["_id"] = str(created["_id"])
    return created


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: str):
    db = await get_database()
    if not ObjectId.is_valid(event_id):
        raise HTTPException(status_code=400, detail="Invalid event id")

    event = await db.events.find_one({"_id": ObjectId(event_id)})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    event["id"] = str(event["_id"])
    event["_id"] = str(event["_id"])
    return event
