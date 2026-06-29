"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPercentage, timeAgo } from "@/lib/utils";
import type { SessionHistoryEntry } from "@/lib/session-history";
import type { PracticeSummary } from "@/lib/session-types";

const TYPE_META: Record<SessionHistoryEntry["kind"], { label: string }> = {
  exam: { label: "Simulare" },
  practice: { label: "Practică" },
  training: { label: "Antrenament" },
  challenge: { label: "Provocare" },
};

interface SessionHistoryProps {
  entries: SessionHistoryEntry[];
  onRetryExam: (questionIds: number[]) => void;
  onRetryPractice: (practice: PracticeSummary) => void;
  onRetryTraining: (subjectIds: string[]) => void;
  onClear?: () => void;
  className?: string;
}

const INITIAL_VISIBLE = 15;

export function SessionHistory({ entries, onRetryExam, onRetryPractice, onRetryTraining, onClear, className }: SessionHistoryProps) {
  const [showAll, setShowAll] = useState(false);
  if (entries.length === 0) return null;
  const visible = showAll ? entries : entries.slice(0, INITIAL_VISIBLE);

  return (
    <section className={className}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
          Istoric sesiuni
        </h2>
        {onClear && (
          <button onClick={onClear} className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-wrong)] transition-colors cursor-pointer">
            Șterge istoricul
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {visible.map((entry) => {
          const meta = TYPE_META[entry.kind];
          return (
            <div key={`${entry.kind}-${entry.kind === "exam" ? entry.exam.examId : entry.kind === "practice" ? entry.practice.id : entry.kind === "training" ? entry.training.id : entry.challenge.id}`} className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3.5">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.12em] bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)] border-opacity-30 flex-shrink-0">
                  {meta.label}
                </span>

                <div className="min-w-0 flex-1">
                  {entry.kind === "exam" && (
                    <div className="text-sm text-[var(--color-text-primary)]">
                      <span className="font-bold tabular-nums">{entry.exam.score.toFixed(2)}</span>
                      <span className="text-[var(--color-text-tertiary)]"> · {entry.exam.correctCount}/{entry.exam.total} corecte</span>
                    </div>
                  )}
                  {entry.kind === "practice" && (
                    <div className="text-sm text-[var(--color-text-primary)]">
                      <span className="font-bold tabular-nums">{formatPercentage(entry.practice.correct, entry.practice.answered)}%</span>
                      <span className="text-[var(--color-text-tertiary)]"> · {entry.practice.correct}/{entry.practice.answered} corecte</span>
                    </div>
                  )}
                  {entry.kind === "training" && (
                    <div className="text-sm text-[var(--color-text-primary)]">
                      <span className="font-bold tabular-nums">{entry.training.seenCount}</span>
                      <span className="text-[var(--color-text-tertiary)]"> văzute · {entry.training.masteredAtEnd}/{entry.training.poolSize} stăpânite</span>
                    </div>
                  )}
                  <div className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">{timeAgo(entry.date)}</div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {entry.kind === "exam" && (
                    <Link href={`/simulator/${entry.exam.examId}`} className="text-xs font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
                      Vezi
                    </Link>
                  )}
                  <button
                    onClick={() =>
                      entry.kind === "exam"
                        ? onRetryExam(entry.questionIds)
                        : entry.kind === "practice"
                          ? onRetryPractice(entry.practice)
                          : entry.kind === "training"
                            ? onRetryTraining(entry.training.subjectIds)
                            : undefined
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)] border-opacity-40 hover:bg-[var(--color-accent)] hover:text-[#0C0C0E] transition-colors cursor-pointer"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="1 4 1 10 7 10" />
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    </svg>
                    Reia
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {entries.length > INITIAL_VISIBLE && (
        <button onClick={() => setShowAll((v) => !v)} className="mt-3 text-xs font-medium text-[var(--color-accent)] hover:underline cursor-pointer">
          {showAll ? "Arată mai puține" : `Vezi tot (${entries.length})`}
        </button>
      )}
    </section>
  );
}
