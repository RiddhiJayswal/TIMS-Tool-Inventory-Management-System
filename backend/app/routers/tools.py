import uuid
from datetime import timedelta
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.auth.roles import RequireAdmin, get_current_user
from app.database import get_db
from app.models.master import StorageBin, Tool
from app.models.transaction import AuditLog, IssuanceLog, User
from app.schemas.tool import ToolCreate, ToolUpdate
from app.services.audit import log_action
from app.services.depreciation import calculate_current_value

router = APIRouter(prefix="/tools", tags=["tools"])


def _tool_to_dict(tool: Tool) -> dict:
    current_val = calculate_current_value(
        float(tool.purchase_price) if tool.purchase_price else None,
        tool.purchase_date,
        tool.standard_life_months,
    )
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
        "available_quantity": tool.available_quantity,
        "storage_bin_id": str(tool.storage_bin_id) if tool.storage_bin_id else None,
        "requires_calibration": tool.requires_calibration,
        "calibration_freq_days": tool.calibration_freq_days,
        "last_calibration_date": tool.last_calibration_date,
        "next_calibration_due": tool.next_calibration_due,
        "service_partner": tool.service_partner,
        "status": tool.status,
        "created_at": tool.created_at,
        "updated_at": tool.updated_at,
    }


@router.get("/")
def list_tools(
    search: Optional[str] = None,
    tool_type: Optional[str] = None,
    department_access: Optional[str] = None,
    status: Optional[str] = None,
    requires_calibration: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Tool)

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

    tools = query.all()

    # Maintenance roles see all tools; others see only tools matching their dept or unrestricted
    if current_user.role not in ("maintenance_admin", "maintenance_staff"):
        tools = [
            t for t in tools
            if t.department_access is None or t.department_access == current_user.department
        ]

    return [_tool_to_dict(t) for t in tools]


@router.post("/", status_code=201)
def create_tool(
    payload: ToolCreate,
    current_user: User = Depends(RequireAdmin),
    db: Session = Depends(get_db),
):
    if db.query(Tool).filter(Tool.tool_code == payload.tool_code).first():
        raise HTTPException(400, f"Tool code '{payload.tool_code}' already exists")

    if payload.storage_bin_id:
        if not db.query(StorageBin).filter(StorageBin.id == payload.storage_bin_id).first():
            raise HTTPException(404, "Storage bin not found")

    next_cal_due = None
    if payload.requires_calibration and payload.last_calibration_date and payload.calibration_freq_days:
        next_cal_due = payload.last_calibration_date + timedelta(days=payload.calibration_freq_days)

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
    )
    db.add(tool)
    db.flush()

    log_action(db, str(current_user.id), "TOOL_CREATED", "tools", str(tool.id), {
        "tool_code": tool.tool_code,
        "name": tool.name,
    })

    db.commit()
    db.refresh(tool)
    return _tool_to_dict(tool)


@router.get("/{tool_id}")
def get_tool(
    tool_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(404, "Tool not found")

    # Department access check for non-maintenance roles
    if (
        current_user.role not in ("maintenance_admin", "maintenance_staff")
        and tool.department_access
        and tool.department_access != current_user.department
    ):
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

    result = _tool_to_dict(tool)
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
    current_user: User = Depends(RequireAdmin),
    db: Session = Depends(get_db),
):
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(404, "Tool not found")

    update_data = payload.model_dump(exclude_unset=True)

    # Handle total_quantity change
    if "total_quantity" in update_data:
        new_total = update_data["total_quantity"]
        current_issued = tool.total_quantity - tool.available_quantity
        if new_total < current_issued:
            raise HTTPException(
                400,
                f"Cannot reduce total_quantity below currently issued quantity ({current_issued})",
            )
        delta = new_total - tool.total_quantity
        tool.available_quantity += delta
        tool.total_quantity = new_total
        del update_data["total_quantity"]

    # Recalculate next_calibration_due if calibration fields change
    for field, value in update_data.items():
        setattr(tool, field, value)

    if tool.requires_calibration and tool.last_calibration_date and tool.calibration_freq_days:
        if "last_calibration_date" in update_data or "calibration_freq_days" in update_data:
            tool.next_calibration_due = tool.last_calibration_date + timedelta(
                days=tool.calibration_freq_days
            )

    log_action(db, str(current_user.id), "TOOL_UPDATED", "tools", str(tool.id), update_data)
    db.commit()
    db.refresh(tool)
    return _tool_to_dict(tool)


@router.delete("/{tool_id}")
def write_off_tool(
    tool_id: UUID,
    current_user: User = Depends(RequireAdmin),
    db: Session = Depends(get_db),
):
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(404, "Tool not found")

    open_count = (
        db.query(IssuanceLog)
        .filter(IssuanceLog.tool_id == tool.id, IssuanceLog.actual_return_date == None)
        .count()
    )
    if open_count > 0:
        raise HTTPException(400, f"Cannot write off tool with {open_count} open issuance(s)")

    tool.status = "written_off"
    log_action(db, str(current_user.id), "TOOL_WRITTEN_OFF", "tools", str(tool.id), {
        "tool_code": tool.tool_code,
        "name": tool.name,
    })
    db.commit()
    return {"message": f"Tool '{tool.name}' written off successfully"}
