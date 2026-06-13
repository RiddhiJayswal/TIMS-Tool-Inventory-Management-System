"""initial_schema

Revision ID: 0001
Revises:
Create Date: 2026-06-13 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # storage_bins
    op.create_table(
        "storage_bins",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("plant_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("bin_code", sa.String(20), nullable=False, unique=True),
        sa.Column("shelf_label", sa.String(100), nullable=False),
        sa.Column("section", sa.String(100), nullable=True),
        sa.Column("department_cat", sa.String(50), nullable=True),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("capacity", sa.Integer, nullable=True),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

    # tools
    op.create_table(
        "tools",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("plant_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("tool_code", sa.String(50), nullable=False, unique=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("category", sa.String(100), nullable=True),
        sa.Column("tool_type", sa.String(20), nullable=False),
        sa.Column("department_access", sa.String(50), nullable=True),
        sa.Column("is_consumable", sa.Boolean, server_default=sa.false()),
        sa.Column("make", sa.String(100), nullable=True),
        sa.Column("model", sa.String(100), nullable=True),
        sa.Column("serial_number", sa.String(100), nullable=True),
        sa.Column("purchase_date", sa.Date, nullable=True),
        sa.Column("purchase_price", sa.Numeric(12, 2), nullable=True),
        sa.Column("standard_life_months", sa.Integer, nullable=True),
        sa.Column("current_value", sa.Numeric(12, 2), nullable=True),
        sa.Column("total_quantity", sa.Integer, nullable=False, server_default="0"),
        sa.Column("available_quantity", sa.Integer, nullable=False, server_default="0"),
        sa.Column(
            "storage_bin_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("storage_bins.id"),
            nullable=True,
        ),
        sa.Column("requires_calibration", sa.Boolean, server_default=sa.false()),
        sa.Column("calibration_freq_days", sa.Integer, nullable=True),
        sa.Column("last_calibration_date", sa.Date, nullable=True),
        sa.Column("next_calibration_due", sa.Date, nullable=True),
        sa.Column("service_partner", sa.String(200), nullable=True),
        sa.Column("status", sa.String(30), server_default="active"),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, server_default=sa.func.now()),
        sa.CheckConstraint("available_quantity >= 0", name="ck_tools_available_qty_non_negative"),
    )

    # users
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("plant_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("employee_id", sa.String(50), nullable=False, unique=True),
        sa.Column("full_name", sa.String(200), nullable=False),
        sa.Column("email", sa.String(200), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("role", sa.String(30), nullable=False),
        sa.Column("department", sa.String(100), nullable=False),
        sa.Column("is_active", sa.Boolean, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

    # requisitions
    op.create_table(
        "requisitions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("plant_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("requisition_number", sa.String(50), nullable=False, unique=True),
        sa.Column("tool_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tools.id"), nullable=False),
        sa.Column("requested_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("requester_dept", sa.String(100), nullable=False),
        sa.Column("quantity_requested", sa.Integer, nullable=False),
        sa.Column("purpose_of_job", sa.Text, nullable=False),
        sa.Column("from_date", sa.Date, nullable=False),
        sa.Column("to_date", sa.Date, nullable=False),
        sa.Column("status", sa.String(30), server_default="pending"),
        sa.Column("approved_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("approved_at", sa.DateTime, nullable=True),
        sa.Column("rejection_reason", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, server_default=sa.func.now()),
    )

    # issuance_logs
    op.create_table(
        "issuance_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("plant_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("requisition_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("requisitions.id"), nullable=False),
        sa.Column("tool_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tools.id"), nullable=False),
        sa.Column("issued_to", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("issued_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("quantity_issued", sa.Integer, nullable=False),
        sa.Column("issued_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("expected_return_date", sa.Date, nullable=False),
        sa.Column("actual_return_date", sa.Date, nullable=True),
        sa.Column("return_condition", sa.String(30), nullable=True),
        sa.Column("quantity_returned", sa.Integer, nullable=True),
        sa.Column("quantity_consumed", sa.Integer, nullable=True),
        sa.Column("damage_type", sa.String(30), nullable=True),
        sa.Column("penalty_amount", sa.Numeric(12, 2), nullable=True),
        sa.Column("depreciated_value_at_issue", sa.Numeric(12, 2), nullable=True),
        sa.Column("market_rate_at_damage", sa.Numeric(12, 2), nullable=True),
        sa.Column("notes", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, server_default=sa.func.now()),
    )

    # audit_log
    op.create_table(
        "audit_log",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("entity", sa.String(50), nullable=False),
        sa.Column("entity_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("details", postgresql.JSON, nullable=True),
        sa.Column("timestamp", sa.DateTime, server_default=sa.func.now()),
    )

    # notifications
    op.create_table(
        "notifications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("plant_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("message", sa.Text, nullable=False),
        sa.Column("is_read", sa.Boolean, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("notifications")
    op.drop_table("audit_log")
    op.drop_table("issuance_logs")
    op.drop_table("requisitions")
    op.drop_table("users")
    op.drop_table("tools")
    op.drop_table("storage_bins")
