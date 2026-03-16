from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from beanie import Document
from pydantic import BaseModel, Field


class OrderType(str, Enum):
    MARKET = "market"
    LIMIT = "limit"
    STOP_LOSS = "stop_loss"
    STOP_LIMIT = "stop_limit"


class OrderSide(str, Enum):
    BUY = "buy"
    SELL = "sell"


class OrderStatus(str, Enum):
    PENDING = "pending"
    OPEN = "open"
    PARTIALLY_FILLED = "partially_filled"
    FILLED = "filled"
    CANCELLED = "cancelled"
    REJECTED = "rejected"
    EXPIRED = "expired"


class OrderValidity(str, Enum):
    DAY = "day"
    GTC = "gtc"
    IOC = "ioc"
    GTD = "gtd"


class FillRecord(BaseModel):
    fill_id: str
    quantity: float
    price: float
    fees: float = 0
    filled_at: datetime


class Order(Document):
    user_id: str
    portfolio_id: str
    security_id: str
    symbol: str
    exchange_code: str
    security_name: Optional[str] = None
    order_type: OrderType
    side: OrderSide
    quantity: float
    filled_quantity: float = 0
    limit_price: Optional[float] = None
    stop_price: Optional[float] = None
    avg_fill_price: Optional[float] = None
    validity: OrderValidity = OrderValidity.DAY
    status: OrderStatus = OrderStatus.PENDING
    fills: list[FillRecord] = []
    total_amount: Optional[float] = None
    total_fees: float = 0
    total_taxes: float = 0
    currency: str = "INR"
    realized_pnl: Optional[float] = None
    is_simulated: bool = False
    placed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    executed_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "orders"
        indexes = ["user_id", "portfolio_id", "security_id", "status"]
