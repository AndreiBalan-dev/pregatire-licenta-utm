# Redo Session Chain Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a redo session re-run the original full session and the initial mistake set, with an adaptive results popup and mode-aware "move on" CTAs, shipped as v2.2.0.

**Architecture:** Attach an optional `redoLineage` snapshot (origin full set + first mistakes) to `PracticeState`, created on the first redo out of an origin and propagated unchanged down the chain. A pure `buildRedoTargets` builder turns that lineage plus the live wrong-set into an ordered, de-duplicated ladder the practice results popup renders one-click.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, client-side `localStorage` via the `useSession` hook. Pure-logic unit tests run with `node --import ./scripts/register-alias.mjs scripts/<name>.test.mjs`.

## Global Constraints

- Persistence stays at `LocalSession.version = 1`. New fields must be optional and additive; old saved sessions must deserialize unchanged.
- App UI copy keeps Romanian diacritics (match existing strings like "Refă greșitele").
- Changelog copy in `src/app/noutati/page.tsx` and `src/components/home/ChangelogBanner.tsx` uses Romanian with **no diacritics** (match existing entries).
- No em or en dashes in copy or comments; use commas or a hyphen.
- `npm run build` requires `DATABASE_URL`; type-check with `npx tsc --noEmit` (no env needed) during tasks, and run one full build with a dummy neon URL at the end.
- Date for the v2.2.0 changelog entry: `21 Iunie 2026`.
- Redo ladder buttons are one-click (no order/shuffle sub-panel); they carry the current session's settings (same order, `practice.optionOrder != null` for answer shuffle).

---

### Task 1: Redo lineage types and the `buildRedoTargets` builder

**Files:**
- Modify: `src/lib/session-types.ts` (add `RedoLineage`, add `redoLineage?` to `PracticeState`)
- Create: `src/lib/redo-lineage.ts`
- Test: `scripts/redo-lineage.test.mjs`
- Modify: `package.json` (register the new test)

**Interfaces:**
- Produces: `interface RedoLineage { origin: { kind: "exam" | "practice"; questionIds: number[]; subjectIds?: string[]; batchSize?: number | null }; firstWrong: number[] }`
- Produces: `type RedoRole = "wrong" | "initial" | "full"`
- Produces: `interface RedoTarget { role: RedoRole; ids: number[] }`
- Produces: `function buildRedoTargets(args: { wrongIds: number[]; lineage?: RedoLineage }): RedoTarget[]`

- [ ] **Step 1: Write the failing test**

Create `scripts/redo-lineage.test.mjs`:

```js
import process from "node:process";
import assert from "node:assert/strict";
import { buildRedoTargets } from "../src/lib/redo-lineage.ts";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

const roles = (targets) => targets.map((t) => t.role);
const lin = (origin, firstWrong, kind = "exam") => ({ origin: { kind, questionIds: origin }, firstWrong });
const range = (n) => Array.from({ length: n }, (_, i) => i + 1);

check("no lineage: only wrong when present, else empty", () => {
  assert.deepEqual(buildRedoTargets({ wrongIds: [1, 2] }), [{ role: "wrong", ids: [1, 2] }]);
  assert.deepEqual(buildRedoTargets({ wrongIds: [] }), []);
});

check("level 1 (current == firstWrong): wrong + initial + full, all distinct", () => {
  const first = [1, 2, 3, 4, 5, 6, 7, 8];
  const t = buildRedoTargets({ wrongIds: [1, 2, 3, 4, 5], lineage: lin(range(36), first) });
  assert.deepEqual(roles(t), ["wrong", "initial", "full"]);
  assert.deepEqual(t[0].ids, [1, 2, 3, 4, 5]);
  assert.deepEqual(t[1].ids, first);
  assert.equal(t[2].ids.length, 36);
});

check("level 2+ (current != firstWrong): initial stays the original set", () => {
  const first = [1, 2, 3, 4, 5, 6, 7, 8];
  const t = buildRedoTargets({ wrongIds: [1, 2, 3], lineage: lin(range(36), first) });
  assert.deepEqual(roles(t), ["wrong", "initial", "full"]);
  assert.deepEqual(t[1].ids, first);
});

check("100% (no wrong): initial is primary, then full", () => {
  const first = [1, 2, 3, 4, 5, 6, 7, 8];
  const t = buildRedoTargets({ wrongIds: [], lineage: lin(range(36), first) });
  assert.deepEqual(roles(t), ["initial", "full"]);
  assert.deepEqual(t[0].ids, first);
});

check("all-wrong origin (firstWrong == origin): initial omitted", () => {
  const t = buildRedoTargets({ wrongIds: [1, 2], lineage: lin([1, 2, 3, 4], [1, 2, 3, 4]) });
  assert.deepEqual(roles(t), ["wrong", "full"]);
});

check("wrong == initial (same set, any order): dedup keeps wrong, drops initial", () => {
  const t = buildRedoTargets({ wrongIds: [3, 2, 1], lineage: lin(range(10), [1, 2, 3]) });
  assert.deepEqual(roles(t), ["wrong", "full"]);
});

check("practice origin works the same", () => {
  const t = buildRedoTargets({ wrongIds: [1], lineage: lin([1, 2, 3], [1, 2], "practice") });
  assert.deepEqual(roles(t), ["wrong", "initial", "full"]);
});

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --import ./scripts/register-alias.mjs scripts/redo-lineage.test.mjs`
Expected: FAIL, an `ERR_MODULE_NOT_FOUND` for `../src/lib/redo-lineage.ts` (the file does not exist yet).

