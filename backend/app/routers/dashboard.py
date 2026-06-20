from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.auth.roles import get_current_user
from app.database import get_db
from app.models.master import Tool
from app.models.transaction import IssuanceLog, Requisition, User
from app.routers.issuance import _issuance_to_dict
from app.services.calibration_status import sync_calibration_statuses
from app.services.stock import get_stock_summary, get_tool_stock_snapshot

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sync_calibration_statuses(db)
    today = date.today()
    warn_threshold = today + timedelta(days=7)

    # Counts common to all roles. Keep units and catalogue rows separate.
    stock = get_stock_summary(db)

    role = current_user.role
    dept = current_user.department

    req_scope = db.query(Requisition)
    issuance_scope = db.query(IssuanceLog)
    tool_scope = db.query(Tool)

    if role == "requester":
        req_scope = req_scope.filter(Requisition.requested_by == current_user.id)
        issuance_scope = issuance_scope.filter(IssuanceLog.issued_to == current_user.id)
        tool_scope = tool_scope.filter(
            or_(Tool.department_access == None, Tool.department_access == dept)
        )
    elif role == "dept_head":
        req_scope = req_scope.filter(Requisition.requester_dept == dept)
        issuance_scope = issuance_scope.join(User, IssuanceLog.issued_to == User.id).filter(User.department == dept)
        tool_scope = tool_scope.filter(
            or_(Tool.department_access == None, Tool.department_access == dept)
        )

    if role not in ("maintenance_admin", "maintenance_staff"):
        visible_stock_rows = [
            row for row in get_tool_stock_snapshot(db)
            if not row["tool"].department_access or row["tool"].department_access == dept
        ]
        stock = {
            "total_quantity": sum(row["total_quantity"] for row in visible_stock_rows),
            "total_tool_types": len(visible_stock_rows),
            "available_quantity": sum(row["available_quantity"] for row in visible_stock_rows),
            "currently_issued": sum(row["currently_issued"] for row in visible_stock_rows),
            "unavailable_quantity": sum(row["unavailable_quantity"] for row in visible_stock_rows),
        }

    overdue_count = issuance_scope.filter(
        IssuanceLog.actual_return_date == None,
        IssuanceLog.expected_return_date < today,
    ).count()

    calibration_due_count = tool_scope.filter(
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
        "total_tools": stock["total_quantity"],
        "total_tool_types": stock["total_tool_types"],
        "available_tools": stock["available_quantity"],
        "tools_issued": stock["currently_issued"],
        "issued_count": stock["currently_issued"],
        "unavailable_tools": stock["unavailable_quantity"],
        "overdue_count": overdue_count,
        "calibration_due_count": calibration_due_count,
        "pending_requests_count": req_scope.filter(Requisition.status == "pending").count(),
        "approved_requests_count": req_scope.filter(Requisition.status == "approved").count(),
        "rejected_requests_count": req_scope.filter(Requisition.status == "rejected").count(),
        "issued_requests_count": req_scope.filter(Requisition.status == "issued").count(),
        "returned_requests_count": req_scope.filter(Requisition.status == "returned").count(),
        "cancelled_requests_count": req_scope.filter(Requisition.status == "cancelled").count(),
        "active_users_count": db.query(User).filter(User.is_active == True).count()
        if role in ("maintenance_admin", "maintenance_staff")
        else None,
        "damaged_or_lost_count": db.query(IssuanceLog).filter(
            IssuanceLog.return_condition.in_(["damaged", "missing"])
        ).count() if role in ("maintenance_admin", "maintenance_staff") else 0,
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
        summary["approved_queue_count"] = db.query(Requisition).filter(
            Requisition.requester_dept == current_user.department,
            Requisition.status == "approved",
        ).count()

    # Maintenance roles see the issuance queue and low-stock alerts
    if current_user.role in ("maintenance_staff", "maintenance_admin"):
        summary["pending_approvals_count"] = db.query(Requisition).filter(
            Requisition.status == "pending",
        ).count()

        summary["approved_queue_count"] = db.query(Requisition).filter(
            Requisition.status == "approved",
        ).count()

        low_stock = [
            row for row in get_tool_stock_snapshot(db)
            if row["tool"].status == "active" and row["available_quantity"] <= 1
        ]
        summary["low_stock_tools"] = [
            {
                "tool_code": row["tool"].tool_code,
                "name": row["tool"].name,
                "available_quantity": row["available_quantity"],
                "total_quantity": row["total_quantity"],
            }
            for row in low_stock
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
