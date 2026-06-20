import logging
import hashlib
import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field, field_validator
from sqlalchemy.orm import Session
from uuid import UUID

from app.database import get_db
from app.models.transaction import User, Notification, AccessRequest, PasswordResetToken
from app.auth.roles import verify_password, create_access_token, get_current_user, hash_password
from app.config import settings
from app.services.email import (
    is_email_configured,
    send_access_otp_email,
    send_access_request_received_email,
    send_password_reset_email,
)
from app.services.sms import send_access_otp_sms

router = APIRouter(prefix="/auth", tags=["auth"])

RESET_TOKEN_MINUTES = 15
OTP_MINUTES = 10
OTP_MAX_ATTEMPTS = 5
PUBLIC_REQUEST_ROLES = {"requester", "dept_head", "maintenance_staff"}
logger = logging.getLogger(__name__)


def _validate_password(value: str) -> str:
    if not any(ch.isupper() for ch in value):
        raise ValueError("Password must contain at least one uppercase letter")
    if not any(ch.islower() for ch in value):
        raise ValueError("Password must contain at least one lowercase letter")
    if not any(ch.isdigit() for ch in value):
        raise ValueError("Password must contain at least one number")
    if not any(not ch.isalnum() for ch in value):
        raise ValueError("Password must contain at least one special character")
    return value


class SignupRequest(BaseModel):
    employee_id: str = Field(min_length=3, max_length=50)
    full_name: str = Field(min_length=2, max_length=200)
    email: EmailStr
    mobile_number: str = Field(min_length=8, max_length=30)
    password: str = Field(min_length=6, max_length=128)
    department: str = Field(min_length=2, max_length=100)
    requested_role: str = "requester"
    reason: str | None = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotUsernameRequest(BaseModel):
    identifier: str = Field(min_length=3, max_length=200)


class AccessOtpSendRequest(SignupRequest):
    otp_channel: str = "mobile"  # "mobile" or "email"


class AccessOtpVerifyRequest(BaseModel):
    email: EmailStr
    mobile_number: str = Field(min_length=8, max_length=30)
    otp: str = Field(min_length=4, max_length=10)


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def strong_password(cls, value: str) -> str:
        return _validate_password(value)


def _user_out(user: User) -> dict:
    return {
        "id": str(user.id),
        "employee_id": user.employee_id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "department": user.department,
        "is_active": user.is_active,
        "created_at": user.created_at,
    }


def _access_request_out(req: AccessRequest) -> dict:
    return {
        "id": str(req.id),
        "requestId": req.request_id,
        "request_id": req.request_id,
        "name": req.full_name,
        "full_name": req.full_name,
        "email": req.email,
        "mobile_number": req.mobile_number,
        "username": req.email,
        "employeeId": req.employee_id,
        "employee_id": req.employee_id,
        "department": req.department,
        "requestedRole": req.requested_role,
        "requested_role": req.requested_role,
        "reason": req.reason,
        "notes": req.reason,
        "status": req.status,
        "otp_verified": bool(req.otp_verified_at),
        "createdAt": req.created_at,
        "created_at": req.created_at,
        "approvedBy": str(req.approved_by) if req.approved_by else None,
        "approved_by": str(req.approved_by) if req.approved_by else None,
        "approvedAt": req.approved_at,
        "approved_at": req.approved_at,
        "rejection_reason": req.rejection_reason,
    }


def _reset_token_hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _create_reset_token(db: Session, user: User) -> str:
    now = datetime.utcnow()
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.used_at.is_(None),
    ).update({"used_at": now}, synchronize_session=False)

    token = secrets.token_urlsafe(32)
    db.add(PasswordResetToken(
        user_id=user.id,
        token_hash=_reset_token_hash(token),
        expires_at=now + timedelta(minutes=RESET_TOKEN_MINUTES),
    ))
    return token


def _normalize_requested_role(role: str) -> str:
    role_map = {
        "requester": "requester",
        "Requester": "requester",
        "dept_head": "dept_head",
        "Dept Head": "dept_head",
        "head": "dept_head",
        "staff": "maintenance_staff",
        "maintenance_staff": "maintenance_staff",
        "Maintenance Staff": "maintenance_staff",
        "maintenance_admin": "maintenance_admin",
        "Admin": "maintenance_admin",
    }
    return role_map.get(role, role)


