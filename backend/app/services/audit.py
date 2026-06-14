import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.transaction import AuditLog


def _json_safe(value):
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, uuid.UUID):
        return str(value)
    if isinstance(value, dict):
        return {key: _json_safe(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [_json_safe(item) for item in value]
    return value


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
        details=_json_safe(details),
    )
    db.add(entry)
    db.flush()
