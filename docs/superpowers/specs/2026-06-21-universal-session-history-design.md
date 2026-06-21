# Universal session history (v2.3.0) - design

- Date: 2026-06-21
- Target version: 2.3.0
- Status: approved, ready for implementation plan

## Problem

Only exam (simulator) sessions are kept in history with stats and retry
(`examHistory`, archived on submit, shown via `ExamHistoryModal` /
`SimulatorResultCard`). Practice and training sessions are ephemeral:
`currentPractice` / `currentTraining` are cleared on end or overwritten on the
next start, so a user can never go back to a past practice batch or training run
to see how it went or redo it. We want history + per-session stats + one-click
retry for ALL session types, surfaced in one place.

Separately, on the practice landing page the Simulator and Antrenament CTAs sit
above "Reia ce ai de recuperat"; they should sit under it.

## Goals

1. Record practice and training sessions to history (exams already are), with a
   per-session stat snapshot taken at end-time.
2. Show all past sessions (exam + practice + training) in one unified, newest-
   first "Istoric sesiuni" timeline on `/rezultate`, each retryable in one click.
3. Stats per session in the spirit of the simulator card (accuracy, correct/
   total, per-module for practice; mastered/pool for training; score for exams).
4. Move the Simulator + Antrenament CTAs under "Reia ce ai de recuperat".
5. Ship as v2.3.0 with changelog, banner, and a refreshed What's-New popup.

## Non-goals

- No full per-question review for practice/training history (lean: stats +
  retry only). Exams keep their existing full review via `/simulator/{examId}`.
- No history on the simulator result screen beyond today's exam-only one (the
  unified timeline lives on `/rezultate`; the simulator screen keeps
  `ExamHistoryButton` as-is, since an all-types list there is out of context).
- No persistence migration: new fields are optional/additive, `version` stays 1.

## Key constraint

Global `answers` mutate as later sessions and redo drills re-answer questions, so
a history record must SNAPSHOT its stats at the moment the session ends, not
recompute from `answers` later (same lesson as the redo-lineage `firstWrong`).

## Data model - `src/lib/session-types.ts`

```ts
export interface PracticeSummary {
  id: string;                 // generated at archive time (retry + react key)
  startedAt: string;
  endedAt: string;
  mode: "practice" | "test";
  subjectIds: string[];       // for retry + label
  questionIds: number[];      // for retry (same set)
  answered: number;
  correct: number;
  wrong: number;
  perModule: Record<string, { correct: number; total: number }>;
  durationMs: number;         // sum of this session's answer timeSpentMs
}

export interface TrainingSummary {
  id: string;
  startedAt: string;
  endedAt: string;
  subjectIds: string[];       // for retry (restart same scope)
  seenCount: number;
  answeredCount: number;
  correctCount: number;
  masteredAtEnd: number;
  poolSize: number;
}
```

Add to `LocalSession`:

```ts
  practiceHistory?: PracticeSummary[];
  trainingHistory?: TrainingSummary[];
```

Add constants near `MAX_EXAM_HISTORY`:

```ts
export const MAX_PRACTICE_HISTORY = 20;
export const MAX_TRAINING_HISTORY = 20;
```

Also move `ExamSummaryData` (currently defined in `useSession.ts`) into
`session-types.ts`, so both `useSession` and the new `session-history.ts` import
it from one place (no cross-import between the hook and the lib). `useSession`
re-imports it; `computeExamSummary` stays in the hook.

`loadSession` normalizes both to arrays (mirror the `examHistory` handling).
Backward compatible: old sessions deserialize with `undefined` -> treated as [].

## Pure logic - `src/lib/session-history.ts` (+ test)

```ts
import type {
  PracticeState, TrainingState, AnswerRecord,
  PracticeSummary, TrainingSummary,
} from "./session-types";
import type { ExamSummaryData } from "./session-types"; // moved here from useSession

export type SessionHistoryEntry =
  | { kind: "exam"; date: string; exam: ExamSummaryData; questionIds: number[] }
  | { kind: "practice"; date: string; practice: PracticeSummary }
  | { kind: "training"; date: string; training: TrainingSummary };

/** Stats for one practice session, snapshotted from the answers it produced. */
export function computePracticeSummary(
  practice: PracticeState,
  answers: Record<number, AnswerRecord>,
  resolveModule: (id: number) => string | undefined,
  id: string,
  endedAt: string,
): PracticeSummary {
  let correct = 0, wrong = 0, durationMs = 0;
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
    if (a.isCorrect) correct += 1; else wrong += 1;
    durationMs += a.timeSpentMs;
  }
  return {
    id, startedAt: practice.startedAt, endedAt, mode: practice.mode,
    subjectIds: practice.subjectIds, questionIds: practice.questionIds,
    answered: correct + wrong, correct, wrong, perModule, durationMs,
  };
}

/** Stats for one training session (field copy + mastered count snapshot). */
export function computeTrainingSummary(
  training: TrainingState, masteredAtEnd: number, id: string, endedAt: string,
): TrainingSummary {
  return {
    id, startedAt: training.startedAt, endedAt, subjectIds: training.subjectIds,
    seenCount: training.seenIds.length, answeredCount: training.answeredCount,
    correctCount: training.correctCount, masteredAtEnd, poolSize: training.pool.length,
  };
}

/** Merge the three histories newest-first by their date field. Pure. */
export function sortSessionHistory(entries: SessionHistoryEntry[]): SessionHistoryEntry[] {
  return [...entries].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
```

