"use client";

import Link from "next/link";
import { Modal } from "@/components/ui/Modal";

interface WhatsNewModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * One-time "what's new" popup for v3.1.0: a lobby chat in Provocare and a new
 * choice of result system for custom challenges (Kahoot points or number of
 * correct answers). Shown once per returning visitor; see WhatsNewGate gating.
 */
export function WhatsNewModal({ open, onClose }: WhatsNewModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Ce e nou pe UTMLearn" className="!max-w-lg">
      <div className="max-h-[68vh] overflow-y-auto pr-1 -mr-1 space-y-6">
        <section>
          <div className="flex items-center gap-2 mb-2.5">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)] border-opacity-30">
              v3.1.0
            </div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] bg-[rgba(52,211,153,0.12)] text-[#34D399] border border-[#34D399] border-opacity-30">
              Nou
            </div>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)] mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Chat în sala de așteptare
          </h3>
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            În Provocare, cât aștepți ca gazda să pornească, poți acum să vorbești cu ceilalți
            jucători direct în sala de așteptare. Mesajele apar pe loc pentru toată lumea din cameră.
            Chatul e doar înainte de start, ca să vă puneți de acord, și dispare când începe jocul.
          </p>
        </section>

        <section className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3.5">
          <h4 className="text-sm font-bold text-[var(--color-text-primary)] mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Clasament pe puncte sau pe răspunsuri corecte
          </h4>
          <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
            La o provocare personalizată poți alege acum cum se ține scorul: pe puncte (stil Kahoot,
            cu cât răspunzi mai repede cu atât iei mai mult) sau pur și simplu pe numărul de
            răspunsuri corecte, unde timpul departajează la egalitate. Dacă alegi răspunsuri corecte
            și lași feedbackul instant oprit, numărul rămâne ascuns până la final, ca la simulare.
          </p>
        </section>

        <Link
          href="/provocare"
          onClick={onClose}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[#0C0C0E] font-bold text-sm transition-all duration-200 hover:bg-[var(--color-accent-hover)] active:scale-[0.98]"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
        >
          Deschide Provocare
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>
    </Modal>
  );
}
