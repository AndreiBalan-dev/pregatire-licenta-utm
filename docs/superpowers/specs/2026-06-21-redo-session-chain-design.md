# Redo session chain (v2.2.0) - design

- Date: 2026-06-21
- Target version: 2.2.0
- Status: approved, ready for implementation plan

## Problem

When a user finishes a Simulator or Practice session and presses "Refa greselile", the
app builds a fresh session out of just the wrong answers and navigates into it. That redo
session is **orphaned**: `startPractice` is called with no backreference, and `subjectIds`
is empty. As a result:

- "Refa toata sesiunea" inside a redo only means "redo this small batch", not the big
  session the mistakes came from.
- After drilling down (36 -> 8 -> 5 -> 3 -> 0) there is no way to jump back to the original
  mistake set (the 8) or the full original session (the 36).
- The end-of-session popup has no mode-aware "move on" action (start a new simulator, or
  continue to the next practice batch from inside a redo).

The global `answers` map is overwritten as the user re-answers, so the origin's original
mistakes cannot be recomputed after the fact. The chain has to be captured when it is
created and carried forward.

## Goals

1. From any redo session, offer one-click redo of: the new wrong answers, **all** initial
   mistakes from the origin, and the **full** original session.
2. Make the offered buttons adaptive ("Curat, adaptiv"): show only sets that differ, and at
   100% drop the empty "greselile" button and promote "initial mistakes" to primary.
3. Add mode-aware "move on" actions in the redo popup: "Simulare noua" (one-click) for an
   exam origin; "Urmatoarele X / Ultimele X" for a practice origin.
4. Ship as v2.2.0: changelog entry, homepage banner, version bump, and a refreshed
   one-time "Ce e nou" popup.

## Non-goals

- No change to how the original (non-redo) practice or simulator result screens behave,
  beyond stamping lineage onto the redo they spawn and the "Ultimele X" wording.
- No persistence schema migration. The new field is additive and optional; `version`
  stays `1`.
- No change to Antrenament (training) or Revizuire flows.

## Key concept: a propagated lineage snapshot

Each redo session carries a small snapshot describing where it ultimately came from. It is
created once (on the first redo out of an origin) and propagated **unchanged** to every
descendant redo. The "current session" is always `practice.questionIds`; the "new wrong" is
always recomputed live from this session's answers.

### Data model - `src/lib/session-types.ts`

```ts
export interface RedoLineage {
  origin: {
    kind: "exam" | "practice";
    /** Full question set of the original session. Powers "Refa toata simularea/sesiunea". */
    questionIds: number[];
    /** Practice origin only: lets a redo show "Urmatoarele/Ultimele X". */
    subjectIds?: string[];
    batchSize?: number | null;
  };
  /** Snapshot of the origin's wrong answers. Powers "Greselile din simulare/sesiune". */
  firstWrong: number[];
}
```

Add to `PracticeState`:

```ts
  /** Set when this session is a redo derived from a larger session. */
  redoLineage?: RedoLineage;
```

Backward compatible: optional field, no version bump, old sessions deserialize with
`redoLineage === undefined` and are treated as normal/origin sessions. `loadSession` already
spreads `currentPractice` through verbatim, so no extra clamping is required.

## Pure logic - `src/lib/redo-lineage.ts` (+ test)

A single pure builder, mirroring the existing `redo.ts` / `redo-scope.ts` pattern, so the
page component stays thin and the branching is unit-tested.

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
 * Empty sets are dropped; exact set-duplicates collapse (compare as sorted ids).
 * When the origin's first mistakes equal the whole origin, "initial" is omitted
 * (the "full" button already covers it).
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

### Tests - `scripts/redo-lineage.test.mjs`

Cover, at minimum:

- No lineage: only "wrong" appears (or nothing if no wrong).
- Level 1 (current == firstWrong): `wrong + initial(=current) + full`, all distinct -> 3
  targets (8-wrong / 5-wrong style nodes).
- Level 2+ (current != firstWrong): same shape, `initial` is the original set, not current.
- 100% (wrongIds empty): `initial` becomes the first/primary target, plus `full`.
- All-wrong origin (firstWrong == origin): `initial` omitted, only `full` after `wrong`.
- wrong == initial (level 1, everything wrong again): dedup keeps `wrong`, drops `initial`.

Add the file to the `test` script in `package.json` (alongside the other
`node --import ./scripts/register-alias.mjs scripts/*.test.mjs` entries).

## Lineage creation and propagation (call sites)

