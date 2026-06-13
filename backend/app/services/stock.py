"""
Stock management service — ALL functions must be called inside an active db transaction.
The caller (router) wraps in try/except and calls db.rollback() on failure.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.master import Tool


def get_tool_locked(db: Session, tool_id: str) -> Tool:
    """
    Fetch tool with a row-level lock (SELECT FOR UPDATE).
    Use this before ANY stock modification to prevent race conditions.
    """
    tool = db.query(Tool).with_for_update().filter(Tool.id == tool_id).first()
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
