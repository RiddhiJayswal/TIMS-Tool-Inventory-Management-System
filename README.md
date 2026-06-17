<<<<<<< HEAD
# Tool Inventory Management System(TIMS)
## UltraTech Cement · Maintenance Department
=======
# TIMS - Tool Inventory Management System
>>>>>>> cd5087e (Fix TIMS responsive UI and add full workflow testing improvements)

TIMS is a role-based maintenance tool inventory system for plant teams. It tracks tool stock, requisitions, approvals, issue/return activity, calibration, storage bins, damage assessment, users, reports, notifications, and audit/activity exports.

## Current Stack

| Area | Technology |
| --- | --- |
| Backend | FastAPI, SQLAlchemy, Alembic, APScheduler |
| Database | PostgreSQL in Docker |
| Auth | JWT bearer tokens, bcrypt password hashes |
| Frontend | React 18 loaded by Vite/static runtime, TIMS design-system bundle |
| Runtime | Docker Compose services for `backend`, `frontend`, and `db` |
| Reports | JSON and CSV exports, activity backup CSV, daily activity log |

## Quick Start

```powershell
docker compose up -d --force-recreate backend frontend
```

Open:

```text
http://localhost:3000
```

Backend API docs:

```text
http://localhost:8000/docs
```

Check containers:

```powershell
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

## Default Seed Logins

For the current Docker seed data, the demo users use:

| Role | Employee ID | Password | Department |
| --- | --- | --- | --- |
| Maintenance Admin | `ADM001` | `password123` | Maintenance |
| Maintenance Staff | `STF001` | `password123` | Maintenance |
| Dept Head | `HD001` | `password123` | E&I |
| Requester | `USR001` | `password123` | E&I |

Some test fixtures use strong passwords such as `Admin@123`, `Staff@123`, `Head@123`, and `User@123`; the running Docker seed currently uses `password123`.

## Roles And Permissions

| Action | Admin | Staff | Dept Head | Requester |
| --- | --- | --- | --- | --- |
| Login / logout | Yes | Yes | Yes | Yes |
| Forgot username/password | Yes | Yes | Yes | Yes |
| Request access | Public form | Public form | Public form | Public form |
| Approve access requests | Yes | No | No | No |
| View tools | Yes | Yes | Yes | Yes |
| Add/edit/write off tools | Yes | No | No | No |
| Request tools | Yes | Yes | Yes | Yes |
| Approve tool requests | Yes | No | Own department | No |
| Issue tools | Yes | Yes | No | No |
| Process returns | Yes | Yes | Own issue/request flow only | Own issue/request flow only |
| Manage users | Yes | No | No | No |
| Manage storage bins | Yes | No | No | No |
| Calibration management | Yes | Limited by API | No | No |
| Reports and downloads | Yes | Yes | No | No |

Restricted routes are hidden in the UI and protected by backend role guards. Forced frontend route access shows an Access Denied fallback.

## Main Features

- Authentication with inactive-user blocking.
- Forgot username by registered email or employee ID.
- Forgot password/reset token flow. If SMTP is not configured, the reset token is shown safely for local/demo testing.
- Public access request form with admin approval/rejection.
- Tool catalogue with department access, stock, value, calibration, and storage-bin details.
- Tool details modal showing available units and issued units, including who has the issued tool.
- Tool requisition workflow with date-period availability checks.
- Dept-head/admin approval workflow.
- Staff/admin issue workflow.
- Return workflow with quantity and condition checks.
- Damage/missing assessment and stock handling.
- Calibration tracking and due/overdue blocking.
- Storage bin management.
- Notifications.
- Reports, CSV export, activity backup, and daily log download.
- Mobile responsive layout with left-side collapsible menu and mobile card views for data-heavy pages.

## Important Business Rules

| Rule | Enforcement |
| --- | --- |
| Requester cannot approve requests | Backend requisition role checks |
| Dept head approves own department only | Backend requisition department checks |
| Staff cannot approve access requests | Users/access APIs are admin-only |
| Requester cannot download reports/logs | Reports APIs require maintenance role |
| Calibration-due tools are blocked | Requisition/issue validation |
| Stock cannot go negative | Stock service and router validation |
| Issued stock is reduced only at issue time | Issuance workflow |
| Good returns restore stock | Return workflow |
| Damaged/missing stock waits for admin assessment | Return + damage workflow |
| Overlapping issued dates block new requisition period | Requisition availability endpoint |

## Project Structure

```text
Maintenance Tool Recording System/
  backend/
    app/
      auth/roles.py
      models/
      routers/
      services/
      main.py
    tests/
    seed.py
  frontend/
    index.html
    public/
      screens/
      styles.css
      assets/
    take_screenshots.mjs
  screenshots/
  TIMS_FULL_TEST_CHECKLIST.md
  README.md
```

## Useful Commands

Backend compile:

```powershell
cd backend
python -m compileall app alembic
```

Frontend syntax/build:

```powershell
cd frontend
Get-ChildItem public/screens -Filter *.jsx | ForEach-Object { Get-Content -Raw $_.FullName | & node_modules/.bin/esbuild.cmd --loader=jsx --format=iife --log-level=error | Out-Null; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }
npm.cmd run build
```

Integration tests:

```powershell
cd backend
python -m pytest tests/test_integration.py -v --tb=short
```

Note: the local pytest suite expects a PostgreSQL database named `tims_test`. If it does not exist, pytest setup fails before tests run.

Seed/reset demo data:

```powershell
docker compose exec backend python seed.py
```

Capture screenshots:

```powershell
cd frontend
node take_screenshots.mjs
```

## Screenshots

Fresh screenshots are stored in:

```text
screenshots/
```

The screenshot set includes desktop and mobile views after the latest responsive fixes.

## Recent Responsive Fixes

- Mobile menu remains a left-side collapsible rail, not a top menu.
- Mobile Users page becomes labeled cards instead of a cut desktop table.
- Mobile Reports page uses vertical actions, vertical report tabs, and card-style report rows.
- Mobile tab controls stack vertically across feature pages.
- Generic mobile tables wrap instead of forcing long horizontal scrollbars.
- Desktop layout is preserved.

## Activity And Audit Exports

Maintenance staff and admins can download:

- Activity backup CSV: `/api/reports/activity-logs?format=csv`
- Daily activity log: `/api/reports/activity-logs/daily`

These downloads are also exposed as buttons in the Reports screen.
