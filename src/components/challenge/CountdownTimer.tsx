"use client";

import { formatClock } from "@/lib/challenge/timing";
import { cn } from "@/lib/utils";

/**
 * Presentational countdown: a label, a mono mm:ss readout, and a depleting bar.
 * `danger` (the tail seconds) switches accent -> red and throbs once per second.
 * The owner drives the numbers and the danger flag; this component only renders.
 */
export function CountdownTimer({
  secondsLeft,
  totalSeconds,
  danger,
  label,
}: {
  secondsLeft: number;
  totalSeconds: number;
  danger: boolean;
  label: string;
}) {
  const fraction = totalSeconds > 0 ? Math.max(0, Math.min(1, secondsLeft / totalSeconds)) : 0;
  const color = danger ? "var(--color-wrong)" : "var(--color-accent)";

  return (
    <div
      role="timer"
      aria-label={`${label}: ${formatClock(secondsLeft)}`}
      className="rounded-[var(--radius-md)] border bg-[var(--color-bg-secondary)] px-3 py-2"
      style={{ borderColor: danger ? "var(--color-wrong)" : "var(--color-border)" }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="13" r="8" />
            <path d="M12 9v4l2 2" />
            <path d="M5 3 2 6" />
            <path d="m22 6-3-3" />
          </svg>
          {label}
        </span>
        <span
          className={cn("text-lg font-extrabold tabular-nums leading-none", danger && "animate-timer-throb")}
          style={{ fontFamily: "var(--font-display)", color }}
        >
          {formatClock(secondsLeft)}
        </span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-300 ease-linear"
          style={{ width: `${fraction * 100}%`, background: color }}
        />
      </div>
    </div>
  );
}
