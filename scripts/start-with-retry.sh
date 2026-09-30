#!/usr/bin/env bash
set -euo pipefail

MAX_ATTEMPTS=20
DELAY_SECONDS=10
ATTEMPT=1

echo "Running prisma migrate deploy (with retry for DB cold starts)..."

until npx prisma migrate deploy; do
  if [ "$ATTEMPT" -ge "$MAX_ATTEMPTS" ]; then
    echo "prisma migrate deploy failed after $ATTEMPT attempts. Giving up."
    exit 1
  fi

  echo "Migration failed (attempt $ATTEMPT/$MAX_ATTEMPTS). Database may still be waking up. Retrying in ${DELAY_SECONDS}s..."
  ATTEMPT=$((ATTEMPT + 1))
  sleep "$DELAY_SECONDS"
done

echo "Migrations applied successfully. Starting backend..."
exec node dist/apps/backend/main.js