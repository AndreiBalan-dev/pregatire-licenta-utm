# Redo wrong answers from the result — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the user redo only the wrong answers from the session/exam they just finished, in place, from the result popup (practice) and the results page (simulator), with shuffle-order / shuffle-answers options.

**Architecture:** Pure wrong-id helpers in `src/lib/redo.ts` (unit-tested via the existing node runner). Shared option controls in `src/components/review/RedoControls.tsx`. The practice "Rezumat Sesiune" modal gains an in-modal redo sub-view (back-chevron via a new optional `Modal` `onBack` prop). The simulator's existing `ExamRestartModal` gains a scope selector + a page-level "Refă greșitele" CTA; the wrong path routes to a `/practica` test-drill (honest accuracy) while "Toate" stays a real repeat exam.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, localStorage session model. No UI test runner; pure logic tested with `node` (`npm test`); UI verified with `npm run lint` + `npm run build` + manual app check.

**Reference spec:** `docs/superpowers/specs/2026-06-16-redo-wrong-from-results-design.md`

---

## File structure

- Create `src/lib/redo.ts` — pure functions `wrongIdsInPractice`, `wrongIdsInExam`.
- Create `scripts/redo.test.mjs` — unit tests for the above; wired into `npm test`.
- Create `src/components/review/RedoControls.tsx` — `ScopeSelector`, `OrderSelector`, `ShuffleAnswersToggle` (shared look for both surfaces).
- Modify `src/components/ui/Modal.tsx` — optional `onBack` prop (back-chevron, top-left).
- Modify `src/components/exam/ExamRestartModal.tsx` — consume shared controls; add scope; new props/`onConfirm` shape.
- Modify `src/app/simulator/[examId]/page.tsx` — wrong ids, page CTA, scope-aware confirm, pull `startPractice`.
- Modify `src/app/practica/[sessionId]/page.tsx` — redo sub-view, CTA, launch handler.
- Modify `src/lib/site-config.ts`, `src/app/noutati/page.tsx`, `src/components/home/ChangelogBanner.tsx`, `package.json` — release.

---

## Task 1: Pure wrong-id helpers (`src/lib/redo.ts`) + tests

**Files:**
- Create: `src/lib/redo.ts`
- Test: `scripts/redo.test.mjs`
- Modify: `package.json:10`

- [ ] **Step 1: Write the failing test**

Create `scripts/redo.test.mjs`:

```js
import process from "node:process";
import assert from "node:assert/strict";
import { wrongIdsInPractice, wrongIdsInExam } from "../src/lib/redo.ts";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

const A = (answeredAt, isCorrect) => ({ selected: "a", isCorrect, answeredAt, timeSpentMs: 0 });

check("wrongIdsInPractice: only this-session, answered-and-wrong, existing questions", () => {
  const practice = { questionIds: [1, 2, 3, 4, 5], startedAt: "2026-06-16T10:00:00.000Z" };
  const answers = {
    1: A("2026-06-16T10:01:00.000Z", false), // wrong, this session -> in
    2: A("2026-06-16T10:02:00.000Z", true),  // correct -> out
    3: A("2026-06-16T09:00:00.000Z", false), // wrong but BEFORE session -> out
    4: A("2026-06-16T10:03:00.000Z", false), // wrong, this session, but missing question -> out
    // 5: never answered -> out
  };
  const exists = (id) => id !== 4;
  assert.deepEqual(wrongIdsInPractice(practice, answers, exists), [1]);
});

check("wrongIdsInExam: missing OR incorrect count as wrong; unknown questions skipped", () => {
  const exam = { questionIds: [10, 20, 30, 40], answers: { 10: "a", 20: "b" } };
  // correct: 10->a (right), 20->a (so 20 wrong), 30 missing (wrong), 40 unknown (skip)
  const correctOf = (id) => ({ 10: "a", 20: "a", 30: "c" })[id];
  assert.deepEqual(wrongIdsInExam(exam, correctOf), [20, 30]);
});

check("empty inputs -> empty arrays", () => {
  assert.deepEqual(wrongIdsInPractice({ questionIds: [], startedAt: "x" }, {}, () => true), []);
  assert.deepEqual(wrongIdsInExam({ questionIds: [], answers: {} }, () => "a"), []);
});

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
```

