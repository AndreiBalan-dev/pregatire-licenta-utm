# Provocare History, Review, Marking, Redo - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** After a Provocare game finishes, log it into the local `/rezultate` history, let the player review every question (correct/wrong + explanation), bookmark questions, and one-click "Refă greșitele" - right after the game or anytime later.

**Architecture:** 100% client-side, mirroring the Simulator exam pattern. A finished game is snapshotted into a `ChallengeSummary` in `localStorage` (`LocalSession.challengeHistory`), merged leniently into global stats on read (like exams), reviewed via the shared `QuestionCard`, and redone through the existing redo-lineage machinery (new `origin.kind: "challenge"`). No server, DB, Pusher, or account changes.

**Tech Stack:** Next.js 16 (App Router, client components), React 19, TypeScript, localStorage persistence, pure-logic tests as node `.mjs` scripts.

## Global Constraints

- **Target version:** 3.1.2. Commit directly to `main`. Do NOT push (the user pushes explicitly; this session was not asked to).
- **No server/DB/Pusher/account changes.** Only the local player's own per-question results are saved, in localStorage. (Spec scope guard.)
- **Question id is `number`**; `AnswerKey` (`"a"|"b"|"c"|"d"`) is imported from `@/data/types`.
- **Copy rules:** changelog (`noutati`) + `ChangelogBanner` text is Romanian with **no diacritics** ("intrebari", "raspuns", "refa"). In-app UI component text (modals, review screen) uses **full diacritics** ("Răspunsurile tale", "Înapoi"). Never use em/en dashes in copy or comments; use commas or "-".
- **JSX copy:** never put a raw ASCII `"` or `'` in JSX children - eslint `react/no-unescaped-entities` fails the build. Use curly quotes „ ” / ’ or rephrase. (All copy in this plan already complies.)
- **Build requires a dummy `DATABASE_URL`** locally: `$env:DATABASE_URL = "postgresql://u:p@ep-dummy-123.us-east-1.aws.neon.tech/neondb?sslmode=require"; npm run build`. Tests and lint do not need it.
- **No React test runner** exists. Pure logic is tested via node `.mjs` scripts registered in `package.json` (run with `node --import ./scripts/register-alias.mjs scripts/<name>.test.mjs`). UI/hook tasks are verified by `npx tsc --noEmit`, `npm run lint`, the dummy-URL build, and a manual smoke check.
- **No What's-New popup** for this release (routine feature bump). Touch only the 3 standard release files.
- `crypto.randomUUID()` / `new Date()` are fine in client component and hook code (this is not a workflow script).

---

### Task 1: Data model + pure logic + tests

**Files:**
- Modify: `src/lib/session-types.ts` (add types/constant near lines 15-26, 165, 177, 189)
- Modify: `src/lib/session-history.ts` (extend union ~line 15; add builders)
- Modify: `src/lib/redo.ts` (add `wrongIdsInChallenge`)
- Modify: `src/lib/answer-merge.ts` (add `foldChallengeAnswers` + call it)
- Create: `scripts/challenge-history.test.mjs`
- Modify: `package.json` (register the new test)

**Interfaces:**
- Produces: `ChallengeSummary`, `ChallengeAnswerRecord` (session-types); `RedoLineage.origin.kind` now includes `"challenge"`; `LocalSession.challengeHistory?`; `MAX_CHALLENGE_HISTORY`; `buildChallengeSummary(args): ChallengeSummary` and `addChallengeToHistory(history, summary, max): ChallengeSummary[]` (session-history); the `{kind:"challenge"}` `SessionHistoryEntry` variant; `wrongIdsInChallenge(summary, correctOf): number[]` (redo); `foldChallengeAnswers(merged, challengeHistory, correctOf): void` (answer-merge).

- [ ] **Step 1: Add types + constant to `src/lib/session-types.ts`**

Change the `RedoLineage.origin.kind` line (currently `kind: "exam" | "practice";`) to:
```ts
    kind: "exam" | "practice" | "challenge";
```
Add after the `TrainingSummary` interface (after line 165):
```ts
export interface ChallengeAnswerRecord {
  questionId: number;
  selected: AnswerKey | null;   // null = timed out / never answered
  isCorrect: boolean;           // play-time snapshot (server-computed during the game)
}

export interface ChallengeSummary {
  id: string;                   // crypto.randomUUID() at record time
  code: string;                 // lobby code: idempotency key + display
  playedAt: string;             // ISO
  preset: "custom" | "simulare";
  scoring: "points" | "correct" | "nota";
  questionIds: number[];        // the player's served order (existing questions only)
  answers: ChallengeAnswerRecord[];
  correctCount: number;
  total: number;
  rank: number | null;
  players: number;
  durationMs: number | null;
}
```
Add to the `LocalSession` interface after `trainingHistory?` (line 177):
```ts
  /** Finished Provocare games (this device's own results). Optional/additive. */
  challengeHistory?: ChallengeSummary[];
```
Add after `MAX_TRAINING_HISTORY` (line 189):
```ts
export const MAX_CHALLENGE_HISTORY = 20;
```
(`AnswerKey` is already imported at the top of the file. `createDefaultSession` needs no change - `challengeHistory`, like `practiceHistory`, is optional and normalized on load.)

