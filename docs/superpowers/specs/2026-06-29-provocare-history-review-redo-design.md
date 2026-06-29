# Provocare: history, per-question review, marking, redo - design spec

- Date: 2026-06-29
- Target version: 3.1.2
- Status: Approved (brainstorming approved by user, ready for implementation plan)
- Related: [[provocare-challenge-feature]], `2026-06-21-universal-session-history-design.md`,
  `2026-06-16-redo-wrong-from-results-design.md`, `2026-06-21-redo-session-chain-design.md`

## 1. Summary

After a Provocare game finishes, the local player can do everything they can already do
with a Simulator exam: the game is logged into the unified `/rezultate` history, they can
open a full per-question review (what they answered vs the correct answer + explanation),
mark/bookmark any question, and one-click "Refă greșitele" to drill the ones they missed -
right after the game or anytime later from history.

This is **100% client-side on the local device**. No server route, no DB table, no Pusher
change, no account. The lobby page already holds, at finish, `snapshot.me.answers`
(`{questionId, selected, isCorrect}[]`, server-computed `isCorrect`) plus the served
`questionOrder`; the full question objects are in the bundle via `getQuestion(id)`. That is
everything a review, a history entry, and a redo drill need.

The design mirrors the Simulator pattern the user endorsed during brainstorming: keep a
self-contained snapshot of the game, merge its answers **leniently** into global stats on
read (a correct answer upgrades mastery, a wrong one never downgrades; Leitner boxes
untouched), and seed redo drills through the existing redo-lineage machinery.

## 2. Goals and non-goals

### Goals
- Record each finished Provocare game (the local player's own performance) into the
  existing unified session history on `/rezultate`, as a new "Provocare" entry kind.
- Full per-question review of a past game: the player's pick, correct answer, and the
  existing explanation, reusing the shared `QuestionCard`. Reachable both right after the
  game and later from history. Works offline (renders from the stored snapshot).
- Mark/bookmark questions from the review, reusing the existing bookmark system
  (`toggleBookmark` / `session.bookmarks`), so they appear in `/revizuire`'s "Marcate".
- "Refă greșitele (N)": build a solo practice drill of the wrong + unanswered questions via
  the existing `startPractice(..., { redoLineage })`, navigable to `/practica/{id}`, with a
  "Reluare din provocare" badge. Available right after the game and from history.
- Per the user's decision: Provocare answers count toward global stats like a Simulator
  exam (lenient merge in `buildMergedAnswerMap`), feeding mastery %, `/revizuire`, and the
  global mistake pool.

### Non-goals (YAGNI for v1)
- No server/DB/Pusher/account changes. Other players' results stay ephemeral; only the
  local player's own per-question results are saved, in localStorage.
- No "replay the multiplayer game" from history (that is just creating a new Provocare).
  History actions are review + redo-mistakes only.
- No live (mid-race) bookmarking. Marking happens in the post-game review (decided in
  brainstorming). Trivial to add live later since `QuestionCard` already supports it.
- No per-module breakdown card for Provocare in v1 (lean: correct/total + nota/score +
  rank). Can add later, mirroring the practice card's expandable per-module rows.
- No What's-New popup retrigger by default (routine bump; see section 10). The user can ask
  for one.

## 3. Foundational decisions (settled during brainstorming)

1. **Client-side capture, Simulator-style.** The game is snapshotted into a
   `ChallengeSummary` in `localStorage`. No new persistence layer.
2. **Count it like a Simulator exam.** `buildMergedAnswerMap` folds `challengeHistory`
   answers leniently, exactly like it already folds submitted exams. Correct upgrades,
   wrong never downgrades, Leitner boxes are not written (read-time merge only). The user
   chose this over keeping Provocare fully separate.
3. **Review surface (decision a).** In-place on the results screen via a "Vezi
   raspunsurile" toggle, plus a modal from the `/rezultate` history card (mirrors
   `ExamHistoryModal`). No new route.
4. **Marking timing (decision b).** Review-only, not mid-race.
5. **Redo reuses existing machinery.** A new `RedoLineage.origin.kind = "challenge"`, fed
   into the same `startPractice` + `buildRedoTargets` + lineage path used by exam/practice
   redo. Redo drills remain ephemeral (not re-archived), the Provocare origin stays in
   history. Same lesson as the universal-history spec: snapshot stats at record time, do
   not recompute from mutating `answers` later.

