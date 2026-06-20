import csv
import io
from datetime import date, timedelta
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth.roles import RequireMaintenance, get_current_user
from app.database import get_db
from app.models.master import StorageBin, Tool
from app.models.transaction import AuditLog, IssuanceLog, Requisition, User
from app.services.calibration_status import sync_calibration_statuses
from app.services.depreciation import calculate_current_value
from app.services.stock import get_tool_stock_snapshot

router = APIRouter(prefix="/reports", tags=["reports"])


def _activity_rows(db: Session, limit: int | None = None, log_date: date | None = None) -> list[dict]:
    query = db.query(AuditLog).order_by(AuditLog.timestamp.desc())
    if log_date:
        query = query.filter(func.date(AuditLog.timestamp) == log_date)
    if limit:
        query = query.limit(limit)
    rows = []
    for entry in query.all():
        user = db.query(User).filter(User.id == entry.user_id).first() if entry.user_id else None
        details = entry.details or {}
        rows.append({
            "activity_id": str(entry.id),
            "timestamp": entry.timestamp,
            "user_name": user.full_name if user else "",
            "user_role": user.role if user else "",
            "user_id": user.employee_id if user else "",
            "action_type": entry.action,
            "module": entry.entity,
            "entity_id": str(entry.entity_id),
            "entity_name": details.get("tool_name") or details.get("requisition_number") or details.get("name") or "",
            "quantity": details.get("quantity_requested") or details.get("quantity_issued") or details.get("quantity_returned") or "",
            "department": details.get("department") or details.get("requester_dept") or "",
            "status": "recorded",
            "details": details,
        })
    return rows


@router.get("/activity-logs")
def report_activity_logs(
    limit: int = 100,
    format: Optional[str] = None,
    current_user=Depends(RequireMaintenance),
    db: Session = Depends(get_db),
):
    data = _activity_rows(db, limit=limit)
    if format == "csv":
        return to_csv_response(data, "activity_backup")
    return data


@router.get("/activity-logs/daily")
def report_daily_activity_log(
    log_date: Optional[date] = None,
    current_user=Depends(RequireMaintenance),
    db: Session = Depends(get_db),
):
    target = log_date or date.today()
    rows = list(reversed(_activity_rows(db, log_date=target)))
    output = io.StringIO()
    if not rows:
        output.write("No activity logs found\n")
    for row in rows:
        output.write(
            f"{row['timestamp']} | {row['user_id']} | {row['user_role']} | "
            f"{row['action_type']} | {row['module']} | {row['entity_name']} | {row['details']}\n"
        )
    output.seek(0)
    filename = f"TIMS-activity-{target.isoformat()}.log"
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


