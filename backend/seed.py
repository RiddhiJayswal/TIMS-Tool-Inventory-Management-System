"""
Comprehensive seed script for TIMS.
Run with:  python seed.py  (from inside backend/)

Clears ALL existing data, then inserts:
  - 4 users  (from README)
  - 12 storage bins
  - 55 tools  (general + E&I + Mechanical + Civil + Process)
  - 15 requisitions  (pending / approved / rejected / issued / returned)
  - 8 open issuance logs  (2 overdue)
  - 3 returned issuance logs
  - Notifications for each user
"""

import sys, os, uuid
from datetime import date, datetime, timedelta

sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.environ["DATABASE_URL"]
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {})
Session = sessionmaker(bind=engine)

from app.models.master import StorageBin, Tool
from app.models.transaction import User, Requisition, IssuanceLog, Notification, AuditLog
from app.database import Base
from app.auth.roles import hash_password

TODAY  = date.today()
NOW    = datetime.utcnow()

# ─────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────
def uid(): return uuid.uuid4()

def req_no(n): return f"REQ-2026-{n:04d}"

def days_ago(n): return TODAY - timedelta(days=n)
def days_from(n): return TODAY + timedelta(days=n)


# ─────────────────────────────────────────────────────────────────
# WIPE
# ─────────────────────────────────────────────────────────────────
def wipe(db):
    print("Wiping existing data…")
    for model in [Notification, AuditLog, IssuanceLog, Requisition, User, Tool, StorageBin]:
        db.query(model).delete()
    db.commit()
    print("  done.")


# ─────────────────────────────────────────────────────────────────
# USERS
# ─────────────────────────────────────────────────────────────────
def seed_users(db):
    print("\n=== Users ===")
    users = [
        User(id=uid(), employee_id="ADM001", full_name="Admin User",
             email="admin@ultratech.com", hashed_password=hash_password("password123"),
             role="maintenance_admin", department="Maintenance"),
        User(id=uid(), employee_id="ADM002", full_name="Second Admin User",
             email="admin2@ultratech.com", hashed_password=hash_password("password123"),
             role="maintenance_admin", department="Maintenance"),
        User(id=uid(), employee_id="STF001", full_name="Staff User",
             email="staff@ultratech.com", hashed_password=hash_password("password123"),
             role="maintenance_staff", department="Maintenance"),
        User(id=uid(), employee_id="STF002", full_name="Second Staff User",
             email="staff2@ultratech.com", hashed_password=hash_password("password123"),
             role="maintenance_staff", department="Maintenance"),
        User(id=uid(), employee_id="HD001",  full_name="Head E&I",
             email="head@ultratech.com", hashed_password=hash_password("password123"),
             role="dept_head", department="E&I"),
        User(id=uid(), employee_id="HD002",  full_name="Head Mechanical",
             email="head2@ultratech.com", hashed_password=hash_password("password123"),
             role="dept_head", department="Mechanical"),
        User(id=uid(), employee_id="USR001", full_name="Requester User",
             email="user@ultratech.com", hashed_password=hash_password("password123"),
             role="requester", department="E&I"),
        User(id=uid(), employee_id="USR002", full_name="Second Requester User",
             email="user2@ultratech.com", hashed_password=hash_password("password123"),
             role="requester", department="Mechanical"),
    ]
    for u in users:
        db.add(u)
        print(f"  + {u.employee_id}  ({u.role})")
    db.commit()
    return {u.employee_id: u for u in users}