- [ ] **Step 2: Write the failing tests** `scripts/challenge-history.test.mjs`

```js
import process from "node:process";
import assert from "node:assert/strict";
import { buildChallengeSummary, addChallengeToHistory } from "../src/lib/session-history.ts";
import { wrongIdsInChallenge } from "../src/lib/redo.ts";
import { foldChallengeAnswers } from "../src/lib/answer-merge.ts";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

check("buildChallengeSummary: drops deleted ids, empty selected -> null, counts correct", () => {
  const s = buildChallengeSummary({
    code: "ABC123",
    questionOrder: [1, 2, 3, 4],
    answers: [
      { questionId: 1, selected: "a", isCorrect: true },
      { questionId: 2, selected: "b", isCorrect: false },
      { questionId: 3, selected: "", isCorrect: false }, // timed out
      // 4 deleted (exists=false)
    ],
    preset: "custom", scoring: "points", rank: 2, players: 3, durationMs: 12345,
    id: "sum-1", playedAt: "2026-06-29T10:00:00.000Z",
    exists: (id) => id !== 4,
  });
  assert.deepEqual(s.questionIds, [1, 2, 3]);
  assert.equal(s.total, 3);
  assert.equal(s.correctCount, 1);
  assert.deepEqual(s.answers, [
    { questionId: 1, selected: "a", isCorrect: true },
    { questionId: 2, selected: "b", isCorrect: false },
    { questionId: 3, selected: null, isCorrect: false },
  ]);
  assert.equal(s.rank, 2);
  assert.equal(s.players, 3);
  assert.equal(s.scoring, "points");
});

check("addChallengeToHistory: prepends, idempotent by code, capped", () => {
  const a = { code: "A", id: "1" };
  const b = { code: "B", id: "2" };
  const h1 = addChallengeToHistory([], a, 20);
  assert.deepEqual(h1.map((c) => c.code), ["A"]);
  const h2 = addChallengeToHistory(h1, b, 20);
  assert.deepEqual(h2.map((c) => c.code), ["B", "A"]);
  const h3 = addChallengeToHistory(h2, a, 20); // dup code -> unchanged
  assert.deepEqual(h3.map((c) => c.code), ["B", "A"]);
  const capped = addChallengeToHistory([{ code: "X" }, { code: "Y" }], { code: "Z" }, 2);
  assert.deepEqual(capped.map((c) => c.code), ["Z", "X"]);
});

check("wrongIdsInChallenge: wrong + unanswered in, correct out, unknown skipped, current key wins", () => {
  const s = {
    questionIds: [10, 20, 30, 40],
    answers: [
      { questionId: 10, selected: "a", isCorrect: true },
      { questionId: 20, selected: "b", isCorrect: false },
      { questionId: 30, selected: null, isCorrect: false }, // timed out
      // 40 unknown
    ],
  };
  const correctOf = (id) => ({ 10: "a", 20: "a", 30: "c" })[id]; // 40 -> undefined
  assert.deepEqual(wrongIdsInChallenge(s, correctOf), [20, 30]);
});

check("foldChallengeAnswers: lenient upgrade, never downgrade, skip null + unknown", () => {
  const merged = new Map([[1, { isCorrect: false }], [2, { isCorrect: true }]]);
  const history = [{
    code: "C1",
    answers: [
      { questionId: 1, selected: "a", isCorrect: true },   // upgrades 1 -> true
      { questionId: 2, selected: "x", isCorrect: false },  // wrong: must NOT downgrade 2
      { questionId: 3, selected: "a", isCorrect: true },   // new -> true
      { questionId: 4, selected: null, isCorrect: false }, // skip (unanswered)
      { questionId: 5, selected: "a", isCorrect: true },   // unknown question -> skip
    ],
  }];
  const correctOf = (id) => ({ 1: "a", 2: "a", 3: "a" })[id]; // 4,5 -> undefined
  foldChallengeAnswers(merged, history, correctOf);
  assert.equal(merged.get(1).isCorrect, true);
  assert.equal(merged.get(2).isCorrect, true);
  assert.equal(merged.get(3).isCorrect, true);
  assert.equal(merged.has(4), false);
  assert.equal(merged.has(5), false);
});

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
```

- [ ] **Step 3: Register the test in `package.json`**

In the `"test"` script, append before the closing quote (after `scripts/rate-limit.test.mjs`):
```
 && node --import ./scripts/register-alias.mjs scripts/challenge-history.test.mjs
```

- [ ] **Step 4: Run the test, verify it FAILS**

Run: `node --import ./scripts/register-alias.mjs scripts/challenge-history.test.mjs`
Expected: FAIL - `buildChallengeSummary`/`addChallengeToHistory`/`wrongIdsInChallenge`/`foldChallengeAnswers` are not exported yet (import error or "not a function").