- [ ] **Step 3: Add the `RedoLineage` type to `session-types.ts`**

In `src/lib/session-types.ts`, add the interface immediately before `export interface PracticeState {`:

```ts
/**
 * Where a redo session traces back to, so the results popup can offer
 * "redo the full original session" and "redo all initial mistakes". Created
 * once on the first redo out of an origin and propagated unchanged.
 */
export interface RedoLineage {
  origin: {
    kind: "exam" | "practice";
    /** Full question set of the original session (to repeat it). */
    questionIds: number[];
    /** Practice origin only: enables "next batch" continuation. */
    subjectIds?: string[];
    batchSize?: number | null;
  };
  /** Snapshot of the origin's wrong answers (cannot be recomputed later). */
  firstWrong: number[];
}
```

Then add this field inside `PracticeState`, right after the `optionOrder?` field:

```ts
  /** Set when this session is a redo derived from a larger session. */
  redoLineage?: RedoLineage;
```

- [ ] **Step 4: Create `redo-lineage.ts`**

Create `src/lib/redo-lineage.ts`:

```ts
import type { RedoLineage } from "./session-types";

export type RedoRole = "wrong" | "initial" | "full";

export interface RedoTarget {
  role: RedoRole;
  ids: number[];
}

/**
 * Ordered, de-duplicated ladder of redo targets for a session's results popup.
 * Order is wrong -> initial -> full; the first item is the primary button.
 * Empty sets are dropped and exact set-duplicates collapse (compared as sorted
 * ids). When the origin's first mistakes equal the whole origin, "initial" is
 * omitted because the "full" button already covers it.
 */
export function buildRedoTargets(args: {
  wrongIds: number[];
  lineage?: RedoLineage;
}): RedoTarget[] {
  const out: RedoTarget[] = [];
  const seen = new Set<string>();
  const key = (ids: number[]) => [...ids].sort((a, b) => a - b).join(",");
  const push = (role: RedoRole, ids: number[]) => {
    if (!ids || ids.length === 0) return;
    const k = key(ids);
    if (seen.has(k)) return;
    seen.add(k);
    out.push({ role, ids: [...ids] });
  };

  push("wrong", args.wrongIds);
  if (args.lineage) {
    if (key(args.lineage.firstWrong) !== key(args.lineage.origin.questionIds)) {
      push("initial", args.lineage.firstWrong);
    }
    push("full", args.lineage.origin.questionIds);
  }
  return out;
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `node --import ./scripts/register-alias.mjs scripts/redo-lineage.test.mjs`
Expected: PASS, "All tests passed".

- [ ] **Step 6: Register the test in `package.json`**

In `package.json`, replace the `test` script value. Find:

```
"test": "node --import ./scripts/register-alias.mjs scripts/practice-selection.test.mjs && node --import ./scripts/register-alias.mjs scripts/redo.test.mjs && node --import ./scripts/register-alias.mjs scripts/redo-scope.test.mjs && node --import ./scripts/register-alias.mjs scripts/search.test.mjs && node --import ./scripts/register-alias.mjs scripts/training.test.mjs"
```

Replace with (adds `redo-lineage.test.mjs` after `redo-scope.test.mjs`):

```
"test": "node --import ./scripts/register-alias.mjs scripts/practice-selection.test.mjs && node --import ./scripts/register-alias.mjs scripts/redo.test.mjs && node --import ./scripts/register-alias.mjs scripts/redo-scope.test.mjs && node --import ./scripts/register-alias.mjs scripts/redo-lineage.test.mjs && node --import ./scripts/register-alias.mjs scripts/search.test.mjs && node --import ./scripts/register-alias.mjs scripts/training.test.mjs"
```

- [ ] **Step 7: Run the full test suite and type-check**

Run: `npm test`
Expected: every suite prints "All tests passed".
Run: `npx tsc --noEmit`
Expected: no output (clean).

- [ ] **Step 8: Commit**

```bash
git add src/lib/session-types.ts src/lib/redo-lineage.ts scripts/redo-lineage.test.mjs package.json
git commit -m "feat: redo lineage types and buildRedoTargets builder"
```

---

### Task 2: Thread `redoLineage` through `startPractice` and stamp it from the simulator

**Files:**
- Modify: `src/hooks/useSession.ts` (`StartPracticeOptions`, `startPractice`)
- Modify: `src/app/simulator/[examId]/page.tsx` (`handleRedo`, scope `"wrong"`)

**Interfaces:**
- Consumes: `RedoLineage` from `@/lib/session-types` (Task 1)
- Produces: `startPractice(subjectIds, questionIds, { ..., redoLineage?: RedoLineage })` now persists `redoLineage` onto the created `PracticeState`.

- [ ] **Step 1: Import the `RedoLineage` type in `useSession.ts`**

In `src/hooks/useSession.ts`, the existing import block pulls types from `@/lib/session-types`. Add `type RedoLineage,` to that list, for example after `type PracticeState,`:

```ts
  type PracticeState,
  type RedoLineage,