# ─────────────────────────────────────────────────────────────────
# STORAGE BINS
# ─────────────────────────────────────────────────────────────────
def seed_bins(db):
    print("\n=== Storage Bins ===")
    bins_data = [
        ("GEN-01", "Common Open Shelf A",      "Bay 1",  "Common",     100),
        ("GEN-02", "Common Open Shelf B",      "Bay 2",  "Common",      80),
        ("E-01",   "E&I Cabinet A",            "E&I Row", "E&I",        40),
        ("E-02",   "E&I Cabinet B",            "E&I Row", "E&I",        40),
        ("E-03",   "E&I Instrument Shelf",     "E&I Row", "E&I",        25),
        ("M-01",   "Mechanical Shelf 1",       "Mech Bay","Mechanical", 60),
        ("M-02",   "Mechanical Shelf 2",       "Mech Bay","Mechanical", 60),
        ("M-03",   "Heavy Equipment Bay",      "Mech Bay","Mechanical", 20),
        ("C-01",   "Civil Rack A",             "Civil Row","Civil",     50),
        ("C-02",   "Civil Storage Cage",       "Civil Row","Civil",     30),
        ("P-01",   "Process Cabinet C",        "Process Row","Process", 35),
        ("P-02",   "Process Instrument Rack",  "Process Row","Process", 25),
    ]
    bins = {}
    floor_by_dept = {
        "Common": ("Row A", "Ground Floor"),
        "E&I": ("Row B", "Ground Floor"),
        "Mechanical": ("Row D", "First Floor"),
        "Civil": ("Row C", "Ground Floor"),
        "Process": ("Row P", "Mezzanine"),
    }
    for idx, (code, shelf, section, dept, cap) in enumerate(bins_data, start=1):
        row_label, floor_area = floor_by_dept.get(dept, ("Row A", "Ground Floor"))
        b = StorageBin(id=uid(), bin_code=code, shelf_label=shelf,
                       section=section, department_cat=dept, capacity=cap,
                       row_label=row_label, rack_number=f"R-{idx:02d}",
                       shelf_level="L2 - Mid" if idx % 2 == 0 else "L1 - Ground",
                       floor_area=floor_area)
        db.add(b)
        bins[code] = b
        print(f"  + {code}")
    db.commit()
    return bins


