import { pickNext } from "@/lib/training";
import type {
  AnswerRecord,
  ExamState,
  LocalSession,
  PracticeState,
  TrainingState,
} from "@/lib/session-types";

/**
 * Heal persisted state that points at question ids which no longer exist in the
 * data (e.g. a question removed because it was a duplicate). The three runtime
 * pages derive their on-screen question via getQuestion(id); a dangling "current"
 * id renders an infinite spinner (antrenament, practica) or a blank page
 * (simulator active mode). We prune dead ids from the live sessions at load time
 * so a stuck user self-heals on the next visit, without clearing storage.
 *
 * History/results/review/search surfaces already skip missing ids, so they are
 * left alone; submitted exams are preserved verbatim as a record.
 *
 * `exists` is injected (rather than importing getQuestion here) so the logic is
 * pure and unit-testable. Every branch returns the original reference when nothing
 * is dead, so healthy sessions pass through untouched (no needless re-render).
 */
export function sanitizeLoadedSession(
  session: LocalSession,
  exists: (id: number) => boolean,
): LocalSession {
  const training = sanitizeTraining(
    session.currentTraining ?? null,
    session.trainingBoxes ?? {},
    session.answers,
    exists,
  );
  const practice = sanitizePractice(session.currentPractice, exists);
  const exam = sanitizeActiveExam(session.currentExam, exists);

  if (
    training === (session.currentTraining ?? null) &&
    practice === session.currentPractice &&
    exam === session.currentExam
  ) {
    return session;
  }
  return { ...session, currentTraining: training, currentPractice: practice, currentExam: exam };
}

function pruneRecord(rec: Record<number, number>, exists: (id: number) => boolean): Record<number, number> {
  const out: Record<number, number> = {};
  for (const [k, v] of Object.entries(rec)) {
    if (exists(Number(k))) out[Number(k)] = v;
  }
  return out;
}

function sanitizeTraining(
  t: TrainingState | null,
  boxes: Record<number, number>,
  answers: Record<number, AnswerRecord>,
  exists: (id: number) => boolean,
): TrainingState | null {
  if (!t) return t;
  const pool = t.pool.filter(exists);
  if (pool.length === 0) return null; // nothing left in scope to train
  if (pool.length === t.pool.length && exists(t.currentQuestionId)) {
    return t; // every referenced id still exists; leave as-is
  }

  const due = pruneRecord(t.due, exists);
  const seenIds = t.seenIds.filter(exists);
  const lastQuestionId =
    t.lastQuestionId != null && !exists(t.lastQuestionId) ? null : t.lastQuestionId;
  const currentQuestionId = exists(t.currentQuestionId)
    ? t.currentQuestionId
    : pickNext({ pool, due, seq: t.seq, lastQuestionId }, boxes, answers);

  return { ...t, pool, due, seenIds, currentQuestionId, lastQuestionId };
}

function sanitizePractice(
  p: PracticeState | null,
  exists: (id: number) => boolean,
): PracticeState | null {
  if (!p) return p;
  const questionIds = p.questionIds.filter(exists);
  if (questionIds.length === p.questionIds.length) return p; // unchanged
  if (questionIds.length === 0) return null;

  const removedBefore = p.questionIds.slice(0, p.currentIndex).filter((id) => !exists(id)).length;
  const currentIndex = Math.min(Math.max(0, p.currentIndex - removedBefore), questionIds.length - 1);
  const seenIds = p.seenIds ? p.seenIds.filter(exists) : p.seenIds;

  return { ...p, questionIds, currentIndex, ...(p.seenIds ? { seenIds } : {}) };
}

function sanitizeActiveExam(
  e: ExamState | null,
  exists: (id: number) => boolean,
): ExamState | null {
  // Only the active (unsubmitted) exam can break on a dead "current" question;
  // submitted/historical exams render through robust review code, so preserve them.
  if (!e || e.submittedAt !== null) return e;
  const questionIds = e.questionIds.filter(exists);
  if (questionIds.length === e.questionIds.length) return e; // unchanged
  if (questionIds.length === 0) return null;

  const removedBefore = e.questionIds.slice(0, e.currentIndex).filter((id) => !exists(id)).length;
  const currentIndex = Math.min(Math.max(0, e.currentIndex - removedBefore), questionIds.length - 1);

  return { ...e, questionIds, currentIndex };
}
