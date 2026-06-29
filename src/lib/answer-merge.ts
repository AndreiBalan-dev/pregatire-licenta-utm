import { getQuestion } from "@/data";
import type { AnswerKey } from "@/data/types";
import type { LocalSession, ExamState, ChallengeSummary } from "./session-types";

export interface MergedAnswer {
  isCorrect: boolean;
}

/**
 * Fold finished-challenge answers into a merged map, leniently (a correct answer
 * upgrades, a wrong one never downgrades), like exams. Correctness is recomputed
 * via `correctOf`. Unanswered (null) and unknown questions are skipped. Pure.
 */
export function foldChallengeAnswers(
  merged: Map<number, MergedAnswer>,
  challengeHistory: ChallengeSummary[] | undefined,
  correctOf: (id: number) => AnswerKey | undefined,
): void {
  for (const ch of challengeHistory ?? []) {
    for (const a of ch.answers) {
      if (a.selected === null) continue;
      const correct = correctOf(a.questionId);
      if (correct === undefined) continue;
      const isCorrect = a.selected === correct;
      const existing = merged.get(a.questionId);
      if (!existing) merged.set(a.questionId, { isCorrect });
      else if (isCorrect && !existing.isCorrect) merged.set(a.questionId, { isCorrect: true });
    }
  }
}

/**
 * Builds a single map of questionId → {isCorrect} that merges practica answers,
 * the current submitted simulator exam, and all history exams.
 *
 * Lenient: if a question was correct in ANY source, it counts as correct.
 * This represents "did the user demonstrate mastery of this question."
 */
export function buildMergedAnswerMap(session: LocalSession): Map<number, MergedAnswer> {
  const merged = new Map<number, MergedAnswer>();

  for (const [qIdStr, ans] of Object.entries(session.answers)) {
    merged.set(Number(qIdStr), { isCorrect: ans.isCorrect });
  }

  const addExam = (exam: ExamState) => {
    if (!exam.submittedAt) return;
    for (const [qIdStr, selected] of Object.entries(exam.answers)) {
      const qId = Number(qIdStr);
      const q = getQuestion(qId);
      if (!q) continue;
      const isCorrect = selected === q.correctAnswer;
      const existing = merged.get(qId);
      if (!existing) {
        merged.set(qId, { isCorrect });
      } else if (isCorrect && !existing.isCorrect) {
        merged.set(qId, { isCorrect: true });
      }
    }
  };

  if (session.currentExam) addExam(session.currentExam);
  for (const hist of session.examHistory ?? []) addExam(hist);

  foldChallengeAnswers(merged, session.challengeHistory, (id) => getQuestion(id)?.correctAnswer);

  return merged;
}
