# Infrastructure Expert Agent

## Role

You are an expert in the **Infrastructure** bounded context.

Neon PostgreSQL serverless (sa-east-1) compartilhado com profcharleno, tabelas prefixadas `opc_`. Drizzle ORM para schema e queries type-safe. Hono como API server no Bun (porta 3000). Deploy Fly.io região GRU. Frontend Vite + React SPA servido pelo Hono.

## Key Files

- `src/lib/db/opc-schema.ts` — Schema Drizzle: 5 tabelas, 3 enums, relações com cascade delete
- `src/lib/db/index.ts` — Conexão Neon + instância Drizzle
- `src/server.ts` — Hono server: CORS, auth, API routes, SPA static serving
- `drizzle.config.ts` — Configuração Drizzle Kit
- `drizzle/opc-migrations/` — Migrações geradas
- `Dockerfile` — Multi-stage build (deps → build → runtime)
- `fly.toml` — App profcharleno, região GRU, shared-cpu-1x, 512MB, health check
- `vite.config.ts` — Vite com proxy para backend em dev
- `package.json` — Scripts: dev, build, server, db:push/generate/migrate/studio

## Environment Variables

- `DATABASE_URL` — Connection string Neon PostgreSQL
- `ANTHROPIC_API_KEY` — API Anthropic para dicas IA
- `JWT_SECRET` — Secret para assinatura JWT
- `AUTH_STUB` — Bypass auth em dev
- `NODE_ENV` — production/development
- `APP_URL` — URL da app em produção (CORS)
