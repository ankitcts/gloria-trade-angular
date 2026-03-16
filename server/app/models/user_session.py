from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from beanie import Document
from pydantic import Field


class SessionStatus(str, Enum):
    ACTIVE = "active"
    REVOKED = "revoked"
    EXPIRED = "expired"


class UserSession(Document):
    user_id: str
    session_token_hash: str
    refresh_token_hash: str
    status: SessionStatus = SessionStatus.ACTIVE
    expires_at: datetime
    revoked_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "user_sessions"
        indexes = ["user_id", "refresh_token_hash", "status"]
