"use client";

import { cn } from "@/lib/utils";

// The app's canonical pill switch (as used on Antrenament), but the whole row is
// one clickable control for better reach + a11y.
export function ToggleRow({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "w-full flex items-center gap-3.5 px-4 py-3 rounded-[var(--radius-lg)] border text-left transition-all cursor-pointer",
        checked
          ? "bg-[var(--color-accent-muted)] border-[var(--color-accent)]"
          : "bg-[var(--color-bg-primary)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]",
      )}
    >
      <span
        className={cn(
          "relative w-10 h-[22px] rounded-full transition-all duration-200 flex-shrink-0",
          checked ? "bg-[var(--color-accent)]" : "bg-[var(--color-border-strong)]",
        )}
      >
        <span
          className={cn(
            "absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
            checked && "translate-x-[18px]",
          )}
        />
      </span>
      <span className="min-w-0">
        <span className="text-sm font-medium block text-[var(--color-text-secondary)]">{label}</span>
        {description && (
          <span className="text-[11px] text-[var(--color-text-tertiary)]">{description}</span>
        )}
      </span>
    </button>
  );
}