# ─────────────────────────────────────────────────────────────────
# TOOLS  (55 tools)
# ─────────────────────────────────────────────────────────────────
def seed_tools(db, bins):
    print("\n=== Tools ===")
    today = TODAY
    SIX_M   = today - timedelta(days=182)
    ONE_Y   = today - timedelta(days=365)
    CAL_DUE = today + timedelta(days=4)   # calibration due in 4 days (triggers warning)
    OVERDUE_CAL = today - timedelta(days=10)  # already overdue

    GEN = bins["GEN-01"]
    GEN2 = bins["GEN-02"]
    EI1 = bins["E-01"]
    EI2 = bins["E-02"]
    EI3 = bins["E-03"]
    M1  = bins["M-01"]
    M2  = bins["M-02"]
    M3  = bins["M-03"]
    C1  = bins["C-01"]
    C2  = bins["C-02"]
    P1  = bins["P-01"]
    P2  = bins["P-02"]

    def tool(code, name, ttype, bin_obj, total, avail=None, dept=None,
             cons=False, cal=False, freq=None, last_cal=None, next_cal=None,
             partner=None, price=0, life=60, pdate=None, status="active"):
        if avail is None:
            avail = total
        t = Tool(
            id=uid(),
            tool_code=code, name=name,
            tool_type=ttype,
            department_access=dept,
            is_consumable=cons,
            total_quantity=total,
            available_quantity=avail,
            storage_bin_id=bin_obj.id,
            requires_calibration=cal,
            calibration_freq_days=freq,
            last_calibration_date=last_cal,
            next_calibration_due=next_cal,
            service_partner=partner,
            purchase_price=price,
            standard_life_months=life,
            purchase_date=pdate or date(2023, 1, 1),
            status=status,
        )
        db.add(t)
        print(f"  + {code}  {name}  (avail {t.available_quantity}/{total})")
        return t

    # ── General Tools ──────────────────────────────────────────────
    t01 = tool("GEN-001", "Ladder 6ft",                "general", GEN, 5,  price=5000,  life=72,  pdate=date(2023,6,1))
    t02 = tool("GEN-002", "Ladder 12ft",               "general", GEN, 3,  price=9000,  life=72,  pdate=date(2023,6,1))
    t03 = tool("GEN-003", "Ladder 20ft",               "general", GEN, 2,  price=15000, life=72,  pdate=date(2023,6,1))
    t04 = tool("GEN-004", "Screwdriver Set (8 pcs)",   "general", GEN, 8,  price=1200, life=48, pdate=date(2024,1,1))
    t05 = tool("GEN-005", "Hammer – Claw 16oz",        "general", GEN, 10, price=600,   life=60,  pdate=date(2023,1,1))
    t06 = tool("GEN-006", "Hammer – Ball Peen 500g",   "general", GEN, 6,  price=500,   life=60,  pdate=date(2023,1,1))
    t07 = tool("GEN-007", "Combination Wrench Set",    "general", GEN, 5,  avail=4, price=2500,  life=60,  pdate=date(2023,6,1))
    t08 = tool("GEN-008", "Pliers Set (5 pcs)",        "general", GEN, 8,  price=1800,  life=48,  pdate=date(2024,1,1))
    t09 = tool("GEN-009", "Hex Key Set (metric)",      "general", GEN, 6,  price=900,   life=48,  pdate=date(2024,1,1))
    t10 = tool("GEN-010", "Measuring Tape 10m",        "general", GEN, 8,  avail=6, price=350,   life=36,  pdate=date(2024,6,1))
    t11 = tool("GEN-011", "Measuring Tape 30m",        "general", GEN, 3,  price=800,   life=36,  pdate=date(2024,6,1))
    t12 = tool("GEN-012", "Safety Helmet (IS:2925)",   "general", GEN2,20, price=450,  life=36,  pdate=date(2024,1,1))
    t13 = tool("GEN-013", "Safety Harness Full Body",  "general", GEN2,10, avail=8, price=3500,  life=36,  pdate=date(2024,1,1))
    t14 = tool("GEN-014", "LED Flashlight (heavy duty)","general",GEN2,12, price=800,  life=36,  pdate=date(2024,6,1))
    t15 = tool("GEN-015", "Extension Cord Reel 30m",   "general", GEN2, 4, price=2200,  life=48,  pdate=date(2023,6,1))
    t16 = tool("GEN-016", "Angle Grinder 4.5\"",       "general", GEN2, 4, price=4500,  life=48,  pdate=date(2023,6,1))
    t17 = tool("GEN-017", "Electric Drill – Cordless", "general", GEN2, 6, price=6500,  life=48,  pdate=date(2023,6,1))
    t18 = tool("GEN-018", "Jigsaw – Electric",         "general", GEN2, 3, price=8500,  life=60,  pdate=date(2023,1,1))
    t19 = tool("GEN-019", "Toolbox – Large (with lock)","general",GEN2, 5, price=3500,  life=84,  pdate=date(2022,1,1))
    t20 = tool("GEN-020", "Duct Tape (48mm × 50m)",    "general", GEN, 50, cons=True, price=180, life=12, pdate=date(2025,6,1))
    t21 = tool("GEN-021", "Electrical Insulation Tape", "general",GEN, 40, cons=True, price=65, life=12, pdate=date(2025,6,1))
    t22 = tool("GEN-022", "Welding Rods – Box (5 kg)", "general", GEN, 20, cons=True, price=700, life=12, pdate=date(2025,1,1))
    t23 = tool("GEN-023", "Zip Ties Pack (100 pcs)",   "general", GEN, 30, cons=True, price=120, life=12, pdate=date(2025,6,1))

    # ── E&I Tools ──────────────────────────────────────────────────
    t24 = tool("EI-001", "Multimeter – Fluke 87V",         "specialized", EI1, 4,
               dept="E&I", cal=True, freq=365, last_cal=SIX_M,
               next_cal=SIX_M+timedelta(days=365), partner="Fluke Service Centre",
               price=28000, life=84, pdate=date(2022,6,1))
    t25 = tool("EI-002", "Clamp Meter – Fluke 376",        "specialized", EI1, 3,
               dept="E&I", cal=True, freq=365, last_cal=SIX_M,
               next_cal=SIX_M+timedelta(days=365), partner="Fluke Service Centre",
               price=22000, life=84, pdate=date(2022,6,1))
    t26 = tool("EI-003", "Insulation Tester – Megger MIT430","specialized", EI1, 2,
               dept="E&I", cal=True, freq=180, last_cal=SIX_M,
               next_cal=SIX_M+timedelta(days=180), partner="Megger India",
               price=45000, life=84, pdate=date(2021,6,1))
    t27 = tool("EI-004", "Cable Tester – Fluke 1T-1000",   "specialized", EI1, 3,
               dept="E&I", cal=True, freq=365, last_cal=SIX_M,
               next_cal=CAL_DUE,  # due in 4 days – triggers warning
               partner="Fluke Service Centre",
               price=18000, life=60, pdate=date(2022,1,1))
    t28 = tool("EI-005", "Oscilloscope – Hantek Portable",  "specialized", EI2, 1,
               dept="E&I", cal=True, freq=365, last_cal=OVERDUE_CAL,
               next_cal=OVERDUE_CAL+timedelta(days=365),  # overdue
               partner="Hantek Electronics",
               price=35000, life=60, pdate=date(2021,1,1), status="calibration_due")
    t29 = tool("EI-006", "Loop Calibrator – Fluke 709H",    "specialized", EI2, 2,
               dept="E&I", cal=True, freq=180, last_cal=SIX_M,
               next_cal=CAL_DUE,  # due soon
               partner="Fluke Service Centre",
               price=52000, life=84, pdate=date(2021,6,1))
    t30 = tool("EI-007", "Crimping Tool Set – Ratchet",     "specialized", EI2, 4, dept="E&I", price=3500, life=60, pdate=date(2023,1,1))
    t31 = tool("EI-008", "Wire Stripper – Automatic",       "specialized", EI2, 5, avail=4, dept="E&I", price=1800, life=48, pdate=date(2023,6,1))
    t32 = tool("EI-009", "Soldering Station – Hakko FX888", "specialized", EI3, 3, dept="E&I", price=12000, life=60, pdate=date(2022,1,1))
    t33 = tool("EI-010", "Network Cable Tester – RJ45",     "specialized", EI3, 4, dept="E&I", price=2800, life=48, pdate=date(2023,1,1))

    # ── Mechanical Tools ───────────────────────────────────────────
    t34 = tool("MECH-001", "Torque Wrench 0–100 Nm",        "specialized", M1, 3,
               dept="Mechanical", cal=True, freq=180, last_cal=SIX_M,
               next_cal=SIX_M+timedelta(days=180), partner="Gedore Service India",
               price=8500, life=60, pdate=date(2022,6,1))
    t35 = tool("MECH-002", "Torque Wrench 100–500 Nm",      "specialized", M1, 2,
               dept="Mechanical", cal=True, freq=180, last_cal=SIX_M,
               next_cal=CAL_DUE,  # due soon
               partner="Gedore Service India",
               price=18000, life=60, pdate=date(2022,6,1))
    t36 = tool("MECH-003", "Hydraulic Jack – 5 Ton",        "specialized", M3, 2, dept="Mechanical", price=22000, life=84, pdate=date(2022,1,1))
    t37 = tool("MECH-004", "Hydraulic Jack – 10 Ton",       "specialized", M3, 1, dept="Mechanical", price=38000, life=84, pdate=date(2021,1,1))
    t38 = tool("MECH-005", "Bearing Puller Set (3-jaw)",     "specialized", M1, 2, avail=1, dept="Mechanical", price=4500, life=60, pdate=date(2023,1,1))
    t39 = tool("MECH-006", "Gear Puller Set",                "specialized", M1, 2, dept="Mechanical", price=3800, life=60, pdate=date(2023,1,1))
    t40 = tool("MECH-007", "Dial Indicator + Magnetic Base", "specialized", M2,
               3, dept="Mechanical", cal=True, freq=365, last_cal=ONE_Y,
               next_cal=CAL_DUE,  # due soon
               partner="Mitutoyo Service",
               price=7500, life=60, pdate=date(2022,6,1))
    t41 = tool("MECH-008", "Vernier Caliper 150mm",          "specialized", M2, 5,
               dept="Mechanical", cal=True, freq=365, last_cal=SIX_M,
               next_cal=SIX_M+timedelta(days=365), partner="Mitutoyo Service",
               price=3500, life=60, pdate=date(2023,1,1))
    t42 = tool("MECH-009", "Micrometer Set (0–75mm)",        "specialized", M2, 3,
               dept="Mechanical", cal=True, freq=365, last_cal=SIX_M,
               next_cal=SIX_M+timedelta(days=365), partner="Mitutoyo Service",
               price=9500, life=60, pdate=date(2022,1,1))
    t43 = tool("MECH-010", "Chain Block – 1 Ton",            "specialized", M3, 4, dept="Mechanical", price=12000, life=84, pdate=date(2021,6,1))
    t44 = tool("MECH-011", "Chain Block – 3 Ton",            "specialized", M3, 2, avail=1, dept="Mechanical", price=28000, life=84, pdate=date(2021,6,1))
    t45 = tool("MECH-012", "Grease Gun – Pneumatic",         "specialized", M1, 4, dept="Mechanical", price=6500, life=60, pdate=date(2023,1,1))
    t46 = tool("MECH-013", "Vibration Analyzer – SKF CMVL",  "specialized", M2, 1,
               dept="Mechanical", cal=True, freq=365, last_cal=SIX_M,
               next_cal=SIX_M+timedelta(days=365), partner="SKF India Service",
               price=145000, life=84, pdate=date(2021,1,1))
    t47 = tool("MECH-014", "Laser Alignment Tool – SKF TKSA","specialized", M2, 1,
               dept="Mechanical", cal=True, freq=365, last_cal=OVERDUE_CAL,
               next_cal=OVERDUE_CAL+timedelta(days=365),  # overdue
               partner="SKF India Service",
               price=210000, life=84, pdate=date(2020,6,1), status="calibration_due")
    t48 = tool("MECH-015", "Pipe Wrench Set (3 pcs)",        "specialized", M1, 3, dept="Mechanical", price=5500, life=60, pdate=date(2023,6,1))

    # ── Civil Tools ────────────────────────────────────────────────
    t49 = tool("CIV-001", "Scaffolding Set (full, 4m)",      "specialized", C2, 2, dept="Civil", price=65000, life=120, pdate=date(2021,1,1))
    t50 = tool("CIV-002", "Rotary Hammer Drill – Bosch",     "specialized", C1, 3, dept="Civil", price=12000, life=60, pdate=date(2022,6,1))
    t51 = tool("CIV-003", "Digital Level – 600mm",           "specialized", C1, 4,
               dept="Civil", cal=True, freq=365, last_cal=SIX_M,
               next_cal=SIX_M+timedelta(days=365), partner="Bosch Service Centre",
               price=6500, life=48, pdate=date(2023,1,1))
    t52 = tool("CIV-004", "Total Station – Leica TS07",      "specialized", C2, 1,
               dept="Civil", cal=True, freq=365, last_cal=SIX_M,
               next_cal=SIX_M+timedelta(days=365), partner="Leica Geosystems India",
               price=320000, life=120, pdate=date(2020,1,1))
    t53 = tool("CIV-005", "Paint Brush Set (8 pcs)",         "general",     C1, 15, cons=True, price=450, life=6, pdate=date(2025,6,1))
    t54 = tool("CIV-006", "Masking Tape 50mm × 50m",         "general",     C1, 30, cons=True, price=85, life=12, pdate=date(2025,6,1))
    t55 = tool("CIV-007", "Angle Grinder Disc Set",          "specialized", C1, 10, cons=True, dept="Civil", price=320, life=6, pdate=date(2025,1,1))

    # ── Process Tools ──────────────────────────────────────────────
    t56 = tool("PROC-001", "Temperature Sensor Tester",      "specialized", P1, 2,
               dept="Process", cal=True, freq=365, last_cal=SIX_M,
               next_cal=SIX_M+timedelta(days=365), partner="Yokogawa India",
               price=18000, life=60, pdate=date(2022,1,1))
    t57 = tool("PROC-002", "Pressure Gauge Calibrator",      "specialized", P1, 2,
               dept="Process", cal=True, freq=180, last_cal=SIX_M,
               next_cal=SIX_M+timedelta(days=180), partner="Wika India",
               price=32000, life=60, pdate=date(2022,1,1))
    t58 = tool("PROC-003", "Portable Flow Meter – Ultrasonic","specialized",P1, 1,
               dept="Process", cal=True, freq=365, last_cal=SIX_M,
               next_cal=SIX_M+timedelta(days=365), partner="Endress+Hauser India",
               price=85000, life=84, pdate=date(2021,6,1))
    t59 = tool("PROC-004", "pH Meter – Hanna HI-2222",       "specialized", P2, 2,
               dept="Process", cal=True, freq=180, last_cal=SIX_M,
               next_cal=CAL_DUE,  # due soon
               partner="Hanna Instruments India",
               price=15000, life=48, pdate=date(2023,1,1))
    t60 = tool("PROC-005", "Infrared Thermometer – Fluke 572","specialized",P2, 4,
               dept="Process", cal=True, freq=365, last_cal=SIX_M,
               next_cal=SIX_M+timedelta(days=365), partner="Fluke Service Centre",
               price=22000, life=60, pdate=date(2022,6,1))
    t61 = tool("PROC-006", "Data Logger – Testo 176 H1",     "specialized", P2, 2,
               dept="Process", cal=True, freq=365, last_cal=SIX_M,
               next_cal=SIX_M+timedelta(days=365), partner="Testo India",
               price=28000, life=60, pdate=date(2022,1,1))
    t62 = tool("PROC-007", "Weighing Machine – Bench 30kg",  "specialized", P1, 2,
               dept="Process", cal=True, freq=180, last_cal=SIX_M,
               next_cal=SIX_M+timedelta(days=180), partner="Metro Calibration",
               price=18000, life=84, pdate=date(2022,6,1))

    db.commit()

    tools = {t.tool_code: t for t in [
        t01,t02,t03,t04,t05,t06,t07,t08,t09,t10,
        t11,t12,t13,t14,t15,t16,t17,t18,t19,t20,
        t21,t22,t23,t24,t25,t26,t27,t28,t29,t30,
        t31,t32,t33,t34,t35,t36,t37,t38,t39,t40,
        t41,t42,t43,t44,t45,t46,t47,t48,t49,t50,
        t51,t52,t53,t54,t55,t56,t57,t58,t59,t60,
        t61,t62,
    ]}
    print(f"  Total tools seeded: {len(tools)}")
    return tools


