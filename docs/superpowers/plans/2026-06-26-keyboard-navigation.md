# Keyboard Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let desktop users answer and move through questions with the keyboard (Up/Down to move a focus cursor, Space to confirm, Left/Right to change question), on Practica, Antrenament and Simulator, behind an on-by-default toggle.

**Architecture:** A preference context (mirrors the highlighter) gates the feature and owns a transient command-hint popup. `QuestionCard` is the single integration point: it owns the focus-cursor state and calls a `useQuestionKeyboard` hook (the window keydown listener + guards). Each runtime page only passes `keyboardActive` + `onNext`/`onPrev`. Pure helpers (initial-state resolver, focus-index math, option ordering) are unit-tested under the node runner.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, node test scripts.

## Global Constraints

- Desktop only: the toggle button, the hint popup, and the keydown handling never engage below 768px (`window.matchMedia("(min-width: 768px)")`).
- On by default, persisted per visitor in `localStorage` key `utm-keyboard-nav` ("1"/"0"); first-time (null) = on. Same shape as the highlighter.
- Must not change the existing mouse/touch experience: new `QuestionCard` props are optional; default off.
- Changelog/banner copy: Romanian, NO diacritics. In-app UI copy (popup, hint): full diacritics. No em dashes anywhere.
- Version bump to 2.6.0 touches THREE files: `src/lib/site-config.ts`, `src/app/noutati/page.tsx`, `src/components/home/ChangelogBanner.tsx`. This release DELIBERATELY re-triggers the What's New popup by bumping its key.
- Build needs a dummy `DATABASE_URL`; tests/lint do not.

---

### Task 1: Pure helpers (preference resolver, focus math, option order)

**Files:**
- Create: `src/lib/keyboard-nav.ts`
- Create: `src/lib/options.ts`
- Test: `scripts/keyboard-nav.test.mjs`, `scripts/options.test.mjs`
- Modify: `package.json` (append the two test files to the `test` script)

**Interfaces:**
- Produces: `KEYBOARD_NAV_STORAGE_KEY: string`, `resolveInitialKeyboardNav(stored: string | null): boolean`, `nextFocusIndex(current: number | null, delta: 1 | -1, count: number): number`, `orderedOptionKeys(question: Question, optionOrder?: AnswerKey[]): AnswerKey[]`.

- [ ] **Step 1: Write the failing tests**

`scripts/keyboard-nav.test.mjs`:
```js
import process from "node:process";
import assert from "node:assert/strict";
import { resolveInitialKeyboardNav, nextFocusIndex, KEYBOARD_NAV_STORAGE_KEY } from "../src/lib/keyboard-nav.ts";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

check("storage key is stable", () => assert.equal(KEYBOARD_NAV_STORAGE_KEY, "utm-keyboard-nav"));

check("resolveInitialKeyboardNav: null -> on, '1' -> on, '0' -> off, other -> off", () => {
  assert.equal(resolveInitialKeyboardNav(null), true);
  assert.equal(resolveInitialKeyboardNav("1"), true);
  assert.equal(resolveInitialKeyboardNav("0"), false);
  assert.equal(resolveInitialKeyboardNav("x"), false);
});

check("nextFocusIndex: seeds from null (down->0, up->last)", () => {
  assert.equal(nextFocusIndex(null, 1, 4), 0);
  assert.equal(nextFocusIndex(null, -1, 4), 3);
});

check("nextFocusIndex: steps and clamps with no wrap", () => {
  assert.equal(nextFocusIndex(0, 1, 4), 1);
  assert.equal(nextFocusIndex(3, 1, 4), 3);
  assert.equal(nextFocusIndex(0, -1, 4), 0);
  assert.equal(nextFocusIndex(2, -1, 4), 1);
});

check("nextFocusIndex: empty option set is safe", () => assert.equal(nextFocusIndex(null, 1, 0), 0));

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
```

`scripts/options.test.mjs`:
```js
import process from "node:process";
import assert from "node:assert/strict";
import { orderedOptionKeys } from "../src/lib/options.ts";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

const q = { options: { a: "A", b: "B", c: "C", d: "D" } };

check("default order when no optionOrder", () => assert.deepEqual(orderedOptionKeys(q), ["a", "b", "c", "d"]));
check("honors a full 4-key permutation", () => assert.deepEqual(orderedOptionKeys(q, ["c", "a", "d", "b"]), ["c", "a", "d", "b"]));
check("falls back when order is malformed/short", () => assert.deepEqual(orderedOptionKeys(q, ["c", "a"]), ["a", "b", "c", "d"]));

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --import ./scripts/register-alias.mjs scripts/keyboard-nav.test.mjs`
Expected: FAIL (module not found / not defined).

