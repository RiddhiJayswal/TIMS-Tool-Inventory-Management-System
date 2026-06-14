# Maintenance Tool Recording System
## UltraTech Cement · Maintenance Department

---

## What is TIMS?

<<<<<<< HEAD
This project replaces a manual Excel-based process for the UltraTech Cement plant maintenance department with a structured, real-time, role-aware web application for issuing, tracking, returning, and maintaining plant tools.
=======
TIMS replaces a manual Excel-based process with a structured, real-time web application for issuing, tracking, returning, and maintaining plant maintenance tools.
>>>>>>> e06917f (Fix app setup and workflow bugs)

Key problems it solves:
- No visibility into which tools are available or who has them
- No structured approval workflow — tools taken without authorization
- Calibration due dates missed
- No damage penalty or depreciation tracking
- No audit trail of tool movement

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python 3.11) |
| Database | PostgreSQL 15 |
| ORM | SQLAlchemy 2.0 + Alembic |
| Frontend | React 18 + Tailwind CSS + Vite |
| Auth | JWT (HS256) + bcrypt |
| Background Jobs | APScheduler (daily calibration + overdue checks) |
| Infrastructure | Docker + docker-compose |

---

## How to Start the Project

### Prerequisites
- Docker Desktop must be **running** (open it from the Start Menu, wait for the whale icon in the system tray)
- Git Bash or any terminal

### Step 1 — Go to the project folder

Open Git Bash and run:

```bash
cd "C:\Users\Lenovo\Desktop\Maintenance Tool Recording System"
```

### Step 2 — Start all services

```bash
"C:\Program Files\Docker\Docker\resources\bin\docker.exe" compose up --build -d
```

This builds and starts 3 containers:
- `db` — PostgreSQL database
- `backend` — FastAPI API server on port 8000
- `frontend` — React app on port 3000

Wait about 30–60 seconds. Check everything is running:

```bash
"C:\Program Files\Docker\Docker\resources\bin\docker.exe" ps
```

You should see all 3 containers with status **Up**.

### Step 3 — Seed the database (first time only)

```bash
"C:\Program Files\Docker\Docker\resources\bin\docker.exe" exec maintenancetoolrecordingsystem-backend-1 python seed.py
```

Expected output:
```
=== Seeding Users ===
  added user ADM001
  ...
=== Seed complete ===
```

### Step 4 — Open the website

```
http://localhost:3000
```

---

## Stopping the Project

```bash
"C:\Program Files\Docker\Docker\resources\bin\docker.exe" compose down
```

Your database data is saved in a Docker volume and will be there next time.

---

## Starting Again Next Time (no rebuild needed)

```bash
cd "C:\Users\Lenovo\Desktop\Maintenance Tool Recording System"
"C:\Program Files\Docker\Docker\resources\bin\docker.exe" compose up -d
```

Then open `http://localhost:3000`. No seeding needed — data from last time is preserved.

---

## View Logs (if something seems wrong)

```bash
# All containers
"C:\Program Files\Docker\Docker\resources\bin\docker.exe" compose logs

# Backend only
"C:\Program Files\Docker\Docker\resources\bin\docker.exe" logs maintenancetoolrecordingsystem-backend-1

# Follow live logs
"C:\Program Files\Docker\Docker\resources\bin\docker.exe" compose logs -f
```

---

## Sign In / Sign Up / Password Reset

### Auth Page (`/login`)

There is **one single auth page** for everyone - no separate admin login, staff login, etc.

```
Employee ID  →  e.g. ADM001
Password     →  your password
             [Sign In]
```

After login, the backend checks the user's role and the frontend automatically shows the correct menu and pages for that role.

### Sign Up

The login page includes **Sign Up**. Self-registered users are created as `requester` accounts only. A Maintenance Admin can still create and manage all roles from **User Management**.

### Forgot Password

The login page includes **Forgot**. Enter the employee ID and registered email to generate a short-lived reset token, then enter a new password. Reset tokens expire after 15 minutes and become invalid after the password is changed.

---

## User Roles and Rights

There are 4 roles. Each user has exactly one role.

