from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, HttpUrl

from app.models.organization import PlanType


class OrganizationCreate(BaseModel):
    name: str
    slug: str

    logo: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    website: Optional[HttpUrl] = None
    description: Optional[str] = None

    timezone: str = "UTC"
    currency: str = "USD"


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    logo: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    website: Optional[HttpUrl] = None
    description: Optional[str] = None
    timezone: Optional[str] = None
    currency: Optional[str] = None


class OrganizationResponse(BaseModel):
    id: str

    name: str
    slug: str

    logo: Optional[str]
    email: Optional[EmailStr]
    phone: Optional[str]
    website: Optional[HttpUrl]
    description: Optional[str]

    timezone: str
    currency: str

    plan_type: PlanType
    max_events: int

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
