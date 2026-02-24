"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Container } from "@/components/layout/Container";
import { SubjectSelector } from "@/components/practice/SubjectSelector";
import { useSession } from "@/hooks/useSession";
import { cn } from "@/lib/utils";
import { modules } from "@/data/modules";
import { questionsBySubject } from "@/data";

function PracticaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startPractice, resetSubject, session } = useSession();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  useEffect(() => {
    const modulParam = searchParams.get("modul");
    if (modulParam) {
      const mod = modules.find((m) => m.id === modulParam);
      if (mod) {
        setSelectedSubjects(mod.subjects.map((s) => s.id)); // eslint-disable-line react-hooks/set-state-in-effect
      }
    }
  }, [searchParams]);
  const [questionCount, setQuestionCount] = useState<"all" | 10 | 25 | 50>(
    "all",
  );
  const [onlyUnanswered, setOnlyUnanswered] = useState(false);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);

  const { totalAvailable, unansweredCount } = useMemo(() => {
    let total = 0;
    let unanswered = 0;
    for (const sid of selectedSubjects) {
      const questions = questionsBySubject[sid] || [];
      total += questions.length;
      unanswered += questions.filter((q) => !session.answers[q.id]).length;
    }
    return { totalAvailable: total, unansweredCount: unanswered };
  }, [selectedSubjects, session.answers]);

  const toggleSubject = (id: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const selectAllModule = (moduleId: string) => {
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return;
    const subjectIds = mod.subjects.map((s) => s.id);
    setSelectedSubjects((prev) => [...new Set([...prev, ...subjectIds])]);
  };

  const deselectAllModule = (moduleId: string) => {
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return;
    const subjectIds = new Set(mod.subjects.map((s) => s.id));
    setSelectedSubjects((prev) => prev.filter((s) => !subjectIds.has(s)));
  };

  const handleStart = () => {
    if (selectedSubjects.length === 0) return;

    const allQuestions = selectedSubjects.flatMap((sid) =>
      (questionsBySubject[sid] || []).filter(
        (q) => !onlyUnanswered || !session.answers[q.id],
      ),
    );

    if (allQuestions.length === 0) return;

    const sorted = allQuestions.sort((a, b) => {
      const aAnswered = session.answers[a.id] ? 1 : 0;
      const bAnswered = session.answers[b.id] ? 1 : 0;
      return aAnswered - bAnswered;
    });

    let questionIds = sorted.map((q) => q.id);
    const batchSize = questionCount === "all" ? null : questionCount;

    if (batchSize !== null) {
      questionIds = questionIds.slice(0, batchSize);
    }

    const sessionId = startPractice(
      selectedSubjects,
      questionIds,
      shuffleQuestions,
      batchSize,
    );
    router.push(`/practica/${sessionId}`);
  };

  return (
    <>
      <Header />
      <main className="relative py-8 pb-24 md:pb-8 overflow-hidden">
        <div
          className="absolute inset-0 grid-pattern opacity-40"
          aria-hidden="true"
        />
        <Container narrow className="relative">
          <div className="mb-10">
            <h1
              className="text-3xl font-bold text-[var(--color-text-primary)] mb-2 animate-fade-in"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Alege Materiile
            </h1>
            <p className="text-[var(--color-text-secondary)] animate-fade-in stagger-1">
              Selectează disciplinele pe care vrei să le exersezi.
            </p>
          </div>

          <SubjectSelector
            selectedSubjects={selectedSubjects}
            onToggleSubject={toggleSubject}
            onSelectAllModule={selectAllModule}
            onDeselectAllModule={deselectAllModule}
            onResetSubject={resetSubject}
          />

          {selectedSubjects.length > 0 && (
            <div className="mt-10 animate-slide-up">
              <div
                className="relative rounded-[var(--radius-xl)] border border-[var(--color-border)] overflow-hidden"
                style={{ background: "linear-gradient(180deg, var(--color-bg-tertiary) 0%, var(--color-bg-secondary) 40%, var(--color-bg-secondary) 100%)" }}
              >
                {/* Atmospheric glow */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse 70% 40% at 50% 0%, var(--color-accent), transparent)",
                    opacity: 0.06,
                  }}
                />

                {/* Stat centerpiece */}
                <div className="relative px-6 pt-8 pb-6 text-center">
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-accent)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Sesiune Nouă
                  </span>

                  <div className="mt-3 flex items-baseline justify-center gap-3">
                    <span
                      className="text-5xl sm:text-6xl font-extrabold text-[var(--color-text-primary)] tabular-nums"
                      style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
                    >
                      {onlyUnanswered ? unansweredCount : totalAvailable}
                    </span>
                    <span className="text-base text-[var(--color-text-tertiary)] font-medium">
                      {onlyUnanswered ? "nerezolvate" : "întrebări"}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-center gap-4 text-xs text-[var(--color-text-tertiary)]">
                    <span>{selectedSubjects.length} {selectedSubjects.length === 1 ? "materie" : "materii"}</span>
                    {totalAvailable > 0 && unansweredCount < totalAvailable && (
                      <>
                        <span className="w-px h-3 bg-[var(--color-border)]" />
                        <span className="text-[var(--color-accent)] font-medium">
                          {Math.round(((totalAvailable - unansweredCount) / totalAvailable) * 100)}% completat
                        </span>
                      </>
                    )}
                  </div>

                  {totalAvailable > 0 && (
                    <div className="mt-5 mx-auto max-w-xs h-1 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${Math.round(((totalAvailable - unansweredCount) / totalAvailable) * 100)}%`,
                          background: "linear-gradient(90deg, var(--color-accent), var(--color-accent-hover))",
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="relative px-6 pb-6 space-y-5">
                  {/* Toggle cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(() => {
                      const hasProgress = unansweredCount < totalAvailable;
                      const isDisabled = !hasProgress;
                      return (
                        <label
                          className={cn(
                            "flex items-center gap-3.5 px-4 py-3.5 rounded-[var(--radius-lg)] transition-all border",
                            isDisabled
                              ? "opacity-40 cursor-default bg-[var(--color-bg-primary)] border-[var(--color-border)]"
                              : onlyUnanswered
                                ? "cursor-pointer bg-[var(--color-accent-muted)] border-[var(--color-accent)] shadow-[0_0_20px_rgba(232,166,49,0.08)]"
                                : "cursor-pointer bg-[var(--color-bg-primary)] border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-hover)]"
                          )}
                        >
                          <button
                            role="switch"
                            aria-checked={!isDisabled && onlyUnanswered}
                            aria-label="Doar întrebări nerezolvate"
                            onClick={() => { if (!isDisabled) setOnlyUnanswered(!onlyUnanswered); }}
                            disabled={isDisabled}
                            className={cn(
                              "relative w-10 h-[22px] rounded-full transition-all duration-200 flex-shrink-0",
                              isDisabled
                                ? "bg-[var(--color-border)] cursor-default"
                                : onlyUnanswered
                                  ? "bg-[var(--color-accent)] cursor-pointer"
                                  : "bg-[var(--color-border-strong)] cursor-pointer"
                            )}
                          >
                            <span className={cn(
                              "absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                              !isDisabled && onlyUnanswered && "translate-x-[18px]"
                            )} />
                          </button>
                          <div className="min-w-0">
                            <span className={cn(
                              "text-sm font-medium block transition-colors",
                              isDisabled
                                ? "text-[var(--color-text-tertiary)]"
                                : onlyUnanswered
                                  ? "text-[var(--color-text-primary)]"
                                  : "text-[var(--color-text-secondary)]"
                            )}>
                              Doar nerezolvate
                            </span>
                            <span className="text-[11px] text-[var(--color-text-tertiary)]">
                              {hasProgress
                                ? `${unansweredCount} din ${totalAvailable} rămase`
                                : "Niciuna rezolvată încă"}
                            </span>
                          </div>
                        </label>
                      );
                    })()}

                    <label
                      className={cn(
                        "flex items-center gap-3.5 px-4 py-3.5 rounded-[var(--radius-lg)] cursor-pointer transition-all border",
                        shuffleQuestions
                          ? "bg-[var(--color-accent-muted)] border-[var(--color-accent)] shadow-[0_0_20px_rgba(232,166,49,0.08)]"
                          : "bg-[var(--color-bg-primary)] border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-hover)]"
                      )}
                    >
                      <button
                        role="switch"
                        aria-checked={shuffleQuestions}
                        aria-label="Amestecă ordinea întrebărilor"
                        onClick={() => setShuffleQuestions(!shuffleQuestions)}
                        className={`relative w-10 h-[22px] rounded-full transition-all duration-200 cursor-pointer flex-shrink-0 ${
                          shuffleQuestions
                            ? "bg-[var(--color-accent)]"
                            : "bg-[var(--color-border-strong)]"
                        }`}
                      >
                        <span className={`absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          shuffleQuestions ? "translate-x-[18px]" : ""
                        }`} />
                      </button>
                      <div className="min-w-0">
                        <span className={cn(
                          "text-sm font-medium block transition-colors",
                          shuffleQuestions ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"
                        )}>
                          Amestecă ordinea
                        </span>
                        <span className="text-[11px] text-[var(--color-text-tertiary)]">
                          Ordine aleatorie
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Batch size selector */}
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-tertiary)] mb-2.5 block">
                      Câte întrebări
                    </span>
                    <div className="flex gap-2">
                      {([10, 25, 50, "all"] as const).map((count) => (
                        <button
                          key={count}
                          onClick={() => setQuestionCount(count)}
                          className={cn(
                            "flex-1 py-2 rounded-[var(--radius-md)] text-sm font-semibold transition-all duration-200 cursor-pointer border",
                            questionCount === count
                              ? "bg-[var(--color-accent)] text-[#0C0C0E] border-[var(--color-accent)] shadow-[0_0_20px_rgba(232,166,49,0.12)]"
                              : "bg-[var(--color-bg-primary)] text-[var(--color-text-tertiary)] border-[var(--color-border)] hover:text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-hover)] active:scale-[0.97]"
                          )}
                          style={{ fontFamily: questionCount === count ? "var(--font-display)" : undefined }}
                        >
                          {count === "all" ? "Toate" : count}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Launch button */}
                  <button
                    onClick={handleStart}
                    disabled={onlyUnanswered && unansweredCount === 0}
                    className={cn(
                      "w-full py-4 rounded-[var(--radius-lg)] text-base font-bold transition-all duration-200 cursor-pointer",
                      "flex items-center justify-center gap-2.5",
                      "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
                      "bg-[var(--color-accent)] text-[#0C0C0E] hover:bg-[var(--color-accent-hover)]",
                      "shadow-[0_0_30px_rgba(232,166,49,0.15)] hover:shadow-[0_0_40px_rgba(232,166,49,0.25)]",
                      "active:scale-[0.98]"
                    )}
                    style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
                  >
                    Începe Practica
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </Container>
      </main>
      <MobileNav />
    </>
  );
}

export default function PracticaPage() {
  return (
    <Suspense>
      <PracticaContent />
    </Suspense>
  );
}
