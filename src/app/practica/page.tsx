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
        setSelectedSubjects(mod.subjects.map((s) => s.id));
      }
    }
  }, [searchParams]);
  const [questionCount, setQuestionCount] = useState<"all" | 10 | 25 | 50>("all");
  const [onlyUnanswered, setOnlyUnanswered] = useState(false);

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
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
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
      (questionsBySubject[sid] || [])
        .filter((q) => !onlyUnanswered || !session.answers[q.id])
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
      session.settings.shuffleOptions,
      batchSize
    );
    router.push(`/practica/${sessionId}`);
  };

  return (
    <>
      <Header />
      <main className="py-8 pb-24 md:pb-8">
        <Container narrow>
          <div className="mb-8">
            <h1
              className="text-3xl font-bold text-[var(--color-text-primary)] mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Alege Materiile
            </h1>
            <p className="text-[var(--color-text-secondary)]">
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
            <div className="mt-6 p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {onlyUnanswered ? unansweredCount : totalAvailable} întrebări{onlyUnanswered ? " nerezolvate" : " disponibile"}
                  </span>

                  {unansweredCount < totalAvailable && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <button
                        onClick={() => setOnlyUnanswered(!onlyUnanswered)}
                        className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${
                          onlyUnanswered ? "bg-[var(--color-accent)]" : "bg-[var(--color-border-strong)]"
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                          onlyUnanswered ? "translate-x-4" : ""
                        }`} />
                      </button>
                      <span className="text-xs text-[var(--color-text-tertiary)]">
                        Doar nerezolvate ({unansweredCount})
                      </span>
                    </label>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--color-text-tertiary)]">Câte:</span>
                    {([10, 25, 50, "all"] as const).map((count) => (
                      <button
                        key={count}
                        onClick={() => setQuestionCount(count)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                          questionCount === count
                            ? "bg-[var(--color-accent)] text-[#0C0C0E]"
                            : "bg-[var(--color-bg-primary)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                        }`}
                      >
                        {count === "all" ? "Toate" : count}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleStart}
                  size="lg"
                  disabled={onlyUnanswered && unansweredCount === 0}
                >
                  Începe Practica
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Button>
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
