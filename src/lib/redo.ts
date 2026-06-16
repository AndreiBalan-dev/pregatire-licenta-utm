import type { AnswerKey } from "@/data/types";
import type { AnswerRecord, PracticeState, ExamState } from "./session-types";

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
