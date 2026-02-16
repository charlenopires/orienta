import Anthropic from "@anthropic-ai/sdk"
import { db } from "./db"
import { opcAiTips, opcPonderationItems } from "./db/opc-schema"
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

function buildPrompt(sectionTitle: string, question: string, observation: string): string {
  return `Você é um orientador acadêmico especialista em projetos de pesquisa e normas ABNT (NBR 15287:2025, NBR 6023:2025, NBR 10520).

Um aluno recebeu feedback negativo no seguinte item de avaliação do seu projeto de pesquisa:

**Seção:** ${sectionTitle}
**Item avaliado:** ${question}
**Observação do orientador:** ${observation}

Com base nessas informações e nas normas ABNT aplicáveis, forneça orientação prática para o aluno corrigir este ponto.

Responda APENAS em JSON válido, sem markdown, com a seguinte estrutura:
{
  "diagnosis": "Explicação breve (1-2 frases) do que está errado ou ausente",
  "howToFix": "Instruções práticas e detalhadas de como corrigir (2-4 frases)",
  "practicalExample": "Um exemplo prático concreto de como deveria ficar (pode ser um trecho de texto, formato de citação, etc.)"
}`
}

async function generateTipForItem(item: PonderationItemRow): Promise<void> {
  const section = checklistSections.find((s) => s.id === item.sectionId)
  const sectionTitle = section?.title ?? item.sectionId

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250514",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: buildPrompt(sectionTitle, item.question, item.observation ?? ""),
        },
      ],
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
  } catch (err) {
    console.error(`[ai-tips] Failed for item ${item.id}:`, err)

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
    await generateTipForItem(item)
  }

  console.log(`[ai-tips] Completed for ponderation ${ponderationId}`)
}
