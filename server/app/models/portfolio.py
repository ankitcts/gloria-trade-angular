from datetime import datetime, timezone
from typing import Optional

from beanie import Document
from pydantic import BaseModel, Field


class Holding(BaseModel):
    security_id: str
    symbol: str
    security_name: Optional[str] = None
    quantity: float
    avg_cost_price: float
    current_price: Optional[float] = None
    invested_value: float
    current_value: Optional[float] = None
    unrealized_pnl: Optional[float] = None
    unrealized_pnl_pct: Optional[float] = None
    sector: Optional[str] = None
    last_updated: Optional[datetime] = None


class Transaction(BaseModel):
    order_id: Optional[str] = None
    security_id: str
    symbol: str
    type: str  # buy, sell, dividend, split, bonus
    quantity: float
    price: float
    fees: float = 0
    taxes: float = 0
    net_amount: float
    currency: str = "INR"
    executed_at: datetime


class PortfolioSnapshot(BaseModel):
    date: datetime
    total_value: float
    invested_value: float
    realized_pnl: float = 0
    unrealized_pnl: float = 0


class Portfolio(Document):
    user_id: str
    name: str
    description: Optional[str] = None
    is_default: bool = False
    currency: str = "INR"
    holdings: list[Holding] = []
    transactions: list[Transaction] = []
    snapshots: list[PortfolioSnapshot] = []
    total_invested: float = 0
    total_current_value: float = 0
    total_realized_pnl: float = 0
    total_unrealized_pnl: float = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "portfolios"
        indexes = ["user_id"]
