"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ExamRestartModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (shuffleOrder: boolean) => void;
}

type OrderChoice = "same" | "shuffled";

export function ExamRestartModal({ open, onCancel, onConfirm }: ExamRestartModalProps) {
  const [choice, setChoice] = useState<OrderChoice>("same");

  useEffect(() => {
    if (open) setChoice("same"); // eslint-disable-line react-hooks/set-state-in-effect
  }, [open]);

  return (
    <Modal open={open} onClose={onCancel} title="Re-fă același examen">
      <div className="space-y-5">
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          Primești <span className="font-semibold text-[var(--color-text-primary)]">exact aceleași 36 de grile</span> ca data trecută. Ai ocazia să-ți corectezi greșelile.
        </p>

        {/* Order choice cards */}
        <div className="space-y-2.5" role="radiogroup" aria-label="Ordinea întrebărilor">
          <OrderCard
            label="Aceeași ordine"
            description="Grilele apar fix în ordinea de data trecută. Util dacă vrei să refaci pas cu pas."
            selected={choice === "same"}
            onSelect={() => setChoice("same")}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            }
          />
          <OrderCard
            label="Amestecă ordinea"
            description="Aceleași grile, ordine nouă. Te ajută să recunoști întrebările pe conținut, nu pe poziție."
            selected={choice === "shuffled"}
            onSelect={() => setChoice("shuffled")}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="16 3 21 3 21 8" />
                <line x1="4" y1="20" x2="21" y2="3" />
                <polyline points="21 16 21 21 16 21" />
                <line x1="15" y1="15" x2="21" y2="21" />
                <line x1="4" y1="4" x2="9" y2="9" />
              </svg>
            }
          />
        </div>

        {/* Note */}
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-[11px] leading-relaxed text-[var(--color-text-tertiary)]">
            Rezultatul actual va fi înlocuit. La final, vei vedea că a fost o sesiune repetată.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2.5 flex-col-reverse sm:flex-row">
          <Button variant="secondary" size="md" className="flex-1" onClick={onCancel}>
            Înapoi
          </Button>
          <Button variant="primary" size="md" className="flex-1" onClick={() => onConfirm(choice === "shuffled")}>
            Re-fă examenul
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </Button>
        </div>
      </div>
    </Modal>
  );
}

interface OrderCardProps {
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
}

function OrderCard({ label, description, selected, onSelect, icon }: OrderCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "relative w-full text-left p-3.5 rounded-[var(--radius-md)] border cursor-pointer transition-all duration-200",
        "flex items-start gap-3",
        selected
          ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)] shadow-[0_0_18px_rgba(232,166,49,0.1)]"
          : "border-[var(--color-border)] bg-[var(--color-bg-primary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-hover)]",
      )}
    >
      {/* Radio indicator */}
      <span
        className={cn(
          "flex-shrink-0 mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
          selected
            ? "border-[var(--color-accent)] bg-[var(--color-accent)]"
            : "border-[var(--color-border-strong)] bg-transparent",
        )}
        aria-hidden="true"
      >
        {selected && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#0C0C0E]" />
        )}
      </span>

      {/* Icon */}
      <span
        className={cn(
          "flex-shrink-0 mt-0.5 transition-colors",
          selected ? "text-[var(--color-accent)]" : "text-[var(--color-text-tertiary)]",
        )}
      >
        {icon}
      </span>

      {/* Text */}
      <span className="flex-1 min-w-0">
        <span
          className={cn(
            "block text-sm font-semibold mb-0.5",
            selected ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]",
          )}
        >
          {label}
        </span>
        <span className="block text-[11px] sm:text-xs leading-relaxed text-[var(--color-text-tertiary)]">
          {description}
        </span>
      </span>
    </button>
  );
}