### Tests - `scripts/session-history.test.mjs` (register in `package.json`)

- `computePracticeSummary`: counts only this-session answers (`answeredAt >=
  startedAt`), correct/wrong split, perModule via injected resolver, durationMs =
  sum of timeSpentMs, ignores answers from other sessions and missing answers.
- `computeTrainingSummary`: maps fields, seenCount from seenIds length, passes
  masteredAtEnd through.
- `sortSessionHistory`: mixes exam/practice/training and returns newest-first.

## Recording (archive) - `src/hooks/useSession.ts`

Mirror `archiveExamIfSubmitted`. Add:

```ts
function archivePracticeIfRecordable(prev: LocalSession): PracticeSummary[] {
  const p = prev.currentPractice;
  const hist = prev.practiceHistory ?? [];
  if (!p || p.redoLineage) return hist;            // skip redo drills
  const summary = computePracticeSummary(p, prev.answers,
    (id) => getQuestion(id)?.moduleId, crypto.randomUUID(), new Date().toISOString());
  if (summary.answered === 0) return hist;          // skip empty sessions
  return [summary, ...hist].slice(0, MAX_PRACTICE_HISTORY);
}
```

and the training analogue `archiveTrainingIfRecordable` (computes `masteredAtEnd
= masteredCount(t.pool, prev.trainingBoxes ?? {}, prev.answers)`; skips when
`answeredCount === 0`).

Call sites:
- `startPractice`: archive the outgoing `currentPractice` before overwriting
  (set `practiceHistory: archivePracticeIfRecordable(prev)` in the updater).
- `endPractice`: archive before nulling `currentPractice`.
- `startTraining`: archive the outgoing `currentTraining` before overwriting.
- `endTraining`: archive before nulling `currentTraining`.

Each `currentPractice` / `currentTraining` is archived at most once (it is either
overwritten or ended, then gone). Exams are unchanged.

## Read + retry - `src/hooks/useSession.ts`

```ts
const getSessionHistory = useCallback((): SessionHistoryEntry[] => {
  const exams = (session.examHistory ?? []).map((e) => ({
    kind: "exam" as const, date: e.submittedAt ?? e.startedAt,
    exam: computeExamSummary(e), questionIds: e.questionIds,
  }));
  const practices = (session.practiceHistory ?? []).map((p) => ({
    kind: "practice" as const, date: p.endedAt, practice: p,
  }));
  const trainings = (session.trainingHistory ?? []).map((t) => ({
    kind: "training" as const, date: t.endedAt, training: t,
  }));
  return sortSessionHistory([...exams, ...practices, ...trainings]);
}, [session.examHistory, session.practiceHistory, session.trainingHistory]);
```

Retry uses existing hooks (no new ones needed), called from the UI:
- practice -> `startPractice(p.subjectIds, p.questionIds, { mode: p.mode })` ->
  `/practica/{id}`. Filter `questionIds` through `getQuestion` so deleted ids drop;
  if none remain, the retry button is disabled.
- training -> `startTraining(t.subjectIds)` -> `/antrenament/{id}` (or null-guard).
- exam -> `repeatExamFromIds(entry.questionIds, false)` -> `/simulator/{id}`.

Also add `clearSessionHistory()` (clears all three arrays) for a single "sterge
istoricul" control, or reuse per-type clears; a single clear is simpler.

## UI - unified "Istoric sesiuni" on `/rezultate`

New `src/components/results/SessionHistory.tsx`. Props: `entries:
SessionHistoryEntry[]`, retry callbacks, `onClear?`. Renders newest-first cards;
each card has a type chip, a headline stat, `timeAgo(date)`, and a "Reia" button:

