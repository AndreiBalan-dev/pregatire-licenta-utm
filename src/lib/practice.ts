import { shuffleArray } from "@/lib/utils";

export interface SelectPracticeOptions {
  onlyUnanswered: boolean;
  shuffle: boolean;
  batchSize: number | null;
}

/**
 * Build the ordered list of question ids for a practice session.
 *
 * The full pool is ordered first — randomly when `shuffle` is on, otherwise
 * unanswered questions first — and only then sliced to `batchSize`. Slicing
 * last is what lets a batch draw from the entire pool instead of just the
 * first `batchSize` questions.
 */
export function selectPracticeQuestionIds<T extends { id: number }>(
  pool: T[],
  options: SelectPracticeOptions,
  isAnswered: (id: number) => boolean,
  shuffleFn: <U>(items: U[]) => U[] = shuffleArray,
): number[] {
  const { onlyUnanswered, shuffle, batchSize } = options;

  const filtered = pool.filter((q) => !onlyUnanswered || !isAnswered(q.id));

  const ordered = shuffle
    ? shuffleFn(filtered)
    : [...filtered].sort(
        (a, b) => (isAnswered(a.id) ? 1 : 0) - (isAnswered(b.id) ? 1 : 0),
      );

  const sized = batchSize !== null ? ordered.slice(0, batchSize) : ordered;
  return sized.map((q) => q.id);
}