# ─────────────────────────────────────────────────────────────────
# REQUISITIONS + ISSUANCES
# ─────────────────────────────────────────────────────────────────
def seed_transactions(db, users, tools):
    print("\n=== Requisitions & Issuances ===")

    adm  = users["ADM001"]
    stf  = users["STF001"]
    hd   = users["HD001"]
    usr  = users["USR001"]

    def req(num, tool_code, by_user, qty, purpose, from_dt, to_dt,
            status, approved_by=None, approved_at=None, rejection_reason=None):
        r = Requisition(
            id=uid(),
            requisition_number=req_no(num),
            tool_id=tools[tool_code].id,
            requested_by=by_user.id,
            requester_dept=by_user.department,
            quantity_requested=qty,
            purpose_of_job=purpose,
            from_date=from_dt,
            to_date=to_dt,
            status=status,
            approved_by=approved_by.id if approved_by else None,
            approved_at=approved_at,
            rejection_reason=rejection_reason,
        )
        db.add(r)
        db.flush()
        return r

    def issue(req_obj, tool_code, to_user, by_user, qty, issued_dt,
              expected_return, actual_return=None, condition=None, qty_returned=None):
        log = IssuanceLog(
            id=uid(),
            requisition_id=req_obj.id,
            tool_id=tools[tool_code].id,
            issued_to=to_user.id,
            issued_by=by_user.id,
            quantity_issued=qty,
            issued_at=issued_dt,
            expected_return_date=expected_return,
            actual_return_date=actual_return,
            return_condition=condition,
            quantity_returned=qty_returned,
        )
        db.add(log)
        return log

    # ── 1. PENDING requisitions ────────────────────────────────────
    r1 = req(1, "GEN-001", usr, 2,
             "Rooftop light fixture inspection – Silo 3 access required",
             days_from(1), days_from(7), "pending")

    r2 = req(2, "EI-001", usr, 1,
             "Transformer panel voltage verification – CB-12 switchgear room",
             days_from(1), days_from(4), "pending")

    r3 = req(3, "GEN-012", hd, 5,
             "Annual safety audit – all field personnel require helmets",
             days_from(2), days_from(10), "pending")

    r4 = req(4, "GEN-017", usr, 2,
             "Cable tray drilling – E&I room second floor expansion",
             days_from(3), days_from(8), "pending")

    # ── 2. APPROVED requisitions (ready to issue) ──────────────────
    r5 = req(5, "MECH-001", usr, 1,
             "Pump coupling bolt tightening – Raw mill area PM-05",
             days_ago(2), days_from(5), "approved",
             approved_by=hd, approved_at=datetime.utcnow() - timedelta(hours=6))

    r6 = req(6, "GEN-016", hd, 1,
             "Grinding excess weld bead – kiln tyre cooling duct",
             days_ago(1), days_from(4), "approved",
             approved_by=hd, approved_at=datetime.utcnow() - timedelta(hours=2))

    r7 = req(7, "EI-002", usr, 1,
             "Motor current draw measurement – blower BW-03 & BW-04",
             days_ago(1), days_from(3), "approved",
             approved_by=hd, approved_at=datetime.utcnow() - timedelta(hours=4))

    # ── 3. ISSUED requisitions (open issuances) ────────────────────
    # 3a – On time
    r8 = req(8, "GEN-007", usr, 1,
             "Flange bolt tightening – cooling water pipeline valve bypass",
             days_ago(5), days_from(2), "issued",
             approved_by=hd, approved_at=datetime.utcnow() - timedelta(days=5))
    i8 = issue(r8, "GEN-007", usr, stf, 1,
               datetime.utcnow() - timedelta(days=5),
               days_from(2))

    # 3b – On time
    r9 = req(9, "EI-008", usr, 1,
             "Control panel terminal rewiring – MCC room cabinet C-7",
             days_ago(3), days_from(4), "issued",
             approved_by=hd, approved_at=datetime.utcnow() - timedelta(days=3))
    i9 = issue(r9, "EI-008", usr, stf, 1,
               datetime.utcnow() - timedelta(days=3),
               days_from(4))

    # 3c – On time
    r10 = req(10, "MECH-005", usr, 1,
              "Bearing replacement – ID fan motor south side",
              days_ago(4), days_from(3), "issued",
              approved_by=hd, approved_at=datetime.utcnow() - timedelta(days=4))
    i10 = issue(r10, "MECH-005", usr, stf, 1,
                datetime.utcnow() - timedelta(days=4),
                days_from(3))

    # 3d – OVERDUE (expected return was 3 days ago)
    r11 = req(11, "GEN-013", usr, 2,
              "Height work at preheater top deck – belt conveyor access",
              days_ago(10), days_ago(3), "issued",
              approved_by=hd, approved_at=datetime.utcnow() - timedelta(days=10))
    i11 = issue(r11, "GEN-013", usr, stf, 2,
                datetime.utcnow() - timedelta(days=10),
                days_ago(3))   # overdue

    # 3e – OVERDUE (expected return was 5 days ago)
    r12 = req(12, "MECH-011", usr, 1,
              "Crane maintenance – overhead gantry 5-ton hook chain replacement",
              days_ago(14), days_ago(5), "issued",
              approved_by=hd, approved_at=datetime.utcnow() - timedelta(days=14))
    i12 = issue(r12, "MECH-011", usr, stf, 1,
                datetime.utcnow() - timedelta(days=14),
                days_ago(5))   # overdue

    # 3f – issued by admin
    r15 = req(15, "GEN-010", hd, 2,
              "Field measurement – new equipment installation E&I block",
              days_ago(2), days_from(5), "issued",
              approved_by=hd, approved_at=datetime.utcnow() - timedelta(days=2))
    i15 = issue(r15, "GEN-010", hd, stf, 2,
                datetime.utcnow() - timedelta(days=2),
                days_from(5))

    # ── 4. RETURNED requisitions (completed) ──────────────────────
    r13 = req(13, "EI-001", usr, 1,
              "Panel voltage check – Kiln drive MCC section",
              days_ago(12), days_ago(7), "returned",
              approved_by=hd, approved_at=datetime.utcnow() - timedelta(days=12))
    i13 = issue(r13, "EI-001", usr, stf, 1,
                datetime.utcnow() - timedelta(days=12),
                days_ago(7),
                actual_return=days_ago(7),
                condition="good", qty_returned=1)

    r14 = req(14, "GEN-005", usr, 2,
              "Pump base anchor bolt tightening – water pump house WP-02",
              days_ago(8), days_ago(3), "returned",
              approved_by=hd, approved_at=datetime.utcnow() - timedelta(days=8))
    i14 = issue(r14, "GEN-005", usr, stf, 2,
                datetime.utcnow() - timedelta(days=8),
                days_ago(3),
                actual_return=days_ago(3),
                condition="good", qty_returned=2)

    # ── 5. REJECTED requisition ────────────────────────────────────
    r0 = req(16, "MECH-013", usr, 1,
             "Vibration check – cement mill CM-02 main gearbox suspected issue",
             days_ago(6), days_ago(1), "rejected",
             approved_by=hd, approved_at=datetime.utcnow() - timedelta(days=5),
             rejection_reason="Tool currently under scheduled maintenance at vendor. Reschedule after 10 days when tool is back.")

    db.commit()
    print(f"  Requisitions: 15  |  Issuances: 8 (2 overdue, 3 returned)")


