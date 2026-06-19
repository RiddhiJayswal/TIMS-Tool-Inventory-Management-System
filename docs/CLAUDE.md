# CLAUDE.md — UltraTech Tools Inventory Management System (TIMS)

## Project Overview

TIMS is a web-based tool inventory management system for the Maintenance Department at UltraTech Cement (single plant). It replaces an Excel-based manual process with a structured, real-time, role-aware system for issuing, tracking, returning, and maintaining plant maintenance tools.

---

## Repository Structure

```
tims/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models/
│   │   │   ├── master.py        # Tool, StorageBin
│   │   │   └── transaction.py   # Requisition, IssuanceLog
│   │   ├── routers/
│   │   │   ├── tools.py
│   │   │   ├── requisitions.py
│   │   │   ├── issuance.py
│   │   │   ├── returns.py
│   │   │   ├── calibration.py
│   │   │   └── damage.py
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── stock.py         # Real-time stock logic
│   │   │   ├── depreciation.py  # Monthly value calculation
│   │   │   └── notifications.py # Calibration/return reminders
│   │   └── auth/
│   │       └── roles.py
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ToolMaster.jsx
│   │   │   ├── Requisition.jsx
│   │   │   ├── Issuance.jsx
│   │   │   ├── Returns.jsx
│   │   │   ├── Calibration.jsx
│   │   │   └── Reports.jsx
│   │   ├── components/
│   │   └── api/
│   └── package.json
├── docs/
│   ├── CLAUDE.md       ← this file
│   ├── spec.md
│   └── requirements.md
├── docker-compose.yml
└── README.md
```

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Backend | FastAPI (Python) | Async, fast, already familiar from PPMX |
| Database | PostgreSQL | Relational, owned, ACID-compliant for inventory transactions |
| ORM | SQLAlchemy + Alembic | Schema migrations, relationship management |
| Frontend | React + Tailwind CSS | Component-based, real-time UI |
| Auth | JWT with role-based access | Four distinct roles with different permissions |
| Hosting | Single VPS or plant LAN server | Internet access required, own database |
| Notifications | Background scheduler (APScheduler) | Calibration due, overdue return alerts |

---

## Database — Four Core Tables

### Master Tables (2)

**`tools`**
```
id, tool_code, name, category, tool_type (general/specialized),
department_access, make, model, serial_number, purchase_date,
purchase_price, standard_life_months, current_value,
requires_calibration (bool), calibration_frequency_days,
last_calibration_date, next_calibration_due, service_partner,
storage_bin_id, total_quantity, available_quantity,
status (active/damaged/written_off), created_at
```

**`storage_bins`**
```
id, bin_code, shelf_label, section, department_category,
description, capacity, created_at
```

### Transaction Tables (2)

**`requisitions`**
```
id, requisition_number, tool_id, requested_by (user_id),
requester_department, quantity_requested, purpose_of_job,
requested_from_date, requested_to_date, status
(pending/approved/rejected/issued/returned),
approved_by (user_id), approved_at, rejection_reason,
created_at
```

**`issuance_logs`**
```
id, requisition_id, tool_id, issued_to (user_id),
issued_by (user_id), quantity_issued, issued_at,
expected_return_date, actual_return_date,
return_condition (good/damaged/partial/missing),
quantity_returned, quantity_consumed (for consumables),
damage_type (theft/mishandling/wear_and_tear/null),
penalty_amount, depreciated_value_at_issue,
notes, created_at
```

---

## Roles and Permissions

| Role | Can Do |
|---|---|
| `requester` | Raise requisition, view own requests, view tool availability |
| `dept_head` | Approve/reject requisitions from own department |
| `maintenance_staff` | Issue tools, process returns, check conditions, manage tool catalogue and storage bins |
| `maintenance_admin` | Full access: master data, reports, calibration, damage write-offs, procurement |

No role bypasses the approval workflow. A requester cannot self-approve.

---

## Core Business Logic — Exact Rules

### Stock Management
- `available_quantity = total_quantity - sum(quantity_issued for all open issuances)`
- Stock reduces immediately on issuance, not on approval
- For consumables (e.g., welding rods): partial return is valid; `quantity_returned < quantity_issued` closes the issuance with `quantity_consumed` recorded
- Stock is visible in real-time to all roles

### Depreciation
- `monthly_depreciation = purchase_price / standard_life_months`
- `current_value = purchase_price - (months_since_purchase × monthly_depreciation)`
- Floor at 0; tool is flagged for write-off when `current_value = 0`
- Depreciated value is snapshotted at time of issuance in `issuance_logs.depreciated_value_at_issue`

### Damage / Loss Penalty
- `theft` → penalty = current market rate (manually entered by maintenance_admin)
- `mishandling` → penalty = depreciated book value at time of damage
- `wear_and_tear` → write-off, no penalty
- Penalty recorded against the requester's user ID

### Calibration Reminders
- Background job runs daily
- If `next_calibration_due` is within 7 days → notify maintenance_admin
- If tool is issued and calibration is due → block new issuances, flag tool
- Calibration completion updates `last_calibration_date` and recalculates `next_calibration_due`

### Overdue Returns
- If `actual_return_date` is NULL and `expected_return_date < today` → flag as overdue
- Notify requester's department head and maintenance_admin
- Overdue tools are visible on dashboard with days-overdue count

---

## What NOT to Build (Scope Limits for v1)

- No SAP PM integration (v1 is standalone)
- No mobile app (responsive web is sufficient)
- No barcode/RFID hardware integration
- No multi-plant support (but add `plant_id` to all tables as a nullable field for future)
- No financial ledger integration for penalty recovery

---

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/tims_db
SECRET_KEY=<jwt_secret>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
SMTP_HOST=<for email notifications>
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
```

---

## Running Locally

```bash
# Backend
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

---

## Key Constraints for AI Assistance

- Always use `plant_id` field in new tables even if unused in v1
- Never allow `available_quantity` to go below 0 — raise HTTP 400
- All stock-modifying operations must be wrapped in database transactions
- Depreciation calculation must use `purchase_date`, not `created_at`
- Partial returns are only valid for tools with `category = consumable`
- Calibration-due tools must be blocked from issuance at the API layer, not just the UI
