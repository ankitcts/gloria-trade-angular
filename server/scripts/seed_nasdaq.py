"""
Seed script: Populate MongoDB Atlas with realistic NASDAQ trading data (60 days).

Usage:
    cd server
    python -m scripts.seed_nasdaq
"""

import asyncio
import random
import uuid
from datetime import date, datetime, timedelta, timezone
from typing import Any

from app.config import settings
from app.database import init_db, close_db, ALL_DOCUMENT_MODELS
from app.models.market import Country, Exchange, TradingHours
from app.models.security import (
    ExchangeListing,
    Fundamentals,
    QuoteSnapshot,
    RiskLevel,
    Sector,
    Security,
    SecurityType,
)
from app.models.price_history import PriceHistoryDaily
from app.models.portfolio import Holding, Portfolio, PortfolioSnapshot, Transaction
from app.models.order import (
    FillRecord,
    Order,
    OrderSide,
    OrderStatus,
    OrderType,
    OrderValidity,
)
from app.models.watchlist import Watchlist, WatchlistItem
from app.models.ml import (
    AccuracyMetrics,
    MLModel,
    MLModelStatus,
    MLModelType,
    MLPrediction,
    PredictionSignal,
    PricePrediction,
    RiskAssessment,
)
from app.models.notification import Notification, NotificationType
from app.models.user import User

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

NOW = datetime.now(timezone.utc)
TODAY = date.today()
SEED_DAYS = 60
START_DATE = TODAY - timedelta(days=SEED_DAYS)
DATA_SOURCE = "seed"
CURRENCY = "USD"
COUNTRY_CODE = "US"
EXCHANGE_CODE = "NASDAQ"

# ---------------------------------------------------------------------------
# NASDAQ securities master data
# ---------------------------------------------------------------------------

