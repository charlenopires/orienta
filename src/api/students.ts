import { Hono } from "hono"
import { eq, ilike, or, asc, desc, sql, count } from "drizzle-orm"
import { db } from "../lib/db"
import { opcStudents } from "../lib/db/opc-schema"

const students = new Hono()

// GET /api/students — list with pagination, search, sort
students.get("/", async (c) => {
  const search = c.req.query("search") ?? ""
  const sort = c.req.query("sort") ?? "created_at"
  const order = c.req.query("order") ?? "desc"
  const page = Math.max(1, Number(c.req.query("page") ?? "1"))
  const limit = Math.min(100, Math.max(1, Number(c.req.query("limit") ?? "20")))
  const offset = (page - 1) * limit

  const where = search
    ? or(
        ilike(opcStudents.name, `%${search}%`),
        ilike(opcStudents.course, `%${search}%`),
      )
    : undefined

  const sortColumn = sort === "name" ? opcStudents.name : opcStudents.createdAt
  const orderFn = order === "asc" ? asc : desc

  const [rows, totalResult] = await Promise.all([
    db
      .select()
      .from(opcStudents)
      .where(where)
      .orderBy(orderFn(sortColumn))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(opcStudents)
      .where(where),
  ])

  const total = totalResult[0]?.total ?? 0

  return c.json({
    data: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
})

// POST /api/students — create
students.post("/", async (c) => {
  const body = await c.req.json<{
    name?: string
    email?: string
    course?: string
    projectTopic?: string
    period?: string
    phone?: string
    notes?: string
  }>()

  if (!body.name || !body.email || !body.course || !body.projectTopic || !body.period) {
    return c.json({ error: "Campos obrigatórios: nome, email, curso, tema, período" }, 400)
  }

  const [student] = await db
    .insert(opcStudents)
    .values({
      name: body.name,
      email: body.email,
      course: body.course,
      projectTopic: body.projectTopic,
      period: body.period,
      phone: body.phone ?? null,
      notes: body.notes ?? null,
    })
    .returning()

  return c.json(student, 201)
})

// PUT /api/students/:id — update
students.put("/:id", async (c) => {
  const id = c.req.param("id")
  const body = await c.req.json<{
    name?: string
    email?: string
    course?: string
    projectTopic?: string
    period?: string
    phone?: string
    notes?: string
    status?: "active" | "in_review" | "approved" | "inactive"
  }>()

  const [updated] = await db
    .update(opcStudents)
    .set({
      ...(body.name !== undefined && { name: body.name }),
      ...(body.email !== undefined && { email: body.email }),
      ...(body.course !== undefined && { course: body.course }),
      ...(body.projectTopic !== undefined && { projectTopic: body.projectTopic }),
      ...(body.period !== undefined && { period: body.period }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.status !== undefined && { status: body.status }),
    })
    .where(eq(opcStudents.id, id))
    .returning()

  if (!updated) {
    return c.json({ error: "Aluno não encontrado" }, 404)
  }

  return c.json(updated)
})

// DELETE /api/students/:id — delete (cascade via FK)
students.delete("/:id", async (c) => {
  const id = c.req.param("id")

  const [deleted] = await db
    .delete(opcStudents)
    .where(eq(opcStudents.id, id))
    .returning({ id: opcStudents.id })

  if (!deleted) {
    return c.json({ error: "Aluno não encontrado" }, 404)
  }

  return c.json({ ok: true })
})

export { students }
