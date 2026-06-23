"use client";

import { cn } from "@/lib/utils";
import { useHighlighter } from "@/hooks/useHighlighter";

/**
 * Navbar button that turns the confusable-question highlighter on/off. Lives next to the theme
 * toggle in the header (visible on desktop and the mobile top bar). When on it glows in the accent
 * colour and a small dot marks it active, so it's obvious the highlighter is enabled.
 */
export function HighlighterToggle() {
  const { on, toggle } = useHighlighter();

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={on}
      aria-label="Evidenţiator întrebări-capcană"
      title={on ? "Evidenţiator pornit: marchează întrebările-capcană" : "Evidenţiator oprit"}
      className={cn(
        "relative p-2 rounded-[var(--radius-md)] transition-colors cursor-pointer",
        on
          ? "text-[var(--color-accent)] bg-[var(--color-accent-muted)] shadow-[0_0_12px_rgba(232,166,49,0.18)]"
          : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]",
      )}
    >
      {/* highlighter / marker pen */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m9 11-6 6v3h9l3-3" />
        <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
      </svg>
      {on && (
        <span
          aria-hidden="true"
          className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]"
        />
      )}
    </button>
  );
}