SECURITIES_DATA: list[dict[str, Any]] = [
    # symbol, name, sector, industry, approx_price, market_cap_B, pe, eps, beta, div_yield
    {"symbol": "AAPL", "name": "Apple Inc.", "sector": Sector.TECHNOLOGY, "industry": "Consumer Electronics", "price": 220.0, "mcap": 3400, "pe": 28.5, "eps": 7.72, "beta": 1.20, "div": 0.55},
    {"symbol": "MSFT", "name": "Microsoft Corporation", "sector": Sector.TECHNOLOGY, "industry": "Software - Infrastructure", "price": 430.0, "mcap": 3200, "pe": 35.0, "eps": 12.29, "beta": 0.90, "div": 0.72},
    {"symbol": "GOOGL", "name": "Alphabet Inc.", "sector": Sector.COMMUNICATION_SERVICES, "industry": "Internet Content & Information", "price": 175.0, "mcap": 2150, "pe": 25.0, "eps": 7.00, "beta": 1.05, "div": 0.0},
    {"symbol": "AMZN", "name": "Amazon.com Inc.", "sector": Sector.CONSUMER_CYCLICAL, "industry": "Internet Retail", "price": 210.0, "mcap": 2150, "pe": 58.0, "eps": 3.62, "beta": 1.15, "div": 0.0},
    {"symbol": "NVDA", "name": "NVIDIA Corporation", "sector": Sector.TECHNOLOGY, "industry": "Semiconductors", "price": 140.0, "mcap": 3450, "pe": 60.0, "eps": 2.33, "beta": 1.65, "div": 0.03},
    {"symbol": "META", "name": "Meta Platforms Inc.", "sector": Sector.COMMUNICATION_SERVICES, "industry": "Internet Content & Information", "price": 620.0, "mcap": 1580, "pe": 26.0, "eps": 23.85, "beta": 1.30, "div": 0.0},
    {"symbol": "TSLA", "name": "Tesla Inc.", "sector": Sector.CONSUMER_CYCLICAL, "industry": "Auto Manufacturers", "price": 340.0, "mcap": 1090, "pe": 95.0, "eps": 3.58, "beta": 2.05, "div": 0.0},
    {"symbol": "AVGO", "name": "Broadcom Inc.", "sector": Sector.TECHNOLOGY, "industry": "Semiconductors", "price": 230.0, "mcap": 1070, "pe": 37.0, "eps": 6.22, "beta": 1.25, "div": 1.30},
    {"symbol": "COST", "name": "Costco Wholesale Corp.", "sector": Sector.CONSUMER_DEFENSIVE, "industry": "Discount Stores", "price": 1000.0, "mcap": 445, "pe": 55.0, "eps": 18.18, "beta": 0.75, "div": 0.50},
    {"symbol": "NFLX", "name": "Netflix Inc.", "sector": Sector.COMMUNICATION_SERVICES, "industry": "Entertainment", "price": 950.0, "mcap": 410, "pe": 48.0, "eps": 19.79, "beta": 1.40, "div": 0.0},
    {"symbol": "AMD", "name": "Advanced Micro Devices Inc.", "sector": Sector.TECHNOLOGY, "industry": "Semiconductors", "price": 120.0, "mcap": 194, "pe": 42.0, "eps": 2.86, "beta": 1.70, "div": 0.0},
    {"symbol": "ADBE", "name": "Adobe Inc.", "sector": Sector.TECHNOLOGY, "industry": "Software - Application", "price": 470.0, "mcap": 207, "pe": 32.0, "eps": 14.69, "beta": 1.10, "div": 0.0},
    {"symbol": "PEP", "name": "PepsiCo Inc.", "sector": Sector.CONSUMER_DEFENSIVE, "industry": "Beverages - Non-Alcoholic", "price": 145.0, "mcap": 199, "pe": 23.0, "eps": 6.30, "beta": 0.55, "div": 2.90},
    {"symbol": "INTC", "name": "Intel Corporation", "sector": Sector.TECHNOLOGY, "industry": "Semiconductors", "price": 22.0, "mcap": 95, "pe": 0.0, "eps": -0.74, "beta": 1.05, "div": 0.0},
    {"symbol": "QCOM", "name": "Qualcomm Inc.", "sector": Sector.TECHNOLOGY, "industry": "Semiconductors", "price": 170.0, "mcap": 189, "pe": 17.0, "eps": 10.00, "beta": 1.30, "div": 1.80},
    {"symbol": "INTU", "name": "Intuit Inc.", "sector": Sector.TECHNOLOGY, "industry": "Software - Application", "price": 610.0, "mcap": 170, "pe": 55.0, "eps": 11.09, "beta": 1.15, "div": 0.60},
    {"symbol": "CMCSA", "name": "Comcast Corporation", "sector": Sector.COMMUNICATION_SERVICES, "industry": "Telecom Services", "price": 38.0, "mcap": 145, "pe": 10.5, "eps": 3.62, "beta": 0.95, "div": 2.90},
    {"symbol": "AMGN", "name": "Amgen Inc.", "sector": Sector.HEALTHCARE, "industry": "Biotechnology", "price": 290.0, "mcap": 155, "pe": 22.0, "eps": 13.18, "beta": 0.65, "div": 2.90},
    {"symbol": "SBUX", "name": "Starbucks Corporation", "sector": Sector.CONSUMER_CYCLICAL, "industry": "Restaurants", "price": 110.0, "mcap": 126, "pe": 30.0, "eps": 3.67, "beta": 1.00, "div": 2.10},
    {"symbol": "GILD", "name": "Gilead Sciences Inc.", "sector": Sector.HEALTHCARE, "industry": "Biotechnology", "price": 115.0, "mcap": 143, "pe": 18.0, "eps": 6.39, "beta": 0.50, "div": 3.20},
    {"symbol": "PYPL", "name": "PayPal Holdings Inc.", "sector": Sector.FINANCIAL_SERVICES, "industry": "Credit Services", "price": 82.0, "mcap": 87, "pe": 19.0, "eps": 4.32, "beta": 1.45, "div": 0.0},
    {"symbol": "LRCX", "name": "Lam Research Corp.", "sector": Sector.TECHNOLOGY, "industry": "Semiconductor Equipment", "price": 78.0, "mcap": 100, "pe": 22.0, "eps": 3.55, "beta": 1.35, "div": 0.90},
    {"symbol": "MRVL", "name": "Marvell Technology Inc.", "sector": Sector.TECHNOLOGY, "industry": "Semiconductors", "price": 88.0, "mcap": 76, "pe": 55.0, "eps": 1.60, "beta": 1.50, "div": 0.22},
    {"symbol": "ADP", "name": "Automatic Data Processing", "sector": Sector.INDUSTRIALS, "industry": "Staffing & Employment Services", "price": 305.0, "mcap": 124, "pe": 31.0, "eps": 9.84, "beta": 0.80, "div": 2.00},
    {"symbol": "PANW", "name": "Palo Alto Networks Inc.", "sector": Sector.TECHNOLOGY, "industry": "Software - Infrastructure", "price": 190.0, "mcap": 127, "pe": 48.0, "eps": 3.96, "beta": 1.10, "div": 0.0},
]

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _risk_from_beta(beta: float) -> RiskLevel:
    if beta < 0.8:
        return RiskLevel.LOW
    if beta < 1.2:
        return RiskLevel.MEDIUM
    if beta < 1.6:
        return RiskLevel.HIGH
    return RiskLevel.VERY_HIGH


