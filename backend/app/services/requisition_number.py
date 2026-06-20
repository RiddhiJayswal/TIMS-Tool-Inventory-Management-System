"""
Generates REQ-YYYY-NNNN format requisition numbers.
Resets sequence each calendar year.
"""
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.models.transaction import Requisition
from datetime import date


def generate_requisition_number(db: Session) -> str:
    year = date.today().year
    prefix = f"REQ-{year}-"

    # Serialize number allocation for this calendar year. The lock lasts until
    # the surrounding transaction commits or rolls back, so concurrent requests
    # cannot observe the same last number.
    if db.get_bind().dialect.name == "postgresql":
        db.execute(
            text("SELECT pg_advisory_xact_lock(:lock_key)"),
            {"lock_key": 0x54494D53_0000 + year},
        )

    last = db.query(Requisition).filter(
        Requisition.requisition_number.like(f"{prefix}%")
    ).order_by(Requisition.requisition_number.desc()).first()

    if last:
        last_num = int(last.requisition_number.split("-")[-1])
        next_num = last_num + 1
    else:
        next_num = 1

    return f"{prefix}{str(next_num).zfill(4)}"
