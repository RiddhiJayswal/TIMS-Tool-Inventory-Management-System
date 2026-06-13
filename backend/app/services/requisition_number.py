"""
Generates REQ-YYYY-NNNN format requisition numbers.
Resets sequence each calendar year.
"""
from sqlalchemy.orm import Session
from app.models.transaction import Requisition
from datetime import date


def generate_requisition_number(db: Session) -> str:
    year = date.today().year
    prefix = f"REQ-{year}-"

    last = db.query(Requisition).filter(
        Requisition.requisition_number.like(f"{prefix}%")
    ).order_by(Requisition.requisition_number.desc()).first()

    if last:
        last_num = int(last.requisition_number.split("-")[-1])
        next_num = last_num + 1
    else:
        next_num = 1

    return f"{prefix}{str(next_num).zfill(4)}"
