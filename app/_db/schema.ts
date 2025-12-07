import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

// export const documentTypeEnum = pgEnum("document_type", [
//   "zawiadomienie_o_wypadku",
//   "zapis_wyjasnien_poszkodowanego",
//   "zapis_informacji_od_swiadka",
//   "proof_of_business",
//   "authorization",
//   "medical_records",
//   "traffic_police_note",
//   "prosecutor_decision",
//   "power_of_attorney",
//   "death_certificate",
//   "birth_marriage_certificate",
//   "other",
// ]);

export const documentStatusEnum = pgEnum("document_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const cases = pgTable("cases", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  status: documentStatusEnum("status").default("pending"),
  fileUrl: text("file_url").notNull(),
  fileKey: text("file_key").notNull(),
  extractedText: text("extracted_text"),
  caseId: text("case_id")
    .notNull()
    .references(() => cases.id, { onDelete: "cascade" }),
  type: text("type"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const caseAnalysis = pgTable("case_analysis", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  caseId: text("case_id")
    .notNull()
    .references(() => cases.id, { onDelete: "cascade" }),
  similarCases: text("similar_cases").notNull(),
  analysis: text("analysis").notNull(),
  duplicateFlags: text("duplicate_flags"),
  suggestedOutcomes: text("suggested_outcomes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const casesRelations = relations(cases, ({ many }) => ({
  documents: many(documents),
  analysis: many(caseAnalysis),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  case: one(cases, { fields: [documents.caseId], references: [cases.id] }),
}));

export const caseAnalysisRelations = relations(caseAnalysis, ({ one }) => ({
  case: one(cases, { fields: [caseAnalysis.caseId], references: [cases.id] }),
}));
