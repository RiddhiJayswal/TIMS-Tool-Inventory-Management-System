#!/bin/bash
# Run this on the Hetzner server to deploy or update TIMS.
# Usage:
#   First deploy : bash deploy.sh
#   Update app   : bash deploy.sh

set -e

COMPOSE="docker compose -f docker-compose.prod.yml"

echo "==> Pulling latest code..."
git pull

echo "==> Checking for unresolved merge conflict markers..."
MARKER_PATTERN="$(printf '%0.s<' {1..7})|$(printf '%0.s=' {1..7})|$(printf '%0.s>' {1..7})"
if git grep -n -E "$MARKER_PATTERN" -- ':!frontend/public/vendor/**' ':!frontend/dist/vendor/**' ':!fix.md' ':!PROJECT_FEATURE_WORKFLOW_REPORT.md'; then
  echo "ERROR: unresolved merge conflict markers found. Resolve them before deployment."
  exit 1
fi

echo "==> Verifying backend Python files compile..."
python -m compileall backend/app

echo "==> Verifying frontend build and runtime JSX..."
(cd frontend && npm run build)

echo "==> Building images without cache..."
$COMPOSE build --no-cache

echo "==> Starting / updating services..."
$COMPOSE up -d --force-recreate --remove-orphans

echo "==> Verifying served frontend container files are clean..."
$COMPOSE exec -T frontend sh -lc "MARKER_PATTERN=\"\$(printf '%0.s<' 1 2 3 4 5 6 7)|\$(printf '%0.s=' 1 2 3 4 5 6 7)|\$(printf '%0.s>' 1 2 3 4 5 6 7)\"; if find /usr/share/nginx/html -type f \( -name '*.jsx' -o -name '*.js' -o -name '*.html' \) -not -path '*/vendor/*' -print0 | xargs -0 grep -nE \"\$MARKER_PATTERN\"; then echo 'ERROR: served frontend files contain conflict markers'; exit 1; fi"

echo "==> Waiting for backend health check..."
sleep 5
$COMPOSE ps

echo ""
echo "TIMS is running. Check logs with:"
echo "  docker compose -f docker-compose.prod.yml logs -f"
