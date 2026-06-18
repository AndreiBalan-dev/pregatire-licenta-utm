"use client";

import { cn } from "@/lib/utils";

/** Small uppercase section label used inside the filters popup. */
export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-tertiary)] mb-2 block">
      {children}
    </span>
  );
}

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

/** Single-select pill group (e.g. Orice / Cu cod / Fara cod), styled like the practica selectors. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={cn(
              "flex-1 py-2 px-1 rounded-[var(--radius-md)] text-[11px] sm:text-sm font-semibold leading-tight transition-all duration-200 cursor-pointer border",
              active
                ? "bg-[var(--color-accent)] text-[#0C0C0E] border-[var(--color-accent)] shadow-[0_0_20px_rgba(232,166,49,0.12)]"
                : "bg-[var(--color-bg-primary)] text-[var(--color-text-tertiary)] border-[var(--color-border)] hover:text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-hover)] active:scale-[0.97]",
            )}
            style={{ fontFamily: active ? "var(--font-display)" : undefined }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** Multi-select rounded chip (e.g. a code language, a progress filter). */
export function ToggleChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer active:scale-[0.97]",
        active
          ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)] border-[var(--color-accent)]"
          : "bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-hover)]",
      )}
    >
      {children}
    </button>
  );
}

/** Shared trigger-chip style for the Materie and Filtre buttons in the toolbar. */
export function triggerChipClass(active: boolean): string {
  return cn(
    "inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] text-sm font-medium border transition-all duration-200 cursor-pointer active:scale-[0.98]",
    active
      ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)] border-[var(--color-accent)]"
      : "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-hover)]",
  );
}
