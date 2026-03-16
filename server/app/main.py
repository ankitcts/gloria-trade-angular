from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import close_db, init_db
from app.auth.router import router as auth_router
from app.securities.router import router as securities_router
from app.trading.router import router as trading_router
from app.portfolio.router import router as portfolio_router
from app.predictions.router import router as predictions_router
from app.watchlists.router import router as watchlists_router
from app.notifications.router import router as notifications_router
from app.admin.router import router as admin_router
from app.websocket.router import router as ws_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await close_db()


app = FastAPI(
    title="Gloria Trade API",
    description="AI-powered trading platform - Profit & Glory",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(securities_router, prefix="/api/v1/securities", tags=["securities"])
app.include_router(trading_router, prefix="/api/v1/orders", tags=["orders"])
app.include_router(portfolio_router, prefix="/api/v1/portfolios", tags=["portfolios"])
app.include_router(predictions_router, prefix="/api/v1/predictions", tags=["predictions"])
app.include_router(watchlists_router, prefix="/api/v1/watchlists", tags=["watchlists"])
app.include_router(notifications_router, prefix="/api/v1/notifications", tags=["notifications"])
app.include_router(admin_router, prefix="/api/v1/admin", tags=["admin"])

# WebSocket
app.include_router(ws_router, prefix="/ws", tags=["websocket"])


@app.get("/api/v1/health")
async def health_check():
    return {"status": "healthy", "version": "0.1.0"}
