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

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2.5 text-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--color-correct)]" />
            <span className="text-[var(--color-correct)] font-semibold">{correctCount}</span>
            <span className="text-[var(--color-text-tertiary)] hidden sm:inline">corecte</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--color-wrong)]" />
            <span className="text-[var(--color-wrong)] font-semibold">{wrongCount}</span>
            <span className="text-[var(--color-text-tertiary)] hidden sm:inline">greșite</span>
          </span>
        </div>
        <span className="text-[var(--color-text-tertiary)] font-mono tabular-nums">
          {current}<span className="text-[var(--color-border-strong)]">/</span>{total}
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
        {/* Correct segment */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${correctPct}%`,
            background: "var(--color-correct)",
          }}
        />
        {/* Wrong segment */}
        <div
          className="absolute inset-y-0 rounded-full transition-all duration-500 ease-out"
          style={{
            left: `${correctPct}%`,
            width: `${wrongPct}%`,
            background: "var(--color-wrong)",
          }}
        />
        {/* Remaining answered glow overlay */}
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
