from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import Field

from .base import MongoModel


class DiscountType(str, Enum):
    PERCENTAGE = "percentage"
    FIXED_AMOUNT = "fixed_amount"


class DiscountCode(MongoModel):
    event_id: str
    code: str
    discount_type: DiscountType
    value: float

    max_uses: Optional[int] = None
    used_count: int = 0
    max_uses_per_user: int = 1

    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    is_active: bool = True

    applicable_ticket_types: Optional[List[str]] = None
    min_purchase_amount: Optional[float] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
