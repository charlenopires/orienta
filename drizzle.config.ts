import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/lib/db/opc-schema.ts",
  out: "./drizzle/opc-migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
