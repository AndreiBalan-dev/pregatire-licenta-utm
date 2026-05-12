"use client";

import { cn } from "@/lib/utils";

interface ExamFeedbackToggleProps {
  enabled: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  hint?: string;
}

export function ExamFeedbackToggle({ enabled, onChange, disabled, hint }: ExamFeedbackToggleProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-lg)] border bg-[var(--color-bg-secondary)] transition-all",
        enabled
          ? "border-[var(--color-accent)] shadow-[0_0_24px_rgba(232,166,49,0.08)]"
          : "border-[var(--color-border)]",
        disabled && "opacity-60",
      )}
    >
      {enabled && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 70% 60% at 0% 50%, var(--color-accent), transparent 60%)",
            opacity: 0.05,
          }}
        />
      )}
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label="Feedback instant pe parcursul examenului"
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        className="relative w-full text-left p-4 sm:p-5 flex items-start gap-4 cursor-pointer disabled:cursor-not-allowed"
      >
        {/* Icon */}
        <div
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center transition-colors",
            enabled
              ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
              : "bg-[var(--color-bg-primary)] text-[var(--color-text-tertiary)]",
          )}
          aria-hidden="true"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-1">
            <span
              className={cn(
                "text-sm sm:text-base font-bold transition-colors",
                enabled ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]",
              )}
              style={{ fontFamily: "var(--font-display)" }}
            >
              Feedback instant
            </span>
            {/* Switch */}
            <span
              className={cn(
                "relative inline-flex w-11 h-[24px] rounded-full transition-all duration-200 flex-shrink-0",
                enabled ? "bg-[var(--color-accent)]" : "bg-[var(--color-border-strong)]",
              )}
              aria-hidden="true"
            >
              <span
                className={cn(
                  "absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-200",
                  enabled && "translate-x-[20px]",
                )}
              />
            </span>
          </div>
          <p className="text-xs sm:text-[13px] leading-relaxed text-[var(--color-text-tertiary)]">
            Vezi imediat dacă răspunsul e corect sau greșit, chiar pe parcursul examenului. Răspunsul se blochează când îl alegi. Ideal când înveți activ.
          </p>
          {hint && (
            <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-text-tertiary)] italic">
              {hint}
            </p>
          )}
        </div>
      </button>
    </div>
  );
}
