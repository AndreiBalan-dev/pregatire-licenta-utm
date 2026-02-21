"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { useSession } from "@/hooks/useSession";
import { getQuestion, allQuestions } from "@/data";
import { modules } from "@/data/modules";
import { cn } from "@/lib/utils";
import type { AnswerKey } from "@/data/types";

type Filter = "wrong" | "bookmarked" | "all";

const optionLabels: Record<AnswerKey, string> = { a: "A", b: "B", c: "C", d: "D" };

export default function RevizuirePage() {
  const { session, isLoaded, toggleBookmark } = useSession();
  const [filter, setFilter] = useState<Filter>("wrong");
  const [moduleFilter, setModuleFilter] = useState<string>("all");

  const filteredQuestions = useMemo(() => {
    let questionIds: number[] = [];

    if (filter === "wrong") {
      questionIds = Object.entries(session.answers)
        .filter(([, a]) => !a.isCorrect)
        .map(([id]) => Number(id));
    } else if (filter === "bookmarked") {
      questionIds = session.bookmarks;
    } else {
      questionIds = Object.keys(session.answers).map(Number);
    }

    return questionIds
      .map((id) => getQuestion(id))
      .filter((q) => q !== undefined)
      .filter((q) => moduleFilter === "all" || q.moduleId === moduleFilter);
  }, [filter, moduleFilter, session.answers, session.bookmarks]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-border-strong)] border-t-[var(--color-accent)]" />
      </div>
    );
  }

  const wrongCount = Object.values(session.answers).filter((a) => !a.isCorrect).length;
  const bookmarkCount = session.bookmarks.length;

  return (
    <>
      <Header />
      <main className="py-8 pb-24 md:pb-8">
        <Container narrow>
          <h1
            className="text-3xl font-bold text-[var(--color-text-primary)] mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Revizuire
          </h1>

          {/* Filter tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {([
              { key: "wrong" as Filter, label: "Greșite", count: wrongCount },
              { key: "bookmarked" as Filter, label: "Marcate", count: bookmarkCount },
              { key: "all" as Filter, label: "Toate", count: Object.keys(session.answers).length },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer",
                  filter === tab.key
                    ? "bg-[var(--color-accent)] text-[#0C0C0E]"
                    : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                )}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Module filter */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <button
              onClick={() => setModuleFilter("all")}
              className={cn(
                "px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer",
                moduleFilter === "all"
                  ? "bg-[var(--color-bg-hover)] text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
              )}
            >
              Toate modulele
            </button>
            {modules.map((mod) => (
              <button
                key={mod.id}
                onClick={() => setModuleFilter(mod.id)}
                className={cn(
                  "px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer",
                  moduleFilter === mod.id
                    ? "text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                )}
                style={moduleFilter === mod.id ? { backgroundColor: `${mod.color}20` } : {}}
              >
                {mod.name}
              </button>
            ))}
          </div>

          {/* Questions list */}
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[var(--color-text-tertiary)] text-lg">
                {filter === "wrong"
                  ? "Nicio întrebare greșită. Bravo!"
                  : filter === "bookmarked"
                    ? "Nicio întrebare marcată."
                    : "Nicio întrebare rezolvată încă."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((question) => {
                const answer = session.answers[question.id];
                const isBookmarked = session.bookmarks.includes(question.id);

                return (
                  <Card key={question.id} className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <p className="text-sm text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
                        {question.text}
                      </p>
                      <button
                        onClick={() => toggleBookmark(question.id)}
                        className={cn(
                          "flex-shrink-0 p-1.5 rounded transition-colors cursor-pointer",
                          isBookmarked ? "text-[var(--color-accent)]" : "text-[var(--color-text-tertiary)]"
                        )}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                      </button>
                    </div>

                    {question.code && (
                      <pre className="code-block text-xs mb-3">
                        <code>{question.code}</code>
                      </pre>
                    )}

                    <div className="space-y-1.5">
                      {(Object.keys(question.options) as AnswerKey[]).map((key) => {
                        const isCorrectAnswer = key === question.correctAnswer;
                        const isUserAnswer = answer?.selected === key;
                        const isWrongSelection = isUserAnswer && !isCorrectAnswer;

                        return (
                          <div
                            key={key}
                            className={cn(
                              "flex items-start gap-2 px-3 py-2 rounded text-xs",
                              isCorrectAnswer && "bg-[var(--color-correct-bg)] border border-[var(--color-correct-border)]",
                              isWrongSelection && "bg-[var(--color-wrong-bg)] border border-[var(--color-wrong-border)]",
                              !isCorrectAnswer && !isWrongSelection && "text-[var(--color-text-tertiary)]"
                            )}
                          >
                            <span className={cn(
                              "font-bold flex-shrink-0",
                              isCorrectAnswer ? "text-[var(--color-correct)]" :
                              isWrongSelection ? "text-[var(--color-wrong)]" : ""
                            )}>
                              {optionLabels[key]}.
                            </span>
                            <span className={cn(
                              isCorrectAnswer ? "text-[var(--color-correct)]" :
                              isWrongSelection ? "text-[var(--color-wrong)]" : ""
                            )}>
                              {question.options[key]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Container>
      </main>
      <MobileNav />
    </>
  );
}
