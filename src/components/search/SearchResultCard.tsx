"use client";

import { Fragment, useState } from "react";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { SubjectIcon } from "@/components/ui/SubjectIcon";
import { cn } from "@/lib/utils";
import type { Question } from "@/data/types";

export type ResultStatus = "correct" | "wrong" | "unanswered";

interface SearchResultCardProps {
  question: Question;
  subjectName: string;
  moduleColor: string;
  query: string;
  status: ResultStatus;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  onPracticeOne: () => void;
}

const ANSWER_KEYS = ["a", "b", "c", "d"] as const;
const LANG_LABEL: Record<string, string> = {
  c: "C", cpp: "C++", python: "Python", java: "Java", js: "JavaScript", php: "PHP", sql: "SQL", bash: "Bash",
};

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Highlight case-insensitive matches of `query` inside `text` (skips #id / numeric queries). */
function highlight(text: string, query: string) {
  const q = query.trim();
  if (!q || q.startsWith("#") || /^\d+$/.test(q)) return text;
  let parts: string[];
  try {
    parts = text.split(new RegExp(`(${escapeRegExp(q)})`, "ig"));
  } catch {
    return text;
  }
  const lower = q.toLowerCase();
  return parts.map((part, i) =>
    part.toLowerCase() === lower ? (
      <mark key={i} className="bg-[var(--color-accent-strong)] text-[var(--color-text-primary)] rounded-[2px] px-0.5">
        {part}
      </mark>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

function StatusPill({ status }: { status: ResultStatus }) {
  if (status === "unanswered") return null;
  const correct = status === "correct";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border whitespace-nowrap",
        correct
          ? "text-[var(--color-correct)] bg-[var(--color-correct-bg)] border-[var(--color-correct-border)]"
          : "text-[var(--color-wrong)] bg-[var(--color-wrong-bg)] border-[var(--color-wrong-border)]",
      )}
      title={correct ? "Ai răspuns corect data trecută" : "Ai greșit data trecută"}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {correct ? <polyline points="20 6 9 17 4 12" /> : <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>}
      </svg>
      {correct ? "Corect" : "Greșit"}
    </span>
  );
}

export function SearchResultCard({
  question,
  subjectName,
  moduleColor,
  query,
  status,
  bookmarked,
  onToggleBookmark,
  onPracticeOne,
}: SearchResultCardProps) {
  const [expanded, setExpanded] = useState(false);
  // Revealing the answer is a separate, deliberate step from opening the card,
  // so you can "Exersează asta" without ever seeing the correct option.
  const [revealed, setRevealed] = useState(false);

  const toggleCard = () => {
    const next = !expanded;
    setExpanded(next);
    if (!next) setRevealed(false); // collapsing hides the answer again
  };

  return (
    <div
      className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] overflow-hidden transition-colors hover:border-[var(--color-border-strong)]"
      style={{ borderLeft: `3px solid ${moduleColor}` }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={toggleCard}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleCard();
          }
        }}
        className="w-full text-left p-3 sm:p-4 cursor-pointer"
      >
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="text-xs font-bold tabular-nums text-[var(--color-text-tertiary)]">#{question.id}</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)] min-w-0">
            <span style={{ color: moduleColor }} className="inline-flex flex-shrink-0">
              <SubjectIcon subjectId={question.subjectId} size={14} />
            </span>
            <span className="truncate">{subjectName}</span>
          </span>

          {question.code && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[var(--radius-sm)] text-[10px] font-semibold text-[var(--color-text-tertiary)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] whitespace-nowrap">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              {question.codeLanguage ? LANG_LABEL[question.codeLanguage] ?? "cod" : "cod"}
            </span>
          )}
          {question.figure && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[var(--radius-sm)] text-[10px] font-semibold text-[var(--color-text-tertiary)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] whitespace-nowrap">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              figură
            </span>
          )}

          <StatusPill status={status} />

          <span className="ml-auto flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark();
              }}
              aria-label={bookmarked ? "Scoate marcajul" : "Marchează întrebarea"}
              aria-pressed={bookmarked}
              className={cn(
                "p-1.5 rounded-[var(--radius-sm)] transition-colors cursor-pointer",
                bookmarked
                  ? "text-[var(--color-accent)] hover:bg-[var(--color-bg-hover)]"
                  : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]",
              )}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>
            <span className="p-1.5 text-[var(--color-text-tertiary)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={cn("transition-transform duration-200", expanded && "rotate-180")}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </span>
        </div>

        <p className={cn("text-sm text-[var(--color-text-primary)] leading-relaxed", !expanded && "line-clamp-2")}>
          {highlight(question.text, query)}
        </p>
      </div>

      {expanded && (
        <div className="px-3 sm:px-4 pb-4 -mt-1 space-y-3 animate-fade-in">
          {question.code && <CodeBlock code={question.code} language={question.codeLanguage} />}

          {question.figure && (
            <img
              src={question.figure}
              alt={`Figură pentru întrebarea #${question.id}`}
              className="max-w-full h-auto rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white"
            />
          )}

          <div className="space-y-1.5">
            {ANSWER_KEYS.map((key) => {
              const showCorrect = revealed && key === question.correctAnswer;
              return (
                <div
                  key={key}
                  className={cn(
                    "flex items-start gap-2.5 px-3 py-2 rounded-[var(--radius-md)] border text-sm transition-colors",
                    showCorrect
                      ? "border-[var(--color-correct-border)] bg-[var(--color-correct-bg)]"
                      : "border-[var(--color-border)]",
                  )}
                >
                  <span
                    className={cn(
                      "font-bold uppercase flex-shrink-0",
                      showCorrect ? "text-[var(--color-correct)]" : "text-[var(--color-text-tertiary)]",
                    )}
                  >
                    {key}
                  </span>
                  <span className={cn("min-w-0 flex-1", showCorrect ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]")}>
                    {question.options[key]}
                  </span>
                  {showCorrect && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-correct)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onPracticeOne}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] text-sm font-semibold bg-[var(--color-accent)] text-[#0C0C0E] hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer active:scale-[0.98]"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
              </svg>
              Exersează asta
            </button>

            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              aria-expanded={revealed}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-md)] text-sm font-semibold border transition-colors cursor-pointer active:scale-[0.98] bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-hover)]"
            >
              {revealed ? "Ascunde răspunsul" : "Vezi răspuns"}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={cn("transition-transform duration-200", revealed && "rotate-180")}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>

          {revealed && question.explanation && (
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3 animate-fade-in">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--color-accent)] mb-1.5" style={{ fontFamily: "var(--font-display)" }}>
                De ce e corect
              </p>
              <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)] whitespace-pre-wrap">
                {question.explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
