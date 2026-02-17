import Anthropic from "@anthropic-ai/sdk"
import { db } from "./db"
import { opcAiTips, opcPonderationItems, opcPonderations, opcStudents } from "./db/opc-schema"
import { eq, inArray } from "drizzle-orm"
import { checklistSections } from "./checklist-data"

const anthropic = new Anthropic()

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

function buildBatchPrompt(
  items: { sectionTitle: string; question: string; observation: string; itemId: string }[],
  hasPdf: boolean,
): string {
  const pdfInstructions = hasPdf
    ? `

O PDF do projeto de pesquisa do aluno foi anexado a esta mensagem. Use-o para:
1. Localizar as seções relevantes no texto real do aluno
2. Identificar os trechos problemáticos específicos
3. Citar o texto real do aluno no diagnóstico
4. Oferecer sugestões concretas de reescrita baseadas no conteúdo real

Suas respostas devem fazer referência direta ao texto do aluno, não ser genéricas.`
    : ""

  const itemsList = items
    .map(
      (item, i) =>
        `### Item ${i + 1} (id: "${item.itemId}")
**Seção:** ${item.sectionTitle}
**Item avaliado:** ${item.question}
**Observação do orientador:** ${item.observation}`,
    )
    .join("\n\n")

  return `Você é um orientador acadêmico especialista em projetos de pesquisa e normas ABNT (NBR 15287:2025, NBR 6023:2025, NBR 10520).

Um aluno recebeu feedback negativo nos seguintes itens de avaliação do seu projeto de pesquisa:

${itemsList}
${pdfInstructions}
Para CADA item acima, forneça orientação prática detalhada (1-2 parágrafos por campo).

Responda APENAS em JSON válido, sem markdown, como um array com um objeto por item, NA MESMA ORDEM:
[
  {
    "itemId": "id do item",
    "diagnosis": "Explicação detalhada (1-2 parágrafos) do que está errado ou ausente",
    "howToFix": "Instruções práticas detalhadas de como corrigir (1-2 parágrafos)",
    "practicalExample": "Exemplo prático concreto de como deveria ficar"
  }
]`
}

async function callClaudeWithRetry(
  content: Anthropic.MessageCreateParams["messages"][0]["content"],
  maxRetries = 3,
): Promise<string> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 16000,
        messages: [{ role: "user", content }],
      })
      return message.content[0].type === "text" ? message.content[0].text : ""
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err)
      const isRateLimit = errMsg.includes("rate_limit") || errMsg.includes("429")
      if (isRateLimit && attempt < maxRetries) {
        const waitSec = 60 * (attempt + 1) // 60s, 120s, 180s
        console.warn(`[ai-tips] Rate limited, waiting ${waitSec}s before retry ${attempt + 1}/${maxRetries}`)
        await sleep(waitSec * 1000)
        continue
      }
      throw err
    }
  }
  throw new Error("Max retries exceeded")
}

