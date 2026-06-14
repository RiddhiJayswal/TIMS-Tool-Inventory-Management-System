import logging
import smtplib
from email.message import EmailMessage

from app.config import settings

logger = logging.getLogger(__name__)


def send_password_reset_email(to_email: str, full_name: str, reset_token: str, expires_minutes: int) -> bool:
    reset_url = f"{settings.FRONTEND_BASE_URL}/login"
    subject = "TIMS password reset"
    body = f"""Hello {full_name},

We received a request to reset your TIMS password.

Reset token:
{reset_token}

Open {reset_url}, choose Forgot, paste this token, and set a new password.

This token expires in {expires_minutes} minutes. If you did not request this reset, ignore this email.
"""

    if not settings.SMTP_HOST or not settings.SMTP_FROM_EMAIL:
        logger.warning(
            "SMTP is not configured. Password reset token for %s: %s",
            to_email,
            reset_token,
        )
        return False

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = settings.SMTP_FROM_EMAIL
    message["To"] = to_email
    message.set_content(body)

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=20) as smtp:
        if settings.SMTP_USE_TLS:
            smtp.starttls()
        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        smtp.send_message(message)

    return True
