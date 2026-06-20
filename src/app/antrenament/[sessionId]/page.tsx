"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Container } from "@/components/layout/Container";
import { QuestionCard } from "@/components/practice/QuestionCard";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/hooks/useSession";
import { useTimer } from "@/hooks/useTimer";
import { getQuestion } from "@/data";
import { modules } from "@/data/modules";
import { cn, formatPercentage, formatTime } from "@/lib/utils";
import type { AnswerKey } from "@/data/types";

const ALL_SUBJECT_IDS = modules.flatMap((m) => m.subjects.map((s) => s.id));

function scopeLabel(subjectIds: string[]): string {
  if (subjectIds.length >= ALL_SUBJECT_IDS.length) return "Toate materiile";
  if (subjectIds.length === 1) {
    for (const m of modules) {
      const s = m.subjects.find((x) => x.id === subjectIds[0]);
      if (s) return s.name.split("(")[0].trim();
    }
  }
  return `${subjectIds.length} materii`;
}

export default function AntrenamentRuntime() {
  const router = useRouter();
  const {
    session,
    isLoaded,
    answerTraining,
    endTraining,
    startPractice,
    toggleBookmark,
    getTrainingProgress,
  } = useSession();
  const timer = useTimer();

  const training = session.currentTraining;

  const [displayedId, setDisplayedId] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerKey | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    timer.reset();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (training && displayedId === null) {
      setDisplayedId(training.currentQuestionId); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [training, displayedId]);

  useEffect(() => {
    if (isLoaded && !training) router.replace("/antrenament");
  }, [isLoaded, training, router]);

  const currentQuestion = useMemo(
    () => (displayedId != null ? getQuestion(displayedId) ?? null : null),
    [displayedId],
  );

  const progress = getTrainingProgress();

  const handleSelect = useCallback(
    (answer: AnswerKey) => {
      if (showFeedback || !currentQuestion || !training) return;
      setSelectedAnswer(answer);
      const isCorrect = answer === currentQuestion.correctAnswer;
      answerTraining(currentQuestion.id, answer, isCorrect, timer.stop(), currentQuestion.subjectId);
      setShowFeedback(true);
    },
    [showFeedback, currentQuestion, training, answerTraining, timer],
  );

  const handleNext = useCallback(() => {
    if (!training) return;
    setDisplayedId(training.currentQuestionId);
    setSelectedAnswer(null);
    setShowFeedback(false);
    timer.reset();
  }, [training, timer]);

  const handleBookmark = useCallback(() => {
    if (currentQuestion) toggleBookmark(currentQuestion.id);
  }, [currentQuestion, toggleBookmark]);

  const uniqueSeen = useMemo(
    () => (training ? training.seenIds.filter((id) => getQuestion(id) !== undefined) : []),
    [training],
  );
  const wrongIds = useMemo(
    () => uniqueSeen.filter((id) => session.answers[id] && !session.answers[id].isCorrect),
    [uniqueSeen, session.answers],
  );

  const handleRedoWrong = useCallback(() => {
    if (wrongIds.length === 0) return;
    endTraining();
    const id = startPractice([], wrongIds, {
      shuffleOrder: true,
      shuffleOptions: session.settings.shuffleOptions,
      mode: "practice",
    });
    router.push(`/practica/${id}`);
  }, [wrongIds, endTraining, startPractice, session.settings.shuffleOptions, router]);

  const handleFinish = useCallback(() => {
    endTraining();
    router.push("/rezultate");
  }, [endTraining, router]);

  if (!isLoaded || !training || !currentQuestion || !progress) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Se încarcă">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-border-strong)] border-t-[var(--color-accent)]" />
      </div>
    );
  }

  const isBookmarked = session.bookmarks.includes(currentQuestion.id);
  const currentModule = modules.find((m) => m.id === currentQuestion.moduleId);
  const moduleColor = currentModule?.color || "var(--color-accent)";
  const masteredPct = progress.poolSize > 0 ? Math.round((progress.masteredCount / progress.poolSize) * 100) : 0;
  const seenPct = progress.poolSize > 0 ? Math.round((progress.seenCount / progress.poolSize) * 100) : 0;
  const wrongCount = progress.answeredCount - progress.correctCount;

  const uniqueCorrect = uniqueSeen.filter((id) => session.answers[id]?.isCorrect).length;
  const uniqueWrong = uniqueSeen.length - uniqueCorrect;
  const summaryAccuracy = formatPercentage(uniqueCorrect, uniqueSeen.length);

  return (
    <>
      <Header />
      <main className="relative py-4 sm:py-6 pb-24 md:pb-8 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-40" aria-hidden="true" />
        <Container narrow className="relative">
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-1.5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: moduleColor }} />
              <span className="text-xs sm:text-sm text-[var(--color-text-secondary)] truncate">
                Antrenament - {scopeLabel(training.subjectIds)}
              </span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-xs text-[var(--color-text-tertiary)] font-mono tabular-nums">{formatTime(timer.elapsed)}</span>
              <button
                onClick={() => setShowSummary(true)}
                aria-label="Încheie antrenamentul"
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[var(--radius-md)] text-xs sm:text-sm font-semibold border border-[var(--color-border-strong)] text-[var(--color-text-secondary)] bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)] transition-all cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                Încheie
              </button>
            </div>
          </div>

          <div className="mb-4 sm:mb-5">
            <div className="flex items-center justify-between mb-2 text-xs">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-correct)]" aria-hidden="true" />
                  <span className="text-[var(--color-correct)] font-semibold tabular-nums">{progress.correctCount}</span>
                  <span className="text-[var(--color-text-tertiary)]"><span className="hidden sm:inline">corecte</span><span className="sm:hidden" aria-hidden="true">✓</span></span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-wrong)]" aria-hidden="true" />
                  <span className="text-[var(--color-wrong)] font-semibold tabular-nums">{wrongCount}</span>
                  <span className="text-[var(--color-text-tertiary)]"><span className="hidden sm:inline">greșite</span><span className="sm:hidden" aria-hidden="true">✗</span></span>
                </span>
              </div>
              <span className="text-[var(--color-text-tertiary)] font-mono tabular-nums">
                Văzute {progress.seenCount}<span className="text-[var(--color-border-strong)] mx-1">·</span>Stăpânite {progress.masteredCount}<span className="text-[var(--color-border-strong)]">/</span>{progress.poolSize}
              </span>
            </div>
            <div className="relative h-2 rounded-full bg-[var(--color-bg-primary)] overflow-hidden" role="progressbar" aria-valuenow={progress.masteredCount} aria-valuemin={0} aria-valuemax={progress.poolSize} aria-label={`Stăpânite ${progress.masteredCount} din ${progress.poolSize}, văzute ${progress.seenCount}`}>
              {/* Faint fill = share of the pool you've seen; solid fill = mastered (always within seen). */}
              <div className="absolute inset-y-0 left-0 rounded-full bg-[var(--color-border-strong)] transition-all duration-500 ease-out" style={{ width: `${seenPct}%` }} />
              <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out" style={{ width: `${masteredPct}%`, background: "linear-gradient(90deg, var(--color-correct), var(--color-accent))" }} />
            </div>
          </div>

          <div className="relative -mx-4 sm:mx-0 px-4 py-4 sm:p-6 sm:rounded-[var(--radius-xl)] border-y sm:border border-[var(--color-border)] bg-[var(--color-bg-secondary)] overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 80% 35% at 50% 0%, ${moduleColor}, transparent)`, opacity: 0.04 }} />
            <div className="relative">
              <QuestionCard
                question={currentQuestion}
                questionNumber={progress.answeredCount + 1}
                selectedAnswer={selectedAnswer}
                showFeedback={showFeedback}
                isBookmarked={isBookmarked}
                onSelectAnswer={handleSelect}
                onBookmark={handleBookmark}
                optionOrder={training.optionOrder?.[currentQuestion.id]}
              />
            </div>
          </div>

          <div className="flex items-center mt-4 sm:mt-6">
            <button
              onClick={handleNext}
              disabled={!showFeedback}
              aria-label="Întrebarea următoare"
              className={cn(
                "flex items-center justify-center gap-1.5 h-11 sm:h-12 px-6 rounded-[var(--radius-md)] font-semibold text-sm transition-all duration-200 cursor-pointer ml-auto",
                "bg-[var(--color-accent)] text-[#0C0C0E] hover:bg-[var(--color-accent-hover)] active:scale-[0.97]",
                "shadow-[0_0_20px_rgba(232,166,49,0.1)] hover:shadow-[0_0_30px_rgba(232,166,49,0.2)]",
                "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none disabled:shadow-none",
              )}
              style={{ fontFamily: "var(--font-display)" }}
            >
              Următoarea
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 6 15 12 9 18" /></svg>
            </button>
          </div>
        </Container>
      </main>
      <MobileNav />

      <Modal open={showSummary} onClose={() => setShowSummary(false)} title="Rezumat Antrenament">
        <div className="space-y-5">
          {uniqueSeen.length > 0 && (
            <div className="relative text-center py-4 rounded-[var(--radius-lg)] bg-[var(--color-bg-primary)] overflow-hidden">
              <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 70% 50% at 50% 0%, ${summaryAccuracy >= 70 ? "var(--color-correct)" : summaryAccuracy >= 40 ? "var(--color-accent)" : "var(--color-wrong)"}, transparent)`, opacity: 0.08 }} />
              <span className="relative text-4xl sm:text-5xl font-extrabold" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em", color: summaryAccuracy >= 70 ? "var(--color-correct)" : summaryAccuracy >= 40 ? "var(--color-accent)" : "var(--color-wrong)" }}>
                {summaryAccuracy}%
              </span>
              <div className="relative text-xs text-[var(--color-text-tertiary)] mt-1.5 uppercase tracking-wider font-medium">Acuratețe</div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="relative p-3 sm:p-4 rounded-[var(--radius-md)] bg-[var(--color-bg-primary)] text-center overflow-hidden">
              <div className="relative text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{uniqueSeen.length}</div>
              <div className="relative text-[10px] sm:text-xs text-[var(--color-text-tertiary)] mt-1">Întrebări</div>
            </div>
            <div className="relative p-3 sm:p-4 rounded-[var(--radius-md)] bg-[var(--color-bg-primary)] text-center overflow-hidden border border-[var(--color-correct-border)]">
              <div className="relative text-xl sm:text-2xl font-bold text-[var(--color-correct)] tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{uniqueCorrect}</div>
              <div className="relative text-[10px] sm:text-xs text-[var(--color-text-tertiary)] mt-1">Corecte</div>
            </div>
            <div className="relative p-3 sm:p-4 rounded-[var(--radius-md)] bg-[var(--color-bg-primary)] text-center overflow-hidden border border-[var(--color-wrong-border)]">
              <div className="relative text-xl sm:text-2xl font-bold text-[var(--color-wrong)] tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{uniqueWrong}</div>
              <div className="relative text-[10px] sm:text-xs text-[var(--color-text-tertiary)] mt-1">Greșite</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-[var(--color-text-tertiary)] py-1 text-center">
            Ai stăpânit {progress.masteredCount} din {progress.poolSize} întrebări din materiile alese
          </div>
          <div className="flex flex-col gap-2.5 pt-1">
            {uniqueWrong > 0 && (
              <Button variant="primary" size="md" className="w-full py-3" onClick={handleRedoWrong}>
                Refă greșitele ({uniqueWrong})
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1 py-2.5" onClick={() => setShowSummary(false)}>Continuă</Button>
              <Button variant="primary" size="sm" className="flex-1 py-2.5" onClick={handleFinish}>
                Rezultate
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