def _clean_mobile(value: str) -> str:
    return "".join(ch for ch in value.strip() if ch.isdigit() or ch == "+")


def _find_access_draft(db: Session, email: str, mobile_number: str) -> AccessRequest | None:
    return (
        db.query(AccessRequest)
        .filter(
            AccessRequest.email == email.strip().lower(),
            AccessRequest.mobile_number == _clean_mobile(mobile_number),
            AccessRequest.status == "otp_pending",
        )
        .order_by(AccessRequest.created_at.desc())
        .first()
    )


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.employee_id == form_data.username.strip().upper()).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect employee ID or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")

    access_token = create_access_token(
        data={"sub": user.employee_id},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": _user_out(user),
    }


@router.post("/signup", status_code=201)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    employee_id = payload.employee_id.strip().upper()
    email = payload.email.strip().lower()
    mobile_number = _clean_mobile(payload.mobile_number)
    requested_role = _normalize_requested_role(payload.requested_role)

    if db.query(User).filter(User.employee_id == employee_id).first():
        raise HTTPException(status_code=400, detail="Employee ID already exists")
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if requested_role not in PUBLIC_REQUEST_ROLES:
        raise HTTPException(status_code=400, detail="Invalid requested role")

    verified = _find_access_draft(db, email, mobile_number)
    if not verified or not verified.otp_verified_at:
        raise HTTPException(status_code=400, detail="Mobile number must be verified before submitting access request")
    if verified.employee_id != employee_id:
        raise HTTPException(status_code=400, detail="Verified OTP request does not match this employee ID")

    existing = (
        db.query(AccessRequest)
        .filter(
            AccessRequest.status == "pending",
            ((AccessRequest.employee_id == employee_id) | (AccessRequest.email == email)),
        )
        .first()
    )
    if existing:
        return {"message": "Access request already pending", "request": _access_request_out(existing)}

    verified.full_name = payload.full_name.strip()
    verified.email = email
    verified.mobile_number = mobile_number
    verified.employee_id = employee_id
    verified.hashed_password = hash_password(payload.password)
    verified.department = payload.department.strip()
    verified.requested_role = requested_role
    verified.reason = (payload.reason or "").strip() or None
    verified.status = "pending"
    verified.otp_hash = None
    verified.otp_expires_at = None
    verified.otp_attempt_count = 0
    db.flush()

    admins = db.query(User).filter(User.role == "maintenance_admin", User.is_active == True).all()
    for admin in admins:
        db.add(Notification(
            user_id=admin.id,
            message=f"New access request {verified.request_id}: {verified.full_name} requested {requested_role.replace('_', ' ')} access.",
            is_read=False,
        ))
    db.commit()
    db.refresh(verified)
    send_access_request_received_email(verified.email, verified.full_name, verified.employee_id, requested_role)
    return {"message": "Access request submitted", "request": _access_request_out(verified)}


@router.post("/access-otp/send")
def send_access_otp(payload: AccessOtpSendRequest, db: Session = Depends(get_db)):
    employee_id = payload.employee_id.strip().upper()
    email = payload.email.strip().lower()
    mobile_number = _clean_mobile(payload.mobile_number)
    requested_role = _normalize_requested_role(payload.requested_role)

    if requested_role not in PUBLIC_REQUEST_ROLES:
        raise HTTPException(status_code=400, detail="Invalid requested role")
    if db.query(User).filter(User.employee_id == employee_id).first():
        raise HTTPException(status_code=400, detail="Employee ID already exists")
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    access_request = _find_access_draft(db, email, mobile_number)
    if not access_request:
        count = db.query(AccessRequest).count() + 1
        access_request = AccessRequest(
            request_id=f"AR-{datetime.utcnow().year}-{count:04d}",
            employee_id=employee_id,
            full_name=payload.full_name.strip(),
            email=email,
            mobile_number=mobile_number,
            hashed_password=hash_password(payload.password),
            department=payload.department.strip(),
            requested_role=requested_role,
            reason=(payload.reason or "").strip() or None,
            status="otp_pending",
        )
        db.add(access_request)

    otp = f"{secrets.randbelow(1_000_000):06d}"
    access_request.employee_id = employee_id
    access_request.full_name = payload.full_name.strip()
    access_request.email = email
    access_request.mobile_number = mobile_number
    access_request.hashed_password = hash_password(payload.password)
    access_request.department = payload.department.strip()
    access_request.requested_role = requested_role
    access_request.reason = (payload.reason or "").strip() or None
    access_request.otp_hash = hash_password(otp)
    access_request.otp_expires_at = datetime.utcnow() + timedelta(minutes=OTP_MINUTES)
    access_request.otp_verified_at = None
    access_request.otp_attempt_count = 0

    channel = payload.otp_channel if payload.otp_channel in ("mobile", "email") else "mobile"
    if channel == "email":
        if not is_email_configured():
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Email delivery is not configured on this server. Use mobile OTP instead.",
            )
        sent = send_access_otp_email(email, access_request.full_name, otp, OTP_MINUTES)
        if not sent:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Could not send OTP to the email address. Please try mobile OTP or contact admin.",
            )
        msg = "OTP sent to your email address."
    else:
        if not send_access_otp_sms(mobile_number, otp, OTP_MINUTES):
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Could not send OTP to the mobile number. Please contact admin.",
            )
        msg = "OTP sent to your mobile number."

    db.commit()
    return {
        "message": msg,
        "channel": channel,
        "expires_in_minutes": OTP_MINUTES,
        "request": _access_request_out(access_request),
    }


