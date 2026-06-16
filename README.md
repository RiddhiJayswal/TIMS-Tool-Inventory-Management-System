# Tool Inventory Management System(TIMS)
## UltraTech Cement · Maintenance Department

---

## What is TIMS?

TIMS replaces a manual Excel-based process with a structured, real-time web application for issuing, tracking, returning, and maintaining plant maintenance tools.

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
| Database | SQLite (dev) / PostgreSQL (production) |
| ORM | SQLAlchemy 2.0 |
| Frontend | Vanilla React 18 via CDN + TIMS Design System |
| Auth | JWT (HS256) + bcrypt |
| Dev Server | Vite (static file serving + API proxy) |
| Background Jobs | APScheduler (daily calibration + overdue checks) |

---

## How to Start the Project

### Prerequisites

- Python 3.11+
- Node.js 18+ and npm

---

### Step 1 — Install backend dependencies

Open a terminal and run:

```bash
cd "C:\Users\Lenovo\Desktop\Maintenance Tool Recording System\backend"
pip install -r requirements.txt
```

---

### Step 2 — Set up the database (first time only)

The project uses SQLite for local development — no database server needed.

```bash
cd "C:\Users\Lenovo\Desktop\Maintenance Tool Recording System\backend"
python -c "from dotenv import load_dotenv; load_dotenv(); from app.database import engine, Base; import app.models.master, app.models.transaction; Base.metadata.create_all(bind=engine); print('Done')"
python seed.py
```

Expected output from `seed.py`:
```
=== Seeding Users ===
  added user ADM001
  added user STF001
  added user HD001
  added user USR001
=== Seeding Storage Bins ===
  ...
=== Seed complete ===
```

> This step is only needed once. The database file (`backend/tims.db`) persists between restarts.

---

### Step 3 — Install frontend dependencies

```bash
cd "C:\Users\Lenovo\Desktop\Maintenance Tool Recording System\frontend"
npm install
```

---

### Step 4 — Start both servers (two separate terminals)

**Terminal 1 — Backend API:**

```bash
cd "C:\Users\Lenovo\Desktop\Maintenance Tool Recording System\backend"
uvicorn app.main:app --port 8000 --reload
```

**Terminal 2 — Frontend Dev Server:**

```bash
cd "C:\Users\Lenovo\Desktop\Maintenance Tool Recording System\frontend"
npm run dev
```

---

### Step 5 — Open the app

Open your browser and go to:

```
http://localhost:5173
```

> **Important:** Do NOT use VS Code Live Server to open the app. Always use `http://localhost:5173` from the Vite dev server — it correctly serves all assets and proxies API calls to the backend.

---

## Starting Again (after the first-time setup)

Just repeat Step 4 (two terminals) and open `http://localhost:5173`. No seeding needed — data from last time is preserved in `tims.db`.

---

## Stopping the Project

Press `Ctrl + C` in each terminal.

---

## API Documentation

While the backend is running:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Default Login Credentials

| Role | Employee ID | Password | Department |
|---|---|---|---|
| Maintenance Admin | `ADM001` | `Admin@123` | Maintenance |
| Maintenance Staff | `STF001` | `Staff@123` | Maintenance |
| Department Head (E&I) | `HD001` | `Head@123` | E&I |
| Requester (E&I) | `USR001` | `User@123` | E&I |

> Change these passwords before deploying to production.

---

## User Roles and Rights

There are 4 roles. Each user has exactly one role.

| Role | Who is this? | What they can do |
|---|---|---|
| `requester` | Normal department employee | Browse tools, raise tool requisitions, track own requests, view own issuances |
| `dept_head` | Department manager / head | Everything a requester can do + approve or reject requisitions from **their own department only** |
| `maintenance_staff` | Tool room / issuing person | Issue tools against approved requests, process returns, view reports |
| `maintenance_admin` | Full system administrator | Full access — add/edit tools, calibration, damage write-offs, reports, user management |

**Rules enforced at the API (not just the UI):**
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

## Key Workflows

### 1. Request a Tool (as Requester)
1. Log in as `USR001`
2. Go to **Tools** → find the tool → click **Request**
3. Fill in quantity, purpose, from/to dates → Submit
4. Track status under **My Requests**

