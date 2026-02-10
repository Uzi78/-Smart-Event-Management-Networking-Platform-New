from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import Field

from .base import MongoModel


class UserRole(str, Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ORGANIZER = "ORGANIZER"
    STAFF = "STAFF"
    ATTENDEE = "ATTENDEE"


class UserOrganization(MongoModel):
    user_id: str
    organization_id: str

    role: UserRole = UserRole.STAFF

    can_create_events: bool = False
    can_manage_attendees: bool = False
    can_view_analytics: bool = True
    can_export_data: bool = False

    joined_at: datetime = Field(default_factory=datetime.utcnow)
    invited_by: Optional[str] = None
