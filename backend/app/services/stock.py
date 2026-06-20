"""
Stock management service — ALL functions must be called inside an active db transaction.
The caller (router) wraps in try/except and calls db.rollback() on failure.
"""

from sqlalchemy import func
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.master import Tool
from app.models.transaction import IssuanceLog


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
            func.coalesce(func.sum(IssuanceLog.quantity_issued), 0).label("issued_quantity"),
        )
        .filter(IssuanceLog.actual_return_date == None)
        .group_by(IssuanceLog.tool_id)
        .all()
    )
    return {tool_id: int(qty or 0) for tool_id, qty in rows}


def get_pending_damage_by_tool(db: Session) -> dict:
    rows = (
        db.query(
            IssuanceLog.tool_id,
            func.coalesce(func.sum(IssuanceLog.quantity_issued), 0).label("pending_quantity"),
        )
        .filter(
            IssuanceLog.actual_return_date != None,
            IssuanceLog.return_condition.in_(["damaged", "missing"]),
            IssuanceLog.damage_type == None,
        )
        .group_by(IssuanceLog.tool_id)
        .all()
    )
    return {tool_id: int(qty or 0) for tool_id, qty in rows}


def get_tool_stock_snapshot(db: Session, include_written_off: bool = False) -> list[dict]:
    query = db.query(Tool)
    if not include_written_off:
        query = query.filter(Tool.status != "written_off")

    issued_by_tool = get_open_issued_by_tool(db)
    pending_damage_by_tool = get_pending_damage_by_tool(db)
    rows = []
    for tool in query.order_by(Tool.name).all():
        currently_issued = issued_by_tool.get(tool.id, 0)
        pending_damage_quantity = pending_damage_by_tool.get(tool.id, 0)
        calculated_available = max(tool.total_quantity - currently_issued - pending_damage_quantity, 0)
        stored_available = tool.available_quantity
        unavailable_quantity = max(tool.total_quantity - calculated_available - currently_issued, 0)
        rows.append(
            {
                "tool": tool,
                "total_quantity": tool.total_quantity,
                "available_quantity": calculated_available,
                "stored_available_quantity": stored_available,
                "currently_issued": currently_issued,
                "issued_quantity": currently_issued,
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
        "available_quantity": sum(r["available_quantity"] for r in rows),
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
        if not tool.is_consumable:
            raise HTTPException(
                status_code=400,
                detail=f"Partial return not allowed for non-consumable tool '{tool.name}'. "
                       f"Must return all {quantity_issued} units or report as damaged/missing."
            )
        return quantity_issued - quantity_returned  # quantity_consumed
    return 0


def validate_damage_return(
    quantity_issued: int,
    quantity_returned: int,
    return_condition: str,
) -> None:
    """Ensure a single damaged/missing return accounts for the full issuance."""
    if return_condition == "damaged" and quantity_returned != quantity_issued:
        raise HTTPException(
            status_code=400,
            detail=(
                f"A damaged return must account for all {quantity_issued} issued unit(s). "
                "Record every unit as damaged or use condition 'missing' when none were returned."
            ),
        )
    if return_condition == "missing" and quantity_returned != 0:
        raise HTTPException(
            status_code=400,
            detail="A missing return must have quantity_returned set to 0",
        )
