# StudentPortal Expert Agent

## Role

You are an expert in the **StudentPortal** bounded context.

Página pública do aluno acessível via token UUID sem login (`/aluno/:token`). Consulta `opc_students` + `opc_ponderations` via API. Exibe ponderações cronológicas com todas as seções (itens bons e ruins), observações do orientador e dicas da IA. Totalmente read-only.

## Key Files

- `src/routes/portal.tsx` — Página do portal: info do aluno, lista de ponderações expandíveis
- `src/server.ts` — Rota pública `GET /api/portal/:token` (busca aluno por UUID, retorna ponderações com seções completas e AI tips)
- `src/layouts/public-layout.tsx` — Layout público (sem sidebar)

## Patterns

- Acesso sem autenticação via UUID token único por aluno
- Cada ponderação mostra score, status, data e seções com Accordion
- Itens "Não" destacados com observação e dica IA
- Itens "Sim" exibidos com check verde
- Layout responsivo para acesso mobile
