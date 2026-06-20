Fix the remaining TIMS frontend/backend workflow, login recovery, access request, permission handling, deployment, and UI layout issues.

Important:
Do not redesign the application.
Do not change the current branding, colors, sidebar style, dashboard style, or page structure unless required to fix the bugs below.
Keep existing API structure as much as possible.
Fix frontend and backend together so every feature actually works end-to-end.

Current visible problems from screenshots:

1. Requester/Head/Staff dashboard shows a red API error:
   “Could not complete the API request: Insufficient permissions”
2. Forgot username/password page accepts email but does nothing.
3. Login page / deployed app sometimes still shows raw Babel/runtime errors with conflict-marker text.
4. All Tools modal/page is slightly cut from the top and does not look polished.
5. Some pages/cards/modals are getting cut on desktop screens.
6. There are double vertical scrollbars / extra inner scrollbars. Keep only one clean main scrollbar where possible.
7. Request Access form needs role selection and mobile number field.
8. Request Access should verify mobile number using OTP.
9. Forgot password should work fully with backend and email reset link.
10. The real deployment gives errors even though local works.

TASK 1: Fix role-based dashboard API errors

Problem:
Requester, Head, and Staff dashboards should not show red permission errors caused by calling admin-only APIs.

Expected behavior:

* Requester dashboard should only call requester-allowed endpoints.
* Staff dashboard should only call staff-allowed endpoints.
* Head dashboard should only call head-allowed endpoints.
* Admin dashboard can call admin endpoints.
* If an endpoint returns 403, the UI should not show a large raw red error banner on dashboards.
* Instead, either:

  * do not call that endpoint for that role, or
  * show a small user-friendly empty state only where needed.
* Dashboard cards must show data available for that role.
* No role should see “Insufficient permissions” on the dashboard after normal login.

Check:

* frontend/public/screens/Data.jsx
* frontend/public/screens/DashboardScreen.jsx
* frontend/src dashboard files
* backend routers and permission dependencies
* any API helper that globally displays errors

Verify with:

* Requester login
* Staff login
* Head login
* Admin login

TASK 2: Fully implement forgot username/password recovery

Current issue:
The reset credentials page accepts email/employee ID but nothing useful happens.

Required change:
Remove Employee ID option from recovery UI.
The recovery page should accept only registered email address.

Expected forgot password flow:

1. User clicks “Forgot username or password?”
2. User enters registered email.
3. Backend checks whether the email belongs to an active user.
4. If valid, backend creates a secure password reset token.
5. Backend sends reset email with a password reset link.
6. User opens reset link.
7. User enters new password and confirm password.
8. Backend validates token and updates password immediately in the database.
9. Token becomes single-use and expires after a reasonable time, for example 15–30 minutes.
10. User can login immediately with new password.
11. Old password should stop working.

Security requirement:

* Do not email the existing password.
* Do not reveal whether an email exists in a way that allows account enumeration.
* UI message can say:
  “If this email is registered, reset instructions have been sent.”
* Store only hashed passwords.
* Reset token should be securely random and stored hashed if possible.
* Token must expire and must not be reusable.

Forgot username:

* Since Employee ID is the username in this system, the recovery email may include the employee ID only if the email is verified and exists.
* Prefer sending:

  * employee ID
  * password reset link
* Do not show employee ID directly on the public page.

Backend requirements:
Add or verify endpoints like:

* POST /auth/forgot-password
* POST /auth/reset-password
* optional POST /auth/verify-reset-token

Email requirements:

* Use existing SMTP/email config if present.
* If SMTP is not configured, return a clear backend warning in logs but keep UI clean.
* Add environment variables/documentation for SMTP:

  * SMTP_HOST
  * SMTP_PORT
  * SMTP_USER
  * SMTP_PASSWORD
  * SMTP_FROM
  * FRONTEND_BASE_URL
* In development, optionally log the reset link to console only if SMTP is missing, but do not expose it in production UI.

Frontend requirements:

* Reset page should show loading state.
* Show success message after submit.
* Show clean errors for invalid email format, backend down, and expired token.
* Add reset password page/form.
* Password and confirm password must match.
* After successful reset, redirect to Sign In.

TASK 3: Add Request Access role and mobile OTP verification

Current issue:
Request Access form needs role field and mobile number field. It should verify mobile number with OTP.

Expected Request Access form fields:

* Full name
* Employee ID, if required by current system
* Email
* Mobile number
* Department
* Requested role

  * Requester
  * Staff
  * Head
  * Admin only if the system intentionally allows it; otherwise hide Admin from public request access
* Reason/message if already present
* OTP verification status

Mobile OTP flow:

