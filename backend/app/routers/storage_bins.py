import uuid
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.roles import RequireAdmin, get_current_user
from app.database import get_db
from app.models.master import StorageBin, Tool
from app.models.transaction import User
from app.schemas.storage_bin import StorageBinCreate, StorageBinUpdate

router = APIRouter(prefix="/bins", tags=["storage-bins"])


def _bin_to_dict(bin_: StorageBin, tool_count: int = 0) -> dict:
    return {
        "id": str(bin_.id),
        "bin_code": bin_.bin_code,
        "shelf_label": bin_.shelf_label,
        "section": bin_.section,
        "department_cat": bin_.department_cat,
        "description": bin_.description,
        "capacity": bin_.capacity,
        "tool_count": tool_count,
        "created_at": bin_.created_at,
    }


@router.get("")
def list_bins(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    bins = db.query(StorageBin).all()
    result = []
    for b in bins:
        count = db.query(Tool).filter(Tool.storage_bin_id == b.id).count()
        result.append(_bin_to_dict(b, count))
    return result


@router.post("", status_code=201)
def create_bin(
    payload: StorageBinCreate,
    current_user: User = Depends(RequireAdmin),
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
        description=payload.description,
        capacity=payload.capacity,
    )
    db.add(bin_)
    db.commit()
    db.refresh(bin_)
    return _bin_to_dict(bin_, 0)


@router.put("/{bin_id}")
def update_bin(
    bin_id: UUID,
    payload: StorageBinUpdate,
    current_user: User = Depends(RequireAdmin),
    db: Session = Depends(get_db),
):
    bin_ = db.query(StorageBin).filter(StorageBin.id == bin_id).first()
    if not bin_:
        raise HTTPException(404, "Storage bin not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(bin_, field, value)

    db.commit()
    db.refresh(bin_)
    count = db.query(Tool).filter(Tool.storage_bin_id == bin_.id).count()
    return _bin_to_dict(bin_, count)


@router.get("/{bin_id}/tools")
def get_bin_tools(
    bin_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    bin_ = db.query(StorageBin).filter(StorageBin.id == bin_id).first()
    if not bin_:
        raise HTTPException(404, "Storage bin not found")

    tools = db.query(Tool).filter(Tool.storage_bin_id == bin_id).all()
    return [
        {
            "id": str(t.id),
            "tool_code": t.tool_code,
            "name": t.name,
            "tool_type": t.tool_type,
            "available_quantity": t.available_quantity,
            "total_quantity": t.total_quantity,
            "status": t.status,
        }
        for t in tools
    ]
