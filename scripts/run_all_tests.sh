#!/usr/bin/env bash
# TIMS test runner for Linux/macOS.
# Usage: ./scripts/run_all_tests.sh [--backend] [--frontend] [--e2e] [--all]

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT/backend"
FRONTEND_DIR="$ROOT/frontend"
E2E_DIR="$ROOT/e2e"
RESULTS_DIR="$ROOT/test-results"

RUN_BACKEND=false
RUN_FRONTEND=false
RUN_E2E=false

if [[ $# -eq 0 ]]; then
    RUN_BACKEND=true
    RUN_FRONTEND=true
    RUN_E2E=true
fi

for arg in "$@"; do
    case "$arg" in
        --backend) RUN_BACKEND=true ;;
        --frontend) RUN_FRONTEND=true ;;
        --e2e) RUN_E2E=true ;;
        --all)
            RUN_BACKEND=true
            RUN_FRONTEND=true
            RUN_E2E=true
            ;;
        *)
            echo "Unknown flag: $arg" >&2
            exit 1
            ;;
    esac
done

BACKEND_OK=0
FRONTEND_OK=0
E2E_OK=0
START=$(date +%s)

mkdir -p "$RESULTS_DIR"

echo ""
echo "------------------------------------------------------------"
echo "  TIMS Test Runner - $(date '+%Y-%m-%d %H:%M:%S')"
echo "------------------------------------------------------------"
echo ""

if $RUN_BACKEND; then
    echo "[ BACKEND ] Running pytest..."
    cd "$BACKEND_DIR"
    set +e
    python -m pytest tests/ -v --tb=short 2>&1 | tee "$RESULTS_DIR/backend-pytest-output.txt"
    BACKEND_OK=$?
    set -e
    cd "$ROOT"
    if [[ $BACKEND_OK -eq 0 ]]; then
        echo "[ BACKEND ] PASSED"
    else
        echo "[ BACKEND ] FAILED (exit $BACKEND_OK)"
    fi
    echo ""
fi

if $RUN_FRONTEND; then
    echo "[ FRONTEND ] Running Vitest..."
    cd "$FRONTEND_DIR"
    if [[ ! -d node_modules ]]; then
        echo "node_modules not found; running npm install..."
        npm install
    fi
    set +e
    npm test 2>&1 | tee "$RESULTS_DIR/frontend-vitest-output.txt"
    FRONTEND_OK=$?
    set -e
    cd "$ROOT"
    if [[ $FRONTEND_OK -eq 0 ]]; then
        echo "[ FRONTEND ] PASSED"
    else
        echo "[ FRONTEND ] FAILED (exit $FRONTEND_OK)"
    fi
    echo ""
fi

if $RUN_E2E; then
    echo "[ E2E ] Running Playwright..."
    cd "$E2E_DIR"
    if [[ ! -d node_modules ]]; then
        echo "node_modules not found; running npm install..."
        npm install
    fi
    set +e
    npx playwright test --project=chromium 2>&1 | tee "$RESULTS_DIR/e2e-playwright-output.txt"
    E2E_OK=$?
    set -e
    cd "$ROOT"
    if [[ $E2E_OK -eq 0 ]]; then
        echo "[ E2E ] PASSED"
    else
        echo "[ E2E ] FAILED (exit $E2E_OK)"
    fi
    echo ""
fi

END=$(date +%s)
DURATION=$((END - START))
ALL_PASSED=true

echo "------------------------------------------------------------"
echo "  SUMMARY"
echo "------------------------------------------------------------"
if $RUN_BACKEND; then
    if [[ $BACKEND_OK -eq 0 ]]; then
        echo "  Backend  : PASS"
    else
        echo "  Backend  : FAIL"
        ALL_PASSED=false
    fi
fi
if $RUN_FRONTEND; then
    if [[ $FRONTEND_OK -eq 0 ]]; then
        echo "  Frontend : PASS"
    else
        echo "  Frontend : FAIL"
        ALL_PASSED=false
    fi
fi
if $RUN_E2E; then
    if [[ $E2E_OK -eq 0 ]]; then
        echo "  E2E      : PASS"
    else
        echo "  E2E      : FAIL"
        ALL_PASSED=false
    fi
fi
echo ""
echo "  Duration : ${DURATION}s"
echo "  Reports  : $RESULTS_DIR"
echo ""

if $ALL_PASSED; then
    echo "  ALL TESTS PASSED"
    exit 0
else
    echo "  SOME TESTS FAILED - check output above"
    exit 1
fi
