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
    <Modal open={open} onClose={onCancel} title={allDone ? "Trimite examenul?" : "Mai ai răspunsuri lipsă"}>
      <div className="space-y-5">
        {allDone ? (
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Ai răspuns la toate cele{" "}
            <span className="font-semibold text-[var(--color-text-primary)]">{total}</span> întrebări. După submit, răspunsurile devin definitive.
          </p>
        ) : (
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            <span className="font-semibold text-[var(--color-text-primary)] tabular-nums">{answeredCount}/{total}</span> răspunse.
            Cele <span className="text-[var(--color-wrong)] font-semibold">{unanswered}</span> rămase intră ca greșite.
          </p>
        )}

        <div className="flex gap-2.5 flex-col-reverse sm:flex-row">
          <Button variant="secondary" size="md" className="flex-1" onClick={onCancel}>
            {allDone ? "Înapoi" : "Mai răspund"}
          </Button>
          <Button variant="primary" size="md" className="flex-1" onClick={onConfirm}>
            {allDone ? "Trimit examenul" : "Trimit oricum"}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
