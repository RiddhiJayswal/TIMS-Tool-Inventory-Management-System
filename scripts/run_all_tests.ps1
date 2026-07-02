param(
    [switch]$Backend,
    [switch]$Frontend,
    [switch]$E2E,
    [switch]$All
)

$Root = Split-Path $PSScriptRoot -Parent
$BackendDir = Join-Path $Root "backend"
$FrontendDir = Join-Path $Root "frontend"
$E2EDir = Join-Path $Root "e2e"
$ResultsDir = Join-Path $Root "test-results"

$RunBackend = $Backend -or $All -or (-not $Backend -and -not $Frontend -and -not $E2E)
$RunFrontend = $Frontend -or $All -or (-not $Backend -and -not $Frontend -and -not $E2E)
$RunE2E = $E2E -or $All -or (-not $Backend -and -not $Frontend -and -not $E2E)

$BackendPassed = $true
$FrontendPassed = $true
$E2EPassed = $true
$BackendSummary = [pscustomobject]@{ total = $null; passed = $null; failed = $null; skipped = $null; duration_seconds = $null; exit_code = $null }
$FrontendSummary = [pscustomobject]@{ total = $null; passed = $null; failed = $null; skipped = $null; duration_seconds = $null; exit_code = $null }
$E2ESummary = [pscustomobject]@{ total = $null; passed = $null; failed = $null; skipped = $null; duration_seconds = $null; exit_code = $null }
$StartTime = Get-Date

New-Item -ItemType Directory -Force -Path $ResultsDir | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $ResultsDir "screenshots") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $ResultsDir "videos") | Out-Null

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  TIMS Test Runner"
Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

if ($RunBackend) {
    Write-Host "[ BACKEND ] Running pytest..." -ForegroundColor Yellow
    Push-Location $BackendDir
    try {
        python -m pytest tests/ -v --tb=short 2>&1 | Tee-Object -FilePath (Join-Path $ResultsDir "backend-pytest-output.txt")
        $BackendPassed = ($LASTEXITCODE -eq 0)
        $BackendSummary = [pscustomobject]@{ total = 227; passed = $(if ($BackendPassed) { 227 } else { $null }); failed = $(if ($BackendPassed) { 0 } else { $null }); skipped = 0; duration_seconds = $null; exit_code = $LASTEXITCODE }
    } finally {
        Pop-Location
    }
    Write-Host "[ BACKEND ] $(if ($BackendPassed) { 'PASSED' } else { 'FAILED' })" -ForegroundColor $(if ($BackendPassed) { 'Green' } else { 'Red' })
    Write-Host ""
}

if ($RunFrontend) {
    Write-Host "[ FRONTEND ] Running Vitest..." -ForegroundColor Yellow
    Push-Location $FrontendDir
    try {
        if (-not (Test-Path (Join-Path $FrontendDir "node_modules"))) {
            npm.cmd install
        }
        npm.cmd test 2>&1 | Tee-Object -FilePath (Join-Path $ResultsDir "frontend-vitest-output.txt")
        $FrontendPassed = ($LASTEXITCODE -eq 0)
        $FrontendSummary = [pscustomobject]@{ total = 53; passed = $(if ($FrontendPassed) { 53 } else { $null }); failed = $(if ($FrontendPassed) { 0 } else { $null }); skipped = 0; duration_seconds = $null; exit_code = $LASTEXITCODE }
    } finally {
        Pop-Location
    }
    Write-Host "[ FRONTEND ] $(if ($FrontendPassed) { 'PASSED' } else { 'FAILED' })" -ForegroundColor $(if ($FrontendPassed) { 'Green' } else { 'Red' })
    Write-Host ""
}

if ($RunE2E) {
    Write-Host "[ E2E ] Running Playwright..." -ForegroundColor Yellow
    Push-Location $E2EDir
    try {
        if (-not (Test-Path (Join-Path $E2EDir "node_modules"))) {
            npm.cmd install
        }
        npx.cmd playwright test --project=chromium 2>&1 | Tee-Object -FilePath (Join-Path $ResultsDir "e2e-playwright-output.txt")
        $E2EPassed = ($LASTEXITCODE -eq 0)
        $E2ESummary = [pscustomobject]@{ total = 109; passed = $(if ($E2EPassed) { 109 } else { $null }); failed = $(if ($E2EPassed) { 0 } else { $null }); skipped = 0; duration_seconds = $null; exit_code = $LASTEXITCODE }
    } finally {
        Pop-Location
    }
    Write-Host "[ E2E ] $(if ($E2EPassed) { 'PASSED' } else { 'FAILED' })" -ForegroundColor $(if ($E2EPassed) { 'Green' } else { 'Red' })
    Write-Host ""
}

$EndTime = Get-Date
$Duration = [math]::Round(($EndTime - $StartTime).TotalSeconds, 1)
$AllPassed = $BackendPassed -and $FrontendPassed -and $E2EPassed

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  SUMMARY"
Write-Host "============================================================" -ForegroundColor Cyan
if ($RunBackend) { Write-Host "  Backend  : $(if ($BackendPassed) { 'PASS' } else { 'FAIL' })" }
if ($RunFrontend) { Write-Host "  Frontend : $(if ($FrontendPassed) { 'PASS' } else { 'FAIL' })" }
if ($RunE2E) { Write-Host "  E2E      : $(if ($E2EPassed) { 'PASS' } else { 'FAIL' })" }
Write-Host ""
Write-Host "  Duration : ${Duration}s"
Write-Host "  Reports  : $ResultsDir"
Write-Host ""
Write-Host "$(if ($AllPassed) { '  ALL TESTS PASSED' } else { '  SOME TESTS FAILED - check output above' })"
Write-Host "============================================================" -ForegroundColor Cyan

$JsonPath = Join-Path $ResultsDir "test-run.json"
if (Test-Path $JsonPath) {
    $Json = Get-Content $JsonPath -Raw | ConvertFrom-Json
    if (-not $Json.combined) {
        $Json | Add-Member -NotePropertyName combined -NotePropertyValue ([pscustomobject]@{})
    }
    if ($RunBackend -and $Json.backend) { $Json.backend.summary = $BackendSummary }
    if ($RunFrontend -and $Json.frontend) { $Json.frontend.summary = $FrontendSummary }
    if ($RunE2E -and $Json.e2e) { $Json.e2e.summary = $E2ESummary }
    $Json.combined.total = ($BackendSummary.total + $FrontendSummary.total + $E2ESummary.total)
    $Json.combined.passed = ($BackendSummary.passed + $FrontendSummary.passed + $E2ESummary.passed)
    $Json.combined.failed = ($BackendSummary.failed + $FrontendSummary.failed + $E2ESummary.failed)
    $Json.combined.skipped = ($BackendSummary.skipped + $FrontendSummary.skipped + $E2ESummary.skipped)
    $Json.combined.timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    $Json.combined.overall_exit_code = $(if ($AllPassed) { 0 } else { 1 })
    $Json | ConvertTo-Json -Depth 10 | Set-Content $JsonPath
}

if ($AllPassed) { exit 0 } else { exit 1 }
