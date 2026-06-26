# Challenge Mode ("Provocare") - Design Spec

Date: 2026-06-26
Status: Approved (ready for implementation planning)
Working name: Provocare (final Romanian wording TBD: Provocare / Concurs / Versus)

## 1. Summary

A multiplayer challenge feature for the UTM exam-prep app. Anyone can create a lobby,
configure a quiz drawn from the existing question bank, and share a link. Friends join
with just a name (no accounts), play, and watch a live leaderboard with milestone
popups. The host picks one of two round shapes per lobby:

- **Lockstep (Kahoot-style):** everyone sees the same question at the same time on a
  countdown; the host advances; speed-weighted scoring.
- **Self-paced race:** everyone gets the same set and races at their own speed; live
  leaderboard and milestone toasts as people progress.

Capacity is host-set from 2 to 10 players (hard max 10). Answers lock once committed
(no redo), enforced server-side.

## 2. Goals and non-goals

### Goals
- Create/share a lobby via a short link, join with only a name.
- Host configures scope (modules/subjects), question count, randomization, instant
  feedback, per-question timer, and capacity.
- Two interchangeable round modes (lockstep and self-paced), chosen by the host.
- Honest, live leaderboard and milestone notifications.
- Reconnect-safe: a refresh or dropped connection rejoins the same seat with score intact.
- Reuse the existing question rendering, shuffling, scoring scope UI, and toast system.

### Non-goals (YAGNI)
- Accounts, profiles, or persistent per-user identity across lobbies.
- Cross-lobby global rankings or long-term history.
- Chat, teams, reactions/emotes, spectators beyond the host.
- Hard anti-cheat (cannot prevent a second device or a web search).

## 3. Foundational decisions (settled during brainstorming)

1. **Two round modes, host's choice:** lockstep and self-paced share one lobby, config,
   and leaderboard.
2. **Realtime transport: a managed service (Pusher Channels), behind a thin adapter**
   so the provider is swappable (Ably is a drop-in alternative). Presence channels give
   the live roster and join/leave events for free.
3. **State is server-authoritative in Neon.** Every answer is recorded server-side and
   scores are computed server-side. Pusher only carries "something changed" pushes. This
   buys an honest leaderboard, reconnect safety, and a durable results page.

### Architectural keystone
The ~705 questions are already bundled client-side (`src/data`). The realtime layer and
the DB therefore only ever move **question IDs, answer letters, scores, and small
events**, never question text. This mirrors the existing exam model (which stores
`questionIds`, not content) and keeps every payload and row tiny.

## 4. Identity (no accounts)

A player is a **name plus a secret token**.

- On join, the server creates a player row and returns a `playerToken`, stored in
  `localStorage` keyed by lobby code.
- Reopening the link with a valid token silently rejoins the same seat with score intact.
- The host additionally holds a `hostToken` granting start/advance/kick rights.
- Names are unique within a lobby, validated and sanitized with the existing display-name
  rules, capped shorter (20 chars) for leaderboard legibility.
- Tokens are crypto-random capability tokens, stored only as SHA-256 hashes (reusing the
  `hashIp` pattern), so a DB read leak does not expose live tokens.

## 5. Lobby lifecycle

States: `lobby` (waiting room) -> `running` -> `finished`, plus `expired`.

- Host creates a lobby and receives a short **code + shareable link** (`/provocare/{code}`,
  reusing `generateSaveKey`).
- Opening the link:
  - No token for this lobby -> name popup -> join the waiting room.
  - Valid token -> rejoin at the current state.
- The waiting room shows the **live roster** (Pusher presence) and the host's settings.
- Capacity host-set 2 to 10 (hard max 10). If the host plays, they occupy a seat.
- **Expiry:** lazy. On access, a lobby abandoned for >3h becomes `expired`; finished
  results stay readable by code for ~7 days. An optional nightly `CronCreate` purge is a
  later enhancement.

## 6. Host configuration

Set at creation:

- **Mode:** lockstep or self-paced.
- **Scope:** which modules and/or subjects to draw from. Note: the data model is 4
  modules -> 15 subjects with no third level, so the user-facing "submodules" are the 15
  subjects. Reuse the practica/simulator subject-picker UI.
