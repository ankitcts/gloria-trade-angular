from datetime import date, datetime, timezone
from typing import Optional

from beanie import Document
from pydantic import Field


class PriceHistoryDaily(Document):
    security_id: str
    symbol: str
    date: date
    open: float
    high: float
    low: float
    close: float
    volume: int
    adj_close: Optional[float] = None
    change_pct: Optional[float] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "price_history_daily"
        indexes = [
            [("security_id", 1), ("date", -1)],
            [("symbol", 1), ("date", -1)],
        ]
