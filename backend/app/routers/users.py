from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.transaction import AccessRequest, Notification, User
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


class AccessDecision(BaseModel):
    reason: Optional[str] = None


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


def _access_request_out(req: AccessRequest) -> dict:
    return {
        "id": str(req.id),
        "requestId": req.request_id,
        "request_id": req.request_id,
        "name": req.full_name,
        "full_name": req.full_name,
        "email": req.email,
        "username": req.email,
        "employeeId": req.employee_id,
        "employee_id": req.employee_id,
        "department": req.department,
        "requestedRole": req.requested_role,
        "requested_role": req.requested_role,
        "role": req.requested_role,
        "reason": req.reason,
        "notes": req.reason,
        "status": req.status,
        "createdAt": req.created_at,
        "created_at": req.created_at,
        "approvedBy": str(req.approved_by) if req.approved_by else None,
        "approved_by": str(req.approved_by) if req.approved_by else None,
        "approvedAt": req.approved_at,
        "approved_at": req.approved_at,
        "rejection_reason": req.rejection_reason,
    }


def _find_access_request(db: Session, request_id: str) -> AccessRequest | None:
    try:
        parsed = UUID(request_id)
    except ValueError:
        parsed = None
    query = db.query(AccessRequest)
    if parsed:
        return query.filter(AccessRequest.id == parsed).first()
    return query.filter(AccessRequest.request_id == request_id).first()


def _active_admin_count(db: Session) -> int:
    return db.query(User).filter(
        User.role == "maintenance_admin",
        User.is_active == True,
    ).count()


def _ensure_not_last_active_admin(db: Session, user: User, update_data: dict) -> None:
    would_stop_being_admin = (
        user.role == "maintenance_admin"
        and user.is_active
        and (
            update_data.get("is_active") is False
            or ("role" in update_data and update_data["role"] != "maintenance_admin")
        )
    )
    if would_stop_being_admin and _active_admin_count(db) <= 1:
        raise HTTPException(400, "At least one active administrator must remain.")


@router.get("")
def list_users(
    current_user: User = Depends(RequireAdmin),
    db: Session = Depends(get_db),
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [_user_out(u) for u in users]


@router.get("/access-requests")
def list_access_requests(
    current_user: User = Depends(RequireAdmin),
    db: Session = Depends(get_db),
):
    requests = db.query(AccessRequest).order_by(AccessRequest.created_at.desc()).all()
    return [_access_request_out(r) for r in requests]


@router.put("/access-requests/{request_id}/approve")
def approve_access_request(
    request_id: str,
    current_user: User = Depends(RequireAdmin),
    db: Session = Depends(get_db),
):
    req = _find_access_request(db, request_id)
    if not req:
        raise HTTPException(404, "Access request not found")
    if req.status != "pending":
        raise HTTPException(400, f"Access request is already {req.status}")
    if req.requested_role not in VALID_ROLES:
        raise HTTPException(400, "Invalid requested role")

    employee_id = (req.employee_id or "").strip().upper()
    if not employee_id:
        raise HTTPException(400, "Employee ID is required before approval")

    existing = (
        db.query(User)
        .filter((User.employee_id == employee_id) | (User.email == req.email.strip().lower()))
        .first()
    )
    if existing:
        raise HTTPException(
            400,
            "Cannot approve access request because a user with this email or employee ID already exists.",
        )

    user = User(
        employee_id=employee_id,
        full_name=req.full_name.strip(),
        email=req.email.strip().lower(),
        hashed_password=req.hashed_password,
        role=req.requested_role,
        department=req.department.strip(),
        is_active=True,
    )
    db.add(user)
    db.flush()

    req.status = "approved"
    req.approved_by = current_user.id
    req.approved_at = datetime.utcnow()
    db.add(Notification(
        user_id=current_user.id,
        message=f"Access request {req.request_id} approved: {req.full_name} is now active as {req.requested_role.replace('_', ' ')}.",
        is_read=False,
    ))
    db.add(Notification(
        user_id=user.id,
        message=f"Access approved: Your TIMS account {user.employee_id} is active.",
        is_read=False,
    ))
    db.commit()
    db.refresh(req)
    db.refresh(user)
    return {"request": _access_request_out(req), "user": _user_out(user)}


@router.put("/access-requests/{request_id}/reject")
def reject_access_request(
    request_id: str,
    payload: AccessDecision,
    current_user: User = Depends(RequireAdmin),
    db: Session = Depends(get_db),
):
    req = _find_access_request(db, request_id)
    if not req:
        raise HTTPException(404, "Access request not found")
    if req.status != "pending":
        raise HTTPException(400, f"Access request is already {req.status}")
    reason = (payload.reason or "").strip()
    if not reason:
        raise HTTPException(400, "Rejection reason is required")
    req.status = "rejected"
    req.rejection_reason = reason
    req.approved_by = current_user.id
    req.approved_at = datetime.utcnow()
    db.add(Notification(
        user_id=current_user.id,
        message=f"Access request {req.request_id} rejected: {req.full_name}. Reason: {reason}",
        is_read=False,
    ))
    db.commit()
    db.refresh(req)
    return _access_request_out(req)


@router.post("", status_code=201)
def create_user(
    payload: UserCreate,
    current_user: User = Depends(RequireAdmin),
    db: Session = Depends(get_db),
):
    if payload.role not in VALID_ROLES:
        raise HTTPException(400, f"Invalid role. Must be one of: {', '.join(sorted(VALID_ROLES))}")

    employee_id = payload.employee_id.strip().upper()
    email = payload.email.strip().lower()

    if db.query(User).filter(User.employee_id == employee_id).first():
        raise HTTPException(400, f"Employee ID '{employee_id}' already exists")

    if db.query(User).filter(User.email == email).first():
        raise HTTPException(400, f"Email '{email}' already registered")

    new_user = User(
        employee_id=employee_id,
        full_name=payload.full_name.strip(),
        email=email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
        department=payload.department.strip(),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return _user_out(new_user)


@router.put("/{user_id}")
def update_user(
    user_id: str,
    payload: UserUpdate,
    current_user: User = Depends(RequireAdmin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    update_data = payload.model_dump(exclude_unset=True)
    if "role" in update_data and update_data["role"] not in VALID_ROLES:
        raise HTTPException(400, f"Invalid role. Must be one of: {', '.join(sorted(VALID_ROLES))}")
    if update_data.get("is_active") is False and str(user.id) == str(current_user.id):
        raise HTTPException(400, "Cannot deactivate your own account")
    _ensure_not_last_active_admin(db, user, update_data)
    if "email" in update_data:
        existing = db.query(User).filter(User.email == str(update_data["email"]).strip().lower()).first()
        if existing and existing.id != user.id:
            raise HTTPException(400, f"Email '{update_data['email']}' already registered")

    for field, value in update_data.items():
        if field == "email" and value:
            value = str(value).strip().lower()
        elif field in ("full_name", "department") and value:
            value = value.strip()
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return _user_out(user)


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
    if user.is_active:
        _ensure_not_last_active_admin(db, user, {"is_active": False})
    user.is_active = not user.is_active
    db.commit()
    return _user_out(user)
