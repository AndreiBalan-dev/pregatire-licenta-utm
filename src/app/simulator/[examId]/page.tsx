"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Container } from "@/components/layout/Container";
import { QuestionCard } from "@/components/practice/QuestionCard";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ExamHeader } from "@/components/exam/ExamHeader";
import { ExamProgress } from "@/components/exam/ExamProgress";
import { ExamSubmitModal } from "@/components/exam/ExamSubmitModal";
import { ExamScore } from "@/components/exam/ExamScore";
import { ExamModuleBreakdown } from "@/components/exam/ExamModuleBreakdown";
import { ExamReview } from "@/components/exam/ExamReview";
import { ExamRestartModal } from "@/components/exam/ExamRestartModal";
import { ExamRepeatBadge } from "@/components/exam/ExamRepeatBadge";
import { SubjectIcon } from "@/components/ui/SubjectIcon";
import { useSession } from "@/hooks/useSession";
import { getQuestion } from "@/data";
import { modules } from "@/data/modules";
import { cn } from "@/lib/utils";
import { computeScore } from "@/lib/exam";
import type { AnswerKey } from "@/data/types";
import type { ExamState } from "@/lib/session-types";

function summarizeExam(exam: ExamState) {
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
}

export default function SimulatorExamPage() {
  const router = useRouter();
  const params = useParams<{ examId: string }>();
  const examIdParam = params.examId;
  const {
    session,
    isLoaded,
    setExamAnswer,
    setExamIndex,
    submitExam,
    discardExam,
    startExam,
    restartSameExam,
    getExamSummary,
  } = useSession();

  const [submitOpen, setSubmitOpen] = useState(false);
  const [restartOpen, setRestartOpen] = useState(false);
  const [redoOpen, setRedoOpen] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const { exam, isHistorical } = useMemo(() => {
    const current = session.currentExam;
    if (current && current.examId === examIdParam) {
      return { exam: current, isHistorical: false };
    }
    const hist = (session.examHistory ?? []).find((e) => e.examId === examIdParam);
    if (hist) {
      return { exam: hist, isHistorical: true };
    }
    return { exam: null as ExamState | null, isHistorical: false };
  }, [session.currentExam, session.examHistory, examIdParam]);
  const validExam = exam !== null;

  useEffect(() => {
    if (isLoaded && !validExam && !navigating) {
      router.replace("/simulator");
    }
  }, [isLoaded, validExam, router, navigating]);

  const isReviewMode = validExam && exam.submittedAt !== null;
  const isActiveMode = validExam && !isHistorical && exam.submittedAt === null;
  const liveFeedbackEnabled = !!(validExam && !isHistorical && exam.showFeedback);
  const isRepeatSession = !!(validExam && exam.isRepeat);

  const currentQuestion = useMemo(() => {
    if (!isActiveMode) return null;
    const qId = exam!.questionIds[exam!.currentIndex];
    return getQuestion(qId) || null;
  }, [exam, isActiveMode]);

  const selectedAnswer = useMemo<AnswerKey | null>(() => {
    if (!currentQuestion || !exam) return null;
    return (exam.answers[currentQuestion.id] as AnswerKey | undefined) ?? null;
  }, [currentQuestion, exam]);

  const handleSelectAnswer = useCallback(
    (answer: AnswerKey) => {
      if (!currentQuestion) return;
      // When live feedback is on, an answered question is locked.
      // QuestionCard already disables clicks if showFeedback=true, but guard here too.
      if (liveFeedbackEnabled && selectedAnswer !== null) return;
      setExamAnswer(currentQuestion.id, answer);
    },
    [currentQuestion, setExamAnswer, liveFeedbackEnabled, selectedAnswer],
  );

  const goToPrev = useCallback(() => {
    if (!exam) return;
    setExamIndex(exam.currentIndex - 1);
  }, [exam, setExamIndex]);

  const goToNext = useCallback(() => {
    if (!exam) return;
    setExamIndex(exam.currentIndex + 1);
  }, [exam, setExamIndex]);

  const handleSubmit = useCallback(() => {
    submitExam();
    setSubmitOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [submitExam]);

  const handleNewExam = useCallback(() => {
    setNavigating(true);
    setRestartOpen(false);
    discardExam();
    const newId = startExam();
    router.push(`/simulator/${newId}`);
  }, [discardExam, startExam, router]);

  const handleRedoSameExam = useCallback(
    (shuffleOrder: boolean) => {
      const newId = restartSameExam(shuffleOrder);
      if (!newId) return;
      setNavigating(true);
      setRedoOpen(false);
      router.push(`/simulator/${newId}`);
    },
    [restartSameExam, router],
  );

  if (!isLoaded || !validExam || navigating) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Se încarcă">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-border-strong)] border-t-[var(--color-accent)]" />
      </div>
    );
  }

  // ============= ACTIVE EXAM MODE =============
  if (isActiveMode && currentQuestion) {
    const currentModule = modules.find((m) => m.id === currentQuestion.moduleId);
    const currentSubject = currentModule?.subjects.find((s) => s.id === currentQuestion.subjectId);
    const moduleColor = currentModule?.color || "var(--color-accent)";
    const isLast = exam.currentIndex >= exam.questionIds.length - 1;
    const answeredCount = Object.keys(exam.answers).length;
    // Show feedback when live mode is on AND user has committed an answer for this question.
    const showQuestionFeedback = liveFeedbackEnabled && selectedAnswer !== null;

    return (
      <>
        <Header />
        <main id="top" className="relative py-4 sm:py-6 pb-24 md:pb-8 overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-40" aria-hidden="true" />
          <Container narrow className="relative">
            <ExamHeader
              currentIndex={exam.currentIndex}
              total={exam.questionIds.length}
              startedAt={exam.startedAt}
              onFinish={() => setSubmitOpen(true)}
            />

            {/* Mode indicators row */}
            {(liveFeedbackEnabled || isRepeatSession) && (
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {liveFeedbackEnabled && (
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.15em] bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)] border-opacity-40"
                    style={{ fontFamily: "var(--font-display)" }}
                    title="Răspunsul tău se blochează imediat ce îl alegi"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                    Feedback instant
                  </span>
                )}
                {isRepeatSession && <ExamRepeatBadge size="sm" shuffled={exam.repeatShuffled} />}
              </div>
            )}

            <ExamProgress
              questionIds={exam.questionIds}
              answers={exam.answers}
              currentIndex={exam.currentIndex}
              onJump={(index) => setExamIndex(index)}
            />

            {/* Subject indicator */}
            {currentSubject && (
              <div className="flex items-center gap-2 mb-3 px-1">
                <span
                  className="w-1.5 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: moduleColor }}
                  aria-hidden="true"
                />
                <span className="text-xs text-[var(--color-text-tertiary)] inline-flex items-center gap-1.5 truncate">
                  <SubjectIcon subjectId={currentSubject.id} size={12} />
                  <span className="truncate">{currentSubject.name.split("(")[0].trim()}</span>
                </span>
              </div>
            )}

            {/* Question card */}
            <div className="relative -mx-4 sm:mx-0 px-4 py-4 sm:p-6 sm:rounded-[var(--radius-xl)] border-y sm:border border-[var(--color-border)] bg-[var(--color-bg-secondary)] overflow-hidden">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse 80% 35% at 50% 0%, ${moduleColor}, transparent)`,
                  opacity: 0.04,
                }}
                aria-hidden="true"
              />
              <div className="relative">
                <QuestionCard
                  question={currentQuestion}
                  questionNumber={exam.currentIndex + 1}
                  totalQuestions={exam.questionIds.length}
                  selectedAnswer={selectedAnswer}
                  showFeedback={showQuestionFeedback}
                  isBookmarked={false}
                  onSelectAnswer={handleSelectAnswer}
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2 mt-4 sm:mt-6">
              <button
                onClick={goToPrev}
                disabled={exam.currentIndex <= 0}
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

              <div className="flex-1" />

              {isLast ? (
                <button
                  onClick={() => setSubmitOpen(true)}
                  aria-label="Finalizează examenul"
                  className={cn(
                    "flex items-center justify-center gap-1.5 h-11 sm:h-12 px-5 sm:px-7 rounded-[var(--radius-md)] font-bold text-sm transition-all duration-200 cursor-pointer",
                    "bg-[var(--color-accent)] text-[#0C0C0E] hover:bg-[var(--color-accent-hover)] active:scale-[0.97]",
                    "shadow-[0_0_20px_rgba(232,166,49,0.15)] hover:shadow-[0_0_30px_rgba(232,166,49,0.25)]",
                  )}
                  style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
                >
                  Finalizează
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={goToNext}
                  aria-label="Întrebarea următoare"
                  className={cn(
                    "flex items-center justify-center gap-1.5 h-11 sm:h-12 px-4 sm:px-6 rounded-[var(--radius-md)] font-semibold text-sm transition-all duration-200 cursor-pointer",
                    "bg-[var(--color-accent)] text-[#0C0C0E] hover:bg-[var(--color-accent-hover)] active:scale-[0.97]",
                    "shadow-[0_0_20px_rgba(232,166,49,0.1)] hover:shadow-[0_0_30px_rgba(232,166,49,0.2)]",
                  )}
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Următoarea
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="9 6 15 12 9 18" />
                  </svg>
                </button>
              )}
            </div>

            {/* Hint about unanswered */}
            {answeredCount < exam.questionIds.length && (
              <div className="mt-6 text-center px-2">
                <span className="text-[11px] text-[var(--color-text-tertiary)] leading-relaxed">
                  {liveFeedbackEnabled ? (
                    <>Răspunsul se blochează când îl alegi. Trimite cu <strong>Finalizează</strong> când ai răspuns la toate.</>
                  ) : (
                    <>Poți reveni la orice întrebare. Nimic nu e definitiv până la <strong>Finalizează</strong>.</>
                  )}
                </span>
              </div>
            )}
          </Container>
        </main>
        <MobileNav />

        <ExamSubmitModal
          open={submitOpen}
          answeredCount={answeredCount}
          total={exam.questionIds.length}
          onConfirm={handleSubmit}
          onCancel={() => setSubmitOpen(false)}
        />
      </>
    );
  }

  // ============= REVIEW / RESULT MODE =============
  if (isReviewMode) {
    const summary = isHistorical ? summarizeExam(exam) : getExamSummary();
    if (!summary) return null;

    return (
      <>
        <Header />
        <main id="top" className="relative py-6 sm:py-8 pb-24 md:pb-8 overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-40" aria-hidden="true" />
          <Container narrow className="relative space-y-6 sm:space-y-8">
            {/* Historical banner */}
            {isHistorical && (
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3 sm:p-3.5 flex items-center gap-3 animate-fade-in">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-[var(--color-text-primary)]">
                    Examen din istoric
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-[var(--color-text-tertiary)]">
                    Vezi rezultatele unui examen mai vechi. Acțiunile de mai jos pornesc un examen nou.
                  </p>
                </div>
                <Link
                  href="/rezultate"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Rezultate
                </Link>
              </div>
            )}

            <div className="animate-fade-in">
              <ExamScore
                score={summary.score}
                correctCount={summary.correctCount}
                total={summary.total}
                durationMs={summary.durationMs}
                isRepeat={isRepeatSession}
                repeatShuffled={exam.repeatShuffled}
              />
            </div>

            {/* Actions */}
            <div className="space-y-2.5 animate-fade-in stagger-1">
              <div className="flex flex-col sm:flex-row gap-2.5">
                {!isHistorical && (
                  <Button variant="primary" size="lg" className="flex-1" onClick={() => setRedoOpen(true)}>
                    Re-fă acest examen
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="1 4 1 10 7 10" />
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    </svg>
                  </Button>
                )}
                <Button
                  variant={isHistorical ? "primary" : "secondary"}
                  size="lg"
                  className="flex-1"
                  onClick={() => setRestartOpen(true)}
                >
                  {isHistorical ? "Pornește un Simulator Nou" : "Examen Nou"}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Button>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => router.push("/rezultate")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                  Rezultate
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  Acasă
                </button>
              </div>
            </div>

            {/* Helpful explanation for "Re-fă acest examen" - only for current submitted exam */}
            {!isHistorical && (
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3.5 sm:p-4 animate-fade-in stagger-1">
                <div className="flex items-start gap-2.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <p className="text-[11px] sm:text-xs leading-relaxed text-[var(--color-text-tertiary)]">
                    <span className="text-[var(--color-text-secondary)] font-medium">Re-fă acest examen</span> îți dă aceleași 36 de grile, ca să corectezi exact ce ai greșit.
                    <span className="text-[var(--color-text-secondary)] font-medium"> Examen Nou</span> alege alte 36 de grile, balansate din toate modulele.
                  </p>
                </div>
              </div>
            )}

            <div className="animate-fade-in stagger-2">
              <ExamModuleBreakdown perModule={summary.perModule} perSubject={summary.perSubject} />
            </div>

            <div className="animate-fade-in stagger-3">
              <ExamReview questionIds={exam.questionIds} answers={exam.answers} isRepeat={isRepeatSession} repeatShuffled={exam.repeatShuffled} />
            </div>
          </Container>
        </main>
        <MobileNav />

        <Modal
          open={restartOpen}
          onClose={() => setRestartOpen(false)}
          title="Examen nou?"
        >
          <div className="space-y-5">
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Suprascrie rezultatul actual cu un examen nou. Alte 36 de grile, selectate aleator.
            </p>
            <div className="flex gap-2.5 flex-col-reverse sm:flex-row">
              <Button variant="secondary" size="md" className="flex-1" onClick={() => setRestartOpen(false)}>
                Înapoi
              </Button>
              <Button variant="primary" size="md" className="flex-1" onClick={handleNewExam}>
                Da, examen nou
              </Button>
            </div>
          </div>
        </Modal>

        <ExamRestartModal
          open={redoOpen}
          onCancel={() => setRedoOpen(false)}
          onConfirm={handleRedoSameExam}
        />
      </>
    );
  }

  return null;
}
