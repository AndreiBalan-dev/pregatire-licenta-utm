"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  LocalSession,
  createDefaultSession,
  MAX_EXAM_HISTORY,
  MAX_PRACTICE_HISTORY,
  MAX_TRAINING_HISTORY,
  type AnswerRecord,
  type ExamState,
  type ExamSummaryData,
  type PracticeState,
  type PracticeSummary,
  type RedoLineage,
  type SessionSettings,
  type TrainingState,
  type TrainingSummary,
} from "@/lib/session-types";
import { computePracticeSummary, computeTrainingSummary, sortSessionHistory, type SessionHistoryEntry } from "@/lib/session-history";
import { STORAGE_KEY, MAX_QUESTION_TIME_MS } from "@/lib/constants";
import { shuffleArray } from "@/lib/utils";
import { questionsBySubject, getQuestion } from "@/data";
import { modules } from "@/data/modules";
import { pickExamQuestions, computeScore } from "@/lib/exam";
import { buildOptionOrders } from "@/lib/practice";
import { initSchedule, pickNext, applyAnswer, masteredCount, interleave } from "@/lib/training";
import { buildMergedAnswerMap } from "@/lib/answer-merge";
import type { AnswerKey, Question } from "@/data/types";

export interface StartPracticeOptions {
  /** Randomize the order of the questions themselves. */
  shuffleOrder?: boolean;
  batchSize?: number | null;
  /** Randomize the on-screen position of each question's answer options. */
  shuffleOptions?: boolean;
  /** "practice" shows feedback as you go; "test" hides it until the end. */
  mode?: "practice" | "test";
  /** When set, marks this session as a redo derived from a larger session. */
  redoLineage?: RedoLineage;
  /** Carry the "doar nerezolvate" choice so the next-batch CTA can honor it. */
  onlyUnanswered?: boolean;
  /** Ids already served in this paging chain (incl. this batch); next-batch skips them. */
  seenIds?: number[];
}

/** Build a per-question answer-option display order for a set of question ids. */
function optionOrdersForIds(ids: number[]): Record<number, AnswerKey[]> {
  return buildOptionOrders(
    ids.map((id) => getQuestion(id)).filter((q): q is Question => q !== undefined),
  );
}

function computeExamSummary(exam: ExamState): ExamSummaryData {
  let correctCount = 0;
  let answeredCount = 0;
  const perModule: Record<string, { correct: number; total: number }> = {};
  const perSubject: Record<string, { correct: number; total: number }> = {};

  for (const qId of exam.questionIds) {
    const q = getQuestion(qId);
    if (!q) continue;
    if (!perModule[q.moduleId]) perModule[q.moduleId] = { correct: 0, total: 0 };
    if (!perSubject[q.subjectId]) perSubject[q.subjectId] = { correct: 0, total: 0 };
    perModule[q.moduleId].total += 1;
    perSubject[q.subjectId].total += 1;

    const ans = exam.answers[qId];
    if (ans) {
      answeredCount += 1;
      if (ans === q.correctAnswer) {
        correctCount += 1;
        perModule[q.moduleId].correct += 1;
        perSubject[q.subjectId].correct += 1;
      }
    }
  }

  return {
    examId: exam.examId,
    total: exam.questionIds.length,
    answeredCount,
    unansweredCount: exam.questionIds.length - answeredCount,
    correctCount,
    wrongCount: answeredCount - correctCount,
    score: computeScore(correctCount),
    perModule,
    perSubject,
    durationMs: exam.durationMs,
    submittedAt: exam.submittedAt,
    startedAt: exam.startedAt,
    isRepeat: !!exam.isRepeat,
    repeatShuffled: !!exam.repeatShuffled,
  };
}

function archiveExamIfSubmitted(prev: LocalSession): ExamState[] {
  const current = prev.currentExam;
  if (current?.submittedAt) {
    return [current, ...(prev.examHistory ?? [])].slice(0, MAX_EXAM_HISTORY);
  }
  return prev.examHistory ?? [];
}

