"use client";

import { Button } from "@/components/ui/Button";

interface LaunchBarProps {
  count: number;
  onPractice: () => void;
  onSimulate: () => void;
}

/**
 * Results header + the two launch actions. Turns the current filtered set into a
 * practice run ("Exersează", instant feedback) or a test run ("Simulează", score
 * at the end). Disabled when nothing matches.
 */
export function LaunchBar({ count, onPractice, onSimulate }: LaunchBarProps) {
  const disabled = count === 0;

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-3">
      <div className="flex items-baseline gap-1.5">
        <span
          className="text-2xl font-extrabold tabular-nums text-[var(--color-text-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {count}
        </span>
        <span className="text-sm text-[var(--color-text-tertiary)]">
          {count === 1 ? "rezultat" : "rezultate"}
        </span>
      </div>

      <div className="flex gap-2 flex-1 sm:flex-initial justify-end">
        <Button
          variant="primary"
          size="md"
          className="flex-1 sm:flex-initial"
          onClick={onPractice}
          disabled={disabled}
          aria-label={`Exersează cele ${count} rezultate`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
          </svg>
          Exersează
        </Button>
        <Button
          variant="secondary"
          size="md"
          className="flex-1 sm:flex-initial"
          onClick={onSimulate}
          disabled={disabled}
          aria-label={`Simulează cele ${count} rezultate`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          Simulează
        </Button>
      </div>
    </div>
  );
}