- [ ] **Step 3: Implement the helpers**

`src/lib/keyboard-nav.ts`:
```ts
/**
 * Shared keyboard-navigation constants and pure helpers. Framework-free (no JSX)
 * so they can be unit-tested directly under the node runner.
 */

/** localStorage key holding the visitor's keyboard-nav preference ("1" on, "0" off). */
export const KEYBOARD_NAV_STORAGE_KEY = "utm-keyboard-nav";

/** First-time visitors (no stored value) get it ON; afterwards honor their choice. */
export function resolveInitialKeyboardNav(stored: string | null): boolean {
  if (stored === null) return true;
  return stored === "1";
}

/**
 * Next focus-cursor index for an Up/Down move. Seeds from null (Down -> 0,
 * Up -> last), then steps by delta and clamps to [0, count-1] with no wrap.
 */
export function nextFocusIndex(current: number | null, delta: 1 | -1, count: number): number {
  if (count <= 0) return 0;
  if (current === null) return delta === 1 ? 0 : count - 1;
  const next = current + delta;
  if (next < 0) return 0;
  if (next > count - 1) return count - 1;
  return next;
}
```

`src/lib/options.ts`:
```ts
import type { AnswerKey, Question } from "@/data/types";

/**
 * Answer-option keys in display order: the optionOrder permutation when it is a
 * full 4-key array, else the question's own key order. Shared by QuestionCard and
 * the runtime pages so the focus cursor and the rendered options always agree.
 */
export function orderedOptionKeys(question: Question, optionOrder?: AnswerKey[]): AnswerKey[] {
  if (optionOrder && optionOrder.length === 4) return optionOrder;
  return Object.keys(question.options) as AnswerKey[];
}
```

- [ ] **Step 4: Append the tests to the `test` script in `package.json`**

Append to the end of the existing `"test"` command:
```
 && node --import ./scripts/register-alias.mjs scripts/keyboard-nav.test.mjs && node --import ./scripts/register-alias.mjs scripts/options.test.mjs
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test`
Expected: all suites print "All tests passed".

- [ ] **Step 6: Commit**

```bash
git add src/lib/keyboard-nav.ts src/lib/options.ts scripts/keyboard-nav.test.mjs scripts/options.test.mjs package.json
git commit -m "feat: keyboard-nav pure helpers (preference, focus math, option order)"
```

---

### Task 2: `useQuestionKeyboard` hook

**Files:**
- Create: `src/hooks/useQuestionKeyboard.ts`

**Interfaces:**
- Consumes: `nextFocusIndex` from `@/lib/keyboard-nav`.
- Produces: `useQuestionKeyboard(args: QuestionKeyboardArgs): void` where
  `QuestionKeyboardArgs = { active: boolean; optionCount: number; focusedIndex: number | null; onFocusChange: (i: number) => void; onConfirm: () => void; confirmEnabled: boolean; onNext?: () => void; onPrev?: () => void }`.

- [ ] **Step 1: Implement the hook**

