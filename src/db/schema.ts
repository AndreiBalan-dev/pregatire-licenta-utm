import { pgTable, timestamp, jsonb, integer, varchar, index } from "drizzle-orm/pg-core";

export const savedSessions = pgTable(
  "saved_sessions",
  {
    key: varchar("key", { length: 16 }).primaryKey(),
    displayName: varchar("display_name", { length: 50 }),
    sessionData: jsonb("session_data").notNull(),
    totalAnswered: integer("total_answered").notNull().default(0),
    totalCorrect: integer("total_correct").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    ipHash: varchar("ip_hash", { length: 64 }).notNull(),
  },
  (table) => [
    index("idx_saved_sessions_ip_hash").on(table.ipHash),
  ]
);
