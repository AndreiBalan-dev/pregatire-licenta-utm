import type { AnswerKey } from "@/data/types";
import type { AnswerRecord, PracticeState, ExamState, ChallengeSummary } from "./session-types";

/**
 * Question ids the user answered INCORRECTLY during THIS practice session.
 * "This session" = answered at/after `startedAt` (ISO strings compare
 * chronologically). Unanswered questions are not "wrong answers". `exists`
 * filters out ids whose question no longer resolves.
 */
export function wrongIdsInPractice(
  practice: Pick<PracticeState, "questionIds" | "startedAt">,
  answers: Record<number, AnswerRecord>,
  exists: (id: number) => boolean,
): number[] {
  return practice.questionIds.filter((id) => {
    const a = answers[id];
    return !!a && a.answeredAt >= practice.startedAt && !a.isCorrect && exists(id);
  });
}

/**
 * Question ids the user got wrong in an exam — INCLUDING unanswered ones,
 * which count against the score. `correctOf` returns the correct key, or
 * undefined for an unknown question (skipped).
 */
export function wrongIdsInExam(
  exam: Pick<ExamState, "questionIds" | "answers">,
  correctOf: (id: number) => AnswerKey | undefined,
): number[] {
  return exam.questionIds.filter((id) => {
    const correct = correctOf(id);
    if (correct === undefined) return false;
    return exam.answers[id] !== correct;
  });
}

/**
 * Question ids the user got wrong in a finished challenge - INCLUDING timed-out
 * / unanswered ones (selected === null). Correctness is recomputed against the
 * current answer key (like wrongIdsInExam), so a since-corrected answer is
 * respected. `correctOf` returns undefined for an unknown question (skipped).
 */
export function wrongIdsInChallenge(
  summary: Pick<ChallengeSummary, "questionIds" | "answers">,
  correctOf: (id: number) => AnswerKey | undefined,
): number[] {
  const byId = new Map(summary.answers.map((a) => [a.questionId, a]));
  return summary.questionIds.filter((id) => {
    const correct = correctOf(id);
    if (correct === undefined) return false;
    const a = byId.get(id);
    return !a || a.selected === null || a.selected !== correct;
  });
}
