# TIMS E2E Test Report

Generated: 2026-07-02 02:30 local time  
Runner: `scripts/run_all_tests.ps1`  
Command: `cd e2e && npx.cmd playwright test --project=chromium`

## Summary

| Metric | Result |
|--------|--------|
| Browser project | chromium |
| Tests | 109 |
| Passed | 109 |
| Failed | 0 |
| Skipped | 0 |
| Duration | 3.6m |
| Status | PASS |

## Coverage

| File | Area |
|------|------|
| `tests/auth.spec.js` | Login, invalid credentials, case sensitivity, protected routes, logout |
| `tests/responsive.spec.js` | Login/dashboard/tools/requisitions/storage/calibration across 320, 375, 425, 768, and 1024px |
| `tests/workflow-a.spec.js` | Requester to head approval to staff issue to return |
| `tests/workflow-b.spec.js` | Rejection flow and stock unchanged behavior |
| `tests/workflow-c.spec.js` | Reservation and overbooking prevention |
| `tests/workflow-d.spec.js` | Calibration blocking and calibration report access |
| `tests/workflow-e.spec.js` | Damaged and missing returns, damage assessment, damage report |
| `tests/workflow-f.spec.js` | Role restrictions for reports, users, tools, issuance, returns, and approvals |

## Notes

- Playwright runs against a managed Vite server at `http://127.0.0.1:5174`.
- The test matrix is intentionally one Playwright project because `responsive.spec.js` loops through the viewport set internally.
- The generated HTML/artifact folders were removed during cleanup; they can be recreated by rerunning Playwright.
- No E2E tests were skipped in the final run.

