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
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
import { getQuestion } from "@/data";
import { cn, formatPercentage, formatTime } from "@/lib/utils";
import type { AnswerKey } from "@/data/types";

export default function QuizPage() {
  const router = useRouter();
  const {
    session,
    isLoaded,
    answerQuestion,
    toggleBookmark,
    updatePracticeIndex,
    endPractice,
  } = useSession();
  const timer = useTimer();
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerKey | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const practice = session.currentPractice;

  // Start timer on mount
  useEffect(() => {
    timer.reset();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const currentQuestion = useMemo(() => {
    if (!practice) return null;
    const qId = practice.questionIds[practice.currentIndex];
    return getQuestion(qId) || null;
  }, [practice]);

  // Restore previous answer if exists
  useEffect(() => {
    if (!currentQuestion) return;
    const existingAnswer = session.answers[currentQuestion.id];
    if (existingAnswer) {
      setSelectedAnswer(existingAnswer.selected);
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
      if (a) {
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

    // If not in feedback mode yet, submit the answer first
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

    // Move to next question
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

  const handleEndPractice = useCallback(() => {
    endPractice();
    router.push("/rezultate");
  }, [endPractice, router]);

  useKeyboardNav({
    onSelectOption: handleSelectAnswer,
    onNext: goToNext,
    onPrev: goToPrev,
    onBookmark: handleBookmark,
    enabled: !showSummary,
  });

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-border-strong)] border-t-[var(--color-accent)]" />
      </div>
    );
  }

  if (!practice || !currentQuestion) {
    return (
      <>
        <Header />
        <main className="py-16">
          <Container narrow>
            <div className="text-center">
              <h2
                className="text-2xl font-bold text-[var(--color-text-primary)] mb-4"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Nicio sesiune activă
              </h2>
              <p className="text-[var(--color-text-secondary)] mb-6">
                Selectează materiile și începe o nouă sesiune de practică.
              </p>
              <Button onClick={() => router.push("/practica")}>
                Alege Materiile
              </Button>
            </div>
          </Container>
        </main>
        <MobileNav />
      </>
    );
  }

  const isBookmarked = session.bookmarks.includes(currentQuestion.id);

  return (
    <>
      <Header />
      <main className="py-6 pb-24 md:pb-8">
        <Container narrow>
          {/* Progress */}
          <div className="mb-6">
            <ProgressBar
              current={practiceStats.answered}
              total={practice.questionIds.length}
              correctCount={practiceStats.correct}
              wrongCount={practiceStats.wrong}
            />
          </div>

          {/* Timer */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {/* Question dots - show a few around current */}
              <div className="flex items-center gap-1">
                {practice.questionIds.slice(
                  Math.max(0, practice.currentIndex - 3),
                  Math.min(practice.questionIds.length, practice.currentIndex + 7)
                ).map((qId, i) => {
                  const actualIndex = Math.max(0, practice.currentIndex - 3) + i;
                  const answered = session.answers[qId];
                  return (
                    <button
                      key={qId}
                      onClick={() => {
                        updatePracticeIndex(actualIndex);
                        setSelectedAnswer(null);
                        setShowFeedback(false);
                      }}
                      className={cn(
                        "w-2.5 h-2.5 rounded-full transition-all cursor-pointer",
                        actualIndex === practice.currentIndex
                          ? "w-6 bg-[var(--color-accent)]"
                          : answered?.isCorrect
                            ? "bg-[var(--color-correct)]"
                            : answered
                              ? "bg-[var(--color-wrong)]"
                              : "bg-[var(--color-border-strong)]"
                      )}
                    />
                  );
                })}
              </div>
            </div>
            <span className="text-xs text-[var(--color-text-tertiary)] font-mono">
              {formatTime(timer.elapsed)}
            </span>
          </div>

          {/* Question Card */}
          <div className="p-6 rounded-[var(--radius-xl)] border-2 border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
            <QuestionCard
              question={currentQuestion}
              questionNumber={practice.currentIndex + 1}
              totalQuestions={practice.questionIds.length}
              selectedAnswer={selectedAnswer}
              showFeedback={showFeedback}
              isBookmarked={isBookmarked}
              onSelectAnswer={handleSelectAnswer}
              onBookmark={handleBookmark}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="ghost"
              onClick={goToPrev}
              disabled={practice.currentIndex <= 0}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Anterioara
            </Button>

            <Button
              variant="ghost"
              onClick={() => setShowSummary(true)}
              className="text-[var(--color-text-tertiary)]"
            >
              Încheie
            </Button>

            <Button
              onClick={goToNext}
              disabled={!selectedAnswer && !showFeedback}
            >
              {practice.currentIndex < practice.questionIds.length - 1
                ? "Următoarea"
                : "Finalizează"}
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
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-bg-primary)]">
              <div className="text-2xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
                {practiceStats.answered}
              </div>
              <div className="text-xs text-[var(--color-text-tertiary)] mt-1">Rezolvate</div>
            </div>
            <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-correct-bg)]">
              <div className="text-2xl font-bold text-[var(--color-correct)]" style={{ fontFamily: "var(--font-display)" }}>
                {practiceStats.correct}
              </div>
              <div className="text-xs text-[var(--color-text-tertiary)] mt-1">Corecte</div>
            </div>
            <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-wrong-bg)]">
              <div className="text-2xl font-bold text-[var(--color-wrong)]" style={{ fontFamily: "var(--font-display)" }}>
                {practiceStats.wrong}
              </div>
              <div className="text-xs text-[var(--color-text-tertiary)] mt-1">Greșite</div>
            </div>
          </div>

          {practiceStats.answered > 0 && (
            <div className="text-center py-2">
              <span className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)", color: formatPercentage(practiceStats.correct, practiceStats.answered) >= 70 ? "var(--color-correct)" : formatPercentage(practiceStats.correct, practiceStats.answered) >= 40 ? "var(--color-accent)" : "var(--color-wrong)" }}>
                {formatPercentage(practiceStats.correct, practiceStats.answered)}%
              </span>
              <div className="text-xs text-[var(--color-text-tertiary)] mt-1">Acuratețe</div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowSummary(false)}
            >
              Continuă
            </Button>
            <Button
              className="flex-1"
              onClick={handleEndPractice}
            >
              Vezi Rezultatele
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
