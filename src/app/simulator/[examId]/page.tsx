"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { useSession } from "@/hooks/useSession";
import { getQuestion } from "@/data";
import { modules } from "@/data/modules";
import { cn } from "@/lib/utils";
import type { AnswerKey } from "@/data/types";

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
    getExamSummary,
  } = useSession();

  const [submitOpen, setSubmitOpen] = useState(false);
  const [restartOpen, setRestartOpen] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const exam = session.currentExam;
  const validExam = exam && exam.examId === examIdParam;

  useEffect(() => {
    if (isLoaded && !validExam && !navigating) {
      router.replace("/simulator");
    }
  }, [isLoaded, validExam, router, navigating]);

  const isReviewMode = validExam && exam.submittedAt !== null;
  const isActiveMode = validExam && exam.submittedAt === null;

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
      setExamAnswer(currentQuestion.id, answer);
    },
    [currentQuestion, setExamAnswer],
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
                <span className="text-xs text-[var(--color-text-tertiary)] truncate">
                  {currentSubject.icon} {currentSubject.name.split("(")[0].trim()}
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
                  showFeedback={false}
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
              <div className="mt-6 text-center">
                <span className="text-[11px] text-[var(--color-text-tertiary)]">
                  Poți reveni la orice întrebare. Nimic nu e definitiv până la <strong>Finalizează</strong>.
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
    const summary = getExamSummary();
    if (!summary) return null;

    return (
      <>
        <Header />
        <main id="top" className="relative py-6 sm:py-8 pb-24 md:pb-8 overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-40" aria-hidden="true" />
          <Container narrow className="relative space-y-6 sm:space-y-8">
            <div className="animate-fade-in">
              <ExamScore
                score={summary.score}
                correctCount={summary.correctCount}
                total={summary.total}
                durationMs={summary.durationMs}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5 animate-fade-in stagger-1">
              <Button variant="primary" size="lg" className="flex-1" onClick={() => setRestartOpen(true)}>
                Examen Nou
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
              </Button>
              <Button variant="secondary" size="lg" className="flex-1" onClick={() => router.push("/")}>
                Acasă
              </Button>
            </div>

            <div className="animate-fade-in stagger-2">
              <ExamModuleBreakdown perModule={summary.perModule} perSubject={summary.perSubject} />
            </div>

            <div className="animate-fade-in stagger-3">
              <ExamReview questionIds={exam.questionIds} answers={exam.answers} />
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
      </>
    );
  }

  return null;
}