```

- [ ] **Step 2: Add `redoLineage` to `StartPracticeOptions`**

In `src/hooks/useSession.ts`, find the `StartPracticeOptions` interface and add the field before the closing brace:

```ts
  /** When set, marks this session as a redo derived from a larger session. */
  redoLineage?: RedoLineage;
```

- [ ] **Step 3: Persist `redoLineage` in `startPractice`**

In `startPractice`, update the destructure line to include `redoLineage`:

```ts
      const { shuffleOrder = false, batchSize = null, shuffleOptions = false, mode = "practice", redoLineage } = options;
```

Then in the `practice` object literal, add the spread after the `optionOrder` spread:

```ts
        ...(optionOrder ? { optionOrder } : {}),
        ...(redoLineage ? { redoLineage } : {}),
```

- [ ] **Step 4: Stamp lineage when redoing wrong answers from a simulator**

In `src/app/simulator/[examId]/page.tsx`, inside `handleRedo`, the `scope === "wrong"` branch calls `startPractice([], wrongIds, { ... })`. Add `redoLineage` to that options object:

```ts
        const newId = startPractice([], wrongIds, {
          shuffleOrder,
          shuffleOptions: shuffleAnswers,
          // Practice mode so wrong answers get instant feedback as you go (the
          // CTA frames it as "exercitiu de practica"). Accuracy, not a /10 score.
          mode: "practice",
          redoLineage: {
            origin: { kind: "exam", questionIds: exam.questionIds },
            firstWrong: wrongIds,
          },
        });
```

- [ ] **Step 5: Type-check and lint**

Run: `npx tsc --noEmit`
Expected: no output.
Run: `npm run lint`
Expected: no errors.

- [ ] **Step 6: Manual smoke check**

Start the dev server (`npx next dev`), open a simulator, answer several questions wrong, finish, press "Refă greșitele", confirm in the modal. Expected: you land in a practice session and it works exactly as before (no visible change yet). In devtools, `localStorage` key for the session shows `currentPractice.redoLineage` populated with `origin.kind === "exam"` and a `firstWrong` array.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useSession.ts "src/app/simulator/[examId]/page.tsx"
git commit -m "feat: carry redo lineage from simulator wrong-answer redo"
```

---

### Task 3: Adaptive redo ladder in the practice results popup