- [ ] **Step 5: Implement `buildChallengeSummary` + `addChallengeToHistory` in `src/lib/session-history.ts`**

Update the imports (add `AnswerKey`, `ChallengeSummary`, `ChallengeAnswerRecord`):
```ts
import type { AnswerKey } from "@/data/types";
import type {
  AnswerRecord,
  ExamState,
  ExamSummaryData,
  PracticeState,
  PracticeSummary,
  TrainingState,
  TrainingSummary,
  ChallengeSummary,
  ChallengeAnswerRecord,
} from "./session-types";
```
Extend the `SessionHistoryEntry` union:
```ts
export type SessionHistoryEntry =
  | { kind: "exam"; date: string; exam: ExamSummaryData; questionIds: number[] }
  | { kind: "practice"; date: string; practice: PracticeSummary }
  | { kind: "training"; date: string; training: TrainingSummary }
  | { kind: "challenge"; date: string; challenge: ChallengeSummary };
```
Add the two functions (e.g. after `computeTrainingSummary`):
```ts
/** Build a ChallengeSummary from the local player's /state snapshot at finish. Pure. */
export function buildChallengeSummary(args: {
  code: string;
  questionOrder: number[];
  answers: { questionId: number; selected: string; isCorrect: boolean }[];
  preset: "custom" | "simulare";
  scoring: "points" | "correct" | "nota";
  rank: number | null;
  players: number;
  durationMs: number | null;
  id: string;
  playedAt: string;
  exists: (id: number) => boolean;
}): ChallengeSummary {
  const byId = new Map(args.answers.map((a) => [a.questionId, a]));
  const ids = args.questionOrder.filter((id) => args.exists(id));
  const answers: ChallengeAnswerRecord[] = ids.map((id) => {
    const a = byId.get(id);
    const selected = a && a.selected ? (a.selected as AnswerKey) : null;
    return { questionId: id, selected, isCorrect: !!a && a.isCorrect };
  });
  return {
    id: args.id,
    code: args.code,
    playedAt: args.playedAt,
    preset: args.preset,
    scoring: args.scoring,
    questionIds: ids,
    answers,
    correctCount: answers.filter((a) => a.isCorrect).length,
    total: ids.length,
    rank: args.rank,
    players: args.players,
    durationMs: args.durationMs,
  };
}

/** Prepend a challenge summary, idempotent by code, newest-first, capped. Pure. */
export function addChallengeToHistory(
  history: ChallengeSummary[] | undefined,
  summary: ChallengeSummary,
  max: number,
): ChallengeSummary[] {
  const hist = history ?? [];
  if (hist.some((c) => c.code === summary.code)) return hist;
  return [summary, ...hist].slice(0, max);
}
```

- [ ] **Step 6: Implement `wrongIdsInChallenge` in `src/lib/redo.ts`**

Add `ChallengeSummary` to the type import and append the function:
```ts
import type { AnswerRecord, PracticeState, ExamState, ChallengeSummary } from "./session-types";
```
```ts
/**
 * Question ids the user got wrong in a finished challenge - INCLUDING timed-out
 * / unanswered ones (selected === null). Correctness is recomputed against the
 * current answer key (like wrongIdsInExam), so a since-corrected answer is
 * respected. `correctOf` returns undefined for an unknown question (skipped).
 */
export function wrongIdsInChallenge(
  summary: Pick<ChallengeSummary, "questionIds" | "answers">,
  correctOf: (id: number) => AnswerKey | undefined,
): number[] {
  const byId = new Map(summary.answers.map((a) => [a.questionId, a]));
  return summary.questionIds.filter((id) => {
    const correct = correctOf(id);
    if (correct === undefined) return false;
    const a = byId.get(id);
    return !a || a.selected === null || a.selected !== correct;
  });
}
```

- [ ] **Step 7: Implement `foldChallengeAnswers` in `src/lib/answer-merge.ts`**

Update imports:
```ts
import { getQuestion } from "@/data";
import type { AnswerKey } from "@/data/types";
import type { LocalSession, ExamState, ChallengeSummary } from "./session-types";
```
Add the exported helper (e.g. above `buildMergedAnswerMap`):
```ts
/**
 * Fold finished-challenge answers into a merged map, leniently (a correct answer
 * upgrades, a wrong one never downgrades), like exams. Correctness is recomputed
 * via `correctOf`. Unanswered (null) and unknown questions are skipped. Pure.
 */
export function foldChallengeAnswers(
  merged: Map<number, MergedAnswer>,
  challengeHistory: ChallengeSummary[] | undefined,
  correctOf: (id: number) => AnswerKey | undefined,
): void {
  for (const ch of challengeHistory ?? []) {
    for (const a of ch.answers) {
      if (a.selected === null) continue;
      const correct = correctOf(a.questionId);
      if (correct === undefined) continue;
      const isCorrect = a.selected === correct;
      const existing = merged.get(a.questionId);
      if (!existing) merged.set(a.questionId, { isCorrect });
      else if (isCorrect && !existing.isCorrect) merged.set(a.questionId, { isCorrect: true });
    }
  }
}
```
Inside `buildMergedAnswerMap`, just before `return merged;`, add:
```ts
  foldChallengeAnswers(merged, session.challengeHistory, (id) => getQuestion(id)?.correctAnswer);
```

