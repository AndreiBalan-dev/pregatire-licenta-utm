/**
 * Back/forward navigation for reviewing past questions during an unlimited
 * Antrenament session.
 *
 * The training stream shows one live question at a time. This lets the user
 * step back through the questions they have already answered this session
 * (read-only, with the answer revealed) and then return to the live question.
 *
 * History model: `reviewLen` distinct past questions, most-recently-answered
 * LAST. `reviewing` is the current index into that list, or null while viewing
 * the live question. `liveFeedback` is true when the live view is showing the
 * just-answered question's feedback (answered but not yet advanced); that
 * question is the last history item, so stepping back skips it (you are already
 * looking at it) and the stream resumes from it.
 */
export interface ReviewNavState {
  /** Number of distinct past (answered) questions available to review. */
  reviewLen: number;
  /** Current review index, or null when viewing the live question. */
  reviewing: number | null;
  /** Live view is currently showing the just-answered question's feedback. */
  liveFeedback: boolean;
}

export type ReviewAction =
  /** Show the review item at this index. */
  | { type: "review"; index: number }
  /** Leave review and restore the (preserved) live view. */
  | { type: "live" }
  /** Live view: commit the shown feedback and advance to the next question. */
  | { type: "advance" }
  /** No-op: the control is disabled in this state. */
  | { type: "none" };

/**
 * Newest review index reachable from the live view: the most-recently-answered
 * question, or the one before it when that question's feedback is already on
 * screen (so we don't re-show what the live view already displays).
 */
export function newestReviewIndex(reviewLen: number, liveFeedback: boolean): number {
  return liveFeedback ? reviewLen - 2 : reviewLen - 1;
}

/** What the "back / previous" control does in the given state. */
export function navBack(state: ReviewNavState): ReviewAction {
  const { reviewLen, reviewing, liveFeedback } = state;
  if (reviewing !== null) {
    return reviewing > 0 ? { type: "review", index: reviewing - 1 } : { type: "none" };
  }
  const target = newestReviewIndex(reviewLen, liveFeedback);
  return target >= 0 ? { type: "review", index: target } : { type: "none" };
}

/** What the "forward / next" control does in the given state. */
export function navForward(state: ReviewNavState): ReviewAction {
  const { reviewLen, reviewing, liveFeedback } = state;
  if (reviewing !== null) {
    const newest = newestReviewIndex(reviewLen, liveFeedback);
    return reviewing < newest ? { type: "review", index: reviewing + 1 } : { type: "live" };
  }
  // On the live question: advance only once it has been answered (feedback shown).
  return liveFeedback ? { type: "advance" } : { type: "none" };
}