| Role | Who is this? | What they can do |
|---|---|---|
| `requester` | Normal department employee | Browse tools, raise tool requisitions, track own requests, view own issuances |
| `dept_head` | Department manager / head | Everything a requester can do + approve or reject requisitions from **their own department only** |
| `maintenance_staff` | Tool room / issuing person | Issue tools against approved requests, process returns, view reports |
| `maintenance_admin` | Full system administrator | Full access — add/edit tools, calibration, damage write-offs, reports, user management |

**Important rules enforced at the API (not just the UI):**
- A requester **cannot approve their own** requisition (HTTP 403)
- A dept_head can **only approve their own department's** requests (HTTP 403)
- Tools with **overdue calibration are blocked** from issuance (HTTP 400)
- Stock **cannot go below 0** (HTTP 400 + database constraint)
- Only admin can **create/deactivate user accounts**

---

## What Each Role Sees in the Sidebar

| Page | Requester | Dept Head | Maintenance Staff | Maintenance Admin |
|---|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Tools | ✅ | ✅ | ✅ | ✅ |
| My Requests | ✅ | ✅ | ✅ | ✅ |
| Approvals | ❌ | ✅ | ❌ | ✅ |
| Issue Tool | ❌ | ❌ | ✅ | ✅ |
| Returns | ❌ | ❌ | ✅ | ✅ |
| Reports | ❌ | ❌ | ✅ | ✅ |
| Calibration | ❌ | ❌ | ❌ | ✅ |
| Storage Bins | ❌ | ❌ | ❌ | ✅ |
| User Management | ❌ | ❌ | ❌ | ✅ |

---

## Default Login Credentials (after seeding)

| Role | Employee ID | Password | Department |
|---|---|---|---|
| Maintenance Admin | `ADM001` | `Admin@123` | Maintenance |
| Maintenance Staff | `STF001` | `Staff@123` | Maintenance |
| Department Head (E&I) | `HD001` | `Head@123` | E&I |
| Requester (E&I) | `USR001` | `User@123` | E&I |

> Change these passwords before deploying to production.

---

## How to Use — Key Workflows

### 1. Request a Tool (as Requester)
1. Log in as USR001
2. Go to **Tools** → find the tool → click **Request**
3. Fill in quantity, purpose, from/to dates → Submit
4. Track status under **My Requests**

### 2. Approve / Reject a Request (as Dept Head)
1. Log in as HD001
2. Go to **Approvals** → Pending tab
3. Click **Approve** or **Reject** (with reason)
4. Stock does NOT change yet — only changes when issued

### 3. Issue a Tool (as Maintenance Staff)
1. Log in as STF001
2. Go to **Issue Tool** → Approved queue
3. Click **Issue Tool** → confirm
4. Stock reduces immediately

### 4. Return a Tool (as Maintenance Staff)
1. Go to **Returns** → find the issuance
2. Click **Process Return** → enter quantity, condition (good / damaged / missing)
3. Stock restores on good/partial return
4. Damaged/missing → admin must complete damage assessment

### 5. Record Calibration (as Admin)
1. Log in as ADM001
2. Go to **Calibration** → overdue tools shown in red
3. Click **Record** → enter date, service partner
4. Next calibration due date auto-calculates

### 6. Add a New Employee (as Admin)
1. Log in as ADM001
2. Go to **User Management** → click **Add Employee**
3. Fill in Employee ID, name, email, role, department, password
4. Employee can now log in with those credentials

### 7. View Reports (as Staff or Admin)
1. Go to **Reports**
2. Choose tab: Stock Status / Issuance History / Overdue / Calibration / Damage & Penalty / Utilization / Depreciation
3. Click **Export CSV** to download

---

## API Documentation

When the project is running:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

All endpoints require JWT auth. In Swagger, click **Authorize** and paste a token from the login response.

---

## Running Tests

```bash
# Unit tests — no database needed
"C:\Program Files\Docker\Docker\resources\bin\docker.exe" exec maintenancetoolrecordingsystem-backend-1 python -m pytest tests/test_services.py -v

# Integration tests — requires test database
"C:\Program Files\Docker\Docker\resources\bin\docker.exe" exec maintenancetoolrecordingsystem-db-1 psql -U tims_user -c "CREATE DATABASE tims_test;"
"C:\Program Files\Docker\Docker\resources\bin\docker.exe" exec maintenancetoolrecordingsystem-backend-1 python -m pytest tests/test_integration.py -v --tb=short
```

