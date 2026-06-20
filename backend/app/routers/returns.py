import json
from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.roles import RequireMaintenance
from app.database import get_db
from app.models.master import Tool
from app.models.transaction import IssuanceLog, Requisition, User
from app.routers.issuance import _issuance_to_dict
from app.schemas.issuance import ReturnCreate
from app.services.audit import log_action
from app.services.notifications import notify_user
from app.services.stock import (
    consume_stock,
    restore_stock,
    validate_consumable_return,
    validate_damage_return,
)

router = APIRouter(prefix="/returns", tags=["returns"])

BREAKDOWN_PREFIX = "RETURN_BREAKDOWN:"


def _split_notes(notes: str | None) -> tuple[dict, str]:
    if not notes:
        return {"good": 0, "damaged": 0, "missing": 0}, ""
    first, _, rest = notes.partition("\n")
    if first.startswith(BREAKDOWN_PREFIX):
        try:
            data = json.loads(first[len(BREAKDOWN_PREFIX):])
            return {
                "good": int(data.get("good", 0) or 0),
                "damaged": int(data.get("damaged", 0) or 0),
                "missing": int(data.get("missing", 0) or 0),
            }, rest
        except (TypeError, ValueError, json.JSONDecodeError):
            return {"good": 0, "damaged": 0, "missing": 0}, rest
    return {"good": 0, "damaged": 0, "missing": 0}, notes


def _compose_notes(breakdown: dict, user_notes: str | None) -> str:
    clean = {key: int(breakdown.get(key, 0) or 0) for key in ("good", "damaged", "missing")}
    suffix = (user_notes or "").strip()
    return f"{BREAKDOWN_PREFIX}{json.dumps(clean, separators=(',', ':'))}" + (f"\n{suffix}" if suffix else "")


def _default_breakdown(condition: str, quantity: int) -> dict:
    if condition in ("good", "partial"):
        return {"good": quantity, "damaged": 0, "missing": 0}
    if condition == "damaged":
        return {"good": 0, "damaged": quantity, "missing": 0}
    return {"good": 0, "damaged": 0, "missing": quantity}


@router.post("/{issuance_id}")
def process_return(
    issuance_id: UUID,
    payload: ReturnCreate,
    current_user: User = Depends(RequireMaintenance),
    db: Session = Depends(get_db),
):
    try:
        log = db.query(IssuanceLog).filter(IssuanceLog.id == issuance_id).first()
        if not log:
            raise HTTPException(404, "Issuance log not found")

        previous_returned = int(log.quantity_returned or 0)
        remaining_quantity = max(int(log.quantity_issued or 0) - previous_returned, 0)
        if log.actual_return_date is not None or remaining_quantity <= 0:
            raise HTTPException(400, "Tool already returned")
        if log.return_condition == "consumed":
            raise HTTPException(400, "Cannot process a return for a consumed item")
        if current_user.role not in ("maintenance_admin", "maintenance_staff") and log.issued_to != current_user.id:
            raise HTTPException(403, "You can only return tools issued to you")

        if payload.quantity_returned > remaining_quantity:
            raise HTTPException(
                400,
                f"quantity_returned ({payload.quantity_returned}) cannot exceed remaining quantity ({remaining_quantity})",
            )

        condition_quantities = payload.condition_quantities or _default_breakdown(
            payload.return_condition,
            payload.quantity_returned,
        )
        condition_quantities = {
            key: int(condition_quantities.get(key, 0) or 0)
            for key in ("good", "damaged", "missing")
        }
        if sum(condition_quantities.values()) != payload.quantity_returned:
            raise HTTPException(400, "Condition quantities must add up to quantity_returned")
        if any(condition_quantities[k] for k in ("damaged", "missing")) and not (payload.notes or "").strip():
            raise HTTPException(400, "Notes are required for damaged or missing returns")
        if (
            current_user.role == "maintenance_staff"
            and log.issued_to != current_user.id
            and (condition_quantities["damaged"] > 0 or condition_quantities["missing"] > 0)
        ):
            raise HTTPException(403, "Only maintenance admin can record damaged or missing quantities for tools not issued to you")
        validate_damage_return(
            log.quantity_issued,
            payload.quantity_returned,
            payload.return_condition,
        )

        tool = db.query(Tool).filter(Tool.id == log.tool_id).first()
        if not tool:
            raise HTTPException(404, "Tool not found")

        if tool.is_consumable and payload.return_condition in ("good", "partial"):
            quantity_consumed = validate_consumable_return(tool, remaining_quantity, payload.quantity_returned)
        else:
            quantity_consumed = 0

        existing_breakdown, existing_notes = _split_notes(log.notes)
        for key in ("good", "damaged", "missing"):
            existing_breakdown[key] = int(existing_breakdown.get(key, 0) or 0) + condition_quantities[key]

        cumulative_returned = previous_returned + payload.quantity_returned
        log.quantity_returned = cumulative_returned
        log.quantity_consumed = int(log.quantity_consumed or 0) + quantity_consumed
        if existing_breakdown["missing"] > 0:
            log.return_condition = "missing"
        elif existing_breakdown["damaged"] > 0:
            log.return_condition = "damaged"
        elif cumulative_returned < log.quantity_issued:
            log.return_condition = "partial"
        else:
            log.return_condition = "good"
        if cumulative_returned >= log.quantity_issued:
            log.actual_return_date = date.today()

        merged_notes = "\n".join(
            part for part in [existing_notes.strip(), (payload.notes or "").strip()] if part
        )
        log.notes = _compose_notes(existing_breakdown, merged_notes)

        usable_quantity = condition_quantities["good"]
        if usable_quantity > 0:
            restore_stock(db, str(tool.id), usable_quantity)

        if quantity_consumed > 0:
            consume_stock(db, str(tool.id), quantity_consumed)

        if condition_quantities["damaged"] or condition_quantities["missing"]:
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
                    f"Tool '{tool.name}' returned with damaged/missing quantities by {borrower_name}. "
                    "Damage assessment required before closing.",
                )

        borrower = db.query(User).filter(User.id == log.issued_to).first()
        if borrower:
            notify_user(
                db,
                str(borrower.id),
                f"Tool returned: '{tool.name}' return recorded with condition {log.return_condition}.",
            )

        req = db.query(Requisition).filter(Requisition.id == log.requisition_id).first()
        if req and log.actual_return_date is not None:
            req.status = "returned"

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
                "return_condition": log.return_condition,
                "condition_quantities": condition_quantities,
            },
        )

        db.commit()
        db.refresh(log)

        result = _issuance_to_dict(log, db)
        result["remaining_quantity"] = max(int(log.quantity_issued or 0) - int(log.quantity_returned or 0), 0)
        result["return_breakdown"] = existing_breakdown
        result["message"] = (
            "Return processed successfully"
            + (" - damage assessment required" if log.return_condition in ("damaged", "missing") else "")
        )
        return result

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Return processing failed: {str(e)}")
