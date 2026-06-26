import { pgTable, timestamp, jsonb, integer, varchar, index, boolean, numeric, uniqueIndex, serial } from "drizzle-orm/pg-core";

export const savedSessions = pgTable(
  "saved_sessions",
  {
    key: varchar("key", { length: 24 }).primaryKey(),
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

export const challengeLobbies = pgTable(
  "challenge_lobbies",
  {
    code: varchar("code", { length: 24 }).primaryKey(),
    hostTokenHash: varchar("host_token_hash", { length: 64 }).notNull(),
    mode: varchar("mode", { length: 16 }).notNull(), // "self_paced" | "lockstep"
    status: varchar("status", { length: 16 }).notNull().default("lobby"),
    config: jsonb("config").notNull(),
    questionIds: jsonb("question_ids"),
    currentIndex: integer("current_index").notNull().default(0),
    questionStartedAt: timestamp("question_started_at", { withTimezone: true }),
    ipHash: varchar("ip_hash", { length: 64 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
  },
  (table) => [index("idx_challenge_lobbies_ip_hash").on(table.ipHash)],
);

export const challengePlayers = pgTable(
  "challenge_players",
  {
    id: serial("id").primaryKey(),
    lobbyCode: varchar("lobby_code", { length: 24 }).notNull(),
    playerTokenHash: varchar("player_token_hash", { length: 64 }).notNull(),
    name: varchar("name", { length: 20 }).notNull(),
    isHost: boolean("is_host").notNull().default(false),
    score: numeric("score").notNull().default("0"),
    correctCount: integer("correct_count").notNull().default(0),
    answeredCount: integer("answered_count").notNull().default(0),
    totalTimeMs: integer("total_time_ms").notNull().default(0),
    questionOrder: jsonb("question_order"),
    optionOrder: jsonb("option_order"),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).defaultNow().notNull(),
    status: varchar("status", { length: 16 }).notNull().default("active"),
  },
  (table) => [
    index("idx_challenge_players_lobby").on(table.lobbyCode),
    index("idx_challenge_players_token").on(table.playerTokenHash),
    uniqueIndex("uq_challenge_player_name").on(table.lobbyCode, table.name),
  ],
);

export const challengeAnswers = pgTable(
  "challenge_answers",
  {
    id: serial("id").primaryKey(),
    lobbyCode: varchar("lobby_code", { length: 24 }).notNull(),
    playerId: integer("player_id").notNull(),
    questionId: integer("question_id").notNull(),
    selected: varchar("selected", { length: 1 }).notNull(),
    isCorrect: boolean("is_correct").notNull(),
    timeMs: integer("time_ms").notNull().default(0),
    pointsAwarded: numeric("points_awarded").notNull().default("0"),
    answeredAt: timestamp("answered_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_challenge_answers_player").on(table.playerId),
    uniqueIndex("uq_challenge_answer").on(table.playerId, table.questionId),
  ],
);
