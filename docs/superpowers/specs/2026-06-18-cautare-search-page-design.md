# v2.0.0 - "Cautare" universal question explorer

Date: 2026-06-18
Status: approved (design), implementation in progress

## Goal

A new page at `/cautare` that searches and filters the whole 715-question bank
live, shows a results list (answers hidden, tap to reveal), and turns whatever
the filters currently match into a real practice ("Exerseaza", instant feedback)
or test ("Simuleaza", score at the end) session. Maximum flexibility, popup-based
selectors, fully responsive, no edge cases. This is the v2.0.0 headline feature.

No new data layer: it reads `allQuestions` and the local `session`. It reuses
`startPractice([], ids, opts)` to launch any arbitrary set of question ids.

## Decisions (from brainstorming)

- Emphasis: Explorer + Launcher hybrid (live filter + results list + launch).
- Results show the question only; correct answer + "De ce e corect" explanation
  are collapsed behind a "Vezi raspuns" expander per card.
- Include all filter groups: content, your-progress, free-text + sort, smart extras.
- Desktop navbar: add "Cautare" as the first nav link. Mobile bottom nav: replace
  "Despre" with "Cautare" (magnifying-glass icon).

## Searchable / filterable dimensions

Question fields available: `id, moduleId, subjectId, text, options{a,b,c,d},
correctAnswer, code?, codeLanguage?, figure?, explanation?`. No difficulty/tags.

- Free text: normalized (lowercase + strip diacritics) match across `text`, the 4
  options, and `explanation`. Typing `#4` or a bare number also matches by id.
- Content: module(s), materie(s) (multi-select), has-code + code language
  (c/cpp/python/java/js/php/sql), has-figure, has-explanation.
- Your progress (from `buildMergedAnswerMap(session)` + `session.bookmarks`):
  unanswered / answered / correct / wrong / bookmarked.
- Correct-answer letter: a/b/c/d.
- Sort: relevance (default; text-match score, then id) / by id / random.

## Architecture

### Pure core - `src/lib/search.ts` (unit-tested, no React, no `@/data` import)

Dependency-injected like `redo-scope.ts`. Types + functions:

```
type CodePresence = "any" | "with" | "without";
type FigurePresence = "any" | "with" | "without";
type ExplanationPresence = "any" | "with" | "without";
type ProgressFilter = "unanswered" | "answered" | "correct" | "wrong" | "bookmarked";
type SortKey = "relevance" | "id" | "random";

interface SearchCriteria {
  q: string;
  moduleIds: string[];
  subjectIds: string[];
  code: CodePresence;
  codeLanguages: string[];      // only applied when code === "with"
  figure: FigurePresence;
  explanation: ExplanationPresence;
  progress: ProgressFilter[];   // OR within the group
  correctAnswer: AnswerKey | null;
  sort: SortKey;
}

interface SearchContext {
  answered: Map<number, { isCorrect: boolean }>;  // from buildMergedAnswerMap
  bookmarks: Set<number>;
}

const EMPTY_CRITERIA: SearchCriteria;
function normalize(s: string): string;                 // lowercase + strip diacritics
function searchQuestions(questions, criteria, ctx, rng?): Question[];
function countActiveFilters(criteria): number;         // for the "Filtre (n)" badge
function criteriaToParams(criteria): URLSearchParams;  // shareable URL
function criteriaFromParams(params): SearchCriteria;   // parse on load
```

Matching rules: groups AND together; multi-select values OR within a group;
`#id` / numeric query short-circuits to id match; `relevance` ranks by where the
match lands (id/text/option/explanation) then ascending id; `random` uses an
injected rng (defaults to `shuffleArray`) so it stays deterministic in tests.

### Page - `src/app/cautare/page.tsx` + `layout.tsx`

`"use client"`; default export wraps `<CautareContent/>` in `<Suspense>` (for
`useSearchParams`). Mirrors practica's structure (Header / main with grid-pattern
/ Container narrow / MobileNav). Seeds criteria from URL on first render; writes
back via `window.history.replaceState` (debounced for text) so it never triggers
navigation churn. `layout.tsx` exports `metadata` (title/description/canonical),
matching `despre/layout.tsx`.

