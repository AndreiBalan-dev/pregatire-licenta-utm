# Challenge Mode Phase 1 (Self-Paced) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a working multiplayer self-paced challenge: a host creates a lobby from the question bank, friends join by link with just a name, everyone races through the same questions, and a live leaderboard plus milestone toasts update in real time.

**Architecture:** A new `/provocare` feature. State is server-authoritative in Neon (3 new tables); Pusher Channels carries presence (the live roster) and "something changed" pushes. Question text stays client-side (already bundled in `src/data`), so the realtime layer and DB only move question IDs, answer letters, scores, and small events. All non-trivial logic lives in pure, unit-tested modules under `src/lib/challenge/`; routes and components stay thin.

**Tech Stack:** Next.js 16 (App Router, route handlers), React 19, Drizzle ORM + Neon serverless Postgres, Pusher Channels (`pusher` server SDK + `pusher-js` client), Tailwind 4. Tests are plain `.test.mjs` files run with `node --import ./scripts/register-alias.mjs`.

## Global Constraints

- **No em dashes / en dashes in any copy or comments.** Use commas, parentheses, or " - " (hyphen). (User rule.)
- **User-facing strings are Romanian with diacritics** (match existing UI, for example "Întrebări", "Răspuns corect"). The spec/plan prose is English.
- **`npm run build` requires `DATABASE_URL`.** Locally, pass a dummy Neon URL to verify a build (tests and lint do not need it).
- **Reuse before building:** `QuestionCard`, `buildOptionOrders`, `orderedOptionKeys`, `shuffleArray`, `generateSaveKey`, `checkRateLimit`/`RATE_LIMITS`, `useToast`, and the bundled question index (`allQuestions`, `questionsBySubject`, `getQuestion`).
- **No redo:** once an answer is committed it is final, enforced by a DB `unique(playerId, questionId)` constraint, not only in UI.
- **No accounts:** identity is a name plus a crypto-random token stored in `localStorage`; tokens are persisted only as HMAC-SHA256 hashes.
- **Capacity:** host-set 2 to 10 players, hard max 10. **Question count:** max 50. **Name length:** max 20 chars.
- **Pusher channel naming:** `presence-lobby-{code}`. **Provider behind a thin adapter** so it stays swappable.

---

## File Structure

**New pure logic (unit-tested):**
- `src/lib/challenge/types.ts` - shared TS types (no runtime).
- `src/lib/challenge/select.ts` - pick the question set + per-player orders.
- `src/lib/challenge/scoring.ts` - score + rank players into standings.
- `src/lib/challenge/milestones.ts` - detect milestone events from a state delta.
- `src/lib/challenge/validation.ts` - validate create-config, names, answer payloads.
- `src/lib/challenge/identity.ts` - client localStorage token store (pure, DOM-injected).

**New realtime adapter:**
- `src/lib/realtime/events.ts` - channel name + event name constants and payload types.
- `src/lib/realtime/pusher-server.ts` - server publish + presence auth (server-only).
- `src/lib/realtime/pusher-client.ts` - client Pusher factory (browser-only).

**Crypto + constants additions:**
- `src/lib/crypto.ts` - add `generateToken`, `hashToken`.
- `src/lib/constants.ts` - add challenge limits + rate limits.

**DB:**
- `src/db/schema.ts` - add `challengeLobbies`, `challengePlayers`, `challengeAnswers`.

**API routes:**
- `src/app/api/challenge/create/route.ts`
- `src/app/api/challenge/join/route.ts`
- `src/app/api/challenge/start/route.ts`
- `src/app/api/challenge/answer/route.ts`
- `src/app/api/challenge/state/route.ts`
- `src/app/api/challenge/pusher/auth/route.ts`
- `src/lib/challenge/server.ts` - shared server helpers (load lobby+player by token, build standings, lazy-expiry).

**Client hooks + UI:**
- `src/hooks/useChallengeChannel.ts` - subscribe to presence + events.
- `src/app/provocare/page.tsx` - landing + create form (host config).
- `src/app/provocare/layout.tsx` - metadata.
- `src/app/provocare/[code]/page.tsx` - lobby route shell (join popup, waiting room, runtime, results switch by status).
- `src/components/challenge/JoinDialog.tsx`
- `src/components/challenge/WaitingRoom.tsx`
- `src/components/challenge/SelfPacedRuntime.tsx`
- `src/components/challenge/Leaderboard.tsx`
- `src/components/challenge/ResultsScreen.tsx`

---

## Task 1: Dependencies, environment, and Pusher adapter scaffolding

**Files:**
- Modify: `package.json` (add `pusher`, `pusher-js`)
- Create: `src/lib/realtime/events.ts`
- Create: `src/lib/realtime/pusher-server.ts`
- Create: `src/lib/realtime/pusher-client.ts`
- Modify: `.env.example` (create if absent) and `.env.local` (developer fills real keys)

**Interfaces:**
- Produces: `CHANNELS.lobby(code) -> string`, `EVENTS` constants, `Standing`, `MilestoneEvent`, `RoundStartedPayload` types; `publishToLobby(code, event, payload)`; `authorizeLobbyChannel(socketId, channel, playerId, name)`; `createPusherClient(token, code)`.

- [ ] **Step 1: Install the Pusher SDKs**

Run: `npm install pusher pusher-js`
Expected: both added to `package.json` dependencies, install succeeds.

- [ ] **Step 2: Add environment variable template**

Create `.env.example`:

```bash
# Existing
DATABASE_URL=
IP_HASH_SALT=

# Pusher Channels (server-only secrets)
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=eu

# Pusher (exposed to the browser)
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=eu
```

Add the same keys with real values from a free Pusher Channels app to `.env.local`. (`PUSHER_KEY` and `NEXT_PUBLIC_PUSHER_KEY` hold the same value; one is read server-side, one client-side.)

- [ ] **Step 3: Define channel + event contracts**

Create `src/lib/realtime/events.ts`:

```ts
// Channel + event names and payload shapes shared by the server publishers and
// the client subscriber. Kept provider-agnostic so the Pusher adapter is the
// only file that knows about Pusher.

export const CHANNELS = {
  lobby: (code: string) => `presence-lobby-${code}`,
};

export const EVENTS = {
  ROUND_STARTED: "round-started",
  LEADERBOARD: "leaderboard",
  MILESTONE: "milestone",
  ROUND_FINISHED: "round-finished",
} as const;

export interface Standing {
  playerId: number;
  name: string;
  score: number;
  correctCount: number;
  answeredCount: number;
  totalQuestions: number;
  progress: number; // 0..1
  finished: boolean;
  rank: number; // 1-based, ties share a rank
}

export type MilestoneType = "progress" | "finished" | "first_finish" | "lead_change";

export interface MilestoneEvent {
  type: MilestoneType;
  text: string; // Romanian, ready to toast
  playerId: number;
  value?: number; // e.g. 25/50/75/100 for progress
}

export interface RoundStartedPayload {
  totalQuestions: number;
}

export interface LeaderboardPayload {
  standings: Standing[];
}

export interface RoundFinishedPayload {
  standings: Standing[];
}
```

- [ ] **Step 4: Server publish + presence auth adapter**

Create `src/lib/realtime/pusher-server.ts`:

```ts
import "server-only";
import Pusher from "pusher";
import { CHANNELS } from "./events";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

/** Fire-and-forget publish; never let a realtime hiccup fail the API request. */
export async function publishToLobby(code: string, event: string, payload: unknown): Promise<void> {
  try {
    await pusher.trigger(CHANNELS.lobby(code), event, payload);
  } catch (err) {
    console.error("pusher publish failed:", err instanceof Error ? err.message : "unknown");
  }
}

/** Sign a presence-channel subscription after the caller has verified the player. */
export function authorizeLobbyChannel(socketId: string, channel: string, playerId: number, name: string) {
  return pusher.authorizeChannel(socketId, channel, {
    user_id: String(playerId),
    user_info: { name },
  });
}
```

- [ ] **Step 5: Client Pusher factory**

Create `src/lib/realtime/pusher-client.ts`:

```ts
"use client";
import Pusher from "pusher-js";

/** One Pusher connection per lobby membership. Auth params carry the player
 *  token + code so the server auth route can verify presence membership. */
export function createPusherClient(token: string, code: string): Pusher {
  return new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    authEndpoint: "/api/challenge/pusher/auth",
    auth: { params: { token, code } },
  });
}
```

- [ ] **Step 6: Verify type-check**

Run: `npx tsc --noEmit`
Expected: no errors from the new files (existing unrelated errors, if any, untouched).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json .env.example src/lib/realtime/
git commit -m "feat(challenge): pusher SDKs + realtime event contracts and adapter"
```

---

## Task 2: Database schema for lobbies, players, answers

**Files:**
- Modify: `src/db/schema.ts`
- Modify: `package.json` (add `db:generate`, `db:push` scripts)

**Interfaces:**
- Produces: Drizzle tables `challengeLobbies`, `challengePlayers`, `challengeAnswers` with the columns below; consumed by every route and `src/lib/challenge/server.ts`.

- [ ] **Step 1: Add the three tables**

Append to `src/db/schema.ts`:

```ts
import { pgTable, timestamp, jsonb, integer, varchar, index, boolean, numeric, uniqueIndex, serial } from "drizzle-orm/pg-core";

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
```

(Keep the existing `savedSessions` table and its imports; merge the import line above with the existing `pgTable` import rather than duplicating it.)

- [ ] **Step 2: Add db scripts**

In `package.json` `scripts`, add:

```json
"db:generate": "drizzle-kit generate",
"db:push": "drizzle-kit push"
```

- [ ] **Step 3: Push schema to the database**

Run: `npx dotenv -e .env.local -- npm run db:push`
Expected: drizzle-kit reports the 3 new tables created, no destructive changes to `saved_sessions`. (Review the diff it prints before confirming.)

- [ ] **Step 4: Commit**

```bash
git add src/db/schema.ts package.json drizzle/
git commit -m "feat(challenge): lobby, player, and answer tables"
```

---

## Task 3: Token and code crypto helpers

**Files:**
- Modify: `src/lib/crypto.ts`
- Test: `scripts/challenge-tokens.test.mjs`
- Modify: `package.json` (register the test)

**Interfaces:**
- Produces: `generateToken(): string` (unguessable, URL-safe), `hashToken(token: string): string` (stable HMAC-SHA256 hex, 64 chars).

- [ ] **Step 1: Write the failing test**

Create `scripts/challenge-tokens.test.mjs`:

```js
import process from "node:process";
import assert from "node:assert/strict";
import { generateToken, hashToken } from "../src/lib/crypto.ts";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

