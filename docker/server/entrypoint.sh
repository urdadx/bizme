#!/usr/bin/env sh
set -e

export DATABASE_URL="${DATABASE_URL:-file:/data/local.db}"

mkdir -p /data /app/apps/server/uploads/comment-images /app/apps/server/uploads/poll-option-images

echo "Running database push..."
cd /app/packages/db
bun run db:push

echo "Running database seed..."
bun run db:seed || echo "Seed failed, skipped, or already run."

echo "Starting application..."
cd /app/apps/server
exec "$@"
