"use client";

import { modules } from "@/data/modules";
import { cn } from "@/lib/utils";

interface ExamModuleBreakdownProps {
  perModule: Record<string, { correct: number; total: number }>;
}

export function ExamModuleBreakdown({ perModule }: ExamModuleBreakdownProps) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5 sm:p-6">
      <div className="mb-5">
        <span
          className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Performanță pe module
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {modules.map((mod) => {
          const stat = perModule[mod.id] || { correct: 0, total: 0 };
          const pct = stat.total > 0 ? (stat.correct / stat.total) * 100 : 0;

          return (
            <div
              key={mod.id}
              className="rounded-[var(--radius-md)] bg-[var(--color-bg-primary)] border border-[var(--color-border)] p-3.5 sm:p-4"
            >
              <div className="flex items-center justify-between mb-3 gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-1.5 h-5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: mod.color, boxShadow: `0 0 8px ${mod.color}55` }}
                  />
                  <span className="text-xs sm:text-sm font-semibold text-[var(--color-text-primary)] truncate">
                    {mod.name}
                  </span>
                </div>
                <span
                  className={cn(
                    "text-sm font-bold tabular-nums flex-shrink-0",
                  )}
                  style={{
                    fontFamily: "var(--font-display)",
                    color: pct >= 70 ? "var(--color-correct)" : pct >= 40 ? "var(--color-accent)" : "var(--color-wrong)",
                  }}
                >
                  {stat.correct}
                  <span className="text-[var(--color-text-tertiary)] font-normal mx-0.5">/</span>
                  {stat.total}
                </span>
              </div>

              <div className="relative h-1.5 rounded-full bg-[var(--color-bg-secondary)] overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${mod.color}, ${mod.color}DD)`,
                    boxShadow: pct > 0 ? `0 0 8px ${mod.color}55` : undefined,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
