# Universal Session History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Record practice and training sessions to history (exams already are), show all past sessions in one unified retryable timeline on `/rezultate` with per-session stats, reorder the practice-page CTAs, and ship as v2.3.0.

**Architecture:** Mirror the proven exam-history pattern. Each practice/training session is archived as a small stat *summary* snapshotted at end-time (global `answers` mutate later, so we never recompute historically). Pure builders + a merge/sort live in a new `session-history.ts`; `useSession` archives on session end/overwrite and exposes a merged history; a `SessionHistory` component renders the unified timeline.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, client-side `localStorage` via `useSession`. Pure-logic tests run `node --import ./scripts/register-alias.mjs scripts/<name>.test.mjs`.

## Global Constraints

- Persistence stays at `LocalSession.version = 1`. New fields are optional/additive; old saved sessions deserialize unchanged.
- Stats are snapshotted at the moment a session ends; never recomputed from global `answers` later.
- Archiving skips redo drills (sessions with `redoLineage`) and sessions with 0 answers.
- Keep at most 20 entries per type (`MAX_PRACTICE_HISTORY = 20`, `MAX_TRAINING_HISTORY = 20`).
- App UI copy keeps Romanian diacritics. Changelog copy (`noutati`, `ChangelogBanner`) is Romanian with NO diacritics. `WhatsNewModal` copy keeps diacritics.
- No em or en dashes in code or comments; use commas or a hyphen.
- `npm run build` needs `DATABASE_URL`; type-check with `npx tsc --noEmit` (no env needed). Date for the changelog entry: `21 Iunie 2026`.

---

### Task 1: Data model + pure session-history logic + tests

**Files:**
- Modify: `src/lib/session-types.ts` (add summary types, history arrays, max consts, move `ExamSummaryData` here)
- Modify: `src/hooks/useSession.ts` (remove the local `ExamSummaryData` definition; import it from session-types)
- Create: `src/lib/session-history.ts`
- Test: `scripts/session-history.test.mjs`
- Modify: `package.json` (register the test)

**Interfaces:**
- Produces: `interface PracticeSummary { id: string; startedAt: string; endedAt: string; mode: "practice" | "test"; subjectIds: string[]; questionIds: number[]; answered: number; correct: number; wrong: number; perModule: Record<string, { correct: number; total: number }>; durationMs: number }`
- Produces: `interface TrainingSummary { id: string; startedAt: string; endedAt: string; subjectIds: string[]; seenCount: number; answeredCount: number; correctCount: number; masteredAtEnd: number; poolSize: number }`
- Produces: `type SessionHistoryEntry = { kind: "exam"; date: string; exam: ExamSummaryData; questionIds: number[] } | { kind: "practice"; date: string; practice: PracticeSummary } | { kind: "training"; date: string; training: TrainingSummary }`
- Produces: `computePracticeSummary(practice, answers, resolveModule, id, endedAt): PracticeSummary`
- Produces: `computeTrainingSummary(training, masteredAtEnd, id, endedAt): TrainingSummary`
- Produces: `sortSessionHistory(entries): SessionHistoryEntry[]`

- [ ] **Step 1: Write the failing test**

Create `scripts/session-history.test.mjs`:

