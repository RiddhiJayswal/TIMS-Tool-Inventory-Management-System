import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Integer, Boolean, Numeric, Date, DateTime,
    ForeignKey, CheckConstraint
)
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class StorageBin(Base):
    __tablename__ = "storage_bins"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plant_id = Column(UUID(as_uuid=True), nullable=True)
    bin_code = Column(String(20), unique=True, nullable=False)
    shelf_label = Column(String(100), nullable=False)
    section = Column(String(100), nullable=True)
    department_cat = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    capacity = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Tool(Base):
    __tablename__ = "tools"

    __table_args__ = (
        CheckConstraint("available_quantity >= 0", name="ck_tools_available_qty_non_negative"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plant_id = Column(UUID(as_uuid=True), nullable=True)
    tool_code = Column(String(50), unique=True, nullable=False)
    name = Column(String(200), nullable=False)
    category = Column(String(100), nullable=True)
    tool_type = Column(String(20), nullable=False)
    department_access = Column(String(50), nullable=True)
    is_consumable = Column(Boolean, default=False)
    make = Column(String(100), nullable=True)
    model = Column(String(100), nullable=True)
    serial_number = Column(String(100), nullable=True)
    purchase_date = Column(Date, nullable=True)
    purchase_price = Column(Numeric(12, 2), nullable=True)
    standard_life_months = Column(Integer, nullable=True)
    current_value = Column(Numeric(12, 2), nullable=True)
    total_quantity = Column(Integer, nullable=False, default=0)
    available_quantity = Column(Integer, nullable=False, default=0)
    storage_bin_id = Column(UUID(as_uuid=True), ForeignKey("storage_bins.id"), nullable=True)
    requires_calibration = Column(Boolean, default=False)
    calibration_freq_days = Column(Integer, nullable=True)
    last_calibration_date = Column(Date, nullable=True)
    next_calibration_due = Column(Date, nullable=True)
    service_partner = Column(String(200), nullable=True)
    status = Column(String(30), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
