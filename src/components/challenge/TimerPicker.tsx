"use client";

import { cn } from "@/lib/utils";
import type { TimerMode } from "@/lib/challenge/types";

// Quick-pick minutes for the whole-game timer; the slider covers 1-120 in full.
const TIMER_PRESETS = [5, 10, 20, 30, 60];
const PER_Q_OPTIONS = [
  { s: 15, label: "15 sec" },
  { s: 30, label: "30 sec" },
  { s: 60, label: "1 min" },
  { s: 120, label: "2 min" },
  { s: 180, label: "3 min" },
  { s: 300, label: "5 min" },
];

const MODES: { key: TimerMode; label: string }[] = [
  { key: "total", label: "Timp total" },
  { key: "per_question", label: "Pe întrebare" },
  { key: "unlimited", label: "Fără limită" },
];

const NOTE: Record<TimerMode, string> = {
  total: "Toți au același timp pentru tot testul. Când se termină ceasul, gata.",
  per_question: "Fiecare întrebare are limita ei. Când expiră, treci automat mai departe.",
  unlimited: "Fără ceas. Jucați în ritmul vostru, iar provocarea se termină când toți au răspuns.",
};

export interface TimerValue {
  mode: TimerMode;
  /** Whole-game budget in minutes (used in "total" mode). */
  totalMinutes: number;
  /** Per-question budget in seconds (used in "per_question" mode). */
  perQuestionSeconds: number;
}

/** Controlled timer chooser shared by the custom and Simulare create flows:
 *  a 3-way mode switch plus the sub-control for the active mode. */
export function TimerPicker({
  value,
  onChange,
}: {
  value: TimerValue;
  onChange: (v: TimerValue) => void;
}) {
  const set = (patch: Partial<TimerValue>) => onChange({ ...value, ...patch });

  return (
    <div>
      <span className="block mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
        Timp
      </span>
      <div className="grid grid-cols-3 gap-1.5">
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => set({ mode: m.key })}
            className={cn(
              "py-2.5 px-1 rounded-[var(--radius-md)] text-[13px] font-bold border transition-all cursor-pointer leading-tight",
              value.mode === m.key
                ? "bg-[var(--color-accent)] text-[#0C0C0E] border-[var(--color-accent)]"
                : "bg-[var(--color-bg-primary)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]",
            )}
            style={{ fontFamily: "var(--font-display)" }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {value.mode === "total" && (
        <div className="mt-3">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs text-[var(--color-text-tertiary)]">Durata întregului joc</span>
            <span className="text-sm font-bold tabular-nums text-[var(--color-accent)]" style={{ fontFamily: "var(--font-display)" }}>
              {value.totalMinutes} min
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={120}
            step={1}
            value={value.totalMinutes}
            onChange={(e) => set({ totalMinutes: Number(e.target.value) })}
            className="w-full cursor-pointer"
            style={{ accentColor: "var(--color-accent)" }}
            aria-label="Durata totală în minute"
          />
          <div className="mt-2.5 grid grid-cols-5 gap-1.5">
            {TIMER_PRESETS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => set({ totalMinutes: m })}
                className={cn(
                  "py-1.5 rounded-[var(--radius-md)] text-xs font-bold tabular-nums border transition-all cursor-pointer",
                  value.totalMinutes === m
                    ? "border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-muted)]"
                    : "bg-[var(--color-bg-primary)] border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:border-[var(--color-border-strong)]",
                )}
              >
                {m}m
              </button>
            ))}
          </div>
        </div>
      )}

      {value.mode === "per_question" && (
        <div className="mt-3">
          <span className="block mb-2 text-xs text-[var(--color-text-tertiary)]">Timp pentru fiecare întrebare</span>
          <div className="grid grid-cols-3 gap-1.5">
            {PER_Q_OPTIONS.map((o) => (
              <button
                key={o.s}
                type="button"
                onClick={() => set({ perQuestionSeconds: o.s })}
                className={cn(
                  "py-2.5 rounded-[var(--radius-md)] text-sm font-bold tabular-nums border transition-all cursor-pointer",
                  value.perQuestionSeconds === o.s
                    ? "bg-[var(--color-accent)] text-[#0C0C0E] border-[var(--color-accent)]"
                    : "bg-[var(--color-bg-primary)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]",
                )}
                style={{ fontFamily: "var(--font-display)" }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="mt-2.5 text-[11px] leading-relaxed text-[var(--color-text-tertiary)]">
        {NOTE[value.mode]}
      </p>
    </div>
  );
}
