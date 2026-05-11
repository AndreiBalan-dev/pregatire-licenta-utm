"use client";

import { useState } from "react";
import { modules } from "@/data/modules";
import { cn } from "@/lib/utils";

interface ExamModuleBreakdownProps {
  perModule: Record<string, { correct: number; total: number }>;
  perSubject: Record<string, { correct: number; total: number }>;
}

function colorForRatio(pct: number): string {
  if (pct >= 70) return "var(--color-correct)";
  if (pct >= 40) return "var(--color-accent)";
  return "var(--color-wrong)";
}

export function ExamModuleBreakdown({ perModule, perSubject }: ExamModuleBreakdownProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5 sm:p-6">
      <div className="mb-4 sm:mb-5 flex items-baseline justify-between gap-3 flex-wrap">
        <span
          className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Performanță pe module
        </span>
        <span className="text-[10px] sm:text-[11px] text-[var(--color-text-tertiary)]">
          Click pentru detalii
        </span>
      </div>

      <div className="space-y-2.5">
        {modules.map((mod) => {
          const stat = perModule[mod.id] || { correct: 0, total: 0 };
          const pct = stat.total > 0 ? (stat.correct / stat.total) * 100 : 0;
          const isExpanded = expandedId === mod.id;
          const subjectsWithStats = mod.subjects
            .map((s) => ({
              ...s,
              stat: perSubject[s.id] || { correct: 0, total: 0 },
            }))
            .filter((s) => s.stat.total > 0);

          return (
            <div
              key={mod.id}
              className={cn(
                "rounded-[var(--radius-md)] bg-[var(--color-bg-primary)] border transition-all duration-200 overflow-hidden",
                isExpanded ? "border-[var(--color-border-strong)]" : "border-[var(--color-border)]",
              )}
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : mod.id)}
                className="w-full px-3.5 sm:px-4 py-3 sm:py-3.5 flex items-center gap-3 cursor-pointer hover:bg-[var(--color-bg-hover)] transition-colors text-left"
                aria-expanded={isExpanded}
                aria-controls={`mod-detail-${mod.id}`}
              >
                <span
                  className="w-1.5 h-6 sm:h-7 rounded-full flex-shrink-0"
                  style={{ backgroundColor: mod.color, boxShadow: `0 0 8px ${mod.color}55` }}
                  aria-hidden="true"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                      {mod.name}
                    </span>
                    <span
                      className="text-sm font-bold tabular-nums flex-shrink-0"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: colorForRatio(pct),
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

                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={cn(
                    "flex-shrink-0 text-[var(--color-text-tertiary)] transition-transform duration-200",
                    isExpanded && "rotate-180",
                  )}
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isExpanded && (
                <div
                  id={`mod-detail-${mod.id}`}
                  className="border-t border-[var(--color-border)] px-3.5 sm:px-4 py-3 space-y-2 animate-fade-in"
                >
                  {subjectsWithStats.length === 0 && (
                    <p className="text-xs text-[var(--color-text-tertiary)] italic">
                      Nicio întrebare din acest modul nu a apărut în examen.
                    </p>
                  )}
                  {subjectsWithStats.map((s) => {
                    const subPct = s.stat.total > 0 ? (s.stat.correct / s.stat.total) * 100 : 0;
                    return (
                      <div key={s.id} className="flex items-center gap-2.5">
                        <span className="text-sm flex-shrink-0 w-5 text-center" aria-hidden="true">
                          {s.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs text-[var(--color-text-secondary)] truncate">
                              {s.name.split("(")[0].trim()}
                            </span>
                            <span
                              className="text-xs font-semibold tabular-nums flex-shrink-0"
                              style={{ color: colorForRatio(subPct) }}
                            >
                              {s.stat.correct}/{s.stat.total}
                            </span>
                          </div>
                          <div className="relative h-1 rounded-full bg-[var(--color-bg-secondary)] overflow-hidden">
                            <div
                              className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
                              style={{
                                width: `${subPct}%`,
                                backgroundColor: mod.color,
                                opacity: 0.85,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
