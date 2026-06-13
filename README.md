# Maintenance Tool Recording System
## UltraTech Cement · Maintenance Department

---

## Overview

This project replaces a manual Excel-based process for the UltraTech Cement plant maintenance department with a structured, real-time, role-aware web application for issuing, tracking, returning, and maintaining plant tools.

**Problems solved:**
- No real-time visibility into which tools are available, who has them, and when they are due back
- No structured approval workflow — tools taken without authorization
- Calibration and service due dates missed informally
- No penalty or depreciation tracking for damaged or lost tools
- No audit trail of tool movement

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python 3.11), SQLAlchemy 2.0, Alembic |
| Database | PostgreSQL 15 |
| Frontend | React 18, Tailwind CSS 3, Vite 5 |
| Auth | JWT (HS256), bcrypt password hashing |
| Background Jobs | APScheduler (daily calibration + overdue checks) |
| Infrastructure | Docker, docker-compose |

---

## Quick Start

### Prerequisites
- Docker Desktop (or Docker Engine + Compose plugin)
- Git

### Steps

```bash
# 1. Clone the repository
git clone <repo-url>
cd tims

# 2. Copy environment config
cp .env.example .env
# Edit .env if needed (see Environment Variables section below)

# 3. Build and start all services
docker-compose up --build

# 4. Wait for services to be ready (watch for "Application startup complete")
# Then seed the database with test users and tools
docker-compose exec backend python seed.py

# 5. Open the app
# Frontend: http://localhost:3000
# API docs: http://localhost:8000/docs
```

### First login
Use any of the default credentials listed below.

---

## Default Login Credentials

| Role | Employee ID | Password | Department |
|---|---|---|---|
| Maintenance Admin | ADM001 | Admin@123 | Maintenance |
| Maintenance Staff | STF001 | Staff@123 | Maintenance |
| Department Head (E&I) | HD001 | Head@123 | E&I |
| Requester (E&I) | USR001 | User@123 | E&I |

> **Change these passwords before production deployment.**

---

## User Roles and Permissions

| Role | What they can do |
|---|---|
| `requester` | Browse tool catalogue, raise tool requisitions, track own request status |
| `dept_head` | All requester actions + approve or reject requisitions from their own department |
| `maintenance_staff` | Issue tools against approved requisitions, process returns, view reports |
| `maintenance_admin` | Full access: tool master management, calibration records, damage write-offs, all reports, user-level actions |

**Key rules enforced at the API layer (not just the UI):**
- A requester cannot approve their own requisition (HTTP 403)
- A dept_head can only approve requests from their own department (HTTP 403)
- Calibration-overdue tools are blocked from issuance (HTTP 400)
- Available stock cannot go below 0 (HTTP 400 + database constraint)

---

## Key Workflows

### 1. Requesting a Tool
1. Log in as a **requester** (USR001)
2. Go to **Tools** → find the tool → click **Request**
3. Fill in quantity, purpose, from/to dates → **Submit**
4. Track status under **My Requests** (Pending → Approved/Rejected → Issued → Returned)

### 2. Approving / Rejecting a Request
1. Log in as **dept_head** (HD001) for your department
2. Go to **Approvals** → Pending tab
3. Click **Approve** (stock remains unchanged at this point) or **Reject** (with reason)

### 3. Issuing a Tool
1. Log in as **maintenance_staff** (STF001)
2. Go to **Issue Tools** → Approved Requests section
3. Click **Issue Tool** → confirm the issuance
4. Stock reduces immediately; requester is notified

### 4. Processing a Return
1. Log in as **maintenance_staff**
2. Go to **Returns** → search by tool or borrower
3. Click **Process Return** → enter quantity returned and condition
4. If condition is **Damaged** or **Missing**, an admin damage assessment is required

### 5. Recording Damage Assessment (Admin Only)
1. Log in as **maintenance_admin** (ADM001)
2. Go to **Returns** → Pending Damage Assessment section
3. Click **Record Damage** → select damage type:
   - **Theft**: enter current market rate → penalty = market rate
   - **Mishandling**: penalty = depreciated book value at time of issue
   - **Wear & Tear**: penalty = ₹0, tool written off from inventory

### 6. Recording Calibration (Admin Only)
1. Log in as **maintenance_admin**
2. Go to **Calibration** → find the tool (filter by Overdue or Due Soon)
3. Click **Record** → enter calibration date, service partner, notes
4. Next calibration due date auto-calculates; tool status resets to Active

### 7. Generating Reports
1. Log in as **maintenance_staff** or **maintenance_admin**
2. Go to **Reports** → select a tab:
   - Stock Status | Issuance History | Overdue | Calibration | Damage & Penalty | Utilization | Depreciation
3. Apply filters as needed → click **Export CSV** to download

---

## Environment Variables

Create a `.env` file in the project root (or copy `.env.example`):

```env
# Database
DATABASE_URL=postgresql://tims_user:tims_pass@postgres:5432/tims_db

# JWT Auth
SECRET_KEY=change-this-to-a-long-random-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480

# Email notifications (optional in v1)
SMTP_HOST=smtp.yourcompany.com
SMTP_PORT=587
SMTP_USER=tims@yourcompany.com
SMTP_PASSWORD=
```

---

## API Documentation

Once the app is running, the auto-generated API docs are available at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

All endpoints are prefixed with `/api`. JWT auth is required (click **Authorize** in Swagger and paste a Bearer token from `/api/auth/login`).

