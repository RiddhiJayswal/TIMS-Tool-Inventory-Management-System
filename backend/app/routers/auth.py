from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr, Field, field_validator
from sqlalchemy.orm import Session
from uuid import UUID

from app.database import get_db
from app.models.transaction import User, Notification
from app.auth.roles import verify_password, create_access_token, get_current_user, hash_password
from app.config import settings
from app.services.email import send_password_reset_email

router = APIRouter(prefix="/auth", tags=["auth"])

RESET_TOKEN_MINUTES = 15


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
    password: str = Field(min_length=8, max_length=128)
    department: str = Field(min_length=2, max_length=100)

    @field_validator("password")
    @classmethod
    def strong_password(cls, value: str) -> str:
        return _validate_password(value)


class ForgotPasswordRequest(BaseModel):
    employee_id: str = Field(min_length=3, max_length=50)
    email: EmailStr


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


def _create_reset_token(user: User) -> str:
    payload = {
        "sub": user.employee_id,
        "typ": "password_reset",
        "pwd": user.hashed_password,
        "exp": datetime.utcnow() + timedelta(minutes=RESET_TOKEN_MINUTES),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.employee_id == form_data.username).first()
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

    if db.query(User).filter(User.employee_id == employee_id).first():
        raise HTTPException(status_code=400, detail="Employee ID already exists")
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        employee_id=employee_id,
        full_name=payload.full_name.strip(),
        email=email,
        hashed_password=hash_password(payload.password),
        role="requester",
        department=payload.department.strip(),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _user_out(user)


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    employee_id = payload.employee_id.strip().upper()
    email = payload.email.strip().lower()
    user = (
        db.query(User)
        .filter(User.employee_id == employee_id, User.email == email, User.is_active == True)
        .first()
    )

    if user:
        reset_token = _create_reset_token(user)
        send_password_reset_email(user.email, user.full_name, reset_token, RESET_TOKEN_MINUTES)

    return {
        "message": "If the employee ID and email match an active account, reset instructions have been sent to the registered email.",
        "expires_in_minutes": RESET_TOKEN_MINUTES,
    }


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        token_data = jwt.decode(payload.token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    if token_data.get("typ") != "password_reset":
        raise HTTPException(status_code=400, detail="Invalid reset token")

    employee_id = token_data.get("sub")
    user = db.query(User).filter(User.employee_id == employee_id, User.is_active == True).first()
    if not user or token_data.get("pwd") != user.hashed_password:
        raise HTTPException(status_code=400, detail="Invalid or already used reset token")

    user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password reset successfully"}


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
