from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.transaction import User
from app.auth.roles import RequireAdmin, get_current_user, hash_password

router = APIRouter(prefix="/users", tags=["users"])

VALID_ROLES = {"requester", "dept_head", "maintenance_staff", "maintenance_admin"}


class UserCreate(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    password: str
    role: str
    department: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    department: Optional[str] = None
    is_active: Optional[bool] = None


def _user_out(u: User) -> dict:
    return {
        "id": str(u.id),
        "employee_id": u.employee_id,
        "full_name": u.full_name,
        "email": u.email,
        "role": u.role,
        "department": u.department,
        "is_active": u.is_active,
        "created_at": u.created_at,
    }


@router.get("")
def list_users(
    current_user: User = Depends(RequireAdmin),
    db: Session = Depends(get_db),
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [_user_out(u) for u in users]


@router.post("", status_code=201)
def create_user(
    payload: UserCreate,
    current_user: User = Depends(RequireAdmin),
    db: Session = Depends(get_db),
):
    if payload.role not in VALID_ROLES:
        raise HTTPException(400, f"Invalid role. Must be one of: {', '.join(sorted(VALID_ROLES))}")

    if db.query(User).filter(User.employee_id == payload.employee_id).first():
        raise HTTPException(400, f"Employee ID '{payload.employee_id}' already exists")

    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(400, f"Email '{payload.email}' already registered")

    new_user = User(
        employee_id=payload.employee_id.strip().upper(),
        full_name=payload.full_name.strip(),
        email=payload.email.strip().lower(),
        hashed_password=hash_password(payload.password),
        role=payload.role,
        department=payload.department.strip(),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return _user_out(new_user)


@router.put("/{user_id}/toggle-active")
def toggle_user_active(
    user_id: str,
    current_user: User = Depends(RequireAdmin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    if str(user.id) == str(current_user.id):
        raise HTTPException(400, "Cannot deactivate your own account")
    user.is_active = not user.is_active
    db.commit()
    return _user_out(user)
