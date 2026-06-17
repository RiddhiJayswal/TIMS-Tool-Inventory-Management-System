from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.roles import RequireAdmin
from app.database import get_db
from app.models.master import Tool
from app.models.transaction import IssuanceLog, Requisition, User
from app.schemas.damage import DamageAssessment, WriteOffPayload
from app.services.audit import log_action
from app.services.depreciation import calculate_penalty
from app.services.stock import consume_stock, restore_stock

router = APIRouter(prefix="/damage", tags=["damage"])


# IMPORTANT: /writeoff/{tool_id} must be defined BEFORE /{issuance_id}
# to prevent FastAPI from trying to match "writeoff" as an issuance UUID.
@router.post("/writeoff/{tool_id}")
def manual_writeoff(
    tool_id: UUID,
    payload: WriteOffPayload,
    current_user: User = Depends(RequireAdmin),
    db: Session = Depends(get_db),
):
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(404, "Tool not found")

    if payload.quantity > tool.total_quantity:
        raise HTTPException(
            400,
            f"Cannot write off {payload.quantity} unit(s); only {tool.total_quantity} exist",
        )

    open_issuances = (
        db.query(IssuanceLog)
        .filter(IssuanceLog.tool_id == tool.id, IssuanceLog.actual_return_date == None)
        .count()
    )
    if open_issuances > 0:
        raise HTTPException(
            400, f"Cannot write off tool with {open_issuances} open issuance(s) — ensure all are returned first"
        )

    tool.total_quantity -= payload.quantity
    tool.available_quantity = max(0, tool.available_quantity - payload.quantity)

    if tool.total_quantity <= 0:
        tool.status = "written_off"

    log_action(
        db,
        str(current_user.id),
        "TOOL_WRITTEN_OFF",
        "tools",
        str(tool.id),
        {
            "reason": payload.reason,
            "quantity_written_off": payload.quantity,
            "remaining_quantity": tool.total_quantity,
        },
    )

    db.commit()
    db.refresh(tool)

    return {
        "id": str(tool.id),
        "tool_code": tool.tool_code,
        "name": tool.name,
        "total_quantity": tool.total_quantity,
        "available_quantity": tool.available_quantity,
        "status": tool.status,
        "message": f"Written off {payload.quantity} unit(s). Reason: {payload.reason}",
    }


@router.post("/{issuance_id}")
def record_damage(
    issuance_id: UUID,
    payload: DamageAssessment,
    current_user: User = Depends(RequireAdmin),
    db: Session = Depends(get_db),
):
    log = db.query(IssuanceLog).filter(IssuanceLog.id == issuance_id).first()
    if not log:
        raise HTTPException(404, "Issuance log not found")

    # Must have been returned in a damaged or missing state
    if log.return_condition not in ("damaged", "missing"):
        raise HTTPException(
            400,
            f"Damage can only be recorded for issuances returned as 'damaged' or 'missing'. "
            f"Current return_condition: '{log.return_condition}'",
        )

    # Prevent overwriting an existing damage assessment
    if log.damage_type is not None:
        raise HTTPException(
            400, f"Damage already recorded as '{log.damage_type}' for this issuance"
        )

    # Calculate penalty
    try:
        penalty = calculate_penalty(
            payload.damage_type,
            log.depreciated_value_at_issue,
            payload.market_rate_at_damage,
        )
    except ValueError as exc:
        raise HTTPException(400, str(exc))

    # Update issuance log
    log.damage_type = payload.damage_type
    log.penalty_amount = penalty
    if payload.market_rate_at_damage is not None:
        log.market_rate_at_damage = Decimal(str(payload.market_rate_at_damage))
    if payload.notes:
        log.notes = payload.notes

    # Damage assessment closes the inventory impact.
    # Wear and tear releases returned units back to available stock; true damaged/missing
    # assessments permanently remove the affected units from total stock.
    tool = db.query(Tool).filter(Tool.id == log.tool_id).first()
    if tool:
        affected_quantity = (
            log.quantity_issued
            if log.return_condition == "missing"
            else (log.quantity_returned or log.quantity_issued)
        )
        if payload.damage_type == "wear_and_tear":
            restore_stock(db, str(tool.id), affected_quantity)
        else:
            consume_stock(db, str(tool.id), affected_quantity)

    # Requisition for borrower name and department
    req = db.query(Requisition).filter(Requisition.id == log.requisition_id).first()
    borrower = db.query(User).filter(User.id == log.issued_to).first()

    log_action(
        db,
        str(current_user.id),
        "DAMAGE_RECORDED",
        "issuance_logs",
        str(log.id),
        {
            "damage_type": payload.damage_type,
            "penalty_amount": float(penalty),
            "tool_id": str(log.tool_id),
            "tool_name": tool.name if tool else None,
        },
    )

    db.commit()
    db.refresh(log)

    return {
        "issuance_id": str(log.id),
        "requisition_number": req.requisition_number if req else None,
        "tool_name": tool.name if tool else None,
        "borrower_name": borrower.full_name if borrower else None,
        "borrower_dept": borrower.department if borrower else None,
        "damage_type": log.damage_type,
        "penalty_amount": float(log.penalty_amount) if log.penalty_amount else 0.0,
        "depreciated_value_at_issue": (
            float(log.depreciated_value_at_issue) if log.depreciated_value_at_issue else None
        ),
        "notes": log.notes,
        "tool_status": tool.status if tool else None,
        "tool_total_quantity": tool.total_quantity if tool else None,
    }
