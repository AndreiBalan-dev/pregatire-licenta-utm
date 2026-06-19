# Antrenament: unlimited adaptive practice mode (v2.1.0)

Status: approved design, pending spec review
Date: 2026-06-19

## Summary

A new mode, **Antrenament** (Training), where the user picks a scope (everything,
a module, or a single subject) and answers questions in a continuous, never-ending
stream with instant feedback. A lightweight spaced-repetition scheduler brings
wrong answers back sooner and correct answers back later (but never stops showing
them). Strength is remembered across days. The user ends whenever they want and
gets a deduplicated summary with a "redo your mistakes" hand-off into the existing
practice flow. Every answer flows through the existing `answerQuestion()` so it
counts toward all global stats automatically.

This ships as **v2.1.0** with a refreshed one-time "what's new" popup (the Algebo.ai
vote section is preserved unchanged).

## Goals

- Endless, scope-scoped drilling with instant feedback + explanations.
- A scheduler that favors weak/wrong questions and spaces out strong/correct ones,
  without ever fully retiring a question.
- Cross-session memory of per-question strength ("remembers across days").
- Answers count toward the same stats as Practica and Simulator.
- A deduplicated end-of-session summary + "redo mistakes".
- A refreshed launch popup that keeps the Algebo.ai vote ask.

## Non-goals (YAGNI)

- No day/time-based scheduling (no SM-2 due-dates in calendar time).
- No per-question history beyond a single strength value (the "box").
- No new nav-bar / mobile-nav entry for launch (home card + popup CTA are enough).
- No server-side scheduler; everything is client-side in `localStorage`.

## Decisions already made

1. **Algorithm memory: remembers across days.** A small per-question strength is
   persisted and carries across sessions.
2. **Placement: a dedicated mode named "Antrenament"** at `/antrenament`, with its
   own streaming runtime, separate from `/practica`.

## Data model

### Reversal from the verbal design: stay on `version: 1`

The verbal design said "bump the schema to `version: 2` with a safe migration."
After reading the loader and validator, bumping is the **riskier** path:

- `src/hooks/useSession.ts` `loadSession()` does `if (parsed.version !== 1) return
  createDefaultSession();` - so a v2 bump would silently wipe every existing user's
  saved progress unless the guard is also changed.
- `src/lib/validation.ts` rejects `sd.version !== 1` ("Versiune incompatibila"), so
  a v2 bump would break the server save/share-by-key feature unless validation is
  also changed.

Instead we keep `version: 1` and add two **optional** fields. This is additive,
needs zero migration, and `validation.ts` needs **no change** (it ignores unknown
fields, exactly as it already ignores `currentPractice`). The JSON size check still
covers the new fields, which are tiny.

### Additions to `LocalSession` (`src/lib/session-types.ts`)

```ts
interface LocalSession {
  version: 1; // unchanged
  // ...existing fields...

  /** Persistent per-question strength (box level 0..5). Carries across sessions. */
  trainingBoxes?: Record<number, number>;

  /** The active unlimited-training session, or null. Mirrors currentPractice. */
  currentTraining?: TrainingState | null;
}
```

`createDefaultSession()` initializes `trainingBoxes: {}` and `currentTraining: null`.
Because `loadSession()` spreads `{ ...defaults, ...parsed }`, existing v1 sessions
automatically receive the defaulted new fields. Add a small `clampLoadedBoxes()`
(coerce to integers in `0..5`, drop anything else) mirroring the existing
`clampLoadedAnswers()`, for robustness against corrupted storage. All consumers read
`session.trainingBoxes ?? {}` and `session.currentTraining ?? null` defensively, so
sessions imported from the old server format (which lack these keys) are safe.

### New type: `TrainingState` (`src/lib/session-types.ts`)

```ts
interface TrainingState {
  subjectIds: string[];                 // chosen scope
  pool: number[];                       // all in-scope question ids, in introduction order
  due: Record<number, number>;          // qid -> absolute seq target (session-local schedule)
  seq: number;                          // questions answered so far this session
  currentQuestionId: number;            // the question currently on screen
  lastQuestionId: number | null;        // dedup: never pick this as the immediate next
  seenIds: number[];                    // unique qids shown this session (deduped summary + redo)
  answeredCount: number;
  correctCount: number;
  startedAt: string;
  shuffleOptions: boolean;
  optionOrder?: Record<number, AnswerKey[]>; // built lazily per question when shuffleOptions
}
```

