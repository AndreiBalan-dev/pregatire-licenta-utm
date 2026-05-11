"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Container } from "@/components/layout/Container";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/hooks/useSession";
import { useResolvedTheme } from "@/hooks/useResolvedTheme";
import {
  EXAM_TOTAL_QUESTIONS,
  scoreGradientCss,
  scoreToColor,
  scorePositionPct,
} from "@/lib/exam";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "acum câteva secunde";
  if (min < 60) return `acum ${min} ${min === 1 ? "minut" : "minute"}`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `acum ${hours} ${hours === 1 ? "oră" : "ore"}`;
  const days = Math.floor(hours / 24);
  return `acum ${days} ${days === 1 ? "zi" : "zile"}`;
}

export default function SimulatorLandingPage() {
  const router = useRouter();
  const theme = useResolvedTheme();
  const { session, isLoaded, startExam, discardExam, getExamSummary } = useSession();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [navigating, setNavigating] = useState(false);

  if (!isLoaded || navigating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-border-strong)] border-t-[var(--color-accent)]" />
      </div>
    );
  }

  const exam = session.currentExam;
  const isActive = exam && exam.submittedAt === null;
  const isSubmitted = exam && exam.submittedAt !== null;
  const summary = isSubmitted ? getExamSummary() : null;

  const handleStart = () => {
    if (exam) {
      setConfirmOpen(true);
      return;
    }
    setNavigating(true);
    const examId = startExam();
    router.push(`/simulator/${examId}`);
  };

  const handleConfirmNew = () => {
    setNavigating(true);
    setConfirmOpen(false);
    discardExam();
    const examId = startExam();
    router.push(`/simulator/${examId}`);
  };

  const handleResume = () => {
    if (!exam) return;
    setNavigating(true);
    router.push(`/simulator/${exam.examId}`);
  };

  const answeredCount = isActive ? Object.keys(exam.answers).length : 0;

  return (
    <>
      <Header />
      <main className="relative py-8 pb-24 md:pb-8 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-40" aria-hidden="true" />
        <Container narrow className="relative">
          {/* Page header */}
          <div className="mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-4 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)] border-opacity-30 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" aria-hidden="true" />
              Simulator
            </div>
            <h1
              className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text-primary)] mb-3 animate-fade-in stagger-1"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
            >
              Examen <span className="text-[var(--color-accent)]">Licență</span>
            </h1>
            <p className="text-[var(--color-text-secondary)] max-w-xl leading-relaxed animate-fade-in stagger-2">
              36 de grile, ca la examenul real. Vezi cât ai lua pe scala 1-10.
            </p>
          </div>

          {/* Main action card — depends on state */}
          {!exam && (
            <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] animate-slide-up">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse 70% 50% at 50% 0%, var(--color-accent), transparent 60%)",
                  opacity: 0.07,
                }}
                aria-hidden="true"
              />
              <div className="relative p-6 sm:p-10 text-center">
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 max-w-md mx-auto">
                  <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
                    <div className="text-2xl font-extrabold text-[var(--color-accent)] tabular-nums" style={{ fontFamily: "var(--font-display)" }}>
                      36
                    </div>
                    <div className="text-[10px] sm:text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider mt-1">Grile</div>
                  </div>
                  <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
                    <div className="text-2xl font-extrabold text-[var(--color-accent)] tabular-nums" style={{ fontFamily: "var(--font-display)" }}>
                      9
                    </div>
                    <div className="text-[10px] sm:text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider mt-1">Per modul</div>
                  </div>
                  <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
                    <div className="text-2xl font-extrabold text-[var(--color-accent)]" style={{ fontFamily: "var(--font-display)" }}>
                      ∞
                    </div>
                    <div className="text-[10px] sm:text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider mt-1">Fără timp</div>
                  </div>
                </div>

                <button
                  onClick={handleStart}
                  className="inline-flex items-center justify-center gap-2.5 px-7 sm:px-8 py-3.5 sm:py-4 rounded-[var(--radius-lg)] text-sm sm:text-base font-bold transition-all duration-200 cursor-pointer bg-[var(--color-accent)] text-[#0C0C0E] hover:bg-[var(--color-accent-hover)] shadow-[0_0_30px_rgba(232,166,49,0.2)] hover:shadow-[0_0_40px_rgba(232,166,49,0.35)] active:scale-[0.98]"
                  style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
                >
                  Începe Simulator
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="9 6 15 12 9 18" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {isActive && (
            <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-bg-secondary)] animate-slide-up" style={{ borderColor: "rgba(232, 166, 49, 0.4)", borderWidth: 1, borderStyle: "solid" }}>
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, var(--color-accent), transparent 60%)", opacity: 0.1 }} aria-hidden="true" />
              <div className="relative p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" aria-hidden="true" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]" style={{ fontFamily: "var(--font-display)" }}>
                    În progres
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] mb-2" style={{ fontFamily: "var(--font-display)" }}>
                  Continuă de unde ai rămas
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] mb-5">
                  <span className="font-semibold text-[var(--color-text-primary)] tabular-nums">
                    {answeredCount}/{EXAM_TOTAL_QUESTIONS}
                  </span>{" "}
                  răspunse · început {timeAgo(exam.startedAt)}
                </p>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <Button variant="primary" size="lg" className="flex-1" onClick={handleResume}>
                    Continuă
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="9 6 15 12 9 18" />
                    </svg>
                  </Button>
                  <Button variant="ghost" size="lg" onClick={() => setConfirmOpen(true)}>
                    Renunță, începe altul
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isSubmitted && summary && (
            <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] animate-slide-up">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse 70% 50% at 50% 0%, ${scoreToColor(summary.score, theme)}, transparent 60%)`,
                  opacity: 0.1,
                }}
                aria-hidden="true"
              />
              <div className="relative p-6 sm:p-8">
                {/* Score + mini-bar — centered on mobile, side-by-side on desktop */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 sm:gap-8 mb-6">
                  <div className="text-center sm:text-left">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]" style={{ fontFamily: "var(--font-display)" }}>
                      Ultimul rezultat
                    </span>
                    <div className="mt-2 flex items-baseline justify-center sm:justify-start gap-1.5">
                      <span
                        className="text-5xl sm:text-6xl font-extrabold leading-none tabular-nums"
                        style={{
                          fontFamily: "var(--font-display)",
                          letterSpacing: "-0.03em",
                          color: scoreToColor(summary.score, theme),
                          textShadow: `0 0 30px ${scoreToColor(summary.score, theme)}55`,
                        }}
                      >
                        {summary.score.toFixed(2)}
                      </span>
                      <span className="text-xl font-bold text-[var(--color-text-tertiary)]">/10</span>
                    </div>
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-2">
                      {summary.correctCount}/{summary.total} corecte · {timeAgo(exam.submittedAt!)}
                    </p>
                  </div>

                  {/* Mini gradient indicator */}
                  <div className="w-full sm:w-40 flex-shrink-0">
                    <div className="relative">
                      <div
                        className="h-1.5 rounded-full overflow-hidden border border-[var(--color-border)]"
                        style={{ background: scoreGradientCss(theme) }}
                        aria-hidden="true"
                      />
                      <div
                        className="absolute top-1/2 w-2.5 h-2.5 rounded-full"
                        style={{
                          left: `${scorePositionPct(summary.score)}%`,
                          transform: "translate(-50%, -50%)",
                          background: scoreToColor(summary.score, theme),
                          boxShadow: `0 0 0 2px var(--color-bg-secondary), 0 0 8px ${scoreToColor(summary.score, theme)}AA`,
                        }}
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-1.5 flex justify-between text-[9px] font-mono text-[var(--color-text-tertiary)] tabular-nums">
                      <span>1.00</span>
                      <span>10.00</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <Button variant="primary" size="lg" className="flex-1" onClick={handleResume}>
                    Vezi Rezultatul
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="9 6 15 12 9 18" />
                    </svg>
                  </Button>
                  <Button variant="secondary" size="lg" className="flex-1 sm:flex-initial" onClick={() => setConfirmOpen(true)}>
                    Examen Nou
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Container>
      </main>
      <MobileNav />

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={isActive ? "Renunți la examenul curent?" : "Examen nou?"}
      >
        <div className="space-y-5">
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {isActive ? (
              <>
                Pierzi cele{" "}
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {answeredCount} răspunsuri
                </span>{" "}
                date până acum.
              </>
            ) : (
              <>Suprascrie rezultatul anterior. Continui?</>
            )}
          </p>
          <div className="flex gap-2.5 flex-col-reverse sm:flex-row">
            <Button variant="secondary" size="md" className="flex-1" onClick={() => setConfirmOpen(false)}>
              Înapoi
            </Button>
            <Button variant="primary" size="md" className="flex-1" onClick={handleConfirmNew}>
              {isActive ? "Da, renunță" : "Da, examen nou"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
