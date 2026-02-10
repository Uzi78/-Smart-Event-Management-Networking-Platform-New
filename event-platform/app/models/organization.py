from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import EmailStr, Field, HttpUrl

from .base import MongoModel


class PlanType(str, Enum):
    FREE = "FREE"
    PRO = "PRO"
    ENTERPRISE = "ENTERPRISE"


class Organization(MongoModel):
    name: str
    slug: str

    logo: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    website: Optional[HttpUrl] = None
    description: Optional[str] = None

    timezone: str = "UTC"
    currency: str = "USD"

    plan_type: PlanType = PlanType.FREE
    max_events: int = 5

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
