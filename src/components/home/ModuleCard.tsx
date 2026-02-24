"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { cn, formatPercentage } from "@/lib/utils";
import type { Module } from "@/data/types";

interface ModuleCardProps {
  module: Module;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  delay?: number;
}

export function ModuleCard({ module, totalQuestions, answeredCount, correctCount, delay = 0 }: ModuleCardProps) {
  const pct = formatPercentage(answeredCount, totalQuestions);
  const accuracyPct = formatPercentage(correctCount, answeredCount);

  return (
    <Link href={`/practica?modul=${module.id}`} className="block h-full group">
      <div
        className="relative h-full rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] overflow-hidden module-card animate-slide-up cursor-pointer flex flex-col"
        style={{
          "--module-color": module.color,
          borderLeftWidth: "3px",
          borderLeftColor: module.color,
          animationDelay: `${delay}ms`,
        } as React.CSSProperties}
      >
        {/* Subtle static top glow — hover glow handled by .module-card::before in CSS */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${module.color}, transparent)`,
            opacity: 0.04,
          }}
        />

        <div className="relative p-5 flex flex-col h-full">
          <div className="flex items-start justify-between mb-3 gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: module.color, boxShadow: `0 0 8px ${module.color}50` }}
                />
                <h3
                  className="text-lg font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors truncate"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {module.name}
                </h3>
              </div>
              <p className="text-sm text-[var(--color-text-tertiary)] leading-relaxed">
                {module.description}
              </p>
            </div>
            <Badge color={module.color} className="flex-shrink-0">
              {module.subjects.length} materii
            </Badge>
          </div>

          {/* Progress section */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="text-[var(--color-text-tertiary)]">
                {answeredCount} / {totalQuestions} rezolvate
              </span>
              <span className="font-bold tabular-nums" style={{ color: module.color }}>
                {pct}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${module.color}, ${module.color}CC)`,
                  boxShadow: pct > 0 ? `0 0 12px ${module.color}30` : undefined,
                }}
              />
            </div>
          </div>

          {/* Subject pills */}
          <div className="mt-4 flex flex-wrap gap-1.5 content-start">
            {module.subjects.map((s) => (
              <span
                key={s.id}
                className="text-xs text-[var(--color-text-tertiary)] bg-[var(--color-bg-primary)] px-2 py-0.5 rounded-[var(--radius-sm)] border border-transparent group-hover:border-[var(--color-border)] transition-colors"
              >
                {s.icon} {s.name.split("(")[0].trim()}
              </span>
            ))}
          </div>

          <div className="mt-auto" />

          {/* Footer with accuracy + arrow */}
          <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
            {answeredCount > 0 ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[var(--color-text-tertiary)]">Acuratețe:</span>
                <span
                  className={cn(
                    "font-bold",
                    accuracyPct >= 70
                      ? "text-[var(--color-correct)]"
                      : accuracyPct >= 40
                        ? "text-[var(--color-accent)]"
                        : "text-[var(--color-wrong)]"
                  )}
                >
                  {accuracyPct}%
                </span>
              </div>
            ) : (
              <span className="text-xs text-[var(--color-text-tertiary)]">Începe practica</span>
            )}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[var(--color-text-tertiary)] group-hover:text-[var(--color-accent)] group-hover:translate-x-0.5 transition-all duration-200"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