### 2. Approve / Reject a Request (as Dept Head)
1. Log in as `HD001`
2. Go to **Approvals** → Pending tab
3. Click **Approve** or **Reject** (with reason)
4. Stock does NOT change yet — only changes when issued

### 3. Issue a Tool (as Maintenance Staff)
1. Log in as `STF001`
2. Go to **Issue Tool** → Approved queue
3. Click **Issue** → confirm the acknowledgement checkbox → **Confirm Issue**
4. Stock reduces immediately

### 4. Return a Tool (as Maintenance Staff)
1. Go to **Returns** → find the issuance
2. Click **Process Return** → enter quantity, condition (good / damaged / missing)
3. Stock restores on good/partial return
4. Damaged/missing → admin must complete damage assessment

### 5. Record Calibration (as Admin)
1. Log in as `ADM001`
2. Go to **Calibration** → overdue tools shown in red
3. Click **Record** → enter date, service partner
4. Next calibration due date auto-calculates

### 6. Add a New Employee (as Admin)
1. Log in as `ADM001`
2. Go to **User Management** → click **Add Employee**
3. Fill in Employee ID, name, email, role, department, password
4. Employee can now log in with those credentials

### 7. View Reports (as Staff or Admin)
1. Go to **Reports**
2. Choose a tab: Stock Status / Issuance History / Overdue / Calibration / Damage & Penalty
3. Click **Export CSV** to download

---

## Environment Variables

The `backend/.env` file (already created for local dev):

```env
DATABASE_URL=sqlite:///./tims.db
SECRET_KEY=tims-dev-secret-key-ultratech-2026-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
```

For production with PostgreSQL, change `DATABASE_URL` to:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/tims_db
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
│   │   │   ├── auth.py          # Login, /me, notifications
│   │   │   ├── users.py         # User management (admin only)
│   │   │   ├── tools.py         # Tool catalogue CRUD
│   │   │   ├── storage_bins.py
│   │   │   ├── requisitions.py  # Raise, approve, reject
│   │   │   ├── issuance.py      # Issue tools
│   │   │   ├── returns.py       # Process returns
│   │   │   ├── calibration.py   # Calibration tracking
│   │   │   ├── reports.py       # Report endpoints
│   │   │   └── dashboard.py     # Role-filtered summary
│   │   ├── services/
│   │   │   ├── stock.py         # Stock logic
│   │   │   ├── depreciation.py  # Monthly depreciation + penalty
│   │   │   └── notifications.py
│   │   └── auth/
│   │       └── roles.py         # JWT, bcrypt, role guards
│   ├── seed.py                  # Seed users, bins, tools
│   ├── tims.db                  # SQLite database (auto-created, not committed)
│   ├── .env                     # Local environment vars (not committed)
│   └── requirements.txt
├── frontend/
│   ├── index.html               # App entry point — loads React + design system
│   ├── public/
│   │   ├── _ds_bundle.js        # TIMS design system bundle
│   │   ├── styles.css           # Design system styles
│   │   ├── tokens/              # CSS design tokens
│   │   ├── assets/
│   │   │   └── ultratech-logo.png
│   │   └── screens/             # All UI screen files (JSX, CDN-compiled)
│   │       ├── Icons.jsx
│   │       ├── Data.jsx         # API client — all backend calls
│   │       ├── AppShell.jsx     # Sidebar + Navbar layout
│   │       ├── LoginScreen.jsx
│   │       ├── DashboardScreen.jsx
│   │       ├── ToolsScreen.jsx
│   │       ├── RequisitionsScreen.jsx
│   │       ├── ApprovalsScreen.jsx
│   │       ├── IssuanceScreen.jsx
│   │       ├── ReturnsScreen.jsx
│   │       ├── CalibrationScreen.jsx
│   │       ├── StorageBinsScreen.jsx
│   │       ├── ReportsScreen.jsx
│   │       └── UsersScreen.jsx
│   ├── vite.config.js           # Static server + /api proxy to backend:8000
│   └── package.json
├── docs/
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
| Only admin can create/deactivate users | `RequireAdmin` dependency on `/api/users` |
