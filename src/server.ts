import { Hono } from "hono"
import { cors } from "hono/cors"
import { getCookie, setCookie, deleteCookie } from "hono/cookie"
import { serveStatic } from "hono/bun"
import { createToken, verifyToken } from "./lib/jwt"
import type { JwtPayload } from "./lib/jwt"
import { ORIENTADOR } from "./lib/auth-config"
import bcrypt from "bcryptjs"
import { students } from "./api/students"
import { evaluations } from "./api/evaluations"
import { ponderations } from "./api/ponderations"
import { db } from "./lib/db"
import { opcStudents, opcEvaluations, opcPonderations, opcPonderationItems, opcAiTips } from "./lib/db/opc-schema"
import { count, eq, sql, gte, avg, desc } from "drizzle-orm"
import { checklistSections } from "./lib/checklist-data"
import type { PonderationDetailSection } from "./lib/types"

type Env = {
  Variables: {
    user: { id: string; name: string; email: string }
  }
}

const app = new Hono<Env>()

// ── CORS ──

app.use(
  "/api/*",
  cors({
    origin: process.env.NODE_ENV === "production"
      ? (process.env.APP_URL ?? "")
      : "http://localhost:5173",
    credentials: true,
  }),
)

// ── Auth middleware for protected routes ──

async function authMiddleware(c: Parameters<Parameters<typeof app.use>[1]>[0], next: () => Promise<void>) {
  // Dev stub mode
  if (process.env.AUTH_STUB === "true") {
    c.set("user", { id: "1", name: "Prof. Charleno", email: "charleno@gmail.com" })
    return next()
  }

  const token = getCookie(c, "auth_token")
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  try {
    const payload: JwtPayload = await verifyToken(token)
    c.set("user", { id: payload.sub, name: payload.name, email: payload.email })
    return next()
  } catch {
    return c.json({ error: "Unauthorized" }, 401)
  }
}

// ── Health check ──

app.get("/api/health", (c) => c.json({ ok: true }))

// ── Public auth routes ──

app.get("/api/auth/me", async (c) => {
  // Dev stub mode
  if (process.env.AUTH_STUB === "true") {
    return c.json({ id: "1", name: "Prof. Charleno", email: "charleno@gmail.com" })
  }

  const token = getCookie(c, "auth_token")
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  try {
    const payload = await verifyToken(token)
    return c.json({ id: payload.sub, name: payload.name, email: payload.email })
  } catch (err) {
    console.error("[auth/me] JWT verify failed:", err)
    return c.json({ error: "Unauthorized" }, 401)
  }
})

app.post("/api/auth/login", async (c) => {
  const body = await c.req.json<{ email?: string; password?: string }>()

  if (!body.email || !body.password) {
    return c.json({ error: "Email e senha são obrigatórios" }, 400)
  }

  if (body.email !== ORIENTADOR.email) {
    return c.json({ error: "Credenciais inválidas" }, 401)
  }

  const valid = await bcrypt.compare(body.password, ORIENTADOR.passwordHash)
  if (!valid) {
    return c.json({ error: "Credenciais inválidas" }, 401)
  }

  const token = await createToken({
    id: ORIENTADOR.id,
    name: ORIENTADOR.name,
    email: ORIENTADOR.email,
  })

  setCookie(c, "auth_token", token, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: 60 * 60 * 24, // 24h
  })

  return c.json({
    id: ORIENTADOR.id,
    name: ORIENTADOR.name,
    email: ORIENTADOR.email,
  })
})

app.post("/api/auth/logout", (c) => {
  deleteCookie(c, "auth_token", { path: "/" })
  return c.json({ ok: true })
})

// ── Protected API routes ──

app.use("/api/dashboard/*", authMiddleware)
app.use("/api/students/*", authMiddleware)
app.use("/api/evaluations/*", authMiddleware)
app.use("/api/ponderations/*", authMiddleware)

app.route("/api/students", students)
app.route("/api/evaluations", evaluations)
app.route("/api/ponderations", ponderations)

