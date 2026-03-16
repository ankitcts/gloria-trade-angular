from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.models.user import User

from .dependencies import get_current_user
from .schemas import LoginRequest, RefreshRequest, RegisterRequest, TokenResponse, UserResponse
from .service import _issue_tokens, login_user, logout_user, refresh_access_token, register_user

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest) -> TokenResponse:
    user = await register_user(data)
    return await _issue_tokens(user)


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest) -> TokenResponse:
    _user, tokens = await login_user(data.email, data.password)
    return tokens


@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshRequest) -> TokenResponse:
    return await refresh_access_token(data.refresh_token)


@router.get("/me", response_model=UserResponse)
async def me(current_user: Annotated[User, Depends(get_current_user)]) -> UserResponse:
    return UserResponse.from_user(current_user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(current_user: Annotated[User, Depends(get_current_user)]) -> None:
    await logout_user(str(current_user.id))
