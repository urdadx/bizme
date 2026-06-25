#!/usr/bin/env sh
set -e

export DATABASE_URL="${DATABASE_URL:-file:/data/local.db}"

mkdir -p /data /app/apps/server/uploads/comment-images /app/apps/server/uploads/poll-option-images

cd /app
bun --cwd packages/db run db:migrate

cd /app/apps/server

if [ -f dist/index.mjs ]; then
	exec bun run dist/index.mjs
elif [ -f dist/index.js ]; then
	exec bun run dist/index.js
else
	exec bun run dist/src/index.js
fi
