from datetime import datetime, date, timedelta
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.auth.roles import RequireAnyRole, RequireDeptHead, get_current_user
from app.database import get_db
from app.models.master import Tool
from app.models.transaction import IssuanceLog, Requisition, User
from app.schemas.requisition import RejectPayload, RequisitionCreate
from app.services.audit import log_action
from app.services.calibration_status import is_calibration_blocked, sync_calibration_statuses
from app.services.notifications import (
    notify_requisition_approved,
    notify_requisition_raised,
    notify_requisition_rejected,
    notify_user,
)
from app.services.requisition_number import generate_requisition_number
from app.services.stock import get_pending_damage_by_tool
from app.services.tool_visibility import user_can_access_tool
from app.services.stock import (
    get_pending_damage_by_tool,
    get_period_open_issued_quantity,
    get_period_reserved_quantity,
)
from app.services.tool_visibility import user_can_access_tool

router = APIRouter(prefix="/requisitions", tags=["requisitions"])


def _overlapping_issue_quantity(db: Session, tool_id: UUID, from_date: date, to_date: date) -> int:
    return get_period_open_issued_quantity(db, tool_id, from_date, to_date)


def _period_availability(
    db: Session,
    tool: Tool,
    from_date: date,
    to_date: date,
    exclude_requisition_id: UUID | None = None,
) -> dict:
    overlapping = _overlapping_issue_quantity(db, tool.id, from_date, to_date)
    pending_damage = get_pending_damage_by_tool(db).get(tool.id, 0)
    reserved = get_period_reserved_quantity(db, tool.id, from_date, to_date, exclude_requisition_id)
    available = max(int(tool.total_quantity or 0) - overlapping - pending_damage - reserved, 0)
    return {
        "tool_id": str(tool.id),
        "total_quantity": int(tool.total_quantity or 0),
        "overlapping_issued_quantity": overlapping,
        "pending_damage_quantity": pending_damage,
        "reserved_quantity": reserved,
        "available_quantity": available,
        "available": available > 0,
    }


def _req_to_dict(req: Requisition, db: Session) -> dict:
    tool = db.query(Tool).filter(Tool.id == req.tool_id).first()
    requester = db.query(User).filter(User.id == req.requested_by).first()
    approver = db.query(User).filter(User.id == req.approved_by).first() if req.approved_by else None
    return {
        "id": str(req.id),
        "requisition_number": req.requisition_number,
        "tool_id": str(req.tool_id),
        "tool_name": tool.name if tool else None,
        "requested_by": str(req.requested_by),
        "requester_name": requester.full_name if requester else None,
        "requester_employee_id": requester.employee_id if requester else None,
        "requester_dept": req.requester_dept,
        "quantity_requested": req.quantity_requested,
        "purpose_of_job": req.purpose_of_job,
        "from_date": req.from_date,
        "to_date": req.to_date,
        "status": req.status,
        "approved_by": str(req.approved_by) if req.approved_by else None,
        "approver_name": approver.full_name if approver else None,
        "approved_at": req.approved_at,
        "rejection_reason": req.rejection_reason,
        "created_at": req.created_at,
    }