def _random_walk(start_price: float, days: int, volatility: float = 0.015) -> list[dict]:
    """Generate OHLCV data using geometric Brownian motion style random walk."""
    prices: list[dict] = []
    price = start_price
    prev_close = start_price

    for i in range(days):
        day = START_DATE + timedelta(days=i)
        # Skip weekends
        if day.weekday() >= 5:
            continue

        daily_return = random.gauss(0.0003, volatility)
        open_price = prev_close * (1 + random.gauss(0, volatility * 0.3))
        close_price = open_price * (1 + daily_return)
        high_price = max(open_price, close_price) * (1 + abs(random.gauss(0, volatility * 0.5)))
        low_price = min(open_price, close_price) * (1 - abs(random.gauss(0, volatility * 0.5)))
        volume = int(random.gauss(35_000_000, 12_000_000))
        if volume < 500_000:
            volume = 500_000

        change_pct = ((close_price - prev_close) / prev_close) * 100 if prev_close else 0.0

        prices.append({
            "date": day,
            "open": round(open_price, 2),
            "high": round(high_price, 2),
            "low": round(low_price, 2),
            "close": round(close_price, 2),
            "adj_close": round(close_price, 2),
            "volume": volume,
            "change_pct": round(change_pct, 4),
        })
        prev_close = close_price
        price = close_price

    return prices


def _random_datetime_in_range(start: datetime, end: datetime) -> datetime:
    delta = end - start
    rand_seconds = random.randint(0, int(delta.total_seconds()))
    return start + timedelta(seconds=rand_seconds)


def _business_days_ago(n: int) -> datetime:
    """Return a datetime roughly n business days ago during market hours."""
    d = NOW - timedelta(days=int(n * 1.45))  # rough mapping
    # clamp to market hours
    return d.replace(hour=random.randint(9, 15), minute=random.randint(0, 59), second=0, microsecond=0)


# ---------------------------------------------------------------------------
# Seed functions
# ---------------------------------------------------------------------------


async def seed_exchange() -> Exchange:
    print("[1/8] Seeding Exchange ...")
    exchange = Exchange(
        code=EXCHANGE_CODE,
        name="NASDAQ Stock Market",
        mic_code="XNGS",
        country_code=COUNTRY_CODE,
        currency=CURRENCY,
        timezone="America/New_York",
        trading_hours=TradingHours(
            open="09:30",
            close="16:00",
            pre_open="04:00",
            post_close="20:00",
        ),
        lot_size=1,
        tick_size=0.01,
        circuit_breaker_pct=20.0,
        is_active=True,
        securities_count=len(SECURITIES_DATA),
    )
    await exchange.insert()
    print(f"       Created exchange: {exchange.code}")
    return exchange


