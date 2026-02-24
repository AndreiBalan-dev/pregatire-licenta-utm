"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { useSession } from "@/hooks/useSession";
import { getQuestion } from "@/data";
import { modules } from "@/data/modules";
import { cn, isCodeLike } from "@/lib/utils";
import type { AnswerKey } from "@/data/types";

type Filter = "wrong" | "correct" | "bookmarked" | "all";

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
    } else if (filter === "correct") {
      questionIds = Object.entries(session.answers)
        .filter(([, a]) => a.isCorrect)
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
  const correctCount = Object.values(session.answers).filter((a) => a.isCorrect).length;
  const bookmarkCount = session.bookmarks.length;

  return (
    <>
      <Header />
      <main className="relative py-8 pb-24 md:pb-8 overflow-hidden">
        <div
          className="absolute inset-0 grid-pattern opacity-40"
          aria-hidden="true"
        />
        <Container narrow className="relative">
          <div className="mb-8">
            <h1
              className="text-3xl font-bold text-[var(--color-text-primary)] mb-2 animate-fade-in"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Revizuire
            </h1>
            <p className="text-[var(--color-text-secondary)] animate-fade-in stagger-1">
              Analizează răspunsurile și învață din greșeli.
            </p>
          </div>

          {/* Stats overview */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-8 animate-slide-up stagger-1">
            <div className="relative p-3 sm:p-4 rounded-[var(--radius-lg)] border border-[var(--color-wrong-border)] bg-[var(--color-wrong-bg)] text-center overflow-hidden">
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, var(--color-wrong), transparent)", opacity: 0.06 }} />
              <span className="relative text-xl sm:text-2xl font-extrabold text-[var(--color-wrong)]" style={{ fontFamily: "var(--font-display)" }}>{wrongCount}</span>
              <span className="relative block text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] mt-1">Greșite</span>
            </div>
            <div className="relative p-3 sm:p-4 rounded-[var(--radius-lg)] border border-[var(--color-correct-border)] bg-[var(--color-correct-bg)] text-center overflow-hidden">
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, var(--color-correct), transparent)", opacity: 0.06 }} />
              <span className="relative text-xl sm:text-2xl font-extrabold text-[var(--color-correct)]" style={{ fontFamily: "var(--font-display)" }}>{correctCount}</span>
              <span className="relative block text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] mt-1">Corecte</span>
            </div>
            <div className="relative p-3 sm:p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-accent-muted)] text-center overflow-hidden">
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, var(--color-accent), transparent)", opacity: 0.06 }} />
              <span className="relative text-xl sm:text-2xl font-extrabold text-[var(--color-accent)]" style={{ fontFamily: "var(--font-display)" }}>{bookmarkCount}</span>
              <span className="relative block text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] mt-1">Marcate</span>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-4 animate-fade-in stagger-2">
            {([
              { key: "wrong" as Filter, label: "Greșite", count: wrongCount, color: "var(--color-wrong)" },
              { key: "correct" as Filter, label: "Corecte", count: correctCount, color: "var(--color-correct)" },
              { key: "bookmarked" as Filter, label: "Marcate", count: bookmarkCount, color: "var(--color-accent)" },
              { key: "all" as Filter, label: "Toate", count: Object.keys(session.answers).length, color: undefined },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer border",
                  filter === tab.key
                    ? "bg-[var(--color-accent)] text-[#0C0C0E] border-[var(--color-accent)] shadow-[0_0_20px_rgba(232,166,49,0.12)]"
                    : "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-hover)] active:scale-[0.97]"
                )}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Module filter */}
          <div className="flex flex-wrap items-center gap-2 mb-8 animate-fade-in stagger-3">
            <button
              onClick={() => setModuleFilter("all")}
              className={cn(
                "px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-medium transition-all duration-200 cursor-pointer border",
                moduleFilter === "all"
                  ? "bg-[var(--color-bg-hover)] text-[var(--color-text-primary)] border-[var(--color-border-strong)]"
                  : "text-[var(--color-text-tertiary)] border-transparent hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]"
              )}
            >
              Toate modulele
            </button>
            {modules.map((mod) => (
              <button
                key={mod.id}
                onClick={() => setModuleFilter(mod.id)}
                className={cn(
                  "px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-medium transition-all duration-200 cursor-pointer border",
                  moduleFilter === mod.id
                    ? "text-[var(--color-text-primary)] border-current"
                    : "text-[var(--color-text-tertiary)] border-transparent hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]"
                )}
                style={moduleFilter === mod.id ? { backgroundColor: `${mod.color}15`, color: mod.color, borderColor: `${mod.color}40` } : {}}
              >
                {mod.name}
              </button>
            ))}
          </div>

          {filteredQuestions.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-bg-tertiary)] mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  {filter === "wrong" ? (
                    <>
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                      <line x1="9" y1="9" x2="9.01" y2="9" />
                      <line x1="15" y1="9" x2="15.01" y2="9" />
                    </>
                  ) : filter === "bookmarked" ? (
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  ) : (
                    <>
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </>
                  )}
                </svg>
              </div>
              <p className="text-[var(--color-text-tertiary)] text-lg font-medium" style={{ fontFamily: "var(--font-display)" }}>
                {filter === "wrong"
                  ? "Nicio întrebare greșită. Bravo!"
                  : filter === "bookmarked"
                    ? "Nicio întrebare marcată."
                    : "Nicio întrebare rezolvată încă."}
              </p>
              <p className="text-sm text-[var(--color-text-tertiary)] mt-2 opacity-70">
                {filter === "wrong"
                  ? "Continuă tot așa, ești pe drumul cel bun."
                  : filter === "bookmarked"
                    ? "Marchează întrebări în timpul practicii pentru a le revizui mai târziu."
                    : "Începe o sesiune de practică pentru a vedea rezultate aici."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((question, index) => {
                const answer = session.answers[question.id];
                const isBookmarked = session.bookmarks.includes(question.id);

                return (
                  <Card
                    key={question.id}
                    className="p-5 animate-slide-up"
                    style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0" />
                      <button
                        onClick={() => toggleBookmark(question.id)}
                        className={cn(
                          "flex-shrink-0 p-2 rounded-[var(--radius-md)] transition-all duration-200 cursor-pointer",
                          isBookmarked
                            ? "text-[var(--color-accent)] hover:bg-[var(--color-accent-muted)]"
                            : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
                        )}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                      </button>
                    </div>

                    {question.code && (
                      <div className="mb-3">
                        <CodeBlock code={question.code} language={question.codeLanguage} className="text-xs" />
                      </div>
                    )}

                    <p className="text-sm text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap mb-3">
                      {question.text}
                    </p>

                    <div className="space-y-1.5">
                      {(Object.keys(question.options) as AnswerKey[]).map((key) => {
                        const isCorrectAnswer = key === question.correctAnswer;
                        const isUserAnswer = answer?.selected === key;
                        const isWrongSelection = isUserAnswer && !isCorrectAnswer;

                        return (
                          <div
                            key={key}
                            className={cn(
                              "flex items-start gap-2 px-3 py-2 rounded-[var(--radius-sm)] text-xs transition-colors",
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
                              isWrongSelection ? "text-[var(--color-wrong)]" : "",
                              isCodeLike(question.options[key]) && "font-mono"
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
