import logging
import random
import smtplib
import string
from datetime import datetime, timedelta, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from fastapi import HTTPException, status

from app.config import settings
from app.models.otp import OTPPurpose, OTPRecord

logger = logging.getLogger(__name__)

OTP_EXPIRY_MINUTES = 5
OTP_LENGTH = 6

PURPOSE_LABELS = {
    OTPPurpose.CANCEL_ORDER: "Cancel Order",
    OTPPurpose.APPROVE_TRANSFER: "Approve Transfer",
    OTPPurpose.VERIFY_ACTION: "Verify Action",
}


def generate_otp() -> str:
    return "".join(random.choices(string.digits, k=OTP_LENGTH))


async def send_otp(user_id: str, destination: str, purpose: OTPPurpose) -> dict:
    """Generate OTP, store in DB, and send via Gmail SMTP."""
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

    logger.info(f"OTP generated for {destination}: {code} (purpose: {purpose.value})")

    # Send via Gmail SMTP
    email_sent = False
    if "@" in destination and settings.smtp_user and settings.smtp_password:
        email_sent = _send_email_smtp(destination, code, purpose)

    response = {
        "message": f"OTP sent to {_mask_destination(destination)}",
        "expires_in": OTP_EXPIRY_MINUTES * 60,
        "email_sent": email_sent,
    }

    # Include OTP in dev mode for testing (remove in production)
    if settings.app_env == "development":
        response["dev_otp"] = code

    return response


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

    # Handle both naive and aware datetimes from MongoDB
    now = datetime.now(timezone.utc)
    expires = record.expires_at if record.expires_at.tzinfo else record.expires_at.replace(tzinfo=timezone.utc)
    if now > expires:
        record.is_used = True
        await record.save()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please request a new one.",
        )

    record.attempts += 1
    if record.attempts > record.max_attempts:
        record.is_used = True
        await record.save()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Too many attempts. Please request a new OTP.",
        )

    record.is_used = True
    await record.save()
    return True


def _mask_destination(dest: str) -> str:
    if "@" in dest:
        local, domain = dest.split("@", 1)
        masked = local[:2] + "***" if len(local) > 2 else local[0] + "***"
        return f"{masked}@{domain}"
    if len(dest) > 4:
        return "***" + dest[-4:]
    return "****"


def _send_email_smtp(to_email: str, code: str, purpose: OTPPurpose) -> bool:
    """Send OTP email via Gmail SMTP. Returns True on success."""
    purpose_label = PURPOSE_LABELS.get(purpose, "Verification")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Gloria Trade - {purpose_label} OTP: {code}"
    msg["From"] = f"{settings.smtp_from_name} <{settings.smtp_user}>"
    msg["To"] = to_email

    # Plain text
    text = (
        f"Your Gloria Trade verification code is: {code}\n\n"
        f"Purpose: {purpose_label}\n"
        f"This code expires in {OTP_EXPIRY_MINUTES} minutes.\n\n"
        f"If you did not request this, please ignore this email."
    )

    # HTML email
    html = f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #2962ff; margin: 0; font-size: 24px;">Gloria Trade</h1>
            <p style="color: #787b86; margin: 4px 0 0; font-size: 14px;">{purpose_label} Verification</p>
        </div>
        <div style="background: #1e222d; border-radius: 12px; padding: 32px; text-align: center;">
            <p style="color: #d1d4dc; margin: 0 0 16px; font-size: 14px;">Your verification code is:</p>
            <div style="background: #131722; border-radius: 8px; padding: 16px; margin: 0 auto; display: inline-block;">
                <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #2962ff; font-family: monospace;">{code}</span>
            </div>
            <p style="color: #787b86; margin: 16px 0 0; font-size: 12px;">
                This code expires in {OTP_EXPIRY_MINUTES} minutes.
            </p>
        </div>
        <p style="color: #4c525e; font-size: 12px; text-align: center; margin-top: 24px;">
            If you did not request this code, please ignore this email.
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
        logger.info(f"OTP email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send OTP email to {to_email}: {e}")
        return False
