"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ReviewLaunchProps {
  title: string;
  count: number;
  unit?: string;
  description?: string;
  icon?: ReactNode;
  accentColor?: string;
  /** Optional control (e.g. a materie filter) rendered above the action buttons. */
  filterSlot?: ReactNode;
  /** Start a normal practice run (instant feedback + explanations). */
  onPractice: () => void;
  /** Start a no-feedback simulation of the same set (score at the end). */
  onSimulate: () => void;
}

/**
 * Card that launches a fresh session from a fixed set of questions (e.g. the
 * ones you got wrong or marked). Offers two modes: "Exersează" (practice, with
 * explanations) and "Simulează" (a test run that hides correctness until the
 * end). Buttons are disabled when the set is empty.
 *
 * Used on the Revizuire page (for the active filter) and on the Practica start
 * screen (one card for greșite, one for marcate).
 */
export function ReviewLaunch({
  title,
  count,
  unit = "întrebări",
  description,
  icon,
  accentColor = "var(--color-accent)",
  filterSlot,
  onPractice,
  onSimulate,
}: ReviewLaunchProps) {
  const disabled = count === 0;

  return (
    <div
      className={cn(
        "rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 sm:p-5 transition-opacity",
        disabled && "opacity-60",
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        {icon && (
          <span
            className="flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)]"
            style={{ color: accentColor }}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span
              className="text-sm sm:text-base font-bold text-[var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {title}
            </span>
            <span className="text-sm font-bold tabular-nums" style={{ color: accentColor }}>
              {count}
            </span>
            <span className="text-xs text-[var(--color-text-tertiary)]">{unit}</span>
          </div>
          {description && (
            <p className="text-[11px] sm:text-xs text-[var(--color-text-tertiary)] mt-0.5 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {filterSlot && <div className="mb-3">{filterSlot}</div>}

      <div className="flex gap-2">
        <Button
          variant="primary"
          size="md"
          className="flex-1"
          onClick={onPractice}
          disabled={disabled}
          aria-label={`Exersează ${count} ${unit}`}
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
          className="flex-1"
          onClick={onSimulate}
          disabled={disabled}
          aria-label={`Simulează ${count} ${unit}`}
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