### Architectural keystone
```
game finishes (snapshot.status === "finished")
  -> lobby page effect: recordChallenge(buildChallengeSummary(me.answers, questionOrder, meta))
       (idempotent by lobby code)
  -> ChallengeSummary saved to LocalSession.challengeHistory[]
  -> buildMergedAnswerMap folds it into global stats (lenient, like exams)
ResultsScreen "Vezi raspunsurile"  ->  ChallengeReview(summary)
/rezultate Provocare card          ->  ChallengeReview(summary)  (modal)
ChallengeReview "Refa gresitele"   ->  startPractice([], wrongIds, {redoLineage}) -> /practica/{id}
ChallengeReview bookmark button    ->  toggleBookmark(qid)  ->  shows in /revizuire "Marcate"
```

## 4. Data model - `src/lib/session-types.ts`

```ts
export interface ChallengeAnswerRecord {
  questionId: number;
  selected: AnswerKey | null;   // null = timed out / never answered
  isCorrect: boolean;           // play-time snapshot (server-computed during the game)
}

export interface ChallengeSummary {
  id: string;                   // crypto.randomUUID() at record time (react key + redo)
  code: string;                 // lobby code: idempotency key + display
  playedAt: string;             // ISO, recorded at finish
  preset: "custom" | "simulare";
  scoring: "points" | "correct" | "nota";  // how this game was scored (for the result label)
  questionIds: number[];        // the player's served order (full set)
  answers: ChallengeAnswerRecord[];
  correctCount: number;         // snapshot
  total: number;                // questionIds.length
  rank: number | null;          // final placement (memento)
  players: number;              // how many were in the game
  durationMs: number | null;    // the player's total time
}
```

Add to `LocalSession`:
```ts
  challengeHistory?: ChallengeSummary[];
```

Add constant near `MAX_PRACTICE_HISTORY`:
```ts
export const MAX_CHALLENGE_HISTORY = 20;
```

Extend the redo origin union:
```ts
export interface RedoLineage {
  origin: {
    kind: "exam" | "practice" | "challenge";   // + "challenge"
    questionIds: number[];
    subjectIds?: string[];                       // practice-only, omitted for challenge
    batchSize?: number | null;
  };
  firstWrong: number[];
}
```

`loadSession` normalizes `challengeHistory` to an array (mirror `examHistory`/
`practiceHistory`). Backward compatible: old sessions deserialize `undefined` -> []. The
existing `clampLoadedAnswers` path is unaffected (challenge answers live in the summary, not
in the global `answers` map). `scoring: "nota"` is stored when `preset === "simulare"`.

## 5. Pure logic

### `src/lib/session-history.ts`

Extend the entry union and add the summary builder:
```ts
export type SessionHistoryEntry =
  | { kind: "exam"; date: string; exam: ExamSummaryData; questionIds: number[] }
  | { kind: "practice"; date: string; practice: PracticeSummary }
  | { kind: "training"; date: string; training: TrainingSummary }
  | { kind: "challenge"; date: string; challenge: ChallengeSummary };

/** Build a ChallengeSummary from the local player's /state snapshot at finish. Pure. */
export function buildChallengeSummary(args: {
  code: string;
  questionOrder: number[];        // snapshot.me.questionOrder (fallback: snapshot.questionIds)
  answers: { questionId: number; selected: string; isCorrect: boolean }[]; // snapshot.me.answers
  preset: "custom" | "simulare";
  scoring: "points" | "correct" | "nota";
  rank: number | null;
  players: number;
  durationMs: number | null;
  id: string;                     // crypto.randomUUID(), injected for testability
  playedAt: string;               // ISO, injected for testability
  exists: (id: number) => boolean; // getQuestion(id) presence (drop deleted ids)
}): ChallengeSummary;
```
Behaviour: keep only `questionOrder` ids that `exists`. Map `answers` by id; for each kept
id produce a `ChallengeAnswerRecord` (`selected` = the letter or `null` when empty/absent;
`isCorrect` from the snapshot). `correctCount` = count of `isCorrect`. `total` =
kept-ids length. This snapshots the game exactly as played (the leaderboard truth), even if
a question's answer is later corrected.

`sortSessionHistory` is unchanged (already sorts any `{date}` entry newest-first).

### `src/lib/redo.ts`

