from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional

from pydantic import EmailStr, Field

from .base import MongoModel


class RegistrationStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    WAITLIST = "waitlist"
    REJECTED = "rejected"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"


class PaymentMethod(str, Enum):
    STRIPE = "stripe"
    PAYPAL = "paypal"
    CASH = "cash"
    BANK_TRANSFER = "bank_transfer"


class Registration(MongoModel):
    event_id: str
    user_id: Optional[str] = None
    ticket_type_id: str
    status: RegistrationStatus = RegistrationStatus.PENDING

    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None

    form_responses: Optional[Dict[str, Any]] = None

    is_group_lead: bool = False
    group_id: Optional[str] = None
    group_size: int = 1

    original_price: float
    discount_amount: float = 0.0
    final_price: float
    discount_code: Optional[str] = None
    applied_discount_type: Optional[str] = None
    discount_details: Optional[Dict[str, Any]] = None

    payment_status: PaymentStatus = PaymentStatus.PENDING
    payment_method: Optional[PaymentMethod] = None
    payment_intent_id: Optional[str] = None
    paypal_order_id: Optional[str] = None
    payment_date: Optional[datetime] = None
    transaction_id: Optional[str] = None

    qr_code: str
    qr_code_image: Optional[str] = None
    checked_in: bool = False
    check_in_time: Optional[datetime] = None

    confirmation_email_sent: bool = False
    confirmation_email_sent_at: Optional[datetime] = None

    was_waitlisted: bool = False
    converted_from_waitlist_at: Optional[datetime] = None

    source: Optional[str] = None
    referral_code: Optional[str] = None
    notes: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
