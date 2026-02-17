# Orienta Constitution

## Purpose

Sistema de orientação e avaliação de projetos de pesquisa acadêmica. Permite ao orientador avaliar projetos via checklist baseado em normas ABNT (NBR 15287, 6023, 10520), gerar dicas de melhoria com IA (Claude Sonnet 4.5) e acompanhar o progresso dos alunos via portal público.

## Core Values

1. **Clarity** - Code should be self-documenting and easy to understand
2. **Simplicity** - Prefer simple solutions over complex ones
3. **Testability** - All features must be testable
4. **User Focus** - Priorizar a experiência do orientador e do aluno

## Technical Constraints

- **Language**: TypeScript 5.9+
- **Runtime**: Bun >= 1.3
- **Frontend**: React 19 + React Router 7 + Vite 7 + Tailwind CSS v4 + shadcn/ui
- **Backend**: Hono (API server)
- **Database**: Neon PostgreSQL serverless (sa-east-1), Drizzle ORM
- **AI**: Anthropic Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)
- **Deploy**: Fly.io (app profcharleno, região GRU)
- **Tables prefix**: `opc_`

## Quality Standards

- All code must pass TypeScript type checking without errors
- No hardcoded secrets or credentials (exceto auth config do orientador)
- Meaningful commit messages in English
- Server-side imports use relative paths, client-side use `@/` alias

## Workflow Rules

- Only one task in progress at a time (WIP limit: 1)
- Specs must have acceptance criteria before implementation
- All architectural decisions must be recorded as ADRs
- Code review required before merging

## Bounded Contexts

1. **Auth** — Login único, JWT, middleware
2. **Students** — CRUD alunos orientandos
3. **Checklist** — 9 seções, 54 itens ABNT
4. **Ponderation** — Avaliações finalizadas com score
5. **AIAssistant** — Dicas de melhoria via Claude
6. **StudentPortal** — Portal público do aluno
7. **Infrastructure** — Banco, deploy, serving

## Out of Scope

- Registro de novos usuários (apenas login hardcoded)
- Multi-tenancy (apenas um orientador)
- Notificações por email
- Edição de ponderações já finalizadas
