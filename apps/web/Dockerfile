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

ARG VITE_SERVER_URL
ARG VITE_FRONTEND_ORIGIN=http://localhost:3001

ENV NODE_ENV=production
ENV VITE_SERVER_URL=$VITE_SERVER_URL
ENV VITE_FRONTEND_ORIGIN=$VITE_FRONTEND_ORIGIN

RUN pnpm --filter web build

FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3001
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable \
	&& corepack prepare pnpm@10.10.0 --activate

COPY --from=build /app /app

EXPOSE 3001

CMD ["sh", "-c", "pnpm --filter web serve --host 0.0.0.0 --port ${PORT:-3001}"]
