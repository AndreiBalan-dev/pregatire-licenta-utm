"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  LocalSession,
  createDefaultSession,
  MAX_EXAM_HISTORY,
  type AnswerRecord,
  type ExamState,
  type PracticeState,
  type SessionSettings,
} from "@/lib/session-types";
import { STORAGE_KEY, MAX_QUESTION_TIME_MS } from "@/lib/constants";
import { shuffleArray } from "@/lib/utils";
import { questionsBySubject, getQuestion } from "@/data";
import { modules } from "@/data/modules";
import { pickExamQuestions, computeScore } from "@/lib/exam";
import { buildMergedAnswerMap } from "@/lib/answer-merge";
import type { AnswerKey } from "@/data/types";

export interface ExamSummaryData {
  examId: string;
  total: number;
  answeredCount: number;
  unansweredCount: number;
  correctCount: number;
  wrongCount: number;
  score: number;
  perModule: Record<string, { correct: number; total: number }>;
  perSubject: Record<string, { correct: number; total: number }>;
  durationMs: number | null;
  submittedAt: string | null;
  startedAt: string;
  isRepeat: boolean;
  repeatShuffled: boolean;
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
        const answer: AnswerRecord = {
          selected,
          isCorrect,
          answeredAt: new Date().toISOString(),
          timeSpentMs,
        };

        const prevSubjectStat = prev.subjectStats[subjectId] || {
          attempted: 0,
          correct: 0,
          lastPracticedAt: new Date().toISOString(),
        };

        const updated: LocalSession = {
          ...prev,
          answers: { ...prev.answers, [questionId]: answer },
          subjectStats: {
            ...prev.subjectStats,
            [subjectId]: {
              attempted: prevSubjectStat.attempted + (prev.answers[questionId] ? 0 : 1),
              correct: prevSubjectStat.correct + (isCorrect && !prev.answers[questionId] ? 1 : 0),
              lastPracticedAt: new Date().toISOString(),
            },
          },
        };
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
    (subjectIds: string[], questionIds: number[], shuffle: boolean, batchSize: number | null = null): string => {
      const ordered = shuffle ? shuffleArray(questionIds) : questionIds;
      const practice: PracticeState = {
        subjectIds,
        questionIds: ordered,
        currentIndex: 0,
        mode: "practice",
        startedAt: new Date().toISOString(),
        batchSize,
      };
      const sessionId = crypto.randomUUID();
      setSession((prev) => {
        const updated = { ...prev, currentPractice: practice };
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
      const updated = { ...prev, currentPractice: null };
      persistSession(updated);
      return updated;
    });
  }, [persistSession]);

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

  const restartSameExam = useCallback((shuffleOrder: boolean): string | null => {
    const prevExam = sessionRef.current.currentExam;
    if (!prevExam) return null;
    const examId = crypto.randomUUID();
    const sourceIds = prevExam.questionIds;
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
    updateSettings,
    getOverallStats,
    getSubjectStats,
    importSession,
    exportSession,
    setSavedKey,
    resetProgress,
    startExam,
    restartSameExam,
    setExamAnswer,
    setExamIndex,
    submitExam,
    discardExam,
    clearExamHistory,
    getExamSummary,
    getExamHistorySummaries,
  };
}
