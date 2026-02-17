import Anthropic from "@anthropic-ai/sdk"
import { db } from "./db"
import { opcAiTips, opcPonderationItems, opcPonderations, opcStudents } from "./db/opc-schema"
import { eq } from "drizzle-orm"
import { checklistSections } from "./checklist-data"

const anthropic = new Anthropic()

interface PonderationItemRow {
  id: string
  sectionId: string
  itemId: string
  question: string
  observation: string | null
}

function buildPrompt(sectionTitle: string, question: string, observation: string, hasPdf: boolean): string {
  const pdfInstructions = hasPdf
    ? `

O PDF do projeto de pesquisa do aluno foi anexado a esta mensagem. Use-o para:
1. Localizar a seção relevante no texto real do aluno
2. Identificar o trecho problemático específico
3. Citar o texto real do aluno no diagnóstico
4. Oferecer sugestões concretas de reescrita baseadas no conteúdo real

Suas respostas devem fazer referência direta ao texto do aluno, não ser genéricas.`
    : ""

  return `Você é um orientador acadêmico especialista em projetos de pesquisa e normas ABNT (NBR 15287:2025, NBR 6023:2025, NBR 10520).

Um aluno recebeu feedback negativo no seguinte item de avaliação do seu projeto de pesquisa:

**Seção:** ${sectionTitle}
**Item avaliado:** ${question}
**Observação do orientador:** ${observation}
${pdfInstructions}
Com base nessas informações e nas normas ABNT aplicáveis, forneça orientação prática para o aluno corrigir este ponto.

Responda APENAS em JSON válido, sem markdown, com a seguinte estrutura:
{
  "diagnosis": "Explicação detalhada (1-2 parágrafos) do que está errado ou ausente, referenciando o texto do aluno quando possível",
  "howToFix": "Instruções práticas e detalhadas de como corrigir (1-2 parágrafos), com passos claros e referências às normas aplicáveis",
  "practicalExample": "Um exemplo prático concreto e detalhado de como deveria ficar (pode ser um trecho de texto reescrito, formato de citação, estrutura sugerida, etc.)"
}`
}

async function generateTipForItem(item: PonderationItemRow, pdfUrl: string | null): Promise<void> {
  const section = checklistSections.find((s) => s.id === item.sectionId)
  const sectionTitle = section?.title ?? item.sectionId

  const tryGenerate = async (usePdf: boolean): Promise<void> => {
    const hasPdf = usePdf && !!pdfUrl
    const prompt = buildPrompt(sectionTitle, item.question, item.observation ?? "", hasPdf)

    const content: Anthropic.MessageCreateParams["messages"][0]["content"] = hasPdf
      ? [
          { type: "document", source: { type: "url", url: pdfUrl! } },
          { type: "text", text: prompt },
        ]
      : prompt

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250514",
      max_tokens: 1500,
      messages: [{ role: "user", content }],
    })

    const text = message.content[0].type === "text" ? message.content[0].text : ""
    const parsed = JSON.parse(text) as {
      diagnosis: string
      howToFix: string
      practicalExample: string | null
    }

    await db.insert(opcAiTips).values({
      ponderationItemId: item.id,
      diagnosis: parsed.diagnosis,
      howToFix: parsed.howToFix,
      practicalExample: parsed.practicalExample ?? null,
      isFallback: false,
    })
  }

  try {
    // Try with PDF first if available
    await tryGenerate(true)
  } catch (err) {
    if (pdfUrl) {
      console.warn(`[ai-tips] PDF failed for item ${item.id}, retrying without PDF:`, err)
      try {
        // Retry without PDF
        await tryGenerate(false)
        return
      } catch (retryErr) {
        console.error(`[ai-tips] Retry without PDF also failed for item ${item.id}:`, retryErr)
      }
    } else {
      console.error(`[ai-tips] Failed for item ${item.id}:`, err)
    }

    await db.insert(opcAiTips).values({
      ponderationItemId: item.id,
      diagnosis: "Não foi possível gerar a dica automaticamente.",
      howToFix: "Consulte seu orientador para orientações sobre este item.",
      practicalExample: null,
      isFallback: true,
    })
  }
}

export async function generateAiTipsForPonderation(ponderationId: string): Promise<void> {
  console.log(`[ai-tips] Starting generation for ponderation ${ponderationId}`)

  // Look up student's pdfUrl via ponderation → student
  const ponderation = await db
    .select({ studentId: opcPonderations.studentId })
    .from(opcPonderations)
    .where(eq(opcPonderations.id, ponderationId))
    .then((rows) => rows[0])

  let pdfUrl: string | null = null
  if (ponderation) {
    const student = await db
      .select({ pdfUrl: opcStudents.pdfUrl })
      .from(opcStudents)
      .where(eq(opcStudents.id, ponderation.studentId))
      .then((rows) => rows[0])
    pdfUrl = student?.pdfUrl ?? null
  }

  if (pdfUrl) {
    console.log(`[ai-tips] Found student PDF: ${pdfUrl}`)
  } else {
    console.log(`[ai-tips] No PDF available, using text-only prompts`)
  }

  const items = await db
    .select({
      id: opcPonderationItems.id,
      sectionId: opcPonderationItems.sectionId,
      itemId: opcPonderationItems.itemId,
      question: opcPonderationItems.question,
      observation: opcPonderationItems.observation,
    })
    .from(opcPonderationItems)
    .where(eq(opcPonderationItems.ponderationId, ponderationId))

  if (items.length === 0) {
    console.log(`[ai-tips] No items to process for ponderation ${ponderationId}`)
    return
  }

  console.log(`[ai-tips] Processing ${items.length} items for ponderation ${ponderationId}`)

  // Sequential processing to avoid rate limits
  for (const item of items) {
    await generateTipForItem(item, pdfUrl)
  }

  console.log(`[ai-tips] Completed for ponderation ${ponderationId}`)
}