- **Question count:** 10 / 20 / 30 / custom, capped at 50 for a live game.
- **Randomize:** shuffle question order and/or answer options (reuse `buildOptionOrders`).
  When order shuffle is on, self-paced gives each player their own order so neighbors
  cannot copy.
- **Instant feedback:** on/off. Self-paced: shows correct/incorrect + explanation right
  after each answer. Lockstep: the per-question reveal always shows correctness; the
  toggle controls whether the explanation is shown at reveal.
- **Per-question timer:** required for lockstep (for example 20s), optional for self-paced.
- **Host plays or just runs it:** host's choice.

**No-redo is a fixed rule, not a toggle.** Once an answer is committed it locks, enforced
by a `unique(playerId, questionId)` DB constraint.

## 7. Play modes

### 7.1 Self-paced race
- Host hits Start; everyone gets the same set and races at their own speed.
- Answer -> locks -> (if instant feedback) correct/incorrect + explanation -> next.
- Live leaderboard ranks by correct count, tiebreak by less total time.
- Milestone toasts to everyone: progress crossings (25/50/75/100%), first-to-finish,
  finish events, lead changes/overtakes.
- Finishers see a live standings screen while others continue.
- Round ends when all finish, the host ends it, or an optional overall timer expires.

### 7.2 Lockstep (Kahoot)
- Host Start -> 3-2-1 countdown -> Question 1 to everyone at once with a countdown timer.
- Players answer within the timer (locked, correctness hidden).
- When the timer ends or everyone has answered, the server reveals: correct option
  highlighted, who got it, points awarded.
- **Speed-weighted scoring** (faster correct answers earn more), which is why this mode
  relies on the server-authoritative `questionStartedAt` timestamp.
- An interstitial top-5 leaderboard shows between questions; the host advances, with an
  auto-advance fallback at timer end.
- Final question -> podium.

## 8. Scoring and leaderboard

- **Self-paced score** = correct count; tiebreak = less total time.
- **Lockstep score** = sum of speed-weighted points per correct answer.
- Leaderboard is a live list (rank, name, score, progress, "you" highlighted), pushed via
  Pusher as a compact standings snapshot.
- Milestones are discrete, low-volume events computed server-side and surfaced through the
  existing `useToast` system.
- At expected scale (roughly 50 lobbies/day x ~200 answers = ~10k messages/day, vs
  Pusher's ~200k/day free tier) no throttling is required; batching is a later
  optimization only.

## 9. Data model (3 new Neon tables, Drizzle)

### `challenge_lobbies`
- `code` varchar(24) PK (reuse `generateSaveKey`)
- `hostTokenHash` varchar(64) (SHA-256)
- `mode` varchar: `lockstep` | `self_paced`
- `status` varchar: `lobby` | `running` | `finished` | `expired`
- `config` jsonb: subjectIds, count, shuffleOrder, shuffleOptions, instantFeedback,
  perQuestionSeconds, capacity, hostPlays
- `questionIds` jsonb (chosen ordered set, written at Start)
- `currentIndex` integer (lockstep pointer)
- `questionStartedAt` timestamptz (lockstep timer + speed-scoring anchor)
- `ipHash` varchar(64), `createdAt`, `startedAt`, `finishedAt`, `updatedAt` timestamptz

### `challenge_players`
- `id` PK, `lobbyCode` FK (indexed)
- `playerTokenHash` varchar(64) (indexed)
- `name`, `isHost` boolean
- `score` numeric, `correctCount` int, `answeredCount` int, `totalTimeMs` int
- `finishedAt` timestamptz nullable
- `questionOrder` jsonb (per-player shuffle), `optionOrder` jsonb
- `joinedAt`, `lastSeenAt` timestamptz, `status` varchar

### `challenge_answers`
- `id` PK, `lobbyCode`, `playerId` (indexed), `questionId`
- `selected` varchar (a|b|c|d), `isCorrect` boolean, `timeMs` int, `pointsAwarded` numeric
- `answeredAt` timestamptz
- **`unique(playerId, questionId)`** (enforces no-redo, catches race conditions)

## 10. API routes (`app/api/challenge/*`, server-authoritative)

- `POST /create` - host builds lobby from config -> `{ code, hostToken, playerToken? }`.
  Rate-limited, per-IP lobby cap.
- `POST /join` - `{ code, name }` -> creates player -> `{ playerToken, playerId, snapshot }`.
  Rejects if full or already started.
- `POST /start` - host only -> picks `questionIds` (reusing scope/shuffle logic), builds
  per-player orders, sets `running`, publishes `round-started`.
- `POST /answer` - `{ playerToken, questionId, selected }` -> validates the question is in
  the player's set, is active (lockstep), and unanswered (unique constraint catches
  races); computes `isCorrect`/points; updates aggregates; publishes leaderboard + any
  milestone. Returns feedback only if instant feedback is on (lockstep withholds
  correctness until reveal).
