from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.auth.dependencies import require_admin
from app.models.user import AccountStatus, User, UserRole

router = APIRouter()


class UpdateRoleRequest(BaseModel):
    role: UserRole


class UpdateStatusRequest(BaseModel):
    status: AccountStatus


@router.get("")
async def list_users(
    _admin: Annotated[User, Depends(require_admin)],
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    role: Optional[str] = None,
):
    filters = []
    if role:
        filters.append(User.role == role)

    total = await User.find(*filters).count()
    users = await User.find(*filters).skip((page - 1) * page_size).limit(page_size).to_list()

    return {
        "items": [
            {
                "id": str(u.id),
                "email": u.email,
                "first_name": u.first_name,
                "last_name": u.last_name,
                "role": u.role.value,
                "account_status": u.account_status.value,
                "kyc_status": u.kyc_status.value,
                "last_login_at": u.last_login_at.isoformat() if u.last_login_at else None,
                "created_at": u.created_at.isoformat(),
            }
            for u in users
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/{user_id}")
async def get_user(
    user_id: str,
    _admin: Annotated[User, Depends(require_admin)],
):
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": str(user.id),
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "display_name": user.display_name,
        "phone": user.phone,
        "role": user.role.value,
        "account_status": user.account_status.value,
        "kyc_status": user.kyc_status.value,
        "email_verified": user.email_verified,
        "login_count": user.login_count,
        "last_login_at": user.last_login_at.isoformat() if user.last_login_at else None,
        "created_at": user.created_at.isoformat(),
        "updated_at": user.updated_at.isoformat(),
    }


@router.put("/{user_id}/role")
async def update_role(
    user_id: str,
    data: UpdateRoleRequest,
    _admin: Annotated[User, Depends(require_admin)],
):
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    from datetime import datetime, timezone
    user.role = data.role
    user.updated_at = datetime.now(timezone.utc)
    await user.save()

    return {"id": str(user.id), "role": user.role.value}


@router.put("/{user_id}/status")
async def update_status(
    user_id: str,
    data: UpdateStatusRequest,
    _admin: Annotated[User, Depends(require_admin)],
):
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    from datetime import datetime, timezone
    user.account_status = data.status
    user.updated_at = datetime.now(timezone.utc)
    await user.save()

    return {"id": str(user.id), "account_status": user.account_status.value}
