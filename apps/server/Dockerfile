FROM oven/bun:1 AS deps

WORKDIR /app

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* bun.lockb* bun.lock* ./
COPY packages ./packages
COPY apps ./apps

RUN bun install

FROM deps AS builder

WORKDIR /app

RUN cd apps/server && bun run build

FROM oven/bun:1-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=file:/data/local.db

COPY --from=deps /app /app
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY docker/server/entrypoint.sh ./docker/server/entrypoint.sh
COPY docker/server/start.sh ./docker/server/start.sh

RUN chmod +x ./docker/server/entrypoint.sh ./docker/server/start.sh \
	&& mkdir -p /data ./apps/server/uploads/comment-images ./apps/server/uploads/poll-option-images

EXPOSE 3000

VOLUME ["/data", "/app/apps/server/uploads"]

ENTRYPOINT ["/app/docker/server/entrypoint.sh"]
CMD ["/app/docker/server/start.sh"]
