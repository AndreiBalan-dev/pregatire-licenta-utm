"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  ScopeSelector,
  OrderSelector,
  ShuffleAnswersToggle,
  type RedoScope,
  type OrderChoice,
} from "@/components/review/RedoControls";

interface ExamRestartModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (opts: { scope: RedoScope; shuffleOrder: boolean; shuffleAnswers: boolean }) => void;
  /** Initial state for the "shuffle answers" toggle (the saved simulator preference). */
  defaultShuffleAnswers?: boolean;
  /** Total questions in the exam (for the "Toate (N)" label). */
  totalCount: number;
  /** How many were wrong/unanswered (enables the "Doar greșite" option). */
  wrongCount: number;
  /** Which scope to preselect when opened. */
  initialScope?: RedoScope;
}

export function ExamRestartModal({
  open,
  onCancel,
  onConfirm,
  defaultShuffleAnswers = false,
  totalCount,
  wrongCount,
  initialScope = "all",
}: ExamRestartModalProps) {
  const [scope, setScope] = useState<RedoScope>(initialScope);
  const [choice, setChoice] = useState<OrderChoice>("same");
  const [shuffleAnswers, setShuffleAnswers] = useState(defaultShuffleAnswers);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScope(wrongCount === 0 ? "all" : initialScope);
      setChoice("same");
      setShuffleAnswers(defaultShuffleAnswers);
    }
  }, [open, defaultShuffleAnswers, initialScope, wrongCount]);

  const isWrong = scope === "wrong";

  return (
    <Modal open={open} onClose={onCancel} title="Refă examenul">
      <div className="space-y-5">
        <ScopeSelector
          scope={scope}
          onScope={setScope}
          wrongCount={wrongCount}
          allCount={totalCount}
          allLabel={`Toate (${totalCount})`}
        />

        {isWrong ? (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p className="text-[11px] leading-relaxed text-[var(--color-text-tertiary)]">
              Greșelile se reiau ca exercițiu de practică, cu scor pe acuratețe, nu ca nota /10 (aceea e calibrată pe examenul complet).
            </p>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Primești <span className="font-semibold text-[var(--color-text-primary)]">exact aceleași {totalCount} de grile</span> ca data trecută. Ai ocazia să-ți corectezi greșelile.
          </p>
        )}

        <OrderSelector choice={choice} onChoice={setChoice} />

        <ShuffleAnswersToggle value={shuffleAnswers} onChange={setShuffleAnswers} />

        {!isWrong && (
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
        )}

        <div className="flex gap-2.5 flex-col-reverse sm:flex-row">
          <Button variant="secondary" size="md" className="flex-1" onClick={onCancel}>
            Înapoi
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            onClick={() => onConfirm({ scope, shuffleOrder: choice === "shuffled", shuffleAnswers })}
          >
            {isWrong ? "Refă greșitele" : "Re-fă examenul"}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