```ts
"use client";

import { useEffect } from "react";
import { nextFocusIndex } from "@/lib/keyboard-nav";

interface QuestionKeyboardArgs {
  /** Feature on AND this card is the live, interactive one AND no modal is open. */
  active: boolean;
  optionCount: number;
  focusedIndex: number | null;
  onFocusChange: (index: number) => void;
  /** Confirm the focused option (same effect as clicking it). */
  onConfirm: () => void;
  /** False once the answer is locked / feedback is shown. */
  confirmEnabled: boolean;
  onNext?: () => void;
  onPrev?: () => void;
}

function isTextEntry(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

function isButtonLike(el: Element | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  return el.tagName === "BUTTON" || el.tagName === "A" || el.getAttribute("role") === "button";
}

/**
 * Window-level keyboard control for a question card. Up/Down move the focus
 * cursor, Space confirms it, Left/Right navigate. Inert on mobile, inside text
 * fields, while a modifier is held, or when a focused button should own Space.
 */
export function useQuestionKeyboard({
  active, optionCount, focusedIndex, onFocusChange, onConfirm, confirmEnabled, onNext, onPrev,
}: QuestionKeyboardArgs) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (!window.matchMedia("(min-width: 768px)").matches) return; // desktop only
      const ae = document.activeElement;
      if (isTextEntry(e.target) || isTextEntry(ae)) return;

      switch (e.key) {
        case "ArrowDown":
          if (!confirmEnabled) return;
          e.preventDefault();
          onFocusChange(nextFocusIndex(focusedIndex, 1, optionCount));
          break;
        case "ArrowUp":
          if (!confirmEnabled) return;
          e.preventDefault();
          onFocusChange(nextFocusIndex(focusedIndex, -1, optionCount));
          break;
        case " ":
        case "Spacebar": // older browsers
          if (isButtonLike(ae)) return; // let a focused control handle Space natively
          if (!confirmEnabled || focusedIndex === null) return;
          e.preventDefault();
          onConfirm();
          break;
        case "ArrowRight":
          if (!onNext) return;
          e.preventDefault();
          onNext();
          break;
        case "ArrowLeft":
          if (!onPrev) return;
          e.preventDefault();
          onPrev();
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, optionCount, focusedIndex, onFocusChange, onConfirm, confirmEnabled, onNext, onPrev]);
}
```

- [ ] **Step 2: Type-check**

Run: `DATABASE_URL="postgres://u:p@ep-dummy.neon.tech/db" npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useQuestionKeyboard.ts
git commit -m "feat: useQuestionKeyboard listener hook"
```

---

### Task 3: Preference provider, hint popup, toggle, wiring

**Files:**
- Create: `src/hooks/useKeyboardNav.tsx`
- Create: `src/components/ui/KeyboardHintPopup.tsx`
- Create: `src/components/ui/KeyboardNavToggle.tsx`
- Modify: `src/app/globals.css` (hint-bar keyframe)
- Modify: `src/app/layout.tsx` (mount provider)
- Modify: `src/components/layout/Header.tsx` (toggle button)

**Interfaces:**
- Consumes: `KEYBOARD_NAV_STORAGE_KEY`, `resolveInitialKeyboardNav` from `@/lib/keyboard-nav`.
- Produces: `KeyboardNavProvider`, `useKeyboardNav(): { on: boolean; toggle: () => void; showHint: () => void; dismissHint: () => void; hintVisible: boolean; hintNonce: number }`.

- [ ] **Step 1: Add the depleting-bar keyframe to `globals.css`**

Append near the other keyframes:
```css
@keyframes hintDeplete {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}

.hint-bar {
  transform-origin: left;
  animation: hintDeplete 5s linear forwards;
}

@media (prefers-reduced-motion: reduce) {
  .hint-bar { animation: none; transform: scaleX(1); }
}
```

- [ ] **Step 2: Create `KeyboardHintPopup.tsx`**

