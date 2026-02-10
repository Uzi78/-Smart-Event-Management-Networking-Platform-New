from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


class RegistrationCreate(BaseModel):
    event_id: str
    ticket_type_id: str
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    form_responses: Optional[Dict[str, Any]] = None
    group_size: int = 1
    discount_code: Optional[str] = None

    @field_validator("group_size")
    @classmethod
    def validate_group_size(cls, value: int) -> int:
        if value < 1:
            raise ValueError("Group size must be at least 1")
        if value > 50:
            raise ValueError("Group size cannot exceed 50")
        return value


class RegistrationResponse(BaseModel):
    id: str
    event_id: str
    ticket_type_id: str
    status: str
    first_name: str
    last_name: str
    email: EmailStr
    final_price: float
    discount_amount: float
    qr_code: str
    qr_code_image: Optional[str] = None
    payment_status: str
    created_at: datetime


class PricingCalculation(BaseModel):
    base_price: float
    quantity: int
    subtotal: float
    early_bird_discount: float = 0.0
    group_discount: float = 0.0
    promo_code_discount: float = 0.0
    total_discount: float = 0.0
    final_price: float
    per_ticket_price: float
    discount_details: Dict[str, Any] = Field(default_factory=dict)
