import logging
import smtplib
from email.message import EmailMessage

from app.config import settings

logger = logging.getLogger(__name__)


def is_email_configured() -> bool:
    return bool(settings.SMTP_HOST and (settings.SMTP_FROM_EMAIL or settings.SMTP_FROM))


def _send_email(to_email: str, subject: str, body: str) -> bool:
    from_email = settings.SMTP_FROM_EMAIL or settings.SMTP_FROM
    if not is_email_configured():
        logger.warning("SMTP is not configured. Email not sent to %s for subject %s", to_email, subject)
        return False

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = from_email
    message["To"] = to_email
    message.set_content(body)

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=20) as smtp:
            if settings.SMTP_USE_TLS:
                smtp.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            smtp.send_message(message)
    except Exception:
        logger.exception("Failed to send email to %s for subject %s", to_email, subject)
        return False

    logger.info("Email accepted by SMTP server for %s subject=%s", to_email, subject)
    return True


def send_password_reset_email(to_email: str, full_name: str, employee_id: str, reset_token: str, expires_minutes: int) -> bool:
    reset_url = f"{settings.FRONTEND_BASE_URL}/login?reset_token={reset_token}"
    body = f"""Hello {full_name},

We received a request to reset your TIMS password.

Open this link to set a new password:
{reset_url}

Your employee ID is included here for your reference only:
{employee_id}

This token expires in {expires_minutes} minutes. If you did not request this reset, ignore this email.
"""
    return _send_email(to_email, "TIMS password reset", body)


def send_username_recovery_email(to_email: str, full_name: str, employee_id: str) -> bool:
    body = f"""Hello {full_name},

We received a request to recover your TIMS username.

Your TIMS employee ID / username is:
{employee_id}

If you did not request this, please contact your TIMS administrator.
"""
    return _send_email(to_email, "TIMS username recovery", body)


def send_access_request_received_email(to_email: str, full_name: str, employee_id: str, requested_role: str) -> bool:
    role_label = requested_role.replace("_", " ")
    body = f"""Hello {full_name},

Thank you for creating your TIMS access request.

Your request for employee ID {employee_id} with {role_label} access has been sent to the admin team for approval.

You will receive another email after the admin activates your account. Please sign in only after approval.
"""
    return _send_email(to_email, "TIMS access request received", body)


def send_access_otp_email(to_email: str, full_name: str, otp: str, expires_minutes: int) -> bool:
    body = f"""Hello {full_name},

Your TIMS access verification OTP is: {otp}

This code expires in {expires_minutes} minutes. Do not share it with anyone.

If you did not request TIMS access, please ignore this email.
"""
    return _send_email(to_email, "TIMS access verification OTP", body)


def send_access_request_approved_email(to_email: str, full_name: str, employee_id: str) -> bool:
    body = f"""Hello {full_name},

Your TIMS account has been approved and activated.

Employee ID:
{employee_id}

Please return to the TIMS sign in page and log in with the password you created during the access request.
"""
    return _send_email(to_email, "TIMS account approved", body)
