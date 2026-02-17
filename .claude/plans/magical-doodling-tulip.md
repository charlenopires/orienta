# Plan: Update README.md, CLAUDE.md, .claude/ and .cwa/ files

## Context

The project has 4 completed specs (Dashboard, Schema, Auth, CRUD Alunos, Checklist) with 39 done tasks, but all documentation files are either missing (README.md), outdated (CLAUDE.md has only generic domain model), or boilerplate from CWA init (.claude/agents are one-liners, .cwa/constitution.md is a generic template). Need to align all docs with actual implemented state.

---

## Step 1: Create README.md

Create a proper project README covering:
- Project name and description (Orienta - ferramenta de orientação de pesquisa acadêmica)
- Tech stack (Bun, Hono, React 19, React Router 7, Drizzle ORM, Neon PostgreSQL, Tailwind CSS 4, Shadcn/UI)
- Prerequisites (Bun, Neon PostgreSQL account)
- Setup instructions (clone, bun install, .env, db:push, dev servers)
- Available scripts from package.json
- Project structure (src/ tree)
- Database schema overview (5 tables with opc_ prefix)
- Deploy instructions (Fly.io)
- Domain overview (7 bounded contexts)

**File**: `/Users/fazapp/projects/pessoal/orienta/README.md`

---

## Step 2: Update CLAUDE.md

Rewrite to reflect actual project state:
- Keep workflow guidelines (task management via CWA)
- Update domain model descriptions with implementation details
- Add **Tech Stack** section with versions
- Add **Project Structure** section with key file paths
- Add **Development** section (how to run dev, how to build)
- Add **Key Patterns** section:
  - Server imports use relative paths (not @/ alias)
  - Shadcn components install to @/ root, must mv to src/
  - All DB tables prefixed opc_
  - Auth is hardcoded (single user)
  - Dark theme is default (no light mode)
- Add **API Routes** summary

**File**: `/Users/fazapp/projects/pessoal/orienta/CLAUDE.md`

---

## Step 3: Update .claude/agents/ (domain experts)

Each domain expert agent currently has only 1-2 lines. Expand with:
- Key files they should know about
- API endpoints in their domain
- Database tables they own
- Components they're responsible for
- Patterns to follow

Files to update:
- `.claude/agents/aiassistant-expert.md` — opc_ai_tips, Anthropic API (not yet implemented)
- `.claude/agents/auth-expert.md` — auth-config.ts, jwt.ts, server.ts auth routes, login.tsx
- `.claude/agents/checklist-expert.md` — checklist-data.ts, checklist-item.tsx, avaliacoes.tsx, evaluations.ts API
- `.claude/agents/infrastructure-expert.md` — opc-schema.ts, db/index.ts, server.ts, Dockerfile, fly.toml, vite.config.ts
- `.claude/agents/ponderation-expert.md` — opc_ponderations table, evaluations.ts finalize endpoint, historico.tsx (stub)
- `.claude/agents/studentportal-expert.md` — portal.tsx (stub), /api/portal/:token (stub)
- `.claude/agents/students-expert.md` — students.ts API, alunos.tsx, student-form-sheet.tsx, student-combobox.tsx

General agents (analyst, architect, implementer, etc.) are generic CWA agents — leave as-is.

---

## Step 4: Update .claude/rules/

Update rules to be more project-specific:

- **api.md** — Add Hono-specific patterns (sub-routers, relative imports for server files, cookie-based auth)
- **domain.md** — Add opc_ table prefix convention, cuid2 for IDs, UUID for public tokens
- **tests.md** — Keep as-is (no tests implemented yet, rules are generic enough)
- **workflow.md** — Keep as-is (CWA workflow rules are correct)
- **memory.md** — Keep as-is (memory recording guidelines are generic enough)

---

## Step 5: Update .cwa/constitution.md

Replace generic template with project-specific constitution:
- Purpose: Orienta academic research project evaluation tool
- Core values: keep Clarity, Simplicity, Testability
- Technical constraints: Bun runtime, Neon PostgreSQL shared DB, opc_ prefix, single hardcoded user
- Quality standards: tsc --noEmit + vite build must pass
- Workflow rules: keep WIP limit 1
- Out-of-scope: user registration, multi-tenant, light theme

---

## Step 6: Update CWA spec statuses

Move completed specs from "draft" to "completed":
- c940a1ee (Dashboard e Layout Principal) → completed
- ebefa962 (Schema do Banco e Infraestrutura) → completed
- 446ceee7 (Autenticação Hardcoded) → completed
- 0c244575 (CRUD de Alunos) → already completed
- cdf8ad75 (Formulário Interativo de Checklist) → already completed
- 94157efe (Conteúdo do Checklist) → completed (implemented in checklist-data.ts)

Remaining in draft (not yet implemented):
- 2f862646 (Sistema de Ponderações e Histórico)
- 817a7f83 (Portal Público do Aluno)
- 001c66cf (Motor de Dicas de Melhoria via IA)

---

## Files to modify

| File | Action |
|------|--------|
| `README.md` | Create |
| `CLAUDE.md` | Rewrite |
| `.claude/agents/aiassistant-expert.md` | Expand |
| `.claude/agents/auth-expert.md` | Expand |
| `.claude/agents/checklist-expert.md` | Expand |
| `.claude/agents/infrastructure-expert.md` | Expand |
| `.claude/agents/ponderation-expert.md` | Expand |
| `.claude/agents/studentportal-expert.md` | Expand |
| `.claude/agents/students-expert.md` | Expand |
| `.claude/rules/api.md` | Update |
| `.claude/rules/domain.md` | Update |
| `.cwa/constitution.md` | Rewrite |

CWA spec status updates via MCP:
- 3 specs → completed (c940a1ee, ebefa962, 446ceee7, 94157efe)

---

## Verification

1. Read all modified files to confirm content is accurate
2. Run `bun run tsc --noEmit && bun run build` to ensure no breakage (docs-only changes)
3. Verify CWA spec statuses via `cwa_list_specs`