```js
import process from "node:process";
import assert from "node:assert/strict";
import { computePracticeSummary, computeTrainingSummary, sortSessionHistory } from "../src/lib/session-history.ts";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

const A = (answeredAt, isCorrect, timeSpentMs = 1000) => ({ selected: "a", isCorrect, answeredAt, timeSpentMs });

check("computePracticeSummary: counts this-session answers, splits correct/wrong, sums time, groups per module", () => {
  const practice = { questionIds: [1, 2, 3, 4], startedAt: "2026-06-21T10:00:00.000Z", mode: "practice", subjectIds: ["s1"] };
  const answers = {
    1: A("2026-06-21T10:01:00.000Z", true, 2000),
    2: A("2026-06-21T10:02:00.000Z", false, 3000),
    3: A("2026-06-20T09:00:00.000Z", true, 5000), // before session -> ignored
    // 4 never answered -> ignored
  };
  const mod = (id) => ({ 1: "m1", 2: "m1", 3: "m2", 4: "m2" })[id];
  const s = computePracticeSummary(practice, answers, mod, "pid", "2026-06-21T10:05:00.000Z");
  assert.equal(s.id, "pid");
  assert.equal(s.endedAt, "2026-06-21T10:05:00.000Z");
  assert.equal(s.mode, "practice");
  assert.deepEqual(s.questionIds, [1, 2, 3, 4]);
  assert.equal(s.answered, 2);
  assert.equal(s.correct, 1);
  assert.equal(s.wrong, 1);
  assert.equal(s.durationMs, 5000); // 2000 + 3000 (q3 excluded)
  assert.deepEqual(s.perModule, { m1: { correct: 1, total: 2 } });
});

check("computePracticeSummary: zero in-session answers -> answered 0, empty perModule", () => {
  const practice = { questionIds: [1], startedAt: "2026-06-21T10:00:00.000Z", mode: "test", subjectIds: [] };
  const s = computePracticeSummary(practice, {}, () => "m1", "x", "t");
  assert.equal(s.answered, 0);
  assert.equal(s.durationMs, 0);
  assert.deepEqual(s.perModule, {});
});

check("computeTrainingSummary: copies fields, seenCount from seenIds, passes masteredAtEnd", () => {
  const training = { subjectIds: ["s1", "s2"], pool: [1, 2, 3, 4, 5], seenIds: [1, 2, 3], answeredCount: 4, correctCount: 3, startedAt: "2026-06-21T09:00:00.000Z" };
  const s = computeTrainingSummary(training, 2, "tid", "2026-06-21T09:30:00.000Z");
  assert.equal(s.id, "tid");
  assert.deepEqual(s.subjectIds, ["s1", "s2"]);
  assert.equal(s.seenCount, 3);
  assert.equal(s.answeredCount, 4);
  assert.equal(s.correctCount, 3);
  assert.equal(s.masteredAtEnd, 2);
  assert.equal(s.poolSize, 5);
});

check("sortSessionHistory: newest first across all three types", () => {
  const entries = [
    { kind: "practice", date: "2026-06-21T10:00:00.000Z", practice: {} },
    { kind: "exam", date: "2026-06-21T12:00:00.000Z", exam: {}, questionIds: [] },
    { kind: "training", date: "2026-06-21T11:00:00.000Z", training: {} },
  ];
  assert.deepEqual(sortSessionHistory(entries).map((e) => e.kind), ["exam", "training", "practice"]);
});

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --import ./scripts/register-alias.mjs scripts/session-history.test.mjs`
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `../src/lib/session-history.ts`.

- [ ] **Step 3: Move `ExamSummaryData` into `session-types.ts` and add the new types**

In `src/lib/session-types.ts`, add this block immediately before `export interface LocalSession {`:

```ts
export interface ExamSummaryData {
  examId: string;
  total: number;
  answeredCount: number;
  unansweredCount: number;
  correctCount: number;
  wrongCount: number;
  score: number;
  perModule: Record<string, { correct: number; total: number }>;
  perSubject: Record<string, { correct: number; total: number }>;
  durationMs: number | null;
  submittedAt: string | null;
  startedAt: string;
  isRepeat: boolean;
  repeatShuffled: boolean;
}

export interface PracticeSummary {
  id: string;
  startedAt: string;
  endedAt: string;
  mode: "practice" | "test";
  subjectIds: string[];
  questionIds: number[];
  answered: number;
  correct: number;
  wrong: number;
  perModule: Record<string, { correct: number; total: number }>;
  durationMs: number;
}

export interface TrainingSummary {
  id: string;
  startedAt: string;
  endedAt: string;
  subjectIds: string[];
  seenCount: number;
  answeredCount: number;
  correctCount: number;
  masteredAtEnd: number;
  poolSize: number;
}
```

In `src/lib/session-types.ts`, add to `LocalSession` (after `examHistory: ExamState[];`):

```ts
  practiceHistory?: PracticeSummary[];
  trainingHistory?: TrainingSummary[];
```

Add the max constants next to `export const MAX_EXAM_HISTORY = 20;`:

```ts
export const MAX_PRACTICE_HISTORY = 20;
export const MAX_TRAINING_HISTORY = 20;
```

- [ ] **Step 4: Update `useSession.ts` to import `ExamSummaryData` instead of defining it**