```ts
/** Wrong-or-unanswered served ids for a finished challenge. Mirrors wrongIdsInExam. */
export function wrongIdsInChallenge(
  summary: Pick<ChallengeSummary, "questionIds" | "answers">,
  correctOf: (id: number) => AnswerKey | undefined,
): number[];
```
For each id in `questionIds`: include it when the stored `selected` is null OR
`selected !== correctOf(id)`, and `correctOf(id)` is defined (known question). This
recomputes correctness against the **current** answer key (like `wrongIdsInExam`), so a
since-corrected answer is respected by the drill even though the summary's snapshot
`isCorrect` is frozen.

### `src/lib/answer-merge.ts`

Fold challenge history into the merged map, leniently, after the exam fold:
```ts
for (const ch of session.challengeHistory ?? []) {
  for (const a of ch.answers) {
    const q = getQuestion(a.questionId);
    if (!q || a.selected == null) continue;          // skip unknown + unanswered
    const isCorrect = a.selected === q.correctAnswer; // recompute vs current key, like exams
    const existing = merged.get(a.questionId);
    if (!existing) merged.set(a.questionId, { isCorrect });
    else if (isCorrect && !existing.isCorrect) merged.set(a.questionId, { isCorrect: true });
  }
}
```
This is the entire "count it like an exam" behaviour: every consumer of
`buildMergedAnswerMap` (mastery %, `/revizuire` wrong/correct filters, the global recovery
pool on the practice page) now reflects Provocare, with the same never-downgrade safety as
exams. Leitner boxes are not touched.

### Tests - `scripts/challenge-history.test.mjs` (new; register in `package.json`)
- `buildChallengeSummary`: drops deleted ids via `exists`; `selected` "" -> null; correct
  count; total; carries rank/players/durationMs/preset/scoring through.
- `wrongIdsInChallenge`: wrong letter included; unanswered (null) included; correct
  excluded; unknown id (no `correctOf`) excluded; respects a corrected key.
- merge fold: a correct Provocare answer adds/keeps `isCorrect:true`; a wrong one never
  downgrades an existing correct; unanswered skipped; unknown question skipped.

## 6. Recording - `src/hooks/useSession.ts`

Add `recordChallenge`, idempotent by `code`:
```ts
const recordChallenge = useCallback((summary: ChallengeSummary) => {
  setSession((prev) => {
    const hist = prev.challengeHistory ?? [];
    if (hist.some((c) => c.code === summary.code)) return prev;     // already recorded
    const updated = { ...prev, challengeHistory: [summary, ...hist].slice(0, MAX_CHALLENGE_HISTORY) };
    persistSession(updated);
    return updated;
  });
}, [persistSession]);
```
Extend `getSessionHistory` to include challenge entries:
```ts
const challenges = (session.challengeHistory ?? []).map((c) => ({
  kind: "challenge" as const, date: c.playedAt, challenge: c,
}));
return sortSessionHistory([...exams, ...practices, ...trainings, ...challenges]);
```
`loadSession` normalizes `challengeHistory`. No change to subject stats: like exams,
Provocare does not write `subjectStats` or `trainingBoxes`; it only feeds the read-time
merge. Expose `recordChallenge` from the hook.

## 7. Capture wiring - `src/app/provocare/[code]/page.tsx`

The finished branch already returns `<ResultsScreen .../>` early. Add, with the other
hooks (above any early return), an effect that records once when the game is finished and
the player snapshot is present:
```ts
const recordedRef = useRef(false);
useEffect(() => {
  const finished = snapshot?.status === "finished" || status === "finished";
  if (!finished || recordedRef.current || !snapshot?.me) return;
  // Derive standings inline: `liveStandings` is declared below the early returns,
  // but this effect sits above them with the other hooks, so it cannot read it.
  const rows = standings.length ? standings : (snapshot.standings ?? []);
  const me = rows.find((s) => s.playerId === snapshot.me.playerId);
  const summary = buildChallengeSummary({
    code,
    questionOrder: snapshot.me.questionOrder ?? snapshot.questionIds ?? [],
    answers: snapshot.me.answers,
    preset: snapshot.config.preset === "simulare" ? "simulare" : "custom",
    scoring: snapshot.config.preset === "simulare" ? "nota"
           : snapshot.config.scoring === "correct" ? "correct" : "points",
    rank: me?.rank ?? null,
    players: rows.length,
    durationMs: me?.totalTimeMs ?? null,
    id: crypto.randomUUID(),
    playedAt: new Date().toISOString(),
    exists: (qid) => !!getQuestion(qid),
  });
  recordedRef.current = true;
  recordChallenge(summary);
}, [snapshot?.status, status, snapshot?.me, standings, code]);
```
The `recordedRef` guards re-runs within a mounted session; `recordChallenge`'s code check
guards across remounts/refetches. Store the built summary in state so the results screen and
the in-place review can render it without rebuilding.

