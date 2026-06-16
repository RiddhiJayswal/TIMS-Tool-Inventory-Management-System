from datetime import date

from sqlalchemy.orm import Session

from app.models.master import Tool


def sync_calibration_statuses(db: Session, today: date | None = None) -> None:
    """Keep calibration-blocked tool status derived from due dates."""
    today = today or date.today()
    tools = db.query(Tool).filter(Tool.requires_calibration == True).all()
    changed = False

    for tool in tools:
        overdue = bool(tool.next_calibration_due and tool.next_calibration_due <= today)
        if overdue and tool.status == "active":
            tool.status = "calibration_due"
            changed = True
        elif not overdue and tool.status == "calibration_due":
            tool.status = "active"
            changed = True

    if changed:
        db.flush()


def is_calibration_blocked(tool: Tool, today: date | None = None) -> bool:
    today = today or date.today()
    return bool(
        tool.requires_calibration
        and tool.next_calibration_due
        and tool.next_calibration_due <= today
    )
