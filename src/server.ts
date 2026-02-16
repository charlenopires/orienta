import { Hono } from "hono"
import { cors } from "hono/cors"
import { serveStatic } from "hono/bun"

const app = new Hono()

app.use(
  "/api/*",
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
)

app.get("/api/auth/me", (c) => {
  const authStub = process.env.AUTH_STUB === "true"
  if (!authStub) {
    return c.json({ error: "Unauthorized" }, 401)
  }
  return c.json({
    id: "1",
    name: "Prof. Charleno",
    email: "charleno@gmail.com",
  })
})

app.post("/api/auth/login", (c) => {
  return c.json({ error: "Not implemented" }, 501)
})

app.post("/api/auth/logout", (c) => {
  return c.json({ ok: true })
})

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

app.use("/*", serveStatic({ root: "./dist" }))
app.get("/*", serveStatic({ path: "./dist/index.html" }))

export default {
  port: 3000,
  fetch: app.fetch,
}
