from typing import Optional

from beanie import Document
from pydantic import BaseModel


class TradingHours(BaseModel):
    open: str
    close: str
    pre_open: Optional[str] = None
    post_close: Optional[str] = None


class Country(Document):
    code: str
    name: str
    default_currency: str
    regulatory_body: Optional[str] = None
    market_timezone: str

    class Settings:
        name = "countries"
        indexes = ["code"]


class Exchange(Document):
    code: str
    name: str
    mic_code: Optional[str] = None
    country_code: str
    currency: str
    timezone: str
    trading_hours: Optional[TradingHours] = None
    lot_size: int = 1
    tick_size: float = 0.05
    circuit_breaker_pct: Optional[float] = None
    is_active: bool = True
    securities_count: int = 0

    class Settings:
        name = "exchanges"
        indexes = ["code", "country_code"]
