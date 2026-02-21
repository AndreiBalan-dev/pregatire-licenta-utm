"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Container } from "@/components/layout/Container";
import { SubjectSelector } from "@/components/practice/SubjectSelector";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/hooks/useSession";
import { modules } from "@/data/modules";
import { questionsBySubject } from "@/data";

export default function PracticaPage() {
  const router = useRouter();
  const { startPractice, session } = useSession();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<"all" | 10 | 25 | 50>("all");

  const totalAvailable = useMemo(() => {
    return selectedSubjects.reduce((sum, sid) => {
      return sum + (questionsBySubject[sid]?.length || 0);
    }, 0);
  }, [selectedSubjects]);

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

    let allQuestionIds = selectedSubjects.flatMap((sid) =>
      (questionsBySubject[sid] || []).map((q) => q.id)
    );

    if (questionCount !== "all") {
      allQuestionIds = allQuestionIds.slice(0, questionCount);
    }

    const sessionId = startPractice(
      selectedSubjects,
      allQuestionIds,
      session.settings.shuffleOptions
    );
    router.push(`/practica/${sessionId}`);
  };

  return (
    <>
      <Header />
      <main className="py-8 pb-24 md:pb-8">
        <Container narrow>
          {/* Title */}
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

          {/* Subject selector */}
          <SubjectSelector
            selectedSubjects={selectedSubjects}
            onToggleSubject={toggleSubject}
            onSelectAllModule={selectAllModule}
            onDeselectAllModule={deselectAllModule}
          />

          {/* Config bar */}
          {selectedSubjects.length > 0 && (
            <div className="mt-6 p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {totalAvailable} întrebări disponibile
                  </span>

                  {/* Question count selector */}
                  <div className="flex items-center gap-2 mt-2">
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

                <Button onClick={handleStart} size="lg">
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
