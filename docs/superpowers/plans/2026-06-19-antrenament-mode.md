# Antrenament (Unlimited Adaptive Practice) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated "Antrenament" mode where the user picks a scope (everything / module / subject) and answers questions in an endless adaptive stream that re-injects wrong answers sooner and correct ones later, remembering per-question strength across sessions.

**Architecture:** A pure Leitner-lite scheduler (`src/lib/training.ts`, intervals measured in "questions from now") drives an endless stream. New session state (`currentTraining` + persistent `trainingBoxes`) is added to the existing `LocalSession` as optional fields (schema stays `version: 1`). A new `/antrenament` landing + `/antrenament/[sessionId]` runtime reuse the existing `QuestionCard`, `ExplanationPanel`, and `Modal`. Every answer flows through the existing answer/stat logic so it counts toward global stats automatically.

**Tech Stack:** Next.js 16 (App Router, React 19, "use client"), TypeScript, Tailwind v4, localStorage persistence, Node `.mjs` test harness with `node:assert/strict`.

## Global Constraints

- **Schema stays `version: 1`.** Do NOT bump `LocalSession.version`. `loadSession()` hard-resets any non-v1 session and `validation.ts` rejects non-v1 on server save. New fields are OPTIONAL and additive. (Spec: Data model.)
- **`validation.ts`, `src/app/api/**`, and `src/db/**` are NOT touched.** The new optional fields are ignored by the validator, exactly like `currentPractice` already is.
- **No em dashes** in any copy or comments (use commas or "-").
- **Changelog / ChangelogBanner copy uses NO diacritics** (matches the existing entries). **UI component copy DOES use diacritics** (matches existing UI like "Începe Practica", "Următoarea").
- **Reuse, do not reinvent:** `QuestionCard`, `ExplanationPanel`, `Modal`, `Button`, `SubjectSelector`, `Container`, `Header`, `MobileNav`, `useTimer`, `answerQuestion`'s stat logic, `startPractice` (for the end-of-session redo).
- **The Algebo.ai vote section in `WhatsNewModal` stays untouched.** Only the feature section (Section 1) changes; bump the gate key to `utm-whatsnew-v210`.
- **Scheduler logic is pure + unit-tested** in `scripts/training.test.mjs`, registered in the `test` npm script (matches `practice.ts` / `redo.ts` / `redo-scope.ts`).
- **TypeScript must be type-strippable:** no `enum`, no `namespace`, no decorators, no parameter properties (the `.mjs` tests import `.ts` directly).
- Target version: **2.1.0**. Release date string: **"20 Iunie 2026"**.

## File Structure

Create:
- `src/lib/training.ts` - pure scheduler (boxes, intervals, seeding, pick-next, apply-answer, mastered-count) + `SchedulerState` type.
- `scripts/training.test.mjs` - unit tests for the scheduler.
- `src/app/antrenament/layout.tsx` - route metadata.
- `src/app/antrenament/page.tsx` - landing + scope selection.
- `src/app/antrenament/[sessionId]/page.tsx` - streaming runtime.
- `src/components/home/TrainingCTA.tsx` - home entry card.

Modify:
- `src/lib/session-types.ts` - add `TrainingState`; add optional `trainingBoxes` + `currentTraining`; default them.
- `src/hooks/useSession.ts` - `clampLoadedBoxes`; extract `applyAnswerToSession`; add `startTraining` / `answerTraining` / `endTraining` / `getTrainingProgress`.
- `src/components/practice/QuestionCard.tsx` - make `totalQuestions` optional.
- `src/app/page.tsx` - render `<TrainingCTA />`.
- `src/components/home/WhatsNewModal.tsx` - new Section 1 copy + CTA to `/antrenament`.
- `src/components/home/WhatsNewGate.tsx` - bump key to `utm-whatsnew-v210`.
- `src/lib/site-config.ts` - `APP_VERSION = "2.1.0"`.
- `src/app/noutati/page.tsx` - new changelog entry at index 0.
- `src/components/home/ChangelogBanner.tsx` - new `recentChanges`.
- `package.json` - add `scripts/training.test.mjs` to the `test` script.

---

### Task 1: Scheduler core + unit tests

**Files:**
- Create: `src/lib/training.ts`
- Test: `scripts/training.test.mjs`
- Modify: `package.json` (test script)

**Interfaces:**
- Consumes: `AnswerRecord` (type-only) from `src/lib/session-types.ts` (only reads `.isCorrect`).
- Produces:
  - `INTERVALS: readonly [2,4,8,16,32,50]`, `NEW_SPACING = 3`, `MASTERED_BOX = 4`, `MAX_BOX = 5`
  - `interface SchedulerState { pool: number[]; due: Record<number,number>; seq: number; lastQuestionId: number | null }`
  - `seedBox(qid, boxes, answers): number`
  - `nextBox(box, isCorrect): number`
  - `intervalForBox(box): number`
  - `initSchedule(pool, boxes, answers): Record<number,number>`
  - `pickNext(state, boxes, answers): number`
  - `applyAnswer(state, boxes, answers, qid, isCorrect): { due: Record<number,number>; seq: number; box: number }`
  - `masteredCount(pool, boxes, answers): number`

- [ ] **Step 1: Write the failing test** — create `scripts/training.test.mjs`:

```js
import process from "node:process";
import assert from "node:assert/strict";
import {
  seedBox, nextBox, intervalForBox, initSchedule, pickNext, applyAnswer, masteredCount,
  INTERVALS, NEW_SPACING, MASTERED_BOX, MAX_BOX,
} from "../src/lib/training.ts";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

const wrong = { isCorrect: false };
const right = { isCorrect: true };

check("seedBox: stored box wins, else history (correct->2, wrong->0), else new->1; stored is clamped", () => {
  assert.equal(seedBox(1, { 1: 3 }, {}), 3);
  assert.equal(seedBox(1, {}, { 1: right }), 2);
  assert.equal(seedBox(1, {}, { 1: wrong }), 0);
  assert.equal(seedBox(1, {}, {}), 1);
  assert.equal(seedBox(1, { 1: 9 }, {}), MAX_BOX);
  assert.equal(seedBox(1, { 1: -3 }, {}), 0);
});

check("nextBox: correct increments (capped at MAX_BOX), wrong resets to 0", () => {
  assert.equal(nextBox(0, true), 1);
  assert.equal(nextBox(4, true), 5);
  assert.equal(nextBox(5, true), 5);
  assert.equal(nextBox(3, false), 0);
  assert.equal(nextBox(0, false), 0);
});

check("intervalForBox maps to INTERVALS and clamps out-of-range", () => {
  assert.deepEqual([...INTERVALS], [2, 4, 8, 16, 32, 50]);
  assert.equal(intervalForBox(0), 2);
  assert.equal(intervalForBox(5), 50);
  assert.equal(intervalForBox(99), 50);
});

check("initSchedule: seen get INTERVALS[box]; new trickle at NEW_SPACING in pool order", () => {
  const due = initSchedule([1, 2, 3, 4], {}, { 1: wrong, 2: right });
  assert.equal(due[1], intervalForBox(0)); // 2
  assert.equal(due[2], intervalForBox(2)); // 8
  assert.equal(due[3], NEW_SPACING);       // 3 (1st new)
  assert.equal(due[4], 2 * NEW_SPACING);   // 6 (2nd new)
});

check("pickNext: smallest due wins, excludes lastQuestionId, tie-break weaker box then pool order", () => {
  const pool = [1, 2, 3];
  const due = { 1: 5, 2: 2, 3: 2 };
  const boxes = { 2: 4, 3: 0 };
  assert.equal(pickNext({ pool, due, seq: 0, lastQuestionId: null }, boxes, {}), 3);
  assert.equal(pickNext({ pool, due, seq: 0, lastQuestionId: 3 }, boxes, {}), 2);
  assert.equal(pickNext({ pool: [7], due: { 7: 1 }, seq: 0, lastQuestionId: 7 }, {}, {}), 7);
});

check("applyAnswer: correct pushes due out by the higher box, wrong brings it back in ~2", () => {
  const state = { pool: [1], due: { 1: 2 }, seq: 0, lastQuestionId: null };
  const c = applyAnswer(state, {}, {}, 1, true);
  assert.equal(c.seq, 1);
  assert.equal(c.box, 2);
  assert.equal(c.due[1], 1 + intervalForBox(2)); // 9
  const w = applyAnswer(state, {}, {}, 1, false);
  assert.equal(w.box, 0);
  assert.equal(w.due[1], 1 + intervalForBox(0)); // 3
});

check("masteredCount: counts questions whose effective box >= MASTERED_BOX", () => {
  assert.equal(MASTERED_BOX, 4);
  const boxes = { 1: 4, 2: 5, 3: 1 };
  assert.equal(masteredCount([1, 2, 3, 4], boxes, { 4: right }), 2);
});

check("behavioral: a freshly-wrong question returns within ~3 picks even with unseen remaining", () => {
  const pool = [1, 2, 3, 4, 5];
  const boxes = {};
  const answers = {};
  let state = { pool, due: initSchedule(pool, boxes, answers), seq: 0, lastQuestionId: null };
  const first = pickNext(state, boxes, answers);
  const r = applyAnswer(state, boxes, answers, first, false);
  boxes[first] = r.box;
  state = { pool, due: r.due, seq: r.seq, lastQuestionId: first };
  let seenAgain = -1;
  let last = first;
  for (let step = 1; step <= 3; step++) {
    const pick = pickNext({ ...state, lastQuestionId: last }, boxes, answers);
    if (pick === first) { seenAgain = step; break; }
    const rr = applyAnswer({ pool, due: state.due, seq: state.seq, lastQuestionId: last }, boxes, answers, pick, true);
    boxes[pick] = rr.box;
    state = { pool, due: rr.due, seq: rr.seq, lastQuestionId: pick };
    last = pick;
  }
  assert.ok(seenAgain >= 1 && seenAgain <= 3, `wrong question should reappear within 3 picks (got ${seenAgain})`);
});

check("behavioral: a fully-mastered question is never retired (finite due, still scheduled)", () => {
  const { due } = applyAnswer({ pool: [1], due: { 1: 0 }, seq: 10, lastQuestionId: null }, { 1: 5 }, {}, 1, true);
  assert.ok(Number.isFinite(due[1]));
  assert.equal(due[1], 11 + intervalForBox(5)); // 61, still comes back
});

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `node --import ./scripts/register-alias.mjs scripts/training.test.mjs`
Expected: FAIL — cannot resolve `../src/lib/training.ts` (module not found).

- [ ] **Step 3: Implement `src/lib/training.ts`**

```ts
import type { AnswerRecord } from "./session-types";

/** Strongest box; a question never graduates past this (it still cycles). */
export const MAX_BOX = 5;
/** Questions-from-now until a question of each box is due again. */
export const INTERVALS = [2, 4, 8, 16, 32, 50] as const;
/** How fast never-seen questions trickle into the stream. */
export const NEW_SPACING = 3;
/** A question at or above this box counts as "stapanita" (mastered). */
export const MASTERED_BOX = 4;

export interface SchedulerState {
  /** All in-scope question ids, in introduction order. */
  pool: number[];
  /** qid -> absolute seq target. */
  due: Record<number, number>;
  /** Questions answered so far this session (the scheduler clock). */
  seq: number;
  /** Never pick this id as the immediate next question. */
  lastQuestionId: number | null;
}

function clampBox(b: number): number {
  if (!Number.isFinite(b)) return 1;
  return Math.max(0, Math.min(MAX_BOX, Math.floor(b)));
}

/** Initial box for a question: persistent strength, else history, else "new". */
export function seedBox(
  qid: number,
  boxes: Record<number, number>,
  answers: Record<number, AnswerRecord>,
): number {
  const stored = boxes[qid];
  if (typeof stored === "number") return clampBox(stored);
  const a = answers[qid];
  if (a) return a.isCorrect ? 2 : 0;
  return 1;
}

/** Box after answering: correct -> +1 (capped), wrong -> reset to 0. */
export function nextBox(box: number, isCorrect: boolean): number {
  return isCorrect ? Math.min(box + 1, MAX_BOX) : 0;
}

export function intervalForBox(box: number): number {
  return INTERVALS[clampBox(box)];
}

/**
 * Seed the schedule for a whole scope. Previously-seen questions surface early
 * as a review backlog (prior wrong first, prior correct later); never-seen
 * questions trickle in at NEW_SPACING in pool order.
 */
export function initSchedule(
  pool: number[],
  boxes: Record<number, number>,
  answers: Record<number, AnswerRecord>,
): Record<number, number> {
  const due: Record<number, number> = {};
  let newIndex = 0;
  for (const qid of pool) {
    const seen = typeof boxes[qid] === "number" || answers[qid] !== undefined;
    if (seen) {
      due[qid] = intervalForBox(seedBox(qid, boxes, answers));
    } else {
      newIndex += 1;
      due[qid] = newIndex * NEW_SPACING;
    }
  }
  return due;
}

/** Next question: smallest due, excluding lastQuestionId, tie-break weaker box then pool order. */
export function pickNext(
  state: SchedulerState,
  boxes: Record<number, number>,
  answers: Record<number, AnswerRecord>,
): number {
  const { pool, due, lastQuestionId } = state;
  let best = pool[0];
  let bestDue = Infinity;
  let bestBox = Infinity;
  for (const qid of pool) {
    if (qid === lastQuestionId && pool.length > 1) continue;
    const d = due[qid] ?? 0;
    const b = seedBox(qid, boxes, answers);
    if (d < bestDue || (d === bestDue && b < bestBox)) {
      best = qid;
      bestDue = d;
      bestBox = b;
    }
  }
  return best;
}

/** Apply an answer: advance the clock, re-box, reschedule. Pure (returns a slice). */
export function applyAnswer(
  state: SchedulerState,
  boxes: Record<number, number>,
  answers: Record<number, AnswerRecord>,
  qid: number,
  isCorrect: boolean,
): { due: Record<number, number>; seq: number; box: number } {
  const box = nextBox(seedBox(qid, boxes, answers), isCorrect);
  const seq = state.seq + 1;
  const due = { ...state.due, [qid]: seq + intervalForBox(box) };
  return { due, seq, box };
}

/** How many in-scope questions are at or above the mastery threshold. */
export function masteredCount(
  pool: number[],
  boxes: Record<number, number>,
  answers: Record<number, AnswerRecord>,
): number {
  let n = 0;
  for (const qid of pool) {
    if (seedBox(qid, boxes, answers) >= MASTERED_BOX) n += 1;
  }
  return n;
}
```

- [ ] **Step 4: Run the test to confirm it passes**

Run: `node --import ./scripts/register-alias.mjs scripts/training.test.mjs`
Expected: PASS — "All tests passed".

- [ ] **Step 5: Wire the test into the `test` npm script** — in `package.json`, replace the `test` value by appending the training test:

```json
    "test": "node --import ./scripts/register-alias.mjs scripts/practice-selection.test.mjs && node --import ./scripts/register-alias.mjs scripts/redo.test.mjs && node --import ./scripts/register-alias.mjs scripts/redo-scope.test.mjs && node --import ./scripts/register-alias.mjs scripts/search.test.mjs && node --import ./scripts/register-alias.mjs scripts/training.test.mjs"