In `src/hooks/useSession.ts`, DELETE the local `export interface ExamSummaryData { ... }` block (the full interface). Then add `ExamSummaryData` to the existing type import from `@/lib/session-types`, for example:

```ts
  type ExamState,
  type ExamSummaryData,
```

`computeExamSummary` keeps returning `ExamSummaryData` (now imported). No other change in this step.

- [ ] **Step 5: Create `src/lib/session-history.ts`**

```ts
import type {
  AnswerRecord,
  ExamSummaryData,
  PracticeState,
  PracticeSummary,
  TrainingState,
  TrainingSummary,
} from "./session-types";

export type SessionHistoryEntry =
  | { kind: "exam"; date: string; exam: ExamSummaryData; questionIds: number[] }
  | { kind: "practice"; date: string; practice: PracticeSummary }
  | { kind: "training"; date: string; training: TrainingSummary };

/** Stats for one practice session, snapshotted from the answers it produced. */
export function computePracticeSummary(
  practice: Pick<PracticeState, "questionIds" | "startedAt" | "mode" | "subjectIds">,
  answers: Record<number, AnswerRecord>,
  resolveModule: (id: number) => string | undefined,
  id: string,
  endedAt: string,
): PracticeSummary {
  let correct = 0;
  let wrong = 0;
  let durationMs = 0;
  const perModule: Record<string, { correct: number; total: number }> = {};
  for (const qId of practice.questionIds) {
    const a = answers[qId];
    if (!a || a.answeredAt < practice.startedAt) continue;
    const mod = resolveModule(qId);
    if (mod) {
      if (!perModule[mod]) perModule[mod] = { correct: 0, total: 0 };
      perModule[mod].total += 1;
      if (a.isCorrect) perModule[mod].correct += 1;
    }
    if (a.isCorrect) correct += 1;
    else wrong += 1;
    durationMs += a.timeSpentMs;
  }
  return {
    id,
    startedAt: practice.startedAt,
    endedAt,
    mode: practice.mode,
    subjectIds: practice.subjectIds,
    questionIds: practice.questionIds,
    answered: correct + wrong,
    correct,
    wrong,
    perModule,
    durationMs,
  };
}

/** Stats for one training session (field copy + a mastered-count snapshot). */
export function computeTrainingSummary(
  training: Pick<TrainingState, "subjectIds" | "pool" | "seenIds" | "answeredCount" | "correctCount" | "startedAt">,
  masteredAtEnd: number,
  id: string,
  endedAt: string,
): TrainingSummary {
  return {
    id,
    startedAt: training.startedAt,
    endedAt,
    subjectIds: training.subjectIds,
    seenCount: training.seenIds.length,
    answeredCount: training.answeredCount,
    correctCount: training.correctCount,
    masteredAtEnd,
    poolSize: training.pool.length,
  };
}

/** Merge the three histories newest-first by their date field. Pure. */
export function sortSessionHistory(entries: SessionHistoryEntry[]): SessionHistoryEntry[] {
  return [...entries].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
```

- [ ] **Step 6: Register the test in `package.json` and run the full suite**

In `package.json`, in the `test` script, insert after `scripts/question-text.test.mjs && `:

```
node --import ./scripts/register-alias.mjs scripts/session-history.test.mjs && 
```

(so it sits between `question-text.test.mjs` and `search.test.mjs`).

Run: `node --import ./scripts/register-alias.mjs scripts/session-history.test.mjs`
Expected: PASS, "All tests passed".
Run: `npm test`
Expected: every suite passes.
Run: `npx tsc --noEmit`
Expected: clean (the `ExamSummaryData` move compiles).

- [ ] **Step 7: Commit**

```bash
git add src/lib/session-types.ts src/hooks/useSession.ts src/lib/session-history.ts scripts/session-history.test.mjs package.json
git commit -m "feat: session-history types and pure summary builders"
```

---

### Task 2: Archive + read history in useSession

**Files:**
- Modify: `src/hooks/useSession.ts`

**Interfaces:**
- Consumes: `computePracticeSummary`, `computeTrainingSummary`, `sortSessionHistory`, `SessionHistoryEntry` (Task 1); `masteredCount` (already imported); `getQuestion` (already imported).
- Produces: `getSessionHistory(): SessionHistoryEntry[]` and `clearSessionHistory(): void` on the hook's return.

- [ ] **Step 1: Import the new helpers**

