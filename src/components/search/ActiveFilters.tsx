"use client";

import { modules } from "@/data/modules";
import {
  CODE_LANGUAGES,
  PROGRESS_FILTERS,
  type ProgressFilter,
  type SearchCriteria,
} from "@/lib/search";

const SUBJECT_NAME = new Map<string, string>();
for (const mod of modules) {
  for (const subject of mod.subjects) SUBJECT_NAME.set(subject.id, subject.name);
}
const LANG_LABEL = new Map(CODE_LANGUAGES.map((l) => [l.id as string, l.label]));
const PROGRESS_LABEL = new Map(PROGRESS_FILTERS.map((p) => [p.id, p.label]));

interface Pill {
  key: string;
  label: string;
  onRemove: () => void;
}

interface ActiveFiltersProps {
  criteria: SearchCriteria;
  update: (patch: Partial<SearchCriteria>) => void;
  onClearAll: () => void;
}

/** Removable chips for every active facet, so the user can drop one at a time. */
export function ActiveFilters({ criteria, update, onClearAll }: ActiveFiltersProps) {
  const pills: Pill[] = [];

  for (const id of criteria.subjectIds) {
    pills.push({
      key: `mat-${id}`,
      label: SUBJECT_NAME.get(id) ?? id,
      onRemove: () => update({ subjectIds: criteria.subjectIds.filter((s) => s !== id) }),
    });
  }

  if (criteria.code !== "any") {
    pills.push({
      key: "cod",
      label: criteria.code === "with" ? "Cu cod" : "Fără cod",
      onRemove: () => update({ code: "any", codeLanguages: [] }),
    });
  }
  if (criteria.code === "with") {
    for (const lang of criteria.codeLanguages) {
      pills.push({
        key: `lang-${lang}`,
        label: LANG_LABEL.get(lang) ?? lang,
        onRemove: () => update({ codeLanguages: criteria.codeLanguages.filter((l) => l !== lang) }),
      });
    }
  }

  if (criteria.figure !== "any") {
    pills.push({
      key: "fig",
      label: criteria.figure === "with" ? "Cu figură" : "Fără figură",
      onRemove: () => update({ figure: "any" }),
    });
  }

  if (criteria.explanation !== "any") {
    pills.push({
      key: "exp",
      label: criteria.explanation === "with" ? "Cu explicație" : "Fără explicație",
      onRemove: () => update({ explanation: "any" }),
    });
  }

  for (const p of criteria.progress) {
    pills.push({
      key: `prog-${p}`,
      label: PROGRESS_LABEL.get(p) ?? p,
      onRemove: () => update({ progress: criteria.progress.filter((x) => x !== p) as ProgressFilter[] }),
    });
  }

  if (criteria.correctAnswer) {
    pills.push({
      key: "corect",
      label: `Corect: ${criteria.correctAnswer.toUpperCase()}`,
      onRemove: () => update({ correctAnswer: null }),
    });
  }

  if (pills.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {pills.map((pill) => (
        <span
          key={pill.key}
          className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full text-xs font-medium bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)]"
        >
          {pill.label}
          <button
            type="button"
            onClick={pill.onRemove}
            aria-label={`Elimină filtrul ${pill.label}`}
            className="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-[var(--color-accent)] hover:text-[#0C0C0E] transition-colors cursor-pointer"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={onClearAll}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-[var(--color-text-tertiary)] hover:text-[var(--color-wrong)] hover:bg-[var(--color-wrong-bg)] transition-colors cursor-pointer"
      >
        Șterge tot
      </button>
    </div>
  );
}
