from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from beanie import Document
from pydantic import EmailStr, Field


class UserRole(str, Enum):
    ADMIN = "admin"
    TRADER = "trader"
    ANALYST = "analyst"
    VIEWER = "viewer"


class AccountStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    PENDING_VERIFICATION = "pending_verification"
    DEACTIVATED = "deactivated"


class KYCStatus(str, Enum):
    NOT_STARTED = "not_started"
    DOCUMENTS_SUBMITTED = "documents_submitted"
    UNDER_REVIEW = "under_review"
    VERIFIED = "verified"
    REJECTED = "rejected"


class User(Document):
    email: EmailStr
    password_hash: str
    first_name: str
    last_name: str
    display_name: Optional[str] = None
    phone: Optional[str] = None
    role: UserRole = UserRole.TRADER
    account_status: AccountStatus = AccountStatus.ACTIVE
    kyc_status: KYCStatus = KYCStatus.NOT_STARTED
    email_verified: bool = False
    phone_verified: bool = False
    last_login_at: Optional[datetime] = None
    login_count: int = 0
    timezone: str = "Asia/Kolkata"
    preferred_locale: str = "en-IN"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"
        indexes = ["email"]
