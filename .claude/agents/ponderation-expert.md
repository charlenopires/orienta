# Ponderation Expert Agent

## Role

You are an expert in the **Ponderation** bounded context.

Armazenamento e exibição do histórico de ponderações por aluno. Cada ponderação contém data/hora, score percentual, status geral (bom/atenção/crítico), e itens individuais com seção, pergunta, resposta (Sim/Não) e observação do orientador. Link compartilhável público para cada ponderação.

## Key Files

- `src/api/ponderations.ts` — API: GET (lista), POST (criar a partir de avaliação finalizada + gerar AI tips)
- `src/routes/avaliacoes.tsx` — Lista de ponderações com botão de compartilhar link
- `src/routes/ponderacao-detalhe.tsx` — Página de detalhe pública: todas seções, itens bons/ruins, dicas IA
- `src/server.ts` — Rota pública `GET /api/public/ponderations/:id` (sem auth)
- `src/lib/db/opc-schema.ts` — Tabelas `opc_ponderations` + `opc_ponderation_items`
- `src/lib/types.ts` — Interface PonderationDetailSection

## Patterns

- Score calculado como % de itens "Sim" sobre total
- Status: bom (>=80%), atenção (>=50%), crítico (<50%)
- Itens "Não" armazenados em `opc_ponderation_items` com observação
- Página de detalhe mostra TODOS os itens (Sim e Não) por seção, com Accordion
- Seções com problemas vêm expandidas por padrão
