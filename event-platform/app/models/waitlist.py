from datetime import datetime
from typing import Optional

from pydantic import EmailStr, Field

from .base import MongoModel


class WaitlistEntry(MongoModel):
    event_id: str
    ticket_type_id: str

    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None

    position: int
    notified: bool = False
    notified_at: Optional[datetime] = None
    converted: bool = False
    converted_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