export async function generateAiTipsForPonderation(ponderationId: string): Promise<void> {
  console.log(`[ai-tips] Starting generation for ponderation ${ponderationId}`)

  const ponderation = await db
    .select({ studentId: opcPonderations.studentId })
    .from(opcPonderations)
    .where(eq(opcPonderations.id, ponderationId))
    .then((rows) => rows[0])

  if (!ponderation) {
    console.log(`[ai-tips] Ponderation ${ponderationId} not found`)
    return
  }

  // Get all ponderation items
  const allItems = await db
    .select({
      id: opcPonderationItems.id,
      sectionId: opcPonderationItems.sectionId,
      itemId: opcPonderationItems.itemId,
      question: opcPonderationItems.question,
      observation: opcPonderationItems.observation,
    })
    .from(opcPonderationItems)
    .where(eq(opcPonderationItems.ponderationId, ponderationId))

  if (allItems.length === 0) {
    console.log(`[ai-tips] No items to process for ponderation ${ponderationId}`)
    return
  }

  // Filter out items that already have tips
  const existingTips = await db
    .select({ ponderationItemId: opcAiTips.ponderationItemId })
    .from(opcAiTips)
    .where(inArray(opcAiTips.ponderationItemId, allItems.map((i) => i.id)))

  const existingItemIds = new Set(existingTips.map((t) => t.ponderationItemId))
  const items = allItems.filter((i) => !existingItemIds.has(i.id))

  if (items.length === 0) {
    console.log(`[ai-tips] All ${allItems.length} items already have tips for ponderation ${ponderationId}`)
    return
  }

  console.log(`[ai-tips] ${items.length} items need tips (${existingItemIds.size} already done) for ponderation ${ponderationId}`)

  // Download PDF
  let pdfBase64: string | null = null
  const student = await db
    .select({ pdfUrl: opcStudents.pdfUrl })
    .from(opcStudents)
    .where(eq(opcStudents.id, ponderation.studentId))
    .then((rows) => rows[0])

  if (student?.pdfUrl) {
    console.log(`[ai-tips] Found student PDF URL: ${student.pdfUrl}`)
    pdfBase64 = await downloadPdfAsBase64(student.pdfUrl)
  }

  if (pdfBase64) {
    console.log(`[ai-tips] PDF loaded, using batched generation`)
  } else {
    console.log(`[ai-tips] No PDF, using text-only batched generation`)
  }

  // Build batch items with section titles
  const batchItems = items.map((item) => {
    const section = checklistSections.find((s) => s.id === item.sectionId)
    return {
      ...item,
      sectionTitle: section?.title ?? item.sectionId,
      observation: item.observation ?? "",
    }
  })

  // Process in chunks of 10 to avoid response too large
  const CHUNK_SIZE = 10
  for (let chunkIdx = 0; chunkIdx < batchItems.length; chunkIdx += CHUNK_SIZE) {
    const chunk = batchItems.slice(chunkIdx, chunkIdx + CHUNK_SIZE)
    const chunkNum = Math.floor(chunkIdx / CHUNK_SIZE) + 1
    const totalChunks = Math.ceil(batchItems.length / CHUNK_SIZE)

    console.log(`[ai-tips] Processing chunk ${chunkNum}/${totalChunks} (${chunk.length} items)`)

    const tryBatch = async (usePdf: boolean): Promise<void> => {
      const hasPdf = usePdf && !!pdfBase64
      const prompt = buildBatchPrompt(chunk, hasPdf)

      const content: Anthropic.MessageCreateParams["messages"][0]["content"] = hasPdf
        ? [
            { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdfBase64! } },
            { type: "text", text: prompt },
          ]
        : prompt

      const rawText = await callClaudeWithRetry(content)
      const text = rawText.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim()
      const parsed = JSON.parse(text) as Array<{
        itemId: string
        diagnosis: string
        howToFix: string
        practicalExample: string | null
      }>

      // Map responses to ponderation item IDs
      const itemIdToPonderationItemId = new Map(chunk.map((i) => [i.itemId, i.id]))

      for (const tip of parsed) {
        const ponderationItemId = itemIdToPonderationItemId.get(tip.itemId)
        if (ponderationItemId) {
          await db.insert(opcAiTips).values({
            ponderationItemId,
            diagnosis: tip.diagnosis,
            howToFix: tip.howToFix,
            practicalExample: tip.practicalExample ?? null,
            isFallback: false,
          })
        }
      }

      // Check for any items not in the response and save fallbacks
      const respondedIds = new Set(parsed.map((t) => t.itemId))
      for (const item of chunk) {
        if (!respondedIds.has(item.itemId)) {
          console.warn(`[ai-tips] No response for item ${item.itemId}, saving fallback`)
          await db.insert(opcAiTips).values({
            ponderationItemId: item.id,
            diagnosis: "Não foi possível gerar a dica automaticamente.",
            howToFix: "Consulte seu orientador para orientações sobre este item.",
            practicalExample: null,
            isFallback: true,
          })
        }
      }
    }

    try {
      await tryBatch(true)
      console.log(`[ai-tips] Chunk ${chunkNum}/${totalChunks} completed`)
    } catch (err) {
      if (pdfBase64) {
        console.warn(`[ai-tips] PDF batch failed for chunk ${chunkNum}, retrying without PDF:`, err instanceof Error ? err.message : err)
        try {
          await tryBatch(false)
          console.log(`[ai-tips] Chunk ${chunkNum}/${totalChunks} completed (text-only)`)
        } catch (retryErr) {
          console.error(`[ai-tips] Text-only batch also failed for chunk ${chunkNum}:`, retryErr instanceof Error ? retryErr.message : retryErr)
          // Save fallbacks for all items in failed chunk
          for (const item of chunk) {
            await db.insert(opcAiTips).values({
              ponderationItemId: item.id,
              diagnosis: "Não foi possível gerar a dica automaticamente.",
              howToFix: "Consulte seu orientador para orientações sobre este item.",
              practicalExample: null,
              isFallback: true,
            })
          }
        }
      } else {
        console.error(`[ai-tips] Batch failed for chunk ${chunkNum}:`, err instanceof Error ? err.message : err)
        for (const item of chunk) {
          await db.insert(opcAiTips).values({
            ponderationItemId: item.id,
            diagnosis: "Não foi possível gerar a dica automaticamente.",
            howToFix: "Consulte seu orientador para orientações sobre este item.",
            practicalExample: null,
            isFallback: true,
          })
        }
      }
    }

    // Delay between chunks to avoid rate limits
    if (chunkIdx + CHUNK_SIZE < batchItems.length) {
      console.log(`[ai-tips] Waiting 60s before next chunk...`)
      await sleep(60_000)
    }
  }

  console.log(`[ai-tips] Completed all items for ponderation ${ponderationId}`)
}
