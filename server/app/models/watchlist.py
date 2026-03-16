from datetime import datetime, timezone
from typing import Optional

from beanie import Document
from pydantic import BaseModel, Field


class WatchlistItem(BaseModel):
    security_id: str
    symbol: str
    security_name: Optional[str] = None
    alert_above: Optional[float] = None
    alert_below: Optional[float] = None
    notes: Optional[str] = None
    added_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Watchlist(Document):
    user_id: str
    name: str
    description: Optional[str] = None
    securities: list[WatchlistItem] = []
    is_default: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "watchlists"
        indexes = ["user_id"]