`startPractice` (in `src/hooks/useSession.ts`) gains a `redoLineage?: RedoLineage` field on
`StartPracticeOptions` and writes it onto the created `PracticeState`.

1. **First redo from an exam** - `src/app/simulator/[examId]/page.tsx`, `handleRedo`, scope
   `"wrong"`:
   ```ts
   startPractice([], wrongIds, {
     shuffleOrder, shuffleOptions: shuffleAnswers, mode: "practice",
     redoLineage: {
       origin: { kind: "exam", questionIds: exam.questionIds },
       firstWrong: wrongIds,
     },
   });
   ```
   No visual change to the exam result screen; it is the origin, so it has no ladder yet.

2. **First redo from a practice origin and all deeper redos** -
   `src/app/practica/[sessionId]/page.tsx`. Compute the lineage once and reuse the parent's
   when present:
   ```ts
   const lineage = practice.redoLineage ?? {
     origin: {
       kind: "practice",
       questionIds: practice.questionIds,
       subjectIds: practice.subjectIds,
       batchSize: practice.batchSize,
     },
     firstWrong: wrongIdsThisSession,
   };
   ```
   Pass `redoLineage: lineage` for the `wrong` and `initial` redo actions (they stay in the
   chain). The `full` action re-runs the origin in its native mode and does **not** carry
   lineage (it is a fresh origin):
   - exam origin: `repeatExamFromIds(lineage.origin.questionIds, ...)` -> `/simulator/:id`.
   - practice origin: `startPractice(lineage.origin.subjectIds, lineage.origin.questionIds,
     { batchSize: lineage.origin.batchSize, mode: practice.mode })` -> `/practica/:id`.

## Practice results popup (adaptive ladder)

File: `src/app/practica/[sessionId]/page.tsx`, the summary `Modal`.