**Files:**
- Modify: `src/app/practica/[sessionId]/page.tsx`

**Interfaces:**
- Consumes: `buildRedoTargets`, `RedoTarget` (Task 1); `repeatExamFromIds` and `startPractice` from `useSession`.
- Produces: redo sessions (those with `practice.redoLineage`) render a one-click `wrong / initial / full` ladder. Normal sessions are unchanged.

- [ ] **Step 1: Add imports**

In `src/app/practica/[sessionId]/page.tsx`, add after the existing `wrongIdsInPractice` import:

```ts
import { buildRedoTargets, type RedoTarget } from "@/lib/redo-lineage";
```

- [ ] **Step 2: Pull `repeatExamFromIds` from `useSession`**

In the `useSession()` destructure at the top of the component, add `repeatExamFromIds`:

```ts
    startPractice,
    repeatExamFromIds,
    updatePracticeIndex,
    endPractice,
```

- [ ] **Step 3: Add lineage-derived values and the one-click handler**

Immediately after the `startRedo` `useCallback` (before the `useEffect` that redirects when there is no practice), add:

```ts
  const lineage = practice?.redoLineage;
  const isRedo = !!lineage;

  const redoTargets = useMemo<RedoTarget[]>(
    () => (lineage ? buildRedoTargets({ wrongIds: wrongIdsThisSession, lineage }) : []),
    [lineage, wrongIdsThisSession],
  );

  const redoTargetLabel = useCallback(
    (target: RedoTarget): string => {
      const isExam = lineage?.origin.kind === "exam";
      if (target.role === "wrong") return `Refă greșitele (${target.ids.length})`;
      if (target.role === "initial")
        return isExam
          ? `Greșelile din simulare (${target.ids.length})`
          : `Greșelile din sesiune (${target.ids.length})`;
      return isExam
        ? `Refă toată simularea (${target.ids.length})`
        : `Refă sesiunea completă (${target.ids.length})`;
    },
    [lineage],
  );

  const handleRedoTarget = useCallback(
    (target: RedoTarget) => {
      if (!practice || !lineage) return;
      const carryShuffle = practice.optionOrder != null;
      if (target.role === "full") {
        if (lineage.origin.kind === "exam") {
          const newId = repeatExamFromIds(lineage.origin.questionIds, false, carryShuffle);
          if (!newId) return;
          setShowSummary(false);
          router.push(`/simulator/${newId}`);
        } else {
          const newId = startPractice(lineage.origin.subjectIds ?? [], lineage.origin.questionIds, {
            shuffleOrder: false,
            batchSize: lineage.origin.batchSize ?? null,
            shuffleOptions: carryShuffle,
            mode: practice.mode,
          });
          setShowSummary(false);
          router.replace(`/practica/${newId}`);
        }
        return;
      }
      // "wrong" or "initial": stay in the chain, propagate the same lineage.
      const newId = startPractice([], target.ids, {
        shuffleOrder: false,
        shuffleOptions: carryShuffle,
        mode: practice.mode,
        redoLineage: lineage,
      });
      setShowSummary(false);
      router.replace(`/practica/${newId}`);
    },
    [practice, lineage, repeatExamFromIds, startPractice, router],
  );
```

- [ ] **Step 4: Render the ladder for redo sessions**

In the summary modal main view, find the action-buttons block that starts with `{practiceStats.answered > 0 && (` and contains the `showRedoWrong` / `showRedoAnswered` / `showRedoAll` buttons. Replace that whole `{practiceStats.answered > 0 && ( ... )}` block with:

```tsx
            {practiceStats.answered > 0 && (
              isRedo ? (
                <>
                  {redoTargets.map((target, i) => (
                    <Button
                      key={target.role}
                      variant={i === 0 ? "primary" : "secondary"}
                      size="md"
                      className="w-full py-3"
                      onClick={() => handleRedoTarget(target)}
                    >
                      {redoTargetLabel(target)}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                      </svg>
                    </Button>
                  ))}
                </>
              ) : (
                <>
                  {showRedoWrong && (
                    <Button
                      variant="primary"
                      size="md"
                      className="w-full py-3"
                      onClick={() => openRedo("wrong")}
                    >
                      Refă greșitele ({redoWrongCount})
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                      </svg>
                    </Button>
                  )}
                  {showRedoAnswered && (
                    <Button
                      variant={showRedoWrong ? "secondary" : "primary"}
                      size="md"
                      className="w-full py-3"
                      onClick={() => openRedo("answered")}
                    >
                      Refă rezolvate ({redoAnsweredCount})
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                      </svg>
                    </Button>
                  )}
                  {showRedoAll && (
                    <Button
                      variant={showRedoWrong || showRedoAnswered ? "secondary" : "primary"}
                      size="md"
                      className="w-full py-3"
                      onClick={() => openRedo("all")}
                    >
                      Refă toată sesiunea ({redoAllCount})
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                      </svg>
                    </Button>
                  )}
                </>
              )
            )}
```

