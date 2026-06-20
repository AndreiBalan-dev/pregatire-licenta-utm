"use client";

import { useMemo } from "react";
import { modules } from "@/data/modules";
import { ModuleCard } from "./ModuleCard";
import { Container } from "@/components/layout/Container";
import { useSession } from "@/hooks/useSession";
import { buildMergedAnswerMap } from "@/lib/answer-merge";
import { allQuestions, questionsByModule } from "@/data";

export function ModuleGrid() {
  const { session } = useSession();
  // Use the same merged answer map as the Practica and Rezultate pages so the
  // homepage module cards report the same "rezolvate" counts (not practica-only).
  const answeredMap = useMemo(() => buildMergedAnswerMap(session), [session]);

  return (
    <section className="py-8 sm:py-10">
      <Container>
        <div className="flex items-center gap-3 mb-8 animate-fade-in">
          <h2
            className="text-2xl font-bold text-[var(--color-text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Module
          </h2>
          <span className="text-xs font-medium text-[var(--color-accent)] bg-[var(--color-accent-muted)] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {allQuestions.length} întrebări
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 md:[grid-auto-rows:1fr] gap-4 sm:gap-5">
          {modules.map((mod, i) => {
            const moduleQuestions = questionsByModule[mod.id] || [];
            const answeredCount = moduleQuestions.filter(
              (q) => answeredMap.has(q.id)
            ).length;
            const correctCount = moduleQuestions.filter(
              (q) => answeredMap.get(q.id)?.isCorrect
            ).length;

            return (
              <ModuleCard
                key={mod.id}
                module={mod}
                totalQuestions={moduleQuestions.length}
                answeredCount={answeredCount}
                correctCount={correctCount}
                delay={i * 80}
              />
            );
          })}
        </div>
      </Container>
    </section>
  );
}