```tsx
"use client";

import { useEffect } from "react";

interface KeyboardHintPopupProps {
  visible: boolean;
  /** Bumped on each fresh show so the bar/timer restart. */
  nonce: number;
  onDismiss: () => void;
}

const HINT_MS = 5000;

function Keycap({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <kbd
      className={
        "inline-flex items-center justify-center h-5 rounded border border-[var(--color-border-strong)] " +
        "bg-[var(--color-bg-primary)] text-[10px] font-semibold text-[var(--color-text-primary)] font-mono " +
        (wide ? "px-1.5" : "w-5")
      }
    >
      {children}
    </kbd>
  );
}

/** Transient, desktop-only reminder of the keyboard commands. Auto-hides after 5s
 *  (depleting bar) and dismisses on any click. */
export function KeyboardHintPopup({ visible, nonce, onDismiss }: KeyboardHintPopupProps) {
  useEffect(() => {
    if (!visible) return;
    const id = setTimeout(onDismiss, HINT_MS);
    return () => clearTimeout(id);
  }, [visible, nonce, onDismiss]);

  // Dismiss on any click. Attached next tick so the click that opened it (e.g. the
  // toggle button) does not instantly close it.
  useEffect(() => {
    if (!visible) return;
    const onClick = () => onDismiss();
    const id = setTimeout(() => document.addEventListener("click", onClick), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener("click", onClick);
    };
  }, [visible, nonce, onDismiss]);

  if (!visible) return null;

  return (
    <div className="hidden md:block fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
      <div
        onClick={onDismiss}
        role="status"
        className="cursor-pointer overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-strong)] bg-[var(--color-bg-secondary)] shadow-[var(--shadow-lg)] animate-slide-up"
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="text-[var(--color-accent)]" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" />
            </svg>
          </span>
          <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary)] whitespace-nowrap">
            <span className="inline-flex items-center gap-1.5"><Keycap>↑</Keycap><Keycap>↓</Keycap> navighezi</span>
            <span className="w-px h-3 bg-[var(--color-border)]" />
            <span className="inline-flex items-center gap-1.5"><Keycap wide>Space</Keycap> confirmi</span>
            <span className="w-px h-3 bg-[var(--color-border)]" />
            <span className="inline-flex items-center gap-1.5"><Keycap>←</Keycap><Keycap>→</Keycap> schimbi întrebarea</span>
          </div>
        </div>
        <div className="h-0.5 w-full bg-[var(--color-border)]">
          <div key={nonce} className="hint-bar h-full bg-[var(--color-accent)]" />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `useKeyboardNav.tsx`**

```tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { KEYBOARD_NAV_STORAGE_KEY, resolveInitialKeyboardNav } from "@/lib/keyboard-nav";
import { KeyboardHintPopup } from "@/components/ui/KeyboardHintPopup";

interface KeyboardNavContextValue {
  on: boolean;
  toggle: () => void;
  showHint: () => void;
  dismissHint: () => void;
  hintVisible: boolean;
  hintNonce: number;
}

const KeyboardNavContext = createContext<KeyboardNavContextValue>({
  on: true, toggle: () => {}, showHint: () => {}, dismissHint: () => {}, hintVisible: false, hintNonce: 0,
});

function isDesktop(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(min-width: 768px)").matches;
}

/**
 * Global keyboard-navigation preference (on by default, persisted) plus the
 * transient command-hint popup. Provided once at the app root so the navbar
 * toggle, the question cards, and the popup share state. Mirrors HighlighterProvider.
 */
export function KeyboardNavProvider({ children }: { children: React.ReactNode }) {
  const [on, setOn] = useState(true);
  const [hintVisible, setHintVisible] = useState(false);
  const [hintNonce, setHintNonce] = useState(0);

  useEffect(() => {
    try {
      setOn(resolveInitialKeyboardNav(localStorage.getItem(KEYBOARD_NAV_STORAGE_KEY))); // eslint-disable-line react-hooks/set-state-in-effect
    } catch {
      setOn(true); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, []);

  const showHint = useCallback(() => {
    if (!isDesktop()) return;
    setHintNonce((n) => n + 1);
    setHintVisible(true);
  }, []);

  const dismissHint = useCallback(() => setHintVisible(false), []);

  const toggle = useCallback(() => {
    setOn((prev) => {
      const next = !prev;
      try { localStorage.setItem(KEYBOARD_NAV_STORAGE_KEY, next ? "1" : "0"); } catch { /* ignore */ }
      if (next) showHint();
      else setHintVisible(false);
      return next;
    });
  }, [showHint]);

  return (
    <KeyboardNavContext.Provider value={{ on, toggle, showHint, dismissHint, hintVisible, hintNonce }}>
      {children}
      <KeyboardHintPopup visible={hintVisible} nonce={hintNonce} onDismiss={dismissHint} />
    </KeyboardNavContext.Provider>
  );
}

export function useKeyboardNav() {
  return useContext(KeyboardNavContext);
}
```

- [ ] **Step 4: Create `KeyboardNavToggle.tsx`**

```tsx
"use client";

import { cn } from "@/lib/utils";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";

/**
 * Navbar button that turns desktop keyboard navigation on/off. Desktop only
 * (wrapped hidden md:inline-flex by the Header), next to the highlighter toggle.
 */
export function KeyboardNavToggle() {
  const { on, toggle } = useKeyboardNav();

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={on}
      aria-label="Control cu tastatura"
      title={on ? "Control cu tastatura pornit (sageti + Space)" : "Control cu tastatura oprit"}
      className={cn(
        "relative p-2 rounded-[var(--radius-md)] transition-colors cursor-pointer",
        on
          ? "text-[var(--color-accent)] bg-[var(--color-accent-muted)] shadow-[0_0_12px_rgba(232,166,49,0.18)]"
          : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]",
      )}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" />
      </svg>
      {on && (
        <span aria-hidden="true" className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
      )}
    </button>
  );
}
```

- [ ] **Step 5: Mount the provider in `layout.tsx`**

Add import `import { KeyboardNavProvider } from "@/hooks/useKeyboardNav";` and nest inside the highlighter provider:
```tsx
<HighlighterProvider>
  <KeyboardNavProvider>{children}</KeyboardNavProvider>
