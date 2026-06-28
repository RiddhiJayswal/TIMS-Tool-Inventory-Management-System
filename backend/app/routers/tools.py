import uuid
from datetime import timedelta
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.auth.roles import RequireAdmin, RequireMaintenance, get_current_user
from app.database import get_db
from app.models.master import StorageBin, Tool
from app.models.transaction import AuditLog, IssuanceLog, Notification, Requisition, User
from app.schemas.tool import ToolCreate, ToolUpdate
from app.services.calibration_status import sync_calibration_statuses
from app.services.audit import log_action
from app.services.depreciation import calculate_current_value
from app.services.stock import (
    get_open_issued_by_tool,
    get_tool_stock_snapshot,
    validate_writeoff_eligibility,
)
from app.services.tool_visibility import scope_tools_for_user, user_can_access_tool

router = APIRouter(prefix="/tools", tags=["tools"])


def _calculate_calibration_due(last_date, frequency_days):
    if not last_date or not frequency_days:
        return None
    try:
        return last_date + timedelta(days=frequency_days)
    except OverflowError as exc:
        raise HTTPException(
            422, "Calibration date and frequency produce an invalid due date"
        ) from exc


def _sync_calibration_fields(tool: Tool, changed_fields: set[str]) -> None:
    calibration_fields = {
        "requires_calibration",
        "last_calibration_date",
        "calibration_freq_days",
    }
    if not calibration_fields.intersection(changed_fields):
        return
    if not tool.requires_calibration:
        tool.calibration_freq_days = None
        tool.last_calibration_date = None
        tool.next_calibration_due = None
        if tool.status == "calibration_due":
            tool.status = "active"
    elif tool.last_calibration_date and tool.calibration_freq_days:
        tool.next_calibration_due = _calculate_calibration_due(
            tool.last_calibration_date, tool.calibration_freq_days
        )


def _notify_maintenance(db: Session, message: str) -> None:
    users = (
        db.query(User)
        .filter(User.role.in_(["maintenance_admin", "maintenance_staff"]), User.is_active == True)
        .all()
    )
    for user in users:
        db.add(Notification(user_id=user.id, message=message, is_read=False))


def _stock_row_for_tool(db: Session, tool_id) -> dict | None:
    for row in get_tool_stock_snapshot(db, include_written_off=True):
        if row["tool"].id == tool_id:
            return row
    return None


def _bin_used_units(db: Session, bin_id, excluding_tool_id=None) -> int:
    query = db.query(Tool).filter(Tool.storage_bin_id == bin_id)
    if excluding_tool_id:
        query = query.filter(Tool.id != excluding_tool_id)
    return sum(int(t.total_quantity or 0) for t in query.all())


def _validate_bin_capacity(db: Session, bin_id, adding_units: int, excluding_tool_id=None) -> None:
    if not bin_id:
        return
    storage_bin = db.query(StorageBin).filter(StorageBin.id == bin_id).first()
    if not storage_bin:
        raise HTTPException(404, "Storage bin not found")
    if storage_bin.capacity is None:
        return
    used_units = _bin_used_units(db, bin_id, excluding_tool_id)
    if used_units + int(adding_units or 0) > storage_bin.capacity:
        raise HTTPException(
            400,
            f"Storage bin capacity exceeded. Used: {used_units}, Adding: {adding_units}, Capacity: {storage_bin.capacity}",
        )


def _tool_to_dict(tool: Tool, db: Session | None = None, stock_row: dict | None = None) -> dict:
    current_val = calculate_current_value(
        float(tool.purchase_price) if tool.purchase_price else None,
        tool.purchase_date,
        tool.standard_life_months,
    )
    storage_bin = None
    if db and tool.storage_bin_id:
        storage_bin = db.query(StorageBin).filter(StorageBin.id == tool.storage_bin_id).first()

    available_quantity = tool.available_quantity
    requestable_available_quantity = stock_row["available_quantity"] if stock_row else tool.available_quantity
    currently_issued = (
        stock_row["currently_issued"]
        if stock_row
        else max(tool.total_quantity - available_quantity, 0)
    )
    unavailable_quantity = (
        stock_row["unavailable_quantity"]
        if stock_row
        else max(tool.total_quantity - available_quantity - currently_issued, 0)
    )
    reserved_quantity = stock_row.get("reserved_quantity", 0) if stock_row else 0

    return {
        "id": str(tool.id),
        "tool_code": tool.tool_code,
        "name": tool.name,
        "category": tool.category,
        "tool_type": tool.tool_type,
        "department_access": tool.department_access,
        "is_consumable": tool.is_consumable,
        "make": tool.make,
        "model": tool.model,
        "serial_number": tool.serial_number,
        "purchase_date": tool.purchase_date,
        "purchase_price": float(tool.purchase_price) if tool.purchase_price else None,
        "standard_life_months": tool.standard_life_months,
        "current_value": float(current_val) if current_val is not None else None,
        "total_quantity": tool.total_quantity,
        "available_quantity": available_quantity,
        "requestable_available_quantity": requestable_available_quantity,
        "currently_issued": currently_issued,
        "issued_quantity": currently_issued,
        "reserved_quantity": reserved_quantity,
        "unavailable_quantity": unavailable_quantity,
        "storage_bin_id": str(tool.storage_bin_id) if tool.storage_bin_id else None,
        "storage_bin_code": storage_bin.bin_code if storage_bin else None,
        "requires_calibration": tool.requires_calibration,
        "calibration_freq_days": tool.calibration_freq_days,
        "last_calibration_date": tool.last_calibration_date,
        "next_calibration_due": tool.next_calibration_due,
        "service_partner": tool.service_partner,
        "status": tool.status,
        "created_at": tool.created_at,
        "updated_at": tool.updated_at,
    }


