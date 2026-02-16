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

app.use("/*", serveStatic({ root: "./dist" }))
app.get("/*", serveStatic({ path: "./dist/index.html" }))

export default {
  port: 3000,
  fetch: app.fetch,
}