</HighlighterProvider>
```

- [ ] **Step 6: Add the toggle to `Header.tsx`**

Import `import { KeyboardNavToggle } from "@/components/ui/KeyboardNavToggle";` and place it before `<HighlighterToggle />`, wrapped desktop-only:
```tsx
<span className="hidden md:inline-flex">
  <KeyboardNavToggle />
</span>
<HighlighterToggle />
```

- [ ] **Step 7: Build to verify wiring**

Run: `DATABASE_URL="postgres://u:p@ep-dummy.neon.tech/db" npm run build`
Expected: compiles, static pages generated.

- [ ] **Step 8: Commit**

```bash
git add src/hooks/useKeyboardNav.tsx src/components/ui/KeyboardHintPopup.tsx src/components/ui/KeyboardNavToggle.tsx src/app/globals.css src/app/layout.tsx src/components/layout/Header.tsx
git commit -m "feat: keyboard-nav preference provider, toggle, and command hint"
```

---

### Task 4: QuestionCard integration

**Files:**
- Modify: `src/components/practice/QuestionCard.tsx`

**Interfaces:**
- Consumes: `orderedOptionKeys` (`@/lib/options`), `useQuestionKeyboard` (`@/hooks/useQuestionKeyboard`), `useKeyboardNav` (`@/hooks/useKeyboardNav`).
- Produces: three new optional props on `QuestionCardProps`: `keyboardActive?: boolean`, `onNext?: () => void`, `onPrev?: () => void`. Default off, so existing consumers are unchanged.

- [ ] **Step 1: Add imports + props**

Add imports:
```tsx
import { useEffect, useState } from "react";
import { orderedOptionKeys } from "@/lib/options";
import { useQuestionKeyboard } from "@/hooks/useQuestionKeyboard";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
```
Add to `QuestionCardProps`:
```tsx
  /** Enable desktop keyboard control (Up/Down focus, Space confirm) for this card. */
  keyboardActive?: boolean;
  /** ArrowRight / ArrowLeft handlers when keyboardActive. */
  onNext?: () => void;
  onPrev?: () => void;
```
Add to the destructured params: `keyboardActive = false, onNext, onPrev,`.

- [ ] **Step 2: Replace the inline order derivation with the shared helper**

Replace:
```tsx
const orderedKeys =
  optionOrder && optionOrder.length === 4
    ? optionOrder
    : (Object.keys(question.options) as AnswerKey[]);
```
with:
```tsx
const orderedKeys = orderedOptionKeys(question, optionOrder);
```

- [ ] **Step 3: Add focus-cursor state + keyboard wiring (place after `orderedKeys`)**

```tsx
const { showHint } = useKeyboardNav();
const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

// Reset the cursor on each new question; seed to the already-selected option (if
// any) so resuming an answered question continues from there.
useEffect(() => {
  const seed = selectedAnswer ? orderedKeys.indexOf(selectedAnswer) : -1;
  setFocusedIndex(seed >= 0 ? seed : null); // eslint-disable-line react-hooks/set-state-in-effect
}, [question.id]); // eslint-disable-line react-hooks/exhaustive-deps

// Teach the shortcuts once per browser session when the feature is active.
useEffect(() => {
  if (!keyboardActive) return;
  try {
    if (!sessionStorage.getItem("utm-kbd-hint-shown")) {
      showHint();
      sessionStorage.setItem("utm-kbd-hint-shown", "1");
    }
  } catch { /* ignore */ }
}, [keyboardActive, showHint]);