@router.get("")
def list_tools(
    search: Optional[str] = None,
    tool_type: Optional[str] = None,
    department_access: Optional[str] = None,
    status: Optional[str] = None,
    requires_calibration: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sync_calibration_statuses(db)
    query = scope_tools_for_user(db.query(Tool), current_user)

    if search:
        query = query.filter(
            or_(
                Tool.name.ilike(f"%{search}%"),
                Tool.tool_code.ilike(f"%{search}%"),
            )
        )
    if tool_type:
        query = query.filter(Tool.tool_type == tool_type)
    if department_access:
        query = query.filter(Tool.department_access == department_access)
    if status:
        query = query.filter(Tool.status == status)
    if requires_calibration is not None:
        query = query.filter(Tool.requires_calibration == requires_calibration)

    stock_by_tool = {row["tool"].id: row for row in get_tool_stock_snapshot(db, include_written_off=True)}
    tools = query.all()
    return [_tool_to_dict(t, db, stock_by_tool.get(t.id)) for t in tools]


@router.post("", status_code=201)
def create_tool(
    payload: ToolCreate,
    current_user: User = Depends(RequireMaintenance),
    db: Session = Depends(get_db),
):
    if db.query(Tool).filter(Tool.tool_code == payload.tool_code).first():
        raise HTTPException(400, f"Tool code '{payload.tool_code}' already exists")

    if payload.storage_bin_id:
        _validate_bin_capacity(db, payload.storage_bin_id, payload.total_quantity)

    next_cal_due = None
    if payload.requires_calibration and payload.last_calibration_date and payload.calibration_freq_days:
        next_cal_due = _calculate_calibration_due(
            payload.last_calibration_date, payload.calibration_freq_days
        )

    tool = Tool(
        id=uuid.uuid4(),
        tool_code=payload.tool_code,
        name=payload.name,
        category=payload.category,
        tool_type=payload.tool_type,
        department_access=payload.department_access,
        is_consumable=payload.is_consumable,
        make=payload.make,
        model=payload.model,
        serial_number=payload.serial_number,
        purchase_date=payload.purchase_date,
        purchase_price=payload.purchase_price,
        standard_life_months=payload.standard_life_months,
        total_quantity=payload.total_quantity,
        available_quantity=payload.total_quantity,
        storage_bin_id=payload.storage_bin_id,
        requires_calibration=payload.requires_calibration,
        calibration_freq_days=payload.calibration_freq_days,
        last_calibration_date=payload.last_calibration_date,
        next_calibration_due=next_cal_due,
        service_partner=payload.service_partner,
        status=(
            "out_of_stock"
            if payload.is_consumable and payload.total_quantity == 0
            else "active"
        ),
    )
    db.add(tool)
    db.flush()

    log_action(db, str(current_user.id), "TOOL_CREATED", "tools", str(tool.id), {
        "tool_code": tool.tool_code,
        "name": tool.name,
    })
    _notify_maintenance(db, f"Tool added: {tool.tool_code} - {tool.name} was added by {current_user.full_name}.")

    db.commit()
    db.refresh(tool)
    return _tool_to_dict(tool, db, _stock_row_for_tool(db, tool.id))


@router.get("/{tool_id}")
def get_tool(
    tool_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sync_calibration_statuses(db)
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(404, "Tool not found")

    # Department access check for non-maintenance roles
    if not user_can_access_tool(tool, current_user):
        raise HTTPException(403, "Access denied: tool belongs to a different department")

    open_issuances = (
        db.query(IssuanceLog)
        .filter(IssuanceLog.tool_id == tool.id, IssuanceLog.actual_return_date == None)
        .all()
    )

    calib_history = (
        db.query(AuditLog)
        .filter(
            AuditLog.entity == "tools",
            AuditLog.entity_id == tool.id,
            AuditLog.action == "CALIBRATION_RECORDED",
        )
        .order_by(AuditLog.timestamp.desc())
        .all()
    )

    result = _tool_to_dict(tool, db, _stock_row_for_tool(db, tool.id))
    result["current_issuances"] = []
    for i in open_issuances:
        borrower = db.query(User).filter(User.id == i.issued_to).first()
        result["current_issuances"].append({
            "id": str(i.id),
            "issued_to": str(i.issued_to),
            "borrower_name": borrower.full_name if borrower else None,
            "borrower_dept": borrower.department if borrower else None,
            "quantity_issued": i.quantity_issued,
            "issued_at": i.issued_at,
            "expected_return_date": i.expected_return_date,
        })
    result["calibration_history"] = [
        {
            "id": str(c.id),
            "action": c.action,
            "details": c.details,
            "timestamp": c.timestamp,
        }
        for c in calib_history
    ]
    return result


@router.put("/{tool_id}")
def update_tool(
    tool_id: UUID,
    payload: ToolUpdate,
    current_user: User = Depends(RequireMaintenance),
    db: Session = Depends(get_db),
):
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(404, "Tool not found")

    update_data = payload.model_dump(exclude_unset=True)

    if "is_consumable" in update_data and update_data["is_consumable"] != tool.is_consumable:
        active_reqs = db.query(Requisition).filter(
            Requisition.tool_id == tool.id,
            Requisition.status.in_(["pending", "approved"]),
        ).count()
        open_issuances = db.query(IssuanceLog).filter(
            IssuanceLog.tool_id == tool.id,
            IssuanceLog.actual_return_date == None,
        ).count()
        active_returns = db.query(IssuanceLog).filter(
            IssuanceLog.tool_id == tool.id,
            IssuanceLog.return_condition.in_(["damaged", "missing"]),
            IssuanceLog.damage_type == None,
        ).count()
        if active_reqs or open_issuances or active_returns:
            raise HTTPException(
                400,
                "Cannot change consumable type while active requisitions or issuances exist.",
            )

    # Handle total_quantity change
    if "total_quantity" in update_data:
        new_total = update_data["total_quantity"]
        current_stock = _stock_row_for_tool(db, tool.id) or {}
        current_issued = current_stock.get("currently_issued", get_open_issued_by_tool(db).get(tool.id, 0))
        committed_quantity = current_issued + current_stock.get("pending_damage_quantity", 0)
        if new_total < committed_quantity:
            raise HTTPException(
                400,
                f"Cannot reduce total_quantity below committed quantity ({committed_quantity})",
            )
        delta = new_total - tool.total_quantity
        tool.available_quantity += delta
        tool.total_quantity = new_total
        del update_data["total_quantity"]

    target_bin_id = update_data.get("storage_bin_id", tool.storage_bin_id)
    if target_bin_id:
        _validate_bin_capacity(db, target_bin_id, tool.total_quantity, excluding_tool_id=tool.id)

    # Recalculate next_calibration_due if calibration fields change
    for field, value in update_data.items():
        setattr(tool, field, value)

    if tool.is_consumable:
        if tool.total_quantity <= 0:
            tool.status = "out_of_stock"
        elif tool.status == "out_of_stock":
            tool.status = "active"

    _sync_calibration_fields(tool, set(update_data))

    log_action(db, str(current_user.id), "TOOL_UPDATED", "tools", str(tool.id), update_data)
    _notify_maintenance(db, f"Tool updated: {tool.tool_code} - {tool.name} was edited by {current_user.full_name}.")
    db.commit()
    db.refresh(tool)
    return _tool_to_dict(tool, db, _stock_row_for_tool(db, tool.id))


@router.delete("/{tool_id}")
def write_off_tool(
    tool_id: UUID,
    current_user: User = Depends(RequireAdmin),
    db: Session = Depends(get_db),
):
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(404, "Tool not found")

    validate_writeoff_eligibility(tool)

    open_count = (
        db.query(IssuanceLog)
        .filter(IssuanceLog.tool_id == tool.id, IssuanceLog.actual_return_date == None)
        .count()
    )
    if open_count > 0:
        raise HTTPException(400, f"Cannot write off tool with {open_count} open issuance(s)")

    written_off_quantity = tool.total_quantity
    tool.total_quantity = 0
    tool.available_quantity = 0
    tool.status = "written_off"
    log_action(db, str(current_user.id), "TOOL_WRITTEN_OFF", "tools", str(tool.id), {
        "tool_code": tool.tool_code,
        "name": tool.name,
        "quantity_written_off": written_off_quantity,
    })
    db.commit()
    return {"message": f"Tool '{tool.name}' written off successfully"}