State: `criteria` (the filter object), derived `results` via `useMemo`, derived
`ctx` (merged answers + bookmarks) via `useMemo` over session. Launch handlers
call `startPractice([], results.map(q=>q.id), { mode, shuffleOptions })` then
`router.push('/practica/'+id)`.

### Components - `src/components/search/`

- `SearchBar.tsx` - bare input styled like `Input` with a leading search icon, a
  clear (x) button, and a live "N rezultate" count. `/` focuses it on desktop.
- `FilterChips.tsx` - the chip row: "Materie", "Filtre (n)", plus active-filter
  pills (each removable) and a "Sterge tot" reset. Chips show active state.
- `MaterieFilterPopup.tsx` - multi-select module+materie tree in a `<Modal>`
  (portal), mirroring SubjectScopeMenu/SubjectSelector visual language; per-module
  "select all", "Toate"/"Niciuna".
- `FiltersModal.tsx` - the full control center in one scrollable `<Modal>`: code
  (segmented any/cu/fara + language chips), figure, explanation, progress (multi
  chips), correct-answer (a/b/c/d), sort (segmented). Live-applies; footer shows
  the result count + "Reseteaza" + "Vezi rezultatele".
- `SmartActions.tsx` - "Surprinde-ma" (instantly launches 20 random questions as
  practice) and "Puncte slabe" (sets materie filter to your weakest subjects from
  `session.subjectStats` + progress=wrong; toast if not enough data). Plus a
  "Copiaza link" share button (clipboard + toast).
- `SearchResultCard.tsx` - collapsed: id, materie (+SubjectIcon), code/figure
  badges, your-status badge (correct/wrong/bookmarked), expander, bookmark toggle.
  Expanded: options with the correct one marked, CodeBlock for `code`, the
  explanation, and "Exerseaza asta" (single-question practice). Matched query text
  highlighted.
- `LaunchBar.tsx` - sticky bar: "N rezultate" + Exerseaza / Simuleaza (disabled at
  0), reusing the button styles/icons from ReviewLaunch.
- `ResultsList.tsx` - maps results, renders the empty state ("nimic gasit" +
  "Sterge filtrele"), caps the initial render at 50 with a "Afiseaza toate (N)"
  control (explicit, not silent).

## Edge cases

- Zero results -> friendly empty state + clear-filters; launch buttons disabled.
- No session / no history -> progress filters and "Puncte slabe" degrade
  gracefully (empty sets, a hint/toast), never throw.
- Hydration: first server + client render uses the default empty session
  (deterministic), session fills in via effect afterwards - no mismatch. Static
  content results are identical on both renders.
- Long lists capped at 50 visible with an explicit "show all".
- Diacritic/case-insensitive matching both ways.

## Version + navigation changes

- `site-config.ts`: `APP_VERSION` 1.5.7 -> 2.0.0.
- `Header.tsx`: add `{ href:"/cautare", label:"Cautare" }` first in `navLinks`.
- `MobileNav.tsx`: replace the "Despre" tab with "Cautare" + search icon.
- `noutati/page.tsx`: prepend a 2.0.0 changelog entry (no-diacritics style).
- `ChangelogBanner.tsx`: refresh `recentChanges` to the search highlights.
- `home page.tsx`: bump `WHATSNEW_KEY` to `utm-whatsnew-v200`.
- `WhatsNewModal.tsx`: lead with the new Cautare page (keep the structure).

## Testing

`scripts/search.test.mjs` (added to the `test` script) covering `searchQuestions`
(each filter group, AND/OR semantics, id short-circuit, progress via injected
answer map, sort), `countActiveFilters`, and `criteriaToParams`/`criteriaFromParams`
round-trip. Pure - injects a small question fixture, like `redo-scope.test.mjs`.

## Out of scope (YAGNI)

Saved searches, search history, server-side search, fuzzy/typo matching beyond
diacritic normalization, searching non-question pages.
