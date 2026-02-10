from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import Field

from .base import MongoModel


class EventStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    LIVE = "live"
    COMPLETED = "completed"


class Event(MongoModel):
    organization_id: Optional[str] = None
    name: str
    description: Optional[str] = None
    start_date: datetime
    end_date: Optional[datetime] = None
    location: str
    organizer_id: str
    capacity: int = 0
    registered_count: int = 0
    revenue: float = 0.0
    status: EventStatus = EventStatus.DRAFT
    slug: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config(MongoModel.Config):
        json_schema_extra = {
            "example": {
                "name": "Future Tech Expo 2025",
                "description": "Premier event for emerging technologies",
                "start_date": "2025-09-15T09:00:00",
                "location": "San Francisco Convention Center",
                "organizer_id": "u1",
                "capacity": 1000,
            }
        }
