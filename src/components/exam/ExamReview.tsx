"use client";

import { useMemo } from "react";
import { modules } from "@/data/modules";
import { getQuestion } from "@/data";
import { QuestionCard } from "@/components/practice/QuestionCard";
import { ExamRepeatBadge } from "@/components/exam/ExamRepeatBadge";
import { cn } from "@/lib/utils";
import type { AnswerKey } from "@/data/types";

interface ExamReviewProps {
  questionIds: number[];
  answers: Record<number, "a" | "b" | "c" | "d">;
  isRepeat?: boolean;
  repeatShuffled?: boolean;
}

function anchorIdFor(moduleId: string): string {
  return `exam-review-${moduleId}`;
}

export function ExamReview({ questionIds, answers, isRepeat, repeatShuffled }: ExamReviewProps) {
  const items = useMemo(() => {
    const seenModules = new Set<string>();
    return questionIds.map((qId, index) => {
      const q = getQuestion(qId);
      const moduleId = q?.moduleId;
      const isFirstOfModule = moduleId && !seenModules.has(moduleId);
      if (moduleId) seenModules.add(moduleId);
      return { qId, q, index, anchorId: isFirstOfModule && moduleId ? anchorIdFor(moduleId) : undefined };
    });
  }, [questionIds]);

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2
            className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Revizuire completă
          </h2>
          {isRepeat && <ExamRepeatBadge size="sm" shuffled={repeatShuffled} />}
        </div>
        <span className="text-xs text-[var(--color-text-tertiary)]">
          Toate {questionIds.length} întrebările cu răspunsurile tale și cele corecte
        </span>
      </div>

      {/* Jump-to-module bar */}
      <div className="flex flex-wrap gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-2">
        {modules.map((mod) => (
          <a
            key={mod.id}
            href={`#${anchorIdFor(mod.id)}`}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors"
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: mod.color, boxShadow: `0 0 6px ${mod.color}66` }}
              aria-hidden="true"
            />
            {mod.name}
          </a>
        ))}
      </div>

      {/* Question list */}
      <div className="space-y-4">
        {items.map(({ qId, q, index, anchorId }) => {
          if (!q) return null;
          const selected = (answers[qId] as AnswerKey | undefined) ?? null;
          const wasCorrect = selected !== null && selected === q.correctAnswer;
          const wasWrong = selected !== null && !wasCorrect;
          const unanswered = selected === null;

          const mod = modules.find((m) => m.id === q.moduleId);
          const subject = mod?.subjects.find((s) => s.id === q.subjectId);
          const moduleColor = mod?.color || "var(--color-accent)";

          return (
            <div
              key={qId}
              id={anchorId}
              className="relative scroll-mt-20 rounded-[var(--radius-xl)] border bg-[var(--color-bg-secondary)] overflow-hidden"
              style={{
                borderColor: wasCorrect
                  ? "var(--color-correct-border)"
                  : wasWrong
                    ? "var(--color-wrong-border)"
                    : "var(--color-border)",
              }}
            >
              {/* Top status strip */}
              <div
                className="absolute top-0 inset-x-0 h-0.5"
                style={{
                  background: wasCorrect
                    ? "var(--color-correct)"
                    : wasWrong
                      ? "var(--color-wrong)"
                      : "var(--color-text-tertiary)",
                  opacity: 0.5,
                }}
                aria-hidden="true"
              />

              {/* Subject + status header */}
              <div className="flex items-center justify-between gap-3 px-4 sm:px-6 pt-5 pb-2 flex-wrap">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-1 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: moduleColor }}
                  />
                  <span className="text-[11px] sm:text-xs text-[var(--color-text-tertiary)] truncate">
                    {subject?.icon} {subject?.name.split("(")[0].trim()}
                  </span>
                </div>
                <span
                  className={cn(
                    "text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full",
                    wasCorrect && "text-[var(--color-correct)] bg-[var(--color-correct-bg)]",
                    wasWrong && "text-[var(--color-wrong)] bg-[var(--color-wrong-bg)]",
                    unanswered && "text-[var(--color-text-tertiary)] bg-[var(--color-bg-primary)] border border-[var(--color-border)]",
                  )}
                >
                  {wasCorrect && "Corect"}
                  {wasWrong && "Greșit"}
                  {unanswered && "Fără răspuns"}
                </span>
              </div>

              <div className="px-4 sm:px-6 pb-5 pt-2">
                <QuestionCard
                  question={q}
                  questionNumber={index + 1}
                  totalQuestions={questionIds.length}
                  selectedAnswer={selected}
                  showFeedback={true}
                  isBookmarked={false}
                  onSelectAnswer={() => {}}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Back to top */}
      <div className="pt-4 flex justify-center">
        <a
          href="#top"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] text-xs font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="18 15 12 9 6 15" />
          </svg>
          Înapoi sus
        </a>
      </div>
    </section>
  );
}