## 8. Review UI - `src/components/challenge/ChallengeReview.tsx` (new)

One component, two mount points (results screen inline, `/rezultate` modal).

Props: `{ summary: ChallengeSummary; bookmarks: number[]; onToggleBookmark: (id: number) => void; onRedo: () => void; onBack: () => void }`.

Layout: a header (title "Raspunsurile tale", the result label - nota / `N/total corecte` /
points - + rank), then the served questions in order rendered via the shared
`QuestionCard`:
- `question={getQuestion(id)}`, `selectedAnswer={record.selected}`, `showFeedback`,
  read-only (`onSelectAnswer` no-op), so it shows the player's pick + the correct answer +
  the existing explanation, exactly like exam review.
- Unanswered (`selected == null`) renders with no pick highlighted and a small "Fara
  raspuns" note; the correct answer still shows.
- `isBookmarked={bookmarks.includes(id)}`, `onBookmark={() => onToggleBookmark(id)}` - real
  wiring (today Provocare passes `isBookmarked={false}`).
- A sticky/bottom action: `Refa gresitele (N)` (N = `wrongIdsInChallenge` count) calling
  `onRedo`; disabled when N is 0. Plus a `Inapoi` calling `onBack`.

Uses existing tokens; no new design system. Reuses `HighlighterToggle` optionally.

## 9. Surfacing + redo

### Results screen - `src/components/challenge/ResultsScreen.tsx`
Add a `Vezi raspunsurile` button next to "Provocare noua / Acasa", and an `onReview?`
prop. The lobby page toggles a local `view: "results" | "review"`; when `review`, it renders
`<ChallengeReview .../>` instead of `<ResultsScreen .../>`, both fed from the recorded
summary. `onBack` returns to results.

### Redo trigger (shared)
A `startChallengeRedo(summary)` helper (in the lobby page and in the rezultate page) does:
```ts
const wrongIds = wrongIdsInChallenge(summary, (id) => getQuestion(id)?.correctAnswer);
if (!wrongIds.length) return;
const newId = startPractice([], wrongIds, {
  mode: "practice",                                 // instant feedback for a mistake drill
  redoLineage: { origin: { kind: "challenge", questionIds: summary.questionIds }, firstWrong: wrongIds },
});
router.push(`/practica/${newId}`);
```
`mode: "practice"` (instant feedback) is the sensible default for a learning drill; the
existing redo modal options still apply on the resulting session.

### Redo badge - `src/app/practica/[sessionId]/page.tsx`
Extend the existing badge:
```ts
lineage?.origin.kind === "exam" ? "Reluare din simulare"
: lineage?.origin.kind === "challenge" ? "Reluare din provocare"
: "Reluare din sesiune"
```
`buildRedoTargets` and the lineage ladder already operate generically on
`origin.questionIds` / `firstWrong`, so no other redo change is needed.

### History card - `src/components/results/SessionHistory.tsx` + `src/app/rezultate/page.tsx`
Add a `challenge` case to the unified timeline card:
- Chip "Provocare"; headline = the result label (nota for simulare, `correct/total`, or
  points) + `Locul rank/players` when known; `timeAgo(date)`.
- Actions: `Vezi raspunsurile` -> open `ChallengeReview` in a modal (mirror
  `ExamHistoryModal` mounting); `Refa gresitele (N)` -> `startChallengeRedo`. No generic
  "Reia" (no game replay). The rezultate page owns the modal open-state + the bookmark and
  redo callbacks.

## 10. Release (v3.1.2)

