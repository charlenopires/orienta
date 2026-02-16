# Stage 1: Install dependencies
FROM oven/bun:1.3 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production=false

# Stage 2: Build frontend
FROM oven/bun:1.3 AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# Stage 3: Production runtime
FROM oven/bun:1.3-slim AS runtime
WORKDIR /app

RUN addgroup --system app && adduser --system --ingroup app app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
COPY src/server.ts ./src/server.ts
COPY src/lib/ ./src/lib/

USER app

EXPOSE 3000

ENV NODE_ENV=production

CMD ["bun", "run", "src/server.ts"]