- [ ] **Step 2: Wire the test into `npm test`**

In `package.json`, replace line 10 with (chains both suites):

```json
    "test": "node --import ./scripts/register-alias.mjs scripts/practice-selection.test.mjs && node --import ./scripts/register-alias.mjs scripts/redo.test.mjs"
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/lib/redo.ts'` (or import error).

- [ ] **Step 4: Implement `src/lib/redo.ts`**

```ts
import type { AnswerKey } from "@/data/types";
import type { AnswerRecord, PracticeState, ExamState } from "./session-types";

/**
 * Question ids the user answered INCORRECTLY during THIS practice session.
 * "This session" = answered at/after `startedAt` (ISO strings compare
 * chronologically). Unanswered questions are not "wrong answers". `exists`
 * filters out ids whose question no longer resolves.
 */
export function wrongIdsInPractice(
  practice: Pick<PracticeState, "questionIds" | "startedAt">,
  answers: Record<number, AnswerRecord>,
  exists: (id: number) => boolean,
): number[] {
  return practice.questionIds.filter((id) => {
    const a = answers[id];
    return !!a && a.answeredAt >= practice.startedAt && !a.isCorrect && exists(id);
  });
}

/**
 * Question ids the user got wrong in an exam — INCLUDING unanswered ones,
 * which count against the score. `correctOf` returns the correct key, or
 * undefined for an unknown question (skipped).
 */
export function wrongIdsInExam(
  exam: Pick<ExamState, "questionIds" | "answers">,
  correctOf: (id: number) => AnswerKey | undefined,
): number[] {
  return exam.questionIds.filter((id) => {
    const correct = correctOf(id);
    if (correct === undefined) return false;
    return exam.answers[id] !== correct;
  });
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — both suites end with "All tests passed".

- [ ] **Step 6: Commit**

```bash
git add src/lib/redo.ts scripts/redo.test.mjs package.json
git commit -m "feat: add wrong-id helpers for session-scoped redo"
```

---

## Task 2: `Modal` gains an optional `onBack` prop

**Files:**
- Modify: `src/components/ui/Modal.tsx`

- [ ] **Step 1: Add `onBack` to the props interface**

Replace the `ModalProps` interface (lines 6-12) with:

```ts
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  /** When set, renders a back-chevron at the top-left (e.g. a wizard sub-view). */
  onBack?: () => void;
}
```

- [ ] **Step 2: Destructure `onBack`**

Change `export function Modal({ open, onClose, title, children, className }: ModalProps) {` to:

```ts
export function Modal({ open, onClose, title, children, className, onBack }: ModalProps) {
```

- [ ] **Step 3: Render the back button + pad the title**

Immediately AFTER the closing `</button>` of the close (X) button (after line 105, before the `{title && (` block), insert:

```tsx
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Înapoi"
            className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 inline-flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer z-10"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
```

Then change the title `<h2>` className from `"text-xl font-bold mb-4 pr-8 text-[var(--color-text-primary)]"` to include left padding when a back button is present:

```tsx
          className={cn(
            "text-xl font-bold mb-4 pr-8 text-[var(--color-text-primary)]",
            onBack && "pl-9",
          )}
```

(`cn` is already imported at the top of the file.)

- [ ] **Step 4: Verify build + lint**

Run: `npm run lint && npm run build`
Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Modal.tsx
git commit -m "feat: optional back-chevron (onBack) for Modal sub-views"
```

---

## Task 3: Shared redo controls (`src/components/review/RedoControls.tsx`)

This lifts the existing `OrderCard` look into a reusable `OrderSelector`, plus a new `ScopeSelector` and `ShuffleAnswersToggle`, all matching the current `ExamRestartModal` styling.

**Files:**
- Create: `src/components/review/RedoControls.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type RedoScope = "all" | "wrong";
export type OrderChoice = "same" | "shuffled";

/* ----- Scope: "Doar greșite (N)" vs all ----- */

interface ScopeSelectorProps {
  scope: RedoScope;
  onScope: (s: RedoScope) => void;
  wrongCount: number;
  allCount: number;
  /** Label for the "everything" option, e.g. "Toată sesiunea" or "Toate (36)". */
  allLabel: string;
}

export function ScopeSelector({ scope, onScope, wrongCount, allCount, allLabel }: ScopeSelectorProps) {
  const noWrong = wrongCount === 0;
  return (
    <div>
      <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-tertiary)] mb-2.5 block">
        Ce reiei
      </span>
      <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Ce reiei">
        <ScopeCard
          label="Doar greșite"
          count={wrongCount}
          accent="var(--color-wrong)"
          selected={scope === "wrong"}
          disabled={noWrong}
          onSelect={() => onScope("wrong")}
        />
        <ScopeCard
          label={allLabel}
          count={allCount}
          accent="var(--color-accent)"
          selected={scope === "all"}
          onSelect={() => onScope("all")}
        />
      </div>
    </div>
  );
}

interface ScopeCardProps {
  label: string;
  count: number;
  accent: string;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

function ScopeCard({ label, count, accent, selected, disabled, onSelect }: ScopeCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "relative text-left p-3.5 rounded-[var(--radius-md)] border transition-all duration-200",
        disabled
          ? "opacity-40 cursor-not-allowed border-[var(--color-border)] bg-[var(--color-bg-primary)]"
          : selected
            ? "cursor-pointer border-[var(--color-accent)] bg-[var(--color-accent-muted)] shadow-[0_0_18px_rgba(232,166,49,0.1)]"
            : "cursor-pointer border-[var(--color-border)] bg-[var(--color-bg-primary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-hover)]",
      )}
    >
      <span className="flex items-baseline gap-1.5">
        <span className="text-xl font-bold tabular-nums" style={{ color: accent, fontFamily: "var(--font-display)" }}>
          {count}
        </span>
      </span>
      <span className="block text-xs font-medium text-[var(--color-text-secondary)] mt-0.5">{label}</span>
    </button>
  );
}

/* ----- Order: same vs shuffled ----- */

interface OrderSelectorProps {
  choice: OrderChoice;
  onChoice: (c: OrderChoice) => void;
}

export function OrderSelector({ choice, onChoice }: OrderSelectorProps) {
  return (
    <div className="space-y-2.5" role="radiogroup" aria-label="Ordinea întrebărilor">
      <OrderCard
        label="Aceeași ordine"
        description="Grilele apar fix în ordinea de data trecută. Util dacă vrei să refaci pas cu pas."
        selected={choice === "same"}
        onSelect={() => onChoice("same")}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        }
      />
      <OrderCard
        label="Amestecă ordinea"
        description="Aceleași grile, ordine nouă. Te ajută să recunoști întrebările pe conținut, nu pe poziție."
        selected={choice === "shuffled"}
        onSelect={() => onChoice("shuffled")}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="16 3 21 3 21 8" />
            <line x1="4" y1="20" x2="21" y2="3" />
            <polyline points="21 16 21 21 16 21" />
            <line x1="15" y1="15" x2="21" y2="21" />
            <line x1="4" y1="4" x2="9" y2="9" />
          </svg>
        }
      />
    </div>
  );
}

interface OrderCardProps {
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
}

function OrderCard({ label, description, selected, onSelect, icon }: OrderCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "relative w-full text-left p-3.5 rounded-[var(--radius-md)] border cursor-pointer transition-all duration-200 flex items-start gap-3",
        selected
          ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)] shadow-[0_0_18px_rgba(232,166,49,0.1)]"
          : "border-[var(--color-border)] bg-[var(--color-bg-primary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-hover)]",
      )}
    >
      <span
        className={cn(
          "flex-shrink-0 mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
          selected ? "border-[var(--color-accent)] bg-[var(--color-accent)]" : "border-[var(--color-border-strong)] bg-transparent",
        )}
        aria-hidden="true"
      >
        {selected && <span className="w-1.5 h-1.5 rounded-full bg-[#0C0C0E]" />}
      </span>
      <span className={cn("flex-shrink-0 mt-0.5 transition-colors", selected ? "text-[var(--color-accent)]" : "text-[var(--color-text-tertiary)]")}>
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className={cn("block text-sm font-semibold mb-0.5", selected ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]")}>
          {label}
        </span>
        <span className="block text-[11px] sm:text-xs leading-relaxed text-[var(--color-text-tertiary)]">{description}</span>
      </span>
    </button>
  );
}

/* ----- Shuffle answers toggle ----- */

interface ShuffleAnswersToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
}

export function ShuffleAnswersToggle({ value, onChange }: ShuffleAnswersToggleProps) {
  return (
    <label
      className={cn(
        "flex items-center gap-3 p-3.5 rounded-[var(--radius-md)] border cursor-pointer transition-all duration-200",
        value
          ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)] shadow-[0_0_18px_rgba(232,166,49,0.1)]"
          : "border-[var(--color-border)] bg-[var(--color-bg-primary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-hover)]",
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label="Amestecă ordinea răspunsurilor"
        onClick={() => onChange(!value)}
        className={cn(
          "relative w-11 h-[24px] rounded-full transition-all duration-200 flex-shrink-0 cursor-pointer",
          value ? "bg-[var(--color-accent)]" : "bg-[var(--color-border-strong)]",
        )}
      >
        <span className={cn("absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-200", value && "translate-x-[20px]")} />
      </button>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold text-[var(--color-text-primary)] mb-0.5">Amestecă și răspunsurile</span>
        <span className="block text-[11px] sm:text-xs leading-relaxed text-[var(--color-text-tertiary)]">
          Variantele de răspuns apar în altă ordine la fiecare grilă, ca să nu memorezi răspunsul după poziție.
        </span>
      </span>
    </label>
  );
}
```

- [ ] **Step 2: Verify build + lint**

Run: `npm run lint && npm run build`
Expected: no errors (component is not yet imported anywhere — that's fine).

- [ ] **Step 3: Commit**

```bash
git add src/components/review/RedoControls.tsx
git commit -m "feat: shared RedoControls (scope, order, shuffle-answers)"
```

---

## Task 4: `ExamRestartModal` — consume shared controls + add scope

**Files:**
- Modify: `src/components/exam/ExamRestartModal.tsx`

- [ ] **Step 1: Replace the whole file**

```tsx
"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  ScopeSelector,
  OrderSelector,
  ShuffleAnswersToggle,
  type RedoScope,
  type OrderChoice,
} from "@/components/review/RedoControls";

interface ExamRestartModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (opts: { scope: RedoScope; shuffleOrder: boolean; shuffleAnswers: boolean }) => void;
  /** Initial state for the "shuffle answers" toggle (the saved simulator preference). */
  defaultShuffleAnswers?: boolean;
  /** Total questions in the exam (for the "Toate (N)" label). */
  totalCount: number;
  /** How many were wrong/unanswered (enables the "Doar greșite" option). */
  wrongCount: number;
  /** Which scope to preselect when opened. */
  initialScope?: RedoScope;
}

export function ExamRestartModal({
  open,
  onCancel,
  onConfirm,
  defaultShuffleAnswers = false,
  totalCount,
  wrongCount,
  initialScope = "all",
}: ExamRestartModalProps) {
  const [scope, setScope] = useState<RedoScope>(initialScope);
  const [choice, setChoice] = useState<OrderChoice>("same");
  const [shuffleAnswers, setShuffleAnswers] = useState(defaultShuffleAnswers);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScope(wrongCount === 0 ? "all" : initialScope);
      setChoice("same");
      setShuffleAnswers(defaultShuffleAnswers);
    }
  }, [open, defaultShuffleAnswers, initialScope, wrongCount]);

  const isWrong = scope === "wrong";

  return (
    <Modal open={open} onClose={onCancel} title="Refă examenul">
      <div className="space-y-5">
        <ScopeSelector
          scope={scope}
          onScope={setScope}
          wrongCount={wrongCount}
          allCount={totalCount}
          allLabel={`Toate (${totalCount})`}
        />

        {isWrong ? (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p className="text-[11px] leading-relaxed text-[var(--color-text-tertiary)]">
              Greșelile se reiau ca exercițiu de practică, cu scor pe acuratețe — nu ca nota /10 (aceea e calibrată pe examenul complet).
            </p>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Primești <span className="font-semibold text-[var(--color-text-primary)]">exact aceleași {totalCount} de grile</span> ca data trecută. Ai ocazia să-ți corectezi greșelile.
          </p>
        )}

        <OrderSelector choice={choice} onChoice={setChoice} />

        <ShuffleAnswersToggle value={shuffleAnswers} onChange={setShuffleAnswers} />

        {!isWrong && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-[11px] leading-relaxed text-[var(--color-text-tertiary)]">
              Rezultatul actual va fi înlocuit. La final, vei vedea că a fost o sesiune repetată.
            </p>
          </div>
        )}

        <div className="flex gap-2.5 flex-col-reverse sm:flex-row">
          <Button variant="secondary" size="md" className="flex-1" onClick={onCancel}>
            Înapoi
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            onClick={() => onConfirm({ scope, shuffleOrder: choice === "shuffled", shuffleAnswers })}
          >
            {isWrong ? "Refă greșitele" : "Re-fă examenul"}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 2: Verify build + lint**

Run: `npm run lint && npm run build`
Expected: FAIL in `src/app/simulator/[examId]/page.tsx` — the old `onConfirm`/missing `wrongCount`/`totalCount` props no longer match. That is fixed in Task 5. (If you want a clean gate, do Task 5 before re-running.)

- [ ] **Step 3: Commit (after Task 5 builds clean)**

Defer committing until Task 5 compiles; commit them together there.

---

## Task 5: Simulator results — page CTA + scope-aware redo

**Files:**
- Modify: `src/app/simulator/[examId]/page.tsx`

- [ ] **Step 1: Add imports**

After the existing `import { computeScore } from "@/lib/exam";` (line 26) add:

```tsx
import { wrongIdsInExam } from "@/lib/redo";
```

- [ ] **Step 2: Pull `startPractice` from the session hook**

In the `useSession()` destructure (lines 72-85), add `startPractice,` (e.g. after `repeatExamFromIds,`).

- [ ] **Step 3: Add redo-scope state**

Next to `const [redoOpen, setRedoOpen] = useState(false);` (line 89) add:

```tsx
  const [redoScope, setRedoScope] = useState<"all" | "wrong">("all");
```

- [ ] **Step 4: Replace `handleRedoSameExam` with a scope-aware handler**

Replace the whole `handleRedoSameExam` callback (lines 162-172) with:

```tsx
  const handleRedo = useCallback(
    ({ scope, shuffleOrder, shuffleAnswers }: { scope: "all" | "wrong"; shuffleOrder: boolean; shuffleAnswers: boolean }) => {
      if (!exam) return;
      if (scope === "wrong") {
        const wrongIds = wrongIdsInExam(exam, (id) => getQuestion(id)?.correctAnswer);
        if (wrongIds.length === 0) return;
        const newId = startPractice([], wrongIds, {
          shuffleOrder,
          shuffleOptions: shuffleAnswers,
          mode: "test",
        });
        setNavigating(true);
        setRedoOpen(false);
        router.push(`/practica/${newId}`);
        return;
      }
      const newId = repeatExamFromIds(exam.questionIds, shuffleOrder, shuffleAnswers);
      if (!newId) return;
      setNavigating(true);
      setRedoOpen(false);
      router.push(`/simulator/${newId}`);
    },
    [exam, startPractice, repeatExamFromIds, router],
  );
```

- [ ] **Step 5: Compute wrong ids in review mode**

Inside the `if (isReviewMode) {` block, just after `const examHistory = getExamHistorySummaries();` (line 358), add:

```tsx
    const wrongIds = wrongIdsInExam(exam, (id) => getQuestion(id)?.correctAnswer);
```

- [ ] **Step 6: Add the page-level "Refă greșitele" CTA**

In the review-mode actions, the current primary row (lines 408-428) has two buttons. Replace that `<div className="flex flex-col sm:flex-row gap-2.5">…</div>` block with a version that prepends the wrong CTA when there are wrong answers:

```tsx
              {wrongIds.length > 0 && (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => { setRedoScope("wrong"); setRedoOpen(true); }}
                >
                  Refă greșitele ({wrongIds.length})
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </Button>
              )}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <Button variant={wrongIds.length > 0 ? "secondary" : "primary"} size="lg" className="flex-1" onClick={() => { setRedoScope("all"); setRedoOpen(true); }}>
                  Re-fă acest examen
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className="flex-1"
                  onClick={() => setRestartOpen(true)}
                >
                  {isHistorical ? "Simulator Nou" : "Examen Nou"}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Button>
              </div>
```

(The `onClick` for "Re-fă acest examen" changes from `() => setRedoOpen(true)` to `() => { setRedoScope("all"); setRedoOpen(true); }`.)

- [ ] **Step 7: Update the `ExamRestartModal` usage**

Replace the existing render (lines 515-520):

```tsx
        <ExamRestartModal
          open={redoOpen}
          onCancel={() => setRedoOpen(false)}
          onConfirm={handleRedo}
          defaultShuffleAnswers={!!session.settings.simulatorShuffleOptions}
          totalCount={exam.questionIds.length}
          wrongCount={wrongIds.length}
          initialScope={redoScope}
        />
```

- [ ] **Step 8: Verify build + lint + tests**

Run: `npm test && npm run lint && npm run build`
Expected: all pass; no type errors.

- [ ] **Step 9: Commit (Tasks 4 + 5 together)**

```bash
git add src/components/exam/ExamRestartModal.tsx "src/app/simulator/[examId]/page.tsx"
git commit -m "feat: redo only wrong answers from the exam simulator results"
```

---

## Task 6: Practice "Rezumat Sesiune" popup — in-modal redo sub-view

**Files:**
- Modify: `src/app/practica/[sessionId]/page.tsx`

- [ ] **Step 1: Add imports**

After `import { Button } from "@/components/ui/Button";` (line 10) add:

```tsx
import { ScopeSelector, OrderSelector, ShuffleAnswersToggle, type RedoScope, type OrderChoice } from "@/components/review/RedoControls";
import { wrongIdsInPractice } from "@/lib/redo";
```

- [ ] **Step 2: Add redo state**

After `const [showSummary, setShowSummary] = useState(false);` (line 35) add:

```tsx
  const [summaryView, setSummaryView] = useState<"main" | "redo">("main");
  const [redoScope, setRedoScope] = useState<RedoScope>("wrong");
  const [redoOrder, setRedoOrder] = useState<OrderChoice>("same");
  const [redoShuffleAnswers, setRedoShuffleAnswers] = useState(false);
```

- [ ] **Step 3: Compute this session's wrong ids**

After the `practiceStats` memo (ends line 85) add:

```tsx
  const wrongIdsThisSession = useMemo(() => {
    if (!practice) return [];
    return wrongIdsInPractice(practice, session.answers, (id) => getQuestion(id) !== undefined);
  }, [practice, session.answers]);
```

- [ ] **Step 4: Add open + launch handlers**

After `handleContinueNextBatch` (ends line 211) add:

```tsx
  const openRedo = useCallback((scope: RedoScope) => {
    setRedoScope(scope);
    setRedoOrder("same");
    setRedoShuffleAnswers(practice?.optionOrder != null);
    setSummaryView("redo");
  }, [practice]);

  const startRedo = useCallback(() => {
    if (!practice) return;
    const ids = redoScope === "wrong" ? wrongIdsThisSession : practice.questionIds;
    if (ids.length === 0) return;
    const newId = startPractice([], ids, {
      shuffleOrder: redoOrder === "shuffled",
      shuffleOptions: redoShuffleAnswers,
      mode: practice.mode,
    });
    setShowSummary(false);
    setSummaryView("main");
    router.replace(`/practica/${newId}`);
  }, [practice, redoScope, redoOrder, redoShuffleAnswers, wrongIdsThisSession, startPractice, router]);
```

- [ ] **Step 5: Make the modal scope-aware (title, back, close reset)**

Replace the `<Modal open={showSummary} … title={…}>` opening tag (lines 464-468) with:

```tsx
      <Modal
        open={showSummary}
        onClose={() => { setShowSummary(false); setSummaryView("main"); }}
        onBack={summaryView === "redo" ? () => setSummaryView("main") : undefined}
        title={
          summaryView === "redo"
            ? (redoScope === "wrong" ? "Refă greșitele" : "Refă sesiunea")
            : (isTest ? "Rezultatul simulării" : "Rezumat Sesiune")
        }
      >
```

- [ ] **Step 6: Wrap the existing summary body and add the redo sub-view**

The modal body currently is `<div className="space-y-5"> … </div>` (lines 469-578). Wrap it so it only renders in the "main" view, and add the redo panel for the "redo" view. Change the opening `<div className="space-y-5">` (line 469) to:

```tsx
        {summaryView === "main" ? (
        <div className="space-y-5">
```

Then, immediately BEFORE the matching closing `</div>` that precedes `</Modal>` (line 578), insert the redo CTA into the existing "Action buttons" block. Specifically, inside `<div className="flex flex-col gap-2.5 pt-1">` (line 543), as the FIRST child (before the `remainingUnanswered > 0` Button), add:

```tsx
            {practiceStats.answered > 0 && (
              wrongIdsThisSession.length > 0 ? (
                <Button
                  variant="primary"
                  size="md"
                  className="w-full py-3"
                  onClick={() => openRedo("wrong")}
                >
                  Refă greșitele ({wrongIdsThisSession.length})
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                </Button>
              ) : (
                <Button variant="ghost" size="sm" className="w-full" onClick={() => openRedo("all")}>
                  Refă sesiunea
                </Button>
              )
            )}
```

Then change the closing `</div>` at line 578 (the end of `space-y-5`) to ALSO render the redo sub-view:

```tsx
        </div>
        ) : (
        <div className="space-y-5">
          <ScopeSelector
            scope={redoScope}
            onScope={setRedoScope}
            wrongCount={wrongIdsThisSession.length}
            allCount={practice.questionIds.length}
            allLabel="Toată sesiunea"
          />
          <OrderSelector choice={redoOrder} onChoice={setRedoOrder} />
          <ShuffleAnswersToggle value={redoShuffleAnswers} onChange={setRedoShuffleAnswers} />
          <Button
            className="w-full py-3"
            onClick={startRedo}
            disabled={(redoScope === "wrong" ? wrongIdsThisSession.length : practice.questionIds.length) === 0}
          >
            Începe
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </Button>
        </div>
        )}
```

- [ ] **Step 7: Verify build + lint + tests**

Run: `npm test && npm run lint && npm run build`
Expected: all pass.

- [ ] **Step 8: Manual smoke test**

Run: `npm run dev`, then:
1. Practice a multi-question subject, deliberately miss 2-3, click "Încheie sesiunea".
2. Confirm "Refă greșitele (N)" shows N = number missed; open it → back-chevron appears top-left; "Doar greșite" preselected.
3. "Începe" → new run contains exactly the missed questions, same mode.
4. Re-open summary on a perfect run → shows quiet "Refă sesiunea".

- [ ] **Step 9: Commit**

```bash
git add "src/app/practica/[sessionId]/page.tsx"
git commit -m "feat: redo wrong answers from the practice session summary popup"
```

---

## Task 7: Release — version bump + changelog

**Files:**
- Modify: `src/lib/site-config.ts:16`
- Modify: `src/app/noutati/page.tsx` (changelog array head)
- Modify: `src/components/home/ChangelogBanner.tsx:7-11`

> Confirm the version number with the user before this task. Plan assumes **1.6.0**.

- [ ] **Step 1: Bump `APP_VERSION`**

`src/lib/site-config.ts` line 16: `export const APP_VERSION = "1.6.0";`

- [ ] **Step 2: Prepend a `noutati` changelog entry**

Insert as the FIRST element of the `changelog` array (before the `1.5.1` entry, ~line 46):

```tsx
  {
    version: "1.6.0",
    date: "16 Iunie 2026",
    title: "Reia greselile direct din rezultat",
    changes: [
      { text: "La finalul unei sesiuni de practica, in rezumatul sesiunii poti reface pe loc doar intrebarile gresite, fara sa mai treci prin alta pagina", type: "feature" },
      { text: "La simulator, dupa examen, ai un buton nou care reia doar grilele gresite ca exercitiu, cu scor pe acuratete; 'Re-fa acest examen' ramane examenul complet cu nota /10", type: "feature" },
      { text: "Cand reiei, alegi si ce reiei (doar gresite sau tot), daca schimbi ordinea intrebarilor si daca amesteci raspunsurile", type: "improvement" },
    ],
  },
```

- [ ] **Step 3: Update the homepage `ChangelogBanner` bullets**

`src/components/home/ChangelogBanner.tsx`, replace the `recentChanges` array (lines 7-11):

```tsx
const recentChanges = [
  "Reia pe loc intrebarile gresite, direct din rezumatul sesiunii de practica",
  "La simulator, reia dupa examen doar grilele gresite, ca exercitiu cu scor pe acuratete",
  "Alegi ce reiei si cum: doar gresite sau tot, alta ordine, raspunsuri amestecate",
];
```

- [ ] **Step 4: Verify build + lint**

Run: `npm run lint && npm run build`
Expected: pass. The `v{APP_VERSION}` badge now reads `v1.6.0`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/site-config.ts src/app/noutati/page.tsx src/components/home/ChangelogBanner.tsx
git commit -m "feat: v1.6.0 - redo wrong answers from practice + simulator results"
```

---

## Self-review notes (coverage vs spec)

- Practice popup redo (scope/order/answers, back-chevron, in-place relaunch) → Tasks 2, 3, 6.
- Simulator wrong-only as /practica drill + "Toate" unchanged exam → Tasks 1, 4, 5.
- Page-level "Refă greșitele" CTA on simulator (outside the modal) → Task 5, Step 6.
- Shared identical controls → Task 3, consumed in Tasks 4 & 6.
- Honest scoring (no mis-scored mini-exam) → wrong path routes to `startPractice(mode:"test")` (Task 5, Step 4) + caveat copy (Task 4).
- Unanswered exam questions counted wrong → `wrongIdsInExam` (Task 1) tested.
- Release 3-file routine → Task 7.
- Out of scope (per spec): per-subject filter, Exersează/Simulează toggle — intentionally absent.
```
