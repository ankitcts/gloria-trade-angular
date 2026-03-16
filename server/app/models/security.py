from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from beanie import Document
from pydantic import BaseModel, Field


class SecurityType(str, Enum):
    EQUITY = "equity"
    ETF = "etf"
    INDEX = "index"
    MUTUAL_FUND = "mutual_fund"
    BOND = "bond"
    COMMODITY = "commodity"
    DERIVATIVE = "derivative"


class Sector(str, Enum):
    TECHNOLOGY = "technology"
    FINANCIAL_SERVICES = "financial_services"
    HEALTHCARE = "healthcare"
    CONSUMER_CYCLICAL = "consumer_cyclical"
    CONSUMER_DEFENSIVE = "consumer_defensive"
    INDUSTRIALS = "industrials"
    ENERGY = "energy"
    UTILITIES = "utilities"
    REAL_ESTATE = "real_estate"
    COMMUNICATION_SERVICES = "communication_services"
    BASIC_MATERIALS = "basic_materials"
    OTHER = "other"


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"


class ExchangeListing(BaseModel):
    exchange_code: str
    ticker: str
    is_primary: bool = False
    lot_size: int = 1
    is_active: bool = True


class Fundamentals(BaseModel):
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    pb_ratio: Optional[float] = None
    eps: Optional[float] = None
    dividend_yield_pct: Optional[float] = None
    week_52_high: Optional[float] = None
    week_52_low: Optional[float] = None
    avg_volume_30d: Optional[float] = None
    beta: Optional[float] = None


class QuoteSnapshot(BaseModel):
    last_price: Optional[float] = None
    change: Optional[float] = None
    change_pct: Optional[float] = None
    open: Optional[float] = None
    high: Optional[float] = None
    low: Optional[float] = None
    close: Optional[float] = None
    prev_close: Optional[float] = None
    volume: Optional[int] = None
    timestamp: Optional[datetime] = None


class Security(Document):
    symbol: str
    name: str
    security_type: SecurityType = SecurityType.EQUITY
    sector: Optional[Sector] = None
    industry: Optional[str] = None
    description: Optional[str] = None
    country_code: str = "IN"
    currency: str = "USD"
    isin: Optional[str] = None
    listings: list[ExchangeListing] = []
    fundamentals: Fundamentals = Field(default_factory=Fundamentals)
    quote: QuoteSnapshot = Field(default_factory=QuoteSnapshot)
    computed_risk: Optional[RiskLevel] = None
    is_active: bool = True
    has_historical_data: bool = False
    data_source: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "securities"
        indexes = ["symbol", "security_type", "sector", "is_active"]

    @property
    def primary_exchange_code(self) -> str:
        for listing in self.listings:
            if listing.is_primary:
                return listing.exchange_code
        return self.listings[0].exchange_code if self.listings else "NSE"
