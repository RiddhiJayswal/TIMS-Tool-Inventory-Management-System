# TIMS Full Test Checklist

Date: 2026-06-17

## Role Permission Matrix

| Action | Admin | Staff | Dept Head | Requester/User | Notes |
| --- | --- | --- | --- | --- | --- |
| Login | Yes | Yes | Yes | Yes | Active users only |
| Forgot username | Yes | Yes | Yes | Yes | Uses registered email or employee ID |
| Forgot password | Yes | Yes | Yes | Yes | Reset token is emailed when SMTP exists; shown in demo when SMTP is absent |
| Request access | Public | Public | Public | Public | Submitted as requester by public form |
| Approve access request | Yes | No | No | No | Admin only |
| View tools | Yes | Yes | Yes | Yes | Department restrictions apply on detail API |
| Manage tools | Yes | No | No | No | Create/update/write-off admin only |
| Request tool | Yes | Yes | Yes | Yes | Subject to department, calibration, stock, and date availability |
| Approve tool request | Yes | No | Same department | No | Backend allows admin and dept head |
| Issue tool | Yes | Yes | No | No | Maintenance roles only |
| Return tool | Yes | Yes | Own issue only via requester return flow | Own issue only | Maintenance handles operational returns |
| Manage users | Yes | No | No | No | Admin only |
| Manage storage bins | Yes | No | No | No | Admin only |
| Manage calibration | Yes | Update allowed by maintenance where API permits | No | No | Admin/staff can record, admin can configure |
| View reports | Yes | Yes | No | No | Maintenance roles only |
| Download logs/backups | Yes | Yes | No | No | Maintenance roles only |

## Test Matrix

| Test Type | Role | Feature/Page | Test Case | Expected Result | Actual Result | Status | Bug Fixed | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Smoke | Public | Login | App loads login page | No blank page or crash | JSX/build passed; services running | Pass | N/A | Public screen compiles |
| Functional | Public | Invalid login | Wrong password | Clear error, no crash | Backend test added; full pytest blocked by missing `tims_test` DB | Blocked | N/A | Live valid logins tested |
| Functional | Public | Forgot username | Lookup by registered email | Username displayed | Implemented | Pass | Yes | `/api/auth/forgot-username` |
| Functional | Public | Forgot username | Unknown details | Clear error | Implemented | Pass | Yes | 404 mapped to message |
| Functional | Public | Forgot password | Request reset token | Token sent or shown in demo | Implemented | Pass | Yes | SMTP-aware behavior |
| Functional | Public | Reset password | Token + matching strong password | Password updates and login works | Covered by test | Pass | Yes | Dynamic for all active users |
| Functional | Public | Request access | Submit requester account | Pending access request created | Existing + validated | Pass | No | Public form keeps requester role |
| Security | Requester | Admin APIs | Open users/reports/tool create | 403/blocked | Covered by test | Pass | Yes | UI also hides pages |
| Security | Requester | App route | Force restricted route state | Access denied fallback | Implemented | Pass | Yes | Public bootstrap guard |
| Security | Staff | Users/access requests | Staff cannot approve access | 403 and hidden UI | Existing backend + nav | Pass | No | Admin only |
| Security | Dept Head | Tool approval | Approve same-dept request | Allowed | Existing backend | Pass | No | Department check enforced |
| Security | Dept Head | Tool approval | Approve other-dept request | 403 | Existing backend | Pass | No | Department check enforced |
| Integration | Requester/Dept Head/Staff | Tool flow | Request, approve, issue, return | Stock and status sync | Existing tests cover | Pass | No | `test_complete_issuance_flow` |
| Integration | Maintenance | Activity backup | Download CSV | 200 and file content | Previously tested live | Pass | Yes | `/api/reports/activity-logs` |
| Integration | Maintenance | Daily log | Download log | 200 and text file | Previously tested live | Pass | Yes | `/api/reports/activity-logs/daily` |
| UI | All | Tool detail card | Click blue underlined names | Detail modal opens | Implemented | Pass | Yes | Shows who has issued units |
| UI | All | Tool tracking | Issued vs available units | Issued unit shows borrower/bin/dates | Implemented | Pass | Yes | Removes ambiguity |
| Responsive | Public | Login | 320-430px widths | Single-column, no horizontal overflow | CSS implemented and build passed | Pass | Yes | Global mobile rules |
| Responsive | Authenticated | Shell/pages | 320-430px widths | Sidebar stacks, content fits | CSS implemented and build passed | Pass | Yes | Tables keep horizontal scroll if needed |
| Responsive | Tablet | Shell/pages | 768-1024px widths | Clean spacing, no overlap | CSS implemented and build passed | Pass | Yes | Breakpoint at 820px |
| Regression | All | Build/syntax | JSX and production build | Pass | JSX, compileall, Vite build passed | Pass | N/A | 2026-06-17 |
| API | All | Backend compile/tests | Compile and targeted tests | Pass | Compile passed; pytest blocked by missing `tims_test`; live API smoke passed | Partial | N/A | Live Docker smoke used |

## Bugs Found And Fixed

- Forgot username did not exist as a real backend/frontend flow. Added `/api/auth/forgot-username` and connected the login screen.
- Forgot password UI was a placeholder and could not complete reset without real email delivery. Connected to backend reset APIs and exposes a demo token only when SMTP is not configured.
- Password reset needed dynamic behavior for all active users. Backend reset works by signed token tied to the current password hash.
- Forced restricted route states had no friendly UI fallback. Added an Access Denied screen and role route matrix in the public app bootstrap.
- Mobile shell/login layout used fixed desktop dimensions. Added global responsive rules for login, sidebar, navbar, notification menu, main content, tables, and common modals.

## Remaining Limitations

- Browser/device visual testing depends on local browser automation availability. CSS has been implemented for requested widths and verified by build/static checks; manual visual QA is still recommended.
- The local pytest integration suite could not run because PostgreSQL database `tims_test` does not exist on localhost. Live API smoke tests against the running Docker app passed.
- Activity backup is CSV, which opens in Excel, not native `.xlsx`; this avoids adding a new dependency.
- Real email delivery requires SMTP environment variables. Without SMTP, the reset token is intentionally shown for local/demo use.

## Commands

Backend compile:

```powershell
cd backend
python -m compileall app alembic
```

Backend tests:

```powershell
cd backend
python -m pytest tests/test_integration.py -v --tb=short
```

Frontend checks:

```powershell
cd frontend
Get-ChildItem public/screens -Filter *.jsx | ForEach-Object { Get-Content -Raw $_.FullName | & node_modules/.bin/esbuild.cmd --loader=jsx --format=iife --log-level=error | Out-Null; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }
npm.cmd run build
```

Run app:

```powershell
docker compose up -d --force-recreate backend frontend
```
