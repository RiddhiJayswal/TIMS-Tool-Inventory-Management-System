from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.roles import get_current_user
from app.database import get_db
from app.models.master import Tool
from app.models.transaction import IssuanceLog, Requisition, User
from app.routers.issuance import _issuance_to_dict
from app.schemas.issuance import ReturnCreate
from app.services.audit import log_action
from app.services.notifications import notify_user
from app.services.stock import consume_stock, restore_stock, validate_consumable_return

router = APIRouter(prefix="/returns", tags=["returns"])


@router.post("/{issuance_id}")
def process_return(
    issuance_id: UUID,
    payload: ReturnCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        # Step 1 — Validate
        log = db.query(IssuanceLog).filter(IssuanceLog.id == issuance_id).first()
        if not log:
            raise HTTPException(404, "Issuance log not found")
        if log.actual_return_date is not None:
            raise HTTPException(400, "Tool already returned")
        if current_user.role not in ("maintenance_admin", "maintenance_staff") and log.issued_to != current_user.id:
            raise HTTPException(403, "You can only return tools issued to you")

        if payload.quantity_returned > log.quantity_issued:
            raise HTTPException(
                400,
                f"quantity_returned ({payload.quantity_returned}) cannot exceed quantity_issued ({log.quantity_issued})",
            )
        if payload.return_condition in ("damaged", "missing") and not (payload.notes or "").strip():
            raise HTTPException(400, "Notes are required for damaged or missing returns")

        tool = db.query(Tool).filter(Tool.id == log.tool_id).first()
        if not tool:
            raise HTTPException(404, "Tool not found")

        # Non-consumable in good condition must return all units
        if (
            not tool.is_consumable
            and payload.quantity_returned != log.quantity_issued
            and payload.return_condition == "good"
        ):
            raise HTTPException(
                400,
                f"Non-consumable tool must return all {log.quantity_issued} unit(s) when condition is 'good'. "
                "Use condition 'partial', 'damaged', or 'missing' if returning fewer.",
            )

        # Step 2 — Consumable validation
        if payload.return_condition in ("good", "partial"):
            quantity_consumed = validate_consumable_return(
                tool, log.quantity_issued, payload.quantity_returned
            )
        else:
            # damaged or missing: quantity_consumed not applicable
            quantity_consumed = 0

        # Step 3 — Update IssuanceLog
        log.actual_return_date = date.today()
        log.quantity_returned = payload.quantity_returned
        log.quantity_consumed = quantity_consumed
        log.return_condition = payload.return_condition
        if payload.notes:
            log.notes = payload.notes

        # Step 4 — Restore only usable returned units.
        # Damaged/missing returns stay unavailable until damage assessment writes them off.
        if payload.return_condition in ("good", "partial") and payload.quantity_returned > 0:
            restore_stock(db, str(tool.id), payload.quantity_returned)

        # Step 4b — Consumed consumables permanently leave total stock.
        if quantity_consumed > 0:
            consume_stock(db, str(tool.id), quantity_consumed)

        # Step 5 — Flag damage / notify admin
        if payload.return_condition in ("damaged", "missing"):
            admin_users = (
                db.query(User)
                .filter(User.role == "maintenance_admin", User.is_active == True)
                .all()
            )
            borrower = db.query(User).filter(User.id == log.issued_to).first()
            borrower_name = borrower.full_name if borrower else "Unknown"
            for admin in admin_users:
                notify_user(
                    db,
                    str(admin.id),
                    f"Tool '{tool.name}' returned {payload.return_condition} by {borrower_name}. "
                    "Damage assessment required before closing.",
                )
        borrower = db.query(User).filter(User.id == log.issued_to).first()
        if borrower:
            notify_user(
                db,
                str(borrower.id),
                f"Tool returned: '{tool.name}' return recorded with condition {payload.return_condition}.",
            )

        # Step 6 — Update requisition status
        req = db.query(Requisition).filter(Requisition.id == log.requisition_id).first()
        if req:
            req.status = "returned"

        # Step 7 — Audit log
        log_action(
            db,
            str(current_user.id),
            "TOOL_RETURNED",
            "issuance_logs",
            str(log.id),
            {
                "tool_id": str(tool.id),
                "tool_name": tool.name,
                "quantity_returned": payload.quantity_returned,
                "return_condition": payload.return_condition,
            },
        )

        # Step 8 — Commit
        db.commit()
        db.refresh(log)

        result = _issuance_to_dict(log, db)
        result["message"] = (
            "Return processed successfully"
            + (" — damage assessment required" if payload.return_condition in ("damaged", "missing") else "")
        )
        return result

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Return processing failed: {str(e)}")