function archivePracticeIfRecordable(prev: LocalSession): PracticeSummary[] {
  const p = prev.currentPractice;
  const hist = prev.practiceHistory ?? [];
  if (!p || p.redoLineage) return hist; // skip non-sessions and redo drills
  const summary = computePracticeSummary(
    p,
    prev.answers,
    (id) => getQuestion(id)?.moduleId,
    crypto.randomUUID(),
    new Date().toISOString(),
  );
  if (summary.answered === 0) return hist; // skip empty sessions
  return [summary, ...hist].slice(0, MAX_PRACTICE_HISTORY);
}

function archiveTrainingIfRecordable(prev: LocalSession): TrainingSummary[] {
  const t = prev.currentTraining;
  const hist = prev.trainingHistory ?? [];
  if (!t || t.answeredCount === 0) return hist;
  const mastered = masteredCount(t.pool, prev.trainingBoxes ?? {}, prev.answers);
  const summary = computeTrainingSummary(t, mastered, crypto.randomUUID(), new Date().toISOString());
  return [summary, ...hist].slice(0, MAX_TRAINING_HISTORY);
}

function clampLoadedAnswers(raw: unknown): Record<number, AnswerRecord> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<number, AnswerRecord> = {};
  for (const [k, v] of Object.entries(raw as Record<string, AnswerRecord>)) {
    if (!v || typeof v !== "object") continue;
    const t = typeof v.timeSpentMs === "number" && v.timeSpentMs >= 0 ? v.timeSpentMs : 0;
    out[Number(k)] = { ...v, timeSpentMs: Math.min(t, MAX_QUESTION_TIME_MS) };
  }
  return out;
}

function clampLoadedBoxes(raw: unknown): Record<number, number> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<number, number> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const n = Number(v);
    if (Number.isFinite(n)) out[Number(k)] = Math.max(0, Math.min(5, Math.floor(n)));
  }
  return out;
}

function loadSession(): LocalSession {
  if (typeof window === "undefined") return createDefaultSession();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultSession();
    const parsed = JSON.parse(raw);
    if (parsed.version !== 1) return createDefaultSession();
    const defaults = createDefaultSession();
    return {
      ...defaults,
      ...parsed,
      answers: clampLoadedAnswers(parsed.answers),
      settings: { ...defaults.settings, ...(parsed.settings ?? {}) },
      examHistory: Array.isArray(parsed.examHistory) ? parsed.examHistory : [],
      practiceHistory: Array.isArray(parsed.practiceHistory) ? parsed.practiceHistory : [],
      trainingHistory: Array.isArray(parsed.trainingHistory) ? parsed.trainingHistory : [],
      trainingBoxes: clampLoadedBoxes(parsed.trainingBoxes),
      currentTraining:
        parsed.currentTraining && Array.isArray(parsed.currentTraining.pool)
          ? parsed.currentTraining
          : null,
    } as LocalSession;
  } catch {
    return createDefaultSession();
  }
}

function saveSession(session: LocalSession) {
  if (typeof window === "undefined") return;
  try {
    session.lastActiveAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
  }
}

/** Record one answer into the global answers map + per-subject stats. Pure. */
function applyAnswerToSession(
  prev: LocalSession,
  questionId: number,
  selected: "a" | "b" | "c" | "d",
  isCorrect: boolean,
  timeSpentMs: number,
  subjectId: string,
): LocalSession {
  const now = new Date().toISOString();
  const answer: AnswerRecord = { selected, isCorrect, answeredAt: now, timeSpentMs };
  const prevSubjectStat = prev.subjectStats[subjectId] || { attempted: 0, correct: 0, lastPracticedAt: now };
  const previous = prev.answers[questionId];
  const correctDelta = previous ? (isCorrect ? 1 : 0) - (previous.isCorrect ? 1 : 0) : isCorrect ? 1 : 0;
  return {
    ...prev,
    answers: { ...prev.answers, [questionId]: answer },
    subjectStats: {
      ...prev.subjectStats,
      [subjectId]: {
        attempted: prevSubjectStat.attempted + (previous ? 0 : 1),
        correct: Math.max(0, prevSubjectStat.correct + correctDelta),
        lastPracticedAt: now,
      },
    },
  };
}

