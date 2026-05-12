"use client";

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
      // Focus the modal content after animation
      requestAnimationFrame(() => {
        contentRef.current?.focus();
      });
    } else {
      document.body.style.overflow = "";
      // Restore focus to the element that opened the modal
      previousFocusRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;

    const content = contentRef.current;
    if (!content) return;

    const focusable = content.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        className={cn(
          "relative w-full max-w-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-4 sm:p-6",
          "shadow-[var(--shadow-lg)] animate-scale-in outline-none",
          className
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Închide"
          className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 inline-flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer z-10"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {title && (
          <h2
            className="text-xl font-bold mb-4 pr-8 text-[var(--color-text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}