- [ ] **Step 5: Type-check and lint**

Run: `npx tsc --noEmit`
Expected: no output.
Run: `npm run lint`
Expected: no errors.

- [ ] **Step 6: Manual smoke check**

Dev server running: run a simulator, get several wrong, "Refă greșitele" into the practice redo. At the end of that redo, the summary now shows the ladder: "Refă greșitele (M)", "Greșelile din simulare (K)", "Refă toată simularea (T)". Verify:
- "Refă toată simularea" navigates to `/simulator/...` and starts a fresh 36-question exam.
- "Greșelile din simulare" and "Refă greșitele" start a new practice and keep showing the ladder (lineage propagated).
- A normal (non-redo) practice session still shows the old three buttons.

- [ ] **Step 7: Commit**

```bash
git add "src/app/practica/[sessionId]/page.tsx"
git commit -m "feat: adaptive redo ladder in practice results popup"
```

---

### Task 4: Move-on CTAs (new simulator, lineage-aware next batch, "Ultimele X")

**Files:**
- Modify: `src/app/practica/[sessionId]/page.tsx`

**Interfaces:**
- Consumes: `startExam` from `useSession`; `lineage` / `isRedo` (Task 3).
- Produces: exam-origin redo sessions show a one-click "Simulare nouă"; practice-origin redo sessions continue to the next batch; the next-batch button reads "Ultimele X" on the final chunk.

- [ ] **Step 1: Pull `startExam` from `useSession`**

In the `useSession()` destructure, add `startExam` next to `repeatExamFromIds`:

```ts
    startPractice,
    repeatExamFromIds,
    startExam,
    updatePracticeIndex,
    endPractice,
```

- [ ] **Step 2: Make `remainingUnanswered` lineage-aware**

Replace the existing `remainingUnanswered` `useMemo` with:

```ts
  const remainingUnanswered = useMemo(() => {
    if (!practice) return 0;
    const subjectIds =
      practice.subjectIds.length > 0
        ? practice.subjectIds
        : practice.redoLineage?.origin.kind === "practice"
          ? practice.redoLineage.origin.subjectIds ?? []
          : [];
    if (subjectIds.length === 0) return 0;
    const currentSet = new Set(practice.questionIds);
    let count = 0;
    for (const sid of subjectIds) {
      const questions = questionsBySubject[sid] || [];
      for (const q of questions) {
        if (!currentSet.has(q.id) && !session.answers[q.id]) {
          count++;
        }
      }
    }
    return count;
  }, [practice, session.answers]);
```

- [ ] **Step 3: Make `handleContinueNextBatch` lineage-aware**

Replace the existing `handleContinueNextBatch` `useCallback` with:

```ts
  const handleContinueNextBatch = useCallback(() => {
    if (!practice) return;
    const subjectIds =
      practice.subjectIds.length > 0
        ? practice.subjectIds
        : practice.redoLineage?.origin.kind === "practice"
          ? practice.redoLineage.origin.subjectIds ?? []
          : [];
    if (subjectIds.length === 0) return;
    const currentSet = new Set(practice.questionIds);
    const nextIds: number[] = [];
    for (const sid of subjectIds) {
      const questions = questionsBySubject[sid] || [];
      for (const q of questions) {
        if (!currentSet.has(q.id) && !session.answers[q.id]) {
          nextIds.push(q.id);
        }
      }
    }
    if (nextIds.length === 0) return;

    const batchSize = practice.batchSize ?? practice.redoLineage?.origin.batchSize ?? null;
    const batch = batchSize ? nextIds.slice(0, batchSize) : nextIds;

    // Continuing the pool starts a fresh origin batch (no lineage).
    const newSessionId = startPractice(subjectIds, batch, {
      shuffleOrder: false,
      batchSize,
      shuffleOptions: practice.optionOrder != null,
      mode: practice.mode,
    });
    setShowSummary(false);
    router.replace(`/practica/${newSessionId}`);
  }, [practice, session.answers, startPractice, router]);
```

