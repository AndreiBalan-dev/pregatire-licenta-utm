"use client";

import { cn, isCodeLike } from "@/lib/utils";
import { CodeBlock } from "@/components/ui/CodeBlock";
import type { Question, AnswerKey } from "@/data/types";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: AnswerKey | null;
  showFeedback: boolean;
  isBookmarked: boolean;
  onSelectAnswer: (answer: AnswerKey) => void;
  onBookmark: () => void;
  onRetry?: () => void;
}

const optionLabels: Record<AnswerKey, string> = { a: "A", b: "B", c: "C", d: "D" };

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  showFeedback,
  isBookmarked,
  onSelectAnswer,
  onBookmark,
  onRetry,
}: QuestionCardProps) {
  return (
    <div key={question.id} className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span
            className="text-sm font-bold uppercase tracking-wider text-[var(--color-accent)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Întrebarea {questionNumber}
          </span>
          <span className="text-xs text-[var(--color-text-tertiary)]">
            din {totalQuestions}
          </span>
        </div>
        <button
          onClick={onBookmark}
          className={cn(
            "p-2 rounded-[var(--radius-md)] transition-colors cursor-pointer",
            isBookmarked
              ? "text-[var(--color-accent)] bg-[var(--color-accent-muted)]"
              : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
          )}
          title={isBookmarked ? "Elimină marcajul" : "Marchează întrebarea"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>

      {question.code && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
              {question.codeLanguage || "Cod"}
            </span>
          </div>
          <CodeBlock code={question.code} language={question.codeLanguage} />
        </div>
      )}

      <div className="mb-6">
        <p className="text-base leading-relaxed text-[var(--color-text-primary)] whitespace-pre-wrap break-words">
          {question.text}
        </p>
      </div>

      <div className="space-y-3">
        {(Object.keys(question.options) as AnswerKey[]).map((key) => {
          const isSelected = selectedAnswer === key;
          const isCorrect = key === question.correctAnswer;
          const showCorrect = showFeedback && isCorrect;
          const showWrong = showFeedback && isSelected && !isCorrect;

          return (
            <button
              key={key}
              onClick={() => !showFeedback && onSelectAnswer(key)}
              disabled={showFeedback}
              className={cn(
                "option-btn w-full text-left px-4 py-3.5 rounded-[var(--radius-md)] border-2 border-[var(--color-border)] cursor-pointer",
                "flex items-start gap-3 min-w-0 overflow-hidden",
                "disabled:cursor-default",
                !showFeedback && isSelected && "selected",
                showCorrect && "correct",
                showWrong && "wrong",
                showFeedback && !showCorrect && !showWrong && isCorrect && "was-correct"
              )}
            >
              <span
                className={cn(
                  "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                  showCorrect
                    ? "border-[var(--color-correct)] bg-[var(--color-correct)] text-[#0C0C0E]"
                    : showWrong
                      ? "border-[var(--color-wrong)] bg-[var(--color-wrong)] text-white"
                      : isSelected
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[#0C0C0E]"
                        : "border-[var(--color-border-strong)] text-[var(--color-text-tertiary)]"
                )}
              >
                {optionLabels[key]}
              </span>
              <span
                className={cn(
                  "text-sm leading-relaxed pt-0.5 min-w-0 break-words",
                  showCorrect
                    ? "text-[var(--color-correct)] font-medium"
                    : showWrong
                      ? "text-[var(--color-wrong)]"
                      : isSelected
                        ? "text-[var(--color-text-primary)] font-medium"
                        : "text-[var(--color-text-secondary)]",
                  isCodeLike(question.options[key]) && "font-mono text-xs"
                )}
              >
                {question.options[key]}
              </span>
            </button>
          );
        })}
      </div>

      {showFeedback && selectedAnswer && selectedAnswer !== question.correctAnswer && onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[var(--radius-md)] border-2 border-[var(--color-border)] bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-accent)] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-all cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          <span className="text-sm font-medium">Reîncearcă</span>
        </button>
      )}
    </div>
  );
}
