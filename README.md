# Orienta

Sistema de orientação e avaliação de projetos de pesquisa acadêmica. Permite ao orientador avaliar projetos via checklist baseado em normas ABNT, gerar dicas de melhoria com IA e acompanhar o progresso dos alunos.

## Stack

- **Frontend:** Vite 7 + React 19, Tailwind CSS v4, shadcn/ui, Lucide React
- **Backend:** Hono (Bun runtime)
- **Banco:** Neon PostgreSQL (sa-east-1), Drizzle ORM
- **IA:** Anthropic Claude Sonnet 4.5 (dicas de melhoria por item)
- **Deploy:** Fly.io (GRU) — https://profcharleno.fly.dev

## Funcionalidades

- **Dashboard** — KPIs (total alunos, avaliações, ponderações do mês, média de conformidade) e últimas ponderações
- **Gestão de Alunos** — CRUD completo com busca, paginação, status e link público do portal
- **Checklist de Avaliação** — 9 seções, 54 itens Sim/Não baseados em normas ABNT (NBR 15287, 6023, 10520). Observação obrigatória ao marcar "Não". Salvar rascunho ou finalizar como ponderação
- **Ponderações** — Histórico cronológico por aluno com score, status (bom/atenção/crítico) e link compartilhável
- **Dicas IA** — Geração automática de diagnóstico + como corrigir + exemplo prático para cada item "Não", via Claude Sonnet 4.5 com batch processing e retry
- **Portal do Aluno** — Página pública read-only via token UUID (sem login). Exibe ponderações, observações e dicas da IA
- **Ponderação Pública** — Página de detalhe acessível sem autenticação para compartilhamento

## Requisitos

- [Bun](https://bun.sh) >= 1.3
- Banco Neon PostgreSQL

## Setup

```bash
# Instalar dependências
bun install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Criar tabelas no banco
bun run db:push
```

## Desenvolvimento

```bash
# Iniciar frontend (Vite) + backend (Hono) juntos
bun run dev:all

# Ou separadamente:
bun run dev          # Vite em http://localhost:5173
bun run dev:server   # Hono em http://localhost:3000
```

### Scripts disponíveis

| Script | Descrição |
|--------|-----------|
| `bun run dev` | Frontend dev server (Vite, porta 5173) |
| `bun run dev:server` | Backend dev server (Hono, porta 3000, hot reload) |
| `bun run dev:all` | Frontend + Backend simultaneamente |
| `bun run build` | Build de produção (Vite → dist/) |
| `bun run server` | Servidor de produção |
| `bun run db:generate` | Gerar migrações Drizzle |
| `bun run db:migrate` | Executar migrações |
| `bun run db:push` | Push schema direto pro banco |
| `bun run db:studio` | Editor visual do banco (Drizzle Studio) |

## Deploy (Fly.io)

```bash
# Configurar secrets
fly secrets set DATABASE_URL="sua_url_neon" --app profcharleno
fly secrets set JWT_SECRET="$(openssl rand -base64 32)" --app profcharleno
fly secrets set ANTHROPIC_API_KEY="sk-ant-..." --app profcharleno

# Deploy
fly deploy --app profcharleno
```

- **App:** profcharleno
- **Região:** GRU (São Paulo)
- **VM:** shared-cpu-1x, 512MB RAM
- **Health check:** GET /api/health

## Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | Connection string Neon PostgreSQL |
| `ANTHROPIC_API_KEY` | Chave API Anthropic (Claude Sonnet 4.5) |
| `JWT_SECRET` | Secret para assinatura JWT |
| `AUTH_STUB` | `true` para bypass de auth em dev |

## Estrutura

```
src/
  api/              # Rotas API Hono (students, evaluations, ponderations)
  components/       # Componentes React (checklist-item, header, sidebar, etc.)
    ui/             # Componentes shadcn/ui (accordion, badge, button, card, etc.)
  layouts/          # Layouts (protected-layout, public-layout)
  lib/              # Utilitários (ai-tips, auth, checklist-data, jwt, types)
    db/             # Schema Drizzle ORM (opc-schema) e conexão
  routes/           # Páginas da SPA (dashboard, alunos, avaliacoes, portal, etc.)
  server.ts         # Servidor Hono (API + SPA serving)
  router.tsx        # Configuração React Router
  main.tsx          # Entry point React
  index.css         # Tema Tailwind CSS
```

## Rotas

### API Pública
- `GET /api/health` — Health check
- `POST /api/auth/login` — Login (email/senha → JWT cookie)
- `POST /api/auth/logout` — Logout
- `GET /api/auth/me` — Usuário autenticado
- `GET /api/public/ponderations/:id` — Detalhe ponderação (compartilhável)
- `GET /api/portal/:token` — Portal do aluno (por UUID token)

### API Protegida (requer auth)
- `GET/POST/PUT /api/students` — CRUD alunos
- `GET/POST/PUT /api/evaluations` — Rascunhos de avaliação
- `GET/POST /api/ponderations` — Ponderações finalizadas
- `GET /api/dashboard/stats` — KPIs do dashboard

### SPA
- `/` — Login
- `/dashboard` — Dashboard
- `/alunos` — Gestão de alunos
- `/avaliacoes` — Formulário de avaliação
- `/historico` — Histórico (stub)
- `/ponderacoes/:id` — Detalhe de ponderação (público)
- `/aluno/:token` — Portal do aluno (público)

## Banco de Dados

5 tabelas prefixadas `opc_`:

- **opc_students** — Alunos (nome, email, curso, tema, período, telefone, pdfUrl, token público, status)
- **opc_evaluations** — Rascunhos de avaliação (studentId, status draft/finalized, data JSONB)
- **opc_ponderations** — Ponderações finalizadas (studentId, scorePercent, statusGeneral bom/atencao/critico)
- **opc_ponderation_items** — Itens da ponderação (sectionId, itemId, question, answer, observation)
- **opc_ai_tips** — Dicas IA (ponderationItemId, diagnosis, howToFix, practicalExample, isFallback)

## Autenticação

Login único hardcoded (charleno@gmail.com) com bcrypt + JWT httpOnly cookie (24h). Middleware protege rotas `/api/dashboard/*`, `/api/students/*`, `/api/evaluations/*`, `/api/ponderations/*`. Modo `AUTH_STUB=true` para desenvolvimento sem login.