- [ ] **Step 4: Add the new-simulator handler**

Immediately after `handleRedoTarget` (added in Task 3), add:

```ts
  const handleNewSimulator = useCallback(() => {
    const newId = startExam();
    setShowSummary(false);
    router.push(`/simulator/${newId}`);
  }, [startExam, router]);
```

- [ ] **Step 5: Update the next-batch button wording to "Ultimele X"**

Replace the existing next-batch `Button` block (the one rendered when `remainingUnanswered > 0`, containing "Următoarele {...} întrebări") with:

```tsx
            {remainingUnanswered > 0 && (
              <Button
                className="w-full py-3"
                onClick={handleContinueNextBatch}
              >
                {(() => {
                  const eff = practice.batchSize ?? practice.redoLineage?.origin.batchSize ?? null;
                  const n = eff ? Math.min(eff, remainingUnanswered) : remainingUnanswered;
                  const word = !eff || remainingUnanswered <= eff ? "Ultimele" : "Următoarele";
                  return (
                    <>
                      <span className="hidden sm:inline">{word} {n} întrebări</span>
                      <span className="sm:hidden">{word} {n}</span>
                    </>
                  );
                })()}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 6 15 12 9 18" />
                </svg>
              </Button>
            )}
```

- [ ] **Step 6: Add the "Simulare nouă" button for exam-origin redos**

Directly after the next-batch button block from Step 5, add:

```tsx
            {isRedo && lineage?.origin.kind === "exam" && (
              <Button
                variant="secondary"
                size="md"
                className="w-full py-3"
                onClick={handleNewSimulator}
              >
                Simulare nouă
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </Button>
            )}
```

- [ ] **Step 7: Type-check and lint**

Run: `npx tsc --noEmit`
Expected: no output.
Run: `npm run lint`
Expected: no errors.

- [ ] **Step 8: Manual smoke check**

- Exam-origin redo: the summary shows "Simulare nouă" and pressing it starts a fresh exam at `/simulator/...`. No "next batch" button appears.
- Practice-origin redo: start a practice with a batch size (for example 25 of a large subject), get some wrong, redo. The next-batch button appears and continues the pool. When the remaining count is at or below the batch size, the label reads "Ultimele X".

- [ ] **Step 9: Commit**

```bash
git add "src/app/practica/[sessionId]/page.tsx"
git commit -m "feat: new-simulator and lineage-aware next batch with Ultimele X"
```

---

### Task 5: Origin badge and ladder hint

**Files:**
- Modify: `src/app/practica/[sessionId]/page.tsx`

**Interfaces:**
- Consumes: `isRedo`, `lineage`, `redoTargets` (Tasks 3 and 4).
- Produces: a "Reluare din simulare/sesiune" badge at the top of a redo session and a one-line hint under the ladder.

- [ ] **Step 1: Add the origin badge**

In the page body, find the `{isTest && ( ... )}` badge block near the top of the `Container` (the one with the "Mod simulare" pill). Directly before it, add:

```tsx
          {isRedo && (
            <div className="mb-3 flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)] border-opacity-40"
                style={{ fontFamily: "var(--font-display)" }}
                title="Reiei greșeli dintr-o sesiune mai mare"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
                {lineage?.origin.kind === "exam" ? "Reluare din simulare" : "Reluare din sesiune"}
              </span>
            </div>
          )}
```

- [ ] **Step 2: Add the ladder hint**

In the summary modal, directly after the closing of the `{practiceStats.answered > 0 && ( ... )}` action-buttons block (from Task 3) and before the `{remainingUnanswered > 0 && ( ... )}` next-batch button, add:

```tsx
            {isRedo && redoTargets.length > 1 && (
              <p className="text-[11px] leading-relaxed text-[var(--color-text-tertiary)] text-center px-2">
                Alegi ce reiei: doar greșelile, greșelile inițiale sau sesiunea completă.
              </p>
            )}
```

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit`
Expected: no output.
Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Manual smoke check**

In a redo session, the top of the page shows the "Reluare din simulare" (or "din sesiune") pill, and the results summary shows the hint line under the ladder. A normal practice session shows neither.

- [ ] **Step 5: Commit**

```bash
git add "src/app/practica/[sessionId]/page.tsx"
git commit -m "feat: redo origin badge and ladder hint"
```

---

### Task 6: Release - version bump, changelog entry, homepage banner

**Files:**
- Modify: `src/lib/site-config.ts`
- Modify: `src/app/noutati/page.tsx`
- Modify: `src/components/home/ChangelogBanner.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks (copy only).
- Produces: app reports v2.2.0 everywhere `APP_VERSION` is read.

- [ ] **Step 1: Bump the version**

In `src/lib/site-config.ts`, change:

```ts
export const APP_VERSION = "2.1.2";
```

to:

```ts
export const APP_VERSION = "2.2.0";
```

- [ ] **Step 2: Add the changelog entry**

In `src/app/noutati/page.tsx`, find `const changelog: Version[] = [` and insert this entry as the first element of the array (before the `version: "2.1.2"` entry). No diacritics:

```ts
  {
    version: "2.2.0",
    date: "21 Iunie 2026",
    title: "Reiei greselile fara sa pierzi sesiunea mare",
    changes: [
      { text: "Cand reiei greselile dupa un simulator sau o practica si tot mai ai de lucru, poti acum sa reiei direct sesiunea mare din care au venit (de exemplu toate cele 36 de grile din simulator), nu doar ultimul set mic de greseli", type: "feature" },
      { text: "Reiei dintr-un singur loc oricare set: doar greselile de acum, toate greselile initiale, sau sesiunea completa; butoanele se potrivesc singure dupa cate greseli ti-au mai ramas", type: "feature" },
      { text: "Cand iei 100% pe un set de greseli, primesti pe loc optiunea sa reiei toate greselile initiale sau toata sesiunea, nu doar setul mic pe care tocmai l-ai terminat", type: "improvement" },
      { text: "Pornesti o simulare noua direct din rezultat, dintr-un clic; la practica continui cu urmatorul lot, iar cand e ultimul scrie 'Ultimele X'", type: "improvement" },
    ],
  },
```

- [ ] **Step 3: Update the homepage banner bullets**

In `src/components/home/ChangelogBanner.tsx`, replace the `recentChanges` array with (no diacritics):

```ts
const recentChanges = [
  "Reiei greselile fara sa pierzi sesiunea mare: din rezultat poti relua tot simulatorul, nu doar ultimul set",
  "Un singur loc pentru orice reluare: doar greselile, toate greselile initiale, sau sesiunea completa",
  "Simulare noua dintr-un clic; la practica vezi 'Ultimele X' cand termini lotul",
];
```

- [ ] **Step 4: Type-check and lint**

Run: `npx tsc --noEmit`
Expected: no output.
Run: `npm run lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/site-config.ts src/app/noutati/page.tsx src/components/home/ChangelogBanner.tsx
git commit -m "feat: v2.2.0 changelog, banner, version bump"
```

---

### Task 7: Release - What's-New popup and final verification

