import json
import logging
import urllib.error
import urllib.request

from app.config import settings

logger = logging.getLogger(__name__)


def send_sms(to_number: str, message: str) -> bool:
    if not settings.SMS_API_URL:
        logger.error("SMS provider is not configured. OTP was not sent.")
        return False

    payload = {
        "to": to_number,
        "message": message,
    }
    if settings.SMS_FROM:
        payload["from"] = settings.SMS_FROM

    headers = {"Content-Type": "application/json"}
    if settings.SMS_API_KEY:
        headers["Authorization"] = f"Bearer {settings.SMS_API_KEY}"

    request = urllib.request.Request(
        settings.SMS_API_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            return 200 <= response.status < 300
    except (urllib.error.URLError, TimeoutError):
        logger.exception("Failed to send SMS to configured provider.")
        return False


def send_access_otp_sms(mobile_number: str, otp: str, expires_minutes: int) -> bool:
    message = f"Your TIMS access verification OTP is {otp}. It expires in {expires_minutes} minutes."
    return send_sms(mobile_number, message)
