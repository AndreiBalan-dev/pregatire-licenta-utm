"use client";

import { cn } from "@/lib/utils";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";

/**
 * Navbar button that turns desktop keyboard navigation on/off. Desktop only
 * (wrapped hidden md:inline-flex by the Header), next to the highlighter toggle.
 */
export function KeyboardNavToggle() {
  const { on, toggle } = useKeyboardNav();

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={on}
      aria-label="Control cu tastatura"
      title={on ? "Control cu tastatura pornit (sageti + Space)" : "Control cu tastatura oprit"}
      className={cn(
        "relative p-2 rounded-[var(--radius-md)] transition-colors cursor-pointer",
        on
          ? "text-[var(--color-accent)] bg-[var(--color-accent-muted)] shadow-[0_0_12px_rgba(232,166,49,0.18)]"
          : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]",
      )}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" />
      </svg>
      {on && (
        <span aria-hidden="true" className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
      )}
    </button>
  );
}
