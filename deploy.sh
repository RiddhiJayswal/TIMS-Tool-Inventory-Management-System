#!/bin/bash
# Run this on the Hetzner server to deploy or update TIMS.
# Usage:
#   First deploy : bash deploy.sh
#   Update app   : bash deploy.sh

set -e

COMPOSE="docker compose -f docker-compose.prod.yml"

echo "==> Pulling latest code..."
git pull

echo "==> Building images (no cache on first deploy, cached on updates)..."
$COMPOSE build

echo "==> Starting / updating services..."
$COMPOSE up -d --remove-orphans

echo "==> Waiting for backend health check..."
sleep 5
$COMPOSE ps

echo ""
echo "TIMS is running. Check logs with:"
echo "  docker compose -f docker-compose.prod.yml logs -f"
