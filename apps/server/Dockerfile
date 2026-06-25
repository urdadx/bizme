FROM node:22-slim AS base

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:/usr/local/bin:$PATH"

RUN corepack enable \
	&& corepack prepare pnpm@10.10.0 --activate \
	&& npm install -g bun@1.2.23

COPY . .

RUN pnpm install --frozen-lockfile

FROM base AS build

ENV NODE_ENV=production

RUN pnpm --filter server build

FROM node:22-slim AS runner

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=file:/data/local.db
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:/usr/local/bin:$PATH"

RUN corepack enable \
	&& corepack prepare pnpm@10.10.0 --activate \
	&& npm install -g bun@1.2.23

COPY --from=build /app /app

WORKDIR /app/apps/server

RUN mkdir -p /data uploads/comment-images uploads/poll-option-images

EXPOSE 3000

VOLUME ["/data", "/app/apps/server/uploads"]

CMD ["sh", "-c", "if [ -f dist/index.mjs ]; then bun run dist/index.mjs; elif [ -f dist/index.js ]; then bun run dist/index.js; else bun run dist/src/index.js; fi"]
