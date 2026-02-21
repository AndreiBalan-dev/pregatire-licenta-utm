interface ProgressBarProps {
  current: number;
  total: number;
  correctCount: number;
  wrongCount: number;
}

export function ProgressBar({ current, total, correctCount, wrongCount }: ProgressBarProps) {
  const pct = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-[var(--color-correct)] font-medium">
            {correctCount} corecte
          </span>
          <span className="text-[var(--color-wrong)] font-medium">
            {wrongCount} greșite
          </span>
        </div>
        <span className="text-[var(--color-text-tertiary)]">
          {current}/{total}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
        <div
          className="progress-bar-fill h-full rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