```

- [ ] **Step 6: Run the full suite**

Run: `npm run test`
Expected: all suites pass, ending "All tests passed".

- [ ] **Step 7: Commit**

```bash
git add src/lib/training.ts scripts/training.test.mjs package.json
git commit -m "feat: adaptive training scheduler (pure lib + tests)"
```

---

### Task 2: Session model + hook integration

**Files:**
- Modify: `src/lib/session-types.ts`
- Modify: `src/hooks/useSession.ts`

**Interfaces:**
- Consumes: `initSchedule`, `pickNext`, `applyAnswer`, `masteredCount` from `src/lib/training.ts` (Task 1); `buildOptionOrders` from `src/lib/practice.ts`; `getQuestion`, `questionsBySubject` from `src/data`.
- Produces (from `useSession()`):
  - `startTraining(subjectIds: string[], options?: { shuffleOrder?: boolean; shuffleOptions?: boolean }): string | null`
  - `answerTraining(questionId, selected, isCorrect, timeSpentMs, subjectId): void`
  - `endTraining(): void`
  - `getTrainingProgress(): { answeredCount, correctCount, accuracy, masteredCount, poolSize, seenCount } | null`
  - `LocalSession.trainingBoxes?: Record<number, number>`, `LocalSession.currentTraining?: TrainingState | null`
  - `interface TrainingState` (see below)

- [ ] **Step 1: Add `TrainingState` to `src/lib/session-types.ts`** — insert immediately after the `PracticeState` interface (after its closing `}`):

```ts
export interface TrainingState {
  /** Chosen scope (subject ids). */
  subjectIds: string[];
  /** All in-scope question ids, in introduction order (shuffled if chosen). */
  pool: number[];
  /** qid -> absolute seq target (session-local schedule). */
  due: Record<number, number>;
  /** Questions answered so far this session (the scheduler clock). */
  seq: number;
  /** The question currently on screen. */
  currentQuestionId: number;
  /** Dedup: never pick this as the immediate next question. */
  lastQuestionId: number | null;
  /** Unique question ids shown this session (for the deduped end summary). */
  seenIds: number[];
  answeredCount: number;
  correctCount: number;
  startedAt: string;
  shuffleOptions: boolean;
  /** Per-question answer-option display order, built lazily when shuffleOptions is on. */
  optionOrder?: Record<number, AnswerKey[]>;
}
```

- [ ] **Step 2: Add the two optional fields to `LocalSession`** — in `src/lib/session-types.ts`, replace:

```ts
  subjectStats: Record<string, SubjectStat>;
  settings: SessionSettings;
  savedKey: string | null;
}
```

with:

```ts
  subjectStats: Record<string, SubjectStat>;
  settings: SessionSettings;
  savedKey: string | null;
  /** Persistent per-question strength (Leitner box 0..5) for Antrenament. Optional/additive. */
  trainingBoxes?: Record<number, number>;
  /** The active unlimited-training session, or null. */
  currentTraining?: TrainingState | null;
}
```

- [ ] **Step 3: Default the new fields in `createDefaultSession`** — in `src/lib/session-types.ts`, replace:

```ts
    savedKey: null,
  };
}
```

with:

```ts
    savedKey: null,
    trainingBoxes: {},
    currentTraining: null,
  };
}
```

- [ ] **Step 4: Import the scheduler + `TrainingState` in `src/hooks/useSession.ts`** — add `type TrainingState` to the `@/lib/session-types` import list, and add a new import after the `buildOptionOrders` import:

```ts
import { initSchedule, pickNext, applyAnswer, masteredCount } from "@/lib/training";
```

- [ ] **Step 5: Add `clampLoadedBoxes`** — in `src/hooks/useSession.ts`, immediately after the `clampLoadedAnswers` function, add:

```ts
function clampLoadedBoxes(raw: unknown): Record<number, number> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<number, number> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const n = Number(v);
    if (Number.isFinite(n)) out[Number(k)] = Math.max(0, Math.min(5, Math.floor(n)));
  }
  return out;
}
```

- [ ] **Step 6: Restore the new fields on load** — in `loadSession()`, replace the return object:

```ts
    return {
      ...defaults,
      ...parsed,
      answers: clampLoadedAnswers(parsed.answers),
      settings: { ...defaults.settings, ...(parsed.settings ?? {}) },
      examHistory: Array.isArray(parsed.examHistory) ? parsed.examHistory : [],
    } as LocalSession;
```

with:

```ts
    return {
      ...defaults,
      ...parsed,
      answers: clampLoadedAnswers(parsed.answers),
      settings: { ...defaults.settings, ...(parsed.settings ?? {}) },
      examHistory: Array.isArray(parsed.examHistory) ? parsed.examHistory : [],
      trainingBoxes: clampLoadedBoxes(parsed.trainingBoxes),
      currentTraining:
        parsed.currentTraining && Array.isArray(parsed.currentTraining.pool)
          ? parsed.currentTraining
          : null,
    } as LocalSession;
```

- [ ] **Step 7: Extract `applyAnswerToSession` and reuse it in `answerQuestion`** — in `src/hooks/useSession.ts`, add this module-level helper just above `export function useSession()`:

```ts
/** Record one answer into the global answers map + per-subject stats. Pure. */
function applyAnswerToSession(
  prev: LocalSession,
  questionId: number,
  selected: "a" | "b" | "c" | "d",
  isCorrect: boolean,
  timeSpentMs: number,
  subjectId: string,
): LocalSession {
  const now = new Date().toISOString();
  const answer: AnswerRecord = { selected, isCorrect, answeredAt: now, timeSpentMs };
  const prevSubjectStat = prev.subjectStats[subjectId] || { attempted: 0, correct: 0, lastPracticedAt: now };
  const previous = prev.answers[questionId];
  const correctDelta = previous ? (isCorrect ? 1 : 0) - (previous.isCorrect ? 1 : 0) : isCorrect ? 1 : 0;
  return {
    ...prev,
    answers: { ...prev.answers, [questionId]: answer },
    subjectStats: {
      ...prev.subjectStats,
      [subjectId]: {
        attempted: prevSubjectStat.attempted + (previous ? 0 : 1),
        correct: Math.max(0, prevSubjectStat.correct + correctDelta),
        lastPracticedAt: now,
      },
    },
  };
}
```

Then replace the body of the existing `answerQuestion` callback's `setSession(...)` with:

```ts
      setSession((prev) => {
        const updated = applyAnswerToSession(prev, questionId, selected, isCorrect, timeSpentMs, subjectId);
        persistSession(updated);
        return updated;
      });
