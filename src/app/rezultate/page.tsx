"use client";

import { useMemo, useState } from "react";
import type React from "react";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Container } from "@/components/layout/Container";
import { ProgressRing } from "@/components/results/ProgressRing";
import { SimulatorResultCard } from "@/components/results/SimulatorResultCard";
import { ExamHistoryModal } from "@/components/results/ExamHistoryModal";
import { SubjectIcon } from "@/components/ui/SubjectIcon";
import { useSession } from "@/hooks/useSession";
import { modules } from "@/data/modules";
import { questionsBySubject, allQuestions } from "@/data";
import { buildMergedAnswerMap } from "@/lib/answer-merge";
import { cn, formatPercentage, formatTime } from "@/lib/utils";

export default function RezultatePage() {
  const { session, isLoaded, getOverallStats, getExamSummary, getExamHistorySummaries, clearExamHistory } = useSession();
  const stats = getOverallStats();
  const exam = session.currentExam;
  const examSummary = exam && exam.submittedAt ? getExamSummary() : null;
  const examHistory = getExamHistorySummaries();
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  const mergedAnswers = useMemo(() => buildMergedAnswerMap(session), [session]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-border-strong)] border-t-[var(--color-accent)]" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="relative py-8 pb-24 md:pb-8 overflow-hidden">
        <div
          className="absolute inset-0 grid-pattern opacity-40"
          aria-hidden="true"
        />
        <Container narrow className="relative">
          <div className="mb-8 sm:mb-10">
            <h1
              className="text-3xl font-bold text-[var(--color-text-primary)] mb-2 animate-fade-in"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Rezultate
            </h1>
            <p className="text-[var(--color-text-secondary)] animate-fade-in stagger-1">
              Examen simulator și progresul pe practică.
            </p>
          </div>

          {/* Simulator section */}
          <section className="mb-6 sm:mb-8 animate-fade-in stagger-1">
            <SimulatorResultCard exam={exam} summary={examSummary} />
          </section>

          {/* History trigger if any */}
          {examHistory.length > 0 && (
            <section className="mb-10 sm:mb-12 animate-fade-in stagger-1">
              <button
                type="button"
                onClick={() => setHistoryModalOpen(true)}
                className="group w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-hover)] transition-all cursor-pointer text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-[var(--radius-md)] bg-[var(--color-bg-primary)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)] transition-colors">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 3v5h5" />
                      <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
                      <path d="M12 7v5l4 2" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
                      Istoric examene
                    </p>
                    <p className="text-[11px] sm:text-xs text-[var(--color-text-tertiary)]">
                      Ai dat <span className="font-semibold text-[var(--color-text-secondary)] tabular-nums">{examHistory.length}</span> {examHistory.length === 1 ? "examen" : "examene"} înainte. Vezi cum ai stat.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-wider text-[var(--color-accent)] group-hover:text-[var(--color-accent-hover)]" style={{ fontFamily: "var(--font-display)" }}>
                    Deschide
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-text-tertiary)] group-hover:text-[var(--color-accent)] transition-all group-hover:translate-x-0.5" aria-hidden="true">
                    <polyline points="9 6 15 12 9 18" />
                  </svg>
                </div>
              </button>
            </section>
          )}

          {/* Practica section header */}
          <div className="flex items-center gap-3 mb-5 sm:mb-6 animate-fade-in stagger-2 flex-wrap">
            <h2
              className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Statistici per Modul
            </h2>
            <span className="text-xs text-[var(--color-text-tertiary)]">
              practică și simulator combinate
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="relative rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6 flex flex-col items-center text-center overflow-hidden animate-slide-up">
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, var(--color-correct), transparent)", opacity: 0.05 }} />
              <div className="relative">
                <ProgressRing
                  value={stats.totalCorrect}
                  max={stats.totalAnswered || 1}
                  color="var(--color-correct)"
                  label="Acuratețe"
                />
              </div>
            </div>
            <div className="relative rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6 flex flex-col items-center justify-center text-center overflow-hidden animate-slide-up stagger-1">
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, var(--color-accent), transparent)", opacity: 0.05 }} />
              <span
                className="relative text-4xl font-extrabold text-[var(--color-text-primary)]"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
              >
                {stats.totalAnswered}
              </span>
              <span className="relative text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider mt-2">
                din {allQuestions.length} rezolvate
              </span>
              <div className="relative mt-3 h-1.5 w-full max-w-[120px] rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${formatPercentage(stats.totalAnswered, allQuestions.length)}%`, background: "linear-gradient(90deg, var(--color-accent), var(--color-accent-hover))" }}
                />
              </div>
            </div>
            <div className="relative rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6 flex flex-col items-center justify-center text-center overflow-hidden animate-slide-up stagger-2">
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, var(--color-info), transparent)", opacity: 0.05 }} />
              <span
                className="relative text-4xl font-extrabold text-[var(--color-text-primary)]"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
              >
                {formatTime(stats.totalTimeMs)}
              </span>
              <span className="relative text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider mt-2">
                Timp total
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {modules.map((mod, index) => {
              const moduleSubjects = mod.subjects;
              let modAnswered = 0;
              let modCorrect = 0;

              moduleSubjects.forEach((s) => {
                const questions = questionsBySubject[s.id] || [];
                questions.forEach((q) => {
                  const a = mergedAnswers.get(q.id);
                  if (a) {
                    modAnswered++;
                    if (a.isCorrect) modCorrect++;
                  }
                });
              });

              const accuracy = formatPercentage(modCorrect, modAnswered);

              const modTotal = moduleSubjects.reduce((sum, s) => sum + (questionsBySubject[s.id]?.length || 0), 0);
              const modPct = formatPercentage(modAnswered, modTotal);

              return (
                <div
                  key={mod.id}
                  className="relative rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] overflow-hidden module-card animate-slide-up"
                  style={{
                    "--module-color": mod.color,
                    borderLeftWidth: "3px",
                    borderLeftColor: mod.color,
                    animationDelay: `${(index + 3) * 60}ms`,
                  } as React.CSSProperties}
                >
                  {/* Subtle top glow */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse 70% 40% at 50% 0%, ${mod.color}, transparent)`,
                      opacity: 0.04,
                    }}
                  />

                  <div className="relative p-5">
                    {/* Module header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2 h-7 rounded-full"
                          style={{ backgroundColor: mod.color, boxShadow: `0 0 10px ${mod.color}40` }}
                        />
                        <div>
                          <h3
                            className="font-bold text-[var(--color-text-primary)]"
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            {mod.name}
                          </h3>
                          <span className="text-[11px] text-[var(--color-text-tertiary)]">
                            {modAnswered}/{modTotal} rezolvate
                          </span>
                        </div>
                      </div>
                      {modAnswered > 0 && (
                        <span
                          className={cn(
                            "text-sm font-bold px-3 py-1 rounded-full",
                            accuracy >= 70 ? "text-[var(--color-correct)] bg-[var(--color-correct-bg)]" :
                            accuracy >= 40 ? "text-[var(--color-accent)] bg-[var(--color-accent-muted)]" :
                            "text-[var(--color-wrong)] bg-[var(--color-wrong-bg)]"
                          )}
                        >
                          {accuracy}%
                        </span>
                      )}
                    </div>

                    {/* Module progress bar */}
                    <div className="mb-4">
                      <div className="h-2 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${modPct}%`,
                            background: `linear-gradient(90deg, ${mod.color}, ${mod.color}CC)`,
                            boxShadow: modPct > 0 ? `0 0 12px ${mod.color}30` : undefined,
                          }}
                        />
                      </div>
                    </div>

                    {/* Subjects */}
                    <div className="space-y-2">
                      {moduleSubjects.map((subject) => {
                        const questions = questionsBySubject[subject.id] || [];
                        const answered = questions.filter((q) => mergedAnswers.has(q.id)).length;
                        const correct = questions.filter((q) => mergedAnswers.get(q.id)?.isCorrect).length;
                        const pct = formatPercentage(answered, questions.length);
                        const subAccuracy = formatPercentage(correct, answered);

                        return (
                          <div key={subject.id} className="flex items-center gap-3 p-2 -mx-2 rounded-[var(--radius-md)] hover:bg-[var(--color-bg-hover)] transition-colors">
                            <span className="w-6 flex items-center justify-center flex-shrink-0 text-[var(--color-text-tertiary)]">
                              <SubjectIcon subjectId={subject.id} size={15} />
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between text-xs mb-1 gap-2">
                                <span className="text-[var(--color-text-secondary)] truncate">
                                  {subject.name.split("(")[0].trim()}
                                </span>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {answered > 0 && (
                                    <span className={cn(
                                      "text-[10px] font-semibold",
                                      subAccuracy >= 70 ? "text-[var(--color-correct)]" :
                                      subAccuracy >= 40 ? "text-[var(--color-accent)]" :
                                      "text-[var(--color-wrong)]"
                                    )}>
                                      {subAccuracy}%
                                    </span>
                                  )}
                                  <span className="text-[var(--color-text-tertiary)] font-mono text-[10px]">
                                    {answered}/{questions.length}
                                  </span>
                                </div>
                              </div>
                              <div className="h-1 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-700 ease-out"
                                  style={{ width: `${pct}%`, backgroundColor: mod.color }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </main>
      <MobileNav />

      <ExamHistoryModal
        open={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        history={examHistory}
        onClear={clearExamHistory}
      />
    </>
  );
}