---

## Environment Variables

The `.env` file in the project root:

```env
POSTGRES_USER=tims_user
POSTGRES_PASSWORD=tims_pass
POSTGRES_DB=tims_db

DATABASE_URL=postgresql://tims_user:tims_pass@db:5432/tims_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
```

> Never commit `.env` to git. It is already in `.gitignore`.

---

## Project Structure

```
Maintenance Tool Recording System/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Settings from .env
│   │   ├── database.py          # SQLAlchemy engine
│   │   ├── models/
│   │   │   ├── master.py        # Tool, StorageBin
│   │   │   └── transaction.py   # User, Requisition, IssuanceLog, Notification
│   │   ├── routers/
│   │   │   ├── auth.py          # Login, logout, /me, notifications
│   │   │   ├── users.py         # User management (admin only)
│   │   │   ├── tools.py         # Tool catalogue CRUD
│   │   │   ├── storage_bins.py
│   │   │   ├── requisitions.py  # Raise, approve, reject
│   │   │   ├── issuance.py      # Issue tools
│   │   │   ├── returns.py       # Process returns
│   │   │   ├── damage.py        # Damage assessment, write-off
│   │   │   ├── calibration.py   # Calibration tracking
│   │   │   ├── reports.py       # 7 report endpoints + CSV export
│   │   │   └── dashboard.py     # Role-filtered summary
│   │   ├── services/
│   │   │   ├── stock.py         # Stock logic with row-level locking
│   │   │   ├── depreciation.py  # Monthly depreciation + penalty
│   │   │   └── notifications.py
│   │   └── auth/
│   │       └── roles.py         # JWT, bcrypt, role guards
│   ├── tests/
│   │   ├── test_services.py     # 13 unit tests
│   │   └── test_integration.py  # 25+ integration tests
│   ├── seed.py                  # Seed users, bins, tools
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx        # Single login page for all roles
│   │   │   ├── Dashboard.jsx    # Role-aware summary
│   │   │   ├── Tools.jsx        # Tool catalogue
│   │   │   ├── ToolDetail.jsx
│   │   │   ├── Requisitions.jsx # My requests
│   │   │   ├── Approvals.jsx    # Dept head approval queue
│   │   │   ├── Issuance.jsx     # Issue tools (staff/admin)
│   │   │   ├── Returns.jsx      # Process returns (staff/admin)
│   │   │   ├── Calibration.jsx  # Calibration management (admin)
│   │   │   ├── Reports.jsx      # 7-tab reports (staff/admin)
│   │   │   └── Users.jsx        # User management (admin only)
│   │   ├── components/
│   │   │   ├── Sidebar.jsx      # Role-filtered navigation
│   │   │   ├── Navbar.jsx
│   │   │   ├── Layout.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── auth/AuthContext.jsx  # JWT + role helpers
│   │   └── api/client.js        # Axios + all API namespaces
│   └── vite.config.js           # Proxy /api → backend:8000
├── docker-compose.yml
├── .env                         # Not committed to git
└── README.md
```

---

## Business Rules Summary

| Rule | Where enforced |
|---|---|
| Stock never goes below 0 | DB constraint + HTTP 400 in service |
| Calibration-due tools blocked from issuance | API check in `issuance.py` |
| Requester cannot approve own request | Check in `requisitions.py` |
| Dept head approves own department only | Check in `requisitions.py` |
| Stock reduces at issuance (not approval) | `reduce_stock()` only in `POST /api/issuance` |
| Partial returns only for consumables | `validate_consumable_return()` in `stock.py` |
| Depreciation snapshotted at issuance time | Before `db.commit()` in issuance router |
| All stock operations transactional | `try/except/db.rollback()` in all stock routes |
| Row-level locking prevents race conditions | `SELECT FOR UPDATE` in `get_tool_locked()` |
| Only admin can create/deactivate users | `RequireAdmin` dependency on `/api/users` |