# ─────────────────────────────────────────────────────────────────
# NOTIFICATIONS
# ─────────────────────────────────────────────────────────────────
def seed_notifications(db, users, tools):
    print("\n=== Notifications ===")
    adm = users["ADM001"]
    stf = users["STF001"]
    hd  = users["HD001"]
    usr = users["USR001"]

    def notif(user, msg, created_ago_hours=0, read=False):
        n = Notification(
            id=uid(),
            user_id=user.id,
            message=msg,
            is_read=read,
            created_at=datetime.utcnow() - timedelta(hours=created_ago_hours),
        )
        db.add(n)

    # Admin notifications
    notif(adm, "OVERDUE: Safety Harness (GEN-013) issued to Requester User is 3 days past return date.", 2)
    notif(adm, "OVERDUE: Chain Block 3T (MECH-011) issued to Requester User is 5 days past return date.", 1)
    notif(adm, "CALIBRATION DUE: Cable Tester Fluke (EI-004) calibration is due in 4 days.", 3)
    notif(adm, "CALIBRATION DUE: Loop Calibrator Fluke 709H (EI-006) calibration is due in 4 days.", 3)
    notif(adm, "CALIBRATION DUE: Torque Wrench 100–500 Nm (MECH-002) calibration due in 4 days.", 4)
    notif(adm, "CALIBRATION DUE: Dial Indicator (MECH-007) calibration due in 4 days.", 4)
    notif(adm, "CALIBRATION DUE: pH Meter Hanna (PROC-004) calibration due in 4 days.", 5)
    notif(adm, "CALIBRATION OVERDUE: Oscilloscope Hantek (EI-005) – calibration is overdue.", 6)
    notif(adm, "CALIBRATION OVERDUE: Laser Alignment Tool SKF (MECH-014) – calibration is overdue.", 7)
    notif(adm, "New requisition REQ-2026-0001 submitted by Requester User (E&I).", 8, read=True)
    notif(adm, "New requisition REQ-2026-0002 submitted by Requester User (E&I).", 9, read=True)

    # Staff notifications
    notif(stf, "Requisition REQ-2026-0005 is approved and pending issuance.", 6)
    notif(stf, "Requisition REQ-2026-0006 is approved and pending issuance.", 2)
    notif(stf, "Requisition REQ-2026-0007 is approved and pending issuance.", 4)
    notif(stf, "OVERDUE ALERT: Safety Harness (GEN-013) – Requester User has not returned tool.", 2)
    notif(stf, "OVERDUE ALERT: Chain Block 3T (MECH-011) – Requester User has not returned tool.", 1)

    # Dept head notifications
    notif(hd, "Requisition REQ-2026-0001 from Requester User is pending your approval.", 8)
    notif(hd, "Requisition REQ-2026-0002 from Requester User is pending your approval.", 9)
    notif(hd, "Requisition REQ-2026-0004 from Requester User is pending your approval.", 7)
    notif(hd, "Requester User has an overdue tool: Safety Harness not returned for 3 days.", 2)

    # Requester notifications
    notif(usr, "Your requisition REQ-2026-0005 has been approved by Head E&I.", 6)
    notif(usr, "Your requisition REQ-2026-0007 has been approved by Head E&I.", 4)
    notif(usr, "Your requisition REQ-2026-0016 has been rejected. Reason: Tool under maintenance.", 5 * 24)
    notif(usr, "REMINDER: Combination Wrench Set (GEN-007) is due back in 2 days.", 1)
    notif(usr, "OVERDUE: Safety Harness (GEN-013) – please return immediately, 3 days overdue.", 2)
    notif(usr, "OVERDUE: Chain Block 3T (MECH-011) – please return immediately, 5 days overdue.", 1)

    db.commit()
    print("  Notifications seeded for all 4 users.")