async def seed_country() -> Country:
    print("       Seeding Country ...")
    country = Country(
        code=COUNTRY_CODE,
        name="United States",
        default_currency=CURRENCY,
        regulatory_body="SEC",
        market_timezone="America/New_York",
    )
    await country.insert()
    print(f"       Created country: {country.code}")
    return country


async def seed_securities() -> list[Security]:
    print("[2/8] Seeding Securities ...")
    securities: list[Security] = []

    for sd in SECURITIES_DATA:
        beta = sd["beta"]
        price = sd["price"]
        # Small random jitter on price so quote looks live
        jitter = random.uniform(-0.015, 0.015)
        last_price = round(price * (1 + jitter), 2)
        prev_close = round(price * (1 + random.uniform(-0.01, 0.01)), 2)
        change = round(last_price - prev_close, 2)
        change_pct = round((change / prev_close) * 100, 2) if prev_close else 0.0
        day_open = round(prev_close * (1 + random.uniform(-0.005, 0.005)), 2)
        day_high = round(max(last_price, day_open) * (1 + random.uniform(0.001, 0.012)), 2)
        day_low = round(min(last_price, day_open) * (1 - random.uniform(0.001, 0.012)), 2)
        volume = int(random.gauss(40_000_000, 15_000_000))
        if volume < 1_000_000:
            volume = 1_000_000

        week_52_high = round(price * random.uniform(1.10, 1.35), 2)
        week_52_low = round(price * random.uniform(0.60, 0.85), 2)

        security = Security(
            symbol=sd["symbol"],
            name=sd["name"],
            security_type=SecurityType.EQUITY,
            sector=sd["sector"],
            industry=sd["industry"],
            description=f"{sd['name']} is a publicly traded company listed on the NASDAQ exchange.",
            country_code=COUNTRY_CODE,
            currency=CURRENCY,
            listings=[
                ExchangeListing(
                    exchange_code=EXCHANGE_CODE,
                    ticker=sd["symbol"],
                    is_primary=True,
                    lot_size=1,
                    is_active=True,
                )
            ],
            fundamentals=Fundamentals(
                market_cap=sd["mcap"] * 1_000_000_000,
                pe_ratio=sd["pe"] if sd["pe"] > 0 else None,
                pb_ratio=round(random.uniform(2.0, 15.0), 2),
                eps=sd["eps"],
                dividend_yield_pct=sd["div"] if sd["div"] > 0 else None,
                week_52_high=week_52_high,
                week_52_low=week_52_low,
                avg_volume_30d=float(volume),
                beta=beta,
            ),
            quote=QuoteSnapshot(
                last_price=last_price,
                change=change,
                change_pct=change_pct,
                open=day_open,
                high=day_high,
                low=day_low,
                close=last_price,
                prev_close=prev_close,
                volume=volume,
                timestamp=NOW,
            ),
            computed_risk=_risk_from_beta(beta),
            is_active=True,
            has_historical_data=True,
            data_source=DATA_SOURCE,
            created_at=NOW,
            updated_at=NOW,
        )
        await security.insert()
        securities.append(security)

    print(f"       Created {len(securities)} securities")
    return securities


