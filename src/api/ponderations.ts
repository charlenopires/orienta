import { Hono } from "hono"
import { eq, desc, inArray } from "drizzle-orm"
import { db } from "../lib/db"
import {
  opcPonderations,
  opcPonderationItems,
  opcAiTips,
  opcStudents,
} from "../lib/db/opc-schema"
import { checklistSections } from "../lib/checklist-data"
import { generateAiTipsForPonderation } from "../lib/ai-tips"
import type { PonderationDetailSection } from "../lib/types"

const ponderations = new Hono()

// GET /api/ponderations — list all ponderations with student name
ponderations.get("/", async (c) => {
  const rows = await db
    .select({
      id: opcPonderations.id,
      studentName: opcStudents.name,
      scorePercent: opcPonderations.scorePercent,
      statusGeneral: opcPonderations.statusGeneral,
      createdAt: opcPonderations.createdAt,
    })
    .from(opcPonderations)
    .innerJoin(opcStudents, eq(opcPonderations.studentId, opcStudents.id))
    .orderBy(desc(opcPonderations.createdAt))
    .limit(100)

  return c.json({
    data: rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
  })
})

// GET /api/ponderations/:id — full detail with all items grouped by section + AI tips
ponderations.get("/:id", async (c) => {
  const id = c.req.param("id")

  const [ponderation] = await db
    .select({
      id: opcPonderations.id,
      studentId: opcPonderations.studentId,
      scorePercent: opcPonderations.scorePercent,
      statusGeneral: opcPonderations.statusGeneral,
      createdAt: opcPonderations.createdAt,
    })
    .from(opcPonderations)
    .where(eq(opcPonderations.id, id))

  if (!ponderation) {
    return c.json({ error: "Ponderação não encontrada" }, 404)
  }

  const [student] = await db
    .select({
      name: opcStudents.name,
      course: opcStudents.course,
      projectTopic: opcStudents.projectTopic,
    })
    .from(opcStudents)
    .where(eq(opcStudents.id, ponderation.studentId))

  // Get all ponderation items (only "Não" items are stored)
  const items = await db
    .select({
      id: opcPonderationItems.id,
      sectionId: opcPonderationItems.sectionId,
      itemId: opcPonderationItems.itemId,
      question: opcPonderationItems.question,
      answer: opcPonderationItems.answer,
      observation: opcPonderationItems.observation,
    })
    .from(opcPonderationItems)
    .where(eq(opcPonderationItems.ponderationId, id))

  // Get AI tips for all items
  const tipsByItemId: Record<string, { id: string; diagnosis: string; howToFix: string; practicalExample: string | null; isFallback: boolean }> = {}

  for (const item of items) {
    const [tip] = await db
      .select()
      .from(opcAiTips)
      .where(eq(opcAiTips.ponderationItemId, item.id))
    if (tip) {
      tipsByItemId[item.id] = {
        id: tip.id,
        diagnosis: tip.diagnosis,
        howToFix: tip.howToFix,
        practicalExample: tip.practicalExample,
        isFallback: tip.isFallback,
      }
    }
  }

  // Build section-grouped response with ALL 54 items
  const naoItemsMap = new Map(items.map((i) => [`${i.sectionId}:${i.itemId}`, i]))

  const sections: PonderationDetailSection[] = checklistSections.map((section) => ({
    sectionId: section.id,
    sectionTitle: section.title,
    items: section.items.map((item) => {
      const naoItem = naoItemsMap.get(`${section.id}:${item.id}`)
      if (naoItem) {
        return {
          id: naoItem.id,
          sectionId: section.id,
          itemId: item.id,
          question: item.question,
          answer: false,
          observation: naoItem.observation,
          aiTip: tipsByItemId[naoItem.id] ?? null,
        }
      }
      // Item was "Sim" (not stored in ponderation_items)
      return {
        id: `sim-${section.id}-${item.id}`,
        sectionId: section.id,
        itemId: item.id,
        question: item.question,
        answer: true,
        observation: null,
        aiTip: null,
      }
    }),
  }))

  return c.json({
    id: ponderation.id,
    studentName: student?.name ?? "Aluno desconhecido",
    studentCourse: student?.course ?? "",
    studentProjectTopic: student?.projectTopic ?? "",
    scorePercent: ponderation.scorePercent,
    statusGeneral: ponderation.statusGeneral,
    createdAt: ponderation.createdAt.toISOString(),
    sections,
  })
})

// POST /api/ponderations/:id/regenerate-tips — generate tips for items that don't have them yet
ponderations.post("/:id/regenerate-tips", async (c) => {
  const id = c.req.param("id")

  const [ponderation] = await db
    .select({ id: opcPonderations.id })
    .from(opcPonderations)
    .where(eq(opcPonderations.id, id))

  if (!ponderation) {
    return c.json({ error: "Ponderação não encontrada" }, 404)
  }

  // Fire-and-forget — the function itself skips items that already have tips
  generateAiTipsForPonderation(id).catch((err) => {
    console.error("[ai-tips] Regeneration failed:", err)
  })

  return c.json({ message: "Geração de dicas pendentes iniciada" })
})

export { ponderations }
