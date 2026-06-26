"use client";

import { useProvocareSound } from "@/hooks/useProvocareSound";
import { cn } from "@/lib/utils";

export function SoundToggle({ className }: { className?: string }) {
  const { muted, toggleMuted, play } = useProvocareSound();

  return (
    <button
      type="button"
      onClick={() => {
        const wasMuted = muted;
        toggleMuted();
        if (wasMuted) play("select"); // a tiny blip so they hear it came on
      }}
      aria-label={muted ? "Activează sunetul" : "Dezactivează sunetul"}
      aria-pressed={!muted}
      title={muted ? "Sunet oprit" : "Sunet pornit"}
      className={cn(
        "inline-flex items-center justify-center w-9 h-9 rounded-[var(--radius-md)] border transition-colors cursor-pointer",
        muted
          ? "border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
          : "border-[var(--color-accent)] bg-[var(--color-accent-muted)] text-[var(--color-accent)]",
        className,
      )}
    >
      {muted ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      )}
    </button>
  );
}
