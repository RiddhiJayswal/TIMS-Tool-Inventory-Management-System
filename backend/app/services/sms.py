import json
import logging
import base64
import urllib.error
import urllib.parse
import urllib.request

from app.config import settings

logger = logging.getLogger(__name__)


def _send_twilio_sms(to_number: str, message: str) -> bool:
    if not (settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_FROM_NUMBER):
        logger.error("Twilio SMS provider is not configured. OTP was not sent.")
        return False

    url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Messages.json"
    form = urllib.parse.urlencode({
        "To": to_number,
        "From": settings.TWILIO_FROM_NUMBER,
        "Body": message,
    }).encode("utf-8")
    token = base64.b64encode(f"{settings.TWILIO_ACCOUNT_SID}:{settings.TWILIO_AUTH_TOKEN}".encode("utf-8")).decode("ascii")
    request = urllib.request.Request(
        url,
        data=form,
        headers={
            "Authorization": f"Basic {token}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            accepted = 200 <= response.status < 300
            if accepted:
                logger.info("Twilio accepted SMS for %s", to_number)
            else:
                logger.error("Twilio rejected SMS for %s with HTTP %s", to_number, response.status)
            return accepted
    except (urllib.error.URLError, TimeoutError):
        logger.exception("Failed to send SMS through Twilio.")
        return False


def send_sms(to_number: str, message: str) -> bool:
    provider = (settings.SMS_PROVIDER or "").strip().lower()
    if provider == "twilio" or (
        not settings.SMS_API_URL
        and settings.TWILIO_ACCOUNT_SID
        and settings.TWILIO_AUTH_TOKEN
        and settings.TWILIO_FROM_NUMBER
    ):
        return _send_twilio_sms(to_number, message)

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
            accepted = 200 <= response.status < 300
            if accepted:
                logger.info("SMS accepted by configured provider for %s", to_number)
            else:
                logger.error("SMS provider rejected message for %s with HTTP %s", to_number, response.status)
            return accepted
    except (urllib.error.URLError, TimeoutError):
        logger.exception("Failed to send SMS to configured provider.")
        return False


def send_access_otp_sms(mobile_number: str, otp: str, expires_minutes: int) -> bool:
    message = f"Your TIMS access verification OTP is {otp}. It expires in {expires_minutes} minutes."
    return send_sms(mobile_number, message)