async def seed_price_history(securities: list[Security]) -> None:
    print("[3/8] Seeding Price History (60 days) ...")
    total_records = 0

    for sec in securities:
        sd = next(s for s in SECURITIES_DATA if s["symbol"] == sec.symbol)
        # Start the walk a bit below or above current price so the walk
        # ends near the quoted price.
        start = sd["price"] * random.uniform(0.90, 1.10)
        volatility = 0.010 + (sd["beta"] - 0.5) * 0.005
        bars = _random_walk(start, SEED_DAYS, volatility)

        docs: list[PriceHistoryDaily] = []
        for bar in bars:
            docs.append(PriceHistoryDaily(
                security_id=str(sec.id),
                symbol=sec.symbol,
                date=bar["date"],
                open=bar["open"],
                high=bar["high"],
                low=bar["low"],
                close=bar["close"],
                volume=bar["volume"],
                adj_close=bar["adj_close"],
                change_pct=bar["change_pct"],
            ))
        if docs:
            await PriceHistoryDaily.insert_many(docs)
            total_records += len(docs)

    print(f"       Created {total_records} daily price records")


async def seed_portfolio(
    admin_user: User,
    securities: list[Security],
) -> Portfolio:
    print("[4/8] Seeding Portfolio ...")

    # Pick 8-10 securities for holdings
    holding_secs = random.sample(securities, k=min(10, len(securities)))
    holdings: list[Holding] = []
    transactions: list[Transaction] = []
    total_invested = 0.0
    total_current = 0.0

    for sec in holding_secs:
        qty = random.choice([5, 10, 15, 20, 25, 30, 50, 100])
        current_price = sec.quote.last_price or sec.fundamentals.week_52_low or 100.0
        # avg cost is somewhere near current price +/- 10 %
        avg_cost = round(current_price * random.uniform(0.88, 1.05), 2)
        invested = round(qty * avg_cost, 2)
        current_val = round(qty * current_price, 2)
        pnl = round(current_val - invested, 2)
        pnl_pct = round((pnl / invested) * 100, 2) if invested else 0.0

        holdings.append(Holding(
            security_id=str(sec.id),
            symbol=sec.symbol,
            security_name=sec.name,
            quantity=qty,
            avg_cost_price=avg_cost,
            current_price=current_price,
            invested_value=invested,
            current_value=current_val,
            unrealized_pnl=pnl,
            unrealized_pnl_pct=pnl_pct,
            sector=sec.sector.value if sec.sector else None,
            last_updated=NOW,
        ))

        # Create a BUY transaction for each holding
        exec_at = _business_days_ago(random.randint(5, 55))
        net_amount = round(qty * avg_cost, 2)
        transactions.append(Transaction(
            order_id=None,  # will link later if needed
            security_id=str(sec.id),
            symbol=sec.symbol,
            type="buy",
            quantity=qty,
            price=avg_cost,
            fees=round(net_amount * 0.001, 2),
            taxes=round(net_amount * 0.0005, 2),
            net_amount=net_amount,
            currency=CURRENCY,
            executed_at=exec_at,
        ))

        total_invested += invested
        total_current += current_val

    portfolio = Portfolio(
        user_id=str(admin_user.id),
        name="NASDAQ Growth Portfolio",
        description="Default portfolio seeded with top NASDAQ holdings.",
        is_default=True,
        currency=CURRENCY,
        holdings=holdings,
        transactions=transactions,
        snapshots=[
            PortfolioSnapshot(
                date=NOW - timedelta(days=30),
                total_value=round(total_current * 0.95, 2),
                invested_value=round(total_invested, 2),
                realized_pnl=0,
                unrealized_pnl=round(total_current * 0.95 - total_invested, 2),
            ),
            PortfolioSnapshot(
                date=NOW,
                total_value=round(total_current, 2),
                invested_value=round(total_invested, 2),
                realized_pnl=0,
                unrealized_pnl=round(total_current - total_invested, 2),
            ),
        ],
        total_invested=round(total_invested, 2),
        total_current_value=round(total_current, 2),
        total_realized_pnl=0,
        total_unrealized_pnl=round(total_current - total_invested, 2),
        created_at=NOW,
        updated_at=NOW,
    )
    await portfolio.insert()
    print(f"       Created portfolio with {len(holdings)} holdings, {len(transactions)} transactions")
    return portfolio