Standard three files (see [[release-version-bump]]):
- `src/lib/site-config.ts`: `APP_VERSION = "3.1.2"`.
- `src/app/noutati/page.tsx`: prepend a v3.1.2 entry (Romanian, no diacritics). Draft:
  - title: "Provocare: istoric, revizuire si refacerea greselilor"
  - feature: "Dupa o provocare, jocul se salveaza in istoricul tau de pe pagina Rezultate:
    poti vedea oricand ce ai raspuns la fiecare intrebare, corect sau gresit"
  - feature: "Poti reface greselile dintr-o provocare cu un singur buton, ca o sesiune de
    practica, fie imediat dupa joc, fie mai tarziu din istoric"
  - feature: "Poti marca intrebari direct din revizuirea provocarii; le regasesti la
    Marcate, ca peste tot"
  - improvement: "Raspunsurile din Provocare conteaza acum la progresul tau general, ca la
    Simulator"
- `src/components/home/ChangelogBanner.tsx`: 3 fresh no-diacritics bullets.

Popup: **not retriggered by default** (routine feature bump; the documented default is no
popup unless asked). If the user wants one, bump `WHATSNEW_KEY` in `WhatsNewGate.tsx` and
rewrite `WhatsNewModal.tsx` - flagged for the spec review.

## 11. Files

**New (2):**
- `src/components/challenge/ChallengeReview.tsx`
- `scripts/challenge-history.test.mjs` (+ register in `package.json`)

**Edited (~11):**
- `src/lib/session-types.ts` - `ChallengeSummary`/`ChallengeAnswerRecord`,
  `challengeHistory?`, `MAX_CHALLENGE_HISTORY`, `RedoLineage.origin.kind += "challenge"`.
- `src/lib/session-history.ts` - `challenge` entry kind + `buildChallengeSummary`.
- `src/lib/redo.ts` - `wrongIdsInChallenge`.
- `src/lib/answer-merge.ts` - lenient challenge fold.
- `src/hooks/useSession.ts` - `recordChallenge`, `getSessionHistory` challenge case,
  `loadSession` normalize `challengeHistory`.
- `src/app/provocare/[code]/page.tsx` - record-on-finish effect, results/review view
  toggle, redo navigation.
- `src/components/challenge/ResultsScreen.tsx` - "Vezi raspunsurile" button + `onReview`.
- `src/app/practica/[sessionId]/page.tsx` - "Reluare din provocare" badge.
- `src/components/results/SessionHistory.tsx` - `challenge` card.
- `src/app/rezultate/page.tsx` - challenge modal + redo wiring.
- release: `src/lib/site-config.ts`, `src/app/noutati/page.tsx`,
  `src/components/home/ChangelogBanner.tsx`.

No DB migration, no schema change, no API route, no Pusher/CSP change.

## 12. Edge cases

- **Idempotency:** recorded once per lobby `code` (ref guard + store check). Codes are
  unique per lobby, so there is no replay collision.
- **Total time-up cutting a player off:** never-reached ids are in `questionOrder` but not
  in `me.answers`; they count as wrong/unanswered for redo and show "Fara raspuns" in
  review.
- **Per-question timeout:** `me.answers` carries it with `selected` "" -> stored as `null`,
  `isCorrect:false`; treated as a miss.
- **Simulare / "correct" / points modes:** the result label switches on `scoring`; review
  and redo are identical across modes (correctness is per-question, not score-mode).
- **A question deleted after a game:** dropped by `exists` in `buildChallengeSummary` and by
  the `correctOf`/`getQuestion` guards in redo and merge; never crashes review.
- **Old saved sessions:** no `challengeHistory` -> []. Additive, `version` stays 1.
- **Host vs joiner:** Phase 1 host always plays and has a player token, so `me` is present
  for both; no special-casing.
- **Two players on one device (rare):** whoever's token is active records their own game; a
  different player on the same browser later records under their own code.

## 13. Testing and verification

- `npm test` (now including `challenge-history.test.mjs`) passes; existing
  `redo*`/`challenge-*`/`session-history` suites stay green.
- `npx tsc --noEmit` clean; `npm run lint` clean (mind `react/no-unescaped-entities` in any
  new JSX copy - use curly quotes, not ASCII `"`).
- Build with a dummy neon `DATABASE_URL` (project build requirement).
- Manual smoke: finish a Provocare -> it appears on `/rezultate` as a "Provocare" card ->
  open review, confirm correct/wrong + explanation per question -> bookmark one, confirm it
  shows under `/revizuire` "Marcate" -> "Refa gresitele" opens a `/practica` drill badged
  "Reluare din provocare" -> finish the drill, confirm mastery % / recovery pool reflect the
  game (lenient merge). Repeat for a simulare-preset game (nota label) and a "correct"-mode
  game.