useQuestionKeyboard({
  active: keyboardActive,
  optionCount: orderedKeys.length,
  focusedIndex,
  onFocusChange: setFocusedIndex,
  onConfirm: () => {
    if (focusedIndex !== null) onSelectAnswer(orderedKeys[focusedIndex]);
  },
  confirmEnabled: !showFeedback,
  onNext,
  onPrev,
});
```

- [ ] **Step 4: Render the focus ring + aria-activedescendant**

On the radiogroup wrapper add:
```tsx
aria-activedescendant={focusedIndex !== null ? `q${question.id}-opt-${focusedIndex}` : undefined}
```
On each option `<button>` add `id={`q${question.id}-opt-${index}`}` and, in its `cn(...)` classes, add:
```tsx
!showFeedback && focusedIndex === index && "ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-[var(--color-bg-secondary)]",
```

- [ ] **Step 5: Type-check + build**

Run: `DATABASE_URL="postgres://u:p@ep-dummy.neon.tech/db" npx tsc --noEmit && DATABASE_URL="postgres://u:p@ep-dummy.neon.tech/db" npm run build`
Expected: no type errors; build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/components/practice/QuestionCard.tsx
git commit -m "feat: keyboard focus cursor + commands in QuestionCard"
```

---

### Task 5: Wire the three runtime pages

**Files:**
- Modify: `src/app/practica/[sessionId]/page.tsx`
- Modify: `src/app/antrenament/[sessionId]/page.tsx`
- Modify: `src/app/simulator/[examId]/page.tsx`

**Interfaces:**
- Consumes: `useKeyboardNav` (for `on`), passes `keyboardActive`/`onNext`/`onPrev` to `QuestionCard`.

- [ ] **Step 1: Practica**

Add import `import { useKeyboardNav } from "@/hooks/useKeyboardNav";`. In the component, near the other hooks: `const { on: keyboardOn } = useKeyboardNav();`. On the `<QuestionCard ... />` add:
```tsx
keyboardActive={keyboardOn && !showSummary}
onNext={goToNext}
onPrev={goToPrev}
```

- [ ] **Step 2: Antrenament**

Add the same import and `const { on: keyboardOn } = useKeyboardNav();` near the other hooks (before the early return). On the `<QuestionCard ... />` add:
```tsx
keyboardActive={keyboardOn && !showSummary}
onNext={handleForward}
onPrev={handleBack}
```
(While reviewing, the shown card has `showFeedback` true, so confirm is inert and only Left/Right act, mapping to back/forward.)

- [ ] **Step 3: Simulator**

Add the same import and `const { on: keyboardOn } = useKeyboardNav();` near the other hooks (top of the component, before the early returns). Inside the ACTIVE EXAM MODE block, on the `<QuestionCard ... />` add:
```tsx
keyboardActive={keyboardOn && !submitOpen && !restartOpen && !redoOpen}
onNext={isLast ? () => setSubmitOpen(true) : goToNext}
onPrev={goToPrev}
```

- [ ] **Step 4: Build + lint**

Run: `DATABASE_URL="postgres://u:p@ep-dummy.neon.tech/db" npm run build && npx eslint src/app/practica/[sessionId]/page.tsx src/app/antrenament/[sessionId]/page.tsx src/app/simulator/[examId]/page.tsx`
Expected: build succeeds, no lint errors.

- [ ] **Step 5: Commit**

```bash
git add "src/app/practica/[sessionId]/page.tsx" "src/app/antrenament/[sessionId]/page.tsx" "src/app/simulator/[examId]/page.tsx"
git commit -m "feat: wire keyboard navigation into the three runtimes"
```

---

### Task 6: What's New popup rewrite + re-trigger

**Files:**
- Modify: `src/components/home/WhatsNewGate.tsx` (key bump)
- Modify: `src/components/home/WhatsNewModal.tsx` (lead = v2.6.0 keyboard; recap = v2.5.1..v2.5.5; PRESERVE the votes section)

**Interfaces:** none (presentational).

- [ ] **Step 1: Bump the gate key**

In `WhatsNewGate.tsx`: `const WHATSNEW_KEY = "utm-whatsnew-v260-tastatura";`

- [ ] **Step 2: Replace Section 0 (lead) with v2.6.0 keyboard control**

