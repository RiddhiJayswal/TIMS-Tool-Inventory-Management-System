"""add mobile otp fields to access requests

Revision ID: 0005
Revises: 0004
Create Date: 2026-06-20
"""

from alembic import op
import sqlalchemy as sa


revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("access_requests", sa.Column("mobile_number", sa.String(length=30), nullable=True))
    op.add_column("access_requests", sa.Column("otp_hash", sa.String(length=255), nullable=True))
    op.add_column("access_requests", sa.Column("otp_expires_at", sa.DateTime(), nullable=True))
    op.add_column("access_requests", sa.Column("otp_verified_at", sa.DateTime(), nullable=True))
    op.add_column("access_requests", sa.Column("otp_attempt_count", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("access_requests", "otp_attempt_count")
    op.drop_column("access_requests", "otp_verified_at")
    op.drop_column("access_requests", "otp_expires_at")
    op.drop_column("access_requests", "otp_hash")
    op.drop_column("access_requests", "mobile_number")
