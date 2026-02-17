# Orienta

Sistema de orientação e avaliação de projetos de pesquisa acadêmica com checklist ABNT, dicas de IA e portal do aluno.

## Tech Stack

- **Runtime:** Bun >= 1.3
- **Frontend:** React 19 + React Router 7 + Vite 7 + Tailwind CSS v4 + shadcn/ui
- **Backend:** Hono (API server no Bun, porta 3000)
- **Banco:** Neon PostgreSQL serverless (sa-east-1), Drizzle ORM, tabelas prefixadas `opc_`
- **IA:** Anthropic Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`) para dicas de melhoria
- **Auth:** JWT httpOnly cookie (24h), login único hardcoded, bcryptjs
- **IDs:** cuid2 (PKs), UUID v4 (tokens públicos)
- **Deploy:** Fly.io app `profcharleno`, região GRU, shared-cpu-1x 512MB

## Estrutura do Projeto

```
src/
  api/              # Rotas API Hono
    students.ts     # CRUD alunos (GET/POST/PUT com busca e paginação)
    evaluations.ts  # Rascunhos de avaliação (GET/POST/PUT)
    ponderations.ts # Ponderações finalizadas (GET/POST + geração de tips)
  components/       # Componentes React
    ui/             # shadcn/ui (accordion, badge, button, card, dialog, etc.)
    checklist-item.tsx, header.tsx, sidebar.tsx, student-form-sheet.tsx, etc.
  layouts/
    protected-layout.tsx  # Rotas autenticadas (/dashboard, /alunos, /avaliacoes)
    public-layout.tsx     # Rotas públicas (/, /aluno/:token, /ponderacoes/:id)
  lib/
    ai-tips.ts      # Integração Anthropic: batch processing, retry, fallback
    auth-config.ts  # Credenciais hardcoded do orientador
    auth.ts         # Loader requireAuth para React Router
    checklist-data.ts  # 9 seções, 54 itens Sim/Não (ABNT NBR 15287, 6023, 10520)
    jwt.ts          # createToken/verifyToken (HS256)
    types.ts        # Interfaces TypeScript
    db/
      index.ts      # Conexão Neon + Drizzle
      opc-schema.ts # Schema: 5 tabelas + relações + enums
  routes/
    login.tsx, dashboard.tsx, alunos.tsx, avaliacoes.tsx,
    ponderacao-detalhe.tsx, portal.tsx, historico.tsx
  server.ts         # Hono: auth routes + middleware + API + SPA serving
  router.tsx        # React Router config
  main.tsx          # Entry point
  index.css         # Tema CSS (dark mode)
```

## Banco de Dados (5 tabelas)

- **opc_students** — nome, email, curso, projectTopic, period, phone, pdfUrl, notes, publicToken (UUID), status (active|in_review|approved|inactive)
- **opc_evaluations** — studentId (FK), status (draft|finalized), data (JSONB)
- **opc_ponderations** — studentId (FK), scorePercent, statusGeneral (bom|atencao|critico)
- **opc_ponderation_items** — ponderationId (FK), sectionId, itemId, question, answer (bool), observation
- **opc_ai_tips** — ponderationItemId (FK), diagnosis, howToFix, practicalExample, isFallback

Relações com cascade delete. Schema em `src/lib/db/opc-schema.ts`.

## Rotas API

### Públicas
- `GET /api/health` — Health check
- `POST /api/auth/login` — Email/senha → JWT cookie
- `POST /api/auth/logout` — Remove cookie
- `GET /api/auth/me` — Usuário atual ou 401
- `GET /api/public/ponderations/:id` — Detalhe ponderação com AI tips (compartilhável)
- `GET /api/portal/:token` — Portal do aluno (ponderações por UUID token)

### Protegidas (authMiddleware)
- `GET/POST/PUT /api/students` — CRUD alunos
- `GET/POST/PUT /api/evaluations` — Rascunhos avaliação
- `GET/POST /api/ponderations` — Ponderações
- `POST /api/ponderations/:id/tips` — Regenerar dicas IA
- `GET /api/dashboard/stats` — KPIs dashboard

## Rotas SPA

- `/` — Login
- `/dashboard` — Dashboard com stats e últimas ponderações
- `/alunos` — Gestão de alunos (CRUD, busca, paginação)
- `/avaliacoes` — Checklist de avaliação (54 itens) + lista de ponderações
- `/historico` — Histórico (stub)
- `/ponderacoes/:id` — Detalhe ponderação (público, sem auth)
- `/aluno/:token` — Portal do aluno (público, sem auth)

## Domain Model

### Auth
Autenticação hardcoded do orientador (charleno@gmail.com) via Hono. JWT httpOnly cookie (24h). Middleware protege `/api/dashboard/*`, `/api/students/*`, `/api/evaluations/*`, `/api/ponderations/*`. `AUTH_STUB=true` para dev. Sem registro de novos usuários.

### Students
CRUD completo de alunos orientandos em `opc_students`. Campos: nome, email, curso, tema do projeto, período, telefone, PDF URL, notas, token público UUID v4, status. Busca e paginação na API.

### Checklist
Formulário com 9 seções e 54 itens Sim/Não baseados no Guia do Orientador Acadêmico e normas ABNT (NBR 15287:2025, NBR 6023:2025, NBR 10520). Observação obrigatória ao marcar "Não". Rascunhos em `opc_evaluations` (JSONB). Definição em `src/lib/checklist-data.ts`.

### Ponderation
Avaliação finalizada. Cada ponderação tem score percentual e status geral (bom/atenção/crítico). Items individuais em `opc_ponderation_items` com seção, pergunta, resposta e observação. Lista cronológica com link compartilhável público.

### AIAssistant
Dicas de melhoria via API Anthropic (Claude Sonnet 4.5) para cada item marcado "Não". Prompt contextualizado com seção + item + observação + normas ABNT. Batch processing (1 API call por chunk), rate limit retry com delay, skip de tips existentes. Fallback se API falhar. Dicas em `opc_ai_tips` (diagnosis, howToFix, practicalExample). Implementação em `src/lib/ai-tips.ts`.

### StudentPortal
Página pública do aluno via token UUID sem login (`/aluno/:token`). Exibe ponderações cronológicas com todas as seções (itens bons e ruins), observações do orientador e dicas da IA. Totalmente read-only.

### Infrastructure
Neon PostgreSQL serverless (sa-east-1) compartilhado com profcharleno, tabelas `opc_*`. Drizzle ORM (type-safe). Hono no Bun (porta 3000). Deploy Fly.io região GRU (shared-cpu-1x, 512MB). Multi-stage Dockerfile. Frontend SPA (Vite build → dist/) servido pelo Hono. Health check em `/api/health`.

## Padrões do Código

- **Server:** imports relativos (não `@/`), Hono sub-routers para modularidade
- **Client:** alias `@/` para `src/`, React Router v7 com loaders, shadcn/ui, Sonner toasts
- **Design:** dark theme, Tailwind CSS variables, responsive grid, Accordion para seções colapsáveis, Badge para status
- **IDs:** cuid2 para PKs, UUID v4 para tokens públicos

## Workflow Guidelines

**IMPORTANT:** Always update task status on the Kanban board as you work:

1. **Before starting work:** Move task to `in_progress`
   ```
   cwa task move <task-id> in_progress
   ```
   Or via MCP: `cwa_update_task_status(task_id, "in_progress")`

2. **When ready for review:** Move task to `review`

3. **When complete:** Move task to `done`

**Live Board:** Run `cwa serve` and open http://127.0.0.1:3030 to see real-time updates.