async def seed_orders(
    admin_user: User,
    portfolio: Portfolio,
    securities: list[Security],
) -> list[Order]:
    print("[5/8] Seeding Orders ...")
    orders: list[Order] = []

    order_configs = []
    # Generate 15-20 random orders
    num_orders = random.randint(15, 20)
    for _ in range(num_orders):
        sec = random.choice(securities)
        side = random.choice([OrderSide.BUY, OrderSide.BUY, OrderSide.BUY, OrderSide.SELL])
        order_type = random.choices(
            [OrderType.MARKET, OrderType.LIMIT],
            weights=[0.6, 0.4],
        )[0]
        status = random.choices(
            [OrderStatus.FILLED, OrderStatus.CANCELLED, OrderStatus.PENDING],
            weights=[0.60, 0.20, 0.20],
        )[0]
        qty = random.choice([1, 2, 5, 10, 15, 20, 25, 50])
        base_price = sec.quote.last_price or 100.0

        placed_at = _random_datetime_in_range(
            NOW - timedelta(days=SEED_DAYS),
            NOW - timedelta(hours=1),
        )

        limit_price = None
        stop_price = None
        avg_fill = None
        filled_qty = 0.0
        executed_at = None
        cancelled_at = None
        total_amount = None
        fills: list[FillRecord] = []

        if order_type == OrderType.LIMIT:
            if side == OrderSide.BUY:
                limit_price = round(base_price * random.uniform(0.95, 0.99), 2)
            else:
                limit_price = round(base_price * random.uniform(1.01, 1.05), 2)

        if status == OrderStatus.FILLED:
            filled_qty = float(qty)
            avg_fill = round(base_price * random.uniform(0.98, 1.02), 2)
            executed_at = placed_at + timedelta(seconds=random.randint(1, 300))
            total_amount = round(filled_qty * avg_fill, 2)
            fills.append(FillRecord(
                fill_id=str(uuid.uuid4()),
                quantity=filled_qty,
                price=avg_fill,
                fees=round(total_amount * 0.001, 2),
                filled_at=executed_at,
            ))
        elif status == OrderStatus.CANCELLED:
            cancelled_at = placed_at + timedelta(minutes=random.randint(5, 120))

        order = Order(
            user_id=str(admin_user.id),
            portfolio_id=str(portfolio.id),
            security_id=str(sec.id),
            symbol=sec.symbol,
            exchange_code=EXCHANGE_CODE,
            security_name=sec.name,
            order_type=order_type,
            side=side,
            quantity=float(qty),
            filled_quantity=filled_qty,
            limit_price=limit_price,
            stop_price=stop_price,
            avg_fill_price=avg_fill,
            validity=OrderValidity.DAY,
            status=status,
            fills=fills,
            total_amount=total_amount,
            total_fees=round((total_amount or 0) * 0.001, 2),
            total_taxes=round((total_amount or 0) * 0.0005, 2),
            currency=CURRENCY,
            is_simulated=True,
            placed_at=placed_at,
            executed_at=executed_at,
            cancelled_at=cancelled_at,
            created_at=placed_at,
            updated_at=executed_at or cancelled_at or placed_at,
        )
        orders.append(order)

    for o in orders:
        await o.insert()

    print(f"       Created {len(orders)} orders")
    return orders


async def seed_watchlist(
    admin_user: User,
    securities: list[Security],
) -> Watchlist:
    print("[6/8] Seeding Watchlist ...")

    watch_secs = random.sample(securities, k=min(8, len(securities)))
    items: list[WatchlistItem] = []

    for sec in watch_secs:
        price = sec.quote.last_price or 100.0
        items.append(WatchlistItem(
            security_id=str(sec.id),
            symbol=sec.symbol,
            security_name=sec.name,
            alert_above=round(price * random.uniform(1.05, 1.15), 2),
            alert_below=round(price * random.uniform(0.85, 0.95), 2),
            notes=None,
            added_at=_random_datetime_in_range(NOW - timedelta(days=30), NOW),
        ))

    watchlist = Watchlist(
        user_id=str(admin_user.id),
        name="NASDAQ Watchlist",
        description="Tracking top NASDAQ movers",
        securities=items,
        is_default=True,
        created_at=NOW - timedelta(days=30),
        updated_at=NOW,
    )
    await watchlist.insert()
    print(f"       Created watchlist with {len(items)} items")
    return watchlist


