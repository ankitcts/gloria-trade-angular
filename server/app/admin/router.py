import logging
import secrets
import string
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.auth.dependencies import require_admin
from app.auth.service import hash_password
from pydantic import EmailStr

from app.models.user import AccountStatus, KYCStatus, User, UserRole
from app.otp.service import _send_email_smtp

logger = logging.getLogger(__name__)

router = APIRouter()


class CreateUserRequest(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    password: str
    role: UserRole = UserRole.TRADER
    phone: Optional[str] = None


class UpdateUserRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    display_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[UserRole] = None
    account_status: Optional[AccountStatus] = None
    email_verified: Optional[bool] = None


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


@router.post("", status_code=201)
async def create_user(
    data: CreateUserRequest,
    _admin: Annotated[User, Depends(require_admin)],
):
    existing = await User.find_one(User.email == data.email)
    if existing:
        raise HTTPException(status_code=409, detail="A user with this email already exists.")

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        first_name=data.first_name,
        last_name=data.last_name,
        phone=data.phone,
        role=data.role,
    )
    await user.insert()

    # Send welcome email with credentials
    _send_welcome_email(data.email, data.first_name, data.password)

    return {
        "id": str(user.id),
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role.value,
    }


@router.put("/{user_id}")
async def update_user(
    user_id: str,
    data: UpdateUserRequest,
    _admin: Annotated[User, Depends(require_admin)],
):
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    from datetime import datetime, timezone

    if data.first_name is not None:
        user.first_name = data.first_name
    if data.last_name is not None:
        user.last_name = data.last_name
    if data.display_name is not None:
        user.display_name = data.display_name
    if data.phone is not None:
        user.phone = data.phone
    if data.role is not None:
        user.role = data.role
    if data.account_status is not None:
        user.account_status = data.account_status
    if data.email_verified is not None:
        user.email_verified = data.email_verified

    user.updated_at = datetime.now(timezone.utc)
    await user.save()

    return {
        "id": str(user.id),
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role.value,
        "account_status": user.account_status.value,
    }


def _send_welcome_email(to_email: str, name: str, password: str) -> bool:
    import smtplib
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText
    from app.config import settings

    if not settings.smtp_user or not settings.smtp_password:
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Welcome to Gloria Trade - Your Account is Ready"
    msg["From"] = f"{settings.smtp_from_name} <{settings.smtp_user}>"
    msg["To"] = to_email

    html = f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #2962ff; margin: 0; font-size: 24px;">Gloria Trade</h1>
            <p style="color: #787b86; margin: 4px 0 0; font-size: 14px;">Welcome aboard!</p>
        </div>
        <div style="background: #1e222d; border-radius: 12px; padding: 32px;">
            <p style="color: #d1d4dc; margin: 0 0 16px; font-size: 15px;">Hi {name},</p>
            <p style="color: #787b86; margin: 0 0 20px; font-size: 14px;">Your trading account has been created. Here are your login credentials:</p>
            <div style="background: #131722; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                <p style="color: #787b86; margin: 0 0 4px; font-size: 12px;">EMAIL</p>
                <p style="color: #2962ff; margin: 0; font-size: 16px; font-weight: 600;">{to_email}</p>
            </div>
            <div style="background: #131722; border-radius: 8px; padding: 16px;">
                <p style="color: #787b86; margin: 0 0 4px; font-size: 12px;">PASSWORD</p>
                <p style="color: #2962ff; margin: 0; font-size: 16px; font-weight: 600; font-family: monospace;">{password}</p>
            </div>
            <p style="color: #ef5350; margin: 16px 0 0; font-size: 13px; font-weight: 500;">Please change your password after first login.</p>
        </div>
    </div>
    """

    msg.attach(MIMEText(html, "html"))
    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(settings.smtp_user, to_email, msg.as_string())
        return True
    except Exception as e:
        logger.error(f"Failed to send welcome email: {e}")
        return False


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


def _generate_password(length: int = 12) -> str:
    """Generate a secure random password."""
    chars = string.ascii_letters + string.digits + "!@#$%"
    # Ensure at least one of each type
    pwd = [
        secrets.choice(string.ascii_uppercase),
        secrets.choice(string.ascii_lowercase),
        secrets.choice(string.digits),
        secrets.choice("!@#$%"),
    ]
    pwd += [secrets.choice(chars) for _ in range(length - 4)]
    secrets.SystemRandom().shuffle(pwd)
    return "".join(pwd)


def _send_password_email(to_email: str, user_name: str, new_password: str) -> bool:
    """Send new password to user via Gmail SMTP."""
    import smtplib
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText
    from app.config import settings

    if not settings.smtp_user or not settings.smtp_password:
        logger.warning("SMTP not configured, cannot send password email")
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Gloria Trade - Your Password Has Been Reset"
    msg["From"] = f"{settings.smtp_from_name} <{settings.smtp_user}>"
    msg["To"] = to_email

    text = (
        f"Hi {user_name},\n\n"
        f"Your password has been reset by an administrator.\n\n"
        f"Your new password: {new_password}\n\n"
        f"Please login and change your password immediately.\n\n"
        f"- Gloria Trade Team"
    )

    html = f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #2962ff; margin: 0; font-size: 24px;">Gloria Trade</h1>
            <p style="color: #787b86; margin: 4px 0 0; font-size: 14px;">Password Reset</p>
        </div>
        <div style="background: #1e222d; border-radius: 12px; padding: 32px;">
            <p style="color: #d1d4dc; margin: 0 0 8px; font-size: 15px;">Hi {user_name},</p>
            <p style="color: #787b86; margin: 0 0 20px; font-size: 14px;">Your password has been reset by an administrator.</p>
            <p style="color: #787b86; margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Your new password:</p>
            <div style="background: #131722; border-radius: 8px; padding: 16px; text-align: center;">
                <span style="font-size: 22px; font-weight: 700; letter-spacing: 2px; color: #2962ff; font-family: monospace;">{new_password}</span>
            </div>
            <p style="color: #ef5350; margin: 16px 0 0; font-size: 13px; font-weight: 500;">Please login and change your password immediately.</p>
        </div>
        <p style="color: #4c525e; font-size: 12px; text-align: center; margin-top: 24px;">
            If you did not expect this, please contact your administrator.
        </p>
    </div>
    """

    msg.attach(MIMEText(text, "plain"))
    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(settings.smtp_user, to_email, msg.as_string())
        logger.info(f"Password reset email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send password email to {to_email}: {e}")
        return False


@router.post("/{user_id}/reset-password")
async def reset_password(
    user_id: str,
    _admin: Annotated[User, Depends(require_admin)],
):
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    from datetime import datetime, timezone

    new_password = _generate_password()
    user.password_hash = hash_password(new_password)
    user.updated_at = datetime.now(timezone.utc)
    await user.save()

    email_sent = _send_password_email(
        to_email=user.email,
        user_name=user.first_name,
        new_password=new_password,
    )

    return {
        "id": str(user.id),
        "email": user.email,
        "email_sent": email_sent,
        "message": f"Password reset for {user.email}. New password sent via email." if email_sent else f"Password reset but email failed. New password: {new_password}",
    }
