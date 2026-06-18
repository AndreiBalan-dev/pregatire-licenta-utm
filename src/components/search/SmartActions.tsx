"use client";

import { cn } from "@/lib/utils";

interface SmartActionsProps {
  onSurprise: () => void;
  onWeakSpots: () => void;
  weakAvailable: boolean;
  onCopyLink: () => void;
}

const base =
  "inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] text-sm font-medium border transition-all duration-200 cursor-pointer active:scale-[0.98] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-hover)]";

/** "Really cool smart things": random set, weak-spot auto-filter, shareable link. */
export function SmartActions({ onSurprise, onWeakSpots, weakAvailable, onCopyLink }: SmartActionsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button type="button" onClick={onSurprise} className={base}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M16 3h5v5" />
          <path d="M4 20 21 3" />
          <path d="M21 16v5h-5" />
          <path d="M15 15l6 6" />
          <path d="M4 4l5 5" />
        </svg>
        Surprinde-mă
      </button>

      <button
        type="button"
        onClick={onWeakSpots}
        disabled={!weakAvailable}
        title={weakAvailable ? undefined : "Rezolvă câteva întrebări întâi ca să-ți știu punctele slabe"}
        className={cn(base, "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none")}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1" />
        </svg>
        Puncte slabe
      </button>

      <button type="button" onClick={onCopyLink} className={base} aria-label="Copiază linkul căutării">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <span className="hidden sm:inline">Copiază link</span>
      </button>
    </div>
  );
}
