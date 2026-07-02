# TIMS Backend Test Report

Generated: 2026-07-02 02:30 local time  
Runner: `scripts/run_all_tests.ps1`  
Command: `cd backend && python -m pytest tests/ -v --tb=short`

## Summary

| Metric | Result |
|--------|--------|
| Test files | 7 |
| Collected tests | 227 |
| Passed | 227 |
| Failed | 0 |
| Skipped | 0 |
| Warnings | 393 |
| Duration | 164.64s |
| Status | PASS |

## Coverage

| Area | Files | Result |
|------|-------|--------|
| Service rules | `tests/test_services.py` | PASS |
| Auth, requisitions, issuance, reports, dashboard | `tests/test_integration.py` | PASS |
| Tool CRUD and lifecycle | `tests/test_tools.py` | PASS |
| Storage bins and capacity | `tests/test_storage_bins.py` | PASS |
| User management and access requests | `tests/test_users.py` | PASS |
| Notifications | `tests/test_notifications.py` | PASS |
| End-to-end backend workflows | `tests/test_workflows.py` | PASS |

## Notes

- Test database reset is guarded so it only runs against a database whose name contains `test`.
- Remaining warnings are expected in this environment: Pydantic v2 deprecation warnings and SMTP/SMS configuration warnings.
- No backend tests were skipped in the final run.