In `src/hooks/useSession.ts`, add to imports:

```ts
import { computePracticeSummary, computeTrainingSummary, sortSessionHistory, type SessionHistoryEntry } from "@/lib/session-history";
```

Add `MAX_PRACTICE_HISTORY, MAX_TRAINING_HISTORY` and `type PracticeSummary, type TrainingSummary` to the existing `@/lib/session-types` import.

- [ ] **Step 2: Add the archive helpers (module-level, near `archiveExamIfSubmitted`)**

```ts
function archivePracticeIfRecordable(prev: LocalSession): PracticeSummary[] {
  const p = prev.currentPractice;
  const hist = prev.practiceHistory ?? [];
  if (!p || p.redoLineage) return hist; // skip non-sessions and redo drills
  const summary = computePracticeSummary(
    p,
    prev.answers,
    (id) => getQuestion(id)?.moduleId,
    crypto.randomUUID(),
    new Date().toISOString(),
  );
  if (summary.answered === 0) return hist; // skip empty sessions
  return [summary, ...hist].slice(0, MAX_PRACTICE_HISTORY);
}

function archiveTrainingIfRecordable(prev: LocalSession): TrainingSummary[] {
  const t = prev.currentTraining;
  const hist = prev.trainingHistory ?? [];
  if (!t || t.answeredCount === 0) return hist;
  const mastered = masteredCount(t.pool, prev.trainingBoxes ?? {}, prev.answers);
  const summary = computeTrainingSummary(t, mastered, crypto.randomUUID(), new Date().toISOString());
  return [summary, ...hist].slice(0, MAX_TRAINING_HISTORY);
}
```

- [ ] **Step 3: Normalize the new arrays in `loadSession`**

In `loadSession`, in the returned object (next to `examHistory: Array.isArray(parsed.examHistory) ? parsed.examHistory : [],`), add:

```ts
      practiceHistory: Array.isArray(parsed.practiceHistory) ? parsed.practiceHistory : [],
      trainingHistory: Array.isArray(parsed.trainingHistory) ? parsed.trainingHistory : [],
```

- [ ] **Step 4: Archive at the four call sites**

In `startPractice`, change the `setSession` updater body from:

```ts
        const updated = { ...prev, currentPractice: practice };
        saveSession(updated);
        return updated;
```

to:

```ts
        const updated = { ...prev, currentPractice: practice, practiceHistory: archivePracticeIfRecordable(prev) };
        saveSession(updated);
        return updated;
```

In `endPractice`, change:

```ts
      const updated = { ...prev, currentPractice: null };
```

to:

```ts
      const updated = { ...prev, currentPractice: null, practiceHistory: archivePracticeIfRecordable(prev) };
```

In `startTraining`, change the updater's `const updated = { ...prev, currentTraining: training };` to:

```ts
        const updated = { ...prev, currentTraining: training, trainingHistory: archiveTrainingIfRecordable(prev) };
```

In `endTraining`, change `const updated = { ...prev, currentTraining: null };` to:

```ts
      const updated = { ...prev, currentTraining: null, trainingHistory: archiveTrainingIfRecordable(prev) };
```

- [ ] **Step 5: Add `getSessionHistory` and `clearSessionHistory`**

Add these `useCallback`s (near `getExamHistorySummaries`):

```ts
  const getSessionHistory = useCallback((): SessionHistoryEntry[] => {
    const exams = (session.examHistory ?? []).map((e) => ({
      kind: "exam" as const,
      date: e.submittedAt ?? e.startedAt,
      exam: computeExamSummary(e),
      questionIds: e.questionIds,
    }));
    const practices = (session.practiceHistory ?? []).map((p) => ({
      kind: "practice" as const,
      date: p.endedAt,
      practice: p,
    }));
    const trainings = (session.trainingHistory ?? []).map((t) => ({
      kind: "training" as const,
      date: t.endedAt,
      training: t,
    }));
    return sortSessionHistory([...exams, ...practices, ...trainings]);
  }, [session.examHistory, session.practiceHistory, session.trainingHistory]);

  const clearSessionHistory = useCallback(() => {
    setSession((prev) => {
      const updated = { ...prev, examHistory: [], practiceHistory: [], trainingHistory: [] };
      persistSession(updated);
      return updated;
    });
  }, [persistSession]);
```

