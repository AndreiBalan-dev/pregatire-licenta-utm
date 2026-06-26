import { shuffleArray } from "@/lib/utils";

/** Choose the canonical ordered set of question ids for a lobby. The pool is
 *  the union of the selected subjects' questions (built by the caller). */
export function pickChallengeQuestionIds<T extends { id: number }>(
  pool: T[],
  count: number,
  shuffle: boolean,
  shuffleFn: <U>(items: U[]) => U[] = shuffleArray,
): number[] {
  const ordered = shuffle ? shuffleFn(pool) : pool;
  return ordered.slice(0, count).map((q) => q.id);
}

/** A single player's traversal order over the chosen set. When the host turned
 *  on order-shuffle, each player gets their own permutation so neighbors cannot
 *  copy; otherwise everyone shares the canonical order. */
export function buildPlayerOrder(
  questionIds: number[],
  shuffle: boolean,
  shuffleFn: <U>(items: U[]) => U[] = shuffleArray,
): number[] {
  return shuffle ? shuffleFn([...questionIds]) : [...questionIds];
}
