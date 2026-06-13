"""
Seed script — run with: python seed.py (from inside backend/)
Inserts 4 users, 6 storage bins, and 10 tools.
Safe to re-run: skips records that already exist.
"""
import sys
import os
from datetime import date, timedelta

sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.environ["DATABASE_URL"]
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

from app.models.master import StorageBin, Tool
from app.models.transaction import User
from app.auth.roles import hash_password


def upsert_user(db, employee_id, full_name, email, password, role, department):
    if db.query(User).filter(User.employee_id == employee_id).first():
        print(f"  skip user {employee_id} (already exists)")
        return
    db.add(User(
        employee_id=employee_id,
        full_name=full_name,
        email=email,
        hashed_password=hash_password(password),
        role=role,
        department=department,
    ))
    print(f"  added user {employee_id}")


def upsert_bin(db, bin_code, shelf_label, dept_cat):
    if db.query(StorageBin).filter(StorageBin.bin_code == bin_code).first():
        print(f"  skip bin {bin_code} (already exists)")
        return
    db.add(StorageBin(bin_code=bin_code, shelf_label=shelf_label, department_cat=dept_cat))
    print(f"  added bin {bin_code}")


def get_bin_id(db, bin_code):
    b = db.query(StorageBin).filter(StorageBin.bin_code == bin_code).first()
    return b.id if b else None


def upsert_tool(db, tool_code, **kwargs):
    if db.query(Tool).filter(Tool.tool_code == tool_code).first():
        print(f"  skip tool {tool_code} (already exists)")
        return
    db.add(Tool(tool_code=tool_code, **kwargs))
    print(f"  added tool {tool_code}")


def main():
    db = Session()
    try:
        print("=== Seeding Users ===")
        upsert_user(db, "ADM001", "Admin User",    "admin@ultratech.com", "Admin@123", "maintenance_admin", "Maintenance")
        upsert_user(db, "STF001", "Staff User",    "staff@ultratech.com", "Staff@123", "maintenance_staff", "Maintenance")
        upsert_user(db, "HD001",  "Head E&I",      "head@ultratech.com",  "Head@123",  "dept_head",          "E&I")
        upsert_user(db, "USR001", "Requester User", "user@ultratech.com", "User@123",  "requester",          "E&I")
        db.commit()

        print("\n=== Seeding Storage Bins ===")
        upsert_bin(db, "E-01",   "E&I Cabinet A",      "E&I")
        upsert_bin(db, "E-02",   "E&I Cabinet B",      "E&I")
        upsert_bin(db, "M-01",   "Mechanical Shelf 1", "Mechanical")
        upsert_bin(db, "C-01",   "Civil Rack A",       "Civil")
        upsert_bin(db, "P-01",   "Process Cabinet C",  "Process")
        upsert_bin(db, "GEN-01", "Common Open Shelf",  "Common")
        db.commit()

        print("\n=== Seeding Tools ===")
        today = date.today()
        six_months_ago = today - timedelta(days=182)

        gen_bin = get_bin_id(db, "GEN-01")
        e_bin   = get_bin_id(db, "E-01")
        m_bin   = get_bin_id(db, "M-01")
        c_bin   = get_bin_id(db, "C-01")
        p_bin   = get_bin_id(db, "P-01")

        upsert_tool(db, "TOOL-001",
            name="Ladder 6ft", tool_type="general", total_quantity=5, available_quantity=5,
            is_consumable=False, requires_calibration=False,
            purchase_price=5000, standard_life_months=60,
            purchase_date=date(2024, 1, 1), storage_bin_id=gen_bin)

        upsert_tool(db, "TOOL-002",
            name="Ladder 12ft", tool_type="general", total_quantity=3, available_quantity=3,
            is_consumable=False, requires_calibration=False,
            purchase_price=8000, standard_life_months=60,
            purchase_date=date(2024, 1, 1), storage_bin_id=gen_bin)

        upsert_tool(db, "TOOL-003",
            name="Screwdriver Set", tool_type="general", total_quantity=10, available_quantity=10,
            is_consumable=False, requires_calibration=False,
            purchase_price=800, standard_life_months=36,
            purchase_date=date(2024, 6, 1), storage_bin_id=gen_bin)

        upsert_tool(db, "TOOL-004",
            name="Welding Rods(box)", tool_type="general", total_quantity=20, available_quantity=20,
            is_consumable=True, requires_calibration=False,
            purchase_price=500, standard_life_months=12,
            purchase_date=date(2025, 1, 1), storage_bin_id=gen_bin)

        upsert_tool(db, "TOOL-005",
            name="Weighing Machine", tool_type="specialized", total_quantity=2, available_quantity=2,
            is_consumable=False, requires_calibration=True, calibration_freq_days=180,
            last_calibration_date=six_months_ago,
            next_calibration_due=six_months_ago + timedelta(days=180),
            purchase_price=15000, standard_life_months=84,
            purchase_date=date(2023, 1, 1), storage_bin_id=gen_bin,
            service_partner="Metro Calibration Services")

        upsert_tool(db, "TOOL-006",
            name="Multimeter", tool_type="specialized", department_access="E&I",
            total_quantity=4, available_quantity=4,
            is_consumable=False, requires_calibration=True, calibration_freq_days=365,
            last_calibration_date=six_months_ago,
            next_calibration_due=six_months_ago + timedelta(days=365),
            purchase_price=3500, standard_life_months=60,
            purchase_date=date(2023, 6, 1), storage_bin_id=e_bin,
            service_partner="Fluke Service Center")

        upsert_tool(db, "TOOL-007",
            name="Torque Wrench", tool_type="specialized", department_access="Mechanical",
            total_quantity=3, available_quantity=3,
            is_consumable=False, requires_calibration=True, calibration_freq_days=180,
            last_calibration_date=six_months_ago,
            next_calibration_due=six_months_ago + timedelta(days=180),
            purchase_price=6000, standard_life_months=60,
            purchase_date=date(2023, 1, 1), storage_bin_id=m_bin,
            service_partner="Gedore Service")

        upsert_tool(db, "TOOL-008",
            name="Scaffolding Set", tool_type="specialized", department_access="Civil",
            total_quantity=2, available_quantity=2,
            is_consumable=False, requires_calibration=True, calibration_freq_days=90,
            last_calibration_date=six_months_ago,
            next_calibration_due=six_months_ago + timedelta(days=90),
            purchase_price=25000, standard_life_months=120,
            purchase_date=date(2022, 1, 1), storage_bin_id=c_bin,
            service_partner="SafeWork India")

        upsert_tool(db, "TOOL-009",
            name="Paint Brush Set", tool_type="general", department_access="Civil",
            total_quantity=8, available_quantity=8,
            is_consumable=True, requires_calibration=False,
            purchase_price=300, standard_life_months=6,
            purchase_date=date(2025, 6, 1), storage_bin_id=c_bin)

        upsert_tool(db, "TOOL-010",
            name="Temp Sensor Tester", tool_type="specialized", department_access="Process",
            total_quantity=2, available_quantity=2,
            is_consumable=False, requires_calibration=True, calibration_freq_days=365,
            last_calibration_date=six_months_ago,
            next_calibration_due=six_months_ago + timedelta(days=365),
            purchase_price=12000, standard_life_months=60,
            purchase_date=date(2023, 1, 1), storage_bin_id=p_bin,
            service_partner="Yokogawa Service")

        db.commit()
        print("\n=== Seed complete ===")
    except Exception as e:
        db.rollback()
        print(f"ERROR: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
