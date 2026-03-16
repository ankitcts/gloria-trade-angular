from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.auth.dependencies import get_current_user
from app.models.watchlist import Watchlist, WatchlistItem
from app.models.user import User

router = APIRouter()


class CreateWatchlistRequest(BaseModel):
    name: str
    description: str | None = None


class AddSecurityRequest(BaseModel):
    security_id: str
    symbol: str
    security_name: str | None = None
    alert_above: float | None = None
    alert_below: float | None = None


@router.get("")
async def list_watchlists(
    current_user: Annotated[User, Depends(get_current_user)],
):
    watchlists = await Watchlist.find(Watchlist.user_id == str(current_user.id)).to_list()
    return [
        {
            "id": str(w.id),
            "name": w.name,
            "description": w.description,
            "securities_count": len(w.securities),
            "is_default": w.is_default,
            "created_at": w.created_at.isoformat(),
        }
        for w in watchlists
    ]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_watchlist(
    data: CreateWatchlistRequest,
    current_user: Annotated[User, Depends(get_current_user)],
):
    watchlist = Watchlist(
        user_id=str(current_user.id),
        name=data.name,
        description=data.description,
    )
    await watchlist.insert()
    return {"id": str(watchlist.id), "name": watchlist.name}


@router.get("/{watchlist_id}")
async def get_watchlist(
    watchlist_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
):
    watchlist = await Watchlist.get(watchlist_id)
    if not watchlist or watchlist.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Watchlist not found")

    return {
        "id": str(watchlist.id),
        "name": watchlist.name,
        "description": watchlist.description,
        "securities": [s.model_dump() for s in watchlist.securities],
        "is_default": watchlist.is_default,
        "created_at": watchlist.created_at.isoformat(),
        "updated_at": watchlist.updated_at.isoformat(),
    }


@router.post("/{watchlist_id}/securities")
async def add_security_to_watchlist(
    watchlist_id: str,
    data: AddSecurityRequest,
    current_user: Annotated[User, Depends(get_current_user)],
):
    watchlist = await Watchlist.get(watchlist_id)
    if not watchlist or watchlist.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Watchlist not found")

    item = WatchlistItem(
        security_id=data.security_id,
        symbol=data.symbol,
        security_name=data.security_name,
        alert_above=data.alert_above,
        alert_below=data.alert_below,
    )
    watchlist.securities.append(item)
    await watchlist.save()

    return {"message": "Security added to watchlist"}


@router.delete("/{watchlist_id}/securities/{security_id}")
async def remove_security_from_watchlist(
    watchlist_id: str,
    security_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
):
    watchlist = await Watchlist.get(watchlist_id)
    if not watchlist or watchlist.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Watchlist not found")

    watchlist.securities = [s for s in watchlist.securities if s.security_id != security_id]
    await watchlist.save()

    return {"message": "Security removed from watchlist"}