async def seed_ml_predictions(securities: list[Security]) -> None:
    print("[7/8] Seeding ML Predictions ...")

    # Create one ML model
    model = MLModel(
        name="NASDAQ LSTM Price Predictor v2",
        model_type=MLModelType.LSTM_PRICE,
        status=MLModelStatus.DEPLOYED,
        version="2.1.0",
        accuracy_metrics=AccuracyMetrics(
            rmse=2.35,
            mae=1.87,
            mape=1.42,
            directional_accuracy=0.68,
        ),
        trained_at=NOW - timedelta(days=3),
        created_at=NOW - timedelta(days=10),
    )
    await model.insert()

    # Create predictions for 4 securities
    pred_secs = [s for s in securities if s.symbol in ("AAPL", "MSFT", "NVDA", "GOOGL")]
    if len(pred_secs) < 4:
        pred_secs = securities[:4]

    signals = [PredictionSignal.STRONG_BUY, PredictionSignal.BUY, PredictionSignal.HOLD, PredictionSignal.SELL]

    for i, sec in enumerate(pred_secs):
        price = sec.quote.last_price or 100.0
        # Generate 7 day forecast
        predicted: list[PricePrediction] = []
        p = price
        for d in range(1, 8):
            drift = random.uniform(-0.02, 0.03)
            p = round(p * (1 + drift), 2)
            predicted.append(PricePrediction(
                date=(TODAY + timedelta(days=d)).isoformat(),
                price=p,
            ))

        prediction = MLPrediction(
            model_id=str(model.id),
            security_id=str(sec.id),
            symbol=sec.symbol,
            predicted_prices=predicted,
            confidence=round(random.uniform(0.60, 0.88), 2),
            signal=signals[i % len(signals)],
            risk_assessment=RiskAssessment(
                daily_return_mean=round(random.uniform(-0.002, 0.005), 5),
                annual_return=round(random.uniform(0.05, 0.35), 4),
                volatility=round(random.uniform(0.15, 0.45), 4),
                sharpe_ratio=round(random.uniform(0.5, 2.5), 2),
            ),
            actual_prices=[],
            created_at=NOW,
        )
        await prediction.insert()

    print(f"       Created 1 ML model + {len(pred_secs)} predictions")


