# TIMS Frontend Test Report

Generated: 2026-07-02 02:30 local time  
Runner: `scripts/run_all_tests.ps1`  
Command: `cd frontend && npm.cmd test`

## Summary

| Metric | Result |
|--------|--------|
| Test files | 7 |
| Tests | 53 |
| Passed | 53 |
| Failed | 0 |
| Skipped | 0 |
| Duration | 8.98s |
| Status | PASS |

## Coverage

| File | Tests | Area |
|------|-------|------|
| `src/__tests__/api.test.js` | 8 | API client exports and auth headers |
| `src/__tests__/Login.test.jsx` | 9 | Login form, loading, error state, request-access switch |
| `src/__tests__/ProtectedRoute.test.jsx` | 5 | Auth guard and role guard |
| `src/__tests__/Dashboard.test.jsx` | 6 | Dashboard loading, data rendering, role tolerance |
| `src/__tests__/Tools.test.jsx` | 9 | Tool list, search, roles, API error handling |
| `src/__tests__/Requisitions.test.jsx` | 7 | Requisition list, status display, roles |
| `src/__tests__/StorageBins.test.jsx` | 9 | Bin list, counts, form focus, empty/error states |

## Notes

- Vitest now uses the `forks` pool to avoid the previous `vmForks` collection hang.
- Lucide icon mocks are explicit exports so test discovery is stable.
- No frontend tests were skipped in the final run.

