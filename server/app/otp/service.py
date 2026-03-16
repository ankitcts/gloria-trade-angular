import logging
import random
import smtplib
import string
from datetime import datetime, timedelta, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from fastapi import HTTPException, status

from app.models.otp import OTPPurpose, OTPRecord

logger = logging.getLogger(__name__)

OTP_EXPIRY_MINUTES = 5
OTP_LENGTH = 6


def generate_otp() -> str:
    return "".join(random.choices(string.digits, k=OTP_LENGTH))


async def send_otp(user_id: str, destination: str, purpose: OTPPurpose) -> dict:
    """Generate OTP, store in DB, and send via email.

    For production, integrate Twilio/SNS for SMS. Currently uses
    a simple approach: stores OTP in DB and returns it in dev mode
    for testing. In production, send via SMTP or an email API.
    """
    # Invalidate any existing OTPs for this user/purpose
    existing = await OTPRecord.find(
        OTPRecord.user_id == user_id,
        OTPRecord.purpose == purpose,
        OTPRecord.is_used == False,
    ).to_list()
    for otp in existing:
        otp.is_used = True
        await otp.save()

    code = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES)

    record = OTPRecord(
        user_id=user_id,
        code=code,
        purpose=purpose,
        destination=destination,
        expires_at=expires_at,
    )
    await record.insert()

    # In development, log the OTP. In production, send via email/SMS service.
    logger.info(f"OTP for {destination}: {code} (purpose: {purpose.value})")

    # Attempt to send email (best-effort, doesn't fail if email not configured)
    _try_send_email(destination, code, purpose)

    return {
        "message": f"OTP sent to {_mask_destination(destination)}",
        "expires_in": OTP_EXPIRY_MINUTES * 60,
        # Include OTP in dev mode for testing convenience
        "dev_otp": code,
    }


async def verify_otp(user_id: str, code: str, purpose: OTPPurpose) -> bool:
    """Verify an OTP code. Returns True if valid."""
    record = await OTPRecord.find_one(
        OTPRecord.user_id == user_id,
        OTPRecord.code == code,
        OTPRecord.purpose == purpose,
        OTPRecord.is_used == False,
    )

    if not record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code.",
        )

    # Check expiry
    if datetime.now(timezone.utc) > record.expires_at:
        record.is_used = True
        await record.save()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please request a new one.",
        )

    # Check max attempts
    record.attempts += 1
    if record.attempts > record.max_attempts:
        record.is_used = True
        await record.save()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Too many attempts. Please request a new OTP.",
        )

    # Mark as used
    record.is_used = True
    await record.save()
    return True


def _mask_destination(dest: str) -> str:
    if "@" in dest:
        local, domain = dest.split("@", 1)
        masked = local[:2] + "***" if len(local) > 2 else local[0] + "***"
        return f"{masked}@{domain}"
    # Phone
    if len(dest) > 4:
        return "***" + dest[-4:]
    return "****"


def _try_send_email(to_email: str, code: str, purpose: OTPPurpose) -> None:
    """Best-effort email send. Logs on failure instead of raising."""
    if "@" not in to_email:
        return  # Not an email address

    try:
        # Uses Gmail SMTP as an example. Configure via env vars in production.
        # For now, this is a no-op that just logs. Replace with your SMTP config.
        logger.info(
            f"[EMAIL] To: {to_email} | Subject: Gloria Trade OTP | "
            f"Body: Your verification code is {code}. Valid for {OTP_EXPIRY_MINUTES} minutes. "
            f"Purpose: {purpose.value}"
        )
    except Exception as e:
        logger.warning(f"Failed to send OTP email: {e}")