# ─────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────
def main():
    db = Session()
    try:
        wipe(db)
        users = seed_users(db)
        bins  = seed_bins(db)
        tool_map = seed_tools(db, bins)
        seed_transactions(db, users, tool_map)
        seed_notifications(db, users, tool_map)

        # ── Summary ──
        from app.models.master import Tool as T
        from app.models.transaction import User as U, Requisition as R, IssuanceLog as IL, Notification as N
        total_qty   = sum(t.total_quantity     for t in db.query(T).all())
        avail_qty   = sum(t.available_quantity for t in db.query(T).all())
        issued_qty  = total_qty - avail_qty
        overdue     = db.query(IL).filter(IL.actual_return_date == None, IL.expected_return_date < TODAY).count()
        cal_due_tools = db.query(T).filter(T.requires_calibration == True, T.status == "calibration_due").count()

        print(f"""
=== Seed complete ===
  Tools:          {db.query(T).count()} types  |  {total_qty} total units
  Available:      {avail_qty} units
  Issued:         {issued_qty} units
  Overdue:        {overdue} issuances
  Cal due:        {cal_due_tools} tools
  Users:          {db.query(U).count()}
  Requisitions:   {db.query(R).count()}
  Issuance logs:  {db.query(IL).count()}
  Notifications:  {db.query(N).count()}
""")
    except Exception as e:
        db.rollback()
        print(f"ERROR: {e}")
        import traceback; traceback.print_exc()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