Use a `v2.6.0` + `Nou` chip pair (same markup as the existing chips), heading "Control cu tastatură", a paragraph explaining: pe desktop, te miști prin variante cu `↑/↓`, confirmi cu `Space` și schimbi întrebarea cu `←/→`; e pornit din start și îl poți opri din butonul cu tastatură din bara de sus. Keep the `Încearcă la Practică` CTA Link to `/practica`.

- [ ] **Step 3: Replace Section 1 with a per-version recap "De la ultimul anunț"**

A compact list, one row per version with a version chip and a one-line summary (full diacritics):
- v2.5.5 - Numărătoare inversă pe prima pagină până la proba scrisă.
- v2.5.4 - Antrenamentul nu mai rămâne blocat pe loading când o întrebare a fost scoasă.
- v2.5.3 - Codul din întrebări se vede ca și cod peste tot (Revizuire, Căutare, variante).
- v2.5.2 - Explicațiile rămân corecte și când amesteci răspunsurile.
- v2.5.1 - Codul din enunț apare cu font de cod (monospace).

Render as rows: a small version chip + text, inside a bordered `bg-[var(--color-bg-primary)]` card, consistent with the existing popup styling.

- [ ] **Step 4: Leave Section 2 (the Algebo.ai votes thank-you) and the divider EXACTLY as-is.**

- [ ] **Step 5: Build**

Run: `DATABASE_URL="postgres://u:p@ep-dummy.neon.tech/db" npm run build`
Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/components/home/WhatsNewGate.tsx src/components/home/WhatsNewModal.tsx
git commit -m "feat: re-trigger What's New popup with v2.6.0 + recap since v2.5.0"
```

---

### Task 7: Version bump 2.6.0 + final verification

**Files:**
- Modify: `src/lib/site-config.ts`, `src/app/noutati/page.tsx`, `src/components/home/ChangelogBanner.tsx`

- [ ] **Step 1: `site-config.ts`** — `export const APP_VERSION = "2.6.0";`

- [ ] **Step 2: `noutati/page.tsx`** — prepend a `2.6.0` entry (date "26 Iunie 2026", NO diacritics), one `feature` change:
> "Control cu tastatura pe desktop: te misti prin variante cu sagetile sus/jos, confirmi cu Space si treci la urmatoarea intrebare cu sageata dreapta (stanga pentru cea anterioara). Merge la Practica, Antrenament si Simulator, e pornit din start si il poti opri oricand din butonul cu tastatura din bara de sus. Pe telefon nu apare, fiindca nu are sens fara tastatura."

- [ ] **Step 3: `ChangelogBanner.tsx`** — set the first `recentChanges` bullet to the keyboard control (NO diacritics), keep the next two (countdown, antrenament fix), drop the oldest:
```
"Control cu tastatura pe desktop la Practica, Antrenament si Simulator: navighezi prin variante cu sagetile, confirmi cu Space si schimbi intrebarea cu sageata dreapta; il poti opri din bara de sus",
"Numaratoare inversa pe prima pagina pana la Proba 1 (proba scrisa) a licentei: zile, ore, minute si secunde, cu data si ora exacta",
"Antrenamentul nu mai ramane blocat pe cercul de incarcare daca o intrebare folosita a fost scoasa intre timp; referintele invechite sunt curatate automat la incarcare",
```

- [ ] **Step 4: Full verification**

Run: `npm test && npx eslint src && DATABASE_URL="postgres://u:p@ep-dummy.neon.tech/db" npm run build`
Expected: all tests pass, no lint errors, build succeeds.

- [ ] **Step 5: Commit + push**

```bash
git add src/lib/site-config.ts src/app/noutati/page.tsx src/components/home/ChangelogBanner.tsx
git commit -m "feat: keyboard navigation for question screens (v2.6.0)"
git push
```

---

## Self-Review

- **Spec coverage:** preference/toggle (T3), keyboard model + guards (T2, wired T4/T5), per-screen wiring (T5), QuestionCard ring + aria + order helper (T1, T4), hint popup 5s/click-dismiss/desktop (T3, triggered T4), What's New rewrite + key bump (T6), version bump (T7), tests (T1). All covered.
- **Placeholder scan:** none.
- **Type consistency:** `orderedOptionKeys`, `nextFocusIndex`, `useQuestionKeyboard` arg shape, and the `keyboardActive/onNext/onPrev` prop names are consistent across tasks.
