"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  LocalSession,
  createDefaultSession,
  type AnswerRecord,
  type PracticeState,
  type SessionSettings,
} from "@/lib/session-types";
import { STORAGE_KEY } from "@/lib/constants";
import { shuffleArray } from "@/lib/utils";
import { questionsBySubject } from "@/data";

function loadSession(): LocalSession {
  if (typeof window === "undefined") return createDefaultSession();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultSession();
    const parsed = JSON.parse(raw);
    if (parsed.version !== 1) return createDefaultSession();
    return parsed as LocalSession;
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
    // localStorage full or unavailable
  }
}

export function useSession() {
  const [session, setSession] = useState<LocalSession>(createDefaultSession);
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    setSession(loadSession());
    setIsLoaded(true);
  }, []);

  // Debounced save to localStorage
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

        const { [questionId]: _, ...remainingAnswers } = prev.answers;
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

        const { [subjectId]: _, ...restStats } = prev.subjectStats;

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
    (subjectIds: string[], questionIds: number[], shuffle: boolean): string => {
      const ordered = shuffle ? shuffleArray(questionIds) : questionIds;
      const practice: PracticeState = {
        subjectIds,
        questionIds: ordered,
        currentIndex: 0,
        mode: "practice",
        startedAt: new Date().toISOString(),
      };
      const sessionId = crypto.randomUUID();
      setSession((prev) => {
        const updated = { ...prev, currentPractice: practice };
        persistSession(updated);
        return updated;
      });
      return sessionId;
    },
    [persistSession]
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
    const answers = Object.values(session.answers);
    return {
      totalAnswered: answers.length,
      totalCorrect: answers.filter((a) => a.isCorrect).length,
      accuracy: answers.length > 0
        ? Math.round((answers.filter((a) => a.isCorrect).length / answers.length) * 100)
        : 0,
      totalTimeMs: answers.reduce((sum, a) => sum + a.timeSpentMs, 0),
    };
  }, [session.answers]);

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
  };
}