app.get("/api/dashboard/stats", async (c) => {
  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [totalAlunosResult, avaliacoesResult, ponderacoesMesResult, recentPonderacoes] = await Promise.all([
    db.select({ total: count() }).from(opcStudents),
    db.select({ total: count() }).from(opcEvaluations),
    db.select({ total: count() }).from(opcPonderations).where(gte(opcPonderations.createdAt, firstOfMonth)),
    db
      .select({
        id: opcPonderations.id,
        alunoNome: opcStudents.name,
        data: opcPonderations.createdAt,
        scorePercent: opcPonderations.scorePercent,
      })
      .from(opcPonderations)
      .innerJoin(opcStudents, eq(opcPonderations.studentId, opcStudents.id))
      .orderBy(desc(opcPonderations.createdAt))
      .limit(5),
  ])

  // For each recent ponderation, count positive/negative items
  const ultimasPonderacoes = await Promise.all(
    recentPonderacoes.map(async (p) => {
      const items = await db
        .select({ answer: opcPonderationItems.answer })
        .from(opcPonderationItems)
        .where(eq(opcPonderationItems.ponderationId, p.id))

      const positivos = items.filter((i) => i.answer).length
      const negativos = items.filter((i) => !i.answer).length

      return {
        id: p.id,
        alunoNome: p.alunoNome,
        data: p.data.toISOString(),
        positivos,
        negativos,
      }
    }),
  )

  // Average conformidade from all ponderations
  const avgResult = await db
    .select({ avg: avg(opcPonderations.scorePercent) })
    .from(opcPonderations)

  return c.json({
    totalAlunos: totalAlunosResult[0]?.total ?? 0,
    avaliacoesRealizadas: avaliacoesResult[0]?.total ?? 0,
    ponderacoesMes: ponderacoesMesResult[0]?.total ?? 0,
    mediaConformidade: Math.round(Number(avgResult[0]?.avg ?? 0)),
    ultimasPonderacoes,
  })
})

// ── Public API routes ──

// Public ponderation detail (no auth required)
app.get("/api/public/ponderations/:id", async (c) => {
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

  const tipsByItemId: Record<string, { id: string; diagnosis: string; howToFix: string; practicalExample: string | null; isFallback: boolean }> = {}
  for (const item of items) {
    const [tip] = await db.select().from(opcAiTips).where(eq(opcAiTips.ponderationItemId, item.id))
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

// Student portal (by token)
app.get("/api/portal/:token", async (c) => {
  const token = c.req.param("token")

  const [student] = await db
    .select({
      id: opcStudents.id,
      name: opcStudents.name,
      course: opcStudents.course,
      projectTopic: opcStudents.projectTopic,
    })
    .from(opcStudents)
    .where(eq(opcStudents.publicToken, token))

  if (!student) {
    return c.json({ error: "Aluno não encontrado" }, 404)
  }

  const ponderationRows = await db
    .select({
      id: opcPonderations.id,
      scorePercent: opcPonderations.scorePercent,
      statusGeneral: opcPonderations.statusGeneral,
      createdAt: opcPonderations.createdAt,
    })
    .from(opcPonderations)
    .where(eq(opcPonderations.studentId, student.id))
    .orderBy(desc(opcPonderations.createdAt))

  const ponderationsResult = await Promise.all(
    ponderationRows.map(async (p) => {
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
        .where(eq(opcPonderationItems.ponderationId, p.id))

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

      return {
        id: p.id,
        scorePercent: p.scorePercent,
        statusGeneral: p.statusGeneral,
        createdAt: p.createdAt.toISOString(),
        sections,
      }
    }),
  )

  return c.json({
    student: {
      name: student.name,
      course: student.course,
      projectTopic: student.projectTopic,
    },
    ponderations: ponderationsResult,
  })
})

// ── SPA static serving ──

app.use("/*", serveStatic({ root: "./dist" }))
app.get("/*", serveStatic({ path: "./dist/index.html" }))

export default {
  port: Number(process.env.PORT ?? 3000),
  fetch: app.fetch,
}
