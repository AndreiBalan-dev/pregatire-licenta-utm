"use client";

import { useEffect } from "react";

interface KeyboardHintPopupProps {
  visible: boolean;
  /** Bumped on each fresh show so the bar/timer restart. */
  nonce: number;
  onDismiss: () => void;
}

const HINT_MS = 5000;

function Keycap({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <kbd
      className={
        "inline-flex items-center justify-center h-5 rounded border border-[var(--color-border-strong)] " +
        "bg-[var(--color-bg-primary)] text-[10px] font-semibold text-[var(--color-text-primary)] font-mono " +
        (wide ? "px-1.5" : "w-5")
      }
    >
      {children}
    </kbd>
  );
}

/**
 * Transient, desktop-only reminder of the keyboard commands. Auto-hides after 5s
 * (depleting bar) and dismisses on any click.
 */
export function KeyboardHintPopup({ visible, nonce, onDismiss }: KeyboardHintPopupProps) {
  useEffect(() => {
    if (!visible) return;
    const id = setTimeout(onDismiss, HINT_MS);
    return () => clearTimeout(id);
  }, [visible, nonce, onDismiss]);

  // Dismiss on any click. Attached next tick so the click that opened it (e.g. the
  // toggle button) does not instantly close it.
  useEffect(() => {
    if (!visible) return;
    const onClick = () => onDismiss();
    const id = setTimeout(() => document.addEventListener("click", onClick), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener("click", onClick);
    };
  }, [visible, nonce, onDismiss]);

  if (!visible) return null;

  return (
    <div className="hidden md:block fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
      <div
        onClick={onDismiss}
        role="status"
        className="cursor-pointer overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-strong)] bg-[var(--color-bg-secondary)] shadow-[var(--shadow-lg)] animate-slide-up"
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="text-[var(--color-accent)]" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" />
            </svg>
          </span>
          <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary)] whitespace-nowrap">
            <span className="inline-flex items-center gap-1.5"><Keycap>↑</Keycap><Keycap>↓</Keycap> navighezi</span>
            <span className="w-px h-3 bg-[var(--color-border)]" />
            <span className="inline-flex items-center gap-1.5"><Keycap wide>Space</Keycap> confirmi</span>
            <span className="w-px h-3 bg-[var(--color-border)]" />
            <span className="inline-flex items-center gap-1.5"><Keycap>←</Keycap><Keycap>→</Keycap> schimbi întrebarea</span>
          </div>
        </div>
        <div className="h-0.5 w-full bg-[var(--color-border)]">
          <div key={nonce} className="hint-bar h-full bg-[var(--color-accent)]" />
        </div>
      </div>
    </div>
  );
}