```

(Keep the `useCallback(..., [persistSession])` wrapper and signature exactly as they are.)

- [ ] **Step 8: Add the training actions** — in `src/hooks/useSession.ts`, immediately after the `endPractice` callback, add:

```ts
  const startTraining = useCallback(
    (subjectIds: string[], options: { shuffleOrder?: boolean; shuffleOptions?: boolean } = {}): string | null => {
      const { shuffleOrder = false, shuffleOptions = false } = options;
      const poolQuestions = subjectIds.flatMap((sid) => questionsBySubject[sid] || []);
      if (poolQuestions.length === 0) return null;
      const orderedQuestions = shuffleOrder ? shuffleArray(poolQuestions) : poolQuestions;
      const pool = orderedQuestions.map((q) => q.id);
      const sessionId = crypto.randomUUID();
      setSession((prev) => {
        const boxes = prev.trainingBoxes ?? {};
        const due = initSchedule(pool, boxes, prev.answers);
        const firstId = pickNext({ pool, due, seq: 0, lastQuestionId: null }, boxes, prev.answers);
        let optionOrder: Record<number, AnswerKey[]> | undefined;
        if (shuffleOptions) {
          const q = getQuestion(firstId);
          if (q) optionOrder = { [firstId]: buildOptionOrders([q])[firstId] };
        }
        const training: TrainingState = {
          subjectIds,
          pool,
          due,
          seq: 0,
          currentQuestionId: firstId,
          lastQuestionId: null,
          seenIds: [],
          answeredCount: 0,
          correctCount: 0,
          startedAt: new Date().toISOString(),
          shuffleOptions,
          ...(optionOrder ? { optionOrder } : {}),
        };
        const updated = { ...prev, currentTraining: training };
        saveSession(updated);
        return updated;
      });
      return sessionId;
    },
    []
  );

  const answerTraining = useCallback(
    (questionId: number, selected: "a" | "b" | "c" | "d", isCorrect: boolean, timeSpentMs: number, subjectId: string) => {
      setSession((prev) => {
        const training = prev.currentTraining;
        if (!training) return prev;
        const base = applyAnswerToSession(prev, questionId, selected, isCorrect, timeSpentMs, subjectId);
        const boxes = { ...(prev.trainingBoxes ?? {}) };
        const { due, seq, box } = applyAnswer(
          { pool: training.pool, due: training.due, seq: training.seq, lastQuestionId: training.lastQuestionId },
          boxes,
          prev.answers,
          questionId,
          isCorrect,
        );
        boxes[questionId] = box;
        const nextId = pickNext({ pool: training.pool, due, seq, lastQuestionId: questionId }, boxes, base.answers);
        let optionOrder = training.optionOrder;
        if (training.shuffleOptions && (!optionOrder || optionOrder[nextId] == null)) {
          const q = getQuestion(nextId);
          if (q) optionOrder = { ...(optionOrder ?? {}), [nextId]: buildOptionOrders([q])[nextId] };
        }
        const seenIds = training.seenIds.includes(questionId) ? training.seenIds : [...training.seenIds, questionId];
        const updated: LocalSession = {
          ...base,
          trainingBoxes: boxes,
          currentTraining: {
            ...training,
            due,
            seq,
            lastQuestionId: questionId,
            currentQuestionId: nextId,
            seenIds,
            answeredCount: training.answeredCount + 1,
            correctCount: training.correctCount + (isCorrect ? 1 : 0),
            ...(optionOrder ? { optionOrder } : {}),
          },
        };
        persistSession(updated);
        return updated;
      });
    },
    [persistSession]
  );

  const endTraining = useCallback(() => {
    setSession((prev) => {
      const updated = { ...prev, currentTraining: null };
      persistSession(updated);
      return updated;
    });
  }, [persistSession]);

  const getTrainingProgress = useCallback(() => {
    const t = session.currentTraining;
    if (!t) return null;
    const boxes = session.trainingBoxes ?? {};
    return {
      answeredCount: t.answeredCount,
      correctCount: t.correctCount,
      accuracy: t.answeredCount > 0 ? Math.round((t.correctCount / t.answeredCount) * 100) : 0,
      masteredCount: masteredCount(t.pool, boxes, session.answers),
      poolSize: t.pool.length,
      seenCount: t.seenIds.length,
    };
  }, [session.currentTraining, session.trainingBoxes, session.answers]);
```

- [ ] **Step 9: Export the new actions** — in the `return { ... }` of `useSession`, add `startTraining,`, `answerTraining,`, `endTraining,`, `getTrainingProgress,` (next to `endPractice,`).

- [ ] **Step 10: Typecheck + lint**

Run: `npx tsc --noEmit`
Expected: no errors.
Run: `npm run lint`
Expected: no errors.
Run: `npm run test`
Expected: all suites pass (regression check — `answerQuestion` behavior is unchanged).

- [ ] **Step 11: Commit**

```bash
git add src/lib/session-types.ts src/hooks/useSession.ts
git commit -m "feat: training session state + hook actions (startTraining, answerTraining, endTraining)"
```

---

### Task 3: Antrenament landing page + scope selection

**Files:**
- Create: `src/app/antrenament/layout.tsx`
- Create: `src/app/antrenament/page.tsx`

**Interfaces:**
- Consumes: `useSession().startTraining` / `resetSubject` / `updateSettings` (Task 2); `masteredCount` from `src/lib/training.ts` (Task 1); `SubjectSelector`, `questionsBySubject`, `modules`.
- Produces: route `/antrenament` (scope picker) and `/antrenament/[sessionId]` navigation entry; a "Continua antrenamentul" resume link when `currentTraining` exists.

- [ ] **Step 1: Create `src/app/antrenament/layout.tsx`**

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Antrenament Nelimitat - Grile Licenta UTM",
  description:
    "Exerseaza nelimitat grile pentru licenta UTM Informatica 2026. Alegi tot, un modul sau o materie, iar algoritmul iti readuce greselile mai des si pe cele stiute mai rar.",
  alternates: {
    canonical: "https://utmlearn.com/antrenament",
  },
};

export default function AntrenamentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

- [ ] **Step 2: Create `src/app/antrenament/page.tsx`**

```tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Container } from "@/components/layout/Container";
import { SubjectSelector } from "@/components/practice/SubjectSelector";
import { useSession } from "@/hooks/useSession";
import { questionsBySubject } from "@/data";
import { modules } from "@/data/modules";
import { masteredCount } from "@/lib/training";
import { cn } from "@/lib/utils";

