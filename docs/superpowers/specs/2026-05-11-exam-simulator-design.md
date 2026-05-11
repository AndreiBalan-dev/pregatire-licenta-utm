# Simulator Examen Licență — Design Spec

**Data:** 11 Mai 2026
**Versiune:** 1.4.0
**Status:** Aprobat de user, gata de implementare

## Context

Platforma `pregatire-licenta-utm` (utmlearn.com) e un Next.js 16 App Router, complet client-side, cu 715 grile pe 4 module pentru pregătirea examenului de licență la Informatică UTM. Sesiunile sunt salvate în `localStorage` (nu există backend pentru progres — DB-ul Neon există doar pentru feature-ul `/salveaza` `/incarca` cu cheie unică).

Există deja un flow de practică (`/practica`) unde user-ul alege materii și răspunde la grile cu feedback imediat. **Nu există** un mod "examen real" — o sesiune cronometrată, balansată, care produce o notă pe scala 1-10 cum o vede pe foaia oficială.

## Obiectiv

Adaug un **simulator de examen** care reproduce experiența unui examen scris UTM:
- 36 de întrebări selectate aleator, **balansate**: 9 din fiecare modul
- Sistem de notare oficial: **1.00 din oficiu + 0.25 per întrebare corectă = max 10.00**
- **Niciun feedback** pe parcurs (răspunzi orb, poți reveni să schimbi)
- La final: **nota mare cu gradient smooth roșu-galben-verde** (fără pass/fail) + review complet
- **Auto-save** în localStorage, reluabil
- **Zero atingeri DB / migrări / CI/CD**

Bump versiune: navbar v1.3.1 → v1.4.0, entry nou în changelog.

## Non-obiective

- Nu salvăm istoric de examene multiple. Un singur slot: examen activ SAU ultimul submitted SAU niciunul.
- Nu integrăm cu `/salveaza`/`/incarca` (no remote sync).
- Nu adăugăm timer cu limită (timer e doar informativ, afișează cât a durat).
- Nu adăugăm tab în navbar — descoperire prin CTA pe Home.
- Nu există feedback imediat în mod examen, sub nicio formă.

## Arhitectură

### Stat (localStorage prin `LocalSession`)

În `src/lib/session-types.ts` adăugăm:

```ts
export interface ExamState {
  examId: string;                                    // UUID generat la start
  questionIds: number[];                             // 36 ids, ordine fixată
  answers: Record<number, "a" | "b" | "c" | "d">;    // sparse până la submit
  currentIndex: number;
  startedAt: string;                                 // ISO
  submittedAt: string | null;                        // null = activ; ISO = în review
  durationMs: number | null;                         // setat la submit
}

export interface LocalSession {
  // ... existing fields
  currentExam: ExamState | null;
}
```

`createDefaultSession()` setează `currentExam: null`.

**De ce un singur slot**: scope-ul cere "rapid și simplu", istoric multi-examen ar fi feature separat. Submit pe peste un examen vechi cere confirmare ("pierzi rezultatul anterior?").

### Rute

```
/simulator                  → landing (entry)
/simulator/[examId]         → examen activ SAU rezultat+review (mode-switched pe submittedAt)
```

`/simulator/[examId]` se uită la `currentExam`:
- Dacă nu există sau `examId` nu match → redirect la `/simulator`
- Dacă `submittedAt == null` → render exam-active view
- Dacă `submittedAt != null` → render result+review view

### Modul de selecție (`src/lib/exam.ts`)