`due`, `seq`, `pool`, and `optionOrder` are session-local (discarded when the session
ends). Only `trainingBoxes` survives across sessions. Persisting `pool` + `due` makes
the active session fully resumable after a refresh (the page reads `currentTraining`,
exactly like `/practica/[sessionId]` reads `currentPractice`).

## The scheduler (`src/lib/training.ts`, pure + unit-tested)

A Leitner-lite scheduler whose intervals are measured in "questions from now," not
calendar time. All logic is pure functions with no React/`localStorage` access, tested
in `scripts/training.test.mjs` (matching `practice.ts` / `redo.ts` / `redo-scope.ts`).

### Strength: box 0..5

| Box | Meaning | Interval (questions until due again) |
|----|---------|------|
| 0 | just answered wrong (weakest) | 2 |
| 1 | new, or 1 right after a miss | 4 |
| 2 | seeded-correct | 8 |
| 3 | | 16 |
| 4 | **mastered** | 32 |
| 5 | rock solid | 50 (capped; still cycles, never retired) |

`INTERVALS = [2, 4, 8, 16, 32, 50]` (the "feel" knob; tunable).

### Seeding from existing history (free, no data migration)

`seedBox(qid)`:
- `trainingBoxes[qid]` if present (persistent strength), else
- if an answer exists in `session.answers[qid]`: correct -> box 2, wrong -> box 0, else
- never answered -> box 1.

At session start, `due` is seeded for the whole pool:
- previously-seen questions (box from `trainingBoxes`/history): `due[qid] = INTERVALS[seedBox]`
  (small -> they surface early as a review backlog: prior wrong first, prior correct later).
- never-seen questions: introduced on a trickle, `due[qid] = (introIndex + 1) * NEW_SPACING`
  where `introIndex` is the question's position in `pool` and `NEW_SPACING` (~3) controls how
  fast new material is introduced versus re-drilling. This is what keeps new questions flowing
  in instead of flooding all at once, while letting freshly-wrong questions outrank
  not-yet-introduced ones.

`pool` order is natural, or shuffled when the user enables "Amesteca raspunsurile"/order
shuffle at launch.

### Selection (pick next)

`pickNext(state, boxes)`:
1. Candidate set = `pool` minus `lastQuestionId` (dedup; skip the exclusion only if it is
   the single remaining candidate).
2. Choose the candidate with the **smallest `due`** (most overdue / soonest due).
3. Tie-break: lower box first (weaker = more urgent), then least-recently-seen, then stable
   `pool` order.

Because intervals are >= 2, a question can never recur until at least its box interval has
passed, so repeats are always spaced; combined with the `lastQuestionId` exclusion there are
never back-to-back repeats.

### On answer

`applyTrainingAnswer(state, boxes, qid, isCorrect)`:
- `newBox = isCorrect ? min(box + 1, 5) : 0`.
- `boxes[qid] = newBox` (persisted strength updated).
- `due[qid] = seq + INTERVALS[newBox]`.
- `seq += 1`; update `answeredCount`, `correctCount`, `seenIds` (unique), `lastQuestionId`.
- compute the next `currentQuestionId` via `pickNext`.

### Mastery signal

`masteredCount(pool, boxes, answers)` = count of pool questions whose effective box
(`seedBox(qid)`, which falls back to history) is `>= 4`. Drives the header "Stapanite: X / Y"
so an endless mode still shows the scope getting greener.

### Tuning knobs to finalize during implementation (validated by tests)

- `INTERVALS` values.
- `NEW_SPACING` (new-material introduction rate).
- mastery threshold (box `>= 4`).
- Tests must assert: a freshly-wrong question reappears within a small bounded number of
  questions even with unseen material remaining; no back-to-back repeats; correct answers
  push a question further out; a fully-correct question still recurs (never retired); seeding
  from history front-loads prior weak spots.

## Session hook additions (`src/hooks/useSession.ts`)

New actions, mirroring the practice actions:

- `startTraining(subjectIds, { shuffleOrder, shuffleOptions }) : string` - builds the `pool`
  from `questionsBySubject` for the scope, seeds `due`, picks the first `currentQuestionId`,
  sets `currentTraining`, returns a UUID for the URL (same pattern as `startPractice`).
- `answerTraining(questionId, selected, isCorrect, timeSpentMs, subjectId)` - in a single
  `setSession` updater: applies the existing answer/subject-stat delta logic **and** the
  `trainingBoxes` + `currentTraining` updates, so stats and strength stay atomic.
- `endTraining()` - sets `currentTraining = null`.

To avoid the answer/stat delta logic drifting between practice and training, extract the
existing per-answer mutation in `answerQuestion` into a small pure helper
`applyAnswerToSession(prev, qid, selected, isCorrect, timeSpentMs, subjectId)` and call it
from both `answerQuestion` and `answerTraining`. This is a targeted refactor of code we are
already touching, not a speculative one.

Selectors: `getTrainingProgress()` returning `{ answeredCount, correctCount, accuracy,
masteredCount, poolSize }` for the header and summary.

## Streaming runtime (`src/app/antrenament/[sessionId]/page.tsx`)

Mirrors `/practica/[sessionId]/page.tsx`; reads `session.currentTraining` (redirects to
`/antrenament` if none). Reuses `QuestionCard`, `ExplanationPanel`, and `Modal`.

- **Header:** scope label, live counter ("47 raspunse - 81% corecte"), "Stapanite: X / Y",
  and an **"Incheie"** button.
- **Flow:** show `currentQuestionId` -> user picks (locks) -> instant feedback + explanation
  (training is always instant-feedback) -> **"Urmatoarea"** -> `answerTraining` already
  computed the next question. Forward-only stream: no prev/next index, no dot navigation.
- The QuestionCard "Reincearca" affordance is **not** wired in training (getting it wrong
  already schedules it to return soon via box 0; re-answering would distort stats/strength).
- Answer-option shuffle uses the existing `buildOptionOrders`, built lazily per question into
  `currentTraining.optionOrder` when `shuffleOptions` is on.

## Entry + scope selection (`src/app/antrenament/page.tsx` + `layout.tsx`)

- `/antrenament` landing reuses the existing **`SubjectSelector`** (everything / module /
  subject) plus the order/answer shuffle toggle. "Incepe Antrenamentul" -> `startTraining` ->
  navigate to `/antrenament/[sessionId]`. If `currentTraining` already exists, show
  **"Continua antrenamentul"** instead.
- `layout.tsx` provides page metadata, mirroring `src/app/practica/layout.tsx`.
- A new **`TrainingCTA`** card on the home page (`src/app/page.tsx`), styled after
  `ExamSimulatorCTA`, links to `/antrenament`.

## Ending + summary + redo (deduplicated)

"Incheie" opens a summary modal (reusing the existing summary styling). It reports **unique**
questions seen (`seenIds`), accuracy on the latest attempt per question, and how many are now
mastered. The wrong list is `seenIds` filtered to questions whose **latest** answer is wrong
(deduped to one entry per question). "Refa greselile" hands those ids to the **existing**
redo/practice flow (`startPractice` in `mode: "practice"`, optionally via the existing
`redo-scope.ts` scope filtering), so scope filtering and dedup come for free. Footer:
"Inapoi" / "Rezultate". Ending clears `currentTraining` (strength in `trainingBoxes` is kept).

## Stats integration

Free: `answerTraining` reuses the same answer + `subjectStats` mutation as `answerQuestion`,
so `buildMergedAnswerMap`, the Rezultate page, and the Practica per-subject progress all
include training answers with no extra work.

## Launch popup (`src/components/home/WhatsNewModal.tsx` + `WhatsNewGate.tsx`)

- Bump the gate's `localStorage` key `utm-whatsnew-v200` -> `utm-whatsnew-v210` so the popup
  shows once to returning users.
- Replace the feature section with the Antrenament announcement; **leave the
  "Multumesc pentru voturi" / Algebo.ai vote section's existing markup untouched.**
