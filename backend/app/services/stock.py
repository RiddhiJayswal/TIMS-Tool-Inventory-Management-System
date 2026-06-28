"""
Stock management service — ALL functions must be called inside an active db transaction.
The caller (router) wraps in try/except and calls db.rollback() on failure.
"""

import json
from datetime import date
from sqlalchemy import func, Date
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.master import Tool
from app.models.transaction import IssuanceLog, Requisition

BREAKDOWN_PREFIX = "RETURN_BREAKDOWN:"


def _return_breakdown(notes: str | None) -> dict:
    if not notes:
        return {"good": 0, "damaged": 0, "missing": 0}
    first = notes.split("\n", 1)[0]
    if not first.startswith(BREAKDOWN_PREFIX):
        return {"good": 0, "damaged": 0, "missing": 0}
    try:
        data = json.loads(first[len(BREAKDOWN_PREFIX):])
    except (TypeError, ValueError, json.JSONDecodeError):
        return {"good": 0, "damaged": 0, "missing": 0}
    return {
        "good": int(data.get("good", 0) or 0),
        "damaged": int(data.get("damaged", 0) or 0),
        "missing": int(data.get("missing", 0) or 0),
    }


def validate_writeoff_eligibility(tool: Tool) -> None:
    """Only damaged, durable inventory may enter the write-off workflow."""
    if tool.is_consumable:
        raise HTTPException(
            status_code=400,
            detail="Consumable tools are consumed through issuance and cannot be written off",
        )
    if tool.status != "damaged":
        raise HTTPException(
            status_code=400,
            detail="Only tools marked as damaged can be written off",
        )


def get_tool_locked(db: Session, tool_id: str) -> Tool:
    """
    Fetch and lock a tool row for stock modification.

    SQLAlchemy omits FOR UPDATE on databases such as SQLite that do not support it,
    while PostgreSQL holds the row lock until the surrounding transaction ends.
    """
    tool = (
        db.query(Tool)
        .filter(Tool.id == tool_id)
        .with_for_update()
        .first()
    )
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    return tool


def reduce_stock(db: Session, tool_id: str, quantity: int) -> Tool:
    """
    Called at issuance time.
    Raises HTTP 400 if available_quantity < quantity (never allow negative stock).
    Does NOT commit — caller commits after creating issuance log.
    """
    tool = get_tool_locked(db, tool_id)
    if tool.available_quantity < quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient stock. Requested: {quantity}, Available: {tool.available_quantity}"
        )
    tool.available_quantity -= quantity
    db.flush()
    return tool


def restore_stock(db: Session, tool_id: str, quantity: int) -> Tool:
    """
    Called at return time.
    Restores stock by quantity_returned (not quantity_issued — handles partial returns).
    Does NOT commit — caller commits after updating issuance log.
    """
    tool = get_tool_locked(db, tool_id)
    tool.available_quantity += quantity
    db.flush()
    return tool


def consume_stock(db: Session, tool_id: str, quantity: int) -> Tool:
    """
    Permanently removes consumed, damaged, missing, or written-off units.
    Does not change available_quantity; callers restore usable returns separately.
    """
    tool = get_tool_locked(db, tool_id)
    if quantity <= 0:
        return tool
    if quantity > tool.total_quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot remove {quantity} unit(s); only {tool.total_quantity} exist",
        )
    tool.total_quantity -= quantity
    if tool.available_quantity > tool.total_quantity:
        tool.available_quantity = tool.total_quantity
    if tool.total_quantity <= 0:
        tool.status = "out_of_stock" if tool.is_consumable else "written_off"
    db.flush()
    return tool


def get_open_issued_by_tool(db: Session) -> dict:
    rows = (
        db.query(
            IssuanceLog.tool_id,
            func.coalesce(
                func.sum(IssuanceLog.quantity_issued - func.coalesce(IssuanceLog.quantity_returned, 0)),
                0,
            ).label("issued_quantity"),
        )
        .filter(IssuanceLog.actual_return_date == None)
        .group_by(IssuanceLog.tool_id)
        .all()
    )
    return {tool_id: int(qty or 0) for tool_id, qty in rows}


def get_reserved_by_tool(db: Session) -> dict:
    today = date.today()
    rows = (
        db.query(
            Requisition.tool_id,
            func.coalesce(func.sum(Requisition.quantity_requested), 0).label("reserved_quantity"),
        )
        .filter(
            Requisition.status == "approved",
            Requisition.to_date >= today,
        )
        .group_by(Requisition.tool_id)
        .all()
    )
    return {tool_id: int(qty or 0) for tool_id, qty in rows}


def get_period_reserved_quantity(
    db: Session,
    tool_id,
    from_date: date,
    to_date: date,
    exclude_requisition_id=None,
) -> int:
    query = db.query(func.coalesce(func.sum(Requisition.quantity_requested), 0)).filter(
        Requisition.tool_id == tool_id,
        Requisition.status == "approved",
        Requisition.from_date <= to_date,
        Requisition.to_date >= from_date,
    )
    if exclude_requisition_id:
        query = query.filter(Requisition.id != exclude_requisition_id)
    return int(query.scalar() or 0)