- exam: chip "Simulare", score `8.50`, `correct/total`; plus a "Vezi" link to
  `/simulator/{examId}` (full review). Retry = `repeatExamFromIds`.
- practice: chip "Practica", `accuracy%`, `correct/answered`; expandable per-
  module breakdown (reuse the `ExamHistoryModal` per-module row pattern). Retry =
  `startPractice`.
- training: chip "Antrenament", `seenCount vazute`, `masteredAtEnd/poolSize
  stapanite`. Retry = `startTraining`.

Use the existing `timeAgo` helper and module colors. On `/rezultate`, replace the
current `<ExamHistoryButton .../>` (around lines 61-66) with `<SessionHistory
entries={getSessionHistory()} ... />`. Keep `ExamHistoryButton` / `ExamHistoryModal`
in place for the simulator result screen (unchanged).

If the list is long, show the most recent ~15 with a "Vezi tot" toggle to expand
the rest (no separate modal needed).

## CTA reorder - `src/app/practica/page.tsx`

Move the Simulator `<Link href="/simulator">` block and the
`<AntrenamentCrossSell />` to render AFTER the "Reia ce ai de recuperat" block
and before `<SubjectSelector />`. When "Reia ce ai de recuperat" does not render
(no wrong/marked yet), the two CTAs simply lead that area. No logic change, only
JSX order.

## Release (v2.3.0)

- `src/lib/site-config.ts`: `APP_VERSION = "2.3.0"`.
- `src/app/noutati/page.tsx`: prepend a v2.3.0 entry (no diacritics). Draft:
  - title: "Istoric pentru toate sesiunile, cu reluare"
  - feature: "Acum se salveaza in istoric si sesiunile de practica si de
    antrenament, nu doar simularile; le gasesti pe pagina Rezultate, cu statistici
    si un buton de reluare, ca sa reiei oricand o sesiune"
  - improvement: "Fiecare sesiune din istoric arata cum a mers (acuratete,
    corecte din total, pe module la practica, cate ai stapanit la antrenament)"
  - improvement: "Pe pagina de Practica, butoanele Simulator si Antrenament au
    fost mutate sub 'Reia ce ai de recuperat'"
- `src/components/home/ChangelogBanner.tsx`: 3 fresh no-diacritics bullets.
- `src/components/home/WhatsNewModal.tsx`: rewrite section 1 to announce session
  history (diacritics OK; keep the Gen-E vote section).
- `src/components/home/WhatsNewGate.tsx`: bump `WHATSNEW_KEY` to
  `"utm-whatsnew-v230"`.

## File-by-file change checklist

1. `src/lib/session-types.ts` - `PracticeSummary`, `TrainingSummary`,
   `practiceHistory?`/`trainingHistory?`, `MAX_PRACTICE_HISTORY`/
   `MAX_TRAINING_HISTORY`; move `ExamSummaryData` here from `useSession.ts`;
   normalize the new arrays in `loadSession`.
2. `src/lib/session-history.ts` - new: summary builders + `sortSessionHistory` +
   `SessionHistoryEntry`.
3. `scripts/session-history.test.mjs` - new tests; register in `package.json`.
4. `src/hooks/useSession.ts` - archive helpers + call sites; `getSessionHistory`;
   `clearSessionHistory`; normalize new arrays in load.
5. `src/components/results/SessionHistory.tsx` - new unified timeline component.
6. `src/app/rezultate/page.tsx` - use `SessionHistory` in place of the exam-only
   history button.
7. `src/app/practica/page.tsx` - CTA reorder.
8. `src/lib/site-config.ts`, `src/app/noutati/page.tsx`,
   `src/components/home/ChangelogBanner.tsx` - release.
9. `src/components/home/WhatsNewModal.tsx`, `WhatsNewGate.tsx` - popup + gate key.

## Edge cases

- Practice/training session with 0 answers: not archived.
- Redo drills (`redoLineage` set): not archived (per chosen scope).
- A paged practice run archives one entry per batch (each batch is its own main
  session); acceptable and accurate.
- Retry of a practice whose questions were since deleted: filter ids via
  `getQuestion`; disable retry if none remain.
- Old saved sessions: no `practiceHistory`/`trainingHistory` -> treated as [].

## Testing and verification

- `npm test` (now includes `session-history.test.mjs`) passes.
- `npm run lint` clean; `npx tsc --noEmit` clean.
- Build with a dummy neon `DATABASE_URL`.
- Manual smoke: run a practice batch -> end -> see it on /rezultate with stats ->
  Reia re-runs it; same for a training run; confirm a redo drill is NOT recorded;
  confirm exams still appear and retry; confirm the practice-page CTA order.
