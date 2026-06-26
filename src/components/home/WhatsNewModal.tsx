"use client";

import Link from "next/link";
import { Modal } from "@/components/ui/Modal";

interface WhatsNewModalProps {
  open: boolean;
  onClose: () => void;
}

const STEPS: { n: string; text: string }[] = [
  { n: "1", text: "Alegi materiile, pui timpul și creezi provocarea." },
  { n: "2", text: "Trimiți linkul (se copiază singur). Prietenii intră doar cu un nume." },
  { n: "3", text: "Toți răspund la aceleași grile. Câștigă cine adună cele mai multe puncte." },
];

/**
 * One-time "what's new" popup for v3.0.0: introduces Provocare (the multiplayer
 * challenge mode), how it works in three steps, and a CTA to start one. Shown
 * once per returning visitor; see WhatsNewGate gating.
 */
export function WhatsNewModal({ open, onClose }: WhatsNewModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Ce e nou pe UTMLearn" className="!max-w-lg">
      <div className="max-h-[68vh] overflow-y-auto pr-1 -mr-1 space-y-6">
        <section>
          <div className="flex items-center gap-2 mb-2.5">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)] border-opacity-30">
              v3.0.0
            </div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] bg-[rgba(52,211,153,0.12)] text-[#34D399] border border-[#34D399] border-opacity-30">
              Nou
            </div>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)] mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Provocare: joacă grile cu prietenii
          </h3>
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Mod nou, în timp real: creezi o provocare, dai linkul prietenilor și vă luați la
            întrecere pe aceleași întrebări, cu un clasament live. Fără cont, doar cu un nume, până
            la 6 jucători.
          </p>

          {/* How it works, in three steps */}
          <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3.5 space-y-2.5">
            {STEPS.map((s) => (
              <div key={s.n} className="flex items-start gap-2.5">
                <span
                  className="flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {s.n}
                </span>
                <span className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">{s.text}</span>
              </div>
            ))}
          </div>

          <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Punctaj ca la Kahoot: cu cât răspunzi mai repede și corect, cu atât iei mai multe puncte.
            Pui timp pe fiecare întrebare sau pentru tot testul, iar la final vezi podiumul, timpul
            fiecăruia și câte a nimerit. Dacă cuiva îi pică netul, are timp să revină fără să strice
            jocul.
          </p>

          <Link
            href="/provocare"
            onClick={onClose}
            className="mt-4 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[#0C0C0E] font-bold text-sm transition-all duration-200 hover:bg-[var(--color-accent-hover)] active:scale-[0.98]"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
          >
            Creează o provocare
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </section>

        {/* Smaller note: the new countdown hide control */}
        <section className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3.5">
          <h4 className="text-sm font-bold text-[var(--color-text-primary)] mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Și pe prima pagină
          </h4>
          <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
            Poți acum ascunde numărătoarea până la examen dacă te distrage, și o aduci înapoi
            oricând. Alegerea se ține minte.
          </p>
        </section>
      </div>
    </Modal>
  );
}
