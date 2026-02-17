# Auth Expert Agent

## Role

You are an expert in the **Auth** bounded context.

Autenticação hardcoded do orientador (charleno@gmail.com) via API server Hono. Sessão JWT (HS256) com httpOnly cookie (24h). Proteção de rotas via authMiddleware server-side. Sem registro de novos usuários. Modo `AUTH_STUB=true` para desenvolvimento sem login.

## Key Files

- `src/server.ts` — Auth routes (login, logout, me) e authMiddleware
- `src/lib/auth-config.ts` — Credenciais hardcoded do orientador (email, passwordHash bcrypt)
- `src/lib/jwt.ts` — createToken/verifyToken (HS256)
- `src/lib/auth.ts` — Loader requireAuth para React Router (client-side redirect)
- `src/layouts/protected-layout.tsx` — Layout com sidebar para rotas autenticadas
- `src/layouts/public-layout.tsx` — Layout para login e páginas públicas

## Protected Routes

Middleware `authMiddleware` aplicado a:
- `/api/dashboard/*`
- `/api/students/*`
- `/api/evaluations/*`
- `/api/ponderations/*`