def to_csv_response(data: list, report_name: str) -> StreamingResponse:
    output = io.StringIO()
    if not data:
        output.write("No data available\n")
    else:
        serialized = [
            {k: ("" if v is None else str(v)) for k, v in row.items()} for row in data
        ]
        writer = csv.DictWriter(output, fieldnames=list(data[0].keys()))
        writer.writeheader()
        writer.writerows(serialized)
    output.seek(0)
    filename = f"tims_{report_name}_{date.today().isoformat()}.csv"
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/stock")
def report_stock(
    include_written_off: bool = False,
    format: Optional[str] = None,
    current_user=Depends(RequireMaintenance),
    db: Session = Depends(get_db),
):
    sync_calibration_statuses(db)
    data = []
    for row in get_tool_stock_snapshot(db, include_written_off=include_written_off):
        t = row["tool"]
        storage_bin = (
            db.query(StorageBin).filter(StorageBin.id == t.storage_bin_id).first()
            if t.storage_bin_id
            else None
        )
        unit_cost = float(t.purchase_price) if t.purchase_price is not None else None
        current_unit_value = calculate_current_value(
            unit_cost,
            t.purchase_date,
            t.standard_life_months,
        ) if unit_cost is not None else None
        current_unit_value_f = float(current_unit_value) if current_unit_value is not None else unit_cost
        current_value = (
            round(row["available_quantity"] * current_unit_value_f, 2)
            if current_unit_value_f is not None
            else None
        )
        total_value = (
            round(row["total_quantity"] * current_unit_value_f, 2)
            if current_unit_value_f is not None
            else None
        )
        issued_value = (
            round(row["currently_issued"] * current_unit_value_f, 2)
            if current_unit_value_f is not None
            else None
        )
        data.append(
            {
                "tool_code": t.tool_code,
                "name": t.name,
                "category": t.category,
                "tool_type": t.tool_type,
                "department_access": t.department_access,
                "total_quantity": row["total_quantity"],
                "available_quantity": row["available_quantity"],
                "currently_issued": row["currently_issued"],
                "issued_quantity": row["issued_quantity"],
                "unavailable_quantity": row["unavailable_quantity"],
                "status": t.status,
                "storage_bin": storage_bin.bin_code if storage_bin else None,
                "storage_location": (
                    f"{storage_bin.bin_code} - {storage_bin.shelf_label}" if storage_bin else None
                ),
                "unit_cost": unit_cost,
                "current_unit_value": current_unit_value_f,
                "current_value": current_value,
                "total_value": total_value,
                "issued_value": issued_value,
                "purchase_date": t.purchase_date,
                "standard_life_months": t.standard_life_months,
                "calibration_status": t.status if t.requires_calibration else None,
            }
        )

    if format == "csv":
        return to_csv_response(data, "stock")
    return data


@router.get("/issuance-history")
def report_issuance_history(
    tool_id: Optional[UUID] = None,
    employee_id: Optional[str] = None,
    department: Optional[str] = None,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    status: Optional[str] = None,
    format: Optional[str] = None,
    current_user=Depends(RequireMaintenance),
    db: Session = Depends(get_db),
):
    sync_calibration_statuses(db)
    query = db.query(IssuanceLog)

    if tool_id:
        query = query.filter(IssuanceLog.tool_id == tool_id)
    if from_date:
        query = query.filter(IssuanceLog.issued_at >= from_date)
    if to_date:
        query = query.filter(IssuanceLog.issued_at <= to_date)
    if status == "open":
        query = query.filter(IssuanceLog.actual_return_date == None)
    elif status == "closed":
        query = query.filter(IssuanceLog.actual_return_date != None)

    logs = query.order_by(IssuanceLog.issued_at.desc()).all()

    data = []
    for log in logs:
        tool = db.query(Tool).filter(Tool.id == log.tool_id).first()
        borrower = db.query(User).filter(User.id == log.issued_to).first()

        if employee_id and (not borrower or borrower.employee_id != employee_id):
            continue
        if department and (not borrower or borrower.department != department):
            continue

        data.append(
            {
                "issuance_id": str(log.id),
                "tool_code": tool.tool_code if tool else None,
                "tool_name": tool.name if tool else None,
                "borrower_employee_id": borrower.employee_id if borrower else None,
                "borrower_name": borrower.full_name if borrower else None,
                "borrower_dept": borrower.department if borrower else None,
                "quantity_issued": log.quantity_issued,
                "issued_at": log.issued_at,
                "expected_return_date": log.expected_return_date,
                "actual_return_date": log.actual_return_date,
                "return_condition": log.return_condition,
                "damage_type": log.damage_type,
                "penalty_amount": float(log.penalty_amount) if log.penalty_amount else None,
                "notes": log.notes,
            }
        )

    if format == "csv":
        return to_csv_response(data, "issuance_history")
    return data


