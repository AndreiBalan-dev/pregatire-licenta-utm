"use client";

import { useState } from "react";
import { modules } from "@/data/modules";
import { questionsBySubject } from "@/data";
import { cn, formatPercentage } from "@/lib/utils";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/Button";
import type { Module } from "@/data/types";

interface SubjectSelectorProps {
  selectedSubjects: string[];
  onToggleSubject: (id: string) => void;
  onSelectAllModule: (moduleId: string) => void;
  onDeselectAllModule: (moduleId: string) => void;
  onResetSubject?: (subjectId: string) => void;
}

export function SubjectSelector({
  selectedSubjects,
  onToggleSubject,
  onSelectAllModule,
  onDeselectAllModule,
  onResetSubject,
}: SubjectSelectorProps) {
  const [expandedModules, setExpandedModules] = useState<string[]>(modules.map((m) => m.id));
  const { session } = useSession();

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const allModuleSubjectsSelected = (mod: Module) =>
    mod.subjects.every((s) => selectedSubjects.includes(s.id));

  return (
    <div className="space-y-3">
      {modules.map((mod) => {
        const isExpanded = expandedModules.includes(mod.id);
        const allSelected = allModuleSubjectsSelected(mod);
        const moduleAnswered = mod.subjects.reduce((sum, s) => {
          const questions = questionsBySubject[s.id] || [];
          return sum + questions.filter((q) => session.answers[q.id]).length;
        }, 0);
        const moduleTotal = mod.subjects.reduce((sum, s) => {
          return sum + (questionsBySubject[s.id]?.length || 0);
        }, 0);

        return (
          <div
            key={mod.id}
            className="border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-bg-secondary)]"
          >
            <button
              onClick={() => toggleModule(mod.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-1 h-8 rounded-full"
                  style={{ backgroundColor: mod.color }}
                />
                <div className="text-left">
                  <h3
                    className="text-base font-bold text-[var(--color-text-primary)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {mod.name}
                  </h3>
                  <span className="text-xs text-[var(--color-text-tertiary)]">
                    {moduleAnswered}/{moduleTotal} rezolvate
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    allSelected
                      ? onDeselectAllModule(mod.id)
                      : onSelectAllModule(mod.id);
                  }}
                >
                  {allSelected ? "Deselectează" : "Selectează tot"}
                </Button>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={cn(
                    "text-[var(--color-text-tertiary)] transition-transform",
                    isExpanded && "rotate-180"
                  )}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-[var(--color-border)] px-4 py-2 space-y-1">
                {mod.subjects.map((subject) => {
                  const questions = questionsBySubject[subject.id] || [];
                  const answered = questions.filter((q) => session.answers[q.id]).length;
                  const correct = questions.filter((q) => session.answers[q.id]?.isCorrect).length;
                  const isSelected = selectedSubjects.includes(subject.id);
                  const pct = formatPercentage(answered, questions.length);

                  return (
                    <label
                      key={subject.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-[var(--radius-md)] cursor-pointer transition-colors",
                        isSelected
                          ? "bg-[var(--color-accent-muted)]"
                          : "hover:bg-[var(--color-bg-hover)]"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSubject(subject.id)}
                        className="sr-only"
                      />
                      <div
                        className={cn(
                          "w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0",
                          isSelected
                            ? "bg-[var(--color-accent)] border-[var(--color-accent)]"
                            : "border-[var(--color-border-strong)]"
                        )}
                      >
                        {isSelected && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0C0C0E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={cn(
                            "text-sm font-medium truncate",
                            isSelected ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"
                          )}>
                            {subject.icon} {subject.name}
                          </span>
                          <span className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-xs text-[var(--color-text-tertiary)]">
                              {answered}/{questions.length}
                            </span>
                            {answered > 0 && onResetSubject && (
                              <button
                                type="button"
                                onPointerDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (confirm(`Resetezi progresul pentru ${subject.name}? (${answered} răspunsuri vor fi șterse)`)) {
                                    onResetSubject(subject.id);
                                  }
                                }}
                                className="p-0.5 rounded text-[var(--color-text-tertiary)] hover:text-[var(--color-wrong)] hover:bg-[var(--color-wrong-bg)] transition-colors cursor-pointer"
                                title="Resetează progresul"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="1 4 1 10 7 10" />
                                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                                </svg>
                              </button>
                            )}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: mod.color,
                            }}
                          />
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
