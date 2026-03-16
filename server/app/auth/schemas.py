from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr

from app.models.user import AccountStatus, KYCStatus, User, UserRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone: Optional[str] = None


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str


class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    display_name: Optional[str] = None
    role: UserRole
    account_status: AccountStatus
    email_verified: bool
    phone_verified: bool
    last_login_at: Optional[datetime] = None
    login_count: int
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_user(cls, user: User) -> "UserResponse":
        return cls(
            id=str(user.id),
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            display_name=user.display_name,
            role=user.role,
            account_status=user.account_status,
            email_verified=user.email_verified,
            phone_verified=user.phone_verified,
            last_login_at=user.last_login_at,
            login_count=user.login_count,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )
