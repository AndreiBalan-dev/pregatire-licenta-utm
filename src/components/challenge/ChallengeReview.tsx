"use client";

import { useMemo } from "react";
import { getQuestion } from "@/data";
import { QuestionCard } from "@/components/practice/QuestionCard";
import { computeScore } from "@/lib/exam";
import { wrongIdsInChallenge } from "@/lib/redo";
import type { ChallengeSummary } from "@/lib/session-types";
import type { AnswerKey } from "@/data/types";

interface ChallengeReviewProps {
  summary: ChallengeSummary;
  bookmarks: number[];
  onToggleBookmark: (id: number) => void;
  onRedo: () => void;
  onBack: () => void;
}

export function ChallengeReview({ summary, bookmarks, onToggleBookmark, onRedo, onBack }: ChallengeReviewProps) {
  const wrongCount = useMemo(
    () => wrongIdsInChallenge(summary, (id) => getQuestion(id)?.correctAnswer).length,
    [summary],
  );
  const byId = useMemo(() => new Map(summary.answers.map((a) => [a.questionId, a])), [summary]);

  const resultLabel =
    summary.scoring === "nota"
      ? `Nota ${computeScore(summary.correctCount).toFixed(2)}`
      : `${summary.correctCount}/${summary.total} corecte`;

  return (
    <main className="relative max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4 gap-3">
        <button
          onClick={onBack}
          className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
        >
          ← Înapoi
        </button>
        {wrongCount > 0 && (
          <button
            onClick={onRedo}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-md)] text-sm font-semibold bg-[var(--color-accent)] text-[#0C0C0E] hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Refă greșitele ({wrongCount})
          </button>
        )}
      </div>

      <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1" style={{ fontFamily: "var(--font-display)" }}>
        Răspunsurile tale
      </h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-6">
        {resultLabel}{summary.rank ? ` · Locul ${summary.rank}/${summary.players}` : ""}
      </p>

      <div className="space-y-6">
        {summary.questionIds.map((id, i) => {
          const q = getQuestion(id);
          if (!q) return null;
          const selected = (byId.get(id)?.selected ?? null) as AnswerKey | null;
          return (
            <div key={id}>
              <QuestionCard
                question={q}
                questionNumber={i + 1}
                totalQuestions={summary.questionIds.length}
                selectedAnswer={selected}
                showFeedback
                isBookmarked={bookmarks.includes(id)}
                onSelectAnswer={() => {}}
                onBookmark={() => onToggleBookmark(id)}
              />
              {selected === null && (
                <p className="mt-1.5 text-xs text-[var(--color-text-tertiary)]">Fără răspuns</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-medium hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer"
        >
          Înapoi
        </button>
        {wrongCount > 0 && (
          <button
            onClick={onRedo}
            className="flex-1 py-3 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[#0C0C0E] font-semibold hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Refă greșitele ({wrongCount})
          </button>
        )}
      </div>
    </main>
  );
}
