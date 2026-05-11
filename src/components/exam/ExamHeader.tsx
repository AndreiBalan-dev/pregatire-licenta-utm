"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ExamHeaderProps {
  currentIndex: number;
  total: number;
  startedAt: string;
  onFinish: () => void;
}

function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

export function ExamHeader({ currentIndex, total, startedAt, onFinish }: ExamHeaderProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(startedAt).getTime();
    const tick = () => setElapsed(Date.now() - start);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  return (
    <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5">
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-1.5 h-5 rounded-full flex-shrink-0 bg-[var(--color-accent)]" />
        <span
          className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-accent)] truncate"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <span className="sm:hidden">Examen</span>
          <span className="hidden sm:inline">Simulator Examen</span>
        </span>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-[var(--color-text-tertiary)]">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="text-xs font-mono tabular-nums">{formatElapsed(elapsed)}</span>
        </div>

        <span className="text-xs text-[var(--color-text-tertiary)] tabular-nums hidden sm:inline">
          <span className="text-[var(--color-text-primary)] font-semibold">{currentIndex + 1}</span>
          <span className="mx-1">/</span>
          {total}
        </span>

        <button
          onClick={onFinish}
          aria-label="Finalizează examenul"
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold cursor-pointer transition-all duration-200",
            "border border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-muted)]",
            "hover:bg-[var(--color-accent)] hover:text-[#0C0C0E] active:scale-[0.97]",
          )}
          style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Finalizează</span>
        </button>
      </div>
    </div>
  );
}
