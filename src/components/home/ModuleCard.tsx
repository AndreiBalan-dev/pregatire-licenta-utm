"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
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

  return (
    <Link href={`/practica?modul=${module.id}`} className="block h-full">
    <Card
      hover
      className={cn("p-5 animate-slide-up cursor-pointer h-full flex flex-col")}
      style={
        {
          "--module-color": module.color,
          animationDelay: `${delay}ms`,
        } as React.CSSProperties
      }
      accent={module.color}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3
            className="text-lg font-bold text-[var(--color-text-primary)] mb-1"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {module.name}
          </h3>
          <p className="text-sm text-[var(--color-text-tertiary)] leading-relaxed">
            {module.description}
          </p>
        </div>
        <Badge color={module.color}>
          {module.subjects.length} materii
        </Badge>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-2 text-xs">
          <span className="text-[var(--color-text-tertiary)]">
            {answeredCount} / {totalQuestions} rezolvate
          </span>
          <span className="font-medium" style={{ color: module.color }}>
            {pct}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              backgroundColor: module.color,
            }}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5 content-start">
        {module.subjects.map((s) => (
          <span
            key={s.id}
            className="text-xs text-[var(--color-text-tertiary)] bg-[var(--color-bg-primary)] px-2 py-0.5 rounded"
          >
            {s.icon} {s.name.split("(")[0].trim()}
          </span>
        ))}
      </div>

      <div className="mt-auto" />
      {answeredCount > 0 && (
        <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center gap-2 text-xs">
          <span className="text-[var(--color-text-tertiary)]">Acuratețe:</span>
          <span
            className={cn(
              "font-semibold",
              formatPercentage(correctCount, answeredCount) >= 70
                ? "text-[var(--color-correct)]"
                : formatPercentage(correctCount, answeredCount) >= 40
                  ? "text-[var(--color-accent)]"
                  : "text-[var(--color-wrong)]"
            )}
          >
            {formatPercentage(correctCount, answeredCount)}%
          </span>
        </div>
      )}
    </Card>
    </Link>
  );
}