Add `getSessionHistory` and `clearSessionHistory` to the hook's returned object.

- [ ] **Step 6: Type-check, lint, tests**

Run: `npx tsc --noEmit` (expect clean).
Run: `npm run lint` (expect 0 errors; pre-existing warnings OK).
Run: `npm test` (expect all suites pass).
Do NOT run `npm run build` (needs DATABASE_URL).

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useSession.ts
git commit -m "feat: archive practice/training sessions and expose merged history"
```

---

### Task 3: Unified SessionHistory timeline on /rezultate

**Files:**
- Create: `src/components/results/SessionHistory.tsx`
- Modify: `src/app/rezultate/page.tsx`

**Interfaces:**
- Consumes: `getSessionHistory`, `clearSessionHistory` (Task 2); `startPractice`, `startTraining`, `repeatExamFromIds` (existing on `useSession`); `SessionHistoryEntry`, `PracticeSummary` (Task 1); `timeAgo` and `formatPercentage` from `@/lib/utils`; `getQuestion` from `@/data`.
- Produces: a `<SessionHistory>` section rendered on `/rezultate`.

- [ ] **Step 1: Confirm the `timeAgo` import source**

Open `src/components/results/ExamHistoryModal.tsx` and note where it imports `timeAgo` from (it is used as `timeAgo(s.submittedAt)`). Use the same import path in the new component. If `timeAgo` is a local helper there rather than in `@/lib/utils`, lift it into `@/lib/utils` (export `timeAgo`) and update `ExamHistoryModal` to import it from there. Verify with: `grep -n "timeAgo" src/components/results/ExamHistoryModal.tsx src/lib/utils.ts`.

- [ ] **Step 2: Create `src/components/results/SessionHistory.tsx`**

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { modules } from "@/data/modules";
import { formatPercentage, timeAgo } from "@/lib/utils";
import type { SessionHistoryEntry, PracticeSummary } from "@/lib/session-history";

const TYPE_META: Record<string, { label: string }> = {
  exam: { label: "Simulare" },
  practice: { label: "Practică" },
  training: { label: "Antrenament" },
};

interface SessionHistoryProps {
  entries: SessionHistoryEntry[];
  onRetryExam: (questionIds: number[]) => void;
  onRetryPractice: (practice: PracticeSummary) => void;
  onRetryTraining: (subjectIds: string[]) => void;
  onClear?: () => void;
  className?: string;
}

const INITIAL_VISIBLE = 15;

export function SessionHistory({ entries, onRetryExam, onRetryPractice, onRetryTraining, onClear, className }: SessionHistoryProps) {
  const [showAll, setShowAll] = useState(false);
  if (entries.length === 0) return null;
  const visible = showAll ? entries : entries.slice(0, INITIAL_VISIBLE);

  return (
    <section className={className}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
          Istoric sesiuni
        </h2>
        {onClear && (
          <button onClick={onClear} className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-wrong)] transition-colors cursor-pointer">
            Șterge istoricul
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {visible.map((entry) => {
          const meta = TYPE_META[entry.kind];
          return (
            <div key={`${entry.kind}-${entry.kind === "exam" ? entry.exam.examId : entry.kind === "practice" ? entry.practice.id : entry.training.id}`} className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3.5">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.12em] bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)] border-opacity-30 flex-shrink-0">
                  {meta.label}
                </span>

                <div className="min-w-0 flex-1">
                  {entry.kind === "exam" && (
                    <div className="text-sm text-[var(--color-text-primary)]">
                      <span className="font-bold tabular-nums">{entry.exam.score.toFixed(2)}</span>
                      <span className="text-[var(--color-text-tertiary)]"> · {entry.exam.correctCount}/{entry.exam.total} corecte</span>
                    </div>
                  )}
                  {entry.kind === "practice" && (
                    <div className="text-sm text-[var(--color-text-primary)]">
                      <span className="font-bold tabular-nums">{formatPercentage(entry.practice.correct, entry.practice.answered)}%</span>
                      <span className="text-[var(--color-text-tertiary)]"> · {entry.practice.correct}/{entry.practice.answered} corecte</span>
                    </div>
                  )}
                  {entry.kind === "training" && (
                    <div className="text-sm text-[var(--color-text-primary)]">
                      <span className="font-bold tabular-nums">{entry.training.seenCount}</span>
                      <span className="text-[var(--color-text-tertiary)]"> văzute · {entry.training.masteredAtEnd}/{entry.training.poolSize} stăpânite</span>
                    </div>
                  )}
                  <div className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">{timeAgo(entry.date)}</div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {entry.kind === "exam" && (
                    <Link href={`/simulator/${entry.exam.examId}`} className="text-xs font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
                      Vezi
                    </Link>
                  )}
                  <button
                    onClick={() =>
                      entry.kind === "exam"
                        ? onRetryExam(entry.questionIds)
                        : entry.kind === "practice"
                          ? onRetryPractice(entry.practice)
                          : onRetryTraining(entry.training.subjectIds)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)] border-opacity-40 hover:bg-[var(--color-accent)] hover:text-[#0C0C0E] transition-colors cursor-pointer"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="1 4 1 10 7 10" />
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    </svg>
                    Reia
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {entries.length > INITIAL_VISIBLE && (
        <button onClick={() => setShowAll((v) => !v)} className="mt-3 text-xs font-medium text-[var(--color-accent)] hover:underline cursor-pointer">
          {showAll ? "Arată mai puține" : `Vezi tot (${entries.length})`}
        </button>
      )}
    </section>
  );
}
```

