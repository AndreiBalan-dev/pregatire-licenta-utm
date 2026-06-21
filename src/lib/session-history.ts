import type {
  AnswerRecord,
  ExamSummaryData,
  PracticeState,
  PracticeSummary,
  TrainingState,
  TrainingSummary,
} from "./session-types";

export type SessionHistoryEntry =
  | { kind: "exam"; date: string; exam: ExamSummaryData; questionIds: number[] }
  | { kind: "practice"; date: string; practice: PracticeSummary }
  | { kind: "training"; date: string; training: TrainingSummary };

/** Stats for one practice session, snapshotted from the answers it produced. */
export function computePracticeSummary(
  practice: Pick<PracticeState, "questionIds" | "startedAt" | "mode" | "subjectIds">,
  answers: Record<number, AnswerRecord>,
  resolveModule: (id: number) => string | undefined,
  id: string,
  endedAt: string,
): PracticeSummary {
  let correct = 0;
  let wrong = 0;
  let durationMs = 0;
  const perModule: Record<string, { correct: number; total: number }> = {};
  for (const qId of practice.questionIds) {
    const a = answers[qId];
    if (!a || a.answeredAt < practice.startedAt) continue;
    const mod = resolveModule(qId);
    if (mod) {
      if (!perModule[mod]) perModule[mod] = { correct: 0, total: 0 };
      perModule[mod].total += 1;
      if (a.isCorrect) perModule[mod].correct += 1;
    }
    if (a.isCorrect) correct += 1;
    else wrong += 1;
    durationMs += a.timeSpentMs;
  }
  return {
    id,
    startedAt: practice.startedAt,
    endedAt,
    mode: practice.mode,
    subjectIds: practice.subjectIds,
    questionIds: practice.questionIds,
    answered: correct + wrong,
    correct,
    wrong,
    perModule,
    durationMs,
  };
}

/** Stats for one training session (field copy + a mastered-count snapshot). */
export function computeTrainingSummary(
  training: Pick<TrainingState, "subjectIds" | "pool" | "seenIds" | "answeredCount" | "correctCount" | "startedAt">,
  masteredAtEnd: number,
  id: string,
  endedAt: string,
): TrainingSummary {
  return {
    id,
    startedAt: training.startedAt,
    endedAt,
    subjectIds: training.subjectIds,
    seenCount: training.seenIds.length,
    answeredCount: training.answeredCount,
    correctCount: training.correctCount,
    masteredAtEnd,
    poolSize: training.pool.length,
  };
}

/** Merge the three histories newest-first by their date field. Pure. */
export function sortSessionHistory(entries: SessionHistoryEntry[]): SessionHistoryEntry[] {
  return [...entries].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
