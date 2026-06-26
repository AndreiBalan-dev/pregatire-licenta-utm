# Keyboard navigation for question screens (v2.6.0)

## Overview

A desktop-only quality-of-life feature: answer and navigate questions from the
keyboard, on all three answer runtimes (Practica, Antrenament, Simulator).

- `Up` / `Down` move a focus cursor between the answer options.
- `Space` confirms the focused option (same effect as clicking it).
- `Right` goes to the next question, `Left` to the previous one.

It must not change the current mouse/touch experience. It is gated by a
preference toggle (on by default, like the highlighter), shown only on desktop,
and never present on mobile (no physical keyboard there).

## A. Preference (toggle)

Mirror the highlighter's pattern exactly.

- `src/lib/keyboard-nav.ts`: `KEYBOARD_NAV_STORAGE_KEY = "utm-keyboard-nav"` and
  `resolveInitialKeyboardNav(stored: string | null): boolean` returning `true`
  when `stored === null` (first-time = on), else `stored === "1"`. Framework-free
  so it can be unit-tested under the node runner.
- `src/hooks/useKeyboardNav.tsx`: `KeyboardNavProvider` + `useKeyboardNav()`
  exposing `{ on, toggle, hint, showHint, hideHint }`. State for `on` resolves
  from localStorage after mount (SSR renders off). `toggle()` flips and persists,
  and when turning ON (on desktop) calls `showHint()`. The provider also owns the
  transient-hint state (`hint`) and renders `<KeyboardHintPopup>` once, globally.
- `src/components/ui/KeyboardNavToggle.tsx`: a navbar button (keyboard glyph)
  next to `HighlighterToggle`. Accent glow + dot when on. Wrapped so it is
  `hidden md:inline-flex` (desktop only). `role="switch"`, `aria-checked={on}`.
- Provider mounted at the root in `src/app/layout.tsx`, wrapping `children`
  alongside `HighlighterProvider`.

## B. Keyboard interaction model

A shared hook drives the behavior identically on every screen.

`src/hooks/useQuestionKeyboard.ts`:

```
useQuestionKeyboard({
  active,          // feature on AND desktop AND no modal open AND a live question is shown
  optionCount,     // number of options (4)
  focusedIndex,    // number | null (page state)
  onFocusChange,   // (index: number) => void
  onConfirm,       // () => void  — confirm the focused option
  confirmEnabled,  // boolean — false once the answer is locked / feedback shown
  onNext,          // (() => void) | undefined
  onPrev,          // (() => void) | undefined
})
```

Behavior (window `keydown` listener, only while `active`):

- `ArrowDown` / `ArrowUp`: when `confirmEnabled`, move focus. If `focusedIndex`
  is null, the first press seeds it (Down -> 0, Up -> last); otherwise it moves by
  one and clamps to `[0, optionCount-1]` (no wrap). Calls `onFocusChange`.
  `preventDefault` to stop page scroll.
- `Space`: when `confirmEnabled` and `focusedIndex != null`, call `onConfirm()`.
  `preventDefault` to stop page scroll.
- `ArrowRight`: call `onNext?.()` and `preventDefault`.
- `ArrowLeft`: call `onPrev?.()` and `preventDefault`.

Guards (the listener returns early, key passes through untouched):

- A modifier is held (`ctrlKey`, `altKey`, `metaKey`).
- The event target is an editable element (`input`, `textarea`, `select`,
  `[contenteditable]`).
- `active` is false (covers: feature off, mobile, modal open, no live question).

Desktop check: `active` includes `window.matchMedia("(min-width: 768px)").matches`,
evaluated on mount and on resize (matchMedia change), so a phone never engages it.

### Per-screen wiring

Each runtime page adds page-level focus state and wires the hook to its existing
actions. The focus cursor index is translated to an answer key via the shared
order helper so it respects shuffled options.

