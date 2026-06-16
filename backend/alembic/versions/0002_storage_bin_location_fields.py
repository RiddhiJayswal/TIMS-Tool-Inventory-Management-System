"""add storage bin location fields

Revision ID: 0002
Revises: 0001
Create Date: 2026-06-16 14:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("storage_bins", sa.Column("row_label", sa.String(50), nullable=True))
    op.add_column("storage_bins", sa.Column("rack_number", sa.String(50), nullable=True))
    op.add_column("storage_bins", sa.Column("shelf_level", sa.String(50), nullable=True))
    op.add_column("storage_bins", sa.Column("floor_area", sa.String(100), nullable=True))


def downgrade() -> None:
    op.drop_column("storage_bins", "floor_area")
    op.drop_column("storage_bins", "shelf_level")
    op.drop_column("storage_bins", "rack_number")
    op.drop_column("storage_bins", "row_label")
