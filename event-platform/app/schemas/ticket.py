from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel

from app.models.ticket import GroupDiscountRule


class TicketTypeCreate(BaseModel):
    event_id: str
    name: str
    description: Optional[str] = None
    base_price: float
    is_early_bird: bool = False
    early_bird_price: Optional[float] = None
    early_bird_ends: Optional[datetime] = None
    early_bird_capacity: Optional[int] = None
    group_discount_enabled: bool = False
    group_discount_rules: Optional[List[GroupDiscountRule]] = None
    capacity: Optional[int] = None
    waitlist_enabled: bool = False
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None


class TicketTypeResponse(BaseModel):
    id: str
    event_id: str
    name: str
    description: Optional[str]
    current_price: float
    base_price: float
    is_early_bird: bool
    sold_count: int
    capacity: Optional[int]
    availability: str
    available_quantity: Optional[int]

    class Config:
        from_attributes = True