- New feature copy (UI diacritics style):
  > **Antrenament nelimitat, cu un algoritm care invata ce gresesti**
  > Alegi tot, un modul sau o singura materie si raspunzi in continuu. Intrebarile gresite
  > revin mai des, cele stiute mai rar (dar tot revin), ca sa exersezi exact unde trebuie.
  > Te opresti cand vrei, iar tot ce raspunzi intra in statisticile tale.
  > CTA: **Incepe Antrenamentul** -> `/antrenament`

(The exact diacritics are applied in the JSX; this doc omits them for portability.)

## Version bump (v2.1.0)

Per the repo's no-diacritics changelog style and no em dashes:

- `src/lib/site-config.ts`: `APP_VERSION = "2.1.0"`.
- `src/app/noutati/page.tsx`: new `changelog` entry at index 0:
  - title: "Antrenament nelimitat cu algoritm care invata ce gresesti"
  - date: release day (e.g. "19 Iunie 2026")
  - changes:
    - feature: "Mod nou de Antrenament: alegi tot, un modul sau o singura materie si raspunzi
      in continuu, fara limita de intrebari, pana vrei tu sa te opresti"
    - feature: "Algoritmul tine minte de la o zi la alta: intrebarile gresite revin mai des,
      cele stiute revin mai rar (dar tot revin), ca sa exersezi unde stai mai prost"
    - improvement: "Vezi cate intrebari ai stapanit din materiile alese si cat de bine
      raspunzi pe parcurs; la final poti relua doar greselile, cu deduplicare"
    - improvement: "Tot ce raspunzi la Antrenament intra in aceleasi statistici ca Practica
      si Simulatorul"
- `src/components/home/ChangelogBanner.tsx`: replace `recentChanges` with 3 bullets:
  - "Mod nou de Antrenament nelimitat: alegi tot, un modul sau o materie si exersezi in continuu"
  - "Algoritm care invata ce gresesti: greselile revin mai des, cele stiute mai rar, de la o zi la alta"
  - "Tot ce raspunzi intra in aceleasi statistici ca Practica si Simulatorul"

## Files to create / modify

Create:
- `src/lib/training.ts` - pure scheduler (boxes, intervals, seeding, pickNext, applyTrainingAnswer, masteredCount).
- `scripts/training.test.mjs` - unit tests for the scheduler.
- `src/app/antrenament/page.tsx` - landing + scope selection.
- `src/app/antrenament/layout.tsx` - metadata.
- `src/app/antrenament/[sessionId]/page.tsx` - streaming runtime.
- `src/components/home/TrainingCTA.tsx` - home entry card.

Modify:
- `src/lib/session-types.ts` - add `TrainingState`; add optional `trainingBoxes` + `currentTraining`; default them in `createDefaultSession`.
- `src/hooks/useSession.ts` - `clampLoadedBoxes`; extract `applyAnswerToSession`; add `startTraining` / `answerTraining` / `endTraining` / `getTrainingProgress`; export them.
- `src/app/page.tsx` - render `TrainingCTA`.
- `src/components/home/WhatsNewModal.tsx` - new feature section copy + CTA to `/antrenament`.
- `src/components/home/WhatsNewGate.tsx` - bump key to `utm-whatsnew-v210`.
- `src/lib/site-config.ts` - `APP_VERSION = "2.1.0"`.
- `src/app/noutati/page.tsx` - new changelog entry.
- `src/components/home/ChangelogBanner.tsx` - new `recentChanges`.
- `package.json` - add `scripts/training.test.mjs` to the `test` script.

No change required: `src/lib/validation.ts` (stays v1; ignores the new optional fields, like it already ignores `currentPractice`), `src/app/api/save/route.ts`, `src/app/api/load/route.ts`, `src/db/schema.ts`.

## Testing

- `scripts/training.test.mjs` covers the pure scheduler per the assertions listed under
  "Tuning knobs" above.
- Manual: start training over a single subject and over "everything"; verify wrong answers
  recur sooner, correct ones later but still recur, no back-to-back repeats, "Stapanite"
  climbs, refresh resumes mid-stream, "Incheie" summary dedups, "Refa greselile" launches a
  normal practice session, and Rezultate/Practica numbers include training answers.
- `npm run build` requires a dummy `DATABASE_URL` (per repo convention) to verify.

## Open questions

None blocking. Constants (`INTERVALS`, `NEW_SPACING`, mastery threshold) are finalized during
implementation against the test assertions.
