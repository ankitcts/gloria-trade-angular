from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query

from app.auth.dependencies import get_current_user
from app.models.security import Security
from app.models.price_history import PriceHistoryDaily
from app.models.user import User

router = APIRouter()


@router.get("")
async def list_securities(
    _current_user: Annotated[User, Depends(get_current_user)],
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    security_type: Optional[str] = None,
    sector: Optional[str] = None,
    search: Optional[str] = None,
):
    query = Security.find(Security.is_active == True)

    if security_type:
        query = Security.find(Security.is_active == True, Security.security_type == security_type)
    if sector:
        query = Security.find(Security.is_active == True, Security.sector == sector)

    total = await query.count()
    securities = await query.skip((page - 1) * page_size).limit(page_size).to_list()

    return {
        "items": [
            {
                "id": str(s.id),
                "symbol": s.symbol,
                "name": s.name,
                "security_type": s.security_type.value,
                "sector": s.sector.value if s.sector else None,
                "primary_exchange_code": s.primary_exchange_code,
                "currency": s.currency,
                "country_code": s.country_code,
                "computed_risk": s.computed_risk.value if s.computed_risk else None,
                "last_price": s.quote.last_price,
                "change_pct": s.quote.change_pct,
                "is_active": s.is_active,
            }
            for s in securities
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/search")
async def search_securities(
    _current_user: Annotated[User, Depends(get_current_user)],
    q: str = Query(min_length=1),
):
    securities = await Security.find(
        {"$or": [
            {"symbol": {"$regex": q, "$options": "i"}},
            {"name": {"$regex": q, "$options": "i"}},
        ]},
        Security.is_active == True,
    ).limit(20).to_list()

    return [
        {
            "id": str(s.id),
            "symbol": s.symbol,
            "name": s.name,
            "security_type": s.security_type.value,
            "last_price": s.quote.last_price,
        }
        for s in securities
    ]


@router.get("/{security_id}")
async def get_security(
    security_id: str,
    _current_user: Annotated[User, Depends(get_current_user)],
):
    security = await Security.get(security_id)
    if not security:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Security not found")

    return {
        "id": str(security.id),
        "symbol": security.symbol,
        "name": security.name,
        "security_type": security.security_type.value,
        "sector": security.sector.value if security.sector else None,
        "industry": security.industry,
        "description": security.description,
        "country_code": security.country_code,
        "currency": security.currency,
        "isin": security.isin,
        "listings": [l.model_dump() for l in security.listings],
        "fundamentals": security.fundamentals.model_dump(),
        "quote": security.quote.model_dump(),
        "computed_risk": security.computed_risk.value if security.computed_risk else None,
        "primary_exchange_code": security.primary_exchange_code,
        "is_active": security.is_active,
        "has_historical_data": security.has_historical_data,
        "created_at": security.created_at.isoformat(),
        "updated_at": security.updated_at.isoformat(),
    }


@router.get("/{security_id}/history")
async def get_price_history(
    security_id: str,
    _current_user: Annotated[User, Depends(get_current_user)],
    period: str = Query(default="1y"),
):
    history = await PriceHistoryDaily.find(
        PriceHistoryDaily.security_id == security_id,
    ).sort(-PriceHistoryDaily.date).limit(365).to_list()

    return [
        {
            "date": h.date.isoformat(),
            "open": h.open,
            "high": h.high,
            "low": h.low,
            "close": h.close,
            "volume": h.volume,
            "adj_close": h.adj_close,
            "change_pct": h.change_pct,
        }
        for h in reversed(history)
    ]
