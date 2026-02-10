from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import EmailStr, Field

from .base import MongoModel


class User(MongoModel):
    email: EmailStr
    name: str

    avatar: Optional[str] = None
    phone: Optional[str] = None

    email_verified: bool = False

    password_hash: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login_at: Optional[datetime] = None