- [ ] **Step 8: Run the test, verify it PASSES**

Run: `node --import ./scripts/register-alias.mjs scripts/challenge-history.test.mjs`
Expected: PASS (all 4 checks), ending "All tests passed".

- [ ] **Step 9: Typecheck**

Run: `npx tsc --noEmit`
Expected: no output (clean).

- [ ] **Step 10: Commit**

```bash
git add src/lib/session-types.ts src/lib/session-history.ts src/lib/redo.ts src/lib/answer-merge.ts scripts/challenge-history.test.mjs package.json
git commit -m "feat(challenge): challenge-history types + pure logic (summary, redo, merge fold)"
```

---

### Task 2: Hook wiring in `useSession`

**Files:**
- Modify: `src/hooks/useSession.ts` (loadSession ~166, add `recordChallenge`, extend `getSessionHistory` ~743-765, return ~818-852)

**Interfaces:**
- Consumes: `addChallengeToHistory`, `MAX_CHALLENGE_HISTORY`, `ChallengeSummary` (Task 1).
- Produces: `recordChallenge(summary: ChallengeSummary): void` on the hook return; `getSessionHistory()` now includes `{kind:"challenge"}` entries; `challengeHistory` normalized on load.

- [ ] **Step 1: Add imports**

Add `ChallengeSummary` and `MAX_CHALLENGE_HISTORY` to the `session-types` import, and `addChallengeToHistory` to the `session-history` import (match the file's existing import style for those modules).

- [ ] **Step 2: Normalize `challengeHistory` in `loadSession`**

In the `merged` object (after the `trainingHistory` line ~166):
```ts
      challengeHistory: Array.isArray(parsed.challengeHistory) ? parsed.challengeHistory : [],
```

- [ ] **Step 3: Add `recordChallenge` (place near `toggleBookmark`, ~line 343)**

```ts
  const recordChallenge = useCallback((summary: ChallengeSummary) => {
    setSession((prev) => {
      const hist = prev.challengeHistory ?? [];
      if (hist.some((c) => c.code === summary.code)) return prev; // already recorded
      const updated = { ...prev, challengeHistory: addChallengeToHistory(hist, summary, MAX_CHALLENGE_HISTORY) };
      persistSession(updated);
      return updated;
    });
  }, [persistSession]);
```

- [ ] **Step 4: Include challenges in `getSessionHistory`**

Before the `return sortSessionHistory([...])` (line 764), add:
```ts
    const challenges = (session.challengeHistory ?? []).map((c) => ({
      kind: "challenge" as const,
      date: c.playedAt,
      challenge: c,
    }));
```
Change the return to:
```ts
    return sortSessionHistory([...exams, ...practices, ...trainings, ...challenges]);
```
Add `session.challengeHistory` to the dependency array on line 765.

- [ ] **Step 5: Expose `recordChallenge`**

Add `recordChallenge,` to the object returned by the hook (the `return { ... }` at line 818).

- [ ] **Step 6: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useSession.ts
git commit -m "feat(challenge): recordChallenge + challenge entries in session history"
```

---

### Task 3: `ChallengeReview` component

**Files:**
- Create: `src/components/challenge/ChallengeReview.tsx`

**Interfaces:**
- Consumes: `ChallengeSummary` (Task 1), `wrongIdsInChallenge` (Task 1), shared `QuestionCard`, `computeScore` from `@/lib/exam`, `getQuestion` from `@/data`.
- Produces: `ChallengeReview` component with props `{ summary: ChallengeSummary; bookmarks: number[]; onToggleBookmark: (id: number) => void; onRedo: () => void; onBack: () => void }`.

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useMemo } from "react";
import { getQuestion } from "@/data";
import { QuestionCard } from "@/components/practice/QuestionCard";
import { computeScore } from "@/lib/exam";
import { wrongIdsInChallenge } from "@/lib/redo";
import type { ChallengeSummary } from "@/lib/session-types";
import type { AnswerKey } from "@/data/types";

interface ChallengeReviewProps {
  summary: ChallengeSummary;
  bookmarks: number[];
  onToggleBookmark: (id: number) => void;
  onRedo: () => void;
  onBack: () => void;
}

export function ChallengeReview({ summary, bookmarks, onToggleBookmark, onRedo, onBack }: ChallengeReviewProps) {
  const wrongCount = useMemo(
    () => wrongIdsInChallenge(summary, (id) => getQuestion(id)?.correctAnswer).length,
    [summary],
  );
  const byId = useMemo(() => new Map(summary.answers.map((a) => [a.questionId, a])), [summary]);

  const resultLabel =
    summary.scoring === "nota"
      ? `Nota ${computeScore(summary.correctCount).toFixed(2)}`
      : `${summary.correctCount}/${summary.total} corecte`;

  return (
    <main className="relative max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4 gap-3">
        <button
          onClick={onBack}
          className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
        >
          ← Înapoi
        </button>
        {wrongCount > 0 && (
          <button
            onClick={onRedo}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-md)] text-sm font-semibold bg-[var(--color-accent)] text-[#0C0C0E] hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Refă greșitele ({wrongCount})
          </button>
        )}
      </div>

      <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1" style={{ fontFamily: "var(--font-display)" }}>
        Răspunsurile tale
      </h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-6">
        {resultLabel}{summary.rank ? ` · Locul ${summary.rank}/${summary.players}` : ""}
      </p>

      <div className="space-y-6">
        {summary.questionIds.map((id, i) => {
          const q = getQuestion(id);
          if (!q) return null;
          const selected = (byId.get(id)?.selected ?? null) as AnswerKey | null;
          return (
            <div key={id}>
              <QuestionCard
                question={q}
                questionNumber={i + 1}
                totalQuestions={summary.questionIds.length}
                selectedAnswer={selected}
                showFeedback
                isBookmarked={bookmarks.includes(id)}
                onSelectAnswer={() => {}}
                onBookmark={() => onToggleBookmark(id)}
              />
              {selected === null && (
                <p className="mt-1.5 text-xs text-[var(--color-text-tertiary)]">Fără răspuns</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-medium hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer"
        >
          Înapoi
        </button>
        {wrongCount > 0 && (
          <button
            onClick={onRedo}
            className="flex-1 py-3 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[#0C0C0E] font-semibold hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Refă greșitele ({wrongCount})
          </button>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit` then `npm run lint`
Expected: both clean (no `react/no-unescaped-entities` - the copy uses diacritics/`←`, no raw ASCII quotes).

- [ ] **Step 3: Commit**

```bash
git add src/components/challenge/ChallengeReview.tsx
git commit -m "feat(challenge): ChallengeReview per-question review component"
```

---

### Task 4: Capture on finish + review from results + redo badge

**Files:**
- Modify: `src/app/provocare/[code]/page.tsx` (imports; record effect; summary + review state; redo; finished branch)
- Modify: `src/components/challenge/ResultsScreen.tsx` (add `onReview` prop + button)
- Modify: `src/app/practica/[sessionId]/page.tsx` (redo badge, line 414)

**Interfaces:**
- Consumes: `buildChallengeSummary`, `wrongIdsInChallenge`, `recordChallenge`, `startPractice`, `toggleBookmark`, `ChallengeReview`, `ChallengeSummary`, `getQuestion`.
- Produces: a finished game is recorded once (idempotent by code); the results screen offers "Vezi răspunsurile"; redo navigates to `/practica/{id}`; the redo badge reads "Reluare din provocare" for challenge-origin drills.

- [ ] **Step 1: Add `onReview` to `ResultsScreen`**

Change the signature (line 21) to add `onReview`:
```tsx
export function ResultsScreen({ standings, meId, scoreMode = "points", onReview }: { standings: Standing[]; meId?: number; scoreMode?: ScoreMode; onReview?: () => void }) {
```
Replace the actions block (the `<div className="flex gap-3"> ... </div>` at lines 82-96) with:
```tsx
        <div className="space-y-3">
          {onReview && (
            <button
              onClick={onReview}
              className="w-full text-center px-5 py-3 rounded-[var(--radius-md)] bg-[var(--color-bg-secondary)] border border-[var(--color-accent)] border-opacity-40 text-[var(--color-accent)] font-semibold transition-colors hover:bg-[var(--color-accent-muted)] cursor-pointer"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Vezi răspunsurile
            </button>
          )}
          <div className="flex gap-3">
            <Link
              href="/provocare"
              className="flex-1 text-center px-5 py-3 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[#0C0C0E] font-semibold transition-colors hover:bg-[var(--color-accent-hover)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Provocare nouă
            </Link>
            <Link
              href="/"
              className="flex-1 text-center px-5 py-3 rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-medium transition-colors hover:bg-[var(--color-bg-hover)]"
            >
              Acasă
            </Link>
          </div>
        </div>
```

- [ ] **Step 2: Update the redo badge in `src/app/practica/[sessionId]/page.tsx` (line 414)**

Replace:
```tsx
                {lineage?.origin.kind === "exam" ? "Reluare din simulare" : "Reluare din sesiune"}
```
with:
```tsx
                {lineage?.origin.kind === "exam" ? "Reluare din simulare" : lineage?.origin.kind === "challenge" ? "Reluare din provocare" : "Reluare din sesiune"}
```

- [ ] **Step 3: Wire capture + review into `src/app/provocare/[code]/page.tsx`**

Update the React import to include `useRef`:
```ts
import { useEffect, useState, useCallback, useRef } from "react";
```
Add these imports near the other `@/` imports:
```ts
import { useRouter } from "next/navigation";
import { getQuestion } from "@/data";
import { useSession } from "@/hooks/useSession";
import { buildChallengeSummary } from "@/lib/session-history";
import { wrongIdsInChallenge } from "@/lib/redo";
import { ChallengeReview } from "@/components/challenge/ChallengeReview";
import type { ChallengeSummary } from "@/lib/session-types";
```
Inside `LobbyPage`, after the existing `useState` declarations (around line 46), add:
```ts
  const router = useRouter();
  const { recordChallenge, startPractice, toggleBookmark, session } = useSession();
  const [summary, setSummary] = useState<ChallengeSummary | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const recordedRef = useRef(false);
```
Add the record-on-finish effect among the other effects (above the early returns at line 133). It derives standings locally because `liveStandings` is declared below the early returns:
```ts
  useEffect(() => {
    const snap = snapshot;
    const finished = snap?.status === "finished" || status === "finished";
    if (!finished || recordedRef.current || !snap?.me) return;
    const rows = standings.length ? standings : (snap.standings ?? []);
    const me = rows.find((s) => s.playerId === snap.me.playerId);
    const built = buildChallengeSummary({
      code,
      questionOrder: snap.me.questionOrder ?? snap.questionIds ?? [],
      answers: snap.me.answers,
      preset: snap.config.preset === "simulare" ? "simulare" : "custom",
      scoring: snap.config.preset === "simulare" ? "nota" : snap.config.scoring === "correct" ? "correct" : "points",
      rank: me?.rank ?? null,
      players: rows.length,
      durationMs: me?.totalTimeMs ?? null,
      id: crypto.randomUUID(),
      playedAt: new Date().toISOString(),
      exists: (qid) => !!getQuestion(qid),
    });
    recordedRef.current = true;
    setSummary(built); // eslint-disable-line react-hooks/set-state-in-effect
    recordChallenge(built);
  }, [snapshot, status, standings, code, recordChallenge]);
```
Add a redo helper (near `onStart`):
```ts
  function startChallengeRedo(s: ChallengeSummary) {
    const wrongIds = wrongIdsInChallenge(s, (id) => getQuestion(id)?.correctAnswer);
    if (!wrongIds.length) return;
    const newId = startPractice([], wrongIds, {
      mode: "practice",
      redoLineage: { origin: { kind: "challenge", questionIds: s.questionIds }, firstWrong: wrongIds },
    });
    router.push(`/practica/${newId}`);
  }
```
Replace the finished branch (lines 138-140) with:
```tsx
  if (snapshot.status === "finished" || status === "finished") {
    if (reviewing && summary) {
      return (
        <ChallengeReview
          summary={summary}
          bookmarks={session.bookmarks}
          onToggleBookmark={toggleBookmark}
          onRedo={() => startChallengeRedo(summary)}
          onBack={() => setReviewing(false)}
        />
      );
    }
    return (
      <ResultsScreen
        standings={liveStandings}
        meId={snapshot.me?.playerId}
        scoreMode={snapshot.config.preset === "simulare" ? "nota" : snapshot.config.scoring === "correct" ? "correct" : "points"}
        onReview={summary ? () => setReviewing(true) : undefined}
      />
    );
  }
```

- [ ] **Step 4: Typecheck + lint**

Run: `npx tsc --noEmit` then `npm run lint`
Expected: clean. (If tsc flags `snap.me` as possibly null, confirm the guard is `if (!finished || recordedRef.current || !snap?.me) return;` - that narrows both `snap` and `snap.me`.)

- [ ] **Step 5: Build with dummy DATABASE_URL**

Run: `$env:DATABASE_URL = "postgresql://u:p@ep-dummy-123.us-east-1.aws.neon.tech/neondb?sslmode=require"; npm run build`
Expected: build succeeds (exit 0).

- [ ] **Step 6: Commit**

```bash
git add src/app/provocare/[code]/page.tsx src/components/challenge/ResultsScreen.tsx src/app/practica/[sessionId]/page.tsx
git commit -m "feat(challenge): record finished game, review from results, redo + badge"
```

---

### Task 5: Provocare entry in the session-history timeline

**Files:**
- Modify: `src/components/results/SessionHistory.tsx` (TYPE_META, props, key, challenge headline + actions)
- Modify: `src/app/rezultate/page.tsx` (imports, review state, handlers, render `ChallengeReview` overlay)

**Interfaces:**
- Consumes: `getSessionHistory()` now yields challenge entries (Task 2); `ChallengeReview` (Task 3); `wrongIdsInChallenge`, `startPractice`, `toggleBookmark`, `ChallengeSummary`, `computeScore`.
- Produces: a "Provocare" card on `/rezultate` with "Vezi răspunsurile" (opens review) and "Refă greșitele" (redo).

- [ ] **Step 1: Extend `SessionHistory.tsx`**

Update imports:
```ts
import { formatPercentage, timeAgo } from "@/lib/utils";
import { computeScore } from "@/lib/exam";
import type { SessionHistoryEntry } from "@/lib/session-history";
import type { PracticeSummary, ChallengeSummary } from "@/lib/session-types";
```
Add to `TYPE_META`:
```ts
  challenge: { label: "Provocare" },
```
Add two props to `SessionHistoryProps`:
```ts
  onReviewChallenge?: (c: ChallengeSummary) => void;
  onRedoChallenge?: (c: ChallengeSummary) => void;
```
Add them to the destructured params:
```ts
export function SessionHistory({ entries, onRetryExam, onRetryPractice, onRetryTraining, onReviewChallenge, onRedoChallenge, onClear, className }: SessionHistoryProps) {
```
Update the `key` expression (line 48) to handle challenge:
```tsx
            <div key={`${entry.kind}-${entry.kind === "exam" ? entry.exam.examId : entry.kind === "practice" ? entry.practice.id : entry.kind === "training" ? entry.training.id : entry.challenge.id}`} className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3.5">
```
Add a challenge headline block after the `training` headline block (after line 72):
```tsx
                  {entry.kind === "challenge" && (
                    <div className="text-sm text-[var(--color-text-primary)]">
                      <span className="font-bold tabular-nums">
                        {entry.challenge.scoring === "nota" ? computeScore(entry.challenge.correctCount).toFixed(2) : `${entry.challenge.correctCount}/${entry.challenge.total}`}
                      </span>
                      <span className="text-[var(--color-text-tertiary)]">
                        {entry.challenge.scoring === "nota" ? ` · ${entry.challenge.correctCount}/${entry.challenge.total} corecte` : " corecte"}{entry.challenge.rank ? ` · Locul ${entry.challenge.rank}/${entry.challenge.players}` : ""}
                      </span>
                    </div>
                  )}
```
Replace the actions block (lines 76-98, the `<div className="flex items-center gap-2 flex-shrink-0"> ... </div>`) with a version that branches challenge vs the rest:
```tsx
                <div className="flex items-center gap-2 flex-shrink-0">
                  {entry.kind === "exam" && (
                    <Link href={`/simulator/${entry.exam.examId}`} className="text-xs font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
                      Vezi
                    </Link>
                  )}
                  {entry.kind === "challenge" ? (
                    <>
                      <button
                        onClick={() => onReviewChallenge?.(entry.challenge)}
                        className="text-xs font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
                      >
                        Vezi
                      </button>
                      <button
                        onClick={() => onRedoChallenge?.(entry.challenge)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)] border-opacity-40 hover:bg-[var(--color-accent)] hover:text-[#0C0C0E] transition-colors cursor-pointer"
                      >
                        Refă greșitele
                      </button>
                    </>
                  ) : (
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
                  )}
                </div>
```

- [ ] **Step 2: Wire the review overlay + redo in `src/app/rezultate/page.tsx`**

Update imports:
```ts
import { useMemo, useState } from "react";
import { ChallengeReview } from "@/components/challenge/ChallengeReview";
import { wrongIdsInChallenge } from "@/lib/redo";
import type { PracticeSummary, ChallengeSummary } from "@/lib/session-types";
```
Add `toggleBookmark` to the `useSession()` destructure (line 21):
```ts
  const { session, isLoaded, getOverallStats, getExamSummary, getSessionHistory, clearSessionHistory, startPractice, startTraining, repeatExamFromIds, toggleBookmark } = useSession();
```
Add review state (after `const router = useRouter();`):
```ts
  const [reviewChallenge, setReviewChallenge] = useState<ChallengeSummary | null>(null);
```
Add handlers (next to the other `handleRetry*`):
```ts
  const handleRedoChallenge = (c: ChallengeSummary) => {
    const wrongIds = wrongIdsInChallenge(c, (id) => getQuestion(id)?.correctAnswer);
    if (!wrongIds.length) return;
    const newId = startPractice([], wrongIds, {
      mode: "practice",
      redoLineage: { origin: { kind: "challenge", questionIds: c.questionIds }, firstWrong: wrongIds },
    });
    router.push(`/practica/${newId}`);
  };
```
Pass the two new props to `<SessionHistory>`:
```tsx
            onReviewChallenge={setReviewChallenge}
            onRedoChallenge={handleRedoChallenge}
```
Render the review overlay just before the closing `</>` of the returned fragment (after `<MobileNav />`):
```tsx
      {reviewChallenge && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-[var(--color-bg-primary)]">
          <ChallengeReview
            summary={reviewChallenge}
            bookmarks={session.bookmarks}
            onToggleBookmark={toggleBookmark}
            onRedo={() => handleRedoChallenge(reviewChallenge)}
            onBack={() => setReviewChallenge(null)}
          />
        </div>
      )}
```

- [ ] **Step 3: Typecheck + lint + build**

Run: `npx tsc --noEmit` then `npm run lint` then `$env:DATABASE_URL = "postgresql://u:p@ep-dummy-123.us-east-1.aws.neon.tech/neondb?sslmode=require"; npm run build`
Expected: all clean / build exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/results/SessionHistory.tsx src/app/rezultate/page.tsx
git commit -m "feat(challenge): provocare card in session history with review + redo"
```

---

### Task 6: Release v3.1.2

**Files:**
- Modify: `src/lib/site-config.ts` (line 16)
- Modify: `src/app/noutati/page.tsx` (prepend entry)
- Modify: `src/components/home/ChangelogBanner.tsx` (recentChanges)

**Interfaces:**
- Consumes: nothing new. Pure release bookkeeping. No `WhatsNewGate`/`WhatsNewModal` change (no popup).

- [ ] **Step 1: Bump the version**

In `src/lib/site-config.ts` line 16:
```ts
export const APP_VERSION = "3.1.2";
```

- [ ] **Step 2: Prepend the changelog entry**

In `src/app/noutati/page.tsx`, insert as the new first element of the `changelog` array (before the `3.1.1` entry). No diacritics:
```tsx
  {
    version: "3.1.2",
    date: "29 Iunie 2026",
    title: "Provocare: istoric, revizuire si refacerea greselilor",
    changes: [
      { text: "Dupa o provocare, jocul se salveaza in istoricul tau de pe pagina Rezultate: poti vedea oricand ce ai raspuns la fiecare intrebare, corect sau gresit", type: "feature" },
      { text: "Poti reface greselile dintr-o provocare cu un singur buton, ca o sesiune de practica, fie imediat dupa joc, fie mai tarziu din istoric", type: "feature" },
      { text: "Poti marca intrebari direct din revizuirea provocarii; le regasesti la Marcate, ca peste tot", type: "feature" },
      { text: "Raspunsurile din Provocare conteaza acum la progresul tau general, ca la Simulator", type: "improvement" },
    ],
  },
```

- [ ] **Step 3: Refresh the homepage banner**

In `src/components/home/ChangelogBanner.tsx`, replace the `recentChanges` array (no diacritics):
```ts
const recentChanges = [
  "Provocare: jocul se salveaza in istoric si poti vedea ce ai raspuns corect sau gresit",
  "Refa greselile dintr-o provocare cu un buton, imediat sau mai tarziu din istoric",
  "Poti marca intrebari din revizuirea unei provocari, le gasesti la Marcate",
];
```

- [ ] **Step 4: Typecheck + lint + build**

Run: `npx tsc --noEmit` then `npm run lint` then `$env:DATABASE_URL = "postgresql://u:p@ep-dummy-123.us-east-1.aws.neon.tech/neondb?sslmode=require"; npm run build`
Expected: all clean / build exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/lib/site-config.ts src/app/noutati/page.tsx src/components/home/ChangelogBanner.tsx
git commit -m "chore: release v3.1.2 - provocare history, review, marking, redo"
```

---

### Task 7: Full verification + manual smoke

**Files:** none (verification only).

- [ ] **Step 1: Full test suite**

Run: `npm test`
Expected: ends "All tests passed", including `challenge-history.test.mjs`; existing `redo*`, `challenge-*`, `session-history` suites still green.

- [ ] **Step 2: Lint + typecheck + build**

Run: `npm run lint` ; `npx tsc --noEmit` ; `$env:DATABASE_URL = "postgresql://u:p@ep-dummy-123.us-east-1.aws.neon.tech/neondb?sslmode=require"; npm run build`
Expected: 0 errors; build exit 0.

- [ ] **Step 3: Manual smoke (dev server)**

Run `npm run dev`, then in the browser:
1. Create + start a custom Provocare (host plays), answer some right and some wrong, let it finish.
2. On the results screen, click "Vezi răspunsurile" - confirm each question shows your pick vs the correct answer + explanation; a timed-out/blank one shows "Fără răspuns".
3. Bookmark one question; open `/revizuire` and confirm it appears under "Marcate".
4. Back on the review, click "Refă greșitele (N)" - confirm a `/practica/{id}` drill opens badged "Reluare din provocare" with exactly the wrong+unanswered questions.
5. Go to `/rezultate` - confirm a "Provocare" card with correct/total (+ Locul) and `timeAgo`; "Vezi" reopens the review, "Refă greșitele" opens the drill.
6. Finish the drill; confirm the per-module stats / recovery pool reflect the game (lenient merge).
7. Repeat the finish->record for a Simulare-preset game (nota label) and a custom "correct"-scoring game.
8. Reload a finished lobby URL once more - confirm it does NOT create a duplicate `/rezultate` entry (idempotent by code).

- [ ] **Step 4: Confirm no stray working-tree changes**

Run: `git status --short`
Expected: clean (all task commits landed; no untracked source files from subagents).

---

## Notes for the orchestrator (post-implementation)

- After all tasks pass, update memory: extend [[provocare-challenge-feature]] with the history/review/redo addition (v3.1.2) and [[release-version-bump]] with the v3.1.2 entry (no popup; confirms the no-popup default for a feature bump).
- Do not push unless the user asks.
