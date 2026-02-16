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
  } catch {
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

app.get("/api/dashboard/stats", (c) => {
  return c.json({
    totalAlunos: 12,
    avaliacoesRealizadas: 34,
    ponderacoesMes: 8,
    mediaConformidade: 72,
    ultimasPonderacoes: [
      {
        id: "1",
        alunoNome: "Maria Silva",
        data: "2026-02-14T10:30:00Z",
        positivos: 38,
        negativos: 16,
      },
      {
        id: "2",
        alunoNome: "João Santos",
        data: "2026-02-13T14:15:00Z",
        positivos: 42,
        negativos: 12,
      },
      {
        id: "3",
        alunoNome: "Ana Costa",
        data: "2026-02-12T09:00:00Z",
        positivos: 30,
        negativos: 24,
      },
      {
        id: "4",
        alunoNome: "Pedro Oliveira",
        data: "2026-02-10T16:45:00Z",
        positivos: 45,
        negativos: 9,
      },
      {
        id: "5",
        alunoNome: "Carla Mendes",
        data: "2026-02-08T11:20:00Z",
        positivos: 35,
        negativos: 19,
      },
    ],
  })
})

// ── Public API routes (student portal) ──

app.get("/api/portal/:token", (c) => {
  // Will be implemented in portal task
  return c.json({ error: "Not implemented" }, 501)
})

// ── SPA static serving ──

app.use("/*", serveStatic({ root: "./dist" }))
app.get("/*", serveStatic({ path: "./dist/index.html" }))

export default {
  port: Number(process.env.PORT ?? 3000),
  fetch: app.fetch,
}
