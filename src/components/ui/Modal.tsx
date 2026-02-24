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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      onKeyDown={handleKeyDown}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        ref={contentRef}
        tabIndex={-1}
        className={cn(
          "relative w-full max-w-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-4 sm:p-6",
          "shadow-[var(--shadow-lg)] animate-scale-in outline-none",
          className
        )}
      >
        {title && (
          <h2
            className="text-xl font-bold mb-4 text-[var(--color-text-primary)]"
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
