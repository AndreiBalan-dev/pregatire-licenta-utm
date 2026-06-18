import { shuffleArray } from "@/lib/utils";
import type { AnswerKey, Question } from "@/data/types";

/**
 * Pure search/filter core for the Cautare page. Dependency-injected (questions,
 * the user's merged answer map and bookmarks, and the shuffle fn) so it stays
 * free of React and `@/data`, and is unit-testable in isolation - same approach
 * as redo-scope.ts.
 */

/** any = ignore; with = must have; without = must not have. */
export type Presence = "any" | "with" | "without";
export type ProgressFilter =
  | "unanswered"
  | "answered"
  | "correct"
  | "wrong"
  | "bookmarked";
export type SortKey = "relevance" | "id" | "random";
export type CodeLanguage = "c" | "cpp" | "python" | "java" | "js" | "php" | "sql" | "bash";
/** Re-exported so UI code can type answer letters without reaching into @/data. */
export type AnswerLetter = AnswerKey;

export const CODE_LANGUAGES: { id: CodeLanguage; label: string }[] = [
  { id: "c", label: "C" },
  { id: "cpp", label: "C++" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "js", label: "JavaScript" },
  { id: "php", label: "PHP" },
  { id: "sql", label: "SQL" },
  { id: "bash", label: "Bash" },
];

export const PROGRESS_FILTERS: { id: ProgressFilter; label: string }[] = [
  { id: "unanswered", label: "Nerezolvate" },
  { id: "answered", label: "Rezolvate" },
  { id: "correct", label: "Corecte" },
  { id: "wrong", label: "Greșite" },
  { id: "bookmarked", label: "Marcate" },
];

export interface SearchCriteria {
  /** Free text. A leading `#` (e.g. `#42`) searches strictly by question id. */
  q: string;
  moduleIds: string[];
  subjectIds: string[];
  code: Presence;
  /** Only applied when `code === "with"`. */
  codeLanguages: string[];
  figure: Presence;
  explanation: Presence;
  /** OR within the group: a question passes if it matches any selected one. */
  progress: ProgressFilter[];
  correctAnswer: AnswerKey | null;
  sort: SortKey;
}

export const EMPTY_CRITERIA: SearchCriteria = {
  q: "",
  moduleIds: [],
  subjectIds: [],
  code: "any",
  codeLanguages: [],
  figure: "any",
  explanation: "any",
  progress: [],
  correctAnswer: null,
  sort: "relevance",
};

export interface SearchContext {
  /** questionId -> {isCorrect}, e.g. from buildMergedAnswerMap(session). */
  answered: Map<number, { isCorrect: boolean }>;
  bookmarks: Set<number>;
}

export const EMPTY_CONTEXT: SearchContext = {
  answered: new Map(),
  bookmarks: new Set(),
};

/** Lowercase + strip diacritics so "criptografie" matches "Criptografie", "sir" matches "șir", etc. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

/** Match priority used by the "relevance" sort (higher = shown first). */
const SCORE_HASH_ID = 1000;
const SCORE_BARE_ID = 900;
const SCORE_TEXT = 100;
const SCORE_OPTION = 50;
const SCORE_EXPLANATION = 25;
const SCORE_EMPTY = 0;

function matchScore(
  question: Question,
  normQuery: string,
  bareId: number | null,
  hashId: number | null,
): number {
  // `#42` -> strict id lookup, nothing else.
  if (hashId !== null) return question.id === hashId ? SCORE_HASH_ID : -1;

  let score = -1;
  if (bareId !== null && question.id === bareId) score = SCORE_BARE_ID;
  if (!normQuery) return Math.max(score, SCORE_EMPTY);

  if (normalize(question.text).includes(normQuery)) {
    score = Math.max(score, SCORE_TEXT);
  } else {
    const opts = normalize(
      `${question.options.a} ${question.options.b} ${question.options.c} ${question.options.d}`,
    );
    if (opts.includes(normQuery)) {
      score = Math.max(score, SCORE_OPTION);
    } else if (question.explanation && normalize(question.explanation).includes(normQuery)) {
      score = Math.max(score, SCORE_EXPLANATION);
    }
  }
  return score;
}

function matchesProgress(
  id: number,
  progress: ProgressFilter[],
  ctx: SearchContext,
): boolean {
  const ans = ctx.answered.get(id);
  for (const p of progress) {
    if (p === "unanswered" && !ans) return true;
    if (p === "answered" && ans) return true;
    if (p === "correct" && ans?.isCorrect) return true;
    if (p === "wrong" && ans && !ans.isCorrect) return true;
    if (p === "bookmarked" && ctx.bookmarks.has(id)) return true;
  }
  return false;
}

/**
 * Filter `questions` by `criteria` and return them in the requested order.
 * Groups AND together; multi-value groups OR within themselves.
 */
