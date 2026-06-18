# Filter wrong/marked redo by module or materie — design

**Date:** 2026-06-18
**Status:** Approved for planning
**Version:** 1.5.4

## Problem

On the `/practica` start screen, the **"Reia ce ai de recuperat"** section shows two redo
cards — **Greșite** and **Marcate** — each drawing from the **global** pool: every wrong
(resp. marked) question across *all* materii. A user who finished Java with 10 wrong, moved
on to another subject, and now wants to redo *just the Java mistakes* can't — they're
forced to redo everything they ever missed. (Direct user request.)

`/revizuire` already offers a wrong/marked filter plus a **module-level** filter, but (a)
only at module granularity, not per-materie, and (b) users look for this on `/practica`,
where the redo cards live.

## Goal

On the two `/practica` redo cards, let the user **narrow each card to a whole module or a
single materie (subject)** before launching, with live counts, then start the redo exactly
as today. `/revizuire` is left unchanged.

## Decisions (approved)

- **Granularity:** both — a single-select scope that is *all*, *one module*, or *one
  materie*.
- **Placement:** the `/practica` redo cards only.
- **Per-card scope:** Greșite and Marcate get **independent** dropdowns, so each menu's
  counts always match its own pool (Java can appear under Greșite but not under Marcate).
- **What's-New popup:** rewrite the feature section for 1.5.4; **keep** the Gen-E vote block.

## Data model (already present)

`Module → Subject (materie) → Question`; every `Question` carries `moduleId` and
`subjectId`. 4 modules / 15 materii. `modules` (in `src/data/modules.ts`) is the canonical
ordering and the source of names + colors.

## Design

### Scope model + pure helper — `src/lib/redo-scope.ts` (new, unit-tested)

```ts
type Scope =
  | { kind: "all" }
  | { kind: "module"; id: string }
  | { kind: "subject"; id: string };
```

A `resolve` function `(id) => { moduleId, subjectId } | undefined` is **injected** (same
testability pattern as `src/lib/redo.ts`, which injects `exists`/`correctOf`). Names/colors
come from importing the static `modules` data directly.

- `buildScopeOptions(ids, resolve)` → `{ total, modules: Array<{ id, name, color, count,
  subjects: Array<{ id, name, count }> }> }`. Grouped by `moduleId`/`subjectId`, ordered by
  the canonical `modules` array, **excluding** modules/subjects with `count === 0` and ids
  that don't resolve.
- `filterByScope(ids, scope, resolve)` → `all` returns ids unchanged; `module` keeps ids
  whose `moduleId` matches; `subject` keeps ids whose `subjectId` matches.
- `hasMultipleScopes(options)` → true when there's more than one materie represented
  (`> 1` module, or one module with `> 1` subject). Used to decide whether to show the menu
  at all.

These three are pure and fully covered by tests.

### Dropdown — `src/components/review/SubjectScopeMenu.tsx` (new)

No `Select`/`Popover` primitive exists in `src/components/ui`, so a small custom popover:

- **Trigger button:** current scope label + count + chevron, styled like the app's other
  pill/control buttons.
- **Panel:** `Toate materiile · {total}` first, then per module a selectable **module row**
  (color dot + name + count) with indented selectable **materie rows** (`SubjectIcon` +
  name + count). Single-select; the active scope is highlighted.
- **Dismissal:** selecting an option, outside click, or `Escape`. Accessible trigger
  (`aria-haspopup`, `aria-expanded`) and radio-style options.
- Props: `options`, `value: Scope`, `onChange`, `accentColor?`.

### `ReviewLaunch` — one additive prop

Add optional `filterSlot?: ReactNode`, rendered between the header block and the buttons
row. Undefined by default ⇒ **no change** to the `/revizuire` usage.

### `/practica` page wiring

- `resolve = (id) => { const q = getQuestion(id); return q ? { moduleId: q.moduleId,
  subjectId: q.subjectId } : undefined; }`.
- Independent state: `wrongScope` / `markedScope` (default `{ kind: "all" }`).
- Memos: `wrongOptions`/`markedOptions` via `buildScopeOptions`; `wrongFiltered`/
  `markedFiltered` via `filterByScope`.
- Each `ReviewLaunch` gets `count={…Filtered.length}`, `onPractice/onSimulate` launched from
  the **filtered** ids, and — when `hasMultipleScopes(options)` — a `filterSlot` with the
  `SubjectScopeMenu`.
- **Auto-reset guard:** if a non-`all` scope's target is no longer in `options` (progress
  reset, bookmark removed), reset that scope to `{ kind: "all" }`.

The launch path (`startReviewSession`) is otherwise unchanged.

## Files touched

- **new** `src/lib/redo-scope.ts`
- **new** `src/components/review/SubjectScopeMenu.tsx`
- **new** `scripts/redo-scope.test.mjs`
- `src/components/review/ReviewLaunch.tsx` — `filterSlot` prop
- `src/app/practica/page.tsx` — per-card scope state + wiring
- Release: `src/lib/site-config.ts`, `src/app/noutati/page.tsx`,
  `src/components/home/ChangelogBanner.tsx`, `src/components/home/WhatsNewModal.tsx`
  (feature section; keep vote block), `src/app/page.tsx` (`WHATSNEW_KEY`)
- `package.json` — add the new test to the `test` script

## Edge cases

- Pool spans a single materie ⇒ menu hidden (nothing to narrow); card behaves as today.
- Selected module/materie disappears from the pool ⇒ scope auto-resets to `all`.
- Marked pool ≠ wrong pool ⇒ independent menus, independent options/counts.
- A narrowed redo can itself be redone afterward — no special handling.

## Testing / verification

- `scripts/redo-scope.test.mjs`: grouping + counts, canonical ordering, empty-exclusion,
  unknown-id handling for `buildScopeOptions`; `all`/`module`/`subject` behavior for
  `filterByScope`; `hasMultipleScopes` boundaries. Wired into `npm test`.
- `npm test` green; `npm run build` + `npm run lint` clean.
- Manual: on `/practica` with wrong/marked across ≥2 materii, narrow a card to a module and
  to a single materie, confirm the count and the launched set match; confirm the menu is
  hidden when only one materie is present.

## Release

Version bump + changelog (Romanian, **no diacritics**) per the usual routine across
`site-config`, `noutati`, and `ChangelogBanner`; refresh the What's-New popup (keep the
Gen-E vote block) and bump its `WHATSNEW_KEY` so it re-shows once.