```ts
export const EXAM_QUESTIONS_PER_MODULE = 9;
export const OFFICIO_POINTS = 1.0;
export const POINTS_PER_QUESTION = 0.25;
export const EXAM_TOTAL_QUESTIONS = 36;
export const EXAM_MAX_SCORE = 10.0;

export function pickExamQuestions(
  modules: Module[],
  questionsByModule: Record<string, Question[]>
): number[] {
  const ids: number[] = [];
  for (const mod of modules) {
    const pool = questionsByModule[mod.id] || [];
    const picked = shuffleArray(pool).slice(0, EXAM_QUESTIONS_PER_MODULE);
    ids.push(...picked.map(q => q.id));
  }
  return shuffleArray(ids); // shuffle overall pentru ordine random
}

export function computeScore(correctCount: number): number {
  return OFFICIO_POINTS + correctCount * POINTS_PER_QUESTION;
}

export function scoreToColor(score: number, theme: "dark" | "light"): string {
  const clamped = Math.max(1, Math.min(10, score));
  const hue = ((clamped - 1) / 9) * 130;  // 0 → 130 (red → green)
  const sat = theme === "dark" ? 78 : 65;
  const light = theme === "dark" ? 58 : 42;
  return `hsl(${hue}, ${sat}%, ${light}%)`;
}
```

Pure functions, testabile, deterministe (pentru `shuffleArray` non-determinism vine din `Math.random`).

### Extensii la `useSession`

Metode noi adăugate în hook-ul existent:

- `startExam(): string` — generează `examId`, apelează `pickExamQuestions`, scrie în `currentExam`, returnează `examId` pentru navigare
- `setExamAnswer(questionId: number, answer: AnswerKey)` — set/update răspuns (mutabil până la submit)
- `setExamIndex(index: number)` — navigare între întrebări
- `submitExam()` — setează `submittedAt = now`, calculează `durationMs`
- `discardExam()` — `currentExam = null` (cu confirm în UI înainte)
- `getExamSummary()` — pure derivare: `{ correctCount, wrongCount, unansweredCount, score, perModule: Record<moduleId, {correct, total}> }`

## Componente UI

### Refolosim fără modificare

- `Header`, `MobileNav`, `Container` — layout-ul standard
- `QuestionCard` — în mod examen pasăm `showFeedback={false}` și nu pasăm `onRetry`; în review pasăm `showFeedback={true}` cu `selectedAnswer` setat la pick-ul user-ului. Componentul deja gestionează ambele moduri prin props.
- `Modal`, `Button` — pentru confirmări

`ProgressBar`-ul existent **NU** se reutilizează în mod activ — afișează contoare "corecte/greșite" care ar fi un leak de informație. În schimb creăm `ExamProgress` (vezi mai jos).

### Componente noi (toate `src/components/exam/`)

**`ExamHeader.tsx`** — bar de sus pe ecranul activ
- Badge stânga: "SIMULATOR EXAMEN" (font display, accent muted)
- Counter centru: "12 / 36"
- Timer dreapta: formatat `mm:ss`, doar informativ (folosește `useTimer` hook existent)
- Buton dreapta extremă: "Finalizează" (deschide ExamSubmitModal)

**`ExamProgress.tsx`** — bară progress neutrală
- Inspirat din `ProgressBar` existent, dar fără counter "corecte/greșite"
- Doar: bara fill cu progresul (`answeredCount / 36`) cu gradient accent gold + counter `12/36` sus-dreapta
- Sub bară: dot navigation cu 36 puncte. Stări: gol (nerespuns, `--color-border-strong`), solid accent (răspuns), bara accent mare (current). **Niciun verde/roșu** — nu trădează corectitudinea.

**`ExamSubmitModal.tsx`** — confirmare submit
- Două variante:
  - Toate răspunse: "Trimiți examenul? După submit nu mai poți schimba răspunsuri." + buton primary "Trimite"
  - Răspunsuri lipsă: "Ai răspuns la X/36. Y întrebări fără răspuns vor fi marcate ca greșite. Continui?" + buton primary "Trimite oricum" + secondary "Înapoi"

**`ExamScore.tsx`** — hero rezultat
- Număr uriaș: `score.toFixed(2)` (ex: "7.25") — Syne extrabold, ~120px desktop, ~80px mobile
- Color: din `scoreToColor(score, theme)`
- Glow ambient cu același hue (radial-gradient opacity 0.15)
- Sub el: bara orizontală lungă cu gradient `linear-gradient(90deg, hsl(0,78%,58%), hsl(65,78%,58%), hsl(130,78%,58%))` (full spectrum) cu marker poziționat la `((score-1)/9)*100%`
- Sub bară: text mic "din 10.00 (1.00 din oficiu)"

