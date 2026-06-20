import uuid
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.roles import RequireAdmin, RequireMaintenance, get_current_user
from app.database import get_db
from app.models.master import StorageBin, Tool
from app.models.transaction import Notification, User
from app.schemas.storage_bin import StorageBinCreate, StorageBinUpdate
from app.services.calibration_status import sync_calibration_statuses
from app.services.stock import get_tool_stock_snapshot
from app.services.tool_visibility import scope_tools_for_user

router = APIRouter(prefix="/storage-bins", tags=["storage-bins"])


def _notify_maintenance(db: Session, message: str) -> None:
    users = (
        db.query(User)
        .filter(User.role.in_(["maintenance_admin", "maintenance_staff"]), User.is_active == True)
        .all()
    )
    for user in users:
        db.add(Notification(user_id=user.id, message=message, is_read=False))


def _bin_used_units(db: Session, bin_id: UUID) -> int:
    return sum(
        int(t.total_quantity or 0)
        for t in db.query(Tool).filter(Tool.storage_bin_id == bin_id).all()
    )


def _bin_to_dict(bin_: StorageBin, tool_count: int = 0, used_units: int = 0) -> dict:
    remaining = None if bin_.capacity is None else max(int(bin_.capacity) - used_units, 0)
    return {
        "id": str(bin_.id),
        "bin_code": bin_.bin_code,
        "shelf_label": bin_.shelf_label,
        "section": bin_.section,
        "department_category": bin_.department_cat,
        "row_label": bin_.row_label,
        "rack_number": bin_.rack_number,
        "shelf_level": bin_.shelf_level,
        "floor_area": bin_.floor_area,
        "description": bin_.description,
        "capacity": bin_.capacity,
        "tool_count": tool_count,
        "used_units": used_units,
        "remaining_capacity": remaining,
        "created_at": bin_.created_at,
    }


@router.get("")
def list_bins(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sync_calibration_statuses(db)
    bins = db.query(StorageBin).all()
    result = []
    for b in bins:
        count = scope_tools_for_user(
            db.query(Tool).filter(Tool.storage_bin_id == b.id),
            current_user,
        ).count()
        result.append(_bin_to_dict(b, count, _bin_used_units(db, b.id)))
    return result


@router.post("", status_code=201)
def create_bin(
    payload: StorageBinCreate,
    current_user: User = Depends(RequireMaintenance),
    db: Session = Depends(get_db),
):
    if db.query(StorageBin).filter(StorageBin.bin_code == payload.bin_code).first():
        raise HTTPException(400, f"Bin code '{payload.bin_code}' already exists")

    bin_ = StorageBin(
        id=uuid.uuid4(),
        bin_code=payload.bin_code,
        shelf_label=payload.shelf_label,
        section=payload.section,
        department_cat=payload.department_cat,
        row_label=payload.row_label,
        rack_number=payload.rack_number,
        shelf_level=payload.shelf_level,
        floor_area=payload.floor_area,
        description=payload.description,
        capacity=payload.capacity,
    )
    db.add(bin_)
    _notify_maintenance(db, f"Storage bin added: {bin_.bin_code} - {bin_.shelf_label} was created by {current_user.full_name}.")
    db.commit()
    db.refresh(bin_)
    return _bin_to_dict(bin_, 0, 0)


@router.put("/{bin_id}")
def update_bin(
    bin_id: UUID,
    payload: StorageBinUpdate,
    current_user: User = Depends(RequireMaintenance),
    db: Session = Depends(get_db),
):
    sync_calibration_statuses(db)
    bin_ = db.query(StorageBin).filter(StorageBin.id == bin_id).first()
    if not bin_:
        raise HTTPException(404, "Storage bin not found")

    update_data = payload.model_dump(exclude_unset=True)
    if "capacity" in update_data and update_data["capacity"] is not None:
        used_units = _bin_used_units(db, bin_.id)
        if update_data["capacity"] < used_units:
            raise HTTPException(
                400,
                f"Capacity cannot be less than currently assigned units ({used_units})",
            )

    for field, value in update_data.items():
        setattr(bin_, field, value)

    _notify_maintenance(db, f"Storage bin updated: {bin_.bin_code} was edited by {current_user.full_name}.")
    db.commit()
    db.refresh(bin_)
    count = db.query(Tool).filter(Tool.storage_bin_id == bin_.id).count()
    return _bin_to_dict(bin_, count, _bin_used_units(db, bin_.id))


@router.get("/{bin_id}/tools")
def get_bin_tools(
    bin_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    bin_ = db.query(StorageBin).filter(StorageBin.id == bin_id).first()
    if not bin_:
        raise HTTPException(404, "Storage bin not found")

    stock_by_tool = {row["tool"].id: row for row in get_tool_stock_snapshot(db, include_written_off=True)}
    tools = scope_tools_for_user(
        db.query(Tool).filter(Tool.storage_bin_id == bin_id),
        current_user,
    ).all()
    return [
        {
            "id": str(t.id),
            "tool_code": t.tool_code,
            "name": t.name,
            "tool_type": t.tool_type,
            "available_quantity": stock_by_tool.get(t.id, {}).get("available_quantity", t.available_quantity),
            "total_quantity": stock_by_tool.get(t.id, {}).get("total_quantity", t.total_quantity),
            "issued_quantity": stock_by_tool.get(t.id, {}).get("issued_quantity", 0),
            "unavailable_quantity": stock_by_tool.get(t.id, {}).get("unavailable_quantity", 0),
            "status": t.status,
        }
        for t in tools
    ]