- `POST /advance` - lockstep reveal + next. **Idempotent compare-and-set on `currentIndex`**:
  the host normally drives it, but any client may trigger it after the timer (+grace) if
  the host drops. Publishes `question-revealed` then `question-advanced`.
- `GET /state?code=&token=` - full snapshot for reconnect.
- `POST /pusher/auth` - signs presence/private channel subscriptions after verifying the
  player token.
- Optional: `POST /leave`, `POST /kick` (host).

## 11. Realtime (Pusher channels and events)

- **`presence-lobby-{code}`** - membership is the live roster; join/leave events drive the
  waiting room with no extra code.
- Server-published events (plain HTTP calls to Pusher's REST API from the route, so
  serverless-safe, no long-lived server connection):
  - `round-started`
  - `question-advanced` (index + `questionStartedAt` + seconds)
  - `question-revealed` (correct letter + standings)
  - `leaderboard` (compact standings snapshot)
  - `milestone` (type + text)
  - `round-finished` (podium)
- **Lockstep timing without a server clock:** the question carries `questionStartedAt`;
  clients compute remaining time against it, using a small server-time offset captured
  from the event so countdowns line up. Reveal converges on the idempotent `/advance` from
  the host's auto-advance at 0, the host's manual click, or the any-client fallback.

## 12. Reconnect / hydration

`playerToken` lives in `localStorage` keyed by lobby code. On loading `/provocare/{code}`:
token present -> `GET /state` rebuilds everything (score, which questions are locked and
the selections made, the leaderboard, and for lockstep the current question with correct
remaining time); no token -> the name popup. The host's `hostToken` restores the host
console the same way.

## 13. Security and abuse

- **Rate limits:** new `RATE_LIMITS` entries for create/join/answer (answer generous since
  it is gameplay), reusing `checkRateLimit` + `hashIp`.
- **Per-IP lobby cap** (mirroring `MAX_SESSIONS_PER_IP`).
- **Tokens** crypto-random, stored hashed; host actions verify `hostTokenHash` + code.
- **Input validation:** letter in a-d, questionId in the player's set, name sanitized via
  existing rules, content-length capped on bodies.
- **No-redo** enforced by the DB uniqueness constraint, not just UI.

## 14. Reuse vs new

### Reuse
- `QuestionCard` (add `locked` / challenge-feedback props)
- `buildOptionOrders`, `orderedOptionKeys`, `shuffleArray`
- subject/module picker UI from practica/simulator
- `generateSaveKey` + crypto helpers
- `checkRateLimit`, `RATE_LIMITS`, validation patterns
- `useToast` (milestones)
- bundled question index (`allQuestions`, `questionMap`, `questionsBySubject`)

### New
- `lib/challenge/{types,scoring}.ts`
- `lib/realtime/pusher.ts` (thin, swappable adapter)
- the 3 Drizzle tables
- `app/api/challenge/*` routes
- UI under `app/provocare/*` and `components/challenge/*`

## 15. Build order (both modes ship; this is sequence only)

- **Phase 1 - Self-paced (de-risks all new plumbing):** tables, create/join, presence
  roster, host config, self-paced runtime, leaderboard, milestones, reconnect, results
  page. Exercises every new system (DB, Pusher publish/subscribe/presence, tokens,
  reconnect) end to end.
- **Phase 2 - Lockstep on that foundation:** countdown, server-timestamped questions,
  reveal, speed scoring, host console, auto-advance + fallback.

## 16. Open items to confirm during planning

- Final Romanian feature name and route word (Provocare vs Concurs vs Versus).
- Exact speed-scoring formula for lockstep (base points + how time discount is curved).
- Whether self-paced gets an optional overall round timer in Phase 1 or later.
- Pusher's precise free-tier message accounting (verify against the chosen plan before
  launch; current estimate sits far under the limit regardless).
