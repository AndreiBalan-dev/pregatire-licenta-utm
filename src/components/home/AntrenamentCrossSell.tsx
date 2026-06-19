"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Compact horizontal cross-sell card linking to the unlimited Antrenament mode.
 * Mirrors the inline "Simulator" cross-sell on the Practica page so the two read
 * the same. Used on /practica and /simulator; pass `className` for page spacing.
 */
export function AntrenamentCrossSell({ className }: { className?: string }) {
  return (
    <Link
      href="/antrenament"
      className={cn(
        "group flex items-center gap-3 sm:gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3.5 sm:p-4 transition-all duration-200 hover:border-[var(--color-accent)] animate-fade-in",
        className,
      )}
    >
      <span
        className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-border)]"
        aria-hidden="true"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base font-bold text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
            Antrenament Nelimitat
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] bg-[var(--color-accent)] text-[#0C0C0E]">
            Nou
          </span>
        </div>
        <p className="text-[11px] sm:text-xs text-[var(--color-text-tertiary)] mt-0.5">
          Exersezi nelimitat. Greșelile revin mai des, cele știute mai rar.
        </p>
      </div>
      <span className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-md)] text-sm font-semibold bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)] transition-colors group-hover:bg-[var(--color-accent)] group-hover:text-[#0C0C0E] flex-shrink-0">
        Începe
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:hidden flex-shrink-0 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-accent)] transition-colors" aria-hidden="true">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </Link>
  );
}