- **No lineage (normal session): unchanged.** Keep today's `Refa greselile / Refa rezolvate
  / Refa toata sesiunea` plus the next-batch button.
- **Has lineage (redo session):** render `buildRedoTargets({ wrongIds: wrongIdsThisSession,
  lineage })`. The first target is the primary button; the rest are secondary.

| Role / CTA | Label, exam origin | Label, practice origin | Action |
|---|---|---|---|
| `wrong` (M>0) | Refa greselile (M) | Refa greselile (M) | new practice, lineage propagated -> `/practica` |
| `initial` (K) | Greselile din simulare (K) | Greselile din sesiune (K) | new practice, lineage propagated -> `/practica` |
| `full` (T) | Refa toata simularea (T) | Refa sesiunea completa (T) | exam: `repeatExamFromIds` -> `/simulator`; practice: fresh `startPractice` -> `/practica` |
| move-on | + Simulare noua | Urmatoarele X / Ultimele X | exam: `startExam` -> `/simulator` (one-click, no confirm); practice: existing `handleContinueNextBatch` |

Labels in the app UI keep Romanian diacritics, consistent with existing copy
("Refa greselile" is written with diacritics in the running app).

### Decided: one-click, carry current settings

The ladder buttons start the redo in one click and do **not** open the order/shuffle
sub-panel. They carry the current session's settings: same question order, and the current
answer-shuffle state (`practice.optionOrder != null`). This matches what
`handleContinueNextBatch` already does for the next batch. Net effect: inside a redo session
the per-action "shuffle order" toggle is no longer offered, in exchange for the one-click
flow the user asked for.

### Move-on CTAs and "Ultimele X" wording

- The next-batch button (both normal practice and practice-origin redo) computes its pool
  from `practice.subjectIds` when present, else from `lineage.origin.subjectIds`; batch size
  from `practice.batchSize ?? lineage.origin.batchSize`.
- When the next batch is the final chunk (`batchSize == null || remainingUnanswered <=
  effectiveBatchSize`), label it "Ultimele X"; otherwise "Urmatoarele X". This wording
  change applies to normal practice too.
- Exam-origin redo has no subject pool, so it shows "Simulare noua" instead of a next batch.

### Worked example (Simulare 36 -> 8 -> 5 -> 3 -> 0)

- Exam result, 8 wrong: existing exam buttons; pressing "Refa greselile" stamps
  `{ origin: exam36, firstWrong: 8 }` onto the new practice.
- 5-wrong and 3-wrong nodes:
  `[Refa greselile(M)] · [Greselile din simulare(8)] · [Refa toata simularea(36)] · [+ Simulare noua]`
- 0-wrong node:
  `[Greselile din simulare(8)] (primary) · [Refa toata simularea(36)] · [+ Simulare noua]`

## Optional extras (approved, in scope)

1. A one-line hint under the ladder explaining "greselile din simulare" vs "toata
   simularea", styled like the simulator result screen's existing info box.
2. A subtle origin badge at the top of a redo session (for example "Reluare din Simulare"),
   styled like the current "Mod simulare" badge, so the user always knows where they are in
   the chain. Derived from `practice.redoLineage?.origin.kind`.

## Release plumbing (v2.2.0)

- `src/lib/site-config.ts`: `APP_VERSION = "2.2.0"`.
- `src/app/noutati/page.tsx`: prepend a v2.2.0 entry, date "21 Iunie 2026", **no
  diacritics**, in the redo feature line. Draft:
  - title: "Reiei greselile fara sa pierzi sesiunea mare"
  - feature: "Cand reiei greselile dupa un simulator sau o practica si tot mai ai de lucru,
    poti acum sa reiei direct sesiunea mare din care au venit (de exemplu toate cele 36 de
    grile din simulator), nu doar ultimul set mic de greseli"
  - feature: "Reiei dintr-un singur loc oricare set: doar greselile de acum, toate greselile
    initiale, sau sesiunea completa; butoanele se potrivesc singure dupa cate greseli ti-au
    mai ramas"
  - improvement: "Cand iei 100% pe un set de greseli, primesti pe loc optiunea sa reiei toate
    greselile initiale sau toata sesiunea, nu doar setul mic pe care tocmai l-ai terminat"
  - improvement: "Pornesti o simulare noua direct din rezultat, dintr-un clic; la practica
    continui cu urmatorul lot, iar cand e ultimul scrie 'Ultimele X'"
- `src/components/home/ChangelogBanner.tsx`: replace `recentChanges` with 3 no-diacritics
  bullets summarizing the above. The version badge reads `APP_VERSION` automatically.
- `src/components/home/WhatsNewModal.tsx`: rewrite section 1 to announce the redo-chain
  feature (diacritics OK here, matching the rest of this component). **Keep** the Gen-E vote
  section as-is. Suggested section-1 title: "Reia greselile fara sa pierzi sesiunea mare".
- `src/components/home/WhatsNewGate.tsx`: bump `WHATSNEW_KEY` to `"utm-whatsnew-v220"` so
  returning users see the popup again.

## File-by-file change checklist

1. `src/lib/session-types.ts` - add `RedoLineage`, add `redoLineage?` to `PracticeState`.
2. `src/lib/redo-lineage.ts` - new, `buildRedoTargets` + `RedoRole`/`RedoTarget`.
3. `scripts/redo-lineage.test.mjs` - new, unit tests; register in `package.json` test script.
4. `src/hooks/useSession.ts` - `StartPracticeOptions.redoLineage`; write it in `startPractice`.
5. `src/app/simulator/[examId]/page.tsx` - stamp lineage in `handleRedo` (scope "wrong").
6. `src/app/practica/[sessionId]/page.tsx` - lineage-aware summary: ladder buttons, move-on
   CTA, "Ultimele X" wording, origin badge + hint; import `startExam`, `repeatExamFromIds`.
7. `src/lib/site-config.ts` - version bump.
8. `src/app/noutati/page.tsx` - changelog entry.
9. `src/components/home/ChangelogBanner.tsx` - recent changes.
10. `src/components/home/WhatsNewModal.tsx` - announce feature.
11. `src/components/home/WhatsNewGate.tsx` - bump gate key.

## Edge cases

- Origin question deleted later: `getQuestion` already guards; redo sets filter to existing
  ids via the same `exists` checks used today. `buildRedoTargets` operates on whatever ids
  it is given, so filter before passing if needed (mirror current `wrongIdsInPractice`).
- 100% on the very first redo (one level): `initial == current`, so the ladder shows
  "Greselile din simulare (K)" as primary plus "Refa toata simularea". No duplicate.
- Everything wrong on the origin (firstWrong == origin): "initial" is omitted; only "full"
  appears after "wrong".
- Practice origin with `batchSize == null` (user picked "all"): no remaining pool, so no
  next-batch button; "Refa sesiunea completa" still works.

## Testing and verification

- `npm test` (now includes `redo-lineage.test.mjs`) must pass.
- `npm run lint` clean.
- Build requires `DATABASE_URL`; verify with a dummy neon URL (tests/lint do not need it).
- Manual smoke (the `/run` or `/verify` flow): simulator -> wrong -> drill to 0, checking the
  ladder at each node; practice batch -> wrong -> drill, checking "Ultimele X" on the final
  batch and "Simulare noua" never showing for a practice origin.