**Files:**
- Modify: `src/components/home/WhatsNewModal.tsx`
- Modify: `src/components/home/WhatsNewGate.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks (copy only).
- Produces: the one-time popup announces the redo-chain feature and re-shows to returning users.

- [ ] **Step 1: Rewrite section 1 of the What's-New popup**

In `src/components/home/WhatsNewModal.tsx`, replace the entire first `<section> ... </section>` (the one whose version pill reads `v2.1.0` and heading is "Antrenament nelimitat...") with:

```tsx
        {/* Section 1: the new feature */}
        <section>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mb-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)] border-opacity-30">
            v2.2.0
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)] mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Reia greșelile fără să pierzi sesiunea mare
          </h3>
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Când reiei greșelile după un simulator sau o practică, acum poți relua dintr-un singur loc orice set:
            doar greșelile de acum, <span className="font-semibold text-[var(--color-text-primary)]">toate</span> greșelile
            inițiale sau sesiunea completă. Butoanele se potrivesc singure după câte greșeli ți-au mai rămas.
          </p>

          <div className="mt-3 space-y-2">
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="flex-shrink-0 text-[var(--color-accent)]" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                </span>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
                  Nu mai pierzi sesiunea mare
                </p>
              </div>
              <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                Din orice reluare poți sări înapoi la toate greșelile inițiale sau la toată simularea, nu doar la ultimul set mic.
              </p>
            </div>
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="flex-shrink-0 text-[var(--color-accent)]" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
                  Mergi mai departe dintr-un clic
                </p>
              </div>
              <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                Pornești o simulare nouă direct din rezultat, iar la practică treci la următorul lot, cu &quot;Ultimele X&quot; când e ultimul.
              </p>
            </div>
          </div>

          <Link
            href="/simulator"
            onClick={onClose}
            className="mt-3 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[#0C0C0E] font-bold text-sm transition-all duration-200 hover:bg-[var(--color-accent-hover)] active:scale-[0.98]"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
          >
            Începe o simulare
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </section>
```

Leave the divider and the section 2 (the Gen-E vote thank-you) exactly as they are.

- [ ] **Step 2: Bump the What's-New gate key**

In `src/components/home/WhatsNewGate.tsx`, change:

```ts
const WHATSNEW_KEY = "utm-whatsnew-v210";
```

to:

```ts
const WHATSNEW_KEY = "utm-whatsnew-v220";
```

- [ ] **Step 3: Type-check, lint, full test suite**

Run: `npx tsc --noEmit`
Expected: no output.
Run: `npm run lint`
Expected: no errors.
Run: `npm test`
Expected: every suite prints "All tests passed".

- [ ] **Step 4: Full production build with a dummy DATABASE_URL**

Bash:

```bash
DATABASE_URL="postgresql://u:p@ep-dummy-123.us-east-2.aws.neon.tech/neondb?sslmode=require" npm run build
```

PowerShell equivalent:

```powershell
$env:DATABASE_URL="postgresql://u:p@ep-dummy-123.us-east-2.aws.neon.tech/neondb?sslmode=require"; npm run build
```

Expected: build completes with no type errors and no failed pages.

- [ ] **Step 5: Manual smoke check**

With data already in `localStorage`, load any page: the "Ce e nou" popup appears once (because the gate key changed) and shows the v2.2.0 redo-chain content with the Gen-E section still below. Closing it sets `utm-whatsnew-v220` and it does not reappear. The homepage banner shows `v2.2.0` and the three new bullets; `/noutati` lists the v2.2.0 entry on top.

- [ ] **Step 6: Commit**

```bash
git add src/components/home/WhatsNewModal.tsx src/components/home/WhatsNewGate.tsx
git commit -m "feat: announce v2.2.0 redo chain in What's-New popup"
```

---

## Self-Review

**Spec coverage:**
- Lineage data model -> Task 1 (Step 3) and Task 2.
- `buildRedoTargets` + tests -> Task 1.
- Lineage creation/propagation (exam + practice origins) -> Task 2 (exam stamp) and Task 3 (`handleRedoTarget` propagation + practice-origin full re-run).
- Adaptive ladder, one-click, carry settings -> Task 3.
- Move-on CTAs (Simulare noua, next batch lineage-aware), "Ultimele X" -> Task 4.
- Optional extras (origin badge, hint) -> Task 5.
- Release (version, changelog, banner, What's-New, gate key, keep Gen-E) -> Tasks 6 and 7.
- Testing/build with DATABASE_URL -> Task 1 Step 7, Task 7 Steps 3 and 4.

**Placeholder scan:** No TBD/TODO; every code step shows complete code; copy is final (tweakable, not placeholder).

**Type consistency:** `RedoLineage`, `RedoRole`, `RedoTarget`, `buildRedoTargets`, and `startPractice`'s `redoLineage` option are named identically across Tasks 1 to 5. `repeatExamFromIds(sourceIds, shuffleOrder, shuffleOptions)` and `startExam()` match the `useSession` signatures. `handleRedoTarget` / `redoTargetLabel` / `handleNewSimulator` are defined before use.

## Notes for the implementer

- Apply tasks in order; Tasks 4 and 5 edit the same file as Task 3 and assume Task 3's additions exist.
- Quote paths with brackets when running git on this shell: `"src/app/practica/[sessionId]/page.tsx"`.
- Do not push; this repo commits directly to `main` (no PRs).