export default function AntrenamentLanding() {
  const router = useRouter();
  const { session, startTraining, resetSubject, updateSettings } = useSession();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [shuffleOrder, setShuffleOrder] = useState(true);

  const training = session.currentTraining;

  const toggleSubject = (id: string) =>
    setSelectedSubjects((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  const selectAllModule = (moduleId: string) => {
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return;
    setSelectedSubjects((prev) => [...new Set([...prev, ...mod.subjects.map((s) => s.id)])]);
  };
  const deselectAllModule = (moduleId: string) => {
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return;
    const ids = new Set(mod.subjects.map((s) => s.id));
    setSelectedSubjects((prev) => prev.filter((s) => !ids.has(s)));
  };

  const { total, mastered } = useMemo(() => {
    const pool = selectedSubjects.flatMap((sid) => (questionsBySubject[sid] || []).map((q) => q.id));
    return { total: pool.length, mastered: masteredCount(pool, session.trainingBoxes ?? {}, session.answers) };
  }, [selectedSubjects, session.trainingBoxes, session.answers]);

  const handleStart = () => {
    if (selectedSubjects.length === 0) return;
    const id = startTraining(selectedSubjects, { shuffleOrder, shuffleOptions: session.settings.shuffleOptions });
    if (id) router.push(`/antrenament/${id}`);
  };

  return (
    <>
      <Header />
      <main className="relative py-8 pb-24 md:pb-8 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-40" aria-hidden="true" />
        <Container narrow className="relative">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2 animate-fade-in" style={{ fontFamily: "var(--font-display)" }}>
              Antrenament
            </h1>
            <p className="text-[var(--color-text-secondary)] animate-fade-in stagger-1">
              Exersezi în continuu, fără limită. Algoritmul îți readuce greșelile mai des și pe cele știute mai rar.
            </p>
          </div>

          {training && (
            <Link
              href="/antrenament/continua"
              className="group flex items-center gap-3 sm:gap-4 rounded-[var(--radius-lg)] border border-[var(--color-accent)] bg-[var(--color-bg-secondary)] p-3.5 sm:p-4 mb-8 transition-all duration-200 hover:bg-[var(--color-bg-hover)] animate-fade-in"
            >
              <span className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-border)]" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm sm:text-base font-bold text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-display)" }}>Continuă antrenamentul</div>
                <p className="text-[11px] sm:text-xs text-[var(--color-text-tertiary)] mt-0.5">{training.answeredCount} răspunse până acum - reia de unde ai rămas.</p>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-accent)] transition-colors" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
            </Link>
          )}

          <SubjectSelector
            selectedSubjects={selectedSubjects}
            onToggleSubject={toggleSubject}
            onSelectAllModule={selectAllModule}
            onDeselectAllModule={deselectAllModule}
            onResetSubject={resetSubject}
          />

          {selectedSubjects.length > 0 && (
            <div className="mt-10 animate-slide-up">
              <div className="relative rounded-[var(--radius-xl)] border border-[var(--color-border)] overflow-hidden" style={{ background: "linear-gradient(180deg, var(--color-bg-tertiary) 0%, var(--color-bg-secondary) 40%, var(--color-bg-secondary) 100%)" }}>
                <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 40% at 50% 0%, var(--color-accent), transparent)", opacity: 0.06 }} />
                <div className="relative px-6 pt-8 pb-6 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-accent)]" style={{ fontFamily: "var(--font-display)" }}>Antrenament Nou</span>
                  <div className="mt-3 flex items-baseline justify-center gap-3">
                    <span className="text-5xl sm:text-6xl font-extrabold text-[var(--color-text-primary)] tabular-nums" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>{total}</span>
                    <span className="text-base text-[var(--color-text-tertiary)] font-medium">în rotație</span>
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-4 text-xs text-[var(--color-text-tertiary)]">
                    <span>{selectedSubjects.length} {selectedSubjects.length === 1 ? "materie" : "materii"}</span>
                    {total > 0 && mastered > 0 && (
                      <>
                        <span className="w-px h-3 bg-[var(--color-border)]" />
                        <span className="text-[var(--color-correct)] font-medium">{mastered} stăpânite deja</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="relative px-6 pb-6 space-y-5">
                  <label className={cn("flex items-center gap-3.5 px-4 py-3.5 rounded-[var(--radius-lg)] cursor-pointer transition-all border", shuffleOrder ? "bg-[var(--color-accent-muted)] border-[var(--color-accent)]" : "bg-[var(--color-bg-primary)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]")}>
                    <button role="switch" aria-checked={shuffleOrder} aria-label="Amestecă ordinea întrebărilor" onClick={() => setShuffleOrder((v) => !v)} className={cn("relative w-10 h-[22px] rounded-full transition-all duration-200 cursor-pointer flex-shrink-0", shuffleOrder ? "bg-[var(--color-accent)]" : "bg-[var(--color-border-strong)]")}>
                      <span className={cn("absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200", shuffleOrder && "translate-x-[18px]")} />
                    </button>
                    <div className="min-w-0">
                      <span className="text-sm font-medium block text-[var(--color-text-secondary)]">Amestecă ordinea</span>
                      <span className="text-[11px] text-[var(--color-text-tertiary)]">Introdu întrebările noi într-o ordine aleatorie</span>
                    </div>
                  </label>

                  <label className={cn("flex items-center gap-3.5 px-4 py-3.5 rounded-[var(--radius-lg)] cursor-pointer transition-all border", session.settings.shuffleOptions ? "bg-[var(--color-accent-muted)] border-[var(--color-accent)]" : "bg-[var(--color-bg-primary)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]")}>
                    <button role="switch" aria-checked={session.settings.shuffleOptions} aria-label="Amestecă ordinea răspunsurilor" onClick={() => updateSettings({ shuffleOptions: !session.settings.shuffleOptions })} className={cn("relative w-10 h-[22px] rounded-full transition-all duration-200 cursor-pointer flex-shrink-0", session.settings.shuffleOptions ? "bg-[var(--color-accent)]" : "bg-[var(--color-border-strong)]")}>
                      <span className={cn("absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200", session.settings.shuffleOptions && "translate-x-[18px]")} />
                    </button>
                    <div className="min-w-0">
                      <span className="text-sm font-medium block text-[var(--color-text-secondary)]">Amestecă răspunsurile</span>
                      <span className="text-[11px] text-[var(--color-text-tertiary)]">Variantele apar în altă ordine de fiecare dată</span>
                    </div>
                  </label>

                  <button onClick={handleStart} className={cn("w-full py-4 rounded-[var(--radius-lg)] text-base font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5", "bg-[var(--color-accent)] text-[#0C0C0E] hover:bg-[var(--color-accent-hover)]", "shadow-[0_0_30px_rgba(232,166,49,0.15)] hover:shadow-[0_0_40px_rgba(232,166,49,0.25)]", "active:scale-[0.98]")} style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}>
                    Începe Antrenamentul
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </Container>
      </main>
      <MobileNav />
    </>
  );
}
```

- [ ] **Step 3: Typecheck + lint**

Run: `npx tsc --noEmit` — Expected: no errors.
Run: `npm run lint` — Expected: no errors.

- [ ] **Step 4: Manual check** — `npm run dev`, open `http://localhost:3000/antrenament`. Verify: heading renders, selecting subjects reveals the "Antrenament Nou" panel with a live count, toggles flip, and "Începe Antrenamentul" navigates to `/antrenament/<uuid>` (the runtime page is built in Task 4, so it will show a spinner/redirect until then - that is expected).

- [ ] **Step 5: Commit**

```bash
git add src/app/antrenament/layout.tsx src/app/antrenament/page.tsx
git commit -m "feat: Antrenament landing + scope selection"
```

---

### Task 4: Antrenament streaming runtime

**Files:**
- Create: `src/app/antrenament/[sessionId]/page.tsx`
- Modify: `src/components/practice/QuestionCard.tsx` (make `totalQuestions` optional)

**Interfaces:**
- Consumes: `useSession().answerTraining` / `endTraining` / `startPractice` / `toggleBookmark` / `getTrainingProgress` (Task 2); `QuestionCard`, `Modal`, `Button`, `useTimer`, `getQuestion`, `modules`, `formatPercentage`, `formatTime`, `cn`.
- Produces: the endless runtime at `/antrenament/[sessionId]`.

- [ ] **Step 1: Make `totalQuestions` optional in `QuestionCard`** — in `src/components/practice/QuestionCard.tsx`, change the prop type:

```ts
  totalQuestions?: number;
```

and replace the denominator span:

```tsx
          <span className="text-[11px] sm:text-xs text-[var(--color-text-tertiary)]">
            / {totalQuestions}
          </span>
```

with:

```tsx
          {totalQuestions != null && (
            <span className="text-[11px] sm:text-xs text-[var(--color-text-tertiary)]">
              / {totalQuestions}
            </span>
          )}
```

- [ ] **Step 2: Create `src/app/antrenament/[sessionId]/page.tsx`**

