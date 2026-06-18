"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  CODE_LANGUAGES,
  PROGRESS_FILTERS,
  countActiveFilters,
  type AnswerLetter,
  type Presence,
  type ProgressFilter,
  type SearchCriteria,
  type SortKey,
} from "@/lib/search";
import { FieldLabel, Segmented, ToggleChip, triggerChipClass } from "./controls";

interface FiltersModalProps {
  criteria: SearchCriteria;
  update: (patch: Partial<SearchCriteria>) => void;
  onResetFilters: () => void;
  resultCount: number;
}

const PRESENCE_OPTIONS = (withLabel: string, withoutLabel: string) =>
  [
    { value: "any" as Presence, label: "Orice" },
    { value: "with" as Presence, label: withLabel },
    { value: "without" as Presence, label: withoutLabel },
  ];

const ANSWERS: AnswerLetter[] = ["a", "b", "c", "d"];

/**
 * The full filter control center, opened from the "Filtre" chip. Changes apply
 * live (the count in the footer updates as you tweak), so closing is optional.
 */
export function FiltersModal({ criteria, update, onResetFilters, resultCount }: FiltersModalProps) {
  const [open, setOpen] = useState(false);
  const active = countActiveFilters(criteria);

  const toggleLanguage = (id: string) => {
    const set = new Set(criteria.codeLanguages);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    update({ codeLanguages: [...set] });
  };

  const toggleProgress = (id: ProgressFilter) => {
    const set = new Set(criteria.progress);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    update({ progress: [...set] as ProgressFilter[] });
  };

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={triggerChipClass(active > 0)}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        Filtre
        {active > 0 && (
          <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-[var(--color-accent)] text-[#0C0C0E] text-[11px] font-bold tabular-nums">
            {active}
          </span>
        )}
      </button>

      {open &&
        createPortal(
          <Modal open onClose={() => setOpen(false)} title="Filtre" className="!max-w-lg">
            <div className="max-h-[62vh] overflow-y-auto -mx-1 px-1 space-y-5">
              {/* Code */}
              <div>
                <FieldLabel>Cod</FieldLabel>
                <Segmented
                  value={criteria.code}
                  onChange={(v) => update({ code: v, ...(v !== "with" ? { codeLanguages: [] } : {}) })}
                  options={PRESENCE_OPTIONS("Cu cod", "Fără cod")}
                />
                {criteria.code === "with" && (
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {CODE_LANGUAGES.map((lang) => (
                      <ToggleChip
                        key={lang.id}
                        active={criteria.codeLanguages.includes(lang.id)}
                        onClick={() => toggleLanguage(lang.id)}
                      >
                        {lang.label}
                      </ToggleChip>
                    ))}
                  </div>
                )}
              </div>

              {/* Figure */}
              <div>
                <FieldLabel>Figură / diagramă</FieldLabel>
                <Segmented
                  value={criteria.figure}
                  onChange={(v) => update({ figure: v })}
                  options={PRESENCE_OPTIONS("Cu figură", "Fără figură")}
                />
              </div>

              {/* Explanation */}
              <div>
                <FieldLabel>Explicație</FieldLabel>
                <Segmented
                  value={criteria.explanation}
                  onChange={(v) => update({ explanation: v })}
                  options={PRESENCE_OPTIONS("Cu explicație", "Fără")}
                />
              </div>

              {/* Progress */}
              <div>
                <FieldLabel>Progresul tău</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {PROGRESS_FILTERS.map((p) => (
                    <ToggleChip
                      key={p.id}
                      active={criteria.progress.includes(p.id)}
                      onClick={() => toggleProgress(p.id)}
                    >
                      {p.label}
                    </ToggleChip>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-[var(--color-text-tertiary)] leading-relaxed">
                  Folosește răspunsurile tale salvate (din practică și simulator).
                </p>
              </div>

              {/* Correct answer */}
              <div>
                <FieldLabel>Răspuns corect</FieldLabel>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => update({ correctAnswer: null })}
                    className={cn(
                      "flex-1 py-2 rounded-[var(--radius-md)] text-sm font-semibold transition-all duration-200 cursor-pointer border",
                      criteria.correctAnswer === null
                        ? "bg-[var(--color-accent)] text-[#0C0C0E] border-[var(--color-accent)]"
                        : "bg-[var(--color-bg-primary)] text-[var(--color-text-tertiary)] border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-hover)]",
                    )}
                  >
                    Orice
                  </button>
                  {ANSWERS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => update({ correctAnswer: criteria.correctAnswer === a ? null : a })}
                      className={cn(
                        "flex-1 py-2 rounded-[var(--radius-md)] text-sm font-bold uppercase transition-all duration-200 cursor-pointer border",
                        criteria.correctAnswer === a
                          ? "bg-[var(--color-accent)] text-[#0C0C0E] border-[var(--color-accent)]"
                          : "bg-[var(--color-bg-primary)] text-[var(--color-text-tertiary)] border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-hover)]",
                      )}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <FieldLabel>Sortare</FieldLabel>
                <Segmented
                  value={criteria.sort}
                  onChange={(v) => update({ sort: v as SortKey })}
                  options={[
                    { value: "relevance", label: "Relevanță" },
                    { value: "id", label: "După număr" },
                    { value: "random", label: "Aleatoriu" },
                  ]}
                />
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <Button variant="ghost" onClick={onResetFilters} disabled={active === 0}>
                Resetează
              </Button>
              <Button variant="primary" className="flex-1" onClick={() => setOpen(false)}>
                {resultCount === 1 ? "Vezi 1 rezultat" : `Vezi ${resultCount} rezultate`}
              </Button>
            </div>
          </Modal>,
          document.body,
        )}
    </>
  );
}
