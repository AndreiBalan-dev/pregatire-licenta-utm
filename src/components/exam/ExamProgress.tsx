"use client";

import { cn } from "@/lib/utils";

interface ExamProgressProps {
  questionIds: number[];
  answers: Record<number, string>;
  currentIndex: number;
  onJump: (index: number) => void;
}

export function ExamProgress({ questionIds, answers, currentIndex, onJump }: ExamProgressProps) {
  const total = questionIds.length;
  const answeredCount = questionIds.filter((id) => answers[id]).length;
  const pct = total > 0 ? (answeredCount / total) * 100 : 0;

  return (
    <div className="w-full mb-4 sm:mb-5">
      {/* Counter row */}
      <div className="flex items-center justify-between mb-2 text-xs">
        <span className="text-[var(--color-text-tertiary)]">
          <span className="text-[var(--color-text-primary)] font-semibold tabular-nums">
            {answeredCount}
          </span>
          <span className="mx-1">din</span>
          <span className="tabular-nums">{total}</span>
          <span className="ml-1.5">răspunse</span>
        </span>
        <span className="text-[var(--color-text-tertiary)] tabular-nums font-mono">
          {Math.round(pct)}%
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="relative h-2 rounded-full bg-[var(--color-bg-primary)] overflow-hidden mb-3"
        role="progressbar"
        aria-valuenow={answeredCount}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        {pct > 0 && (
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, var(--color-accent), var(--color-accent-hover))",
              boxShadow: "0 0 12px rgba(232, 166, 49, 0.25)",
            }}
          />
        )}
      </div>

      {/* Dot navigation - full grid of 36 */}
      <nav aria-label="Navigare întrebări" className="flex flex-wrap gap-1 sm:gap-1.5 justify-center">
        {questionIds.map((qId, i) => {
          const isAnswered = !!answers[qId];
          const isCurrent = i === currentIndex;
          const status = isCurrent ? "curentă" : isAnswered ? "răspunsă" : "nerăspunsă";
          return (
            <button
              key={qId}
              onClick={() => onJump(i)}
              aria-label={`Întrebarea ${i + 1} - ${status}`}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "relative flex items-center justify-center transition-all duration-200 rounded-full cursor-pointer",
                "w-6 h-6 sm:w-7 sm:h-7",
                "hover:scale-110",
                isCurrent
                  ? "bg-[var(--color-accent)] shadow-[0_0_10px_rgba(232,166,49,0.4)] ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-[var(--color-bg-primary)]"
                  : isAnswered
                    ? "bg-[var(--color-accent-muted)] border border-[var(--color-accent)]"
                    : "bg-[var(--color-bg-primary)] border border-[var(--color-border-strong)] hover:border-[var(--color-text-tertiary)]",
              )}
            >
              <span
                className={cn(
                  "text-[9px] sm:text-[10px] font-bold tabular-nums",
                  isCurrent
                    ? "text-[#0C0C0E]"
                    : isAnswered
                      ? "text-[var(--color-accent)]"
                      : "text-[var(--color-text-tertiary)]",
                )}
                aria-hidden="true"
              >
                {i + 1}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
