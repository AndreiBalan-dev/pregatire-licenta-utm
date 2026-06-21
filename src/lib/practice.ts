import { shuffleArray } from "@/lib/utils";
import type { AnswerKey } from "@/data/types";

const OPTION_KEYS: readonly AnswerKey[] = ["a", "b", "c", "d"];

/**
 * Build a stable per-question display order for the answer options.
 *
 * Each option keeps its own letter; only its on-screen position changes, so
 * the stored explanations (which reference letters like "Corect: b") and the
 * "Corect" feedback stay accurate. Questions flagged `lockOptions` (e.g.
 * "toate cele de mai sus") keep the natural a/b/c/d order.
 *
 * Returned map is keyed by question id; values are a permutation of the four
 * answer keys. Computed once at session start and persisted, so positions
 * don't re-jump when the user navigates back or refreshes.
 */
export function buildOptionOrders<T extends { id: number; lockOptions?: boolean }>(
  questions: T[],
  shuffleFn: <U>(items: U[]) => U[] = shuffleArray,
): Record<number, AnswerKey[]> {
  const orders: Record<number, AnswerKey[]> = {};
  for (const q of questions) {
    orders[q.id] = q.lockOptions ? [...OPTION_KEYS] : shuffleFn([...OPTION_KEYS]);
  }
  return orders;
}

/**
 * How the question pool is ordered for a practice session:
 * - "natural": original order, already-answered questions keep their place.
 * - "unanswered-first": questions you haven't done yet come first, done ones
 *   after (opt-in; this used to be the silent default for the non-shuffled
 *   case, which — with batching — hid answered questions entirely).
 * - "random": shuffled.
 */
export type QuestionOrder = "natural" | "unanswered-first" | "random";

export interface SelectPracticeOptions {
  onlyUnanswered: boolean;
  order: QuestionOrder;
  batchSize: number | null;
}

/**
 * Build the ordered list of question ids for a practice session.
 *
 * The full pool is ordered first (per `order`) and only then sliced to
 * `batchSize`. Slicing last is what lets a batch draw from the entire pool
 * instead of just the first `batchSize` questions. To practice only the ones
 * left, use `onlyUnanswered` (a filter, independent of `order`).
 */
export function selectPracticeQuestionIds<T extends { id: number }>(
  pool: T[],
  options: SelectPracticeOptions,
  isAnswered: (id: number) => boolean,
  shuffleFn: <U>(items: U[]) => U[] = shuffleArray,
): number[] {
  const { onlyUnanswered, order, batchSize } = options;

  const filtered = pool.filter((q) => !onlyUnanswered || !isAnswered(q.id));

  const ordered =
    order === "random"
      ? shuffleFn(filtered)
      : order === "unanswered-first"
        ? [...filtered].sort(
            (a, b) => (isAnswered(a.id) ? 1 : 0) - (isAnswered(b.id) ? 1 : 0),
          )
        : filtered; // "natural" — keep original order, answered ones stay in place

  const sized = batchSize !== null ? ordered.slice(0, batchSize) : ordered;
  return sized.map((q) => q.id);
}

export interface NextBatchInput {
  /** All question ids in the pool, in canonical (natural) order. */
  pool: number[];
  /** Ids already served in this paging chain, including the current batch. */
  seenIds: number[];
  /**
   * Whether the session was started with "doar nerezolvate". When true the
   * next batch only draws never-answered questions; when false it pages through
   * the whole pool (re-including ones answered before this chain).
   */
  onlyUnanswered: boolean;
  batchSize: number | null;
}

/**
 * Pool ids still available to serve as a next batch: not yet seen this chain,
 * and (only when `onlyUnanswered`) not already answered. Order follows `pool`.
 * Tracking `seenIds` rather than answered-state is what lets a non-filtered
 * session page past already-answered questions without looping back.
 */
export function remainingPoolIds(
  input: Pick<NextBatchInput, "pool" | "seenIds" | "onlyUnanswered">,
  isAnswered: (id: number) => boolean,
): number[] {
  const seen = new Set(input.seenIds);
  return input.pool.filter(
    (id) => !seen.has(id) && (!input.onlyUnanswered || !isAnswered(id)),
  );
}

/**
 * The next batch to serve and the `seenIds` to carry into it. Slices
 * `remainingPoolIds` to `batchSize` (or returns all when null) and appends the
 * served ids to `seenIds`, so the following batch never re-offers them.
 */
export function nextBatch(
  input: NextBatchInput,
  isAnswered: (id: number) => boolean,
): { ids: number[]; seenIds: number[] } {
  const remaining = remainingPoolIds(input, isAnswered);
  const ids = input.batchSize !== null ? remaining.slice(0, input.batchSize) : remaining;
  return { ids, seenIds: [...input.seenIds, ...ids] };
}