**`ExamReview.tsx`** — listă review
- Pentru fiecare din cele 36 întrebări în ordine:
  - Render `QuestionCard` cu `showFeedback={true}`, `selectedAnswer={user's pick or null}`
  - Mic label deasupra: număr ordine + module color dot + numele subjectului
- Toate expandate by default — user a vrut review complet
- La începutul secțiunii: 4 butoane statice (nu sticky) pentru jump-to-module — `href="#exam-review-programming"` etc. Ancore puse pe primul card al fiecărui modul.
- Buton "Înapoi sus" în footer al review-ului (nu sticky, scroll natural)

**`ExamModuleBreakdown.tsx`** — 4 mini-bare pe rezultat
- Layout grid 2×2 (sau 4 col desktop, 2 col mobil)
- Fiecare: numele modulului + "X/9" + bară progres în culoarea modulului
- Reflectă cât a luat din fiecare modul

**`ExamSimulatorCTA.tsx`** (în `src/components/home/`) — cardul pe pagina principală
- Card mare cu gradient subtle (style consistent cu rest of design)
- Headline: "Simulator Examen Licență"
- Sub-text scurt: "36 grile balansate • Sistem de notare oficial • Vezi nota pe scala 1-10"
- Buton primary "Pornește Simulator" (gradient gold)
- Mic visual hint: un mini-display "7.25 / 10" cu mini-gradient ca preview
- Placement: `<HeroSection />` → **`<ExamSimulatorCTA />`** → `<ModuleGrid />` → `<ChangelogBanner />`

### Pagini

**`src/app/simulator/page.tsx`** (landing)
- Render bazat pe `currentExam`:
  - `null`: hero + info card + buton "Începe Simulator"
  - activ (`submittedAt == null`): "Continui examenul (X/36 răspunse)" + buton "Continuă" + link discret "Renunță și începe altul" (cu confirm)
  - submitted (`submittedAt != null`): "Ai un rezultat" cu nota mică gradient + buton "Vezi Rezultatul" + "Examen Nou" (cu confirm că suprascrie)
- Info secțiune: "Cum funcționează nota?" — formula 1 + 36×0.25 = 10

**`src/app/simulator/[examId]/page.tsx`**
- Citește `currentExam`, validează că `examId` match
- Decide mode pe `submittedAt`:
  - `null` → render activ: `ExamHeader` + `ExamProgress` (cu dot nav neutral) + `QuestionCard` (`showFeedback={false}`) + Anterior/Următor + buton final "Finalizează" pe ultimul
  - `not null` → render rezultat: `ExamScore` + stats row + `ExamModuleBreakdown` + butoane "Examen Nou"/"Acasă" + `ExamReview`

**`src/app/simulator/layout.tsx`** și `[examId]/layout.tsx`** — metadata (title, OG) standard cu pattern-ul existent.

## Flow-uri

### Start examen nou

1. Click "Începe Simulator" pe Home CTA sau `/simulator` landing
2. Dacă există `currentExam` (activ sau submitted): modal de confirm "Vrei să începi unul nou? Pierzi ce ai acum."
3. `startExam()` → `pickExamQuestions()` → set `currentExam` → return examId
4. `router.push("/simulator/${examId}")`

### Răspuns la întrebare

1. User clickează variantă A/B/C/D în `QuestionCard`
2. Handler local: `setExamAnswer(currentQ.id, answer)` → state update + persist debounce 300ms (cum face useSession deja)
3. `showFeedback` rămâne `false` → user poate clickea din nou pe alt răspuns ca să schimbe

### Navigare

- Anterior/Următor — `setExamIndex(±1)`
- Dot navigation (`ExamProgress`) — click pe dot → `setExamIndex(index)`
- Dots au 3 stări: gol (nerespuns), accent solid (răspuns), bar accent mare (current)
- **NU** există culori verde/roșu pe dots — nu trădează corectitudinea

### Finalizare

1. Click "Finalizează" → `ExamSubmitModal` se deschide
2. Confirmation (cu mesaj specific dacă există nerespunsuri)
3. `submitExam()` → set `submittedAt = now`, `durationMs = now - startedAt`
4. URL rămâne `/simulator/${examId}`, dar acum render-ul switch-uie la rezultat (pe baza `submittedAt`)

