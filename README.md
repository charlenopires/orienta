# Orienta

Sistema de orientação e avaliação de projetos de pesquisa acadêmica. Permite ao orientador avaliar projetos via checklist baseado em normas ABNT, gerar dicas de melhoria com IA e acompanhar o progresso dos alunos.

## Stack

- **Frontend:** Vite + React 19, Tailwind CSS v4, shadcn/ui
- **Backend:** Hono (Bun runtime)
- **Banco:** Neon PostgreSQL (sa-east-1), Drizzle ORM
- **IA:** Anthropic Claude Sonnet 4.5
- **Deploy:** Fly.io (GRU)

## Requisitos

- [Bun](https://bun.sh) >= 1.3
- Banco Neon PostgreSQL

## Setup

```bash
# Instalar dependencias
bun install

# Configurar variaveis de ambiente
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

## Deploy (Fly.io)

```bash
# Configurar secrets
fly secrets set DATABASE_URL="sua_url_neon" --app profcharleno
fly secrets set JWT_SECRET="$(openssl rand -base64 32)" --app profcharleno
fly secrets set ANTHROPIC_API_KEY="sk-ant-..." --app profcharleno

# Deploy
fly deploy --app profcharleno
```

## Estrutura

```
src/
  api/           # Rotas API (students, evaluations)
  components/    # Componentes React
  lib/           # Utilitarios (db, auth, jwt)
  pages/         # Paginas da SPA
  server.ts      # Servidor Hono (API + SPA)
```
