import type { Module, Question } from "@/data/types";
import { shuffleArray } from "./utils";

export const EXAM_QUESTIONS_PER_MODULE = 9;
export const OFFICIO_POINTS = 1.0;
export const POINTS_PER_QUESTION = 0.25;
export const EXAM_TOTAL_QUESTIONS = 36;
export const EXAM_MAX_SCORE = 10.0;
export const EXAM_MIN_SCORE = 1.0;

function distributeAcrossBuckets(total: number, buckets: number): number[] {
  if (buckets <= 0) return [];
  const base = Math.floor(total / buckets);
  const remainder = total % buckets;
  const result = new Array<number>(buckets).fill(base);
  const indices = shuffleArray([...Array(buckets).keys()]).slice(0, remainder);
  for (const i of indices) result[i] += 1;
  return result;
}

export function pickExamQuestions(
  modules: Module[],
  questionsBySubject: Record<string, Question[]>,
): number[] {
  const ids: number[] = [];

  for (const mod of modules) {
    const subjects = mod.subjects;
    if (subjects.length === 0) continue;

    const distribution = distributeAcrossBuckets(
      EXAM_QUESTIONS_PER_MODULE,
      subjects.length,
    );
    const shuffledSubjects = shuffleArray(subjects);
    const moduleIds: number[] = [];

    for (let i = 0; i < shuffledSubjects.length; i++) {
      const subject = shuffledSubjects[i];
      const slots = distribution[i];
      const pool = questionsBySubject[subject.id] || [];
      const picked = shuffleArray(pool).slice(0, slots);
      moduleIds.push(...picked.map((q) => q.id));
    }

    // Top up from any subject in the module if a subject was too small
    if (moduleIds.length < EXAM_QUESTIONS_PER_MODULE) {
      const chosen = new Set(moduleIds);
      const pool = subjects.flatMap((s) => questionsBySubject[s.id] || []);
      const remaining = shuffleArray(pool.filter((q) => !chosen.has(q.id)));
      for (const q of remaining) {
        if (moduleIds.length >= EXAM_QUESTIONS_PER_MODULE) break;
        moduleIds.push(q.id);
      }
    }

    ids.push(...moduleIds);
  }

  return shuffleArray(ids);
}

export function computeScore(correctCount: number): number {
  return OFFICIO_POINTS + correctCount * POINTS_PER_QUESTION;
}

export function scoreToColor(score: number, theme: "dark" | "light"): string {
  const clamped = Math.max(EXAM_MIN_SCORE, Math.min(EXAM_MAX_SCORE, score));
  const hue = ((clamped - EXAM_MIN_SCORE) / (EXAM_MAX_SCORE - EXAM_MIN_SCORE)) * 130;
  const sat = theme === "dark" ? 78 : 65;
  const light = theme === "dark" ? 58 : 42;
  return `hsl(${hue}, ${sat}%, ${light}%)`;
}

export function scoreGradientCss(theme: "dark" | "light"): string {
  const stops: string[] = [];
  for (let i = 0; i <= 10; i++) {
    const score = EXAM_MIN_SCORE + (i / 10) * (EXAM_MAX_SCORE - EXAM_MIN_SCORE);
    stops.push(`${scoreToColor(score, theme)} ${i * 10}%`);
  }
  return `linear-gradient(90deg, ${stops.join(", ")})`;
}

export function scorePositionPct(score: number): number {
  const clamped = Math.max(EXAM_MIN_SCORE, Math.min(EXAM_MAX_SCORE, score));
  return ((clamped - EXAM_MIN_SCORE) / (EXAM_MAX_SCORE - EXAM_MIN_SCORE)) * 100;
}
