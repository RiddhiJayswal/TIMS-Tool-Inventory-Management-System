"""backfill storage bin location fields

Revision ID: 0003
Revises: 0002
Create Date: 2026-06-16
"""

from alembic import op


revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


BIN_LOCATIONS = {
    "GEN-01": ("Row A", "R-01", "L1 - Ground", "Ground Floor"),
    "GEN-02": ("Row A", "R-02", "L2 - Mid", "Ground Floor"),
    "E-01": ("Row B", "R-03", "L1 - Ground", "Ground Floor"),
    "E-02": ("Row B", "R-04", "L2 - Mid", "Ground Floor"),
    "E-03": ("Row B", "R-05", "L1 - Ground", "Ground Floor"),
    "M-01": ("Row D", "R-06", "L2 - Mid", "First Floor"),
    "M-02": ("Row D", "R-07", "L1 - Ground", "First Floor"),
    "M-03": ("Row D", "R-08", "L1 - Ground", "First Floor"),
    "C-01": ("Row C", "R-09", "L1 - Ground", "Ground Floor"),
    "C-02": ("Row C", "R-10", "L2 - Mid", "Ground Floor"),
    "P-01": ("Row P", "R-11", "L1 - Ground", "Mezzanine"),
    "P-02": ("Row P", "R-12", "L2 - Mid", "Mezzanine"),
    "A-12-08": ("Row B", "R-15", "L3 - Precision", "Ground Floor"),
}


def upgrade() -> None:
    conn = op.get_bind()
    for code, (row_label, rack_number, shelf_level, floor_area) in BIN_LOCATIONS.items():
        conn.exec_driver_sql(
            """
            UPDATE storage_bins
            SET row_label = COALESCE(row_label, %(row_label)s),
                rack_number = COALESCE(rack_number, %(rack_number)s),
                shelf_level = COALESCE(shelf_level, %(shelf_level)s),
                floor_area = COALESCE(floor_area, %(floor_area)s)
            WHERE bin_code = %(bin_code)s
            """,
            {
                "bin_code": code,
                "row_label": row_label,
                "rack_number": rack_number,
                "shelf_level": shelf_level,
                "floor_area": floor_area,
            },
        )


def downgrade() -> None:
    conn = op.get_bind()
    for code in BIN_LOCATIONS:
        conn.exec_driver_sql(
            """
            UPDATE storage_bins
            SET row_label = NULL,
                rack_number = NULL,
                shelf_level = NULL,
                floor_area = NULL
            WHERE bin_code = %(bin_code)s
            """,
            {"bin_code": code},
        )
