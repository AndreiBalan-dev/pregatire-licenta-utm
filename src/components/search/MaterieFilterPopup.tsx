"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Modal } from "@/components/ui/Modal";
import { SubjectIcon } from "@/components/ui/SubjectIcon";
import { Button } from "@/components/ui/Button";
import { modules } from "@/data/modules";
import { questionsBySubject } from "@/data";
import { cn } from "@/lib/utils";
import { triggerChipClass } from "./controls";

interface MaterieFilterPopupProps {
  subjectIds: string[];
  onChange: (subjectIds: string[]) => void;
}

function Check({ state }: { state: "on" | "off" | "partial" }) {
  return (
    <span
      className={cn(
        "w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0",
        state === "off"
          ? "border-[var(--color-border-strong)]"
          : "bg-[var(--color-accent)] border-[var(--color-accent)]",
      )}
      aria-hidden="true"
    >
      {state === "on" && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0C0C0E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      {state === "partial" && <span className="w-2.5 h-0.5 rounded-full bg-[#0C0C0E]" />}
    </span>
  );
}

/**
 * Multi-select materie/modul picker. The trigger opens a centered Modal (through
 * a portal to document.body, so transformed/overflow ancestors can't clip it).
 * Selecting a module toggles all of its materii. Operates purely on subjectIds.
 */
export function MaterieFilterPopup({ subjectIds, onChange }: MaterieFilterPopupProps) {
  const [open, setOpen] = useState(false);
  const selected = new Set(subjectIds);

  const toggleSubject = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange([...next]);
  };

  const toggleModule = (moduleSubjectIds: string[]) => {
    const allOn = moduleSubjectIds.every((id) => selected.has(id));
    const next = new Set(selected);
    if (allOn) moduleSubjectIds.forEach((id) => next.delete(id));
    else moduleSubjectIds.forEach((id) => next.add(id));
    onChange([...next]);
  };

  const count = subjectIds.length;
  const label = count === 0 ? "Materie" : count === 1 ? "1 materie" : `${count} materii`;

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={triggerChipClass(count > 0)}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
        {label}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="opacity-70">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open &&
        createPortal(
          <Modal open onClose={() => setOpen(false)} title="Alege materiile" className="!max-w-md">
            <div className="flex items-center justify-between gap-2 -mt-2 mb-3">
              <span className="text-sm text-[var(--color-text-tertiary)]">
                {count === 0 ? "Toate materiile" : `${count} ${count === 1 ? "aleasă" : "alese"}`}
              </span>
              <Button variant="ghost" size="sm" onClick={() => onChange([])} disabled={count === 0}>
                Niciuna
              </Button>
            </div>

            <div className="max-h-[56vh] overflow-y-auto -mx-1 px-1 space-y-3">
              {modules.map((mod) => {
                const subjIds = mod.subjects.map((s) => s.id);
                const allOn = subjIds.every((id) => selected.has(id));
                const someOn = !allOn && subjIds.some((id) => selected.has(id));
                return (
                  <div key={mod.id}>
                    <button
                      type="button"
                      onClick={() => toggleModule(subjIds)}
                      className="w-full flex items-center gap-2.5 px-2 py-2 rounded-[var(--radius-md)] hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer"
                    >
                      <Check state={allOn ? "on" : someOn ? "partial" : "off"} />
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: mod.color }} aria-hidden="true" />
                      <span className="flex-1 min-w-0 text-left text-sm font-bold text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
                        {mod.name}
                      </span>
                      <span className="text-xs text-[var(--color-text-tertiary)]">{mod.subjects.length}</span>
                    </button>

                    <div className="mt-0.5 pl-3 space-y-0.5">
                      {mod.subjects.map((subject) => {
                        const isOn = selected.has(subject.id);
                        const total = questionsBySubject[subject.id]?.length ?? 0;
                        return (
                          <button
                            key={subject.id}
                            type="button"
                            onClick={() => toggleSubject(subject.id)}
                            className={cn(
                              "w-full flex items-center gap-2.5 px-2 py-2 rounded-[var(--radius-md)] transition-colors cursor-pointer",
                              isOn ? "bg-[var(--color-accent-muted)]" : "hover:bg-[var(--color-bg-tertiary)]",
                            )}
                          >
                            <Check state={isOn ? "on" : "off"} />
                            <span
                              className="inline-flex items-center flex-shrink-0"
                              style={{ color: isOn ? "var(--color-accent)" : "var(--color-text-tertiary)" }}
                            >
                              <SubjectIcon subjectId={subject.id} size={15} />
                            </span>
                            <span
                              className={cn(
                                "flex-1 min-w-0 text-left text-[13px] truncate",
                                isOn ? "text-[var(--color-text-primary)] font-medium" : "text-[var(--color-text-secondary)]",
                              )}
                            >
                              {subject.name}
                            </span>
                            <span className="text-xs tabular-nums text-[var(--color-text-tertiary)]">{total}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4">
              <Button variant="primary" className="w-full" onClick={() => setOpen(false)}>
                Gata
              </Button>
            </div>
          </Modal>,
          document.body,
        )}
    </>
  );
}
