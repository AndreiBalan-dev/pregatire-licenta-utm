"use client";

import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Container } from "@/components/layout/Container";
import { ProgressRing } from "@/components/results/ProgressRing";
import { Card } from "@/components/ui/Card";
import { useSession } from "@/hooks/useSession";
import { modules } from "@/data/modules";
import { questionsBySubject, allQuestions } from "@/data";
import { cn, formatPercentage, formatTime } from "@/lib/utils";

export default function RezultatePage() {
  const { session, isLoaded, getOverallStats } = useSession();
  const stats = getOverallStats();

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
      <main className="py-8 pb-24 md:pb-8">
        <Container narrow>
          <h1
            className="text-3xl font-bold text-[var(--color-text-primary)] mb-8"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Rezultate
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className="p-6 flex flex-col items-center text-center">
              <ProgressRing
                value={stats.totalCorrect}
                max={stats.totalAnswered || 1}
                color="var(--color-correct)"
                label="Acuratețe"
              />
            </Card>
            <Card className="p-6 flex flex-col items-center justify-center text-center">
              <span
                className="text-4xl font-bold text-[var(--color-text-primary)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {stats.totalAnswered}
              </span>
              <span className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider mt-2">
                din {allQuestions.length} rezolvate
              </span>
              <div className="mt-3 h-1.5 w-full max-w-[120px] rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--color-accent)] transition-all"
                  style={{ width: `${formatPercentage(stats.totalAnswered, allQuestions.length)}%` }}
                />
              </div>
            </Card>
            <Card className="p-6 flex flex-col items-center justify-center text-center">
              <span
                className="text-4xl font-bold text-[var(--color-text-primary)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {formatTime(stats.totalTimeMs)}
              </span>
              <span className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider mt-2">
                Timp total
              </span>
            </Card>
          </div>

          <h2
            className="text-xl font-bold text-[var(--color-text-primary)] mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Pe Module
          </h2>

          <div className="space-y-3">
            {modules.map((mod) => {
              const moduleSubjects = mod.subjects;
              let modAnswered = 0;
              let modCorrect = 0;

              moduleSubjects.forEach((s) => {
                const questions = questionsBySubject[s.id] || [];
                questions.forEach((q) => {
                  const a = session.answers[q.id];
                  if (a) {
                    modAnswered++;
                    if (a.isCorrect) modCorrect++;
                  }
                });
              });

              const accuracy = formatPercentage(modCorrect, modAnswered);

              return (
                <Card key={mod.id} accent={mod.color} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3
                      className="font-bold text-[var(--color-text-primary)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {mod.name}
                    </h3>
                    {modAnswered > 0 && (
                      <span
                        className={cn(
                          "text-sm font-bold",
                          accuracy >= 70 ? "text-[var(--color-correct)]" :
                          accuracy >= 40 ? "text-[var(--color-accent)]" :
                          "text-[var(--color-wrong)]"
                        )}
                      >
                        {accuracy}%
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {moduleSubjects.map((subject) => {
                      const questions = questionsBySubject[subject.id] || [];
                      const answered = questions.filter((q) => session.answers[q.id]).length;
                      const correct = questions.filter((q) => session.answers[q.id]?.isCorrect).length;
                      const pct = formatPercentage(answered, questions.length);

                      return (
                        <div key={subject.id} className="flex items-center gap-3">
                          <span className="text-xs text-[var(--color-text-tertiary)] w-6 text-center flex-shrink-0">
                            {subject.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-[var(--color-text-secondary)] truncate">
                                {subject.name.split("(")[0].trim()}
                              </span>
                              <span className="text-[var(--color-text-tertiary)] flex-shrink-0 ml-2">
                                {correct}/{answered}/{questions.length}
                              </span>
                            </div>
                            <div className="h-1 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${pct}%`, backgroundColor: mod.color }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        </Container>
      </main>
      <MobileNav />
    </>
  );
}