```tsx
"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Container } from "@/components/layout/Container";
import { QuestionCard } from "@/components/practice/QuestionCard";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/hooks/useSession";
import { useTimer } from "@/hooks/useTimer";
import { getQuestion } from "@/data";
import { modules } from "@/data/modules";
import { cn, formatPercentage, formatTime } from "@/lib/utils";
import type { AnswerKey } from "@/data/types";

const ALL_SUBJECT_IDS = modules.flatMap((m) => m.subjects.map((s) => s.id));

function scopeLabel(subjectIds: string[]): string {
  if (subjectIds.length >= ALL_SUBJECT_IDS.length) return "Toate materiile";
  if (subjectIds.length === 1) {
    for (const m of modules) {
      const s = m.subjects.find((x) => x.id === subjectIds[0]);
      if (s) return s.name.split("(")[0].trim();
    }
  }
  return `${subjectIds.length} materii`;
}

export default function AntrenamentRuntime() {
  const router = useRouter();
  const {
    session,
    isLoaded,
    answerTraining,
    endTraining,
    startPractice,
    toggleBookmark,
    getTrainingProgress,
  } = useSession();
  const timer = useTimer();

  const training = session.currentTraining;

  const [displayedId, setDisplayedId] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerKey | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    timer.reset();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (training && displayedId === null) {
      setDisplayedId(training.currentQuestionId); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [training, displayedId]);

  useEffect(() => {
    if (isLoaded && !training) router.replace("/antrenament");
  }, [isLoaded, training, router]);

  const currentQuestion = useMemo(
    () => (displayedId != null ? getQuestion(displayedId) ?? null : null),
    [displayedId],
  );

  const progress = getTrainingProgress();

  const handleSelect = useCallback(
    (answer: AnswerKey) => {
      if (showFeedback || !currentQuestion || !training) return;
      setSelectedAnswer(answer);
      const isCorrect = answer === currentQuestion.correctAnswer;
      answerTraining(currentQuestion.id, answer, isCorrect, timer.stop(), currentQuestion.subjectId);
      setShowFeedback(true);
    },
    [showFeedback, currentQuestion, training, answerTraining, timer],
  );

  const handleNext = useCallback(() => {
    if (!training) return;
    setDisplayedId(training.currentQuestionId);
    setSelectedAnswer(null);
    setShowFeedback(false);
    timer.reset();
  }, [training, timer]);

  const handleBookmark = useCallback(() => {
    if (currentQuestion) toggleBookmark(currentQuestion.id);
  }, [currentQuestion, toggleBookmark]);

  const uniqueSeen = useMemo(
    () => (training ? training.seenIds.filter((id) => getQuestion(id) !== undefined) : []),
    [training],
  );
  const wrongIds = useMemo(
    () => uniqueSeen.filter((id) => session.answers[id] && !session.answers[id].isCorrect),
    [uniqueSeen, session.answers],
  );

  const handleRedoWrong = useCallback(() => {
    if (wrongIds.length === 0) return;
    endTraining();
    const id = startPractice([], wrongIds, {
      shuffleOrder: true,
      shuffleOptions: session.settings.shuffleOptions,
      mode: "practice",
    });
    router.push(`/practica/${id}`);
  }, [wrongIds, endTraining, startPractice, session.settings.shuffleOptions, router]);

  const handleFinish = useCallback(() => {
    endTraining();
    router.push("/rezultate");
  }, [endTraining, router]);

  if (!isLoaded || !training || !currentQuestion || !progress) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Se încarcă">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-border-strong)] border-t-[var(--color-accent)]" />
      </div>
    );
  }

  const isBookmarked = session.bookmarks.includes(currentQuestion.id);
  const currentModule = modules.find((m) => m.id === currentQuestion.moduleId);
  const moduleColor = currentModule?.color || "var(--color-accent)";
  const masteredPct = progress.poolSize > 0 ? Math.round((progress.masteredCount / progress.poolSize) * 100) : 0;
  const wrongCount = progress.answeredCount - progress.correctCount;

  const uniqueCorrect = uniqueSeen.filter((id) => session.answers[id]?.isCorrect).length;
  const uniqueWrong = uniqueSeen.length - uniqueCorrect;
  const summaryAccuracy = formatPercentage(uniqueCorrect, uniqueSeen.length);

  return (
    <>
      <Header />
      <main className="relative py-4 sm:py-6 pb-24 md:pb-8 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-40" aria-hidden="true" />
        <Container narrow className="relative">
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-1.5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: moduleColor }} />
              <span className="text-xs sm:text-sm text-[var(--color-text-secondary)] truncate">
                Antrenament - {scopeLabel(training.subjectIds)}
              </span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-xs text-[var(--color-text-tertiary)] font-mono tabular-nums">{formatTime(timer.elapsed)}</span>
              <button
                onClick={() => setShowSummary(true)}
                aria-label="Încheie antrenamentul"
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[var(--radius-md)] text-xs sm:text-sm font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-all cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                Încheie
              </button>
            </div>
          </div>

          <div className="mb-4 sm:mb-5">
            <div className="flex items-center justify-between mb-2 text-xs">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-correct)]" aria-hidden="true" />
                  <span className="text-[var(--color-correct)] font-semibold tabular-nums">{progress.correctCount}</span>
                  <span className="text-[var(--color-text-tertiary)]"><span className="hidden sm:inline">corecte</span><span className="sm:hidden" aria-hidden="true">✓</span></span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-wrong)]" aria-hidden="true" />
                  <span className="text-[var(--color-wrong)] font-semibold tabular-nums">{wrongCount}</span>
                  <span className="text-[var(--color-text-tertiary)]"><span className="hidden sm:inline">greșite</span><span className="sm:hidden" aria-hidden="true">✗</span></span>
                </span>
              </div>
              <span className="text-[var(--color-text-tertiary)] font-mono tabular-nums">
                Stăpânite {progress.masteredCount}<span className="text-[var(--color-border-strong)]">/</span>{progress.poolSize}
              </span>
            </div>
            <div className="relative h-2 rounded-full bg-[var(--color-bg-primary)] overflow-hidden" role="progressbar" aria-valuenow={progress.masteredCount} aria-valuemin={0} aria-valuemax={progress.poolSize} aria-label={`Stăpânite ${progress.masteredCount} din ${progress.poolSize}`}>
              <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out" style={{ width: `${masteredPct}%`, background: "linear-gradient(90deg, var(--color-correct), var(--color-accent))" }} />
            </div>
          </div>

          <div className="relative -mx-4 sm:mx-0 px-4 py-4 sm:p-6 sm:rounded-[var(--radius-xl)] border-y sm:border border-[var(--color-border)] bg-[var(--color-bg-secondary)] overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 80% 35% at 50% 0%, ${moduleColor}, transparent)`, opacity: 0.04 }} />
            <div className="relative">
              <QuestionCard
                question={currentQuestion}
                questionNumber={progress.answeredCount + 1}
                selectedAnswer={selectedAnswer}
                showFeedback={showFeedback}
                isBookmarked={isBookmarked}
                onSelectAnswer={handleSelect}
                onBookmark={handleBookmark}
                optionOrder={training.optionOrder?.[currentQuestion.id]}
              />
            </div>
          </div>

          <div className="flex items-center mt-4 sm:mt-6">
            <button
              onClick={handleNext}
              disabled={!showFeedback}
              aria-label="Întrebarea următoare"
              className={cn(
                "flex items-center justify-center gap-1.5 h-11 sm:h-12 px-6 rounded-[var(--radius-md)] font-semibold text-sm transition-all duration-200 cursor-pointer ml-auto",
                "bg-[var(--color-accent)] text-[#0C0C0E] hover:bg-[var(--color-accent-hover)] active:scale-[0.97]",
                "shadow-[0_0_20px_rgba(232,166,49,0.1)] hover:shadow-[0_0_30px_rgba(232,166,49,0.2)]",
                "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none disabled:shadow-none",
              )}
              style={{ fontFamily: "var(--font-display)" }}
            >
              Următoarea
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 6 15 12 9 18" /></svg>
            </button>
          </div>
        </Container>
      </main>
      <MobileNav />

      <Modal open={showSummary} onClose={() => setShowSummary(false)} title="Rezumat Antrenament">
        <div className="space-y-5">
          {uniqueSeen.length > 0 && (
            <div className="relative text-center py-4 rounded-[var(--radius-lg)] bg-[var(--color-bg-primary)] overflow-hidden">
              <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 70% 50% at 50% 0%, ${summaryAccuracy >= 70 ? "var(--color-correct)" : summaryAccuracy >= 40 ? "var(--color-accent)" : "var(--color-wrong)"}, transparent)`, opacity: 0.08 }} />
              <span className="relative text-4xl sm:text-5xl font-extrabold" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em", color: summaryAccuracy >= 70 ? "var(--color-correct)" : summaryAccuracy >= 40 ? "var(--color-accent)" : "var(--color-wrong)" }}>
                {summaryAccuracy}%
              </span>
              <div className="relative text-xs text-[var(--color-text-tertiary)] mt-1.5 uppercase tracking-wider font-medium">Acuratețe</div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="relative p-3 sm:p-4 rounded-[var(--radius-md)] bg-[var(--color-bg-primary)] text-center overflow-hidden">
              <div className="relative text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{uniqueSeen.length}</div>
              <div className="relative text-[10px] sm:text-xs text-[var(--color-text-tertiary)] mt-1">Întrebări</div>
            </div>
            <div className="relative p-3 sm:p-4 rounded-[var(--radius-md)] bg-[var(--color-bg-primary)] text-center overflow-hidden border border-[var(--color-correct-border)]">
              <div className="relative text-xl sm:text-2xl font-bold text-[var(--color-correct)] tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{uniqueCorrect}</div>
              <div className="relative text-[10px] sm:text-xs text-[var(--color-text-tertiary)] mt-1">Corecte</div>
            </div>
            <div className="relative p-3 sm:p-4 rounded-[var(--radius-md)] bg-[var(--color-bg-primary)] text-center overflow-hidden border border-[var(--color-wrong-border)]">
              <div className="relative text-xl sm:text-2xl font-bold text-[var(--color-wrong)] tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{uniqueWrong}</div>
              <div className="relative text-[10px] sm:text-xs text-[var(--color-text-tertiary)] mt-1">Greșite</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-[var(--color-text-tertiary)] py-1 text-center">
            Ai stăpânit {progress.masteredCount} din {progress.poolSize} întrebări din materiile alese
          </div>
          <div className="flex flex-col gap-2.5 pt-1">
            {uniqueWrong > 0 && (
              <Button variant="primary" size="md" className="w-full py-3" onClick={handleRedoWrong}>
                Refă greșitele ({uniqueWrong})
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1 py-2.5" onClick={() => setShowSummary(false)}>Continuă</Button>
              <Button variant="primary" size="sm" className="flex-1 py-2.5" onClick={handleFinish}>
                Rezultate
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
```

- [ ] **Step 3: Typecheck + lint**

Run: `npx tsc --noEmit` — Expected: no errors.
Run: `npm run lint` — Expected: no errors.

- [ ] **Step 4: Manual check** — `npm run dev`. Start a training from `/antrenament`. Verify: each answer shows instant feedback + explanation, "Următoarea" advances, the header counters and "Stăpânite X/Y" update live, a wrong answer reappears soon, refreshing the page resumes mid-stream, "Încheie" opens a deduped summary, "Refă greșitele" launches a normal practice session, "Rezultate" ends and lands on `/rezultate`, and the answers show up in `/rezultate` and `/practica` progress.

- [ ] **Step 5: Commit**

```bash
git add src/app/antrenament/[sessionId]/page.tsx src/components/practice/QuestionCard.tsx
git commit -m "feat: Antrenament streaming runtime + optional QuestionCard total"
```

---

### Task 5: Home entry card

**Files:**
- Create: `src/components/home/TrainingCTA.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `Container`, `next/link`.
- Produces: `<TrainingCTA />` linking to `/antrenament`, rendered on the home page.

- [ ] **Step 1: Create `src/components/home/TrainingCTA.tsx`**

```tsx
"use client";

import Link from "next/link";
import { Container } from "@/components/layout/Container";

export function TrainingCTA() {
  return (
    <section className="py-6 sm:py-8">
      <Container>
        <Link
          href="/antrenament"
          className="group relative block overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] transition-all duration-300 hover:border-[var(--color-accent)] animate-slide-up"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 20% 0%, var(--color-accent), transparent 60%), radial-gradient(ellipse 60% 60% at 90% 100%, var(--color-correct), transparent 60%)",
              opacity: 0.08,
            }}
            aria-hidden="true"
          />
          <div className="relative px-5 sm:px-8 py-6 sm:py-8">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-4 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)] border-opacity-30">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" aria-hidden="true" />
              Nou
            </div>
            <h2
              className="text-2xl sm:text-3xl md:text-[2.5rem] font-extrabold text-[var(--color-text-primary)] leading-[1.05] mb-2.5 sm:mb-3"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.025em" }}
            >
              Antrenament <span className="text-[var(--color-accent)]">Nelimitat</span>
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed max-w-md mb-5 sm:mb-6">
              Exersezi în continuu. Greșelile revin mai des, cele știute mai rar - algoritmul ține minte de la o zi la alta.
            </p>
            <div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[#0C0C0E] font-semibold text-sm transition-all duration-200 group-hover:bg-[var(--color-accent-hover)] group-hover:shadow-[0_0_30px_rgba(232,166,49,0.3)] group-active:scale-[0.98]"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
            >
              Începe Antrenamentul
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </div>
        </Link>
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Render it on the home page** — in `src/app/page.tsx`, add the import next to the other home imports:

```tsx
import { TrainingCTA } from "@/components/home/TrainingCTA";
```

and insert `<TrainingCTA />` immediately after `<ExamSimulatorCTA />` in the `<main>`:

```tsx
        <ExamSimulatorCTA />
        <TrainingCTA />
```

- [ ] **Step 3: Typecheck + lint + manual**

Run: `npx tsc --noEmit` — Expected: no errors.
Run: `npm run lint` — Expected: no errors.
Manual: `npm run dev`, open `/`, confirm the "Antrenament Nelimitat" card renders below the Simulator card and links to `/antrenament`.

- [ ] **Step 4: Commit**

```bash
git add src/components/home/TrainingCTA.tsx src/app/page.tsx
git commit -m "feat: Antrenament home CTA card"
```

---

### Task 6: Refresh the one-time What's New popup

**Files:**
- Modify: `src/components/home/WhatsNewModal.tsx` (Section 1 + doc comment)
- Modify: `src/components/home/WhatsNewGate.tsx` (gate key)

**Interfaces:**
- Consumes: existing `Modal`, `VOTE_EXPO_URL`, `VOTE_IMAGE`, `onClose`, `onSeeDetails`.
- Produces: the v2.1.0 popup; the vote section is unchanged.

- [ ] **Step 1: Update the doc comment** — in `src/components/home/WhatsNewModal.tsx`, replace the block comment above `export function WhatsNewModal` with:

```tsx
/**
 * One-time "what's new" popup. Leads with the new feature (the unlimited
 * Antrenament mode with adaptive re-injection), then (on scroll) a personal
 * thank-you for the Gen-E votes. Shown once per visitor who already has data;
 * see WhatsNewGate gating.
 */
```

- [ ] **Step 2: Replace Section 1** — in `src/components/home/WhatsNewModal.tsx`, replace the entire `{/* Section 1: the new feature */}` `<section>...</section>` block (the one with the `v2.0.0` badge, the "Caută orice întrebare..." heading, the two cards, and the "Deschide Căutarea" link) with:

```tsx
        {/* Section 1: the new feature */}
        <section>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mb-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)] border-opacity-30">
            v2.1.0
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)] mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Antrenament nelimitat, cu un algoritm care învață ce greșești
          </h3>
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Alegi <span className="font-semibold text-[var(--color-text-primary)]">tot</span>, un modul sau o singură
            materie și răspunzi în continuu. Te oprești când vrei, iar tot ce răspunzi intră în statisticile tale.
          </p>

          <div className="mt-3 space-y-2">
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="flex-shrink-0 text-[var(--color-accent)]" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9" /><polyline points="3 3 3 9 9 9" />
                  </svg>
                </span>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
                  Greșelile revin mai des
                </p>
              </div>
              <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                Întrebările la care greșești se întorc repede, iar cele pe care le știi revin tot mai rar - dar tot revin,
                ca să nu le uiți.
              </p>
            </div>
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="flex-shrink-0 text-[var(--color-accent)]" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V17h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z" /><path d="M9 21h6" />
                  </svg>
                </span>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
                  Ține minte de la o zi la alta
                </p>
              </div>
              <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                Algoritmul reține cât de bine stăpânești fiecare grilă, așa că revii oricând și continui de unde ai rămas.
              </p>
            </div>
          </div>

          <Link
            href="/antrenament"
            onClick={onClose}
            className="mt-3 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[#0C0C0E] font-bold text-sm transition-all duration-200 hover:bg-[var(--color-accent-hover)] active:scale-[0.98]"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
          >
            Începe Antrenamentul
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </section>
```

(The `Link` import at the top of the file already exists, so no import change is needed. The "Section 2" vote block and the scroll-hint divider stay exactly as they are.)

- [ ] **Step 3: Bump the gate key** — in `src/components/home/WhatsNewGate.tsx`, replace:

```tsx
const WHATSNEW_KEY = "utm-whatsnew-v200";
```

with:

```tsx
const WHATSNEW_KEY = "utm-whatsnew-v210";
```

- [ ] **Step 4: Typecheck + lint + manual**

Run: `npx tsc --noEmit` — Expected: no errors.
Run: `npm run lint` — Expected: no errors.
Manual: `npm run dev`. In DevTools, ensure you have some answers in localStorage and that `utm-whatsnew-v210` is NOT set (remove it if present), reload, and confirm the popup appears, Section 1 shows the Antrenament announcement with a working "Începe Antrenamentul" button, and the "Mulțumesc pentru voturi" vote section is unchanged below.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/WhatsNewModal.tsx src/components/home/WhatsNewGate.tsx
git commit -m "feat: v2.1.0 whats-new popup announces Antrenament (vote section kept)"
```

---

### Task 7: Version bump + changelog + banner

**Files:**
- Modify: `src/lib/site-config.ts`
- Modify: `src/app/noutati/page.tsx`
- Modify: `src/components/home/ChangelogBanner.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `APP_VERSION = "2.1.0"`, a new changelog entry, refreshed banner bullets.

- [ ] **Step 1: Bump the version** — in `src/lib/site-config.ts`, replace `export const APP_VERSION = "2.0.1";` with:

```ts
export const APP_VERSION = "2.1.0";
```

- [ ] **Step 2: Add the changelog entry** — in `src/app/noutati/page.tsx`, insert this object as the FIRST element of the `changelog` array (immediately after `const changelog: Version[] = [`):

```ts
  {
    version: "2.1.0",
    date: "20 Iunie 2026",
    title: "Antrenament nelimitat cu algoritm care invata ce gresesti",
    changes: [
      { text: "Mod nou de Antrenament: alegi tot, un modul sau o singura materie si raspunzi in continuu, fara limita de intrebari, pana vrei tu sa te opresti", type: "feature" },
      { text: "Algoritmul tine minte de la o zi la alta: intrebarile gresite revin mai des, cele stiute revin mai rar (dar tot revin), ca sa exersezi unde stai mai prost", type: "feature" },
      { text: "Vezi cate intrebari ai stapanit din materiile alese si cat de bine raspunzi pe parcurs; la final poti relua doar greselile, cu deduplicare", type: "improvement" },
      { text: "Tot ce raspunzi la Antrenament intra in aceleasi statistici ca Practica si Simulatorul", type: "improvement" },
    ],
  },
```

- [ ] **Step 3: Refresh the banner** — in `src/components/home/ChangelogBanner.tsx`, replace the `recentChanges` array with:

```ts
const recentChanges = [
  "Mod nou de Antrenament nelimitat: alegi tot, un modul sau o materie si exersezi in continuu",
  "Algoritm care invata ce gresesti: greselile revin mai des, cele stiute mai rar, de la o zi la alta",
  "Tot ce raspunzi la Antrenament intra in aceleasi statistici ca Practica si Simulatorul",
];
```

- [ ] **Step 4: Lint + manual**

Run: `npm run lint` — Expected: no errors.
Manual: `npm run dev`, open `/` (banner shows v2.1.0 + new bullets) and `/noutati` (new entry at top).

- [ ] **Step 5: Commit**

```bash
git add src/lib/site-config.ts src/app/noutati/page.tsx src/components/home/ChangelogBanner.tsx
git commit -m "feat: v2.1.0 - Antrenament nelimitat (changelog + banner)"
```

---

### Task 8: Final full-build verification

**Files:** none (verification only).

- [ ] **Step 1: Run the full test suite**

Run: `npm run test`
Expected: all suites pass, including `training.test.mjs`.

- [ ] **Step 2: Lint the whole project**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Production build with a dummy DATABASE_URL**

The local build throws without `DATABASE_URL` (it does not need a real DB, just a present value). Run (bash):

```bash
DATABASE_URL="postgresql://user:pass@ep-dummy.us-east-2.aws.neon.tech/db?sslmode=require" npm run build
```

or (PowerShell):

```powershell
$env:DATABASE_URL = "postgresql://user:pass@ep-dummy.us-east-2.aws.neon.tech/db?sslmode=require"; npm run build
```

Expected: build succeeds; `/antrenament` and `/antrenament/[sessionId]` appear in the route list.

- [ ] **Step 4: Final manual smoke test** — `npm run dev`, run one full loop: start Antrenament over a single subject, answer a few (one wrong on purpose), confirm the wrong one returns soon, refresh to confirm resume, "Încheie" -> summary -> "Refă greșitele" -> practice redo, then re-enter `/antrenament` and confirm "Continuă antrenamentul" resumes. Check `/rezultate` reflects the answers.

- [ ] **Step 5: Done** — no commit needed (verification only). If any step failed, fix it under the relevant task and re-run.

---

## Self-Review

**1. Spec coverage** (each spec section -> task):
- Algorithm / boxes / intervals / seeding / pick-next / mastered -> Task 1.
- Data model (`version: 1`, optional fields, migration, `clampLoadedBoxes`) -> Task 2.
- Hook actions (`startTraining`/`answerTraining`/`endTraining`/`getTrainingProgress`, `applyAnswerToSession` extraction) -> Task 2.
- Streaming runtime (forward-only, instant feedback, header, "Stăpânite") -> Task 4.
- Entry + scope selection (landing, SubjectSelector, resume) -> Task 3; home CTA -> Task 5.
- Ending + deduped summary + "Refă greșitele" via `startPractice` -> Task 4.
- Stats integration ("counts toward all data") -> Task 2 (`applyAnswerToSession` reused by `answerTraining`).
- WhatsNew popup (copy + key bump, vote kept) -> Task 6.
- Version bump + changelog + banner -> Task 7.
- `validation.ts` / API / db untouched -> asserted in Global Constraints and not in any task's file list. Covered.

**2. Placeholder scan:** No "TBD"/"TODO"/"similar to"/"add error handling" — every step has full code or an exact command + expected output. Clear.

**3. Type consistency:** `TrainingState` fields used by `useSession` (Task 2) and read by the runtime (Task 4) match (`pool`, `due`, `seq`, `currentQuestionId`, `lastQuestionId`, `seenIds`, `answeredCount`, `correctCount`, `optionOrder`, `shuffleOptions`, `subjectIds`, `startedAt`). Scheduler signatures in Task 1 (`seedBox`, `nextBox`, `intervalForBox`, `initSchedule`, `pickNext`, `applyAnswer`, `masteredCount`, `SchedulerState`) match their call sites in Task 2. `getTrainingProgress()` return shape (`answeredCount`, `correctCount`, `accuracy`, `masteredCount`, `poolSize`, `seenCount`) matches its use in Task 4. `startTraining(subjectIds, { shuffleOrder, shuffleOptions })` and `answerTraining(questionId, selected, isCorrect, timeSpentMs, subjectId)` signatures match between definition (Task 2) and callers (Tasks 3, 4). Consistent.

