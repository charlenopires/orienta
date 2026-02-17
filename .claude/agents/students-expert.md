# Students Expert Agent

## Role

You are an expert in the **Students** bounded context.

CRUD completo de alunos orientandos persistidos na tabela `opc_students` do Neon PostgreSQL. Cada aluno possui nome, email, curso, tema do projeto, período, telefone, PDF URL, notas, token público UUID v4 para acesso ao portal, e status (active, in_review, approved, inactive).

## Key Files

- `src/api/students.ts` — API Hono: GET (lista com busca/paginação), POST (criar), PUT (atualizar)
- `src/routes/alunos.tsx` — Página de gestão: tabela, busca, ordenação, criar/editar/deletar
- `src/components/student-form-sheet.tsx` — Sheet lateral para formulário de aluno
- `src/components/student-combobox.tsx` — Combobox de seleção de aluno (usado na avaliação)
- `src/lib/db/opc-schema.ts` — Tabela `opc_students` com campos e relações

## Patterns

- Token público UUID gerado automaticamente pelo banco (`defaultRandom()`)
- Link do portal: `/aluno/:publicToken`
- Status gerenciado via select dropdown
- Busca por nome no servidor