Note: `modules` is imported for potential color use but the cards above keep a single accent; remove the `modules` import if the implementer does not use it (avoid an unused-import lint error).

- [ ] **Step 3: Wire it into `/rezultate`**

In `src/app/rezultate/page.tsx`:
- Add to the `useSession()` destructure: `getSessionHistory, clearSessionHistory, startPractice, startTraining, repeatExamFromIds` (keep existing ones; you may remove `getExamHistorySummaries`/`clearExamHistory` if they become unused here).
- Add imports: `import { useRouter } from "next/navigation";`, `import { getQuestion } from "@/data";`, `import { SessionHistory } from "@/components/results/SessionHistory";`, and `import type { PracticeSummary } from "@/lib/session-history";`.
- Add `const router = useRouter();` and the retry handlers:

```tsx
  const handleRetryExam = (questionIds: number[]) => {
    const newId = repeatExamFromIds(questionIds, false);
    if (newId) router.push(`/simulator/${newId}`);
  };
  const handleRetryPractice = (p: PracticeSummary) => {
    const ids = p.questionIds.filter((id) => getQuestion(id) !== undefined);
    if (ids.length === 0) return;
    const newId = startPractice(p.subjectIds, ids, { mode: p.mode });
    router.push(`/practica/${newId}`);
  };
  const handleRetryTraining = (subjectIds: string[]) => {
    const newId = startTraining(subjectIds);
    if (newId) router.push(`/antrenament/${newId}`);
  };
```

- Replace the existing `<ExamHistoryButton history={examHistory} onClear={clearExamHistory} ... />` usage (around lines 61-66) with:

```tsx
            <SessionHistory
              entries={getSessionHistory()}
              onRetryExam={handleRetryExam}
              onRetryPractice={handleRetryPractice}
              onRetryTraining={handleRetryTraining}
              onClear={clearSessionHistory}
              className="animate-fade-in"
            />
```

Remove the now-unused `ExamHistoryButton` import and the `examHistory`/`getExamHistorySummaries` local if they are no longer referenced on this page. Leave `ExamHistoryButton`/`ExamHistoryModal` files intact (still used by the simulator result screen).

- [ ] **Step 4: Type-check, lint, build, manual smoke**

Run: `npx tsc --noEmit` (clean).
Run: `npm run lint` (0 errors; no new warnings).
Run: `DATABASE_URL="postgresql://u:p@ep-dummy-123.us-east-2.aws.neon.tech/neondb?sslmode=require" npm run build` (succeeds).
Manual (dev server): do a practice batch, end it, open `/rezultate` -> the session shows under "Istoric sesiuni" with stats; "Reia" re-runs it. Repeat for a training run. Confirm exams still appear with a "Vezi" link and "Reia".

- [ ] **Step 5: Commit**

```bash
git add src/components/results/SessionHistory.tsx src/app/rezultate/page.tsx src/lib/utils.ts src/components/results/ExamHistoryModal.tsx
git commit -m "feat: unified session history timeline on rezultate"
```

