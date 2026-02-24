"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Container } from "@/components/layout/Container";
import { QuestionCard } from "@/components/practice/QuestionCard";
import { ProgressBar } from "@/components/practice/ProgressBar";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useSession } from "@/hooks/useSession";
import { useTimer } from "@/hooks/useTimer";
import { getQuestion, questionsBySubject } from "@/data";
import { modules } from "@/data/modules";
import { cn, formatPercentage, formatTime } from "@/lib/utils";
import type { AnswerKey } from "@/data/types";

export default function QuizPage() {
  const router = useRouter();
  const {
    session,
    isLoaded,
    answerQuestion,
    retryQuestion,
    toggleBookmark,
    startPractice,
    updatePracticeIndex,
    endPractice,
  } = useSession();
  const timer = useTimer();
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerKey | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const practice = session.currentPractice;

  useEffect(() => {
    timer.reset();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const currentQuestion = useMemo(() => {
    if (!practice) return null;
    const qId = practice.questionIds[practice.currentIndex];
    return getQuestion(qId) || null;
  }, [practice]);

  useEffect(() => {
    if (!currentQuestion || !practice) return;
    const existingAnswer = session.answers[currentQuestion.id];
    const isFromThisSession = existingAnswer && existingAnswer.answeredAt >= practice.startedAt;
    if (isFromThisSession) {
      setSelectedAnswer(existingAnswer.selected); // eslint-disable-line react-hooks/set-state-in-effect
      setShowFeedback(true);
    } else {
      setSelectedAnswer(null);
      setShowFeedback(false);
      timer.reset();
    }
  }, [currentQuestion?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const practiceStats = useMemo(() => {
    if (!practice) return { correct: 0, wrong: 0, answered: 0 };
    let correct = 0;
    let wrong = 0;
    for (const qId of practice.questionIds) {
      const a = session.answers[qId];
      if (a && a.answeredAt >= practice.startedAt) {
        if (a.isCorrect) correct++;
        else wrong++;
      }
    }
    return { correct, wrong, answered: correct + wrong };
  }, [practice, session.answers]);

  const handleSelectAnswer = useCallback(
    (answer: AnswerKey) => {
      if (showFeedback || !currentQuestion) return;
      setSelectedAnswer(answer);

      if (session.settings.showImmediateFeedback) {
        const isCorrect = answer === currentQuestion.correctAnswer;
        const timeSpent = timer.stop();
        answerQuestion(
          currentQuestion.id,
          answer,
          isCorrect,
          timeSpent,
          currentQuestion.subjectId
        );
        setShowFeedback(true);
      }
    },
    [showFeedback, currentQuestion, session.settings.showImmediateFeedback, answerQuestion, timer]
  );

  const goToNext = useCallback(() => {
    if (!practice) return;

    if (!showFeedback && selectedAnswer && currentQuestion) {
      const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
      const timeSpent = timer.stop();
      answerQuestion(
        currentQuestion.id,
        selectedAnswer,
        isCorrect,
        timeSpent,
        currentQuestion.subjectId
      );
      setShowFeedback(true);
      return;
    }

    if (practice.currentIndex < practice.questionIds.length - 1) {
      updatePracticeIndex(practice.currentIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      timer.reset();
    } else {
      setShowSummary(true);
    }
  }, [practice, showFeedback, selectedAnswer, currentQuestion, answerQuestion, timer, updatePracticeIndex]);

  const goToPrev = useCallback(() => {
    if (!practice || practice.currentIndex <= 0) return;
    updatePracticeIndex(practice.currentIndex - 1);
    setSelectedAnswer(null);
    setShowFeedback(false);
  }, [practice, updatePracticeIndex]);

  const handleBookmark = useCallback(() => {
    if (!currentQuestion) return;
    toggleBookmark(currentQuestion.id);
  }, [currentQuestion, toggleBookmark]);

  const handleRetry = useCallback(() => {
    if (!currentQuestion) return;
    retryQuestion(currentQuestion.id, currentQuestion.subjectId);
    setSelectedAnswer(null);
    setShowFeedback(false);
    timer.reset();
  }, [currentQuestion, retryQuestion, timer]);

  const handleEndPractice = useCallback(() => {
    endPractice();
    router.push("/rezultate");
  }, [endPractice, router]);

  const remainingUnanswered = useMemo(() => {
    if (!practice) return 0;
    const currentSet = new Set(practice.questionIds);
    let count = 0;
    for (const sid of practice.subjectIds) {
      const questions = questionsBySubject[sid] || [];
      for (const q of questions) {
        if (!currentSet.has(q.id) && !session.answers[q.id]) {
          count++;
        }
      }
    }
    return count;
  }, [practice, session.answers]);

  const handleContinueNextBatch = useCallback(() => {
    if (!practice) return;
    const currentSet = new Set(practice.questionIds);
    const nextIds: number[] = [];
    for (const sid of practice.subjectIds) {
      const questions = questionsBySubject[sid] || [];
      for (const q of questions) {
        if (!currentSet.has(q.id) && !session.answers[q.id]) {
          nextIds.push(q.id);
        }
      }
    }
    if (nextIds.length === 0) return;

    const batchSize = practice.batchSize;
    const batch = batchSize ? nextIds.slice(0, batchSize) : nextIds;

    const newSessionId = startPractice(
      practice.subjectIds,
      batch,
      session.settings.shuffleOptions,
      batchSize
    );
    setShowSummary(false);
    router.replace(`/practica/${newSessionId}`);
  }, [practice, session.answers, session.settings.shuffleOptions, startPractice, router]);

  useEffect(() => {
    if (isLoaded && !practice) {
      router.replace("/practica");
    }
  }, [isLoaded, practice, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-border-strong)] border-t-[var(--color-accent)]" />
      </div>
    );
  }

  if (!practice || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-border-strong)] border-t-[var(--color-accent)]" />
      </div>
    );
  }

  const isBookmarked = session.bookmarks.includes(currentQuestion.id);

  // Find the module/subject for the current question
  const currentModule = modules.find((m) => m.id === currentQuestion.moduleId);
  const currentSubject = currentModule?.subjects.find((s) => s.id === currentQuestion.subjectId);
  const moduleColor = currentModule?.color || "var(--color-accent)";

  const accuracyPct = formatPercentage(practiceStats.correct, practiceStats.answered);

  return (
    <>
      <Header />
      <main className="relative py-4 sm:py-6 pb-24 md:pb-8 overflow-hidden">
        <div
          className="absolute inset-0 grid-pattern opacity-40"
          aria-hidden="true"
        />
        <Container narrow className="relative">
          {/* Top bar: subject + timer */}
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            {currentSubject && (
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-1.5 h-5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: moduleColor }}
                />
                <span className="text-xs sm:text-sm text-[var(--color-text-secondary)] truncate">
                  {currentSubject.icon} {currentSubject.name.split("(")[0].trim()}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="text-xs text-[var(--color-text-tertiary)] font-mono tabular-nums">
                {formatTime(timer.elapsed)}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-4 sm:mb-5">
            <ProgressBar
              current={practiceStats.answered}
              total={practice.questionIds.length}
              correctCount={practiceStats.correct}
              wrongCount={practiceStats.wrong}
            />
          </div>

          {/* Question dot navigation */}
          <div className="flex items-center justify-center mb-5 sm:mb-6">
            <div className="flex items-center gap-1.5">
              {practice.currentIndex > 3 && (
                <span className="text-[10px] text-[var(--color-text-tertiary)] mr-1">···</span>
              )}
              {practice.questionIds.slice(
                Math.max(0, practice.currentIndex - 3),
                Math.min(practice.questionIds.length, practice.currentIndex + 7)
              ).map((qId, i) => {
                const actualIndex = Math.max(0, practice.currentIndex - 3) + i;
                const raw = session.answers[qId];
                const answered = raw && raw.answeredAt >= practice.startedAt ? raw : undefined;
                const isCurrent = actualIndex === practice.currentIndex;
                return (
                  <button
                    key={qId}
                    onClick={() => {
                      updatePracticeIndex(actualIndex);
                      setSelectedAnswer(null);
                      setShowFeedback(false);
                    }}
                    className={cn(
                      "rounded-full transition-all duration-200 cursor-pointer",
                      isCurrent
                        ? "w-7 h-2.5 bg-[var(--color-accent)] shadow-[0_0_8px_rgba(232,166,49,0.3)]"
                        : "w-2.5 h-2.5 hover:scale-125",
                      !isCurrent && answered?.isCorrect && "bg-[var(--color-correct)]",
                      !isCurrent && answered && !answered.isCorrect && "bg-[var(--color-wrong)]",
                      !isCurrent && !answered && "bg-[var(--color-border-strong)]"
                    )}
                  />
                );
              })}
              {practice.currentIndex + 7 < practice.questionIds.length && (
                <span className="text-[10px] text-[var(--color-text-tertiary)] ml-1">···</span>
              )}
            </div>
          </div>

          {/* Question card */}
          <div
            className="relative p-4 sm:p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] overflow-hidden"
          >
            {/* Subtle top glow from module color */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse 80% 35% at 50% 0%, ${moduleColor}, transparent)`,
                opacity: 0.04,
              }}
            />
            <div className="relative">
              <QuestionCard
                question={currentQuestion}
                questionNumber={practice.currentIndex + 1}
                totalQuestions={practice.questionIds.length}
                selectedAnswer={selectedAnswer}
                showFeedback={showFeedback}
                isBookmarked={isBookmarked}
                onSelectAnswer={handleSelectAnswer}
                onBookmark={handleBookmark}
                onRetry={handleRetry}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-5 sm:mt-6 gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="sm:text-sm"
              onClick={goToPrev}
              disabled={practice.currentIndex <= 0}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span className="hidden sm:inline">Anterioara</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSummary(true)}
              className="text-[var(--color-text-tertiary)] text-xs sm:text-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:hidden">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              Încheie
            </Button>

            <Button
              onClick={goToNext}
              size="sm"
              className="sm:text-sm"
              disabled={!selectedAnswer && !showFeedback}
            >
              <span className="hidden sm:inline">
                {practice.currentIndex < practice.questionIds.length - 1
                  ? "Următoarea"
                  : "Finalizează"}
              </span>
              <span className="sm:hidden">
                {practice.currentIndex < practice.questionIds.length - 1
                  ? "Următoarea"
                  : "Gata"}
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Button>
          </div>
        </Container>
      </main>
      <MobileNav />

      {/* Summary Modal */}
      <Modal
        open={showSummary}
        onClose={() => setShowSummary(false)}
        title="Rezumat Sesiune"
      >
        <div className="space-y-5">
          {/* Accuracy hero */}
          {practiceStats.answered > 0 && (
            <div className="relative text-center py-4 rounded-[var(--radius-lg)] bg-[var(--color-bg-primary)] overflow-hidden">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse 70% 50% at 50% 0%, ${
                    accuracyPct >= 70 ? "var(--color-correct)" : accuracyPct >= 40 ? "var(--color-accent)" : "var(--color-wrong)"
                  }, transparent)`,
                  opacity: 0.08,
                }}
              />
              <span
                className="relative text-4xl sm:text-5xl font-extrabold"
                style={{
                  fontFamily: "var(--font-display)",
                  letterSpacing: "-0.02em",
                  color: accuracyPct >= 70 ? "var(--color-correct)" : accuracyPct >= 40 ? "var(--color-accent)" : "var(--color-wrong)",
                }}
              >
                {accuracyPct}%
              </span>
              <div className="relative text-xs text-[var(--color-text-tertiary)] mt-1.5 uppercase tracking-wider font-medium">Acuratețe</div>
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="relative p-3 sm:p-4 rounded-[var(--radius-md)] bg-[var(--color-bg-primary)] text-center overflow-hidden">
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, var(--color-accent), transparent)", opacity: 0.05 }} />
              <div className="relative text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] tabular-nums" style={{ fontFamily: "var(--font-display)" }}>
                {practiceStats.answered}
              </div>
              <div className="relative text-[10px] sm:text-xs text-[var(--color-text-tertiary)] mt-1">Rezolvate</div>
            </div>
            <div className="relative p-3 sm:p-4 rounded-[var(--radius-md)] bg-[var(--color-bg-primary)] text-center overflow-hidden border border-[var(--color-correct-border)]">
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, var(--color-correct), transparent)", opacity: 0.06 }} />
              <div className="relative text-xl sm:text-2xl font-bold text-[var(--color-correct)] tabular-nums" style={{ fontFamily: "var(--font-display)" }}>
                {practiceStats.correct}
              </div>
              <div className="relative text-[10px] sm:text-xs text-[var(--color-text-tertiary)] mt-1">Corecte</div>
            </div>
            <div className="relative p-3 sm:p-4 rounded-[var(--radius-md)] bg-[var(--color-bg-primary)] text-center overflow-hidden border border-[var(--color-wrong-border)]">
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, var(--color-wrong), transparent)", opacity: 0.06 }} />
              <div className="relative text-xl sm:text-2xl font-bold text-[var(--color-wrong)] tabular-nums" style={{ fontFamily: "var(--font-display)" }}>
                {practiceStats.wrong}
              </div>
              <div className="relative text-[10px] sm:text-xs text-[var(--color-text-tertiary)] mt-1">Greșite</div>
            </div>
          </div>

          {/* Remaining info */}
          {remainingUnanswered > 0 && (
            <div className="flex items-center justify-center gap-2 text-xs text-[var(--color-text-tertiary)] py-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Încă {remainingUnanswered} întrebări nerezolvate din aceste materii
            </div>
          )}
          {remainingUnanswered === 0 && practiceStats.answered > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-[var(--color-correct)] py-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Ai rezolvat toate întrebările din aceste materii!
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-2 pt-1">
            {remainingUnanswered > 0 && (
              <Button
                className="w-full"
                onClick={handleContinueNextBatch}
              >
                Următoarele {practice.batchSize ? Math.min(practice.batchSize, remainingUnanswered) : remainingUnanswered} întrebări
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Button>
            )}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowSummary(false)}
              >
                Înapoi
              </Button>
              <Button
                variant={remainingUnanswered > 0 ? "ghost" : "primary"}
                className="flex-1"
                onClick={handleEndPractice}
              >
                Rezultate
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
