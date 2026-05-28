## --- Stage 1: deps ---
FROM node:24-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# better-sqlite3 has a native binding — needs python3 + make + g++ to compile.
# These get left behind in deps stage; runner is slim.
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 make g++ \
    && rm -rf /var/lib/apt/lists/* \
    && npm ci --legacy-peer-deps

## --- Stage 2: builder ---
FROM node:24-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Repo has no public/ directory — create an empty one so the runner's
# `COPY --from=builder /app/public` doesn't fail.
RUN mkdir -p public && npm run build

## --- Stage 3: runner ---
FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Stateless app, no native deps, no SQLite — just the standalone bundle.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
