# TIMS Errors and Solutions

Updated: 2026-07-02 02:30 local time

## Resolved During This Run

| ID | Area | Symptom | Root Cause | Resolution | Status |
|----|------|---------|------------|------------|--------|
| FIX-001 | Backend test DB | Backend tests could leave a half-dropped schema after repeated runs. | Test setup reset the public schema without a strict test-database guard. | Added a database-name guard and recreated schema/tables before seeding. | Fixed |
| FIX-002 | Backend user tests | Some user tests failed validation or assumed a successful response before checking status. | Test emails used `.test` domains rejected by validation, and assertions indexed error payloads. | Switched fake addresses to `tims.example.com` and asserted response status before indexing. | Fixed |
| FIX-003 | Backend reports | Same-day issuance/requisition report filters missed records after local midnight. | Business timestamps were stored as naive UTC while API filters used local date values. | Date filters now compare date portions, and operational record timestamps use local naive time defaults. | Fixed |
| FIX-004 | Backend seed | `python seed.py` failed on local Docker DB with password-reset FK rows present. | Seed cleanup deleted users before password reset tokens. | Deleted `PasswordResetToken` records before deleting users. | Fixed |
| FIX-005 | Backend workflow expectations | Rejection-with-empty-reason and reserved stock tests expected old behavior. | Current API validation returns 422 and stock reports distinguish physical, issued, and reserved quantities. | Updated tests to match current API contract and stock model. | Fixed |
| FIX-006 | Frontend Vitest | Vitest collection hung. | `vmForks` pool and proxy-based lucide mocks interacted poorly with test discovery. | Switched Vitest to `forks` and replaced proxy icon mocks with explicit icon exports. | Fixed |
| FIX-007 | Frontend tests | Requisitions tests failed under router mocks. | The page expected `useLocation`, but the test mock did not expose it. | Added `useLocation` to the React Router mock. | Fixed |
| FIX-008 | Frontend app shell | E2E served the legacy static/Babel app instead of the Vite React app. | `frontend/index.html` still referenced `/screens/*.jsx`. | Replaced with the Vite root and `/src/main.jsx` module entry. | Fixed |
| FIX-009 | E2E auth | Playwright login failed against seeded local data. | E2E credentials did not match `backend/seed.py`. | Updated E2E helper credentials to `password123`. | Fixed |
| FIX-010 | E2E stability | E2E tests timed out or multiplied to hundreds of duplicate project cases. | `networkidle` waits were too strict and Playwright projects duplicated internally-looped responsive tests. | Used `domcontentloaded`/direct assertions and a single Chromium project. | Fixed |

## Final Result

All automated suites passed through the Windows runner:

| Suite | Passed | Failed | Skipped |
|-------|--------|--------|---------|
| Backend pytest | 227 | 0 | 0 |
| Frontend Vitest | 53 | 0 | 0 |
| Playwright E2E | 109 | 0 | 0 |

## Remaining Non-Failing Warnings

| Warning | Impact | Recommendation |
|---------|--------|----------------|
| SMTP is not configured | Password reset and access request emails are not delivered in local tests. | Configure SMTP in deployed environments and keep local tests mocked. |
| SMS_API_URL is not configured | Mobile OTP delivery is not sent in local tests. | Configure SMS provider for production/manual QA. |
| Pydantic class-based config deprecation | No current behavior failure. | Migrate schemas/config to `ConfigDict` before Pydantic v3. |

