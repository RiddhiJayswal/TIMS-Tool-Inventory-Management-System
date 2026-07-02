# TIMS Full Test Summary

Generated: 2026-07-02 02:30 local time  
Runner: `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -ExecutionPolicy Bypass -File .\scripts\run_all_tests.ps1`

## Overall Status

| Suite | Tests | Passed | Failed | Skipped | Status |
|-------|-------|--------|--------|---------|--------|
| Backend pytest | 227 | 227 | 0 | 0 | PASS |
| Frontend Vitest | 53 | 53 | 0 | 0 | PASS |
| Playwright E2E | 109 | 109 | 0 | 0 | PASS |
| **Total** | **389** | **389** | **0** | **0** | **PASS** |

Total runner duration: 401.3s.

## Commands

```powershell
.\scripts\run_all_tests.ps1
```

```powershell
cd backend
python -m pytest tests/ -v --tb=short
```

```powershell
cd frontend
npm.cmd test
```

```powershell
cd e2e
npx.cmd playwright test --project=chromium
```

## Artifacts

| Artifact | Path |
|----------|------|
| Machine summary | `test-results/test-run.json` |

Raw test logs and generated Playwright artifact folders were removed during cleanup. They can be recreated by rerunning the test suites.

## Residual Warnings

- Backend emits expected SMTP and SMS configuration warnings because external delivery providers are not configured in the local test environment.
- Backend emits Pydantic v2 deprecation warnings from dependencies/config style. These are not failing tests.