### Discard / restart

1. Pe landing: click "Renunță și începe altul" sau "Examen Nou" (când e submitted)
2. Modal de confirm
3. `discardExam()` apoi `startExam()`

### Reluare după refresh

1. User dă refresh pe `/simulator/[examId]`
2. Pagină verifică `currentExam` din localStorage
3. Dacă `currentExam.examId == examId` și `submittedAt == null` → continuă de unde a rămas (păstrează `currentIndex`, `answers`)
4. Dacă submittedAt != null → arată rezultatul

## Versiune și changelog

### `src/components/layout/Header.tsx` linia 38
```diff
- v1.3.1
+ v1.4.0
```

### `src/components/home/ChangelogBanner.tsx`
```diff
- v1.3.1
+ v1.4.0
```
`recentChanges` actualizat:
```ts
const recentChanges = [
  "Simulator examen licență cu 36 grile și notă pe scala 1-10",
  "Notă afișată cu gradient smooth roșu-galben-verde",
  "Revizuire completă a răspunsurilor după examen",
];
```

### `src/app/noutati/page.tsx`
Entry nou la index 0 în array-ul `changelog`:
```ts
{
  version: "1.4.0",
  date: "11 Mai 2026",
  title: "Simulator examen licență",
  changes: [
    { text: "Simulator examen complet — 36 grile balansate (9 din fiecare modul), 1p din oficiu", type: "feature" },
    { text: "Notă afișată cu gradient smooth roșu-galben-verde, fără pass/fail", type: "feature" },
    { text: "Revizuire completă după examen — toate răspunsurile date vs cele corecte", type: "feature" },
    { text: "Auto-save: examenul continuă de unde ai rămas la refresh", type: "feature" },
  ],
},
```
Entry-ul 1.3.2 existent rămâne neschimbat.

## Error handling

- `/simulator/[examId]` cu examId care nu match cu `currentExam.examId`: redirect la `/simulator`
- `currentExam == null` pe rută activă: redirect la `/simulator`
- Submit fără răspunsuri = OK, intră toate ca greșite, nota = 1.00 (doar oficio)
- localStorage corrupt → `loadSession()` deja returnează `createDefaultSession()` (fallback existent), simulator nu mai are de făcut nimic special

## Testing

- Manual: parcurgere completă (start → răspuns → schimbă răspuns → navighează înainte/înapoi → finalizează → review)
- Manual: refresh în mijloc → reia
- Manual: refresh după submit → vezi rezultat
- Manual: "Examen nou" peste submitted → confirm → nou start
- Manual: submit cu 0 răspunsuri → nota 1.00 cu gradient roșu intens
- Manual: submit cu toate corecte → nota 10.00 cu gradient verde
- Manual: nota 5.50, 7.25, alte valori intermediare — vezi gradient smooth
- Manual: theme dark + light, ambele variante de saturation/lightness
- Manual: mobile (375px width) — toate ecranele lizibile

## Decizii / tradeoff-uri

- **Single-slot examen**: nu salvăm istoric. Justificare: scope simplu, "ca până acum" (în spirit cu practica fără istoric). Dacă cere ulterior, e feature separat.
- **Refolosire `QuestionCard`**: e deja proiectat în jurul props. Zero modificări. Justificare: minimă suprafață de cod nou.
- **HSL pentru gradient**: e cea mai naturală tranziție hue red→green (nu lăsă "gri" la mijloc cum face RGB lerp). Light theme are saturation/lightness ajustate pentru lizibilitate pe fundal alb.
- **CTA only pe Home, fără tab navbar**: răspuns user; păstrează navbar curat.
- **No timer cu limită**: răspuns user. Timer informativ pentru context, dar fără presiune.

## Out of scope

- Istoric examene multiple
- Salvare/sincronizare remote (DB)
- Time limit cu auto-submit
- Configurare custom (selectare module, număr întrebări, etc.)
- Comparare cu alte examene / leaderboard
- Export rezultat ca PDF/imagine