@router.post("/access-otp/verify")
def verify_access_otp(payload: AccessOtpVerifyRequest, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    mobile_number = _clean_mobile(payload.mobile_number)
    access_request = _find_access_draft(db, email, mobile_number)
    if not access_request or not access_request.otp_hash:
        raise HTTPException(status_code=400, detail="OTP request not found. Please send OTP again.")
    if not access_request.otp_expires_at or access_request.otp_expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP expired. Please send OTP again.")
    if int(access_request.otp_attempt_count or 0) >= OTP_MAX_ATTEMPTS:
        raise HTTPException(status_code=400, detail="Too many OTP attempts. Please send OTP again.")

    access_request.otp_attempt_count = int(access_request.otp_attempt_count or 0) + 1
    if not verify_password(payload.otp.strip(), access_request.otp_hash):
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid OTP")

    access_request.otp_verified_at = datetime.utcnow()
    db.commit()
    db.refresh(access_request)
    return {"message": "Mobile number verified", "request": _access_request_out(access_request)}


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == email, User.is_active == True).first()
    email_configured = is_email_configured()

    if user:
        reset_token = _create_reset_token(db, user)
        db.commit()
        send_password_reset_email(user.email, user.full_name, user.employee_id, reset_token, RESET_TOKEN_MINUTES)

    return {
        "message": (
            "If this email is registered, reset instructions have been sent."
            if email_configured
            else "Email delivery is not configured. Please contact admin."
        ),
        "expires_in_minutes": RESET_TOKEN_MINUTES,
        "delivery_configured": email_configured,
    }


@router.post("/forgot-username")
def forgot_username(payload: ForgotUsernameRequest, db: Session = Depends(get_db)):
    identifier = payload.identifier.strip()
    lookup = identifier.lower()
    user = (
        db.query(User)
        .filter(
            User.is_active == True,
            ((User.email == lookup) | (User.employee_id == identifier.upper())),
        )
        .first()
    )
    if not user:
        raise HTTPException(status_code=404, detail="No active account matched the provided details")
    return {
        "message": "Username found",
        "employee_id": user.employee_id,
        "full_name": user.full_name,
        "email": user.email,
    }


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    now = datetime.utcnow()
    reset_token = (
        db.query(PasswordResetToken)
        .filter(PasswordResetToken.token_hash == _reset_token_hash(payload.token))
        .first()
    )
    if not reset_token or reset_token.used_at or reset_token.expires_at < now:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user = db.query(User).filter(User.id == reset_token.user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or already used reset token")

    user.hashed_password = hash_password(payload.new_password)
    reset_token.used_at = now
    db.commit()
    return {"message": "Password reset successfully. Please log in again."}


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Logged out successfully"}


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return _user_out(current_user)


@router.get("/notifications")
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": str(n.id),
            "message": n.message,
            "is_read": n.is_read,
            "created_at": n.created_at,
        }
        for n in notifications
    ]


@router.put("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
        .first()
    )
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return {
        "id": str(notification.id),
        "message": notification.message,
        "is_read": notification.is_read,
        "created_at": notification.created_at,
    }