---

## Database Schema

Four core tables:

| Table | Purpose |
|---|---|
| `tools` | Tool master catalogue — identity, quantity, calibration, financial data, status |
| `storage_bins` | Physical storage locations (bin code, shelf, section) |
| `requisitions` | Tool request records with approval workflow status |
| `issuance_logs` | Physical issuance events — who has what, when due, return condition, penalties |

Supporting tables: `users`, `audit_log`, `notifications`.

All tables include a nullable `plant_id` column for future multi-plant expansion.

---

## Running Tests

```bash
# Service unit tests (no database required)
docker-compose exec backend python -m pytest tests/test_services.py -v

# Integration tests (requires tims_test database)
# 1. Create the test DB first:
docker-compose exec postgres psql -U tims_user -c "CREATE DATABASE tims_test;"
# 2. Run integration tests:
docker-compose exec backend python -m pytest tests/test_integration.py -v --tb=short

# Run all tests
docker-compose exec backend python -m pytest tests/ -v
```

---

## Project Structure

```
tims/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app, router mounts, CORS, lifespan
│   │   ├── config.py          # Settings (reads from .env)
│   │   ├── database.py        # SQLAlchemy engine + get_db dependency
│   │   ├── models/
│   │   │   ├── master.py      # Tool, StorageBin (CheckConstraint on available_qty)
│   │   │   └── transaction.py # User, Requisition, IssuanceLog, AuditLog, Notification
│   │   ├── routers/
│   │   │   ├── auth.py        # Login, logout, /me, notifications
│   │   │   ├── tools.py       # CRUD for tool master
│   │   │   ├── storage_bins.py
│   │   │   ├── requisitions.py # Raise, approve, reject, cancel
│   │   │   ├── issuance.py    # Issue tools, list active, overdue
│   │   │   ├── returns.py     # Process returns, restore stock
│   │   │   ├── damage.py      # Damage assessment, write-off
│   │   │   ├── calibration.py # List due tools, record calibration
│   │   │   ├── reports.py     # 7 report endpoints with CSV export
│   │   │   └── dashboard.py   # Role-filtered summary + active issuances
│   │   ├── schemas/           # Pydantic v2 request/response models
│   │   ├── services/
│   │   │   ├── stock.py       # SELECT FOR UPDATE, reduce/restore with 0-floor check
│   │   │   ├── depreciation.py # Monthly depreciation + penalty calculation
│   │   │   ├── notifications.py # In-app notification helpers
│   │   │   ├── audit.py       # Audit log writer
│   │   │   └── requisition_number.py # Auto-generate REQ-YYYY-NNNN
│   │   ├── auth/
│   │   │   └── roles.py       # JWT, bcrypt, RequireAdmin/Maintenance/DeptHead guards
│   │   └── scheduler.py       # APScheduler daily jobs (calibration + overdue checks)
│   ├── alembic/               # Database migration scripts
│   ├── tests/
│   │   ├── conftest.py        # Fixtures for unit + integration tests
│   │   ├── test_services.py   # 13 unit tests for business logic services
│   │   └── test_integration.py # 25+ integration tests covering all critical flows
│   ├── seed.py                # Populates 4 users, 6 bins, 10 tools
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx  # Role-aware summary cards + active issuances
│   │   │   ├── Tools.jsx      # Full catalogue with filters + Add Tool (admin)
│   │   │   ├── ToolDetail.jsx # Per-tool details, calibration history, issuance history
│   │   │   ├── Requisitions.jsx # My requests with 6 status tabs
│   │   │   ├── Approvals.jsx  # Dept head / admin approval queue
│   │   │   ├── Issuance.jsx   # Approved queue + active issuances board
│   │   │   ├── Returns.jsx    # Return processing + admin damage assessment queue
│   │   │   ├── Calibration.jsx # Calibration tracking + record completion (admin)
│   │   │   └── Reports.jsx    # 7 tabbed reports with CSV export
│   │   ├── components/        # Layout, Sidebar, Navbar, StatusBadge, ConfirmDialog, SearchableSelect, Toast
│   │   ├── auth/AuthContext.jsx # JWT storage, isAdmin/isMaintenance/isDeptHead helpers
│   │   ├── contexts/ToastContext.jsx
│   │   └── api/client.js      # Axios instance with JWT interceptor + all API namespaces
│   ├── vite.config.js         # Proxy /api → backend:8000
│   └── package.json
├── docker-compose.yml         # postgres + backend + frontend services
├── .env.example
└── README.md                  # This file
```

---

## Business Rules Summary

| Rule | Enforcement |
|---|---|
| `available_quantity` never below 0 | DB CheckConstraint + HTTP 400 in service |
| Calibration-due tools blocked from issuance | API layer check in `issuance.py` before stock reduction |
| Requester cannot self-approve | `approved_by != requested_by` check in `requisitions.py` |
| Dept head approves own dept only | `current_user.department == requester_dept` check |
| Stock reduces at issuance (not approval) | `reduce_stock()` called only in `POST /api/issuance` |
| Partial returns only for consumables | `validate_consumable_return()` in `stock.py` |
| Depreciation snapshotted at issuance | `snapshot_value_at_issuance()` called before `db.commit()` in issuance |
| All stock operations transactional | `try/except/db.rollback()` wrapping all stock-modifying routers |
| Row-level locking for concurrency | `SELECT FOR UPDATE` via `.with_for_update()` in `get_tool_locked()` |
