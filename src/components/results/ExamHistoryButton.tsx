"use client";

import { useState, type ReactNode } from "react";
import { ExamHistoryModal } from "@/components/results/ExamHistoryModal";
import { cn } from "@/lib/utils";
import type { ExamSummaryData } from "@/hooks/useSession";

interface ExamHistoryButtonProps {
  history: ExamSummaryData[];
  onClear?: () => void;
  /** Override the default "Ai dat N examene înainte" line. */
  subtitle?: ReactNode;
  className?: string;
}

/**
 * Self-contained entry point to the exam history. Renders a tappable card that
 * opens the ExamHistoryModal, and nothing at all when there is no history yet.
 * Used at the end of an exam, on the simulator start page and on Rezultate so
 * the history is reachable from wherever you finish or start an exam.
 */
export function ExamHistoryButton({ history, onClear, subtitle, className }: ExamHistoryButtonProps) {
  const [open, setOpen] = useState(false);

  if (history.length === 0) return null;

  const count = history.length;
  const defaultSubtitle = (
    <>
      Ai dat{" "}
      <span className="font-semibold text-[var(--color-text-secondary)] tabular-nums">{count}</span>{" "}
      {count === 1 ? "examen" : "examene"} înainte. Vezi cum ai stat.
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "group w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-hover)] transition-all cursor-pointer text-left",
          className,
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-[var(--radius-md)] bg-[var(--color-bg-primary)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)] transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 3v5h5" />
              <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
              <path d="M12 7v5l4 2" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
              Istoric examene
            </p>
            <p className="text-[11px] sm:text-xs text-[var(--color-text-tertiary)]">
              {subtitle ?? defaultSubtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-wider text-[var(--color-accent)] group-hover:text-[var(--color-accent-hover)]" style={{ fontFamily: "var(--font-display)" }}>
            Deschide
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-text-tertiary)] group-hover:text-[var(--color-accent)] transition-all group-hover:translate-x-0.5" aria-hidden="true">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </div>
      </button>

      <ExamHistoryModal
        open={open}
        onClose={() => setOpen(false)}
        history={history}
        onClear={onClear}
      />
    </>
  );
}