(Include `utils.ts`/`ExamHistoryModal.tsx` only if Step 1 lifted `timeAgo`.)

---

### Task 4: Practice-page CTA reorder

**Files:**
- Modify: `src/app/practica/page.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: Simulator + Antrenament CTAs render under "Reia ce ai de recuperat".

- [ ] **Step 1: Move the two CTA blocks**

In `src/app/practica/page.tsx`, cut the Simulator `<Link href="/simulator"> ... </Link>` block (the "Simulator Examen Licență" CTA) and the `<AntrenamentCrossSell className="mb-8" />` line that currently sit ABOVE the `{(wrongIds.length > 0 || markedIds.length > 0) && ( ... )}` "Reia ce ai de recuperat" block, and paste them immediately AFTER that block's closing `)}` and BEFORE `<SubjectSelector ... />`. Keep the markup identical; only the order changes.

- [ ] **Step 2: Type-check, lint, manual**

Run: `npx tsc --noEmit` (clean).
Run: `npm run lint` (0 errors).
Manual: on `/practica`, the order is now title -> "Reia ce ai de recuperat" (when present) -> Simulator CTA -> Antrenament CTA -> subject selector.

- [ ] **Step 3: Commit**

```bash
git add src/app/practica/page.tsx
git commit -m "feat: move simulator/antrenament CTAs under 'Reia ce ai de recuperat'"
```

---

### Task 5: Release - version, changelog, banner

**Files:**
- Modify: `src/lib/site-config.ts`
- Modify: `src/app/noutati/page.tsx`
- Modify: `src/components/home/ChangelogBanner.tsx`

**Interfaces:**
- Consumes: nothing (copy only).

- [ ] **Step 1: Bump the version**

In `src/lib/site-config.ts`, change `export const APP_VERSION = "2.2.2";` to `export const APP_VERSION = "2.3.0";`.

- [ ] **Step 2: Add the changelog entry (no diacritics)**

In `src/app/noutati/page.tsx`, insert as the first element of the `changelog` array (before the `version: "2.2.2"` entry):

```ts
  {
    version: "2.3.0",
    date: "21 Iunie 2026",
    title: "Istoric pentru toate sesiunile, cu reluare",
    changes: [
      { text: "Acum se salveaza in istoric si sesiunile de practica si de antrenament, nu doar simularile; le gasesti pe pagina Rezultate, cu statistici si un buton de reluare, ca sa reiei oricand o sesiune", type: "feature" },
      { text: "Fiecare sesiune din istoric arata cum a mers: acuratete si corecte din total la practica, cate ai vazut si cate ai stapanit la antrenament, nota la simulari", type: "improvement" },
      { text: "Pe pagina de Practica, butoanele Simulator si Antrenament au fost mutate sub 'Reia ce ai de recuperat'", type: "improvement" },
    ],
  },
