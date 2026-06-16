# Redo wrong answers, straight from the result — design

**Date:** 2026-06-16
**Status:** Approved for planning (pending spec review)

## Problem

The app can already relaunch a session from a set of wrong/marked questions, but only
from **global** entry points (`/practica` start cards, `/revizuire` filters) that draw
from *every* wrong answer ever recorded. There is no way to say "redo just the ones I
missed **in this session/exam**" from the place you just finished — you have to leave the
result, go to another page, and the set isn't scoped to what you just did.

Two surfaces end a session:

- **Practice "Rezumat Sesiune" popup** (`/practica/[sessionId]`) — covers both practice
  mode and simulare/test custom-set sessions. Today its actions are only
  "Următoarele X întrebări", "Înapoi", "Rezultate". No redo at all.
- **Exam simulator results** (`/simulator/[examId]`) — has "Re-fă acest examen" (redoes
  the **whole** exam) and "Examen Nou". No wrong-only redo.

## Goal

From the result itself, let the user **redo only the wrong answers from that very
session/exam, in one place, fast**, with the same shuffle controls the simulator redo
already offers. Scope is the session/exam you just finished — not the global pool.

## Key constraint that shapes the design

The exam score is `computeScore(correct) = 1.0 + correct × 0.25`, calibrated to
`EXAM_TOTAL_QUESTIONS = 36` (max 10.0). Redoing only the ~11 wrong ones **as an exam**
would render "Nota 3.75/10" even at 100% correct — actively misleading. Therefore a
wrong-only redo must **not** reuse the exam scoring UI. It runs as an accuracy-based
**practice test-drill** instead.

## Design

### Shared interaction

A **"Refă" entry point** on each result reveals an **options panel** before launching:

- **Scope** — `Toate` (the full session/exam set) vs `Doar greșite (N)`.
  `Doar greșite` is disabled when N = 0.
- **Ordinea întrebărilor** — `Aceeași` vs `Amestecă` (existing `OrderCard` pattern).
- **Amestecă răspunsurile** — toggle (existing pattern).

Deliberately **out of scope** (YAGNI; re-read of the request confirms neither is needed):
per-subject checkboxes, and an Exersează/Simulează mode toggle. "pe materie sau pe
simulare" referred to the two **contexts** (practice vs simulator), not a mode switch.
Redo inherits the source session's own mode.

### A) Practice "Rezumat Sesiune" popup

The redo options render as a **sub-view inside the same modal** (panel swap), reached by a
CTA in the main summary view and dismissed by a **back-chevron at the top-left**. No
stacked modals.

- **Main view:** add a CTA below the stats / remaining-info block.
  - When the session has wrong answers: `↻ Refă greșitele (N)` (wrong-accent), opens the
    sub-view with **Doar greșite** preselected.
  - When N = 0: a quieter `Refă sesiunea`, opens with **Toate** preselected.
  - Existing buttons ("Următoarele X", "Înapoi", "Rezultate") are unchanged.
- **Sub-view:** Scope cards + Order cards + shuffle-answers toggle + a single `Începe`
  button.
- **Launch** reuses the proven `handleContinueNextBatch` mechanism:
  - `ids` = scope `wrong` → this session's wrong answers; scope `all` → `practice.questionIds`.
  - "this session's wrong" = `questionIds` where `session.answers[id].answeredAt >=
    practice.startedAt && !isCorrect && getQuestion(id)` exists. (Answered-and-incorrect
    only; unanswered are not "wrong answers".)
  - `startPractice([], ids, { shuffleOrder, shuffleOptions: shuffleAnswers, mode: practice.mode })`
    then `setShowSummary(false)` and `router.replace('/practica/' + newId)`.
  - Empty `subjectIds` matches existing review-session behavior (no "next batch" in a
    review run).

### B) Exam simulator results

Two changes:

