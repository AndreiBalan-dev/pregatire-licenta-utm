"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { renderInlineCode } from "@/components/ui/InlineText";

interface ExplanationPanelProps {
  text: string;
  className?: string;
}

/**
 * Collapsible "De ce?" panel showing the why-correct / why-wrong explanation.
 * Renders the stored explanation text: a "Corect: X" line, a concept sentence,
 * and per-option bullets. Hidden entirely when there is no explanation.
 */
export function ExplanationPanel({ text, className }: ExplanationPanelProps) {
  const [open, setOpen] = useState(false);
  if (!text || !text.trim()) return null;

  const lines = text.split("\n");

  return (
    <div className={cn("mt-3 sm:mt-4", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "group inline-flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] text-xs sm:text-sm font-semibold transition-all cursor-pointer",
          "bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)] border-opacity-40 hover:bg-[var(--color-accent)] hover:text-[#0C0C0E]",
        )}
        style={{ fontFamily: "var(--font-display)", letterSpacing: "0.01em" }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 18h6" />
          <path d="M10 22h4" />
          <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V17h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z" />
        </svg>
        De ce e corect?
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("transition-transform duration-200", open && "rotate-180")}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="mt-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3.5 sm:p-4 animate-fade-in">
          <div className="text-[13px] sm:text-sm leading-relaxed text-[var(--color-text-secondary)] break-words">
            {lines.map((line, i) => {
              const trimmed = line.trim();
              if (trimmed === "") return <div key={i} className="h-2" aria-hidden="true" />;

              // "Corect: b" header line
              const corect = /^Corect:\s*(.+)$/i.exec(trimmed);
              if (corect) {
                return (
                  <p key={i} className="font-semibold text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
                    Corect:{" "}
                    <span className="text-[var(--color-accent)] uppercase">{corect[1]}</span>
                  </p>
                );
              }

              // Bullet line "• a — ..."
              if (trimmed.startsWith("•")) {
                return (
                  <div key={i} className="flex gap-2 mt-1">
                    <span className="text-[var(--color-text-tertiary)] flex-shrink-0" aria-hidden="true">•</span>
                    <span className="min-w-0">{renderInlineCode(trimmed.replace(/^•\s*/, ""))}</span>
                  </div>
                );
              }

              // Sub-heading line ("De ce nu celelalte:")
              if (trimmed.endsWith(":")) {
                return (
                  <p key={i} className="mt-2.5 mb-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]" style={{ fontFamily: "var(--font-display)" }}>
                    {renderInlineCode(trimmed)}
                  </p>
                );
              }

              // Normal paragraph
              return (
                <p key={i} className="mt-1">
                  {renderInlineCode(trimmed)}
                </p>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