1. User enters mobile number.
2. User clicks “Send OTP”.
3. Backend generates OTP and stores it with expiry.
4. User enters OTP.
5. Backend verifies OTP.
6. Request Access submission is allowed only after mobile OTP is verified.
7. OTP expires after a reasonable time, for example 5–10 minutes.
8. Add resend OTP cooldown.
9. Add max attempts to prevent abuse.

SMS provider:

* If SMS provider is already available, use it.
* If not, create a clean provider abstraction so real SMS can be configured later.
* For development only, log OTP in backend console with clear DEV-only guard.
* Do not expose OTP in production UI.

Backend:

* Add DB fields if needed:

  * mobile_number
  * requested_role
  * otp_hash
  * otp_expires_at
  * otp_verified_at
  * otp_attempt_count
* Update access request approval flow to preserve requested role safely.
* Admin approval should still be required before account activation.
* Prevent overwriting existing accounts.

Frontend:

* Update Request Access tab UI.
* Add role dropdown.
* Add mobile number input.
* Add Send OTP / Verify OTP controls.
* Show verified status clearly.
* Disable submit until required fields and OTP verification are complete.
* Keep styling consistent with current login page.

TASK 4: Remove raw runtime/Babel/API error exposure from login and dashboards

Problem:
The deployed app still showed raw Babel/runtime error text in the login page in some cases.

Expected:

* No raw code snippets, stack traces, “Unexpected token”, “<<<<<<< HEAD”, or Babel errors should be shown to normal users.
* Use a clean error boundary fallback:
  “Something went wrong while loading this page. Please refresh or contact admin.”
* Add Reload button.
* Log actual error only in console for developers.

Also fix:

* Global API errors should be role-aware.
* 403 on optional dashboard widgets should not create full-width red error banners.
* 500/network errors should show clean user-friendly messages.
* Login form should not be blocked by unrelated screen file loading errors.

TASK 5: Fix real deployment mismatch

Problem:
Local app works, but real deployment shows errors.

Investigate and fix:

