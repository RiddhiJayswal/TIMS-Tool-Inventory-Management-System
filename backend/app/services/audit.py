from app.models.transaction import AuditLog
from sqlalchemy.orm import Session
import uuid


def log_action(
    db: Session,
    user_id: str,
    action: str,
    entity: str,
    entity_id: str,
    details: dict = None,
):
    entry = AuditLog(
        id=uuid.uuid4(),
        user_id=user_id,
        action=action,
        entity=entity,
        entity_id=entity_id,
        details=details,
    )
    db.add(entry)
    db.flush()