async def seed_notifications(
    admin_user: User,
    securities: list[Security],
) -> None:
    print("[8/8] Seeding Notifications ...")

    notifications: list[Notification] = []

    # Order filled notifications
    fill_secs = random.sample(securities, k=3)
    for sec in fill_secs:
        price = sec.quote.last_price or 100.0
        qty = random.choice([5, 10, 20])
        notifications.append(Notification(
            user_id=str(admin_user.id),
            type=NotificationType.ORDER_FILLED,
            title=f"Order Filled: {sec.symbol}",
            message=f"Your buy order for {qty} shares of {sec.symbol} was filled at ${price:.2f}.",
            data={"symbol": sec.symbol, "quantity": qty, "price": price},
            is_read=random.choice([True, False]),
            created_at=_random_datetime_in_range(NOW - timedelta(days=7), NOW),
        ))

    # Price alert notifications
    alert_secs = random.sample(securities, k=3)
    for sec in alert_secs:
        price = sec.quote.last_price or 100.0
        notifications.append(Notification(
            user_id=str(admin_user.id),
            type=NotificationType.PRICE_ALERT,
            title=f"Price Alert: {sec.symbol}",
            message=f"{sec.symbol} has reached ${price:.2f}, crossing your alert threshold.",
            data={"symbol": sec.symbol, "price": price},
            is_read=False,
            created_at=_random_datetime_in_range(NOW - timedelta(days=3), NOW),
        ))

    # Prediction ready
    notifications.append(Notification(
        user_id=str(admin_user.id),
        type=NotificationType.PREDICTION_READY,
        title="New ML Predictions Available",
        message="LSTM model has generated new 7-day price forecasts for AAPL, MSFT, NVDA, and GOOGL.",
        data={"model": "LSTM Price Predictor v2"},
        is_read=False,
        created_at=NOW - timedelta(hours=6),
    ))

    # System notification
    notifications.append(Notification(
        user_id=str(admin_user.id),
        type=NotificationType.SYSTEM,
        title="Welcome to Gloria Trade",
        message="Your account has been set up with a seeded NASDAQ portfolio. Explore the dashboard to get started!",
        data=None,
        is_read=True,
        created_at=NOW - timedelta(days=30),
    ))

    # Order cancelled notification
    cancel_sec = random.choice(securities)
    notifications.append(Notification(
        user_id=str(admin_user.id),
        type=NotificationType.ORDER_CANCELLED,
        title=f"Order Cancelled: {cancel_sec.symbol}",
        message=f"Your limit buy order for {cancel_sec.symbol} was cancelled as it expired at end of day.",
        data={"symbol": cancel_sec.symbol},
        is_read=True,
        created_at=_random_datetime_in_range(NOW - timedelta(days=14), NOW - timedelta(days=7)),
    ))

    for n in notifications:
        await n.insert()

    print(f"       Created {len(notifications)} notifications")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


async def drop_seeded_collections() -> None:
    """Drop collections that this script populates (idempotent reset)."""
    print("Dropping existing collections for re-seed ...")
    collections_to_drop = [
        Security,
        PriceHistoryDaily,
        Exchange,
        Country,
        Portfolio,
        Order,
        Watchlist,
        MLModel,
        MLPrediction,
        Notification,
    ]
    for model_cls in collections_to_drop:
        coll_name = model_cls.Settings.name
        try:
            await model_cls.get_motor_collection().drop()
            print(f"  Dropped: {coll_name}")
        except Exception as e:
            print(f"  Skip drop {coll_name}: {e}")


async def main() -> None:
    print("=" * 60)
    print("  Gloria Trade - NASDAQ Seed Script")
    print("=" * 60)
    print(f"  Database : {settings.mongodb_db_name}")
    print(f"  Date range: {START_DATE} -> {TODAY} ({SEED_DAYS} days)")
    print("=" * 60)

    # Initialize Beanie / Motor
    await init_db()

    # --- Find admin user ---
    admin_user = await User.find_one(User.role == "admin")
    if admin_user is None:
        # Fallback: pick the first user
        admin_user = await User.find_one()
    if admin_user is None:
        print("ERROR: No users found in the database. Please register an admin user first.")
        await close_db()
        return

    print(f"  Admin user: {admin_user.email} (id={admin_user.id})")
    print("=" * 60)

    # --- Drop & re-seed ---
    await drop_seeded_collections()

    # 1. Exchange + Country
    exchange = await seed_exchange()
    await seed_country()

    # 2. Securities
    securities = await seed_securities()

    # 3. Price history
    await seed_price_history(securities)

    # 4. Portfolio
    portfolio = await seed_portfolio(admin_user, securities)

    # 5. Orders
    await seed_orders(admin_user, portfolio, securities)

    # 6. Watchlist
    await seed_watchlist(admin_user, securities)

    # 7. ML Predictions
    await seed_ml_predictions(securities)

    # 8. Notifications
    await seed_notifications(admin_user, securities)

    # Done
    await close_db()
    print()
    print("=" * 60)
    print("  Seed complete!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
