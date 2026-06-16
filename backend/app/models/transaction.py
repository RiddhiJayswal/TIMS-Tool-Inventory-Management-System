import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Integer, Boolean, Numeric, Date, DateTime,
    ForeignKey, JSON, Uuid
)
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plant_id = Column(Uuid(as_uuid=True), nullable=True)
    employee_id = Column(String(50), unique=True, nullable=False)
    full_name = Column(String(200), nullable=False)
    email = Column(String(200), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(30), nullable=False)
    department = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Requisition(Base):
    __tablename__ = "requisitions"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plant_id = Column(Uuid(as_uuid=True), nullable=True)
    requisition_number = Column(String(50), unique=True, nullable=False)
    tool_id = Column(Uuid(as_uuid=True), ForeignKey("tools.id"), nullable=False)
    requested_by = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False)
    requester_dept = Column(String(100), nullable=False)
    quantity_requested = Column(Integer, nullable=False)
    purpose_of_job = Column(Text, nullable=False)
    from_date = Column(Date, nullable=False)
    to_date = Column(Date, nullable=False)
    status = Column(String(30), default="pending")
    approved_by = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class IssuanceLog(Base):
    __tablename__ = "issuance_logs"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plant_id = Column(Uuid(as_uuid=True), nullable=True)
    requisition_id = Column(Uuid(as_uuid=True), ForeignKey("requisitions.id"), nullable=False)
    tool_id = Column(Uuid(as_uuid=True), ForeignKey("tools.id"), nullable=False)
    issued_to = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False)
    issued_by = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False)
    quantity_issued = Column(Integer, nullable=False)
    issued_at = Column(DateTime, default=datetime.utcnow)
    expected_return_date = Column(Date, nullable=False)
    actual_return_date = Column(Date, nullable=True)
    return_condition = Column(String(30), nullable=True)
    quantity_returned = Column(Integer, nullable=True)
    quantity_consumed = Column(Integer, nullable=True)
    damage_type = Column(String(30), nullable=True)
    penalty_amount = Column(Numeric(12, 2), nullable=True)
    depreciated_value_at_issue = Column(Numeric(12, 2), nullable=True)
    market_rate_at_damage = Column(Numeric(12, 2), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    entity = Column(String(50), nullable=False)
    entity_id = Column(Uuid(as_uuid=True), nullable=False)
    details = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plant_id = Column(Uuid(as_uuid=True), nullable=True)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class AccessRequest(Base):
    __tablename__ = "access_requests"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_id = Column(String(50), unique=True, nullable=False)
    full_name = Column(String(200), nullable=False)
    email = Column(String(200), nullable=False)
    employee_id = Column(String(50), nullable=True)
    department = Column(String(100), nullable=False)
    requested_role = Column(String(30), nullable=False)
    reason = Column(Text, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    status = Column(String(30), default="pending")
    approved_by = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
