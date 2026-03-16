from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from beanie import Document
from pydantic import Field


class SentimentSource(str, Enum):
    NEWS = "news"
    TWITTER = "twitter"
    REDDIT = "reddit"
    STOCKTWITS = "stocktwits"
    ANALYST_REPORT = "analyst_report"
    EARNINGS_CALL = "earnings_call"
    RSS = "rss"


class SentimentLabel(str, Enum):
    VERY_BULLISH = "very_bullish"
    BULLISH = "bullish"
    NEUTRAL = "neutral"
    BEARISH = "bearish"
    VERY_BEARISH = "very_bearish"


class SentimentRecord(Document):
    security_id: Optional[str] = None
    symbol: Optional[str] = None
    source: SentimentSource
    label: SentimentLabel
    score: float
    title: Optional[str] = None
    summary: Optional[str] = None
    url: Optional[str] = None
    published_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "sentiment_records"
        indexes = ["security_id", "source", "label"]