1. **Page-level CTA** (your "outside the popup" ask): in the results actions, add
   `Refă greșitele (N)` shown only when wrong count > 0. It opens the enhanced redo modal
   **preset to `Doar greșite`**. "Re-fă acest examen" opens the same modal **preset to
   `Toate`**. Two entry points, one modal.

2. **Enhanced `ExamRestartModal`:** add the **Scope** selector on top of the existing
   order + shuffle-answers controls, plus a one-line note for the wrong path
   ("Greșelile se reiau ca exercițiu, cu scor pe acuratețe, nu nota /10."). Confirm-button
   label adapts to scope.

**Routing by scope (in the simulator page confirm handler):**

- `Toate` → `repeatExamFromIds(exam.questionIds, shuffleOrder, shuffleAnswers)` →
  `/simulator/[newId]`. **Unchanged** from today — a real repeat exam with the proper /10
  score.
- `Doar greșite` → `startPractice([], wrongIds, { shuffleOrder, shuffleOptions:
  shuffleAnswers, mode: 'test' })` → `/practica/[newId]`. Accuracy-based drill, reviewable
  with explanations afterward.
  - `wrongIds` from the exam = `questionIds` where `exam.answers[id]` is missing **or**
    `!== correctAnswer` (unanswered exam questions count as wrong).

The simulator page must also pull `startPractice` from `useSession` (currently not
destructured there).

### Shared UI building blocks

To keep the two panels visually identical and avoid duplication, lift the small controls
into a shared module (e.g. `src/components/review/RedoControls.tsx`): a `ScopeSelector`,
the `OrderSelector` (today's private `OrderCard`), and the `ShuffleAnswersToggle`.
`ExamRestartModal` is refactored to consume them with **no behavior change**; the practice
sub-view consumes the same.

### Modal change

Add an optional `onBack?: () => void` to `src/components/ui/Modal.tsx`. When provided,
render a back-chevron at the top-left and pad the title on the left. Optional → existing
modals are unaffected.

## Components / files touched

- `src/components/ui/Modal.tsx` — optional `onBack` prop.
- `src/components/review/RedoControls.tsx` — **new** shared controls (Scope / Order / ShuffleAnswers).
- `src/components/exam/ExamRestartModal.tsx` — add scope; consume shared controls; new
  `wrongCount` + `initialScope` props; `onConfirm` carries `{ scope, shuffleOrder, shuffleAnswers }`.
- `src/app/practica/[sessionId]/page.tsx` — `summaryView` state, wrong-ids memo, redo
  sub-view, launch handler, main-view CTA.
- `src/app/simulator/[examId]/page.tsx` — wrong-ids memo, page-level "Refă greșitele" CTA,
  scope-aware confirm handler, pull `startPractice`.

## Edge cases

- N = 0 wrong → practice popup shows "Refă sesiunea" (all); simulator hides the wrong CTA
  (the existing "Niciuna greșită!" state already covers a perfect exam).
- A wrong-drill can itself be redone (its end popup offers the same CTA) — natural
  narrowing, no special handling.
- Historical exams (`isHistorical`) already support repeat; the wrong CTA reads from the
  same `exam.answers`, so it works there too.

## Testing / verification

No automated test runner is present in the repo; verify by running the app:

1. Practice a multi-question set, miss a few, end → "Refă greșitele (N)" → confirm the
   drill contains exactly the missed questions, in the chosen order, same mode.
2. "Refă sesiunea / Toate" relaunches the full set.
3. Simulator: finish an exam with some wrong → page CTA + modal "Doar greșite" lands in a
   `/practica` test-drill with the wrong+unanswered ids and **accuracy** (no /10 score).
4. Simulator "Toate" still produces a real repeat exam with a proper /10 score (no
   regression).
5. Back-chevron returns to the summary; Esc / overlay / X still close.

## Release

On completion: version bump + changelog (Romanian, no diacritics) per the usual 3-file
release routine (incl. `ChangelogBanner`).
