"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
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
 * Single-select dropdown for narrowing a redo pool to everything, one module, or
 * one materie (subject). Modules and materii come pre-grouped/counted in
 * `options` (see buildScopeOptions). Closes on select, outside click, or Escape.
 */
export function SubjectScopeMenu({ options, value, onChange, accentColor = "var(--color-accent)" }: SubjectScopeMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const { label, count } = currentSelection(options, value);
  const activeKey = scopeKey(value);

  const select = (scope: Scope) => {
    onChange(scope);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-[var(--radius-md)] border text-left transition-all duration-200 cursor-pointer",
          open
            ? "border-[var(--color-border-strong)] bg-[var(--color-bg-hover)]"
            : "border-[var(--color-border)] bg-[var(--color-bg-primary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-hover)]",
        )}
      >
        <span className="flex items-center gap-1.5 min-w-0">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0" aria-hidden="true">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span className="text-xs font-semibold text-[var(--color-text-primary)] truncate">{label}</span>
          <span className="text-xs tabular-nums flex-shrink-0" style={{ color: accentColor }}>· {count}</span>
        </span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={cn("flex-shrink-0 text-[var(--color-text-tertiary)] transition-transform duration-200", open && "rotate-180")}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Filtrează după materie"
          className="absolute z-30 left-0 right-0 mt-1.5 max-h-72 overflow-auto rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg-secondary)] shadow-[var(--shadow-lg)] p-1 animate-fade-in"
        >
          <ScopeRow
            label="Toate materiile"
            count={options.total}
            active={activeKey === "all"}
            accentColor={accentColor}
            onSelect={() => select({ kind: "all" })}
            emphasis
          />
          {options.modules.map((mod) => (
            <div key={mod.id} className="mt-0.5">
              <ScopeRow
                label={mod.name}
                count={mod.count}
                active={activeKey === `module:${mod.id}`}
                accentColor={accentColor}
                onSelect={() => select({ kind: "module", id: mod.id })}
                leading={<span className="w-2 h-2 rounded-full" style={{ backgroundColor: mod.color }} />}
                emphasis
              />
              {mod.subjects.map((subj) => (
                <ScopeRow
                  key={subj.id}
                  label={subj.name}
                  count={subj.count}
                  active={activeKey === `subject:${subj.id}`}
                  accentColor={accentColor}
                  onSelect={() => select({ kind: "subject", id: subj.id })}
                  leading={<SubjectIcon subjectId={subj.id} size={14} className="text-[var(--color-text-tertiary)]" />}
                  indent
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
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
      role="option"
      aria-selected={active}
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--radius-sm)] text-left transition-colors cursor-pointer",
        indent && "pl-8",
        active ? "bg-[var(--color-accent-muted)]" : "hover:bg-[var(--color-bg-hover)]",
      )}
    >
      {leading && (
        <span className="inline-flex items-center justify-center w-3.5 flex-shrink-0 text-[var(--color-text-tertiary)]">
          {leading}
        </span>
      )}
      <span
        className={cn(
          "flex-1 min-w-0 truncate text-xs",
          emphasis ? "font-semibold text-[var(--color-text-primary)]" : "font-medium",
          !emphasis && (active ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"),
        )}
      >
        {label}
      </span>
      <span className="text-[11px] tabular-nums text-[var(--color-text-tertiary)] flex-shrink-0">{count}</span>
      {active && (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}