check("generateToken returns a long url-safe string", () => {
  const t = generateToken();
  assert.ok(t.length >= 32, "token too short");
  assert.match(t, /^[A-Za-z0-9_-]+$/);
});

check("generateToken is unique across calls", () => {
  assert.notEqual(generateToken(), generateToken());
});

check("hashToken is stable and 64 hex chars", () => {
  const h1 = hashToken("abc");
  const h2 = hashToken("abc");
  assert.equal(h1, h2);
  assert.match(h1, /^[a-f0-9]{64}$/);
});

check("hashToken differs for different inputs", () => {
  assert.notEqual(hashToken("abc"), hashToken("abd"));
});

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
```

- [ ] **Step 2: Run it to confirm failure**

Run: `node --import ./scripts/register-alias.mjs scripts/challenge-tokens.test.mjs`
Expected: FAIL (`generateToken` / `hashToken` not exported).

- [ ] **Step 3: Implement the helpers**

Append to `src/lib/crypto.ts`:

```ts
export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  const salt = process.env.IP_HASH_SALT;
  if (!salt) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("IP_HASH_SALT environment variable is required in production");
    }
    return createHmac("sha256", "dev-salt").update(token).digest("hex");
  }
  return createHmac("sha256", salt).update(token).digest("hex");
}
```

- [ ] **Step 4: Run it to confirm pass**

Run: `node --import ./scripts/register-alias.mjs scripts/challenge-tokens.test.mjs`
Expected: All tests passed.

- [ ] **Step 5: Register the test in the suite**

In `package.json` `test`, append: ` && node --import ./scripts/register-alias.mjs scripts/challenge-tokens.test.mjs`

- [ ] **Step 6: Commit**

```bash
git add src/lib/crypto.ts scripts/challenge-tokens.test.mjs package.json
git commit -m "feat(challenge): token generation and hashing helpers"
```

---

## Task 4: Challenge constants and shared types

**Files:**
- Modify: `src/lib/constants.ts`
- Create: `src/lib/challenge/types.ts`

**Interfaces:**
- Produces: `CHALLENGE` limits, `RATE_LIMITS.challengeCreate|challengeJoin|challengeAnswer`, and types `ChallengeMode`, `ChallengeConfig`, `LobbyStatus`.

- [ ] **Step 1: Add constants**

Append to `src/lib/constants.ts`:

```ts
export const CHALLENGE = {
  MIN_CAPACITY: 2,
  MAX_CAPACITY: 10,
  MAX_QUESTIONS: 50,
  MIN_QUESTIONS: 1,
  MAX_NAME_LENGTH: 20,
  MAX_LOBBIES_PER_IP: 10,
  ABANDON_MS: 3 * 60 * 60 * 1000, // 3h with no Start -> expired
  RESULTS_TTL_MS: 7 * 24 * 60 * 60 * 1000, // results readable 7 days
} as const;
```

Add to the existing `RATE_LIMITS` object:

```ts
  challengeCreate: { windowMs: 15 * 60 * 1000, maxRequests: 10 },
  challengeJoin: { windowMs: 5 * 60 * 1000, maxRequests: 30 },
  challengeAnswer: { windowMs: 60 * 1000, maxRequests: 120 },
```

- [ ] **Step 2: Add shared types**

Create `src/lib/challenge/types.ts`:

```ts
export type ChallengeMode = "self_paced" | "lockstep";
export type LobbyStatus = "lobby" | "running" | "finished" | "expired";

