from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.auth.roles import get_current_user
from app.database import get_db
from app.models.master import Tool
from app.models.transaction import IssuanceLog, Requisition, User
from app.routers.issuance import _issuance_to_dict

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()
    warn_threshold = today + timedelta(days=7)

    # Counts common to all roles
    non_written_off = db.query(Tool).filter(Tool.status != "written_off").all()
    total_tools = len(non_written_off)
    available_tools = sum(t.available_quantity for t in non_written_off)
    tools_issued = sum(t.total_quantity - t.available_quantity for t in non_written_off)

    overdue_count = db.query(IssuanceLog).filter(
        IssuanceLog.actual_return_date == None,
        IssuanceLog.expected_return_date < today,
    ).count()

    calibration_due_count = db.query(Tool).filter(
        Tool.requires_calibration == True,
        or_(
            Tool.status == "calibration_due",
            and_(
                Tool.next_calibration_due != None,
                Tool.next_calibration_due <= warn_threshold,
            ),
        ),
    ).count()

    summary = {
        "total_tools": total_tools,
        "available_tools": available_tools,
        "tools_issued": tools_issued,
        "overdue_count": overdue_count,
        "calibration_due_count": calibration_due_count,
    }

    # Every role sees their own active issuances and pending request count
    my_open_logs = db.query(IssuanceLog).filter(
        IssuanceLog.issued_to == current_user.id,
        IssuanceLog.actual_return_date == None,
    ).all()
    summary["my_active_issuances"] = [_issuance_to_dict(log, db) for log in my_open_logs]

    summary["my_pending_requests"] = db.query(Requisition).filter(
        Requisition.requested_by == current_user.id,
        Requisition.status == "pending",
    ).count()

    # dept_head sees pending approvals for their department
    if current_user.role == "dept_head":
        summary["pending_approvals_count"] = db.query(Requisition).filter(
            Requisition.requester_dept == current_user.department,
            Requisition.status == "pending",
        ).count()

    # Maintenance roles see the issuance queue and low-stock alerts
    if current_user.role in ("maintenance_staff", "maintenance_admin"):
        summary["approved_queue_count"] = db.query(Requisition).filter(
            Requisition.status == "approved",
        ).count()

        low_stock = db.query(Tool).filter(
            Tool.status == "active",
            Tool.available_quantity <= 1,
        ).all()
        summary["low_stock_tools"] = [
            {
                "tool_code": t.tool_code,
                "name": t.name,
                "available_quantity": t.available_quantity,
                "total_quantity": t.total_quantity,
            }
            for t in low_stock
        ]

    return summary


@router.get("/my-issuances")
def get_my_issuances(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    logs = (
        db.query(IssuanceLog)
        .filter(
            IssuanceLog.issued_to == current_user.id,
            IssuanceLog.actual_return_date == None,
        )
        .order_by(IssuanceLog.expected_return_date.asc())
        .all()
    )
    return [_issuance_to_dict(log, db) for log in logs]
