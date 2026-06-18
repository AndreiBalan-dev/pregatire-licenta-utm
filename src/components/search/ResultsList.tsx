"use client";

import { useEffect, useState } from "react";
import { modules } from "@/data/modules";
import { cn } from "@/lib/utils";
import type { Question } from "@/data/types";
import type { SearchContext } from "@/lib/search";
import { SearchResultCard, type ResultStatus } from "./SearchResultCard";

const INITIAL_VISIBLE = 50;

// subjectId -> display name + owning module color (built once).
const SUBJECT_INFO = new Map<string, { name: string; color: string }>();
for (const mod of modules) {
  for (const subject of mod.subjects) {
    SUBJECT_INFO.set(subject.id, { name: subject.name, color: mod.color });
  }
}

function statusOf(id: number, ctx: SearchContext): ResultStatus {
  const ans = ctx.answered.get(id);
  if (!ans) return "unanswered";
  return ans.isCorrect ? "correct" : "wrong";
}

interface ResultsListProps {
  results: Question[];
  query: string;
  ctx: SearchContext;
  onToggleBookmark: (id: number) => void;
  onPracticeOne: (id: number) => void;
  onClearFilters: () => void;
  hasFilters: boolean;
}

export function ResultsList({
  results,
  query,
  ctx,
  onToggleBookmark,
  onPracticeOne,
  onClearFilters,
  hasFilters,
}: ResultsListProps) {
  const [visible, setVisible] = useState(INITIAL_VISIBLE);

  // Re-collapse to the first page whenever the result set changes.
  useEffect(() => {
    setVisible(INITIAL_VISIBLE); // eslint-disable-line react-hooks/set-state-in-effect
  }, [results]);

  if (results.length === 0) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-dashed border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-6 py-14 text-center">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)] mb-4" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </span>
        <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-1" style={{ fontFamily: "var(--font-display)" }}>
          Niciun rezultat
        </h3>
        <p className="text-sm text-[var(--color-text-tertiary)] max-w-sm mx-auto">
          Nimic nu se potrivește cu filtrele tale. Încearcă alți termeni sau renunță la câteva filtre.
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-md)] text-sm font-semibold bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer"
          >
            Șterge filtrele
          </button>
        )}
      </div>
    );
  }

  const shown = results.slice(0, visible);
  const remaining = results.length - shown.length;

  return (
    <div className="space-y-2.5">
      {shown.map((question) => {
        const info = SUBJECT_INFO.get(question.subjectId);
        return (
          <SearchResultCard
            key={question.id}
            question={question}
            subjectName={info?.name ?? question.subjectId}
            moduleColor={info?.color ?? "var(--color-border-strong)"}
            query={query}
            status={statusOf(question.id, ctx)}
            bookmarked={ctx.bookmarks.has(question.id)}
            onToggleBookmark={() => onToggleBookmark(question.id)}
            onPracticeOne={() => onPracticeOne(question.id)}
          />
        );
      })}

      {remaining > 0 && (
        <button
          type="button"
          onClick={() => setVisible(results.length)}
          className={cn(
            "w-full py-3 rounded-[var(--radius-md)] text-sm font-semibold transition-colors cursor-pointer border",
            "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-hover)]",
          )}
        >
          Afișează toate cele {results.length} rezultate
        </button>
      )}
    </div>
  );
}