* frontend runtime JSX files served in deployment
* cache-busting for /screens/*.jsx
* nginx/static file path
* Vite/dev vs production deployment differences
* environment variables for backend API URL
* stale dist files
* Docker volume differences
* whether deployment serves /app/public or /app/dist
* whether old JSX files remain after deploy

Required:

* Runtime JSX files should include version query string or cache-busting.
* nginx should send no-cache/no-store headers for /screens/*.jsx if these files are loaded dynamically.
* Deployment should refuse if conflict markers exist anywhere in source.
* Deployment should verify all runtime JSX files compile.
* Production should not serve stale broken files.

Add/verify checks:

* conflict-marker scan anywhere in file, not only line start:
  `<<<<<<<|=======|>>>>>>>`
* scan should ignore documentation files only if intentionally listed.
* check frontend/public/screens/*.jsx
* check built/dist screens if generated
* check backend Python compile
* check npm build

TASK 6: Fix All Tools UI/modal layout

Current issue from screenshot:
All Tools modal is slightly cut from the top and does not look clean. Close button/header area appears cramped. Table/modal content is not properly aligned.

Expected:

* All Tools modal/page should open fully visible.
* Header should not be cut at the top.
* Close button should be fully visible and aligned.
* Search bar and filters should have proper spacing.
* Table should be readable and not cramped.
* Modal should fit common desktop resolutions.
* On smaller screens, content should adapt without cutting.
* Avoid unnecessary inner vertical scrollbar.
* If scrolling is needed, only modal body should scroll, not header/footer.
* Header and close button should remain visible.
* Keep current visual style; only fix spacing, sizing, overflow, and alignment.

TASK 7: Fix double vertical scrollbars and card cutting across all pages

Current issue:
Some pages show two vertical scrollbars: one main browser scrollbar and one inner content scrollbar. Cards/modals are getting cut on desktop.

Expected:

* Keep one clean main scrollbar wherever possible.
* Avoid nested full-page scroll containers.
* Sidebar/header should remain fixed as currently intended.
* Main content should scroll cleanly.
* Cards should not be cut at bottom/top.
* Modals should not overflow outside viewport.
* Add proper padding-bottom and top spacing.
* Ensure this works on:

  * Dashboard
  * My Requests
  * Tools
  * Requisitions
  * Approvals
  * Issuance
  * Returns
  * Storage Bins
  * Calibration
  * Reports
  * Users
  * Notifications
  * All Tools modal
  * Bin detail modal
  * Add/Edit modals

Do not change functionality or design unnecessarily.

TASK 8: Fix Bin detail modal layout

Current issue from screenshot:
Storage bin detail modal has inner scrollbar and bottom buttons/cards appear cut.

Expected:

* Bin detail modal should fit viewport.
* Header, close button, content, and footer buttons should be visible.
* Only content area scrolls if needed.
* Footer buttons should not be cut.
* No double scrollbar unless truly necessary.
* Works on desktop and mobile/tablet.

TASK 9: Add tests

Backend tests required:

* forgot password request with registered email
* forgot password request with unregistered email returns generic response
* reset password with valid token updates DB
* reset password token cannot be reused
* reset password expired token fails cleanly
* request access with role and mobile number
* OTP send and verify
* access request cannot submit without verified OTP
* dashboard APIs for requester/head/staff/admin do not return inappropriate 403 for normal dashboard loading
* access approval does not overwrite existing users

Frontend/runtime tests or checks:

* login page loads without raw runtime error
* forgot password page submits and shows success
* reset password form validates confirm password
* request access role/mobile/OTP UI works
* dashboards do not show raw permission error banner
* All Tools modal not cut visually
* no duplicate vertical scrollbar on main pages if testable
* all public runtime JSX compiles

TASK 10: Generate full project feature and workflow report

After fixes, create a documentation/report file:

`PROJECT_FEATURE_WORKFLOW_REPORT.md`

Include each and every feature of the project in detail.

Report sections required:

1. Project Overview

* What TIMS does
* Purpose of the system
* Main user roles

2. User Roles

* Requester
* Staff
* Head
* Admin/Maintenance Admin

3. Authentication Workflow

* Login
* Session persistence
* Forgot password
* Password reset email flow
* Request access
* Mobile OTP verification
* Admin approval

4. Requester Dashboard Workflow
   Explain in detail:

* Dashboard cards
* View tools
* Search/filter tools
* Create requisition
* Track request status
* View issued tools
* Return process if applicable
* Notifications

5. Staff Dashboard Workflow
   Explain in detail:

* Dashboard cards
* Approved requisition queue
* Issue tools
* Return tools
* Partial returns
* Mixed condition returns
* Damaged/missing workflow
* Tool availability

6. Head Dashboard Workflow
   Explain in detail:

* Department requests
* Approval/rejection
* Reserved stock behavior
* Department visibility
* Reports/overview if available

7. Admin Dashboard Workflow
   Explain in detail:

* Tool master management
* Add/edit tools
* Tool type, consumable/durable behavior
* Storage bins
* Calibration
* Users
* Access request approval
* Reports
* Activity export
* Stock/reservation logic
* Damage/loss handling
* Last admin protection

8. Tool Inventory Workflow

* Add tool
* Assign bin
* Availability calculation
* Reserved stock
* Issued stock
* Returned stock
* Damaged/missing stock
* Consumable stock

9. Requisition to Issuance Workflow

* Request creation
* Approval
* Reservation
* Issuance
* Date validation
* Return
* Closure

10. Reports Workflow

* Utilization
* Issuance history
* Return history
* Damaged/missing reports
* Calibration reports
* Export behavior
* Quantity consistency

11. Mobile/Desktop Responsiveness

* Header behavior
* Sidebar behavior
* Scroll behavior
* Modal behavior

12. Testing Summary

* Backend tests
* Frontend build
* Runtime JSX compile
* Browser verification
* Deployment verification

TASK 11: Final verification commands

Run these before final response:

Backend:
`python -m compileall backend\app`
`python -m pytest backend\tests`

Frontend:
`npm run build`
Runtime JSX compile for all `frontend/public/screens/*.jsx`

Conflict marker:
`git grep -n -E "<<<<<<<|=======|>>>>>>>"`

Served file check:
Fetch all `/screens/*.jsx` from the running app and confirm no raw conflict/runtime issue remains.

Docker/deployment:
`docker compose up -d --force-recreate backend frontend`

Manual browser checks:

* Login as Admin
* Login as Requester
* Login as Staff
* Login as Head
* Open each dashboard and confirm no permission error banner
* Use forgot password with registered email
* Open reset link and change password
* Login with new password
* Request Access with mobile OTP and role
* Approve request as admin
* Open All Tools modal and confirm it is not cut
* Open Storage Bin modal and confirm it is not cut
* Check all pages for double scrollbar/card cutting
* Test deployed environment if available

Final output format:

A. Root causes found
B. Backend files changed
C. Frontend files changed
D. Database/model changes
E. Email/OTP configuration added
F. Dashboard permission issue fixed how
G. Forgot password/reset workflow result
H. Request access OTP workflow result
I. UI layout fixes completed
J. Deployment mismatch fix
K. Tests passed/failed
L. Manual verification result
M. Report file generated path
N. Remaining risks or setup needed, especially SMTP/SMS environment variables

Important:
Do not claim this is fixed unless:

* Requester/Head/Staff dashboards no longer show permission errors
* Forgot password sends reset email or dev reset link safely
* Reset password updates database immediately
* Request Access role/mobile/OTP works
* All Tools and Bin modals are not cut
* Double scrollbars are removed
* Real deployment/runtime files are verified
* All tests/builds pass
