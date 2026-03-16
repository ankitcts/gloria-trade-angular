from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.auth.dependencies import get_current_user
from app.models.otp import OTPPurpose
from app.models.user import User

from .service import send_otp, verify_otp

router = APIRouter()


class SendOTPRequest(BaseModel):
    destination: str  # email or phone
    purpose: OTPPurpose


class VerifyOTPRequest(BaseModel):
    code: str
    purpose: OTPPurpose


@router.post("/send")
async def send_otp_endpoint(
    data: SendOTPRequest,
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await send_otp(
        user_id=str(current_user.id),
        destination=data.destination,
        purpose=data.purpose,
    )


@router.post("/verify")
async def verify_otp_endpoint(
    data: VerifyOTPRequest,
    current_user: Annotated[User, Depends(get_current_user)],
):
    await verify_otp(
        user_id=str(current_user.id),
        code=data.code,
        purpose=data.purpose,
    )
    return {"verified": True, "message": "OTP verified successfully."}
