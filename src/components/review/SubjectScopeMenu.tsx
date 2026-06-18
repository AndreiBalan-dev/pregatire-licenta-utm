"use client";

import { type ReactNode, useState } from "react";
import { createPortal } from "react-dom";
import { Modal } from "@/components/ui/Modal";
import { SubjectIcon } from "@/components/ui/SubjectIcon";
import { cn } from "@/lib/utils";
import type { Scope, ScopeOptions } from "@/lib/redo-scope";

interface SubjectScopeMenuProps {
  options: ScopeOptions;
  value: Scope;
  onChange: (scope: Scope) => void;
  /** Accent used for the active state + count. Defaults to the app accent. */
  accentColor?: string;
}

function scopeKey(scope: Scope): string {
  return scope.kind === "all" ? "all" : `${scope.kind}:${scope.id}`;
}

/** The label + count to show on the trigger for the current selection. */
function currentSelection(options: ScopeOptions, value: Scope): { label: string; count: number } {
  if (value.kind === "module") {
    const mod = options.modules.find((m) => m.id === value.id);
    if (mod) return { label: mod.name, count: mod.count };
  } else if (value.kind === "subject") {
    for (const mod of options.modules) {
      const subj = mod.subjects.find((s) => s.id === value.id);
      if (subj) return { label: subj.name, count: subj.count };
    }
  }
  return { label: "Toate materiile", count: options.total };
}

/**
 * Single-select picker for narrowing a redo pool to everything, one module, or
 * one materie. The trigger opens a centered Modal (rendered through a portal to
 * document.body, so it can't be clipped or mispositioned by transformed/
 * overflow-hidden ancestors). Options come pre-grouped in `options`.
 */
export function SubjectScopeMenu({ options, value, onChange, accentColor = "var(--color-accent)" }: SubjectScopeMenuProps) {
  const [open, setOpen] = useState(false);
  const { label, count } = currentSelection(options, value);
  const activeKey = scopeKey(value);

  const select = (scope: Scope) => {
    onChange(scope);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="group w-full flex items-center justify-between gap-2 px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-left transition-all duration-200 cursor-pointer hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-hover)]"
      >
        <span className="flex items-center gap-2 min-w-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0" aria-hidden="true">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span className="text-xs font-semibold text-[var(--color-text-primary)] truncate">{label}</span>
          <span className="text-xs tabular-nums font-bold flex-shrink-0" style={{ color: accentColor }}>{count}</span>
        </span>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className="flex-shrink-0 text-[var(--color-text-tertiary)] transition-colors group-hover:text-[var(--color-text-secondary)]"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open &&
        createPortal(
          <Modal open onClose={() => setOpen(false)} title="Alege materia" className="!max-w-md">
            <p className="text-sm text-[var(--color-text-tertiary)] -mt-2 mb-4">
              Reia doar dintr-o anumită materie sau dintr-un modul întreg.
            </p>
            <div className="max-h-[58vh] overflow-y-auto -mx-1 px-1 space-y-0.5">
              <ScopeRow
                label="Toate materiile"
                count={options.total}
                active={activeKey === "all"}
                accentColor={accentColor}
                onSelect={() => select({ kind: "all" })}
                emphasis
                leading={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                }
              />
              <div className="my-1.5 h-px bg-[var(--color-border)]" />
              {options.modules.map((mod) => (
                <div key={mod.id} className="space-y-0.5">
                  <ScopeRow
                    label={mod.name}
                    count={mod.count}
                    active={activeKey === `module:${mod.id}`}
                    accentColor={accentColor}
                    onSelect={() => select({ kind: "module", id: mod.id })}
                    emphasis
                    leading={<span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: mod.color }} />}
                  />
                  {mod.subjects.map((subj) => (
                    <ScopeRow
                      key={subj.id}
                      label={subj.name}
                      count={subj.count}
                      active={activeKey === `subject:${subj.id}`}
                      accentColor={accentColor}
                      onSelect={() => select({ kind: "subject", id: subj.id })}
                      indent
                      leading={<SubjectIcon subjectId={subj.id} size={15} />}
                    />
                  ))}
                </div>
              ))}
            </div>
          </Modal>,
          document.body,
        )}
    </>
  );
}

interface ScopeRowProps {
  label: string;
  count: number;
  active: boolean;
  accentColor: string;
  onSelect: () => void;
  leading?: ReactNode;
  indent?: boolean;
  emphasis?: boolean;
}

function ScopeRow({ label, count, active, accentColor, onSelect, leading, indent, emphasis }: ScopeRowProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "relative w-full flex items-center gap-2.5 py-2.5 pr-2.5 rounded-[var(--radius-md)] text-left transition-colors cursor-pointer",
        indent ? "pl-9" : "pl-3",
        active ? "bg-[var(--color-bg-hover)]" : "hover:bg-[var(--color-bg-tertiary)]",
      )}
    >
      {active && (
        <span className="absolute left-1 top-2 bottom-2 w-[3px] rounded-full" style={{ backgroundColor: accentColor }} aria-hidden="true" />
      )}
      {leading && (
        <span
          className="inline-flex items-center justify-center flex-shrink-0 text-[var(--color-text-tertiary)]"
          style={active ? { color: accentColor } : undefined}
        >
          {leading}
        </span>
      )}
      <span
        className={cn(
          "flex-1 min-w-0 truncate",
          emphasis ? "text-sm font-semibold" : "text-[13px]",
          active || emphasis ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "flex-shrink-0 tabular-nums text-xs font-semibold px-1.5 py-0.5 rounded-full",
          active ? "text-[var(--color-text-primary)] bg-[var(--color-bg-tertiary)]" : "text-[var(--color-text-tertiary)]",
        )}
      >
        {count}
      </span>
      {active && (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}