@router.get("/overdue")
def report_overdue(
    format: Optional[str] = None,
    current_user=Depends(RequireMaintenance),
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

    data = []
    for log in logs:
        tool = db.query(Tool).filter(Tool.id == log.tool_id).first()
        borrower = db.query(User).filter(User.id == log.issued_to).first()
        data.append(
            {
                "issuance_id": str(log.id),
                "tool_name": tool.name if tool else None,
                "borrower_name": borrower.full_name if borrower else None,
                "borrower_dept": borrower.department if borrower else None,
                "quantity_issued": log.quantity_issued,
                "issued_at": log.issued_at,
                "expected_return_date": log.expected_return_date,
                "days_overdue": (today - log.expected_return_date).days,
            }
        )

    data.sort(key=lambda x: x["days_overdue"], reverse=True)

    if format == "csv":
        return to_csv_response(data, "overdue")
    return data


@router.get("/calibration")
def report_calibration(
    days: int = 30,
    format: Optional[str] = None,
    current_user=Depends(RequireMaintenance),
    db: Session = Depends(get_db),
):
    sync_calibration_statuses(db)
    today = date.today()
    tools = db.query(Tool).filter(Tool.requires_calibration == True).all()

    data = []
    for t in tools:
        if not t.next_calibration_due:
            continue
        days_until_due = (t.next_calibration_due - today).days
        # Always include overdue; include upcoming only within the `days` window
        if days_until_due > days:
            continue

        if days_until_due <= 0:
            cal_status = "overdue"
        elif days_until_due <= 7:
            cal_status = "due_soon"
        else:
            cal_status = "ok"

        data.append(
            {
                "tool_code": t.tool_code,
                "name": t.name,
                "last_calibration_date": t.last_calibration_date,
                "next_calibration_due": t.next_calibration_due,
                "days_until_due": days_until_due,
                "calibration_status": cal_status,
                "service_partner": t.service_partner,
                "tool_status": t.status,
            }
        )

    data.sort(key=lambda x: x["days_until_due"])

    if format == "csv":
        return to_csv_response(data, "calibration")
    return data


@router.get("/damage-penalty")
def report_damage_penalty(
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    format: Optional[str] = None,
    current_user=Depends(RequireMaintenance),
    db: Session = Depends(get_db),
):
    sync_calibration_statuses(db)
    query = db.query(IssuanceLog).filter(IssuanceLog.damage_type != None)
    if from_date:
        query = query.filter(IssuanceLog.actual_return_date >= from_date)
    if to_date:
        query = query.filter(IssuanceLog.actual_return_date <= to_date)

    logs = query.order_by(IssuanceLog.actual_return_date.desc()).all()

    data = []
    for log in logs:
        tool = db.query(Tool).filter(Tool.id == log.tool_id).first()
        borrower = db.query(User).filter(User.id == log.issued_to).first()
        req = db.query(Requisition).filter(Requisition.id == log.requisition_id).first()
        data.append(
            {
                "issuance_id": str(log.id),
                "requisition_number": req.requisition_number if req else None,
                "tool_code": tool.tool_code if tool else None,
                "tool_name": tool.name if tool else None,
                "borrower_name": borrower.full_name if borrower else None,
                "borrower_dept": borrower.department if borrower else None,
                "damage_type": log.damage_type,
                "return_condition": log.return_condition,
                "penalty_amount": float(log.penalty_amount) if log.penalty_amount else 0.0,
                "depreciated_value_at_issue": (
                    float(log.depreciated_value_at_issue) if log.depreciated_value_at_issue else None
                ),
                "actual_return_date": log.actual_return_date,
                "notes": log.notes,
            }
        )

    if format == "csv":
        return to_csv_response(data, "damage_penalty")
    return data


@router.get("/utilization")
def report_utilization(
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    format: Optional[str] = None,
    current_user=Depends(RequireMaintenance),
    db: Session = Depends(get_db),
):
    sync_calibration_statuses(db)
    today = date.today()
    if not from_date:
        from_date = today - timedelta(days=30)
    if not to_date:
        to_date = today

    departments = (
        db.query(Requisition.requester_dept)
        .filter(Requisition.created_at >= from_date, Requisition.created_at <= to_date)
        .distinct()
        .all()
    )

    data = []
    for (dept,) in departments:
        base_req = db.query(Requisition).filter(
            Requisition.requester_dept == dept,
            Requisition.created_at >= from_date,
            Requisition.created_at <= to_date,
        )
        total_requests = base_req.count()
        approved_requests = base_req.filter(
            Requisition.status.in_(["approved", "issued", "returned"])
        ).count()

        total_issued = (
            db.query(IssuanceLog)
            .join(Requisition, IssuanceLog.requisition_id == Requisition.id)
            .filter(
                Requisition.requester_dept == dept,
                IssuanceLog.issued_at >= from_date,
                IssuanceLog.issued_at <= to_date,
            )
            .count()
        )

        overdue_count = (
            db.query(IssuanceLog)
            .join(Requisition, IssuanceLog.requisition_id == Requisition.id)
            .filter(
                Requisition.requester_dept == dept,
                IssuanceLog.actual_return_date == None,
                IssuanceLog.expected_return_date < today,
            )
            .count()
        )
        active_issuances = (
            db.query(IssuanceLog)
            .join(Requisition, IssuanceLog.requisition_id == Requisition.id)
            .filter(
                Requisition.requester_dept == dept,
                IssuanceLog.actual_return_date == None,
            )
            .count()
        )
        rejected_requests = base_req.filter(Requisition.status == "rejected").count()

        most_borrowed = (
            db.query(Tool.name, func.count(IssuanceLog.id).label("cnt"))
            .join(IssuanceLog, Tool.id == IssuanceLog.tool_id)
            .join(Requisition, IssuanceLog.requisition_id == Requisition.id)
            .filter(
                Requisition.requester_dept == dept,
                IssuanceLog.issued_at >= from_date,
                IssuanceLog.issued_at <= to_date,
            )
            .group_by(Tool.name)
            .order_by(func.count(IssuanceLog.id).desc())
            .first()
        )

        data.append(
            {
                "department": dept,
                "total_requests": total_requests,
                "approved_requests": approved_requests,
                "rejected_requests": rejected_requests,
                "active_issuances": active_issuances,
                "total_tools_issued": total_issued,
                "total_issued": total_issued,
                "overdue_count": overdue_count,
                "most_borrowed_tool": most_borrowed[0] if most_borrowed else None,
                "period_from": from_date,
                "period_to": to_date,
            }
        )

    data.sort(key=lambda x: x["total_requests"], reverse=True)

    if format == "csv":
        return to_csv_response(data, "utilization")
    return data


@router.get("/depreciation")
def report_depreciation(
    include_written_off: bool = False,
    format: Optional[str] = None,
    current_user=Depends(RequireMaintenance),
    db: Session = Depends(get_db),
):
    sync_calibration_statuses(db)
    today = date.today()
    query = db.query(Tool).filter(Tool.purchase_price != None)
    if not include_written_off:
        query = query.filter(Tool.status != "written_off")
    tools = query.all()

    data = []
    for t in tools:
        if not t.purchase_price or not t.purchase_date or not t.standard_life_months:
            continue

        months_elapsed = max(
            0,
            (today.year - t.purchase_date.year) * 12 + (today.month - t.purchase_date.month),
        )
        current_val = calculate_current_value(
            float(t.purchase_price), t.purchase_date, t.standard_life_months
        )
        purchase_price_f = float(t.purchase_price)
        current_val_f = float(current_val) if current_val is not None else 0.0

        data.append(
            {
                "tool_code": t.tool_code,
                "name": t.name,
                "purchase_date": t.purchase_date,
                "purchase_price": purchase_price_f,
                "standard_life_months": t.standard_life_months,
                "months_elapsed": months_elapsed,
                "current_value": current_val_f,
                "depreciation_to_date": round(purchase_price_f - current_val_f, 2),
                "depreciation_pct": (
                    round(((purchase_price_f - current_val_f) / purchase_price_f) * 100, 2)
                    if purchase_price_f
                    else None
                ),
                "status": t.status,
            }
        )

    # Most depreciated first
    data.sort(key=lambda x: x["current_value"])

    if format == "csv":
        return to_csv_response(data, "depreciation")
    return data
