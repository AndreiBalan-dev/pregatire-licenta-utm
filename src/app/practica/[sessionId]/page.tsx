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
import { ScopeSelector, OrderSelector, ShuffleAnswersToggle, type RedoScope, type OrderChoice } from "@/components/review/RedoControls";
import { SubjectIcon } from "@/components/ui/SubjectIcon";
import { useSession } from "@/hooks/useSession";
import { useTimer } from "@/hooks/useTimer";
import { getQuestion, questionsBySubject } from "@/data";
import { modules } from "@/data/modules";
import { cn, formatPercentage, formatTime } from "@/lib/utils";
import { wrongIdsInPractice } from "@/lib/redo";
import { buildRedoTargets, type RedoTarget } from "@/lib/redo-lineage";
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
    repeatExamFromIds,
    updatePracticeIndex,
    endPractice,
  } = useSession();
  const timer = useTimer();
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerKey | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryView, setSummaryView] = useState<"main" | "redo">("main");
  const [redoScope, setRedoScope] = useState<RedoScope>("wrong");
  const [redoOrder, setRedoOrder] = useState<OrderChoice>("same");
  const [redoShuffleAnswers, setRedoShuffleAnswers] = useState(false);
  const [dotRadius, setDotRadius] = useState(3);

  useEffect(() => {
    const update = () => setDotRadius(window.innerWidth >= 640 ? 5 : 3);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const practice = session.currentPractice;
  const isTest = practice?.mode === "test";

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
      // In test mode keep the question editable and never reveal correctness.
      setShowFeedback(!isTest);
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

  const wrongIdsThisSession = useMemo(() => {
    if (!practice) return [];
    return wrongIdsInPractice(practice, session.answers, (id) => getQuestion(id) !== undefined);
  }, [practice, session.answers]);

  // Questions actually answered this session (correct + wrong), in original order.
  const answeredIdsThisSession = useMemo(() => {
    if (!practice) return [];
    return practice.questionIds.filter((id) => {
      const a = session.answers[id];
      return !!a && a.answeredAt >= practice.startedAt && getQuestion(id) !== undefined;
    });
  }, [practice, session.answers]);

  const handleSelectAnswer = useCallback(
    (answer: AnswerKey) => {
      if (showFeedback || !currentQuestion) return;
      setSelectedAnswer(answer);

      if (isTest) {
        // Simulation: record the answer silently (no feedback). The user can
        // still change it until they advance; the score is shown at the end.
        const isCorrect = answer === currentQuestion.correctAnswer;
        answerQuestion(currentQuestion.id, answer, isCorrect, timer.stop(), currentQuestion.subjectId);
        return;
      }

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
    [showFeedback, currentQuestion, isTest, session.settings.showImmediateFeedback, answerQuestion, timer]
  );

  const goToNext = useCallback(() => {
    if (!practice) return;

    // Practice mode commits on "next" and reveals feedback before advancing.
    // Test mode already recorded the answer on selection, so it just advances.
    if (!isTest && !showFeedback && selectedAnswer && currentQuestion) {
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
  }, [practice, isTest, showFeedback, selectedAnswer, currentQuestion, answerQuestion, timer, updatePracticeIndex]);

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

    // Carry the same options into the next batch (answer-shuffle + mode).
    const newSessionId = startPractice(practice.subjectIds, batch, {
      shuffleOrder: false,
      batchSize,
      shuffleOptions: practice.optionOrder != null,
      mode: practice.mode,
    });
    setShowSummary(false);
    router.replace(`/practica/${newSessionId}`);
  }, [practice, session.answers, startPractice, router]);

  const openRedo = useCallback((scope: RedoScope) => {
    setRedoScope(scope);
    setRedoOrder("same");
    setRedoShuffleAnswers(practice?.optionOrder != null);
    setSummaryView("redo");
  }, [practice]);

  const startRedo = useCallback(() => {
    if (!practice) return;
    const ids =
      redoScope === "wrong"
        ? wrongIdsThisSession
        : redoScope === "answered"
          ? answeredIdsThisSession
          : practice.questionIds;
    if (ids.length === 0) return;
    const newId = startPractice([], ids, {
      shuffleOrder: redoOrder === "shuffled",
      shuffleOptions: redoShuffleAnswers,
      mode: practice.mode,
    });
    setShowSummary(false);
    setSummaryView("main");
    router.replace(`/practica/${newId}`);
  }, [practice, redoScope, redoOrder, redoShuffleAnswers, wrongIdsThisSession, answeredIdsThisSession, startPractice, router]);

  const lineage = practice?.redoLineage;
  const isRedo = !!lineage;

  const redoTargets = useMemo<RedoTarget[]>(
    () => (lineage ? buildRedoTargets({ wrongIds: wrongIdsThisSession, lineage }) : []),
    [lineage, wrongIdsThisSession],
  );

  const redoTargetLabel = useCallback(
    (target: RedoTarget): string => {
      const isExam = lineage?.origin.kind === "exam";
      if (target.role === "wrong") return `Refă greșitele (${target.ids.length})`;
      if (target.role === "initial")
        return isExam
          ? `Greșelile din simulare (${target.ids.length})`
          : `Greșelile din sesiune (${target.ids.length})`;
      return isExam
        ? `Refă toată simularea (${target.ids.length})`
        : `Refă sesiunea completă (${target.ids.length})`;
    },
    [lineage],
  );

  const handleRedoTarget = useCallback(
    (target: RedoTarget) => {
      if (!practice || !lineage) return;
      const carryShuffle = practice.optionOrder != null;
      if (target.role === "full") {
        if (lineage.origin.kind === "exam") {
          const newId = repeatExamFromIds(lineage.origin.questionIds, false, carryShuffle);
          if (!newId) return;
          setShowSummary(false);
          router.push(`/simulator/${newId}`);
        } else {
          const newId = startPractice(lineage.origin.subjectIds ?? [], lineage.origin.questionIds, {
            shuffleOrder: false,
            batchSize: lineage.origin.batchSize ?? null,
            shuffleOptions: carryShuffle,
            mode: practice.mode,
          });
          setShowSummary(false);
          router.replace(`/practica/${newId}`);
        }
        return;
      }
      // "wrong" or "initial": stay in the chain, propagate the same lineage.
      const newId = startPractice([], target.ids, {
        shuffleOrder: false,
        shuffleOptions: carryShuffle,
        mode: practice.mode,
        redoLineage: lineage,
      });
      setShowSummary(false);
      router.replace(`/practica/${newId}`);
    },
    [practice, lineage, repeatExamFromIds, startPractice, router],
  );

  useEffect(() => {
    if (isLoaded && !practice) {
      router.replace("/practica");
    }
  }, [isLoaded, practice, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Se încarcă">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-border-strong)] border-t-[var(--color-accent)]" />
      </div>
    );
  }

  if (!practice || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Se încarcă">
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

  // Redo scopes for the summary. Show each only when it's a distinct set:
  // "rezolvate" (answered) appears when you answered some-but-not-all with at
  // least one correct; "toată sesiunea" hides only if every question was wrong.
  const redoWrongCount = wrongIdsThisSession.length;
  const redoAnsweredCount = answeredIdsThisSession.length;
  const redoAllCount = practice.questionIds.length;
  const showRedoWrong = redoWrongCount > 0;
  const showRedoAnswered = redoAnsweredCount > redoWrongCount && redoAnsweredCount < redoAllCount;
  const showRedoAll = redoWrongCount < redoAllCount;

  return (
    <>
      <Header />
      <main className="relative py-4 sm:py-6 pb-24 md:pb-8 overflow-hidden">
        <div
          className="absolute inset-0 grid-pattern opacity-40"
          aria-hidden="true"
        />
        <Container narrow className="relative">
          {isTest && (
            <div className="mb-3 flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)] border-opacity-40"
                style={{ fontFamily: "var(--font-display)" }}
                title="Vezi rezultatul abia la final, ca la examen"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                Mod simulare
              </span>
            </div>
          )}
          {/* Top bar: subject + timer */}
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            {currentSubject && (
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-1.5 h-5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: moduleColor }}
                />
                <span className="text-xs sm:text-sm text-[var(--color-text-secondary)] inline-flex items-center gap-1.5 truncate">
                  <SubjectIcon subjectId={currentSubject.id} size={13} />
                  <span className="truncate">{currentSubject.name.split("(")[0].trim()}</span>
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
              neutral={isTest}
            />
          </div>

          {/* Question dot navigation - 7 dots on mobile (320px safe), 11 on desktop */}
          {(() => {
            const sliceStart = Math.max(0, practice.currentIndex - dotRadius);
            const sliceEnd = Math.min(practice.questionIds.length, practice.currentIndex + dotRadius + 1);
            const dotsBefore = sliceStart;
            const dotsAfter = practice.questionIds.length - sliceEnd;

            return (
              <nav className="flex items-center justify-center mb-4 sm:mb-6" aria-label="Navigare întrebări">
                <div className="flex items-center">
                  {dotsBefore > 0 && (
                    <span className="text-[10px] sm:text-[11px] text-[var(--color-text-tertiary)] mr-1 font-mono tabular-nums min-w-[22px] text-right" aria-hidden="true">
                      +{dotsBefore}
                    </span>
                  )}
                  {practice.questionIds.slice(sliceStart, sliceEnd).map((qId, i) => {
                    const actualIndex = sliceStart + i;
                    const raw = session.answers[qId];
                    const answered = raw && raw.answeredAt >= practice.startedAt ? raw : undefined;
                    const isCurrent = actualIndex === practice.currentIndex;
                    const statusLabel = isCurrent
                      ? "curentă"
                      : isTest
                        ? answered
                          ? "răspuns dat"
                          : "nerezolvată"
                        : answered?.isCorrect
                          ? "corect"
                          : answered
                            ? "greșit"
                            : "nerezolvată";
                    return (
                      <button
                        key={qId}
                        aria-label={`Întrebarea ${actualIndex + 1} - ${statusLabel}`}
                        aria-current={isCurrent ? "step" : undefined}
                        onClick={() => {
                          updatePracticeIndex(actualIndex);
                          setSelectedAnswer(null);
                          setShowFeedback(false);
                        }}
                        className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 cursor-pointer"
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "rounded-full transition-all duration-200",
                            isCurrent
                              ? "w-7 sm:w-8 h-2.5 sm:h-3 bg-[var(--color-accent)] shadow-[0_0_8px_rgba(232,166,49,0.3)]"
                              : "w-2.5 h-2.5 sm:w-3 sm:h-3 hover:scale-110",
                            // Test mode: neutral marker for answered (no correctness reveal)
                            !isCurrent && isTest && answered && "bg-[var(--color-accent)] opacity-70",
                            !isCurrent && isTest && !answered && "bg-[var(--color-border-strong)]",
                            // Practice mode: correct / wrong / unanswered
                            !isCurrent && !isTest && answered?.isCorrect && "bg-[var(--color-correct)]",
                            !isCurrent && !isTest && answered && !answered.isCorrect && "bg-[var(--color-wrong)]",
                            !isCurrent && !isTest && !answered && "bg-[var(--color-border-strong)]"
                          )}
                        />
                      </button>
                    );
                  })}
                  {dotsAfter > 0 && (
                    <span className="text-[10px] sm:text-[11px] text-[var(--color-text-tertiary)] ml-1 font-mono tabular-nums min-w-[22px]" aria-hidden="true">
                      +{dotsAfter}
                    </span>
                  )}
                </div>
              </nav>
            );
          })()}

          {/* Question card */}
          <div
            className="relative -mx-4 sm:mx-0 px-4 py-4 sm:p-6 sm:rounded-[var(--radius-xl)] border-y sm:border border-[var(--color-border)] bg-[var(--color-bg-secondary)] overflow-hidden"
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
                optionOrder={practice.optionOrder?.[currentQuestion.id]}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center mt-4 sm:mt-6 gap-2">
            <button
              onClick={goToPrev}
              disabled={practice.currentIndex <= 0}
              aria-label="Întrebarea anterioară"
              className={cn(
                "flex items-center justify-center gap-1.5 h-11 sm:h-12 px-3 sm:px-5 rounded-[var(--radius-md)] font-medium text-sm transition-all duration-200 cursor-pointer",
                "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] active:scale-[0.97]",
                "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
              )}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span className="hidden sm:inline">Anterioara</span>
            </button>

            <button
              onClick={() => setShowSummary(true)}
              aria-label="Încheie sesiunea"
              className="flex items-center justify-center gap-1.5 h-11 sm:h-12 px-3 sm:px-4 rounded-[var(--radius-md)] text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] active:scale-[0.97] mx-auto"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <span className="hidden sm:inline">Încheie sesiunea</span>
            </button>

            {(() => {
              const isLast = practice.currentIndex >= practice.questionIds.length - 1;
              return (
                <button
                  onClick={goToNext}
                  disabled={!isTest && !selectedAnswer && !showFeedback}
                  aria-label={isLast ? "Finalizează sesiunea" : "Întrebarea următoare"}
                  className={cn(
                    "flex items-center justify-center gap-1.5 h-11 sm:h-12 px-4 sm:px-6 rounded-[var(--radius-md)] font-semibold text-sm transition-all duration-200 cursor-pointer",
                    "bg-[var(--color-accent)] text-[#0C0C0E] hover:bg-[var(--color-accent-hover)] active:scale-[0.97]",
                    "shadow-[0_0_20px_rgba(232,166,49,0.1)] hover:shadow-[0_0_30px_rgba(232,166,49,0.2)]",
                    "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none disabled:shadow-none",
                    "ml-auto",
                  )}
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  <span className="hidden sm:inline">{isLast ? "Finalizează" : "Următoarea"}</span>
                  <span className="sm:hidden">{isLast ? "Gata" : "Următoarea"}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="9 6 15 12 9 18" />
                  </svg>
                </button>
              );
            })()}
          </div>
        </Container>
      </main>
      <MobileNav />

      {/* Summary Modal */}
      <Modal
        open={showSummary}
        onClose={() => { setShowSummary(false); setSummaryView("main"); }}
        onBack={summaryView === "redo" ? () => setSummaryView("main") : undefined}
        title={
          summaryView === "redo"
            ? (redoScope === "wrong" ? "Refă greșitele" : redoScope === "answered" ? "Refă rezolvate" : "Refă toată sesiunea")
            : (isTest ? "Rezultatul simulării" : "Rezumat Sesiune")
        }
      >
        {summaryView === "main" ? (
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
          <div className="flex flex-col gap-2.5 pt-1">
            {practiceStats.answered > 0 && (
              isRedo ? (
                <>
                  {redoTargets.map((target, i) => (
                    <Button
                      key={target.role}
                      variant={i === 0 ? "primary" : "secondary"}
                      size="md"
                      className="w-full py-3"
                      onClick={() => handleRedoTarget(target)}
                    >
                      {redoTargetLabel(target)}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                      </svg>
                    </Button>
                  ))}
                </>
              ) : (
                <>
                  {showRedoWrong && (
                    <Button
                      variant="primary"
                      size="md"
                      className="w-full py-3"
                      onClick={() => openRedo("wrong")}
                    >
                      Refă greșitele ({redoWrongCount})
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                      </svg>
                    </Button>
                  )}
                  {showRedoAnswered && (
                    <Button
                      variant={showRedoWrong ? "secondary" : "primary"}
                      size="md"
                      className="w-full py-3"
                      onClick={() => openRedo("answered")}
                    >
                      Refă rezolvate ({redoAnsweredCount})
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                      </svg>
                    </Button>
                  )}
                  {showRedoAll && (
                    <Button
                      variant={showRedoWrong || showRedoAnswered ? "secondary" : "primary"}
                      size="md"
                      className="w-full py-3"
                      onClick={() => openRedo("all")}
                    >
                      Refă toată sesiunea ({redoAllCount})
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                      </svg>
                    </Button>
                  )}
                </>
              )
            )}
            {remainingUnanswered > 0 && (
              <Button
                className="w-full py-3"
                onClick={handleContinueNextBatch}
              >
                <span className="hidden sm:inline">Următoarele {practice.batchSize ? Math.min(practice.batchSize, remainingUnanswered) : remainingUnanswered} întrebări</span>
                <span className="sm:hidden">Încă {practice.batchSize ? Math.min(practice.batchSize, remainingUnanswered) : remainingUnanswered} întrebări</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 6 15 12 9 18" />
                </svg>
              </Button>
            )}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 py-2.5 sm:py-2.5"
                onClick={() => setShowSummary(false)}
              >
                Înapoi
              </Button>
              <Button
                variant={remainingUnanswered > 0 ? "ghost" : "primary"}
                size="sm"
                className="flex-1 py-2.5 sm:py-2.5"
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
        ) : (
        <div className="space-y-5">
          <ScopeSelector
            scope={redoScope}
            onScope={setRedoScope}
            wrongCount={wrongIdsThisSession.length}
            allCount={practice.questionIds.length}
            allLabel="Toată sesiunea"
            answeredCount={showRedoAnswered ? answeredIdsThisSession.length : undefined}
          />
          <OrderSelector choice={redoOrder} onChoice={setRedoOrder} />
          <ShuffleAnswersToggle value={redoShuffleAnswers} onChange={setRedoShuffleAnswers} />
          <Button
            className="w-full py-3"
            onClick={startRedo}
            disabled={(redoScope === "wrong" ? wrongIdsThisSession.length : redoScope === "answered" ? answeredIdsThisSession.length : practice.questionIds.length) === 0}
          >
            Începe
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </Button>
        </div>
        )}
      </Modal>
    </>
  );
}
