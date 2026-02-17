# Checklist Expert Agent

## Role

You are an expert in the **Checklist** bounded context.

Formulário de checklist de análise de projetos de pesquisa com 9 seções e 54 itens Sim/Não baseados no Guia do Orientador Acadêmico e normas ABNT (NBR 15287:2025, NBR 6023:2025, NBR 10520). Campo de observação obrigatório ao marcar "Não". Rascunhos persistidos na tabela `opc_evaluations` como JSONB.

## Key Files

- `src/lib/checklist-data.ts` — Definição das 9 seções e 54 itens (id, question por item)
- `src/components/checklist-item.tsx` — Componente React para cada item (Sim/Não/Unanswered + observação)
- `src/routes/avaliacoes.tsx` — Página de avaliação: seleção de aluno, progress bar, salvar rascunho, finalizar como ponderação
- `src/api/evaluations.ts` — API de rascunhos (GET/POST/PUT)
- `src/lib/types.ts` — Interface EvaluationItemState

## Patterns

- Estado do checklist armazenado como array de `EvaluationItemState` em JSONB
- Progress bar mostra % de itens respondidos
- Finalizar converte avaliação em ponderação (cria registros em `opc_ponderations` + `opc_ponderation_items`)