export interface ChallengeConfig {
  mode: ChallengeMode;
  subjectIds: string[];
  questionCount: number;
  shuffleOrder: boolean;
  shuffleOptions: boolean;
  instantFeedback: boolean;
  perQuestionSeconds: number | null; // null in self-paced
  capacity: number; // 2..10
  hostPlays: boolean;
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/constants.ts src/lib/challenge/types.ts
git commit -m "feat(challenge): limits, rate limits, and shared config types"
```

---

## Task 5: Question selection and per-player ordering

**Files:**
- Create: `src/lib/challenge/select.ts`
- Test: `scripts/challenge-select.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `shuffleArray` from `@/lib/utils`, `buildOptionOrders` from `@/lib/practice`.
- Produces:
  - `pickChallengeQuestionIds(pool: {id:number}[], count: number, shuffle: boolean, shuffleFn?): number[]`
  - `buildPlayerOrder(questionIds: number[], shuffle: boolean, shuffleFn?): number[]`

- [ ] **Step 1: Write the failing test**

Create `scripts/challenge-select.test.mjs`:

```js
import process from "node:process";
import assert from "node:assert/strict";
import { pickChallengeQuestionIds, buildPlayerOrder } from "../src/lib/challenge/select.ts";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

const pool = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
const identity = (a) => a; // deterministic "shuffle" for testing

check("picks exactly count ids, natural order when not shuffled", () => {
  assert.deepEqual(pickChallengeQuestionIds(pool, 3, false), [1, 2, 3]);
});

check("count larger than pool returns the whole pool", () => {
  assert.deepEqual(pickChallengeQuestionIds(pool, 99, false), [1, 2, 3, 4, 5]);
});

check("shuffle uses the injected shuffle fn", () => {
  const reverse = (arr) => [...arr].reverse();
  assert.deepEqual(pickChallengeQuestionIds(pool, 3, true, reverse), [5, 4, 3]);
});

check("buildPlayerOrder keeps the set when not shuffled", () => {
  assert.deepEqual(buildPlayerOrder([10, 20, 30], false), [10, 20, 30]);
});

check("buildPlayerOrder permutes via the injected fn but keeps the same members", () => {
  const reverse = (arr) => [...arr].reverse();
  const order = buildPlayerOrder([10, 20, 30], true, reverse);
  assert.deepEqual(order, [30, 20, 10]);
  assert.deepEqual([...order].sort((a, b) => a - b), [10, 20, 30]);
});

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
```

- [ ] **Step 2: Run it to confirm failure**

Run: `node --import ./scripts/register-alias.mjs scripts/challenge-select.test.mjs`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement selection**

Create `src/lib/challenge/select.ts`:

```ts
import { shuffleArray } from "@/lib/utils";

/** Choose the canonical ordered set of question ids for a lobby. The pool is
 *  the union of the selected subjects' questions (built by the caller). */
export function pickChallengeQuestionIds<T extends { id: number }>(
  pool: T[],
  count: number,
  shuffle: boolean,
  shuffleFn: <U>(items: U[]) => U[] = shuffleArray,
): number[] {
  const ordered = shuffle ? shuffleFn(pool) : pool;
  return ordered.slice(0, count).map((q) => q.id);
}

/** A single player's traversal order over the chosen set. When the host turned
 *  on order-shuffle, each player gets their own permutation so neighbors cannot
 *  copy; otherwise everyone shares the canonical order. */
export function buildPlayerOrder(
  questionIds: number[],
  shuffle: boolean,
  shuffleFn: <U>(items: U[]) => U[] = shuffleArray,
): number[] {
  return shuffle ? shuffleFn([...questionIds]) : [...questionIds];
}
```

- [ ] **Step 4: Run it to confirm pass**

Run: `node --import ./scripts/register-alias.mjs scripts/challenge-select.test.mjs`
Expected: All tests passed.

- [ ] **Step 5: Register + commit**

Append the test to `package.json` `test`, then:

```bash
git add src/lib/challenge/select.ts scripts/challenge-select.test.mjs package.json
git commit -m "feat(challenge): question-set selection and per-player ordering"
```

---

## Task 6: Scoring and ranking into standings

**Files:**
- Create: `src/lib/challenge/scoring.ts`
- Test: `scripts/challenge-scoring.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `Standing` from `@/lib/realtime/events`.
- Produces:
  - `PlayerRow` (the subset of `challengePlayers` columns scoring needs).
  - `rankPlayers(players: PlayerRow[], totalQuestions: number): Standing[]` - sorted by score desc, then totalTimeMs asc; ties share a rank; output ordered by rank.

- [ ] **Step 1: Write the failing test**

Create `scripts/challenge-scoring.test.mjs`:

```js
import process from "node:process";
import assert from "node:assert/strict";
import { rankPlayers } from "../src/lib/challenge/scoring.ts";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

const p = (id, name, score, answered, time, finished = false) => ({
  id, name, score, correctCount: score, answeredCount: answered, totalTimeMs: time,
  finishedAt: finished ? "2026-01-01T00:00:00Z" : null,
});

check("ranks by score desc", () => {
  const s = rankPlayers([p(1, "A", 2, 3, 100), p(2, "B", 5, 5, 100)], 5);
  assert.equal(s[0].playerId, 2);
  assert.equal(s[0].rank, 1);
  assert.equal(s[1].rank, 2);
});

check("breaks ties by less total time", () => {
  const s = rankPlayers([p(1, "A", 3, 3, 500), p(2, "B", 3, 3, 200)], 5);
  assert.equal(s[0].playerId, 2); // faster wins the tie
});

check("equal score and time share a rank", () => {
  const s = rankPlayers([p(1, "A", 3, 3, 200), p(2, "B", 3, 3, 200)], 5);
  assert.equal(s[0].rank, 1);
  assert.equal(s[1].rank, 1);
});

check("computes progress and finished flags", () => {
  const s = rankPlayers([p(1, "A", 2, 2, 100, false)], 4);
  assert.equal(s[0].progress, 0.5);
  assert.equal(s[0].finished, false);
  assert.equal(s[0].totalQuestions, 4);
});

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
```

- [ ] **Step 2: Run it to confirm failure**

Run: `node --import ./scripts/register-alias.mjs scripts/challenge-scoring.test.mjs`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement scoring**

Create `src/lib/challenge/scoring.ts`:

```ts
import type { Standing } from "@/lib/realtime/events";

export interface PlayerRow {
  id: number;
  name: string;
  score: number;
  correctCount: number;
  answeredCount: number;
  totalTimeMs: number;
  finishedAt: string | null;
}

/** Sort players into ranked standings: score desc, then total time asc. Ties on
 *  both share a rank (standard competition ranking: 1,1,3). Output is ordered. */
export function rankPlayers(players: PlayerRow[], totalQuestions: number): Standing[] {
  const sorted = [...players].sort(
    (a, b) => b.score - a.score || a.totalTimeMs - b.totalTimeMs,
  );

  let lastKey = "";
  let lastRank = 0;
  return sorted.map((pl, i) => {
    const key = `${pl.score}:${pl.totalTimeMs}`;
    const rank = key === lastKey ? lastRank : i + 1;
    lastKey = key;
    lastRank = rank;
    return {
      playerId: pl.id,
      name: pl.name,
      score: pl.score,
      correctCount: pl.correctCount,
      answeredCount: pl.answeredCount,
      totalQuestions,
      progress: totalQuestions > 0 ? pl.answeredCount / totalQuestions : 0,
      finished: pl.finishedAt !== null,
      rank,
    };
  });
}
```

- [ ] **Step 4: Run it to confirm pass**

Run: `node --import ./scripts/register-alias.mjs scripts/challenge-scoring.test.mjs`
Expected: All tests passed.

- [ ] **Step 5: Register + commit**

Append the test to `package.json` `test`, then:

```bash
git add src/lib/challenge/scoring.ts scripts/challenge-scoring.test.mjs package.json
git commit -m "feat(challenge): rank players into live standings"
```

---

## Task 7: Milestone detection

**Files:**
- Create: `src/lib/challenge/milestones.ts`
- Test: `scripts/challenge-milestones.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `MilestoneEvent` from `@/lib/realtime/events`.
- Produces: `detectMilestones(input): MilestoneEvent[]` where `input = { playerId, name, beforeAnswered, afterAnswered, total, justFinished, anyoneFinishedBefore, becameLeader }`.

- [ ] **Step 1: Write the failing test**

Create `scripts/challenge-milestones.test.mjs`:

```js
import process from "node:process";
import assert from "node:assert/strict";
import { detectMilestones } from "../src/lib/challenge/milestones.ts";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

const base = {
  playerId: 1, name: "Ana", total: 4,
  beforeAnswered: 0, afterAnswered: 0,
  justFinished: false, anyoneFinishedBefore: false, becameLeader: false,
};

check("emits a 25% crossing when passing the threshold", () => {
  const m = detectMilestones({ ...base, beforeAnswered: 0, afterAnswered: 1 }); // 0% -> 25%
  assert.equal(m.filter((e) => e.type === "progress" && e.value === 25).length, 1);
});

check("does not re-emit a threshold already crossed", () => {
  const m = detectMilestones({ ...base, beforeAnswered: 1, afterAnswered: 2 }); // 25% -> 50%
  assert.equal(m.some((e) => e.value === 25), false);
  assert.equal(m.some((e) => e.value === 50), true);
});

check("first finisher emits first_finish, not just finished", () => {
  const m = detectMilestones({ ...base, beforeAnswered: 3, afterAnswered: 4, justFinished: true, anyoneFinishedBefore: false });
  assert.equal(m.some((e) => e.type === "first_finish"), true);
});

check("later finisher emits finished", () => {
  const m = detectMilestones({ ...base, beforeAnswered: 3, afterAnswered: 4, justFinished: true, anyoneFinishedBefore: true });
  assert.equal(m.some((e) => e.type === "finished"), true);
  assert.equal(m.some((e) => e.type === "first_finish"), false);
});

check("lead change emits lead_change", () => {
  const m = detectMilestones({ ...base, becameLeader: true });
  assert.equal(m.some((e) => e.type === "lead_change"), true);
});

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
```

- [ ] **Step 2: Run it to confirm failure**

Run: `node --import ./scripts/register-alias.mjs scripts/challenge-milestones.test.mjs`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement milestone detection**

Create `src/lib/challenge/milestones.ts`:

```ts
import type { MilestoneEvent } from "@/lib/realtime/events";

export interface MilestoneInput {
  playerId: number;
  name: string;
  total: number;
  beforeAnswered: number;
  afterAnswered: number;
  justFinished: boolean;
  anyoneFinishedBefore: boolean;
  becameLeader: boolean;
}

const THRESHOLDS = [25, 50, 75] as const; // 100% is covered by finish events

function pct(answered: number, total: number): number {
  return total > 0 ? (answered / total) * 100 : 0;
}

/** Pure milestone derivation from a single answer's before/after state. The
 *  caller supplies the cross-player facts (first finish, lead change) it
 *  computed from the DB; this function turns the delta into toastable events. */
export function detectMilestones(input: MilestoneInput): MilestoneEvent[] {
  const events: MilestoneEvent[] = [];
  const before = pct(input.beforeAnswered, input.total);
  const after = pct(input.afterAnswered, input.total);

  for (const t of THRESHOLDS) {
    if (before < t && after >= t) {
      events.push({ type: "progress", value: t, playerId: input.playerId, text: `${input.name} a ajuns la ${t}%` });
    }
  }

  if (input.justFinished) {
    if (input.anyoneFinishedBefore) {
      events.push({ type: "finished", playerId: input.playerId, text: `${input.name} a terminat` });
    } else {
      events.push({ type: "first_finish", playerId: input.playerId, text: `${input.name} a terminat prima/primul` });
    }
  }

  if (input.becameLeader) {
    events.push({ type: "lead_change", playerId: input.playerId, text: `${input.name} a preluat conducerea` });
  }

  return events;
}
```

- [ ] **Step 4: Run it to confirm pass**

Run: `node --import ./scripts/register-alias.mjs scripts/challenge-milestones.test.mjs`
Expected: All tests passed.

- [ ] **Step 5: Register + commit**

Append the test to `package.json` `test`, then:

```bash
git add src/lib/challenge/milestones.ts scripts/challenge-milestones.test.mjs package.json
git commit -m "feat(challenge): milestone detection from answer deltas"
```

---

## Task 8: Input validation

**Files:**
- Create: `src/lib/challenge/validation.ts`
- Test: `scripts/challenge-validation.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `CHALLENGE` from `@/lib/constants`, `ChallengeConfig` from `@/lib/challenge/types`.
- Produces:
  - `validateName(raw): { ok: true; name: string } | { ok: false; error: string }`
  - `validateCreateConfig(raw, validSubjectIds: Set<string>): { ok: true; config: ChallengeConfig } | { ok: false; error: string }`

- [ ] **Step 1: Write the failing test**

Create `scripts/challenge-validation.test.mjs`:

```js
import process from "node:process";
import assert from "node:assert/strict";
import { validateName, validateCreateConfig } from "../src/lib/challenge/validation.ts";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

check("trims and accepts a normal name", () => {
  const r = validateName("  Ana ");
  assert.equal(r.ok, true);
  assert.equal(r.name, "Ana");
});

check("rejects empty and over-long names", () => {
  assert.equal(validateName("   ").ok, false);
  assert.equal(validateName("x".repeat(21)).ok, false);
});

check("rejects names with angle brackets or control chars", () => {
  assert.equal(validateName("<b>").ok, false);
  assert.equal(validateName("a\x00b").ok, false);
});

const subjects = new Set(["fundamentele-programarii", "sgbd"]);
const goodCfg = {
  mode: "self_paced", subjectIds: ["sgbd"], questionCount: 10,
  shuffleOrder: true, shuffleOptions: true, instantFeedback: true,
  perQuestionSeconds: null, capacity: 4, hostPlays: true,
};

check("accepts a valid config", () => {
  const r = validateCreateConfig(goodCfg, subjects);
  assert.equal(r.ok, true);
  assert.equal(r.config.questionCount, 10);
});

check("rejects unknown subjects", () => {
  assert.equal(validateCreateConfig({ ...goodCfg, subjectIds: ["nope"] }, subjects).ok, false);
});

check("rejects empty subject list", () => {
  assert.equal(validateCreateConfig({ ...goodCfg, subjectIds: [] }, subjects).ok, false);
});

check("clamps capacity and question count to limits", () => {
  assert.equal(validateCreateConfig({ ...goodCfg, capacity: 99 }, subjects).ok, false);
  assert.equal(validateCreateConfig({ ...goodCfg, questionCount: 999 }, subjects).ok, false);
});

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
```

- [ ] **Step 2: Run it to confirm failure**

Run: `node --import ./scripts/register-alias.mjs scripts/challenge-validation.test.mjs`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement validation**

Create `src/lib/challenge/validation.ts`:

```ts
import { CHALLENGE } from "@/lib/constants";
import type { ChallengeConfig } from "./types";

export function validateName(raw: unknown): { ok: true; name: string } | { ok: false; error: string } {
  if (typeof raw !== "string") return { ok: false, error: "Nume invalid." };
  const name = raw.trim();
  if (name.length === 0) return { ok: false, error: "Introdu un nume." };
  if (name.length > CHALLENGE.MAX_NAME_LENGTH) return { ok: false, error: `Numele este prea lung (max ${CHALLENGE.MAX_NAME_LENGTH}).` };
  if (/[\x00-\x1f\x7f]/.test(name)) return { ok: false, error: "Numele conține caractere invalide." };
  if (/<[^>]*>/.test(name)) return { ok: false, error: "Numele conține caractere invalide." };
  return { ok: true, name };
}

export function validateCreateConfig(
  raw: unknown,
  validSubjectIds: Set<string>,
): { ok: true; config: ChallengeConfig } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Configurație invalidă." };
  const c = raw as Record<string, unknown>;

  if (c.mode !== "self_paced" && c.mode !== "lockstep") return { ok: false, error: "Mod invalid." };

  if (!Array.isArray(c.subjectIds) || c.subjectIds.length === 0) return { ok: false, error: "Alege cel puțin o materie." };
  for (const s of c.subjectIds) {
    if (typeof s !== "string" || !validSubjectIds.has(s)) return { ok: false, error: "Materie invalidă." };
  }

  const count = c.questionCount;
  if (typeof count !== "number" || !Number.isInteger(count) || count < CHALLENGE.MIN_QUESTIONS || count > CHALLENGE.MAX_QUESTIONS) {
    return { ok: false, error: `Numărul de întrebări trebuie să fie între ${CHALLENGE.MIN_QUESTIONS} și ${CHALLENGE.MAX_QUESTIONS}.` };
  }

  const capacity = c.capacity;
  if (typeof capacity !== "number" || !Number.isInteger(capacity) || capacity < CHALLENGE.MIN_CAPACITY || capacity > CHALLENGE.MAX_CAPACITY) {
    return { ok: false, error: `Capacitatea trebuie să fie între ${CHALLENGE.MIN_CAPACITY} și ${CHALLENGE.MAX_CAPACITY}.` };
  }

  for (const flag of ["shuffleOrder", "shuffleOptions", "instantFeedback", "hostPlays"]) {
    if (typeof c[flag] !== "boolean") return { ok: false, error: "Configurație invalidă." };
  }

  // Phase 1 ships self_paced only; lockstep is accepted by the validator but the
  // create route rejects it until Phase 2 (see Task 9).
  const perQuestionSeconds =
    c.mode === "lockstep"
      ? (typeof c.perQuestionSeconds === "number" && c.perQuestionSeconds > 0 ? c.perQuestionSeconds : 20)
      : null;

