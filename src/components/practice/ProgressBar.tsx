import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  total: number;
  correctCount: number;
  wrongCount: number;
}

export function ProgressBar({ current, total, correctCount, wrongCount }: ProgressBarProps) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  const correctPct = total > 0 ? (correctCount / total) * 100 : 0;
  const wrongPct = total > 0 ? (wrongCount / total) * 100 : 0;
  const hasCorrect = correctPct > 0;
  const hasWrong = wrongPct > 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2.5 text-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--color-correct)]" aria-hidden="true" />
            <span className="text-[var(--color-correct)] font-semibold">{correctCount}</span>
            <span className="text-[var(--color-text-tertiary)]">
              <span className="hidden sm:inline">corecte</span>
              <span className="sm:hidden" aria-hidden="true">✓</span>
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--color-wrong)]" aria-hidden="true" />
            <span className="text-[var(--color-wrong)] font-semibold">{wrongCount}</span>
            <span className="text-[var(--color-text-tertiary)]">
              <span className="hidden sm:inline">greșite</span>
              <span className="sm:hidden" aria-hidden="true">✗</span>
            </span>
          </span>
        </div>
        <span className="text-[var(--color-text-tertiary)] font-mono tabular-nums">
          {current}<span className="text-[var(--color-border-strong)]">/</span>{total}
        </span>
      </div>
      <div
        className="relative h-2 rounded-full bg-[var(--color-bg-primary)] overflow-hidden"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`Progres: ${current} din ${total} rezolvate, ${correctCount} corecte, ${wrongCount} greșite`}
      >
        {/* Correct segment */}
        {hasCorrect && (
          <div
            className={cn(
              "absolute inset-y-0 left-0 transition-all duration-500 ease-out",
              hasWrong ? "rounded-l-full" : "rounded-full",
            )}
            style={{
              width: `${correctPct}%`,
              background: "var(--color-correct)",
            }}
          />
        )}
        {/* Wrong segment */}
        {hasWrong && (
          <div
            className={cn(
              "absolute inset-y-0 transition-all duration-500 ease-out",
              hasCorrect ? "rounded-r-full" : "rounded-full",
            )}
            style={{
              left: `${correctPct}%`,
              width: `${wrongPct}%`,
              background: "var(--color-wrong)",
            }}
          />
        )}
        {/* Glow overlay */}
        {pct > 0 && (
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out opacity-20"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, var(--color-accent), var(--color-accent-hover))",
            }}
          />
        )}
      </div>
    </div>
  );
}