@router.post("", status_code=201)
def create_requisition(
    payload: RequisitionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sync_calibration_statuses(db)
    # 1. Validate tool
    tool = db.query(Tool).filter(Tool.id == payload.tool_id).first()
    if not tool:
        raise HTTPException(404, "Tool not found")
    if tool.status == "written_off":
        raise HTTPException(400, "Tool is written off and cannot be requisitioned")
    if tool.status == "calibration_due" or is_calibration_blocked(tool):
        raise HTTPException(400, "Tool is blocked: calibration overdue. Contact maintenance admin.")
    if tool.status in ("damaged", "blocked"):
        raise HTTPException(400, "Tool is currently marked as damaged")

    # 2. Validate department access
    if not user_can_access_tool(tool, current_user):
        raise HTTPException(403, "Your department does not have access to this tool")

    # 3. Check availability for the requested period. Current availability is not
    # used here because an open issuance may end before a future request begins.
    period = _period_availability(db, tool, payload.from_date, payload.to_date)
    if period["available_quantity"] < payload.quantity_requested:
        raise HTTPException(
            400,
            f"Tool is not available for the selected time period. Requested: {payload.quantity_requested}, Available after reservations: {period['available_quantity']}.",
        )

    # 4. Generate requisition number
    req_number = generate_requisition_number(db)

    # 5. Create requisition
    import uuid
    req = Requisition(
        id=uuid.uuid4(),
        requisition_number=req_number,
        tool_id=payload.tool_id,
        requested_by=current_user.id,
        requester_dept=current_user.department,
        quantity_requested=payload.quantity_requested,
        purpose_of_job=payload.purpose_of_job,
        from_date=payload.from_date,
        to_date=payload.to_date,
        status="pending",
    )
    db.add(req)
    db.flush()

    # 6. Notify dept_head
    dept_head = (
        db.query(User)
        .filter(
            User.department == current_user.department,
            User.role == "dept_head",
            User.is_active == True,
        )
        .first()
    )
    if dept_head:
        notify_requisition_raised(db, dept_head, req_number, tool.name, current_user.full_name)

    # 7. Audit log
    log_action(db, str(current_user.id), "REQUISITION_RAISED", "requisitions", str(req.id), {
        "requisition_number": req_number,
        "tool_id": str(tool.id),
        "tool_name": tool.name,
        "quantity_requested": payload.quantity_requested,
    })

    db.commit()
    db.refresh(req)
    return _req_to_dict(req, db)


@router.get("/availability/check")
def check_requisition_availability(
    tool_id: UUID,
    from_date: date,
    to_date: date,
    quantity: int = Query(1, ge=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(404, "Tool not found")
    if not user_can_access_tool(tool, current_user):
        raise HTTPException(403, "Your department does not have access to this tool")
    if from_date > to_date:
        raise HTTPException(400, "Required From date cannot be after Required To date")
    period = _period_availability(db, tool, from_date, to_date)
    period["requested_quantity"] = quantity
    period["request_available"] = period["available_quantity"] >= quantity
    period["message"] = (
        "Available for the selected time period."
        if period["request_available"]
        else "Tool is not available for the selected time period. Please choose a different time period."
    )
    return period


@router.get("")
def list_requisitions(
    status: Optional[str] = None,
    department: Optional[str] = None,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sync_calibration_statuses(db)
    query = db.query(Requisition)

    # Role-based filtering
    if current_user.role == "requester":
        query = query.filter(Requisition.requested_by == current_user.id)
    elif current_user.role == "dept_head":
        query = query.filter(Requisition.requester_dept == current_user.department)
    # maintenance_staff and maintenance_admin see all

    if status:
        query = query.filter(Requisition.status == status)
    if department:
        query = query.filter(Requisition.requester_dept == department)
    if from_date:
        query = query.filter(Requisition.created_at >= from_date)
    if to_date:
        query = query.filter(Requisition.created_at < to_date + timedelta(days=1))

    reqs = query.order_by(Requisition.created_at.desc()).all()
    return [_req_to_dict(r, db) for r in reqs]


@router.get("/{req_id}")
def get_requisition(
    req_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    req = db.query(Requisition).filter(Requisition.id == req_id).first()
    if not req:
        raise HTTPException(404, "Requisition not found")

    # Access control: requester can only see own; dept_head only own dept
    if current_user.role == "requester" and req.requested_by != current_user.id:
        raise HTTPException(403, "Access denied")
    if current_user.role == "dept_head" and req.requester_dept != current_user.department:
        raise HTTPException(403, "Access denied")

    return _req_to_dict(req, db)


@router.put("/{req_id}/approve")
def approve_requisition(
    req_id: UUID,
    current_user: User = Depends(RequireDeptHead),
    db: Session = Depends(get_db),
):
    req = db.query(Requisition).filter(Requisition.id == req_id).first()
    if not req:
        raise HTTPException(404, "Requisition not found")

    # Check 1: must be pending
    if req.status != "pending":
        raise HTTPException(400, f"Cannot approve requisition with status '{req.status}'")

    # Check 2: cannot approve own request
    if req.requested_by == current_user.id:
        raise HTTPException(403, "Cannot approve your own requisition")

    # Check 3: dept_head can only approve their department's requisitions
    if current_user.role == "dept_head" and req.requester_dept != current_user.department:
        raise HTTPException(403, "Cannot approve requisitions from a different department")

    if req.from_date < date.today():
        raise HTTPException(400, "Cannot approve a requisition whose from date is in the past")
    if req.to_date < req.from_date:
        raise HTTPException(400, "Cannot approve a requisition with an invalid date range")

    tool = db.query(Tool).filter(Tool.id == req.tool_id).first()
    if not tool:
        raise HTTPException(404, "Tool not found")
    period = _period_availability(db, tool, req.from_date, req.to_date, exclude_requisition_id=req.id)
    if period["available_quantity"] < req.quantity_requested:
        raise HTTPException(
            400,
            f"Insufficient stock after existing issues and approved reservations. Requested: {req.quantity_requested}, Available: {period['available_quantity']}.",
        )

    req.status = "approved"
    req.approved_by = current_user.id
    req.approved_at = datetime.utcnow()

    requester = db.query(User).filter(User.id == req.requested_by).first()
    if requester and tool:
        notify_requisition_approved(db, requester, req.requisition_number, tool.name)
        # Notify maintenance staff so they know to prepare for issuance (spec.md §6)
        maint_staff = (
            db.query(User)
            .filter(
                User.role.in_(["maintenance_staff", "maintenance_admin"]),
                User.is_active == True,
            )
            .all()
        )
        for staff in maint_staff:
            notify_user(db, str(staff.id),
                f"Requisition {req.requisition_number} approved: '{tool.name}' requested by "
                f"{requester.full_name} ({req.requester_dept}) is ready to be issued.")

    log_action(db, str(current_user.id), "REQUISITION_APPROVED", "requisitions", str(req.id), {
        "requisition_number": req.requisition_number,
        "approved_by": current_user.full_name,
    })

    db.commit()
    db.refresh(req)
    return _req_to_dict(req, db)


@router.put("/{req_id}/reject")
def reject_requisition(
    req_id: UUID,
    payload: RejectPayload,
    current_user: User = Depends(RequireDeptHead),
    db: Session = Depends(get_db),
):
    req = db.query(Requisition).filter(Requisition.id == req_id).first()
    if not req:
        raise HTTPException(404, "Requisition not found")

    if req.status != "pending":
        raise HTTPException(400, f"Cannot reject requisition with status '{req.status}'")

    if current_user.role == "dept_head" and req.requester_dept != current_user.department:
        raise HTTPException(403, "Cannot reject requisitions from a different department")

    req.status = "rejected"
    req.rejection_reason = payload.reason

    requester = db.query(User).filter(User.id == req.requested_by).first()
    tool = db.query(Tool).filter(Tool.id == req.tool_id).first()
    if requester and tool:
        notify_requisition_rejected(db, requester, req.requisition_number, tool.name, payload.reason)

    log_action(db, str(current_user.id), "REQUISITION_REJECTED", "requisitions", str(req.id), {
        "requisition_number": req.requisition_number,
        "reason": payload.reason,
    })

    db.commit()
    db.refresh(req)
    return _req_to_dict(req, db)


@router.put("/{req_id}/cancel")
def cancel_requisition(
    req_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    req = db.query(Requisition).filter(Requisition.id == req_id).first()
    if not req:
        raise HTTPException(404, "Requisition not found")

    # Only the requester can cancel their own requisition (or admin)
    if current_user.role not in ("maintenance_admin",) and req.requested_by != current_user.id:
        raise HTTPException(403, "Can only cancel your own requisition")

    if req.status != "pending":
        raise HTTPException(400, f"Cannot cancel requisition with status '{req.status}'")

    req.status = "cancelled"

    log_action(db, str(current_user.id), "REQUISITION_CANCELLED", "requisitions", str(req.id), {
        "requisition_number": req.requisition_number,
    })

    db.commit()
    db.refresh(req)
    return _req_to_dict(req, db)