  return {
    ok: true,
    config: {
      mode: c.mode,
      subjectIds: c.subjectIds as string[],
      questionCount: count,
      shuffleOrder: c.shuffleOrder as boolean,
      shuffleOptions: c.shuffleOptions as boolean,
      instantFeedback: c.instantFeedback as boolean,
      perQuestionSeconds,
      capacity,
      hostPlays: c.hostPlays as boolean,
    },
  };
}
```

- [ ] **Step 4: Run it to confirm pass**

Run: `node --import ./scripts/register-alias.mjs scripts/challenge-validation.test.mjs`
Expected: All tests passed.

- [ ] **Step 5: Register + commit**

Append the test to `package.json` `test`, then:

```bash
git add src/lib/challenge/validation.ts scripts/challenge-validation.test.mjs package.json
git commit -m "feat(challenge): name and create-config validation"
```

---

## Task 9: Shared server helpers + create route

**Files:**
- Create: `src/lib/challenge/server.ts`
- Create: `src/app/api/challenge/create/route.ts`

**Interfaces:**
- Consumes: `db`, schema tables, `hashIp`, `generateSaveKey`, `generateToken`, `hashToken`, `checkRateLimit`, `RATE_LIMITS`, `CHALLENGE`, `validateCreateConfig`, `rankPlayers`, `questionsBySubject`.
- Produces (from `server.ts`):
  - `getClientIp(request): string`
  - `loadLobby(code): Promise<Lobby | null>`
  - `loadPlayerByToken(code, token): Promise<{ lobby; player } | null>`
  - `buildStandings(code): Promise<Standing[]>`
  - `expireIfStale(lobby): Promise<boolean>` (returns true if it just expired)
- Produces (route): `POST /api/challenge/create`.

- [ ] **Step 1: Implement shared server helpers**

Create `src/lib/challenge/server.ts`:

```ts
import "server-only";
import { db } from "@/db";
import { challengeLobbies, challengePlayers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashToken } from "@/lib/crypto";
import { CHALLENGE } from "@/lib/constants";
import { rankPlayers, type PlayerRow } from "./scoring";
import type { Standing } from "@/lib/realtime/events";

export function getClientIp(request: Request): string {
  return request.headers.get("x-real-ip") || "unknown";
}

export async function loadLobby(code: string) {
  const rows = await db.select().from(challengeLobbies).where(eq(challengeLobbies.code, code)).limit(1);
  return rows[0] ?? null;
}

export async function loadPlayerByToken(code: string, token: string) {
  const lobby = await loadLobby(code);
  if (!lobby) return null;
  const hash = hashToken(token);
  const players = await db
    .select()
    .from(challengePlayers)
    .where(eq(challengePlayers.playerTokenHash, hash))
    .limit(1);
  const player = players[0];
  if (!player || player.lobbyCode !== code) return null;
  return { lobby, player };
}

export async function buildStandings(code: string): Promise<Standing[]> {
  const lobby = await loadLobby(code);
  const total = Array.isArray(lobby?.questionIds) ? (lobby!.questionIds as number[]).length : 0;
  const players = await db.select().from(challengePlayers).where(eq(challengePlayers.lobbyCode, code));
  const rows: PlayerRow[] = players.map((p) => ({
    id: p.id,
    name: p.name,
    score: Number(p.score),
    correctCount: p.correctCount,
    answeredCount: p.answeredCount,
    totalTimeMs: p.totalTimeMs,
    finishedAt: p.finishedAt ? p.finishedAt.toISOString() : null,
  }));
  return rankPlayers(rows, total);
}

/** Mark a never-started lobby as expired once it is older than the abandon
 *  window. Lazy: runs on access, no cron required. */
