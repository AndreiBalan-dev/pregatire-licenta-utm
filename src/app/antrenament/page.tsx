"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Container } from "@/components/layout/Container";
import { SubjectSelector } from "@/components/practice/SubjectSelector";
import { useSession } from "@/hooks/useSession";
import { questionsBySubject } from "@/data";
import { modules } from "@/data/modules";
import { masteredCount } from "@/lib/training";
import { cn } from "@/lib/utils";

export default function AntrenamentLanding() {
  const router = useRouter();
  const { session, startTraining, resetSubject, updateSettings } = useSession();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [shuffleOrder, setShuffleOrder] = useState(true);

  const training = session.currentTraining;

  const toggleSubject = (id: string) =>
    setSelectedSubjects((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  const selectAllModule = (moduleId: string) => {
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return;
    setSelectedSubjects((prev) => [...new Set([...prev, ...mod.subjects.map((s) => s.id)])]);
  };
  const deselectAllModule = (moduleId: string) => {
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return;
    const ids = new Set(mod.subjects.map((s) => s.id));
    setSelectedSubjects((prev) => prev.filter((s) => !ids.has(s)));
  };

  const { total, mastered } = useMemo(() => {
    const pool = selectedSubjects.flatMap((sid) => (questionsBySubject[sid] || []).map((q) => q.id));
    return { total: pool.length, mastered: masteredCount(pool, session.trainingBoxes ?? {}, session.answers) };
  }, [selectedSubjects, session.trainingBoxes, session.answers]);

  const handleStart = () => {
    if (selectedSubjects.length === 0) return;
    const id = startTraining(selectedSubjects, { shuffleOrder, shuffleOptions: session.settings.shuffleOptions });
    if (id) router.push(`/antrenament/${id}`);
  };

  return (
    <>
      <Header />
      <main className="relative py-8 pb-24 md:pb-8 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-40" aria-hidden="true" />
        <Container narrow className="relative">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2 animate-fade-in" style={{ fontFamily: "var(--font-display)" }}>
              Antrenament
            </h1>
            <p className="text-[var(--color-text-secondary)] animate-fade-in stagger-1">
              Exersezi în continuu, fără limită. Algoritmul îți readuce greșelile mai des și pe cele știute mai rar.
            </p>
          </div>

          {training && (
            <Link
              href="/antrenament/continua"
              className="group flex items-center gap-3 sm:gap-4 rounded-[var(--radius-lg)] border border-[var(--color-accent)] bg-[var(--color-bg-secondary)] p-3.5 sm:p-4 mb-8 transition-all duration-200 hover:bg-[var(--color-bg-hover)] animate-fade-in"
            >
              <span className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-border)]" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm sm:text-base font-bold text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-display)" }}>Continuă antrenamentul</div>
                <p className="text-[11px] sm:text-xs text-[var(--color-text-tertiary)] mt-0.5">{training.answeredCount} răspunse până acum - reia de unde ai rămas.</p>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-accent)] transition-colors" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
            </Link>
          )}

          <SubjectSelector
            selectedSubjects={selectedSubjects}
            onToggleSubject={toggleSubject}
            onSelectAllModule={selectAllModule}
            onDeselectAllModule={deselectAllModule}
            onResetSubject={resetSubject}
          />

          {selectedSubjects.length > 0 && (
            <div className="mt-10 animate-slide-up">
              <div className="relative rounded-[var(--radius-xl)] border border-[var(--color-border)] overflow-hidden" style={{ background: "linear-gradient(180deg, var(--color-bg-tertiary) 0%, var(--color-bg-secondary) 40%, var(--color-bg-secondary) 100%)" }}>
                <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 40% at 50% 0%, var(--color-accent), transparent)", opacity: 0.06 }} />
                <div className="relative px-6 pt-8 pb-6 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-accent)]" style={{ fontFamily: "var(--font-display)" }}>Antrenament Nou</span>
                  <div className="mt-3 flex items-baseline justify-center gap-3">
                    <span className="text-5xl sm:text-6xl font-extrabold text-[var(--color-text-primary)] tabular-nums" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>{total}</span>
                    <span className="text-base text-[var(--color-text-tertiary)] font-medium">în rotație</span>
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-4 text-xs text-[var(--color-text-tertiary)]">
                    <span>{selectedSubjects.length} {selectedSubjects.length === 1 ? "materie" : "materii"}</span>
                    {total > 0 && mastered > 0 && (
                      <>
                        <span className="w-px h-3 bg-[var(--color-border)]" />
                        <span className="text-[var(--color-correct)] font-medium">{mastered} stăpânite deja</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="relative px-6 pb-6 space-y-5">
                  <label className={cn("flex items-center gap-3.5 px-4 py-3.5 rounded-[var(--radius-lg)] cursor-pointer transition-all border", shuffleOrder ? "bg-[var(--color-accent-muted)] border-[var(--color-accent)]" : "bg-[var(--color-bg-primary)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]")}>
                    <button role="switch" aria-checked={shuffleOrder} aria-label="Amestecă ordinea întrebărilor" onClick={() => setShuffleOrder((v) => !v)} className={cn("relative w-10 h-[22px] rounded-full transition-all duration-200 cursor-pointer flex-shrink-0", shuffleOrder ? "bg-[var(--color-accent)]" : "bg-[var(--color-border-strong)]")}>
                      <span className={cn("absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200", shuffleOrder && "translate-x-[18px]")} />
                    </button>
                    <div className="min-w-0">
                      <span className="text-sm font-medium block text-[var(--color-text-secondary)]">Amestecă ordinea</span>
                      <span className="text-[11px] text-[var(--color-text-tertiary)]">Introdu întrebările noi într-o ordine aleatorie</span>
                    </div>
                  </label>

                  <label className={cn("flex items-center gap-3.5 px-4 py-3.5 rounded-[var(--radius-lg)] cursor-pointer transition-all border", session.settings.shuffleOptions ? "bg-[var(--color-accent-muted)] border-[var(--color-accent)]" : "bg-[var(--color-bg-primary)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]")}>
                    <button role="switch" aria-checked={session.settings.shuffleOptions} aria-label="Amestecă ordinea răspunsurilor" onClick={() => updateSettings({ shuffleOptions: !session.settings.shuffleOptions })} className={cn("relative w-10 h-[22px] rounded-full transition-all duration-200 cursor-pointer flex-shrink-0", session.settings.shuffleOptions ? "bg-[var(--color-accent)]" : "bg-[var(--color-border-strong)]")}>
                      <span className={cn("absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200", session.settings.shuffleOptions && "translate-x-[18px]")} />
                    </button>
                    <div className="min-w-0">
                      <span className="text-sm font-medium block text-[var(--color-text-secondary)]">Amestecă răspunsurile</span>
                      <span className="text-[11px] text-[var(--color-text-tertiary)]">Variantele apar în altă ordine de fiecare dată</span>
                    </div>
                  </label>

                  <button onClick={handleStart} className={cn("w-full py-4 rounded-[var(--radius-lg)] text-base font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5", "bg-[var(--color-accent)] text-[#0C0C0E] hover:bg-[var(--color-accent-hover)]", "shadow-[0_0_30px_rgba(232,166,49,0.15)] hover:shadow-[0_0_40px_rgba(232,166,49,0.25)]", "active:scale-[0.98]")} style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}>
                    Începe Antrenamentul
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
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
