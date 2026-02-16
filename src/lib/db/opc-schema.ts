import { pgTable, pgEnum, text, boolean, integer, jsonb, timestamp, uuid } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"

// ── Enums (prefixed to avoid conflicts with profcharleno) ──

export const opcStudentStatus = pgEnum("opc_student_status", [
  "active",
  "in_review",
  "approved",
  "inactive",
])

export const opcEvaluationStatus = pgEnum("opc_evaluation_status", [
  "draft",
  "finalized",
])

export const opcPonderationStatus = pgEnum("opc_ponderation_status", [
  "bom",
  "atencao",
  "critico",
])

// ── Tables ──

export const opcStudents = pgTable("opc_students", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name").notNull(),
  email: text("email").notNull(),
  course: text("course").notNull(),
  projectTopic: text("project_topic").notNull(),
  period: text("period").notNull(),
  phone: text("phone"),
  notes: text("notes"),
  publicToken: uuid("public_token").defaultRandom().unique().notNull(),
  status: opcStudentStatus("status").default("active").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
})

export const opcEvaluations = pgTable("opc_evaluations", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  studentId: text("student_id").notNull().references(() => opcStudents.id, { onDelete: "cascade" }),
  status: opcEvaluationStatus("status").default("draft").notNull(),
  data: jsonb("data"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
})

export const opcPonderations = pgTable("opc_ponderations", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  studentId: text("student_id").notNull().references(() => opcStudents.id, { onDelete: "cascade" }),
  scorePercent: integer("score_percent").notNull(),
  statusGeneral: opcPonderationStatus("status_general").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

export const opcPonderationItems = pgTable("opc_ponderation_items", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  ponderationId: text("ponderation_id").notNull().references(() => opcPonderations.id, { onDelete: "cascade" }),
  sectionId: text("section_id").notNull(),
  itemId: text("item_id").notNull(),
  question: text("question").notNull(),
  answer: boolean("answer").notNull(),
  observation: text("observation"),
})

export const opcAiTips = pgTable("opc_ai_tips", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  ponderationItemId: text("ponderation_item_id").notNull().references(() => opcPonderationItems.id, { onDelete: "cascade" }),
  diagnosis: text("diagnosis").notNull(),
  howToFix: text("how_to_fix").notNull(),
  practicalExample: text("practical_example"),
  generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow().notNull(),
  isFallback: boolean("is_fallback").default(false).notNull(),
})

// ── Relations ──

export const opcStudentsRelations = relations(opcStudents, ({ many }) => ({
  evaluations: many(opcEvaluations),
  ponderations: many(opcPonderations),
}))

export const opcEvaluationsRelations = relations(opcEvaluations, ({ one }) => ({
  student: one(opcStudents, { fields: [opcEvaluations.studentId], references: [opcStudents.id] }),
}))

export const opcPonderationsRelations = relations(opcPonderations, ({ one, many }) => ({
  student: one(opcStudents, { fields: [opcPonderations.studentId], references: [opcStudents.id] }),
  items: many(opcPonderationItems),
}))

export const opcPonderationItemsRelations = relations(opcPonderationItems, ({ one, many }) => ({
  ponderation: one(opcPonderations, { fields: [opcPonderationItems.ponderationId], references: [opcPonderations.id] }),
  aiTips: many(opcAiTips),
}))

export const opcAiTipsRelations = relations(opcAiTips, ({ one }) => ({
  ponderationItem: one(opcPonderationItems, { fields: [opcAiTips.ponderationItemId], references: [opcPonderationItems.id] }),
}))
