import type { AnswerRecord } from "./session-types";

/** Strongest box; a question never graduates past this (it still cycles). */
export const MAX_BOX = 5;
/** Questions-from-now until a question of each box is due again. */
export const INTERVALS = [2, 4, 8, 16, 32, 50] as const;
/** How fast never-seen questions trickle into the stream. */
export const NEW_SPACING = 3;
/** A question at or above this box counts as "stapanita" (mastered). */
export const MASTERED_BOX = 4;

export interface SchedulerState {
  /** All in-scope question ids, in introduction order. */
  pool: number[];
  /** qid -> absolute seq target. */
  due: Record<number, number>;
  /** Questions answered so far this session (the scheduler clock). */
  seq: number;
  /** Never pick this id as the immediate next question. */
  lastQuestionId: number | null;
}

function clampBox(b: number): number {
  if (!Number.isFinite(b)) return 1;
  return Math.max(0, Math.min(MAX_BOX, Math.floor(b)));
}

/** Initial box for a question: persistent strength, else history, else "new". */
export function seedBox(
  qid: number,
  boxes: Record<number, number>,
  answers: Record<number, AnswerRecord>,
): number {
  const stored = boxes[qid];
  if (typeof stored === "number") return clampBox(stored);
  const a = answers[qid];
  if (a) return a.isCorrect ? 2 : 0;
  return 1;
}

/** Box after answering: correct -> +1 (capped), wrong -> reset to 0. */
export function nextBox(box: number, isCorrect: boolean): number {
  return isCorrect ? Math.min(box + 1, MAX_BOX) : 0;
}

export function intervalForBox(box: number): number {
  return INTERVALS[clampBox(box)];
}

/**
 * Seed the schedule for a whole scope. Previously-seen questions surface early
 * as a review backlog (prior wrong first, prior correct later); never-seen
 * questions trickle in at NEW_SPACING in pool order.
 */
export function initSchedule(
  pool: number[],
  boxes: Record<number, number>,
  answers: Record<number, AnswerRecord>,
): Record<number, number> {
  const due: Record<number, number> = {};
  let newIndex = 0;
  for (const qid of pool) {
    const seen = typeof boxes[qid] === "number" || answers[qid] !== undefined;
    if (seen) {
      due[qid] = intervalForBox(seedBox(qid, boxes, answers));
    } else {
      newIndex += 1;
      due[qid] = newIndex * NEW_SPACING;
    }
  }
  return due;
}

/** Next question: smallest due, excluding lastQuestionId, tie-break weaker box then pool order. */
export function pickNext(
  state: SchedulerState,
  boxes: Record<number, number>,
  answers: Record<number, AnswerRecord>,
): number {
  const { pool, due, lastQuestionId } = state;
  let best = pool[0];
  let bestDue = Infinity;
  let bestBox = Infinity;
  for (const qid of pool) {
    if (qid === lastQuestionId && pool.length > 1) continue;
    const d = due[qid] ?? 0;
    const b = seedBox(qid, boxes, answers);
    if (d < bestDue || (d === bestDue && b < bestBox)) {
      best = qid;
      bestDue = d;
      bestBox = b;
    }
  }
  return best;
}

/** Apply an answer: advance the clock, re-box, reschedule. Pure (returns a slice). */
export function applyAnswer(
  state: SchedulerState,
  boxes: Record<number, number>,
  answers: Record<number, AnswerRecord>,
  qid: number,
  isCorrect: boolean,
): { due: Record<number, number>; seq: number; box: number } {
  const box = nextBox(seedBox(qid, boxes, answers), isCorrect);
  const seq = state.seq + 1;
  const due = { ...state.due, [qid]: seq + intervalForBox(box) };
  return { due, seq, box };
}

/** How many in-scope questions are at or above the mastery threshold. */
export function masteredCount(
  pool: number[],
  boxes: Record<number, number>,
  answers: Record<number, AnswerRecord>,
): number {
  let n = 0;
  for (const qid of pool) {
    if (seedBox(qid, boxes, answers) >= MASTERED_BOX) n += 1;
  }
  return n;
}

/**
 * Round-robin merge of several lists: a[0], b[0], c[0], a[1], b[1], ...,
 * skipping lists that run out. Used to keep a multi-subject training scope
 * mixed across subjects/modules instead of one full subject (then module) at a
 * time, which would otherwise make new questions trickle in strict pool order.
 */
export function interleave<T>(lists: T[][]): T[] {
  const out: T[] = [];
  const max = lists.reduce((m, l) => Math.max(m, l.length), 0);
  for (let i = 0; i < max; i++) {
    for (const list of lists) {
      if (i < list.length) out.push(list[i]);
    }
  }
  return out;
}
