from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query

from app.auth.dependencies import get_current_user
from app.models.portfolio import Portfolio
from app.models.user import User

router = APIRouter()


@router.get("")
async def list_portfolios(
    current_user: Annotated[User, Depends(get_current_user)],
):
    portfolios = await Portfolio.find(Portfolio.user_id == str(current_user.id)).to_list()
    return [
        {
            "id": str(p.id),
            "name": p.name,
            "description": p.description,
            "is_default": p.is_default,
            "currency": p.currency,
            "total_invested": p.total_invested,
            "total_current_value": p.total_current_value,
            "total_realized_pnl": p.total_realized_pnl,
            "total_unrealized_pnl": p.total_unrealized_pnl,
            "holdings_count": len(p.holdings),
            "created_at": p.created_at.isoformat(),
            "updated_at": p.updated_at.isoformat(),
        }
        for p in portfolios
    ]


@router.get("/{portfolio_id}")
async def get_portfolio(
    portfolio_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
):
    portfolio = await Portfolio.get(portfolio_id)
    if not portfolio or portfolio.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Portfolio not found")

    return {
        "id": str(portfolio.id),
        "name": portfolio.name,
        "description": portfolio.description,
        "is_default": portfolio.is_default,
        "currency": portfolio.currency,
        "holdings": [h.model_dump() for h in portfolio.holdings],
        "total_invested": portfolio.total_invested,
        "total_current_value": portfolio.total_current_value,
        "total_realized_pnl": portfolio.total_realized_pnl,
        "total_unrealized_pnl": portfolio.total_unrealized_pnl,
        "created_at": portfolio.created_at.isoformat(),
        "updated_at": portfolio.updated_at.isoformat(),
    }


@router.get("/{portfolio_id}/holdings")
async def get_holdings(
    portfolio_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
):
    portfolio = await Portfolio.get(portfolio_id)
    if not portfolio or portfolio.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Portfolio not found")

    return [h.model_dump() for h in portfolio.holdings]


@router.get("/{portfolio_id}/transactions")
async def get_transactions(
    portfolio_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    portfolio = await Portfolio.get(portfolio_id)
    if not portfolio or portfolio.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Portfolio not found")

    total = len(portfolio.transactions)
    start = (page - 1) * page_size
    end = start + page_size
    txns = portfolio.transactions[start:end]

    return {
        "items": [t.model_dump() for t in txns],
        "total": total,
        "page": page,
        "page_size": page_size,
    }
