"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type RedoScope = "all" | "wrong";
export type OrderChoice = "same" | "shuffled";

/* ----- Scope: "Doar greșite (N)" vs all ----- */

interface ScopeSelectorProps {
  scope: RedoScope;
  onScope: (s: RedoScope) => void;
  wrongCount: number;
  allCount: number;
  /** Label for the "everything" option, e.g. "Toată sesiunea" or "Toate (36)". */
  allLabel: string;
}

export function ScopeSelector({ scope, onScope, wrongCount, allCount, allLabel }: ScopeSelectorProps) {
  const noWrong = wrongCount === 0;
  return (
    <div>
      <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-tertiary)] mb-2.5 block">
        Ce reiei
      </span>
      <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Ce reiei">
        <ScopeCard
          label="Doar greșite"
          count={wrongCount}
          accent="var(--color-wrong)"
          selected={scope === "wrong"}
          disabled={noWrong}
          onSelect={() => onScope("wrong")}
        />
        <ScopeCard
          label={allLabel}
          count={allCount}
          accent="var(--color-accent)"
          selected={scope === "all"}
          onSelect={() => onScope("all")}
        />
      </div>
    </div>
  );
}

interface ScopeCardProps {
  label: string;
  count: number;
  accent: string;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

function ScopeCard({ label, count, accent, selected, disabled, onSelect }: ScopeCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "relative text-left p-3.5 rounded-[var(--radius-md)] border transition-all duration-200",
        disabled
          ? "opacity-40 cursor-not-allowed border-[var(--color-border)] bg-[var(--color-bg-primary)]"
          : selected
            ? "cursor-pointer border-[var(--color-accent)] bg-[var(--color-accent-muted)] shadow-[0_0_18px_rgba(232,166,49,0.1)]"
            : "cursor-pointer border-[var(--color-border)] bg-[var(--color-bg-primary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-hover)]",
      )}
    >
      <span className="flex items-baseline gap-1.5">
        <span className="text-xl font-bold tabular-nums" style={{ color: accent, fontFamily: "var(--font-display)" }}>
          {count}
        </span>
      </span>
      <span className="block text-xs font-medium text-[var(--color-text-secondary)] mt-0.5">{label}</span>
    </button>
  );
}

/* ----- Order: same vs shuffled ----- */

interface OrderSelectorProps {
  choice: OrderChoice;
  onChoice: (c: OrderChoice) => void;
}

export function OrderSelector({ choice, onChoice }: OrderSelectorProps) {
  return (
    <div className="space-y-2.5" role="radiogroup" aria-label="Ordinea întrebărilor">
      <OrderCard
        label="Aceeași ordine"
        description="Grilele apar fix în ordinea de data trecută. Util dacă vrei să refaci pas cu pas."
        selected={choice === "same"}
        onSelect={() => onChoice("same")}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        }
      />
      <OrderCard
        label="Amestecă ordinea"
        description="Aceleași grile, ordine nouă. Te ajută să recunoști întrebările pe conținut, nu pe poziție."
        selected={choice === "shuffled"}
        onSelect={() => onChoice("shuffled")}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="16 3 21 3 21 8" />
            <line x1="4" y1="20" x2="21" y2="3" />
            <polyline points="21 16 21 21 16 21" />
            <line x1="15" y1="15" x2="21" y2="21" />
            <line x1="4" y1="4" x2="9" y2="9" />
          </svg>
        }
      />
    </div>
  );
}

interface OrderCardProps {
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
}

function OrderCard({ label, description, selected, onSelect, icon }: OrderCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "relative w-full text-left p-3.5 rounded-[var(--radius-md)] border cursor-pointer transition-all duration-200 flex items-start gap-3",
        selected
          ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)] shadow-[0_0_18px_rgba(232,166,49,0.1)]"
          : "border-[var(--color-border)] bg-[var(--color-bg-primary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-hover)]",
      )}
    >
      <span
        className={cn(
          "flex-shrink-0 mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
          selected ? "border-[var(--color-accent)] bg-[var(--color-accent)]" : "border-[var(--color-border-strong)] bg-transparent",
        )}
        aria-hidden="true"
      >
        {selected && <span className="w-1.5 h-1.5 rounded-full bg-[#0C0C0E]" />}
      </span>
      <span className={cn("flex-shrink-0 mt-0.5 transition-colors", selected ? "text-[var(--color-accent)]" : "text-[var(--color-text-tertiary)]")}>
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className={cn("block text-sm font-semibold mb-0.5", selected ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]")}>
          {label}
        </span>
        <span className="block text-[11px] sm:text-xs leading-relaxed text-[var(--color-text-tertiary)]">{description}</span>
      </span>
    </button>
  );
}

/* ----- Shuffle answers toggle ----- */

interface ShuffleAnswersToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
}

export function ShuffleAnswersToggle({ value, onChange }: ShuffleAnswersToggleProps) {
  return (
    <label
      className={cn(
        "flex items-center gap-3 p-3.5 rounded-[var(--radius-md)] border cursor-pointer transition-all duration-200",
        value
          ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)] shadow-[0_0_18px_rgba(232,166,49,0.1)]"
          : "border-[var(--color-border)] bg-[var(--color-bg-primary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-hover)]",
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label="Amestecă ordinea răspunsurilor"
        onClick={() => onChange(!value)}
        className={cn(
          "relative w-11 h-[24px] rounded-full transition-all duration-200 flex-shrink-0 cursor-pointer",
          value ? "bg-[var(--color-accent)]" : "bg-[var(--color-border-strong)]",
        )}
      >
        <span className={cn("absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-200", value && "translate-x-[20px]")} />
      </button>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold text-[var(--color-text-primary)] mb-0.5">Amestecă și răspunsurile</span>
        <span className="block text-[11px] sm:text-xs leading-relaxed text-[var(--color-text-tertiary)]">
          Variantele de răspuns apar în altă ordine la fiecare grilă, ca să nu memorezi răspunsul după poziție.
        </span>
      </span>
    </label>
  );
}
