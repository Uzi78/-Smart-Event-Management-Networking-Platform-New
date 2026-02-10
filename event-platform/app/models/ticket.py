from datetime import datetime
from typing import List, Optional

from pydantic import Field

from .base import MongoModel


class GroupDiscountRule(MongoModel):
    min_quantity: int
    discount_percent: float


class TicketType(MongoModel):
    event_id: str
    name: str
    description: Optional[str] = None
    base_price: float

    is_early_bird: bool = False
    early_bird_price: Optional[float] = None
    early_bird_ends: Optional[datetime] = None
    early_bird_capacity: Optional[int] = None
    early_bird_sold: int = 0

    group_discount_enabled: bool = False
    group_discount_rules: Optional[List[GroupDiscountRule]] = None

    capacity: Optional[int] = None
    sold_count: int = 0
    reserved: int = 0

    waitlist_enabled: bool = False
    waitlist_capacity: Optional[int] = None

    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    is_active: bool = True
    sort_order: int = 0

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config(MongoModel.Config):
        json_schema_extra = {
            "example": {
                "event_id": "event123",
                "name": "Early Bird Ticket",
                "base_price": 99.99,
                "is_early_bird": True,
                "early_bird_price": 79.99,
                "capacity": 100,
            }
        }
