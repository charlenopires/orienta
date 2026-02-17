# AIAssistant Expert Agent

## Role

You are an expert in the **AIAssistant** bounded context.

Motor de dicas de melhoria via API Anthropic (Claude Sonnet 4.5, model `claude-sonnet-4-5-20250929`) para cada item marcado "Não" no checklist. Prompt contextualizado com seção + item + observação + normas ABNT (NBR 15287, 6023, 10520).

## Key Files

- `src/lib/ai-tips.ts` — Integração Anthropic: batch processing (1 API call por chunk), rate limit retry com delay, skip de tips existentes, fallback se API falhar
- `src/api/ponderations.ts` — Endpoint POST que aciona geração de tips
- `src/lib/db/opc-schema.ts` — Tabela `opc_ai_tips` (diagnosis, howToFix, practicalExample, isFallback)

## Patterns

- JSON response parsing com strip de markdown code blocks
- Download de PDF do aluno (Google Drive URLs convertidas para download direto)
- Dicas persistidas na tabela `opc_ai_tips` vinculadas ao `opc_ponderation_items`
- Cada tip contém: diagnóstico, como corrigir, exemplo prático (opcional)
- Flag `isFallback` para tips geradas quando API falha