export function searchQuestions(
  questions: Question[],
  criteria: SearchCriteria,
  ctx: SearchContext = EMPTY_CONTEXT,
  shuffle: <T>(items: T[]) => T[] = shuffleArray,
): Question[] {
  const trimmed = criteria.q.trim();
  const hashMatch = trimmed.match(/^#(\d+)$/);
  const hashId = hashMatch ? Number(hashMatch[1]) : null;
  const bareId = !hashMatch && /^\d+$/.test(trimmed) ? Number(trimmed) : null;
  const normQuery = hashMatch ? "" : normalize(trimmed);

  const moduleSet = new Set(criteria.moduleIds);
  const subjectSet = new Set(criteria.subjectIds);
  const langSet = new Set(criteria.codeLanguages);

  const scored: { q: Question; score: number }[] = [];

  for (const question of questions) {
    if (moduleSet.size && !moduleSet.has(question.moduleId)) continue;
    if (subjectSet.size && !subjectSet.has(question.subjectId)) continue;

    if (criteria.code === "with" && !question.code) continue;
    if (criteria.code === "without" && question.code) continue;
    if (
      criteria.code === "with" &&
      langSet.size &&
      (!question.codeLanguage || !langSet.has(question.codeLanguage))
    ) {
      continue;
    }

    if (criteria.figure === "with" && !question.figure) continue;
    if (criteria.figure === "without" && question.figure) continue;

    if (criteria.explanation === "with" && !question.explanation) continue;
    if (criteria.explanation === "without" && question.explanation) continue;

    if (criteria.correctAnswer && question.correctAnswer !== criteria.correctAnswer) {
      continue;
    }

    if (criteria.progress.length && !matchesProgress(question.id, criteria.progress, ctx)) {
      continue;
    }

    const score = matchScore(question, normQuery, bareId, hashId);
    if (score < 0) continue;

    scored.push({ q: question, score });
  }

  if (criteria.sort === "random") {
    return shuffle(scored.map((s) => s.q));
  }
  if (criteria.sort === "id") {
    scored.sort((a, b) => a.q.id - b.q.id);
    return scored.map((s) => s.q);
  }
  // relevance: best score first, then ascending id for a stable order
  scored.sort((a, b) => b.score - a.score || a.q.id - b.q.id);
  return scored.map((s) => s.q);
}

/**
 * Number of active filters living inside the "Filtre" popup: code, code
 * language, figure, explanation, progress and correct-answer. Excludes the
 * materie chip, the free-text box and the sort (which are surfaced separately).
 */
export function countActiveFilters(c: SearchCriteria): number {
  let n = 0;
  if (c.code !== "any") n += 1;
  if (c.code === "with" && c.codeLanguages.length) n += 1;
  if (c.figure !== "any") n += 1;
  if (c.explanation !== "any") n += 1;
  if (c.progress.length) n += 1;
  if (c.correctAnswer) n += 1;
  return n;
}

/** True when anything at all narrows the result set (drives the "Sterge tot" reset). */
export function hasAnyCriteria(c: SearchCriteria): boolean {
  return (
    c.q.trim() !== "" ||
    c.moduleIds.length > 0 ||
    c.subjectIds.length > 0 ||
    countActiveFilters(c) > 0
  );
}

function parsePresence(v: string | null): Presence {
  return v === "with" || v === "without" ? v : "any";
}

function parseList(v: string | null): string[] {
  return v ? v.split(",").filter(Boolean) : [];
}

const PROGRESS_IDS = PROGRESS_FILTERS.map((p) => p.id as string);
function parseProgress(v: string | null): ProgressFilter[] {
  return parseList(v).filter((x): x is ProgressFilter => PROGRESS_IDS.includes(x));
}

function parseSort(v: string | null): SortKey {
  return v === "id" || v === "random" ? v : "relevance";
}

function parseAnswer(v: string | null): AnswerKey | null {
  return v === "a" || v === "b" || v === "c" || v === "d" ? v : null;
}

/** Encode criteria into URL query params (omitting defaults) for shareable links. */
export function criteriaToParams(c: SearchCriteria): URLSearchParams {
  const p = new URLSearchParams();
  if (c.q.trim()) p.set("q", c.q.trim());
  if (c.moduleIds.length) p.set("mod", c.moduleIds.join(","));
  if (c.subjectIds.length) p.set("mat", c.subjectIds.join(","));
  if (c.code !== "any") p.set("cod", c.code);
  if (c.code === "with" && c.codeLanguages.length) p.set("lang", c.codeLanguages.join(","));
  if (c.figure !== "any") p.set("fig", c.figure);
  if (c.explanation !== "any") p.set("exp", c.explanation);
  if (c.progress.length) p.set("prog", c.progress.join(","));
  if (c.correctAnswer) p.set("corect", c.correctAnswer);
  if (c.sort !== "relevance") p.set("sort", c.sort);
  return p;
}

/** Parse criteria back from URL query params (unknown/invalid values fall back to defaults). */
export function criteriaFromParams(p: URLSearchParams): SearchCriteria {
  return {
    q: p.get("q") ?? "",
    moduleIds: parseList(p.get("mod")),
    subjectIds: parseList(p.get("mat")),
    code: parsePresence(p.get("cod")),
    codeLanguages: parseList(p.get("lang")),
    figure: parsePresence(p.get("fig")),
    explanation: parsePresence(p.get("exp")),
    progress: parseProgress(p.get("prog")),
    correctAnswer: parseAnswer(p.get("corect")),
    sort: parseSort(p.get("sort")),
  };
}