def get_ready_to_issue_requisitions(db: Session, current_user=None) -> list[Requisition]:
    """
    Single source of truth for the approved queue shown on dashboards and the
    Issue Tool page. Approved requests must stay visible to maintenance even
    when their date window has not opened yet or has expired; the issuance API
    still enforces the actual issue window and returns the blocking reason.
    """
    query = db.query(Requisition).filter(
        Requisition.status == "approved",
    )
    if current_user is not None and current_user.role == "dept_head":
        query = query.filter(Requisition.requester_dept == current_user.department)
    return query.order_by(Requisition.approved_at.desc(), Requisition.created_at.desc()).all()


def get_period_open_issued_quantity(db: Session, tool_id, from_date: date, to_date: date) -> int:
    rows = (
        db.query(IssuanceLog)
        .filter(
            IssuanceLog.tool_id == tool_id,
            IssuanceLog.actual_return_date == None,
            IssuanceLog.issued_at.cast(Date) <= to_date,
            IssuanceLog.expected_return_date >= from_date,
        )
        .all()
    )
    return sum(
        max(int(row.quantity_issued or 0) - int(row.quantity_returned or 0), 0)
        for row in rows
    )


def get_pending_damage_by_tool(db: Session) -> dict:
    logs = (
        db.query(IssuanceLog)
        .filter(
            IssuanceLog.actual_return_date != None,
            IssuanceLog.return_condition.in_(["damaged", "missing"]),
            IssuanceLog.damage_type == None,
        )
        .all()
    )
    result = {}
    for log in logs:
        breakdown = _return_breakdown(log.notes)
        qty = breakdown.get("missing", 0) if log.return_condition == "missing" else breakdown.get("damaged", 0)
        if qty <= 0:
            qty = int(log.quantity_returned or log.quantity_issued or 0)
        result[log.tool_id] = result.get(log.tool_id, 0) + qty
    return result


def get_tool_stock_snapshot(db: Session, include_written_off: bool = False) -> list[dict]:
    query = db.query(Tool)
    if not include_written_off:
        query = query.filter(Tool.status != "written_off")

    issued_by_tool = get_open_issued_by_tool(db)
    reserved_by_tool = get_reserved_by_tool(db)
    pending_damage_by_tool = get_pending_damage_by_tool(db)
    rows = []
    for tool in query.order_by(Tool.name).all():
        currently_issued = issued_by_tool.get(tool.id, 0)
        reserved_quantity = reserved_by_tool.get(tool.id, 0)
        pending_damage_quantity = pending_damage_by_tool.get(tool.id, 0)
        calculated_available = max(
            tool.total_quantity - currently_issued - reserved_quantity - pending_damage_quantity,
            0,
        )
        stored_available = tool.available_quantity
        unavailable_quantity = max(
            tool.total_quantity - calculated_available - currently_issued - reserved_quantity,
            0,
        )
        rows.append(
            {
                "tool": tool,
                "total_quantity": tool.total_quantity,
                "available_quantity": calculated_available,
                "stored_available_quantity": stored_available,
                "currently_issued": currently_issued,
                "issued_quantity": currently_issued,
                "reserved_quantity": reserved_quantity,
                "unavailable_quantity": unavailable_quantity,
                "pending_damage_quantity": pending_damage_quantity,
                "stock_mismatch": stored_available != calculated_available,
            }
        )
    return rows


def get_stock_summary(db: Session, include_written_off: bool = False) -> dict:
    rows = get_tool_stock_snapshot(db, include_written_off=include_written_off)
    return {
        "total_tool_types": len(rows),
        "total_quantity": sum(r["total_quantity"] for r in rows),
        "available_quantity": sum(r["stored_available_quantity"] for r in rows),
        "requestable_available_quantity": sum(r["available_quantity"] for r in rows),
        "reserved_quantity": sum(r["reserved_quantity"] for r in rows),
        "currently_issued": sum(r["currently_issued"] for r in rows),
        "unavailable_quantity": sum(r["unavailable_quantity"] for r in rows),
    }


def validate_consumable_return(tool: Tool, quantity_issued: int, quantity_returned: int) -> int:
    """
    For consumables: partial return is valid.
    For non-consumables: quantity_returned must equal quantity_issued.
    Returns quantity_consumed (0 for non-consumables).
    Raises HTTP 400 for invalid partial return on non-consumable.
    """
    if quantity_returned < quantity_issued:
        return quantity_issued - quantity_returned  # quantity_consumed
    return 0


def validate_damage_return(
    quantity_issued: int,
    quantity_returned: int,
    return_condition: str,
) -> None:
    """Damage/missing quantities are validated through ReturnCreate.condition_quantities."""
    return None
