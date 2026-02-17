import Anthropic from "@anthropic-ai/sdk"
import { db } from "./db"
import { opcAiTips, opcPonderationItems, opcPonderations, opcStudents } from "./db/opc-schema"
import { eq } from "drizzle-orm"
import { checklistSections } from "./checklist-data"

const anthropic = new Anthropic()

const DELAY_BETWEEN_ITEMS_MS = 15_000 // 15s between items to stay under rate limits

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Convert Google Drive sharing URLs to direct download URLs.
 */
function toDirectDownloadUrl(url: string): string {
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
  if (driveMatch) {
    return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`
  }
  return url
}

/**
 * Download a PDF from a URL and return it as base64.
 */
async function downloadPdfAsBase64(url: string): Promise<string | null> {
  try {
    const directUrl = toDirectDownloadUrl(url)
    console.log(`[ai-tips] Downloading PDF from: ${directUrl}`)
    const res = await fetch(directUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      redirect: "follow",
    })
    if (!res.ok) {
      console.warn(`[ai-tips] PDF download failed: ${res.status} ${res.statusText}`)
      return null
    }
    const buffer = await res.arrayBuffer()
    const header = new Uint8Array(buffer.slice(0, 5))
    const isPdf = header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46
    if (!isPdf) {
      console.warn(`[ai-tips] Downloaded file is not a PDF (magic bytes mismatch)`)
      return null
    }
    const base64 = Buffer.from(buffer).toString("base64")
    console.log(`[ai-tips] PDF downloaded: ${Math.round(buffer.byteLength / 1024)}KB`)
    return base64
  } catch (err) {
    console.warn(`[ai-tips] PDF download error:`, err)
    return null
  }
}

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

async function callClaudeWithRetry(
  content: Anthropic.MessageCreateParams["messages"][0]["content"],
  maxRetries = 3,
): Promise<string> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 1500,
        messages: [{ role: "user", content }],
      })
      return message.content[0].type === "text" ? message.content[0].text : ""
    } catch (err: unknown) {
      const isRateLimit = err instanceof Error && err.message.includes("rate_limit")
      if (isRateLimit && attempt < maxRetries) {
        const waitSec = 30 * (attempt + 1) // 30s, 60s, 90s
        console.warn(`[ai-tips] Rate limited, waiting ${waitSec}s before retry ${attempt + 1}/${maxRetries}`)
        await sleep(waitSec * 1000)
        continue
      }
      throw err
    }
  }
  throw new Error("Max retries exceeded")
}

async function generateTipForItem(item: PonderationItemRow, pdfBase64: string | null): Promise<void> {
  const section = checklistSections.find((s) => s.id === item.sectionId)
  const sectionTitle = section?.title ?? item.sectionId

  const tryGenerate = async (usePdf: boolean): Promise<void> => {
    const hasPdf = usePdf && !!pdfBase64
    const prompt = buildPrompt(sectionTitle, item.question, item.observation ?? "", hasPdf)

    const content: Anthropic.MessageCreateParams["messages"][0]["content"] = hasPdf
      ? [
          { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdfBase64! } },
          { type: "text", text: prompt },
        ]
      : prompt

    const rawText = await callClaudeWithRetry(content)
    // Strip markdown code block wrappers if present
    const text = rawText.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim()
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
    await tryGenerate(true)
  } catch (err) {
    if (pdfBase64) {
      console.warn(`[ai-tips] PDF call failed for item ${item.id}, retrying without PDF:`, err instanceof Error ? err.message : err)
      try {
        await tryGenerate(false)
        return
      } catch (retryErr) {
        console.error(`[ai-tips] Retry without PDF also failed for item ${item.id}:`, retryErr instanceof Error ? retryErr.message : retryErr)
      }
    } else {
      console.error(`[ai-tips] Failed for item ${item.id}:`, err instanceof Error ? err.message : err)
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

  const ponderation = await db
    .select({ studentId: opcPonderations.studentId })
    .from(opcPonderations)
    .where(eq(opcPonderations.id, ponderationId))
    .then((rows) => rows[0])

  let pdfBase64: string | null = null
  if (ponderation) {
    const student = await db
      .select({ pdfUrl: opcStudents.pdfUrl })
      .from(opcStudents)
      .where(eq(opcStudents.id, ponderation.studentId))
      .then((rows) => rows[0])
    const pdfUrl = student?.pdfUrl ?? null

    if (pdfUrl) {
      console.log(`[ai-tips] Found student PDF URL: ${pdfUrl}`)
      pdfBase64 = await downloadPdfAsBase64(pdfUrl)
    }
  }

  if (pdfBase64) {
    console.log(`[ai-tips] PDF loaded successfully, will use for context`)
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

  for (let i = 0; i < items.length; i++) {
    await generateTipForItem(items[i], pdfBase64)
    console.log(`[ai-tips] Completed item ${i + 1}/${items.length}`)
    // Delay between items to respect rate limits (skip delay after last item)
    if (i < items.length - 1) {
      await sleep(DELAY_BETWEEN_ITEMS_MS)
    }
  }

  console.log(`[ai-tips] Completed all ${items.length} items for ponderation ${ponderationId}`)
}