```

- [ ] **Step 3: Update the homepage banner**

In `src/components/home/ChangelogBanner.tsx`, replace the `recentChanges` array with (no diacritics):

```ts
const recentChanges = [
  "Istoric pentru toate sesiunile (practica, antrenament, simulari), cu statistici si reluare, pe Rezultate",
  "Reiei orice sesiune trecuta dintr-un singur clic",
  "Pe Practica, butoanele Simulator si Antrenament sunt acum sub 'Reia ce ai de recuperat'",
];
```

- [ ] **Step 4: Type-check, lint**

Run: `npx tsc --noEmit` (clean).
Run: `npm run lint` (0 errors).

- [ ] **Step 5: Commit**

```bash
git add src/lib/site-config.ts src/app/noutati/page.tsx src/components/home/ChangelogBanner.tsx
git commit -m "feat: v2.3.0 changelog, banner, version bump"
```

---

### Task 6: Release - What's-New popup, gate key, final verification

**Files:**
- Modify: `src/components/home/WhatsNewModal.tsx`
- Modify: `src/components/home/WhatsNewGate.tsx`

**Interfaces:**
- Consumes: nothing (copy only).

- [ ] **Step 1: Rewrite section 1 of the What's-New popup**

In `src/components/home/WhatsNewModal.tsx`, replace the entire first `<section> ... </section>` (the one whose version pill currently reads `v2.2.0` and heading is "Reia greșelile fără să pierzi sesiunea mare") with the block below. Leave the divider and the second section (the Gen-E vote) unchanged.

```tsx
        {/* Section 1: the new feature */}
        <section>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mb-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)] border-opacity-30">
            v2.3.0
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)] mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Istoric pentru toate sesiunile, cu reluare
          </h3>
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Acum se salvează în istoric <span className="font-semibold text-[var(--color-text-primary)]">toate</span> sesiunile,
            nu doar simulările: practica și antrenamentul apar pe pagina Rezultate, fiecare cu statisticile ei și un buton de reluare.
          </p>

          <div className="mt-3 space-y-2">
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="flex-shrink-0 text-[var(--color-accent)]" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                </span>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
                  Vezi cum a mers fiecare sesiune
                </p>
              </div>
              <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                Acuratețe și corecte din total la practică, câte ai văzut și câte ai stăpânit la antrenament, nota la simulări.
              </p>
            </div>
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="flex-shrink-0 text-[var(--color-accent)]" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                </span>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
                  Reia orice sesiune dintr-un clic
                </p>
              </div>
              <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                Din istoric reiei exact aceeași sesiune oricând vrei, fără să o reconstruiești.
              </p>
            </div>
          </div>

          <Link
            href="/rezultate"
            onClick={onClose}
            className="mt-3 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[#0C0C0E] font-bold text-sm transition-all duration-200 hover:bg-[var(--color-accent-hover)] active:scale-[0.98]"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
          >
            Vezi Rezultatele
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </section>
```

- [ ] **Step 2: Bump the gate key**

In `src/components/home/WhatsNewGate.tsx`, change `const WHATSNEW_KEY = "utm-whatsnew-v220";` to `const WHATSNEW_KEY = "utm-whatsnew-v230";`.

- [ ] **Step 3: Full verification**

Run: `npx tsc --noEmit` (clean).
Run: `npm run lint` (0 errors; pre-existing warnings only).
Run: `npm test` (every suite passes).
Run: `DATABASE_URL="postgresql://u:p@ep-dummy-123.us-east-2.aws.neon.tech/neondb?sslmode=require" npm run build` (succeeds, all routes emitted).

- [ ] **Step 4: Manual smoke**

With existing data: load a page -> the "Ce e nou" popup appears once (gate key changed) showing the v2.3.0 session-history content with the Gen-E section below. The homepage banner shows `v2.3.0`; `/noutati` lists v2.3.0 on top.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/WhatsNewModal.tsx src/components/home/WhatsNewGate.tsx
git commit -m "feat: announce v2.3.0 session history in What's-New popup"
```

---

## Self-Review

**Spec coverage:**
- Data model (summaries, history arrays, max, ExamSummaryData move) -> Task 1.
- Pure builders + sort + tests -> Task 1.
- Archiving (skip redo drills + empty; on start-overwrite + on end) -> Task 2.
- Read merged history + clear -> Task 2.
- Retry (practice/training/exam) -> Task 3 handlers.
- Unified timeline UI on /rezultate -> Task 3.
- CTA reorder -> Task 4.
- Release (version, changelog, banner) -> Task 5; What's-New popup + gate -> Task 6.
- Testing/build with DATABASE_URL -> Task 1 Step 6, Task 3 Step 4, Task 6 Step 3.

**Placeholder scan:** No TBD/TODO; every code step shows complete code. The two "verify the import source"/"remove if unused" notes (Task 3 Step 1, Step 2 `modules` import) are concrete instructions, not deferred work.

**Type consistency:** `PracticeSummary`, `TrainingSummary`, `ExamSummaryData`, `SessionHistoryEntry`, `computePracticeSummary`, `computeTrainingSummary`, `sortSessionHistory`, `getSessionHistory`, `clearSessionHistory` are named identically across tasks. Retry handlers use the existing `startPractice(subjectIds, questionIds, opts)`, `startTraining(subjectIds)`, `repeatExamFromIds(ids, shuffleOrder)` signatures.

## Notes for the implementer

- Apply tasks in order. Quote bracketed paths in git: `"src/app/practica/[sessionId]/page.tsx"` (none here, but `simulator/[examId]` etc. elsewhere).
- Do not push; this repo commits directly to `main`.
- `crypto.randomUUID()` is already used in `useSession` (e.g. `startExam`); safe to reuse in the archive helpers.
