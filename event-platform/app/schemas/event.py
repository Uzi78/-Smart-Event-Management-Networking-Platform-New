from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.event import EventStatus


class EventCreate(BaseModel):
    organization_id: Optional[str] = None
    name: str
    description: Optional[str] = None
    start_date: datetime
    end_date: Optional[datetime] = None
    location: str
    organizer_id: str = Field(default="u1")
    capacity: int = 0
    status: EventStatus = EventStatus.DRAFT
    slug: Optional[str] = None


class EventResponse(BaseModel):
    id: str
    organization_id: Optional[str] = None
    name: str
    description: Optional[str]
    start_date: datetime
    end_date: Optional[datetime]
    location: str
    organizer_id: str
    capacity: int
    registered_count: int
    status: EventStatus
    revenue: float

    class Config:
        from_attributes = True
