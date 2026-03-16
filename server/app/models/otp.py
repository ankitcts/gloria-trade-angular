from datetime import datetime, timezone
from enum import Enum

from beanie import Document
from pydantic import Field


class OTPPurpose(str, Enum):
    CANCEL_ORDER = "cancel_order"
    APPROVE_TRANSFER = "approve_transfer"
    VERIFY_ACTION = "verify_action"


class OTPRecord(Document):
    user_id: str
    code: str
    purpose: OTPPurpose
    destination: str  # email or phone number
    is_used: bool = False
    attempts: int = 0
    max_attempts: int = 3
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "otp_records"
        indexes = ["user_id", "code"]
