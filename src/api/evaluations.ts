import { Hono } from "hono"
import { eq, desc } from "drizzle-orm"
import { db } from "../lib/db"
import {
  opcEvaluations,
  opcPonderations,
  opcPonderationItems,
  opcStudents,
} from "../lib/db/opc-schema"
import { checklistSections, TOTAL_ITEMS } from "../lib/checklist-data"

interface EvaluationItemPayload {
  sectionId: string
  itemId: string
  answer: boolean | null
  observation?: string | null
}

interface EvaluationPayload {
  studentId: string
  items: EvaluationItemPayload[]
}

const evaluations = new Hono()

// GET /api/evaluations — list evaluations (optionally by student)
evaluations.get("/", async (c) => {
  const studentId = c.req.query("studentId")

  const where = studentId ? eq(opcEvaluations.studentId, studentId) : undefined

  const rows = await db
    .select()
    .from(opcEvaluations)
    .where(where)
    .orderBy(desc(opcEvaluations.createdAt))
    .limit(50)

  return c.json({ data: rows })
})

// GET /api/evaluations/:id — get single evaluation with its data
evaluations.get("/:id", async (c) => {
  const id = c.req.param("id")

  const [evaluation] = await db
    .select()
    .from(opcEvaluations)
    .where(eq(opcEvaluations.id, id))

  if (!evaluation) {
    return c.json({ error: "Avaliação não encontrada" }, 404)
  }

  return c.json(evaluation)
})

// POST /api/evaluations — save draft
evaluations.post("/", async (c) => {
  const body = await c.req.json<EvaluationPayload>()

  if (!body.studentId) {
    return c.json({ error: "studentId é obrigatório" }, 400)
  }

  // Verify student exists
  const [student] = await db
    .select({ id: opcStudents.id })
    .from(opcStudents)
    .where(eq(opcStudents.id, body.studentId))

  if (!student) {
    return c.json({ error: "Aluno não encontrado" }, 404)
  }

  const [evaluation] = await db
    .insert(opcEvaluations)
    .values({
      studentId: body.studentId,
      status: "draft",
      data: body.items ?? [],
    })
    .returning()

  return c.json(evaluation, 201)
})

// PUT /api/evaluations/:id — update draft
evaluations.put("/:id", async (c) => {
  const id = c.req.param("id")
  const body = await c.req.json<{ items?: EvaluationItemPayload[] }>()

  const [existing] = await db
    .select()
    .from(opcEvaluations)
    .where(eq(opcEvaluations.id, id))

  if (!existing) {
    return c.json({ error: "Avaliação não encontrada" }, 404)
  }

  if (existing.status === "finalized") {
    return c.json({ error: "Avaliação já finalizada, não pode ser editada" }, 400)
  }

  const [updated] = await db
    .update(opcEvaluations)
    .set({ data: body.items ?? [] })
    .where(eq(opcEvaluations.id, id))
    .returning()

  return c.json(updated)
})

// POST /api/evaluations/:id/finalize — finalize evaluation and create ponderation
evaluations.post("/:id/finalize", async (c) => {
  const id = c.req.param("id")

  const [evaluation] = await db
    .select()
    .from(opcEvaluations)
    .where(eq(opcEvaluations.id, id))

  if (!evaluation) {
    return c.json({ error: "Avaliação não encontrada" }, 404)
  }

  if (evaluation.status === "finalized") {
    return c.json({ error: "Avaliação já finalizada" }, 400)
  }

  const items = (evaluation.data as EvaluationItemPayload[]) ?? []

  // Validate: all 54 items must be answered
  const answeredItems = items.filter((i) => i.answer !== null && i.answer !== undefined)
  if (answeredItems.length < TOTAL_ITEMS) {
    return c.json(
      {
        error: `Todos os ${TOTAL_ITEMS} itens devem ser respondidos. Respondidos: ${answeredItems.length}`,
      },
      400,
    )
  }

  // Validate: all "Não" items must have observation
  const missingObservations = items.filter(
    (i) => i.answer === false && (!i.observation || i.observation.trim() === ""),
  )
  if (missingObservations.length > 0) {
    const sectionIds = [...new Set(missingObservations.map((i) => i.sectionId))]
    const sectionNames = sectionIds
      .map((sid) => checklistSections.find((s) => s.id === sid)?.title ?? sid)
      .join(", ")
    return c.json(
      {
        error: `Itens marcados como Não devem ter observação. Pendências em: ${sectionNames}`,
        missingSections: sectionIds,
      },
      400,
    )
  }

  // Calculate score
  const positivos = items.filter((i) => i.answer === true).length
  const negativos = items.filter((i) => i.answer === false).length
  const scorePercent = Math.round((positivos / TOTAL_ITEMS) * 100)

  // Determine general status
  let statusGeneral: "bom" | "atencao" | "critico"
  if (scorePercent >= 70) {
    statusGeneral = "bom"
  } else if (scorePercent >= 40) {
    statusGeneral = "atencao"
  } else {
    statusGeneral = "critico"
  }

  // Create ponderation + items in a logical sequence
  const [ponderation] = await db
    .insert(opcPonderations)
    .values({
      studentId: evaluation.studentId,
      scorePercent,
      statusGeneral,
    })
    .returning()

  // Build ponderation items from the "Não" answers
  const ponderationItemsData = items
    .filter((i) => i.answer === false)
    .map((i) => {
      const section = checklistSections.find((s) => s.id === i.sectionId)
      const item = section?.items.find((it) => it.id === i.itemId)
      return {
        ponderationId: ponderation.id,
        sectionId: i.sectionId,
        itemId: i.itemId,
        question: item?.question ?? i.itemId,
        answer: false as const,
        observation: i.observation ?? null,
      }
    })

  if (ponderationItemsData.length > 0) {
    await db.insert(opcPonderationItems).values(ponderationItemsData)
  }

  // Mark evaluation as finalized
  await db
    .update(opcEvaluations)
    .set({ status: "finalized" })
    .where(eq(opcEvaluations.id, id))

  // Update student status to in_review
  await db
    .update(opcStudents)
    .set({ status: "in_review" })
    .where(eq(opcStudents.id, evaluation.studentId))

  return c.json({
    ponderation: {
      id: ponderation.id,
      scorePercent,
      statusGeneral,
      positivos,
      negativos,
    },
  })
})

export { evaluations }