export async function expireIfStale(lobby: typeof challengeLobbies.$inferSelect): Promise<boolean> {
  if (lobby.status !== "lobby") return false;
  const age = Date.now() - lobby.createdAt.getTime();
  if (age < CHALLENGE.ABANDON_MS) return false;
  await db.update(challengeLobbies).set({ status: "expired" }).where(eq(challengeLobbies.code, lobby.code));
  return true;
}
```

- [ ] **Step 2: Implement the create route**

Create `src/app/api/challenge/create/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { challengeLobbies, challengePlayers } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { generateSaveKey, generateToken, hashToken, hashIp } from "@/lib/crypto";
import { checkRateLimit } from "@/lib/rate-limit";
import { RATE_LIMITS, CHALLENGE } from "@/lib/constants";
import { validateCreateConfig, validateName } from "@/lib/challenge/validation";
import { questionsBySubject } from "@/data";
import { getClientIp } from "@/lib/challenge/server";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (ip === "unknown" && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }
  const ipHashed = hashIp(ip);

  const rl = checkRateLimit(`ch:create:${ipHashed}`, RATE_LIMITS.challengeCreate);
  if (!rl.allowed) return NextResponse.json({ error: "Prea multe cereri." }, { status: 429 });

  let body: { config?: unknown; hostName?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Date invalide." }, { status: 400 }); }

  const validSubjects = new Set(Object.keys(questionsBySubject));
  const cfg = validateCreateConfig(body.config, validSubjects);
  if (!cfg.ok) return NextResponse.json({ error: cfg.error }, { status: 400 });

  // Phase 1 ships self-paced only.
  if (cfg.config.mode !== "self_paced") {
    return NextResponse.json({ error: "Modul live va fi disponibil în curând." }, { status: 400 });
  }

  // Ensure the chosen subjects actually have enough questions for the count.
  const poolSize = cfg.config.subjectIds.reduce((n, s) => n + (questionsBySubject[s]?.length ?? 0), 0);
  if (poolSize === 0) return NextResponse.json({ error: "Materiile alese nu au întrebări." }, { status: 400 });

  const [{ n }] = await db.select({ n: count() }).from(challengeLobbies).where(eq(challengeLobbies.ipHash, ipHashed));
  if (n >= CHALLENGE.MAX_LOBBIES_PER_IP) {
    return NextResponse.json({ error: "Ai atins limita de camere create." }, { status: 429 });
  }

  const code = generateSaveKey();
  const hostToken = generateToken();

  try {
    await db.insert(challengeLobbies).values({
      code,
      hostTokenHash: hashToken(hostToken),
      mode: cfg.config.mode,
      status: "lobby",
      config: cfg.config,
      ipHash: ipHashed,
    });

    let playerToken: string | null = null;
    if (cfg.config.hostPlays) {
      const nameCheck = validateName(body.hostName);
      if (!nameCheck.ok) return NextResponse.json({ error: nameCheck.error }, { status: 400 });
      playerToken = generateToken();
      await db.insert(challengePlayers).values({
        lobbyCode: code,
        playerTokenHash: hashToken(playerToken),
        name: nameCheck.name,
        isHost: true,
      });
    }

    return NextResponse.json({ code, hostToken, playerToken }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("challenge create error:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ error: "Eroare la creare." }, { status: 500 });
  }
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Manual smoke test**

Start the dev server (`npx dotenv -e .env.local -- npm run dev`) and run:

```bash
curl -s -X POST http://localhost:3000/api/challenge/create \
  -H 'content-type: application/json' -H 'x-real-ip: 1.2.3.4' \
  -d '{"hostName":"Ana","config":{"mode":"self_paced","subjectIds":["sgbd"],"questionCount":5,"shuffleOrder":true,"shuffleOptions":true,"instantFeedback":true,"perQuestionSeconds":null,"capacity":4,"hostPlays":true}}'
```

Expected: `201` with JSON `{ code, hostToken, playerToken }`. Confirm a row exists in `challenge_lobbies`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/challenge/server.ts src/app/api/challenge/create/
git commit -m "feat(challenge): create-lobby route and shared server helpers"
```

---

## Task 10: Join route

**Files:**
- Create: `src/app/api/challenge/join/route.ts`

**Interfaces:**
- Consumes: `loadLobby`, `expireIfStale`, `getClientIp`, `validateName`, `generateToken`, `hashToken`, `buildStandings`, `publishToLobby`.
- Produces: `POST /api/challenge/join` -> `{ playerToken, playerId, name, snapshot }`.

- [ ] **Step 1: Implement the join route**

Create `src/app/api/challenge/join/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { challengeLobbies, challengePlayers } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { generateToken, hashToken, hashIp } from "@/lib/crypto";
import { checkRateLimit } from "@/lib/rate-limit";
import { RATE_LIMITS } from "@/lib/constants";
import { validateName } from "@/lib/challenge/validation";
import { loadLobby, expireIfStale, getClientIp, buildStandings } from "@/lib/challenge/server";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`ch:join:${hashIp(ip)}`, RATE_LIMITS.challengeJoin);
  if (!rl.allowed) return NextResponse.json({ error: "Prea multe cereri." }, { status: 429 });

  let body: { code?: unknown; name?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Date invalide." }, { status: 400 }); }

  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!code) return NextResponse.json({ error: "Cod invalid." }, { status: 400 });

  const nameCheck = validateName(body.name);
  if (!nameCheck.ok) return NextResponse.json({ error: nameCheck.error }, { status: 400 });

  const lobby = await loadLobby(code);
  if (!lobby) return NextResponse.json({ error: "Camera nu există." }, { status: 404 });
  if (await expireIfStale(lobby)) return NextResponse.json({ error: "Camera a expirat." }, { status: 410 });
  if (lobby.status !== "lobby") return NextResponse.json({ error: "Provocarea a început deja." }, { status: 409 });

  const cfg = lobby.config as { capacity: number };
  const [{ n }] = await db.select({ n: count() }).from(challengePlayers).where(eq(challengePlayers.lobbyCode, code));
  if (n >= cfg.capacity) return NextResponse.json({ error: "Camera este plină." }, { status: 409 });

  const playerToken = generateToken();
  let playerId: number;
  try {
    const inserted = await db.insert(challengePlayers).values({
      lobbyCode: code,
      playerTokenHash: hashToken(playerToken),
      name: nameCheck.name,
    }).returning({ id: challengePlayers.id });
    playerId = inserted[0].id;
  } catch (err) {
    // Unique(lobbyCode, name) violation -> name already taken in this room.
    console.error("challenge join error:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ error: "Numele este deja folosit în această cameră." }, { status: 409 });
  }

  const snapshot = { status: lobby.status, mode: lobby.mode, config: lobby.config, standings: await buildStandings(code) };
  return NextResponse.json({ playerToken, playerId, name: nameCheck.name, snapshot }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
```

(The roster appears live via Pusher presence when the client subscribes, so the join route itself does not need to publish.)

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Manual smoke test**

With a lobby `code` from Task 9:

```bash
curl -s -X POST http://localhost:3000/api/challenge/join \
  -H 'content-type: application/json' -H 'x-real-ip: 5.6.7.8' \
  -d "{\"code\":\"<CODE>\",\"name\":\"Mihai\"}"
```

Expected: `201` with `{ playerToken, playerId, name, snapshot }`. Re-running with the same name returns `409`.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/challenge/join/
git commit -m "feat(challenge): join-by-code route with capacity and name guards"
```

---

## Task 11: Pusher presence auth route

**Files:**
- Create: `src/app/api/challenge/pusher/auth/route.ts`

**Interfaces:**
- Consumes: `loadPlayerByToken`, `authorizeLobbyChannel`, `CHANNELS`.
- Produces: `POST /api/challenge/pusher/auth` returning Pusher's signed auth payload.

- [ ] **Step 1: Implement the auth route**

Create `src/app/api/challenge/pusher/auth/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { loadPlayerByToken } from "@/lib/challenge/server";
import { authorizeLobbyChannel } from "@/lib/realtime/pusher-server";
import { CHANNELS } from "@/lib/realtime/events";

export async function POST(request: NextRequest) {
  // pusher-js posts application/x-www-form-urlencoded: socket_id, channel_name,
  // plus our auth.params (token, code).
  const form = await request.formData();
  const socketId = String(form.get("socket_id") ?? "");
  const channel = String(form.get("channel_name") ?? "");
  const token = String(form.get("token") ?? "");
  const code = String(form.get("code") ?? "");

  if (!socketId || !channel || !token || !code) {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }
  if (channel !== CHANNELS.lobby(code)) {
    return NextResponse.json({ error: "Canal interzis." }, { status: 403 });
  }

  const found = await loadPlayerByToken(code, token);
  if (!found) return NextResponse.json({ error: "Neautorizat." }, { status: 403 });

  const auth = authorizeLobbyChannel(socketId, channel, found.player.id, found.player.name);
  return NextResponse.json(auth);
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors. (Full verification of presence happens once the client subscribes in Task 16.)

- [ ] **Step 3: Commit**

```bash
git add src/app/api/challenge/pusher/
git commit -m "feat(challenge): pusher presence channel auth route"
```

---

## Task 12: Start route

**Files:**
- Create: `src/app/api/challenge/start/route.ts`

**Interfaces:**
- Consumes: `loadLobby`, `hashToken`, `pickChallengeQuestionIds`, `buildPlayerOrder`, `buildOptionOrders`, `questionsBySubject`, `getQuestion`, `publishToLobby`, `EVENTS`.
- Produces: `POST /api/challenge/start` (host only) -> `{ ok: true }`; sets `questionIds`, per-player orders, `status="running"`; publishes `ROUND_STARTED`.

- [ ] **Step 1: Implement the start route**

Create `src/app/api/challenge/start/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { challengeLobbies, challengePlayers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashToken } from "@/lib/crypto";
import { questionsBySubject, getQuestion } from "@/data";
import { buildOptionOrders } from "@/lib/practice";
import { pickChallengeQuestionIds, buildPlayerOrder } from "@/lib/challenge/select";
import { loadLobby } from "@/lib/challenge/server";
import { publishToLobby } from "@/lib/realtime/pusher-server";
import { EVENTS, type RoundStartedPayload } from "@/lib/realtime/events";
import type { ChallengeConfig } from "@/lib/challenge/types";

export async function POST(request: NextRequest) {
  let body: { code?: unknown; hostToken?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Date invalide." }, { status: 400 }); }

  const code = typeof body.code === "string" ? body.code.trim() : "";
  const hostToken = typeof body.hostToken === "string" ? body.hostToken : "";
  if (!code || !hostToken) return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });

  const lobby = await loadLobby(code);
  if (!lobby) return NextResponse.json({ error: "Camera nu există." }, { status: 404 });
  if (lobby.hostTokenHash !== hashToken(hostToken)) return NextResponse.json({ error: "Neautorizat." }, { status: 403 });
  if (lobby.status !== "lobby") return NextResponse.json({ error: "Deja pornită." }, { status: 409 });

  const config = lobby.config as ChallengeConfig;

  // Build the canonical question set from the chosen subjects.
  const pool = config.subjectIds.flatMap((s) => questionsBySubject[s] ?? []);
  const questionIds = pickChallengeQuestionIds(pool, config.questionCount, config.shuffleOrder);
  if (questionIds.length === 0) return NextResponse.json({ error: "Nu există întrebări." }, { status: 400 });

  // Per-player order + option order.
  const players = await db.select().from(challengePlayers).where(eq(challengePlayers.lobbyCode, code));
  const setQuestions = questionIds.map((id) => getQuestion(id)!).filter(Boolean);

  await db.transaction(async (tx) => {
    await tx.update(challengeLobbies)
      .set({ questionIds, status: "running", startedAt: new Date(), updatedAt: new Date() })
      .where(eq(challengeLobbies.code, code));

    for (const p of players) {
      const order = buildPlayerOrder(questionIds, config.shuffleOrder);
      const optionOrder = config.shuffleOptions ? buildOptionOrders(setQuestions) : {};
      await tx.update(challengePlayers)
        .set({ questionOrder: order, optionOrder })
        .where(eq(challengePlayers.id, p.id));
    }
  });

  const payload: RoundStartedPayload = { totalQuestions: questionIds.length };
  await publishToLobby(code, EVENTS.ROUND_STARTED, payload);

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
```

- [ ] **Step 2: Type-check + smoke test**

Run: `npx tsc --noEmit` (expect no new errors). Then `curl` the route with the `code` + `hostToken` from Task 9 and confirm `status` flips to `running` and `question_ids` is populated, and each player row has a `question_order`.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/challenge/start/
git commit -m "feat(challenge): host start route builds question set and per-player orders"
```

---

## Task 13: Answer route (core gameplay)

**Files:**
- Create: `src/app/api/challenge/answer/route.ts`

**Interfaces:**
- Consumes: `loadPlayerByToken`, `getQuestion`, `checkRateLimit`, `detectMilestones`, `buildStandings`, `rankPlayers`, `publishToLobby`, `EVENTS`, `MAX_QUESTION_TIME_MS`.
- Produces: `POST /api/challenge/answer` -> `{ recorded: true, isCorrect?, correctAnswer?, explanation? }`; updates aggregates; publishes `LEADERBOARD`, `MILESTONE`(s), and `ROUND_FINISHED` when all done.

- [ ] **Step 1: Implement the answer route**

Create `src/app/api/challenge/answer/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { challengeLobbies, challengePlayers, challengeAnswers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashIp } from "@/lib/crypto";
import { checkRateLimit } from "@/lib/rate-limit";
import { RATE_LIMITS, MAX_QUESTION_TIME_MS } from "@/lib/constants";
import { getQuestion } from "@/data";
import { loadPlayerByToken, getClientIp, buildStandings } from "@/lib/challenge/server";
import { detectMilestones } from "@/lib/challenge/milestones";
import { publishToLobby } from "@/lib/realtime/pusher-server";
import { EVENTS } from "@/lib/realtime/events";

const VALID = new Set(["a", "b", "c", "d"]);

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`ch:answer:${hashIp(ip)}`, RATE_LIMITS.challengeAnswer);
  if (!rl.allowed) return NextResponse.json({ error: "Prea multe cereri." }, { status: 429 });

  let body: { code?: unknown; token?: unknown; questionId?: unknown; selected?: unknown; timeMs?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Date invalide." }, { status: 400 }); }

  const code = typeof body.code === "string" ? body.code.trim() : "";
  const token = typeof body.token === "string" ? body.token : "";
  const questionId = Number(body.questionId);
  const selected = String(body.selected);
  const timeMs = Math.max(0, Math.min(Number(body.timeMs) || 0, MAX_QUESTION_TIME_MS));

  if (!code || !token || !Number.isInteger(questionId) || !VALID.has(selected)) {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }

  const found = await loadPlayerByToken(code, token);
  if (!found) return NextResponse.json({ error: "Neautorizat." }, { status: 403 });
  const { lobby, player } = found;
  if (lobby.status !== "running") return NextResponse.json({ error: "Provocarea nu este activă." }, { status: 409 });

  const order = (player.questionOrder as number[] | null) ?? [];
  if (!order.includes(questionId)) return NextResponse.json({ error: "Întrebare în afara setului." }, { status: 400 });

  const question = getQuestion(questionId);
  if (!question) return NextResponse.json({ error: "Întrebare inexistentă." }, { status: 400 });
  const isCorrect = selected === question.correctAnswer;
  const total = order.length;

  const beforeAnswered = player.answeredCount;

  // Record the answer; the unique(playerId, questionId) constraint makes this the
  // single source of "no redo". A duplicate throws and we return 409.
  try {
    await db.insert(challengeAnswers).values({
      lobbyCode: code, playerId: player.id, questionId,
      selected, isCorrect, timeMs, pointsAwarded: isCorrect ? "1" : "0",
    });
  } catch {
    return NextResponse.json({ error: "Ai răspuns deja la această întrebare." }, { status: 409 });
  }

  const afterAnswered = beforeAnswered + 1;
  const newCorrect = player.correctCount + (isCorrect ? 1 : 0);
  const justFinished = afterAnswered >= total;

  // Determine leader before, to detect a lead change after this answer.
  const beforeStandings = await buildStandings(code);
  const beforeLeaderId = beforeStandings[0]?.playerId ?? null;

  await db.update(challengePlayers).set({
    answeredCount: afterAnswered,
    correctCount: newCorrect,
    score: String(newCorrect), // self-paced score = correct count
    totalTimeMs: player.totalTimeMs + timeMs,
    finishedAt: justFinished ? new Date() : player.finishedAt,
    lastSeenAt: new Date(),
  }).where(eq(challengePlayers.id, player.id));

  // Cross-player facts for milestones.
  const others = await db.select({ finishedAt: challengePlayers.finishedAt })
    .from(challengePlayers).where(eq(challengePlayers.lobbyCode, code));
  const anyoneFinishedBefore = others.filter((o) => o.finishedAt !== null).length > (justFinished ? 1 : 0);

  const afterStandings = await buildStandings(code);
  const afterLeaderId = afterStandings[0]?.playerId ?? null;
  const becameLeader = afterLeaderId === player.id && beforeLeaderId !== player.id;

  const milestones = detectMilestones({
    playerId: player.id, name: player.name, total,
    beforeAnswered, afterAnswered, justFinished, anyoneFinishedBefore, becameLeader,
  });

  // Publish: leaderboard first, then any milestones.
  await publishToLobby(code, EVENTS.LEADERBOARD, { standings: afterStandings });
  for (const m of milestones) await publishToLobby(code, EVENTS.MILESTONE, m);

  // If everyone has finished, close the lobby and announce the final podium.
  const allFinished = afterStandings.every((s) => s.finished);
  if (allFinished) {
    await db.update(challengeLobbies).set({ status: "finished", finishedAt: new Date() }).where(eq(challengeLobbies.code, code));
    await publishToLobby(code, EVENTS.ROUND_FINISHED, { standings: afterStandings });
  }

  const config = lobby.config as { instantFeedback: boolean };
  if (config.instantFeedback) {
    return NextResponse.json({ recorded: true, isCorrect, correctAnswer: question.correctAnswer, explanation: question.explanation ?? null });
  }
  return NextResponse.json({ recorded: true });
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors. (Confirm `MAX_QUESTION_TIME_MS` is already exported from `@/lib/constants`; it is.)

- [ ] **Step 3: Manual smoke test**

Using a started lobby and a player token, POST an answer and confirm: a `challenge_answers` row appears, the player aggregates update, a second identical POST returns `409`, and (via the Pusher debug console for your app) a `leaderboard` event fires.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/challenge/answer/
git commit -m "feat(challenge): answer route with scoring, milestones, and finish detection"
```

---

## Task 14: State route (reconnect / hydration)

**Files:**
- Create: `src/app/api/challenge/state/route.ts`

**Interfaces:**
- Consumes: `loadPlayerByToken`, `expireIfStale`, `buildStandings`, `db`/`challengeAnswers`.
- Produces: `GET /api/challenge/state?code=&token=` -> full snapshot for the requesting player.

- [ ] **Step 1: Implement the state route**

Create `src/app/api/challenge/state/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { challengeAnswers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { loadPlayerByToken, expireIfStale, buildStandings } from "@/lib/challenge/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = (url.searchParams.get("code") ?? "").trim();
  const token = url.searchParams.get("token") ?? "";
  if (!code || !token) return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });

  const found = await loadPlayerByToken(code, token);
  if (!found) return NextResponse.json({ error: "Neautorizat." }, { status: 403 });
  const { lobby, player } = found;
  await expireIfStale(lobby);

  // Which questions this player already answered, and with what letter, so the UI
  // can render the locked state and resume at the first unanswered question.
  const answers = await db.select({
    questionId: challengeAnswers.questionId,
    selected: challengeAnswers.selected,
    isCorrect: challengeAnswers.isCorrect,
  }).from(challengeAnswers).where(eq(challengeAnswers.playerId, player.id));

  return NextResponse.json({
    status: lobby.status,
    mode: lobby.mode,
    config: lobby.config,
    questionIds: lobby.questionIds ?? null,
    me: {
      playerId: player.id,
      name: player.name,
      isHost: player.isHost,
      questionOrder: player.questionOrder ?? null,
      optionOrder: player.optionOrder ?? null,
      answers,
    },
    standings: await buildStandings(code),
  }, { headers: { "Cache-Control": "no-store" } });
}
```

- [ ] **Step 2: Type-check + smoke test**

Run: `npx tsc --noEmit`. Then `GET /api/challenge/state?code=<CODE>&token=<PLAYER_TOKEN>` and confirm the snapshot includes `me.answers` and `standings`.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/challenge/state/
git commit -m "feat(challenge): state route for reconnect and hydration"
```

---

## Task 15: Client identity store

**Files:**
- Create: `src/lib/challenge/identity.ts`
- Test: `scripts/challenge-identity.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces (DOM-injected for testability):
  - `saveIdentity(storage, code, id: { playerToken?: string; hostToken?: string; name?: string }): void`
  - `loadIdentity(storage, code): { playerToken?: string; hostToken?: string; name?: string } | null`
  - Browser convenience wrappers `savePlayer(code, ...)`, `getIdentity(code)` that pass `window.localStorage`.

- [ ] **Step 1: Write the failing test**

Create `scripts/challenge-identity.test.mjs`:

```js
import process from "node:process";
import assert from "node:assert/strict";
import { saveIdentity, loadIdentity } from "../src/lib/challenge/identity.ts";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

function fakeStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
}

check("round-trips identity per code", () => {
  const s = fakeStorage();
  saveIdentity(s, "ABC", { playerToken: "p1", name: "Ana" });
  assert.deepEqual(loadIdentity(s, "ABC"), { playerToken: "p1", name: "Ana" });
});

check("merges new fields without dropping old ones", () => {
  const s = fakeStorage();
  saveIdentity(s, "ABC", { playerToken: "p1" });
  saveIdentity(s, "ABC", { hostToken: "h1" });
  assert.deepEqual(loadIdentity(s, "ABC"), { playerToken: "p1", hostToken: "h1" });
});

check("isolates codes and returns null when absent", () => {
  const s = fakeStorage();
  saveIdentity(s, "ABC", { playerToken: "p1" });
  assert.equal(loadIdentity(s, "XYZ"), null);
});

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
```

- [ ] **Step 2: Run it to confirm failure**

Run: `node --import ./scripts/register-alias.mjs scripts/challenge-identity.test.mjs`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement identity**

Create `src/lib/challenge/identity.ts`:

```ts
export interface ChallengeIdentity {
  playerToken?: string;
  hostToken?: string;
  name?: string;
}

interface Storageish {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const keyFor = (code: string) => `utm-provocare-${code}`;

export function saveIdentity(storage: Storageish, code: string, id: ChallengeIdentity): void {
  const current = loadIdentity(storage, code) ?? {};
  storage.setItem(keyFor(code), JSON.stringify({ ...current, ...id }));
}

export function loadIdentity(storage: Storageish, code: string): ChallengeIdentity | null {
  const raw = storage.getItem(keyFor(code));
  if (!raw) return null;
  try { return JSON.parse(raw) as ChallengeIdentity; } catch { return null; }
}

// Browser convenience wrappers.
export function savePlayer(code: string, id: ChallengeIdentity): void {
  if (typeof window !== "undefined") saveIdentity(window.localStorage, code, id);
}
export function getIdentity(code: string): ChallengeIdentity | null {
  if (typeof window === "undefined") return null;
  return loadIdentity(window.localStorage, code);
}
```

- [ ] **Step 4: Run it to confirm pass**

Run: `node --import ./scripts/register-alias.mjs scripts/challenge-identity.test.mjs`
Expected: All tests passed.

- [ ] **Step 5: Register + commit**

Append the test to `package.json` `test`, then:

```bash
git add src/lib/challenge/identity.ts scripts/challenge-identity.test.mjs package.json
git commit -m "feat(challenge): per-lobby client identity store"
```

---

## Task 16: Realtime subscription hook

**Files:**
- Create: `src/hooks/useChallengeChannel.ts`

**Interfaces:**
- Consumes: `createPusherClient`, `CHANNELS`, `EVENTS`, event payload types.
- Produces: `useChallengeChannel(code, token)` -> `{ members: {id,name}[], standings: Standing[], lastMilestone: MilestoneEvent | null, status: "started" | "finished" | null }`.

- [ ] **Step 1: Implement the hook**

Create `src/hooks/useChallengeChannel.ts`:

```ts
"use client";
import { useEffect, useRef, useState } from "react";
import { createPusherClient } from "@/lib/realtime/pusher-client";
import { CHANNELS, EVENTS, type Standing, type MilestoneEvent } from "@/lib/realtime/events";

interface Member { id: string; name: string }

export function useChallengeChannel(code: string | null, token: string | null) {
  const [members, setMembers] = useState<Member[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [lastMilestone, setLastMilestone] = useState<MilestoneEvent | null>(null);
  const [status, setStatus] = useState<"started" | "finished" | null>(null);
  const pusherRef = useRef<ReturnType<typeof createPusherClient> | null>(null);

  useEffect(() => {
    if (!code || !token) return;
    const pusher = createPusherClient(token, code);
    pusherRef.current = pusher;
    const channel = pusher.subscribe(CHANNELS.lobby(code));

    const syncMembers = () => {
      const list: Member[] = [];
      // @ts-expect-error pusher-js members has a typed-loose `each`
      channel.members?.each((m) => list.push({ id: m.id, name: m.info?.name ?? "?" }));
      setMembers(list);
    };

    channel.bind("pusher:subscription_succeeded", syncMembers);
    channel.bind("pusher:member_added", syncMembers);
    channel.bind("pusher:member_removed", syncMembers);
    channel.bind(EVENTS.ROUND_STARTED, () => setStatus("started"));
    channel.bind(EVENTS.LEADERBOARD, (p: { standings: Standing[] }) => setStandings(p.standings));
    channel.bind(EVENTS.MILESTONE, (m: MilestoneEvent) => setLastMilestone(m));
    channel.bind(EVENTS.ROUND_FINISHED, (p: { standings: Standing[] }) => { setStandings(p.standings); setStatus("finished"); });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(CHANNELS.lobby(code));
      pusher.disconnect();
    };
  }, [code, token]);

  return { members, standings, lastMilestone, status };
}
```

- [ ] **Step 2: Type-check + commit**

Run: `npx tsc --noEmit` (expect no new errors), then:

```bash
git add src/hooks/useChallengeChannel.ts
git commit -m "feat(challenge): client hook for presence + lobby events"
```

---

## Task 17: Landing + create form

**Files:**
- Create: `src/app/provocare/page.tsx`
- Create: `src/app/provocare/layout.tsx`

**Interfaces:**
- Consumes: `modules`/`questionsBySubject` for the subject picker, `/api/challenge/create`, `savePlayer`.
- Produces: a host config form that POSTs to create and routes to `/provocare/{code}`.

- [ ] **Step 1: Add route metadata**

Create `src/app/provocare/layout.tsx`:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Provocare - Licență UTM",
  description: "Creează o provocare și joacă cu prietenii.",
};

export default function ProvocareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

- [ ] **Step 2: Build the create form**

Create `src/app/provocare/page.tsx`. It reuses the `modules` taxonomy for a subject multi-select and posts the config. (Mirror the styling of `src/app/practica/page.tsx`; the logic is below.)

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { modules } from "@/data/modules";
import { savePlayer } from "@/lib/challenge/identity";

export default function ProvocarePage() {
  const router = useRouter();
  const [hostName, setHostName] = useState("");
  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [shuffleOrder, setShuffleOrder] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [instantFeedback, setInstantFeedback] = useState(true);
  const [capacity, setCapacity] = useState(6);
  const [hostPlays, setHostPlays] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSubject = (id: string) =>
    setSubjectIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  async function createLobby() {
    setError(null);
    if (hostPlays && hostName.trim().length === 0) { setError("Introdu numele tău."); return; }
    if (subjectIds.length === 0) { setError("Alege cel puțin o materie."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/challenge/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          hostName,
          config: { mode: "self_paced", subjectIds, questionCount, shuffleOrder, shuffleOptions, instantFeedback, perQuestionSeconds: null, capacity, hostPlays },
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Eroare."); return; }
      savePlayer(data.code, { hostToken: data.hostToken, playerToken: data.playerToken ?? undefined, name: hostName });
      router.push(`/provocare/${data.code}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Creează o provocare</h1>

      <label className="block mb-4">
        <span className="text-sm font-medium">Numele tău</span>
        <input value={hostName} onChange={(e) => setHostName(e.target.value)} maxLength={20}
          className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2" />
      </label>

      <fieldset className="mb-4">
        <legend className="text-sm font-medium mb-2">Materii</legend>
        <div className="space-y-3">
          {modules.map((m) => (
            <div key={m.id}>
              <p className="text-xs uppercase tracking-wide text-[var(--color-text-tertiary)] mb-1">{m.name}</p>
              <div className="flex flex-wrap gap-2">
                {m.subjects.map((s) => (
                  <button key={s.id} type="button" onClick={() => toggleSubject(s.id)}
                    className={`px-3 py-1.5 rounded-full border text-sm ${subjectIds.includes(s.id) ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)]" : "border-[var(--color-border)]"}`}>
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <label className="block">
          <span className="text-sm font-medium">Întrebări</span>
          <select value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2">
            {[5, 10, 20, 30, 50].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Capacitate</span>
          <select value={capacity} onChange={(e) => setCapacity(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2">
            {[2,3,4,5,6,7,8,9,10].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </div>

      <div className="space-y-2 mb-6 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={shuffleOrder} onChange={(e) => setShuffleOrder(e.target.checked)} /> Amestecă ordinea întrebărilor</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={shuffleOptions} onChange={(e) => setShuffleOptions(e.target.checked)} /> Amestecă variantele de răspuns</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={instantFeedback} onChange={(e) => setInstantFeedback(e.target.checked)} /> Feedback instant după fiecare răspuns</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={hostPlays} onChange={(e) => setHostPlays(e.target.checked)} /> Particip și eu</label>
      </div>

      {error && <p className="text-[var(--color-wrong)] text-sm mb-3">{error}</p>}
      <button onClick={createLobby} disabled={busy}
        className="w-full py-3 rounded-md bg-[var(--color-accent)] text-[#0C0C0E] font-semibold disabled:opacity-60">
        {busy ? "Se creează..." : "Creează provocarea"}
      </button>
    </main>
  );
}
```

(Confirm `modules` is exported from `src/data/modules.ts`; if the export name differs, import the actual export. `--color-accent-muted` and the other tokens are the same ones `QuestionCard` uses.)

- [ ] **Step 3: Verify it renders**

Run the dev server and open `http://localhost:3000/provocare`. Fill the form, submit, and confirm it navigates to `/provocare/{code}` (a 404 page is fine for now; the route is built next).

- [ ] **Step 4: Commit**

```bash
git add src/app/provocare/page.tsx src/app/provocare/layout.tsx
git commit -m "feat(challenge): provocare landing and host create form"
```

---

## Task 18: Lobby shell, join dialog, and waiting room

**Files:**
- Create: `src/app/provocare/[code]/page.tsx`
- Create: `src/components/challenge/JoinDialog.tsx`
- Create: `src/components/challenge/WaitingRoom.tsx`

**Interfaces:**
- Consumes: `getIdentity`/`savePlayer`, `/api/challenge/state`, `/api/challenge/join`, `/api/challenge/start`, `useChallengeChannel`.
- Produces: the page that switches UI by lobby status and player identity. Phase 1 renders: join dialog (no token), waiting room (`lobby`), runtime (`running`, Task 19), results (`finished`, Task 21).

- [ ] **Step 1: Join dialog**

Create `src/components/challenge/JoinDialog.tsx`:

```tsx
"use client";
import { useState } from "react";

export function JoinDialog({ code, onJoined }: { code: string; onJoined: (token: string, name: string) => void }) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function join() {
    setError(null); setBusy(true);
    try {
      const res = await fetch("/api/challenge/join", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ code, name }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Eroare."); return; }
      onJoined(data.playerToken, data.name);
    } finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-[var(--color-bg-secondary)] rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold mb-4">Intră în provocare</h2>
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={20}
          placeholder="Numele tău" onKeyDown={(e) => e.key === "Enter" && join()}
          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 mb-3" />
        {error && <p className="text-[var(--color-wrong)] text-sm mb-2">{error}</p>}
        <button onClick={join} disabled={busy || name.trim().length === 0}
          className="w-full py-2.5 rounded-md bg-[var(--color-accent)] text-[#0C0C0E] font-semibold disabled:opacity-60">
          {busy ? "..." : "Intră"}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Waiting room**

Create `src/components/challenge/WaitingRoom.tsx`:

```tsx
"use client";

interface Member { id: string; name: string }

export function WaitingRoom({ code, members, isHost, capacity, onStart, starting }: {
  code: string; members: Member[]; isHost: boolean; capacity: number; onStart: () => void; starting: boolean;
}) {
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/provocare/${code}` : "";
  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-2">Sala de așteptare</h1>
      <p className="text-sm text-[var(--color-text-tertiary)] mb-4">{members.length}/{capacity} jucători</p>

      <button onClick={() => navigator.clipboard?.writeText(shareUrl)}
        className="w-full mb-5 px-3 py-2 rounded-md border border-dashed border-[var(--color-border-strong)] text-sm text-left truncate">
        {shareUrl} <span className="text-[var(--color-accent)]">(copiază)</span>
      </button>

      <ul className="space-y-2 mb-6">
        {members.map((m) => (
          <li key={m.id} className="px-3 py-2 rounded-md bg-[var(--color-bg-secondary)] text-sm">{m.name}</li>
        ))}
      </ul>

      {isHost ? (
        <button onClick={onStart} disabled={starting || members.length < 1}
          className="w-full py-3 rounded-md bg-[var(--color-accent)] text-[#0C0C0E] font-semibold disabled:opacity-60">
          {starting ? "Se pornește..." : "Începe provocarea"}
        </button>
      ) : (
        <p className="text-center text-sm text-[var(--color-text-tertiary)]">Așteptăm ca gazda să înceapă...</p>
      )}
    </main>
  );
}
```

- [ ] **Step 3: Lobby page shell**

Create `src/app/provocare/[code]/page.tsx`:

```tsx
"use client";
import { use, useEffect, useState, useCallback } from "react";
import { getIdentity, savePlayer } from "@/lib/challenge/identity";
import { useChallengeChannel } from "@/hooks/useChallengeChannel";
import { JoinDialog } from "@/components/challenge/JoinDialog";
import { WaitingRoom } from "@/components/challenge/WaitingRoom";
import { SelfPacedRuntime } from "@/components/challenge/SelfPacedRuntime";
import { ResultsScreen } from "@/components/challenge/ResultsScreen";

interface Snapshot {
  status: string; mode: string; config: { capacity: number; instantFeedback: boolean };
  questionIds: number[] | null;
  me: { playerId: number; name: string; isHost: boolean; questionOrder: number[] | null; optionOrder: Record<number, string[]> | null; answers: { questionId: number; selected: string; isCorrect: boolean }[] };
  standings: { playerId: number; name: string; score: number; rank: number; progress: number; finished: boolean }[];
}

export default function LobbyPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [token, setToken] = useState<string | null>(null);
  const [hostToken, setHostToken] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [needsJoin, setNeedsJoin] = useState(false);
  const [starting, setStarting] = useState(false);

  // Hydrate identity + state on mount.
  useEffect(() => {
    const id = getIdentity(code);
    if (!id?.playerToken && !id?.hostToken) { setNeedsJoin(true); return; }
    setToken(id.playerToken ?? null);
    setHostToken(id.hostToken ?? null);
    const t = id.playerToken ?? id.hostToken!;
    fetch(`/api/challenge/state?code=${code}&token=${encodeURIComponent(t)}`)
      .then((r) => r.json()).then((data) => { if (!data.error) setSnapshot(data); else setNeedsJoin(true); });
  }, [code]);

  const { members, standings, lastMilestone, status } = useChallengeChannel(code, token ?? hostToken);

  // When realtime says the round started/finished, refetch our snapshot.
  const refetch = useCallback(() => {
    const t = token ?? hostToken; if (!t) return;
    fetch(`/api/challenge/state?code=${code}&token=${encodeURIComponent(t)}`).then((r) => r.json()).then((d) => !d.error && setSnapshot(d));
  }, [code, token, hostToken]);
  useEffect(() => { if (status) refetch(); }, [status, refetch]);

  function onJoined(playerToken: string, name: string) {
    savePlayer(code, { playerToken, name });
    setToken(playerToken); setNeedsJoin(false); refetch();
  }

  async function onStart() {
    setStarting(true);
    try {
      await fetch("/api/challenge/start", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code, hostToken }) });
      refetch();
    } finally { setStarting(false); }
  }

  if (needsJoin) return <JoinDialog code={code} onJoined={onJoined} />;
  if (!snapshot) return <main className="p-8 text-center text-sm text-[var(--color-text-tertiary)]">Se încarcă...</main>;

  const liveStandings = standings.length ? standings : snapshot.standings;

  if (snapshot.status === "finished" || status === "finished") {
    return <ResultsScreen standings={liveStandings} meId={snapshot.me?.playerId} />;
  }
  if (snapshot.status === "running" || status === "started") {
    return <SelfPacedRuntime code={code} token={token!} snapshot={snapshot} standings={liveStandings} lastMilestone={lastMilestone} />;
  }
  return <WaitingRoom code={code} members={members} isHost={!!hostToken} capacity={snapshot.config.capacity} onStart={onStart} starting={starting} />;
}
```

- [ ] **Step 4: Verify the waiting room end to end**

Open the lobby link in two browser profiles (one created via Task 17 as host, one fresh). Confirm: the fresh one gets the join dialog, after joining both names appear live in each other's roster (Pusher presence working), and the host sees the Start button.

- [ ] **Step 5: Commit**

```bash
git add src/app/provocare/[code]/page.tsx src/components/challenge/JoinDialog.tsx src/components/challenge/WaitingRoom.tsx
git commit -m "feat(challenge): lobby shell, join dialog, and live waiting room"
```

---

## Task 19: Self-paced runtime

**Files:**
- Create: `src/components/challenge/SelfPacedRuntime.tsx`
- Create: `src/components/challenge/Leaderboard.tsx`

**Interfaces:**
- Consumes: `QuestionCard`, `getQuestion`, `/api/challenge/answer`, `useToast`/`Toast`, `Standing`, `MilestoneEvent`.
- Produces: the play screen. Resumes at the first unanswered question in `me.questionOrder`, locks after answering, shows feedback only if `config.instantFeedback`.

- [ ] **Step 1: Leaderboard component**

Create `src/components/challenge/Leaderboard.tsx`:

```tsx
"use client";
import type { Standing } from "@/lib/realtime/events";

export function Leaderboard({ standings, meId }: { standings: Standing[]; meId?: number }) {
  return (
    <ol className="space-y-1.5">
      {standings.map((s) => (
        <li key={s.playerId}
          className={`flex items-center justify-between px-3 py-2 rounded-md text-sm ${s.playerId === meId ? "bg-[var(--color-accent-muted)] border border-[var(--color-accent)]" : "bg-[var(--color-bg-secondary)]"}`}>
          <span className="flex items-center gap-2 min-w-0">
            <span className="w-5 text-[var(--color-text-tertiary)]">{s.rank}</span>
            <span className="truncate">{s.name}</span>
            {s.finished && <span aria-hidden>🏁</span>}
          </span>
          <span className="flex items-center gap-3">
            <span className="text-[var(--color-text-tertiary)] text-xs">{Math.round(s.progress * 100)}%</span>
            <span className="font-semibold tabular-nums">{s.score}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 2: Self-paced runtime**

Create `src/components/challenge/SelfPacedRuntime.tsx`:

```tsx
"use client";
import { useMemo, useRef, useState, useEffect } from "react";
import { getQuestion } from "@/data";
import { QuestionCard } from "@/components/practice/QuestionCard";
import { Leaderboard } from "./Leaderboard";
import type { AnswerKey } from "@/data/types";
import type { Standing, MilestoneEvent } from "@/lib/realtime/events";

interface Props {
  code: string; token: string;
  snapshot: {
    config: { instantFeedback: boolean };
    me: { playerId: number; questionOrder: number[] | null; optionOrder: Record<number, string[]> | null; answers: { questionId: number; selected: string; isCorrect: boolean }[] };
  };
  standings: Standing[];
  lastMilestone: MilestoneEvent | null;
}

export function SelfPacedRuntime({ code, token, snapshot, standings, lastMilestone }: Props) {
  const order = useMemo(() => snapshot.me.questionOrder ?? [], [snapshot.me.questionOrder]);
  const answered = useMemo(() => new Map(snapshot.me.answers.map((a) => [a.questionId, a])), [snapshot.me.answers]);

  const firstUnanswered = order.findIndex((id) => !answered.has(id));
  const [index, setIndex] = useState(firstUnanswered === -1 ? order.length : firstUnanswered);
  const [selected, setSelected] = useState<AnswerKey | null>(null);
  const [feedback, setFeedback] = useState<{ correctAnswer?: string; explanation?: string | null } | null>(null);
  const startRef = useRef<number>(Date.now());
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { startRef.current = Date.now(); setSelected(null); setFeedback(null); }, [index]);
  useEffect(() => { if (lastMilestone) { setToast(lastMilestone.text); const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); } }, [lastMilestone]);

  if (index >= order.length) {
    return (
      <main className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-4">Ai terminat! Așteptăm ceilalți jucători...</h1>
        <Leaderboard standings={standings} meId={snapshot.me.playerId} />
      </main>
    );
  }

  const questionId = order[index];
  const question = getQuestion(questionId);
  if (!question) { setIndex((i) => i + 1); return null; }
  const optionOrder = (snapshot.me.optionOrder?.[questionId] as AnswerKey[] | undefined) ?? undefined;

  async function submit(answer: AnswerKey) {
    if (selected) return;
    setSelected(answer);
    const timeMs = Date.now() - startRef.current;
    const res = await fetch("/api/challenge/answer", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ code, token, questionId, selected: answer, timeMs }),
    });
    const data = await res.json();
    if (snapshot.config.instantFeedback && data.recorded) {
      setFeedback({ correctAnswer: data.correctAnswer, explanation: data.explanation });
    } else {
      advance();
    }
  }

  function advance() { setIndex((i) => i + 1); }

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      {toast && <div className="fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm shadow-lg z-50">{toast}</div>}

      <QuestionCard
        question={question}
        questionNumber={index + 1}
        totalQuestions={order.length}
        selectedAnswer={selected}
        showFeedback={!!feedback}
        isBookmarked={false}
        onSelectAnswer={submit}
        optionOrder={optionOrder}
      />

      {feedback && (
        <button onClick={advance} className="mt-4 w-full py-3 rounded-md bg-[var(--color-accent)] text-[#0C0C0E] font-semibold">
          {index + 1 >= order.length ? "Vezi rezultatele" : "Următoarea întrebare"}
        </button>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-[var(--color-text-tertiary)] mb-2">Clasament</h2>
        <Leaderboard standings={standings} meId={snapshot.me.playerId} />
      </section>
    </main>
  );
}
```

(`QuestionCard` shows correctness from `question.correctAnswer` whenever `showFeedback` is true, so passing `showFeedback={!!feedback}` gives instant feedback for free, and omitting `onBookmark`/`onRetry` gives the no-redo UI.)

- [ ] **Step 3: Play through a round**

With two players in a started lobby, answer questions in both. Confirm: questions lock after answering, instant feedback shows the correct option when enabled, the leaderboard updates live in both windows, and milestone toasts appear (for example a "50%" or "a terminat" toast).

- [ ] **Step 4: Commit**

```bash
git add src/components/challenge/SelfPacedRuntime.tsx src/components/challenge/Leaderboard.tsx
git commit -m "feat(challenge): self-paced runtime with live leaderboard and feedback"
```

---

## Task 20: Results screen

**Files:**
- Create: `src/components/challenge/ResultsScreen.tsx`

**Interfaces:**
- Consumes: `Standing`, `Leaderboard`.
- Produces: final podium view shown when status is `finished`.

- [ ] **Step 1: Build the results screen**

Create `src/components/challenge/ResultsScreen.tsx`:

```tsx
"use client";
import Link from "next/link";
import { Leaderboard } from "./Leaderboard";
import type { Standing } from "@/lib/realtime/events";

export function ResultsScreen({ standings, meId }: { standings: Standing[]; meId?: number }) {
  const winner = standings[0];
  return (
    <main className="max-w-md mx-auto px-4 py-10 text-center">
      <h1 className="text-2xl font-bold mb-1">Rezultate finale</h1>
      {winner && <p className="text-[var(--color-accent)] font-semibold mb-6">Câștigător: {winner.name}</p>}
      <div className="text-left mb-8"><Leaderboard standings={standings} meId={meId} /></div>
      <Link href="/provocare" className="inline-block px-5 py-2.5 rounded-md bg-[var(--color-accent)] text-[#0C0C0E] font-semibold">
        Provocare nouă
      </Link>
    </main>
  );
}
```

- [ ] **Step 2: Verify the finish flow**

Finish every player's questions in a lobby. Confirm both clients flip to the results screen (driven by the `round-finished` event) and the winner is the top-ranked player.

- [ ] **Step 3: Commit**

```bash
git add src/components/challenge/ResultsScreen.tsx
git commit -m "feat(challenge): final results screen"
```

---

## Task 21: Navigation entry point and full verification

**Files:**
- Modify: the app's primary navigation (find the existing nav, for example `src/components/layout/` or the home page CTA area) to add a "Provocare" link to `/provocare`.

**Interfaces:**
- Consumes: existing nav/home components.
- Produces: a discoverable entry point.

- [ ] **Step 1: Find the navigation**

Run: `grep -rn "practica\|simulator\|antrenament" src/components src/app --include=*.tsx -l`
Expected: the nav/home files that list the existing runtimes.

- [ ] **Step 2: Add the link**

Add a "Provocare" entry alongside the existing runtime links, matching their styling and using the route `/provocare`. (Copy: `Provocare`.)

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: all suites pass, including the six new `challenge-*` suites.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no new errors.

- [ ] **Step 5: Production build**

Run: `npx dotenv -e .env.local -- npm run build`
Expected: build succeeds (needs `DATABASE_URL`, present in `.env.local`).

- [ ] **Step 6: Final end-to-end pass**

With two browser profiles: create a lobby, share the link, join, start, play to completion, and confirm the live leaderboard, milestone toasts, reconnect (refresh mid-round and confirm you resume with score intact), and final results all work.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(challenge): navigation entry point for Provocare"
```

---

## Phase 2 preview (separate plan, not built here)

Lockstep mode layers onto this foundation: server-timestamped questions (`questionStartedAt`), a synchronized countdown, a host console, the `/advance` reveal route with idempotent compare-and-set on `currentIndex`, speed-weighted scoring in `scoring.ts`, and the `question-advanced` / `question-revealed` events (already named in `events.ts`). The data model and adapters are already in place for it.

---

## Self-Review

**1. Spec coverage:**
- Identity / no accounts -> Tasks 3, 15, 18. Covered.
- Lobby lifecycle (lobby/running/finished/expired) -> Tasks 2, 9, 12, 13; lazy expiry in `server.ts` (Task 9). Covered.
- Host config (scope, count, shuffle, instant feedback, capacity, host plays) -> Tasks 8, 17. Covered. (Per-question timer is lockstep-only, deferred to Phase 2; self-paced passes `perQuestionSeconds: null`.)
- Join-by-link with name popup -> Tasks 10, 18. Covered.
- Self-paced runtime + no redo -> Tasks 13 (DB unique constraint), 19. Covered.
- Live leaderboard + ranking -> Tasks 6, 19. Covered.
- Milestones -> Tasks 7, 13, 19. Covered.
- Realtime via Pusher behind adapter -> Tasks 1, 11, 16. Covered.
- Server-authoritative state in Neon -> Tasks 2, 9-14. Covered.
- Reconnect -> Tasks 14, 18. Covered.
- Results page -> Task 20. Covered.
- Security/rate limits/abuse caps -> Tasks 4, 9, 10, 13. Covered.

**2. Placeholder scan:** No "TBD/TODO/handle edge cases" placeholders; each code step shows real code. Two intentional deferrals (lockstep, per-question timer) are explicitly scoped to Phase 2, not left vague.

**3. Type consistency:** `Standing`/`MilestoneEvent` defined once in `events.ts` and reused everywhere. `PlayerRow` defined in `scoring.ts` and consumed by `server.ts`. `ChallengeConfig` defined in `types.ts`, produced by `validation.ts`, consumed by routes. Event names come only from `EVENTS`. Function names (`pickChallengeQuestionIds`, `buildPlayerOrder`, `rankPlayers`, `detectMilestones`, `loadPlayerByToken`, `buildStandings`, `publishToLobby`, `createPusherClient`, `useChallengeChannel`, `saveIdentity`/`loadIdentity`) match across producing and consuming tasks.

**Open follow-ups noted for the engineer:** confirm the exact export name of `modules` from `src/data/modules.ts` and the precise nav file in Task 21 (both flagged inline with a `grep`).
