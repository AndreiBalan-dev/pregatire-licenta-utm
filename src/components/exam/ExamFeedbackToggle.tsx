"use client";

import { ExamOptionToggle } from "./ExamOptionToggle";

interface ExamFeedbackToggleProps {
  enabled: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  hint?: string;
}

export function ExamFeedbackToggle({ enabled, onChange, disabled, hint }: ExamFeedbackToggleProps) {
  return (
    <ExamOptionToggle
      enabled={enabled}
      onChange={onChange}
      disabled={disabled}
      hint={hint}
      ariaLabel="Feedback instant pe parcursul examenului"
      title="Feedback instant"
      description="Vezi imediat dacă răspunsul e corect sau greșit, chiar pe parcursul examenului. Răspunsul se blochează când îl alegi. Ideal când înveți activ."
      icon={
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      }
    />
  );
}