export function useSession() {
  const [session, setSession] = useState<LocalSession>(createDefaultSession);
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionRef = useRef<LocalSession>(session);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    const loaded = loadSession();
    sessionRef.current = loaded;
    setSession(loaded);
    setIsLoaded(true);
  }, []);

  const persistSession = useCallback((updated: LocalSession) => {
    setSession(updated);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => saveSession(updated), 300);
  }, []);

  const answerQuestion = useCallback(
    (questionId: number, selected: "a" | "b" | "c" | "d", isCorrect: boolean, timeSpentMs: number, subjectId: string) => {
      setSession((prev) => {
        const updated = applyAnswerToSession(prev, questionId, selected, isCorrect, timeSpentMs, subjectId);
        persistSession(updated);
        return updated;
      });
    },
    [persistSession]
  );

  const retryQuestion = useCallback(
    (questionId: number, subjectId: string) => {
      setSession((prev) => {
        const existing = prev.answers[questionId];
        if (!existing) return prev;

        const { [questionId]: _removed, ...remainingAnswers } = prev.answers; // eslint-disable-line @typescript-eslint/no-unused-vars
        const prevStat = prev.subjectStats[subjectId] || { attempted: 0, correct: 0, lastPracticedAt: new Date().toISOString() };

        const updated: LocalSession = {
          ...prev,
          answers: remainingAnswers,
          subjectStats: {
            ...prev.subjectStats,
            [subjectId]: {
              attempted: Math.max(0, prevStat.attempted - 1),
              correct: Math.max(0, prevStat.correct - (existing.isCorrect ? 1 : 0)),
              lastPracticedAt: prevStat.lastPracticedAt,
            },
          },
        };
        persistSession(updated);
        return updated;
      });
    },
    [persistSession]
  );

  const resetSubject = useCallback(
    (subjectId: string) => {
      setSession((prev) => {
        const subjectQuestions = questionsBySubject[subjectId] || [];
        const subjectQIds = new Set(subjectQuestions.map((q) => q.id));

        const filteredAnswers: typeof prev.answers = {};
        for (const [qId, answer] of Object.entries(prev.answers)) {
          if (!subjectQIds.has(Number(qId))) {
            filteredAnswers[Number(qId)] = answer;
          }
        }

        const { [subjectId]: _removed, ...restStats } = prev.subjectStats; // eslint-disable-line @typescript-eslint/no-unused-vars

        const updated: LocalSession = {
          ...prev,
          answers: filteredAnswers,
          subjectStats: restStats,
        };
        persistSession(updated);
        return updated;
      });
    },
    [persistSession]
  );

  const toggleBookmark = useCallback(
    (questionId: number) => {
      setSession((prev) => {
        const bookmarks = prev.bookmarks.includes(questionId)
          ? prev.bookmarks.filter((id) => id !== questionId)
          : [...prev.bookmarks, questionId];
        const updated = { ...prev, bookmarks };
        persistSession(updated);
        return updated;
      });
    },
    [persistSession]
  );

  const startPractice = useCallback(
    (subjectIds: string[], questionIds: number[], options: StartPracticeOptions = {}): string => {
      const { shuffleOrder = false, batchSize = null, shuffleOptions = false, mode = "practice", redoLineage, onlyUnanswered, seenIds } = options;
      const ordered = shuffleOrder ? shuffleArray(questionIds) : questionIds;
      const optionOrder = shuffleOptions ? optionOrdersForIds(ordered) : undefined;
      const practice: PracticeState = {
        subjectIds,
        questionIds: ordered,
        currentIndex: 0,
        mode,
        startedAt: new Date().toISOString(),
        batchSize,
        ...(optionOrder ? { optionOrder } : {}),
        ...(redoLineage ? { redoLineage } : {}),
        ...(onlyUnanswered !== undefined ? { onlyUnanswered } : {}),
        ...(seenIds ? { seenIds } : {}),
      };
      const sessionId = crypto.randomUUID();
      setSession((prev) => {
        const updated = { ...prev, currentPractice: practice, practiceHistory: archivePracticeIfRecordable(prev) };
        saveSession(updated);
        return updated;
      });
      return sessionId;
    },
    []
  );

  const updatePracticeIndex = useCallback(
    (index: number) => {
      setSession((prev) => {
        if (!prev.currentPractice) return prev;
        const updated: LocalSession = {
          ...prev,
          currentPractice: { ...prev.currentPractice, currentIndex: index },
        };
        persistSession(updated);
        return updated;
      });
    },
    [persistSession]
  );

  const endPractice = useCallback(() => {
    setSession((prev) => {
      const updated = { ...prev, currentPractice: null, practiceHistory: archivePracticeIfRecordable(prev) };
      persistSession(updated);
      return updated;
    });
  }, [persistSession]);

  const startTraining = useCallback(
    (subjectIds: string[], options: { shuffleOrder?: boolean; shuffleOptions?: boolean } = {}): string | null => {
      const { shuffleOrder = false, shuffleOptions = false } = options;
      // Round-robin across the selected subjects so multi-module scopes mix from
      // the start; shuffle (when on) randomizes across the whole flattened set.
      const lists = subjectIds.map((sid) => questionsBySubject[sid] || []);
      const flat = lists.flat();
      if (flat.length === 0) return null;
      const orderedQuestions = shuffleOrder ? shuffleArray(flat) : interleave(lists);
      const pool = orderedQuestions.map((q) => q.id);
      const sessionId = crypto.randomUUID();
      setSession((prev) => {
        const boxes = prev.trainingBoxes ?? {};
        const due = initSchedule(pool, boxes, prev.answers);
        const firstId = pickNext({ pool, due, seq: 0, lastQuestionId: null }, boxes, prev.answers);
        let optionOrder: Record<number, AnswerKey[]> | undefined;
        if (shuffleOptions) {
          const q = getQuestion(firstId);
          if (q) optionOrder = { [firstId]: buildOptionOrders([q])[firstId] };
        }
        const training: TrainingState = {
          subjectIds,
          pool,
          due,
          seq: 0,
          currentQuestionId: firstId,
          lastQuestionId: null,
          seenIds: [],
          answeredCount: 0,
          correctCount: 0,
          startedAt: new Date().toISOString(),
          shuffleOptions,
          ...(optionOrder ? { optionOrder } : {}),
        };
        const updated = { ...prev, currentTraining: training, trainingHistory: archiveTrainingIfRecordable(prev) };
        saveSession(updated);
        return updated;
      });
      return sessionId;
    },
    []
  );

  const answerTraining = useCallback(
    (questionId: number, selected: "a" | "b" | "c" | "d", isCorrect: boolean, timeSpentMs: number, subjectId: string) => {
      setSession((prev) => {
        const training = prev.currentTraining;
        if (!training) return prev;
        const base = applyAnswerToSession(prev, questionId, selected, isCorrect, timeSpentMs, subjectId);
        const boxes = { ...(prev.trainingBoxes ?? {}) };
        const { due, seq, box } = applyAnswer(
          { pool: training.pool, due: training.due, seq: training.seq, lastQuestionId: training.lastQuestionId },
          boxes,
          prev.answers,
          questionId,
          isCorrect,
        );
        boxes[questionId] = box;
        const nextId = pickNext({ pool: training.pool, due, seq, lastQuestionId: questionId }, boxes, base.answers);
        let optionOrder = training.optionOrder;
        if (training.shuffleOptions && (!optionOrder || optionOrder[nextId] == null)) {
          const q = getQuestion(nextId);
          if (q) optionOrder = { ...(optionOrder ?? {}), [nextId]: buildOptionOrders([q])[nextId] };
        }
        // Distinct, recency-ordered: the just-answered question moves to the end
        // so the in-session "go back" review always treats it as the newest item.
        const seenIds = [...training.seenIds.filter((id) => id !== questionId), questionId];
        const updated: LocalSession = {
          ...base,
          trainingBoxes: boxes,
          currentTraining: {
            ...training,
            due,
            seq,
            lastQuestionId: questionId,
            currentQuestionId: nextId,
            seenIds,
            answeredCount: training.answeredCount + 1,
            correctCount: training.correctCount + (isCorrect ? 1 : 0),
            ...(optionOrder ? { optionOrder } : {}),
          },
        };
        persistSession(updated);
        return updated;
      });
    },
    [persistSession]
  );

  const endTraining = useCallback(() => {
    setSession((prev) => {
      const updated = { ...prev, currentTraining: null, trainingHistory: archiveTrainingIfRecordable(prev) };
      persistSession(updated);
      return updated;
    });
  }, [persistSession]);

  const getTrainingProgress = useCallback(() => {
    const t = session.currentTraining;
    if (!t) return null;
    const boxes = session.trainingBoxes ?? {};
    return {
      answeredCount: t.answeredCount,
      correctCount: t.correctCount,
      accuracy: t.answeredCount > 0 ? Math.round((t.correctCount / t.answeredCount) * 100) : 0,
      masteredCount: masteredCount(t.pool, boxes, session.answers),
      poolSize: t.pool.length,
      seenCount: t.seenIds.length,
    };
  }, [session.currentTraining, session.trainingBoxes, session.answers]);

  const updateSettings = useCallback(
    (partial: Partial<SessionSettings>) => {
      setSession((prev) => {
        const updated: LocalSession = {
          ...prev,
          settings: { ...prev.settings, ...partial },
        };
        persistSession(updated);
        return updated;
      });
    },
    [persistSession]
  );

  const getOverallStats = useCallback(() => {
    const merged = buildMergedAnswerMap(session);
    const totalAnswered = merged.size;
    let totalCorrect = 0;
    for (const v of merged.values()) {
      if (v.isCorrect) totalCorrect += 1;
    }

    // Time: per-question time from practica + total duration of submitted exams
    let totalTimeMs = 0;
    for (const a of Object.values(session.answers)) {
      totalTimeMs += a.timeSpentMs;
    }
    if (session.currentExam?.submittedAt && session.currentExam.durationMs) {
      totalTimeMs += session.currentExam.durationMs;
    }
    for (const hist of session.examHistory ?? []) {
      if (hist.submittedAt && hist.durationMs) totalTimeMs += hist.durationMs;
    }

    return {
      totalAnswered,
      totalCorrect,
      accuracy: totalAnswered > 0
        ? Math.round((totalCorrect / totalAnswered) * 100)
        : 0,
      totalTimeMs,
    };
  }, [session]);

  const getSubjectStats = useCallback(
    (subjectId: string) => {
      return session.subjectStats[subjectId] || { attempted: 0, correct: 0, lastPracticedAt: null };
    },
    [session.subjectStats]
  );

  const importSession = useCallback(
    (imported: LocalSession) => {
      persistSession(imported);
    },
    [persistSession]
  );

  const exportSession = useCallback(() => {
    return session;
  }, [session]);

  const setSavedKey = useCallback(
    (key: string) => {
      setSession((prev) => {
        const updated = { ...prev, savedKey: key };
        persistSession(updated);
        return updated;
      });
    },
    [persistSession]
  );

  const resetProgress = useCallback(() => {
    const fresh = createDefaultSession();
    persistSession(fresh);
  }, [persistSession]);

  const startExam = useCallback((): string => {
    const examId = crypto.randomUUID();
    const questionIds = pickExamQuestions(modules, questionsBySubject);
    const snapshotFeedback = !!sessionRef.current.settings.simulatorShowFeedback;
    const snapshotShuffleOptions = !!sessionRef.current.settings.simulatorShuffleOptions;
    const exam: ExamState = {
      examId,
      questionIds,
      answers: {},
      currentIndex: 0,
      startedAt: new Date().toISOString(),
      submittedAt: null,
      durationMs: null,
      showFeedback: snapshotFeedback,
      isRepeat: false,
      ...(snapshotShuffleOptions ? { optionOrder: optionOrdersForIds(questionIds) } : {}),
    };
    const newHistory = archiveExamIfSubmitted(sessionRef.current);
    const updated: LocalSession = {
      ...sessionRef.current,
      currentExam: exam,
      examHistory: newHistory,
    };
    sessionRef.current = updated;
    setSession(updated);
    saveSession(updated);
    return examId;
  }, []);

  // Start a fresh repeat exam from a given set of question ids. Works for the
  // current exam ("Re-fă acest examen") and for any exam pulled from history.
  const repeatExamFromIds = useCallback((sourceIds: number[], shuffleOrder: boolean, shuffleOptions = false): string | null => {
    if (!sourceIds || sourceIds.length === 0) return null;
    const examId = crypto.randomUUID();
    const newIds = shuffleOrder ? shuffleArray(sourceIds) : [...sourceIds];
    const snapshotFeedback = !!sessionRef.current.settings.simulatorShowFeedback;
    const exam: ExamState = {
      examId,
      questionIds: newIds,
      answers: {},
      currentIndex: 0,
      startedAt: new Date().toISOString(),
      submittedAt: null,
      durationMs: null,
      showFeedback: snapshotFeedback,
      isRepeat: true,
      repeatShuffled: shuffleOrder,
      ...(shuffleOptions ? { optionOrder: optionOrdersForIds(newIds) } : {}),
    };
    const newHistory = archiveExamIfSubmitted(sessionRef.current);
    const updated: LocalSession = {
      ...sessionRef.current,
      currentExam: exam,
      examHistory: newHistory,
    };
    sessionRef.current = updated;
    setSession(updated);
    saveSession(updated);
    return examId;
  }, []);

  const restartSameExam = useCallback((shuffleOrder: boolean, shuffleOptions = false): string | null => {
    const prevExam = sessionRef.current.currentExam;
    if (!prevExam) return null;
    return repeatExamFromIds(prevExam.questionIds, shuffleOrder, shuffleOptions);
  }, [repeatExamFromIds]);

  const setExamAnswer = useCallback(
    (questionId: number, answer: AnswerKey) => {
      setSession((prev) => {
        if (!prev.currentExam || prev.currentExam.submittedAt) return prev;
        const updated: LocalSession = {
          ...prev,
          currentExam: {
            ...prev.currentExam,
            answers: { ...prev.currentExam.answers, [questionId]: answer },
          },
        };
        persistSession(updated);
        return updated;
      });
    },
    [persistSession],
  );

  const setExamIndex = useCallback(
    (index: number) => {
      setSession((prev) => {
        if (!prev.currentExam) return prev;
        const max = prev.currentExam.questionIds.length - 1;
        const clamped = Math.max(0, Math.min(max, index));
        const updated: LocalSession = {
          ...prev,
          currentExam: { ...prev.currentExam, currentIndex: clamped },
        };
        persistSession(updated);
        return updated;
      });
    },
    [persistSession],
  );

  const submitExam = useCallback(() => {
    setSession((prev) => {
      if (!prev.currentExam || prev.currentExam.submittedAt) return prev;
      const now = new Date();
      const durationMs = now.getTime() - new Date(prev.currentExam.startedAt).getTime();
      const updated: LocalSession = {
        ...prev,
        currentExam: {
          ...prev.currentExam,
          submittedAt: now.toISOString(),
          durationMs,
        },
      };
      persistSession(updated);
      return updated;
    });
  }, [persistSession]);

  const discardExam = useCallback(() => {
    setSession((prev) => {
      const newHistory = archiveExamIfSubmitted(prev);
      const updated = { ...prev, currentExam: null, examHistory: newHistory };
      persistSession(updated);
      return updated;
    });
  }, [persistSession]);

  const clearExamHistory = useCallback(() => {
    setSession((prev) => {
      const updated = { ...prev, examHistory: [] };
      persistSession(updated);
      return updated;
    });
  }, [persistSession]);

  const getExamHistorySummaries = useCallback((): ExamSummaryData[] => {
    return (session.examHistory ?? []).map((e) => computeExamSummary(e));
  }, [session.examHistory]);

  const getSessionHistory = useCallback((): SessionHistoryEntry[] => {
    const exams = (session.examHistory ?? []).map((e) => ({
      kind: "exam" as const,
      date: e.submittedAt ?? e.startedAt,
      exam: computeExamSummary(e),
      questionIds: e.questionIds,
    }));
    const practices = (session.practiceHistory ?? []).map((p) => ({
      kind: "practice" as const,
      date: p.endedAt,
      practice: p,
    }));
    const trainings = (session.trainingHistory ?? []).map((t) => ({
      kind: "training" as const,
      date: t.endedAt,
      training: t,
    }));
    return sortSessionHistory([...exams, ...practices, ...trainings]);
  }, [session.examHistory, session.practiceHistory, session.trainingHistory]);

  const clearSessionHistory = useCallback(() => {
    setSession((prev) => {
      const updated = { ...prev, examHistory: [], practiceHistory: [], trainingHistory: [] };
      persistSession(updated);
      return updated;
    });
  }, [persistSession]);

  const getExamSummary = useCallback(() => {
    const exam = session.currentExam;
    if (!exam) return null;

    let correctCount = 0;
    let answeredCount = 0;
    const perModule: Record<string, { correct: number; total: number }> = {};
    const perSubject: Record<string, { correct: number; total: number }> = {};

    for (const qId of exam.questionIds) {
      const q = getQuestion(qId);
      if (!q) continue;
      if (!perModule[q.moduleId]) perModule[q.moduleId] = { correct: 0, total: 0 };
      if (!perSubject[q.subjectId]) perSubject[q.subjectId] = { correct: 0, total: 0 };
      perModule[q.moduleId].total += 1;
      perSubject[q.subjectId].total += 1;

      const ans = exam.answers[qId];
      if (ans) {
        answeredCount += 1;
        if (ans === q.correctAnswer) {
          correctCount += 1;
          perModule[q.moduleId].correct += 1;
          perSubject[q.subjectId].correct += 1;
        }
      }
    }

    return {
      total: exam.questionIds.length,
      answeredCount,
      unansweredCount: exam.questionIds.length - answeredCount,
      correctCount,
      wrongCount: answeredCount - correctCount,
      score: computeScore(correctCount),
      perModule,
      perSubject,
      durationMs: exam.durationMs,
    };
  }, [session.currentExam]);

  const hasExistingSession = isLoaded && Object.keys(session.answers).length > 0;

  return {
    session,
    isLoaded,
    hasExistingSession,
    answerQuestion,
    retryQuestion,
    resetSubject,
    toggleBookmark,
    startPractice,
    updatePracticeIndex,
    endPractice,
    startTraining,
    answerTraining,
    endTraining,
    getTrainingProgress,
    updateSettings,
    getOverallStats,
    getSubjectStats,
    importSession,
    exportSession,
    setSavedKey,
    resetProgress,
    startExam,
    restartSameExam,
    repeatExamFromIds,
    setExamAnswer,
    setExamIndex,
    submitExam,
    discardExam,
    clearExamHistory,
    getExamSummary,
    getExamHistorySummaries,
    getSessionHistory,
    clearSessionHistory,
  };
}
