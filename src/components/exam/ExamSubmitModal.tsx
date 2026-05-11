"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface ExamSubmitModalProps {
  open: boolean;
  answeredCount: number;
  total: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ExamSubmitModal({ open, answeredCount, total, onConfirm, onCancel }: ExamSubmitModalProps) {
  const unanswered = total - answeredCount;
  const allDone = unanswered === 0;

  return (
    <Modal open={open} onClose={onCancel} title={allDone ? "Finalizează examenul?" : "Mai ai întrebări fără răspuns"}>
      <div className="space-y-5">
        {allDone ? (
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Ai răspuns la toate{" "}
            <span className="font-semibold text-[var(--color-text-primary)]">{total}</span> întrebările.
            După ce trimiți, nu mai poți schimba răspunsurile.
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Ai răspuns la{" "}
              <span className="font-semibold text-[var(--color-text-primary)]">
                {answeredCount} din {total}
              </span>{" "}
              întrebări.{" "}
              <span className="text-[var(--color-wrong)] font-medium">
                {unanswered} {unanswered === 1 ? "întrebare rămasă" : "întrebări rămase"}
              </span>{" "}
              fără răspuns vor fi marcate ca greșite.
            </p>
            <div className="rounded-[var(--radius-md)] bg-[var(--color-bg-primary)] border border-[var(--color-border)] p-3">
              <div className="flex items-start gap-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">
                  Pierzi {(unanswered * 0.25).toFixed(2)}p din maxim. Mai bine te întorci și răspunzi?
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2.5 flex-col-reverse sm:flex-row">
          <Button variant="secondary" size="md" className="flex-1" onClick={onCancel}>
            {allDone ? "Înapoi" : "Mă întorc la întrebări"}
          </Button>
          <Button variant="primary" size="md" className="flex-1" onClick={onConfirm}>
            {allDone ? "Trimite Examenul" : "Trimite Oricum"}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
