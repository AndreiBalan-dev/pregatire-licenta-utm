"use client";

import { useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { renderInlineCode } from "@/components/ui/InlineText";
import { useHighlighter } from "@/hooks/useHighlighter";
import { confusables } from "@/data/confusables";

/**
 * Small "trap question" chip shown in a question's header WHEN the highlighter is on AND this
 * question is in the confusables set. It sits with the question header (never next to the answer
 * options) so a tap can't be mistaken for choosing an answer. Tapping it opens a short popup that
 * explains the trap and, when relevant, links to the similar questions on the search page.
 */
export function ConfusableHint({ questionId }: { questionId: number }) {
  const { on } = useHighlighter();
  const [open, setOpen] = useState(false);

  const info = confusables[questionId];
  if (!on || !info) return null;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          // Stop the click bubbling so the chip never toggles a parent (e.g. the search result card).
          e.stopPropagation();
          setOpen(true);
        }}
        aria-haspopup="dialog"
        aria-label="De ce e o întrebare-capcană"
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wide bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)] border-opacity-30 hover:bg-[var(--color-accent)] hover:text-[#0C0C0E] transition-colors cursor-pointer"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m9 11-6 6v3h9l3-3" />
          <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
        </svg>
        Capcană
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Întrebare-capcană" className="!max-w-md">
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{renderInlineCode(info.note)}</p>
        {info.searchQuery && (
          <Link
            href={`/cautare?q=${encodeURIComponent(info.searchQuery)}`}
            onClick={() => setOpen(false)}
            className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[#0C0C0E] font-bold text-sm transition-all duration-200 hover:bg-[var(--color-accent-hover)] active:scale-[0.98]"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
          >
            Vezi întrebările similare
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        )}
      </Modal>
    </>
  );
}
