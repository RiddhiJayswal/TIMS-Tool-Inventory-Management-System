import uuid
from datetime import date
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.roles import RequireMaintenance, get_current_user
from app.database import get_db
from app.models.master import Tool
from app.models.transaction import IssuanceLog, Requisition, User
from app.schemas.issuance import IssuanceCreate
from app.services.audit import log_action
from app.services.calibration_status import is_calibration_blocked, sync_calibration_statuses
from app.services.depreciation import snapshot_value_at_issuance
from app.services.notifications import notify_tool_issued
from app.services.stock import get_tool_locked, reduce_stock

router = APIRouter(prefix="/issuance", tags=["issuance"])


def _issuance_to_dict(log: IssuanceLog, db: Session) -> dict:
    tool = db.query(Tool).filter(Tool.id == log.tool_id).first()
    borrower = db.query(User).filter(User.id == log.issued_to).first()
    issuer = db.query(User).filter(User.id == log.issued_by).first()

    days_overdue = None
    if not log.actual_return_date:
        today = date.today()
        days_overdue = max(0, (today - log.expected_return_date).days)

    return {
        "id": str(log.id),
        "requisition_id": str(log.requisition_id),
        "tool_id": str(log.tool_id),
        "tool_name": tool.name if tool else None,
        "issued_to": str(log.issued_to),
        "borrower_name": borrower.full_name if borrower else None,
        "borrower_dept": borrower.department if borrower else None,
        "issued_by": str(log.issued_by),
        "issuer_name": issuer.full_name if issuer else None,
        "quantity_issued": log.quantity_issued,
        "issued_at": log.issued_at,
        "expected_return_date": log.expected_return_date,
        "actual_return_date": log.actual_return_date,
        "return_condition": log.return_condition,
        "quantity_returned": log.quantity_returned,
        "quantity_consumed": log.quantity_consumed,
        "damage_type": log.damage_type,
        "penalty_amount": float(log.penalty_amount) if log.penalty_amount else None,
        "depreciated_value_at_issue": (
            float(log.depreciated_value_at_issue) if log.depreciated_value_at_issue else None
        ),
        "days_overdue": days_overdue,
        "notes": log.notes,
        "created_at": log.created_at,
    }


@router.post("", status_code=201)
def issue_tool(
    payload: IssuanceCreate,
    current_user: User = Depends(RequireMaintenance),
    db: Session = Depends(get_db),
):
    sync_calibration_statuses(db)
    try:
        # Check 1: Requisition exists and is approved
        # Lock the requisition first so two workers cannot issue the same approved
        # request. The tool row is locked immediately afterwards for stock safety.
        req = (
            db.query(Requisition)
            .filter(Requisition.id == payload.requisition_id)
            .with_for_update()
            .first()
        )
        if not req:
            raise HTTPException(404, "Requisition not found")
        if req.status != "approved":
            raise HTTPException(400, f"Requisition status is '{req.status}'; only 'approved' can be issued")

        # Fetch tool with row lock
        tool = get_tool_locked(db, str(req.tool_id))

        # Check 2: Calibration block
        if tool.status == "calibration_due" or is_calibration_blocked(tool):
            raise HTTPException(
                400, "Tool blocked: calibration overdue. Contact maintenance admin."
            )

        # Check 3: Tool not written off or damaged
        if tool.status in ("written_off", "damaged", "blocked"):
            raise HTTPException(400, f"Tool is not available (status: {tool.status})")

        # Check 4: Stock availability (clear message before reduce_stock also validates)
        if tool.available_quantity < req.quantity_requested:
            raise HTTPException(
                400,
                f"Insufficient stock. Requested: {req.quantity_requested}, Available: {tool.available_quantity}",
            )

        # Snapshot depreciation at time of issuance
        snapshot = snapshot_value_at_issuance(
            float(tool.purchase_price) if tool.purchase_price else None,
            tool.purchase_date,
            tool.standard_life_months,
        )

        # Reduce stock (SELECT FOR UPDATE already held)
        reduce_stock(db, str(tool.id), req.quantity_requested)

        # Create issuance log
        log = IssuanceLog(
            id=uuid.uuid4(),
            requisition_id=req.id,
            tool_id=tool.id,
            issued_to=req.requested_by,
            issued_by=current_user.id,
            quantity_issued=req.quantity_requested,
            expected_return_date=req.to_date,
            depreciated_value_at_issue=snapshot,
            notes=payload.notes,
        )
        db.add(log)
        db.flush()

        # Update requisition status
        req.status = "issued"

        # Notify requester
        requester = db.query(User).filter(User.id == req.requested_by).first()
        if requester:
            notify_tool_issued(db, requester, tool.name, req.to_date)

        # Audit log
        log_action(db, str(current_user.id), "TOOL_ISSUED", "issuance_logs", str(log.id), {
            "tool_id": str(tool.id),
            "tool_name": tool.name,
            "issued_to": str(req.requested_by),
            "quantity": req.quantity_requested,
        })

        db.commit()
        db.refresh(log)
        return _issuance_to_dict(log, db)

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Issuance failed: {str(e)}")


@router.get("/overdue")
def get_overdue_issuances(
    current_user: User = Depends(RequireMaintenance),
    db: Session = Depends(get_db),
):
    sync_calibration_statuses(db)
    today = date.today()
    logs = (
        db.query(IssuanceLog)
        .filter(
            IssuanceLog.actual_return_date == None,
            IssuanceLog.expected_return_date < today,
        )
        .all()
    )
    return [_issuance_to_dict(log, db) for log in logs]


@router.get("")
def list_issuances(
    status: Optional[str] = None,
    tool_id: Optional[UUID] = None,
    issued_to: Optional[UUID] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sync_calibration_statuses(db)
    query = db.query(IssuanceLog)

    if current_user.role == "requester":
        query = query.filter(IssuanceLog.issued_to == current_user.id)
    elif current_user.role == "dept_head":
        query = query.join(User, IssuanceLog.issued_to == User.id).filter(
            User.department == current_user.department
        )

    if status == "open":
        query = query.filter(IssuanceLog.actual_return_date == None)
    elif status == "closed":
        query = query.filter(IssuanceLog.actual_return_date != None)

    if tool_id:
        query = query.filter(IssuanceLog.tool_id == tool_id)
    if issued_to:
        query = query.filter(IssuanceLog.issued_to == issued_to)

    logs = query.order_by(IssuanceLog.issued_at.desc()).all()
    return [_issuance_to_dict(log, db) for log in logs]


@router.get("/{issuance_id}")
def get_issuance(
    issuance_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    log = db.query(IssuanceLog).filter(IssuanceLog.id == issuance_id).first()
    if not log:
        raise HTTPException(404, "Issuance log not found")

    # Access: maintenance roles or the borrower
    if current_user.role not in ("maintenance_admin", "maintenance_staff"):
        if log.issued_to != current_user.id:
            raise HTTPException(403, "Access denied")

    return _issuance_to_dict(log, db)
