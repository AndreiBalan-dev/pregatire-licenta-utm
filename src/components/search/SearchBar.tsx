"use client";

import { useEffect, useRef } from "react";
import { TOTAL_QUESTIONS } from "@/lib/site-config";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
}

/**
 * The main free-text box. Press "/" anywhere (outside a field) to focus it.
 * Shows a clear button while there's text and a "/" hint while empty (desktop).
 */
export function SearchBar({ value, onChange }: SearchBarProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || el?.isContentEditable) return;
      e.preventDefault();
      ref.current?.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative">
      <span
        className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none"
        aria-hidden="true"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </span>

      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        spellCheck={false}
        aria-label="Caută în întrebări"
        placeholder={`Caută în ${TOTAL_QUESTIONS} întrebări - cuvinte, variante, #număr`}
        className="w-full pl-11 pr-12 py-3.5 rounded-[var(--radius-lg)] bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] transition-all duration-200 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
      />

      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Șterge căutarea"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      ) : (
        <span
          className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 items-center justify-center w-6 h-6 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-[var(--color-text-tertiary)] text-xs font-semibold pointer-events-none"
          aria-hidden="true"
        >
          /
        </span>
      )}
    </div>
  );
}
