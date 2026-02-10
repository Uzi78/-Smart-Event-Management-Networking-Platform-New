from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import Field

from .base import MongoModel


class FieldType(str, Enum):
    TEXT = "text"
    EMAIL = "email"
    NUMBER = "number"
    PHONE = "phone"
    TEXTAREA = "textarea"
    SELECT = "select"
    MULTISELECT = "multiselect"
    CHECKBOX = "checkbox"
    RADIO = "radio"
    DATE = "date"
    FILE = "file"


class FormField(MongoModel):
    field_id: str
    label: str
    field_type: FieldType
    required: bool = False
    placeholder: Optional[str] = None
    options: Optional[List[str]] = None
    validation_rules: Optional[Dict[str, Any]] = None
    conditional_logic: Optional[Dict[str, Any]] = None
    order: int = 0


class RegistrationForm(MongoModel):
    event_id: str
    fields: List[FormField]

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
