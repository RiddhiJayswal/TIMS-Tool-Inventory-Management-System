from datetime import date, timedelta
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.roles import RequireAdmin, RequireMaintenance
from app.database import get_db
from app.models.master import Tool
from app.models.transaction import AuditLog, User
from app.schemas.calibration import CalibrationRecord
from app.services.audit import log_action
from app.services.calibration_status import sync_calibration_statuses

router = APIRouter(prefix="/calibration", tags=["calibration"])


def _calibration_status(tool: Tool, today: date) -> str:
    if not tool.next_calibration_due:
        return "not_scheduled"
    days = (tool.next_calibration_due - today).days
    if days <= 0:
        return "overdue"
    if days <= 7:
        return "due_soon"
    return "ok"


def _tool_cal_dict(tool: Tool, today: date) -> dict:
    cal_status = _calibration_status(tool, today)
    days_until_due = (
        (tool.next_calibration_due - today).days if tool.next_calibration_due else None
    )
    return {
        "id": str(tool.id),
        "tool_code": tool.tool_code,
        "name": tool.name,
        "calibration_freq_days": tool.calibration_freq_days,
        "last_calibration_date": tool.last_calibration_date,
        "next_calibration_due": tool.next_calibration_due,
        "days_until_due": days_until_due,
        "calibration_status": cal_status,
        "service_partner": tool.service_partner,
        "tool_status": tool.status,
    }


@router.get("")
def list_calibration_tools(
    status: Optional[str] = None,
    days: int = 30,
    current_user: User = Depends(RequireMaintenance),
    db: Session = Depends(get_db),
):
    sync_calibration_statuses(db)
    today = date.today()
    tools = db.query(Tool).filter(Tool.requires_calibration == True).all()

    result = []
    for tool in tools:
        cal_status = _calibration_status(tool, today)
        days_until_due = (
            (tool.next_calibration_due - today).days if tool.next_calibration_due else None
        )

        # Apply status filter when provided
        if status and cal_status != status:
            continue

        # When no status filter, only include tools due within `days` window (overdue always included)
        if not status and days_until_due is not None and days_until_due > days:
            continue

        result.append(_tool_cal_dict(tool, today))

    return result


@router.post("/{tool_id}")
def record_calibration(
    tool_id: UUID,
    payload: CalibrationRecord,
    current_user: User = Depends(RequireAdmin),
    db: Session = Depends(get_db),
):
    sync_calibration_statuses(db)
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(404, "Tool not found")
    if not tool.requires_calibration:
        raise HTTPException(400, f"Tool '{tool.name}' does not require calibration")
    if not tool.calibration_freq_days:
        raise HTTPException(
            400,
            f"Tool '{tool.name}' has no calibration_freq_days set — update the tool record first",
        )

    tool.last_calibration_date = payload.calibration_date
    tool.next_calibration_due = payload.calibration_date + timedelta(days=tool.calibration_freq_days)

    # Restore to active if it was blocked for calibration
    if tool.status == "calibration_due":
        tool.status = "active"

    if payload.service_partner:
        tool.service_partner = payload.service_partner

    log_action(
        db,
        str(current_user.id),
        "CALIBRATION_RECORDED",
        "tools",
        str(tool.id),
        {
            "calibration_date": str(payload.calibration_date),
            "next_calibration_due": str(tool.next_calibration_due),
            "service_partner": payload.service_partner or tool.service_partner,
            "notes": payload.notes,
        },
    )

    db.commit()
    db.refresh(tool)

    today = date.today()
    return {
        **_tool_cal_dict(tool, today),
        "message": f"Calibration recorded. Next due: {tool.next_calibration_due}",
    }


@router.get("/{tool_id}/history")
def get_calibration_history(
    tool_id: UUID,
    current_user: User = Depends(RequireMaintenance),
    db: Session = Depends(get_db),
):
    sync_calibration_statuses(db)
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(404, "Tool not found")

    history = (
        db.query(AuditLog)
        .filter(
            AuditLog.entity == "tools",
            AuditLog.entity_id == tool_id,
            AuditLog.action == "CALIBRATION_RECORDED",
        )
        .order_by(AuditLog.timestamp.desc())
        .all()
    )

    return {
        "tool_id": str(tool.id),
        "tool_code": tool.tool_code,
        "name": tool.name,
        "calibration_history": [
            {
                "id": str(h.id),
                "details": h.details,
                "performed_by": str(h.user_id) if h.user_id else None,
                "timestamp": h.timestamp,
            }
            for h in history
        ],
    }
