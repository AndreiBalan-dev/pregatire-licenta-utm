"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Container } from "@/components/layout/Container";
import { SubjectSelector } from "@/components/practice/SubjectSelector";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/hooks/useSession";
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
            <div className="mt-8 animate-slide-up">
              <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] overflow-hidden">
                {/* Hero stat area */}
                <div className="relative px-5 pt-6 pb-5 overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                      background:
                        "radial-gradient(ellipse 80% 60% at 50% 0%, var(--color-accent), transparent)",
                    }}
                  />
                  <div className="relative flex items-end justify-between gap-4">
                    <div>
                      <span
                        className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        Opțiuni Practică
                      </span>
                      <div className="flex items-baseline gap-2.5 mt-2">
                        <span
                          className="text-4xl font-extrabold text-[var(--color-text-primary)]"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {onlyUnanswered ? unansweredCount : totalAvailable}
                        </span>
                        <span className="text-sm text-[var(--color-text-secondary)]">
                          {onlyUnanswered ? "nerezolvate" : "întrebări"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right pb-1">
                      <span className="text-xs text-[var(--color-text-tertiary)]">
                        {selectedSubjects.length}{" "}
                        {selectedSubjects.length === 1 ? "materie" : "materii"}
                      </span>
                      {totalAvailable > 0 && (
                        <div className="mt-1.5 text-xs font-medium text-[var(--color-accent)]">
                          {Math.round(
                            ((totalAvailable - unansweredCount) /
                              totalAvailable) *
                              100,
                          )}
                          % completat
                        </div>
                      )}
                    </div>
                  </div>
                  {totalAvailable > 0 && (
                    <div className="relative mt-4 h-1.5 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.round(((totalAvailable - unansweredCount) / totalAvailable) * 100)}%`,
                          background:
                            "linear-gradient(90deg, var(--color-accent), var(--color-accent-hover))",
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="border-t border-[var(--color-border)] px-5 py-4 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    {unansweredCount < totalAvailable && (
                      <label className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-bg-primary)] cursor-pointer hover:bg-[var(--color-bg-hover)] transition-colors flex-1">
                        <button
                          onClick={() => setOnlyUnanswered(!onlyUnanswered)}
                          className={`relative w-9 h-5 rounded-full transition-all cursor-pointer flex-shrink-0 ${
                            onlyUnanswered
                              ? "bg-[var(--color-accent)] shadow-[0_0_12px_rgba(232,166,49,0.2)]"
                              : "bg-[var(--color-border-strong)]"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                              onlyUnanswered ? "translate-x-4" : ""
                            }`}
                          />
                        </button>
                        <div>
                          <span className="text-xs font-medium text-[var(--color-text-secondary)] block">
                            Doar nerezolvate
                          </span>
                          <span className="text-[10px] text-[var(--color-text-tertiary)]">
                            {unansweredCount} rămase
                          </span>
                        </div>
                      </label>
                    )}

                    <label className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-bg-primary)] cursor-pointer hover:bg-[var(--color-bg-hover)] transition-colors flex-1">
                      <button
                        onClick={() => setShuffleQuestions(!shuffleQuestions)}
                        className={`relative w-9 h-5 rounded-full transition-all cursor-pointer flex-shrink-0 ${
                          shuffleQuestions
                            ? "bg-[var(--color-accent)] shadow-[0_0_12px_rgba(232,166,49,0.2)]"
                            : "bg-[var(--color-border-strong)]"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                            shuffleQuestions ? "translate-x-4" : ""
                          }`}
                        />
                      </button>
                      <div>
                        <span className="text-xs font-medium text-[var(--color-text-secondary)] block">
                          Amestecă ordinea
                        </span>
                        <span className="text-[10px] text-[var(--color-text-tertiary)]">
                          Întrebări aleatorii
                        </span>
                      </div>
                    </label>
                  </div>

                  <div>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)] mb-2 block">
                      Câte întrebări
                    </span>
                    <div className="flex items-center gap-1.5">
                      {([10, 25, 50, "all"] as const).map((count) => (
                        <button
                          key={count}
                          onClick={() => setQuestionCount(count)}
                          className={`px-4 py-1.5 rounded-[var(--radius-md)] text-xs font-medium transition-all cursor-pointer border ${
                            questionCount === count
                              ? "bg-[var(--color-accent)] text-[#0C0C0E] border-[var(--color-accent)] shadow-[0_0_16px_rgba(232,166,49,0.15)]"
                              : "bg-[var(--color-bg-primary)] text-[var(--color-text-tertiary)] border-[var(--color-border)] hover:text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-hover)] active:scale-[0.97]"
                          }`}
                        >
                          {count === "all" ? "Toate" : count}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="border-t border-[var(--color-border)] px-5 py-4 bg-[var(--color-bg-tertiary)]/30">
                  <Button
                    onClick={handleStart}
                    size="lg"
                    disabled={onlyUnanswered && unansweredCount === 0}
                    className="w-full"
                  >
                    Începe Practica
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Button>
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