- `src/lib/options.ts`: `orderedOptionKeys(question, optionOrder)` returning the
  4 keys in display order (the `optionOrder` permutation when length 4, else the
  question's own key order). `QuestionCard` is refactored to use it too, so the
  card and the pages always agree on order.

- State on each page: `const [focusedIndex, setFocusedIndex] = useState<number | null>(null)`,
  reset to `null` whenever the displayed question id changes.

- **Practica** (`src/app/practica/[sessionId]/page.tsx`):
  - `onConfirm` = select `orderedKeys[focusedIndex]` via `handleSelectAnswer`.
  - `confirmEnabled` = `!showFeedback` (test mode: stays true, you can re-pick).
  - `onNext` = `goToNext`, `onPrev` = `goToPrev`.
  - `active` = feature on AND `!showSummary`.

- **Antrenament** (`src/app/antrenament/[sessionId]/page.tsx`):
  - `onConfirm` = `handleSelect(orderedKeys[focusedIndex])`.
  - `confirmEnabled` = `!reviewing && !showFeedback`.
  - `onNext` = `handleForward`, `onPrev` = `handleBack` (mirrors the on-screen
    buttons, including review navigation).
  - `active` = feature on AND `!showSummary`.

- **Simulator** (`src/app/simulator/[examId]/page.tsx`):
  - Only in active mode (`isActiveMode && currentQuestion`).
  - `onConfirm` = `handleSelectAnswer(orderedKeys[focusedIndex])`.
  - `confirmEnabled` = not locked by live feedback (i.e. not (`liveFeedbackEnabled`
    and already answered)).
  - `onNext` = `goToNext` (or open submit on the last question, matching the
    button), `onPrev` = `goToPrev`.
  - `active` = feature on AND no submit/restart/redo modal open.

### QuestionCard visual

- New optional prop `focusedIndex?: number | null`. Non-breaking; ExamReview and
  any other consumer omit it.
- The option at `orderedKeys[focusedIndex]` (when set and not disabled) gets a
  focus ring distinct from "selected": an accent outline ring with no fill, so it
  reads as "cursor here, not yet chosen". Selected keeps its current filled accent
  border + glow.
- Accessibility: the radiogroup gets `aria-activedescendant` pointing at the
  focused option's id; each option button gets a stable id.

## C. Transient command hint popup

`src/components/ui/KeyboardHintPopup.tsx`, rendered once by the provider.

- Shows when: `showHint()` is called. That happens (a) on explicit toggle ON, and
  (b) once per browser session when a runtime page mounts with the feature on
  (the page calls `showHint()` guarded by a `sessionStorage` flag), so default-on
  users discover it without being nagged every question.
- Content: three commands with small keycap chips:
  `Up Down navighezi · Space confirmi · Left Right schimbi intrebarea`
  (UI copy uses full diacritics).
- Position: fixed bottom-center, above the navigation buttons. Desktop only
  (`hidden md:flex`). High z-index, below modals.
- Auto-dismiss after 5 seconds, shown by a depleting progress bar. Dismisses on a
  click on the popup OR anywhere on screen. The document click listener is
  attached on the next tick so the click that toggled it on does not instantly
  close it. Respects `prefers-reduced-motion` (bar does not animate; the 5s
  timeout still hides it).

## D. What's New popup (re-triggered)

The last popup was v2.5.0 (current key `utm-whatsnew-v250-evidentiator`). Bump it
to re-announce for everyone.

- `src/components/home/WhatsNewGate.tsx`: `WHATSNEW_KEY` -> `"utm-whatsnew-v260-tastatura"`.
- `src/components/home/WhatsNewModal.tsx`:
  - Lead section (replace): **v2.6.0 - Control cu tastatura**, explaining
    Up/Down navighezi, Space confirmi, Left/Right schimbi intrebarea; on by default
    on desktop, toggle in the top bar. CTA to `/practica`.
  - Recap section (replace the old second section): **"De la ultimul anunt"**, one
    compact line per version with a version chip: v2.5.1 cod ca si cod, v2.5.2
    explicatii corecte la amestecare, v2.5.3 cod peste tot, v2.5.4 fix antrenament
    blocat pe loading, v2.5.5 countdown la proba scrisa.
  - Section 2 (the Algebo.ai votes thank-you): PRESERVED untouched.

## E. Versioning

Bump to **2.6.0** in the three release files (`site-config.ts`,
`noutati/page.tsx`, `ChangelogBanner.tsx`). Changelog/banner copy in Romanian
without diacritics. Unlike the recent patch bumps, this release deliberately
re-triggers the What's New popup (the key bump above).

## F. Files

New:
- `src/lib/keyboard-nav.ts`
- `src/lib/options.ts`
- `src/hooks/useKeyboardNav.tsx`
- `src/hooks/useQuestionKeyboard.ts`
- `src/components/ui/KeyboardNavToggle.tsx`
- `src/components/ui/KeyboardHintPopup.tsx`

Modified:
- `src/app/practica/[sessionId]/page.tsx`
- `src/app/antrenament/[sessionId]/page.tsx`
- `src/app/simulator/[examId]/page.tsx`
- `src/components/practice/QuestionCard.tsx`
- `src/components/layout/Header.tsx`
- `src/app/layout.tsx`
- `src/components/home/WhatsNewGate.tsx`
- `src/components/home/WhatsNewModal.tsx`
- `src/lib/site-config.ts`, `src/app/noutati/page.tsx`, `src/components/home/ChangelogBanner.tsx`

## G. Testing

- `scripts/keyboard-nav.test.mjs`: `resolveInitialKeyboardNav` (null -> on, "0" ->
  off, "1" -> on).
- `scripts/options.test.mjs`: `orderedOptionKeys` (default order, permutation,
  malformed/short order falls back to default).
- Pure focus-cursor math extracted as a tiny helper (e.g. `nextFocusIndex(current,
  delta, count)`) and unit-tested for clamp/seed/no-wrap, kept out of the React
  hook so it is testable without a DOM.
- `npm test`, `eslint`, `tsc --noEmit`, and `next build` all pass.

## H. Edge cases

- Space/arrows `preventDefault` only when the feature handles them, so page scroll
  is preserved everywhere else.
- Once feedback is shown (answer locked), Up/Down/Space are inert; Left/Right still
  navigate.
- Modal open (summary, submit, restart, redo) -> `active` is false; keys pass
  through (e.g. Esc still closes the modal).
- A resumed question with an already-selected answer seeds `focusedIndex` to that
  option's index on first arrow press, so navigation continues from there.
- Reviewing a past question in Antrenament: `confirmEnabled` false; Left/Right map
  to the review back/forward actions.
