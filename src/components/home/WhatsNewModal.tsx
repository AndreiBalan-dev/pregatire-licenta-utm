"use client";

import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { VOTE_EXPO_URL, VOTE_IMAGE } from "@/lib/site-config";

interface WhatsNewModalProps {
  open: boolean;
  onClose: () => void;
  /** Close the popup and scroll to the full voting message on the homepage. */
  onSeeDetails: () => void;
}

// Releases since the last popup (v2.5.0), newest first, one line each.
const RECAP: { version: string; text: string }[] = [
  { version: "v2.5.5", text: "Numărătoare inversă pe prima pagină până la proba scrisă a licenței." },
  { version: "v2.5.4", text: "Antrenamentul nu mai rămâne blocat pe loading când o întrebare a fost scoasă." },
  { version: "v2.5.3", text: "Codul din întrebări se vede ca și cod peste tot: la Revizuire, în Căutare și în variante." },
  { version: "v2.5.2", text: "Explicațiile „De ce e corect” rămân corecte și când amesteci răspunsurile." },
  { version: "v2.5.1", text: "Codul din enunț apare cu font de cod (monospace), nu ca text simplu." },
];

function Key({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <kbd
      className={
        "inline-flex items-center justify-center h-5 rounded border border-[var(--color-border-strong)] " +
        "bg-[var(--color-bg-secondary)] text-[10px] font-semibold text-[var(--color-text-primary)] font-mono " +
        (wide ? "px-1.5" : "w-5")
      }
    >
      {children}
    </kbd>
  );
}

/**
 * One-time "what's new" popup. Leads with the latest release (v2.6.0: keyboard
 * navigation), then a per-version recap of everything since the previous popup
 * (v2.5.0), then (on scroll) a personal thank-you for the Gen-E votes. Shown once
 * per visitor who already has data; see WhatsNewGate gating.
 */
export function WhatsNewModal({ open, onClose, onSeeDetails }: WhatsNewModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Ce e nou pe UTMLearn" className="!max-w-lg">
      <div className="max-h-[68vh] overflow-y-auto pr-1 -mr-1 space-y-6">
        {/* Section 0: v2.6.0 - keyboard navigation (newest, REPLACE per release) */}
        <section>
          <div className="flex items-center gap-2 mb-2.5">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)] border-opacity-30">
              v2.6.0
            </div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] bg-[rgba(52,211,153,0.12)] text-[#34D399] border border-[#34D399] border-opacity-30">
              Nou
            </div>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)] mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Control cu tastatura
          </h3>
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Pe desktop poți acum răspunde și naviga fără mouse. Te miști prin variante cu{" "}
            <Key>↑</Key> <Key>↓</Key>, confirmi varianta cu <Key wide>Space</Key> și treci la
            întrebarea următoare cu <Key>→</Key> (<Key>←</Key> pentru cea anterioară). Merge la
            Practică, Antrenament și Simulator.
          </p>
          <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3.5">
            <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
              E pornit din start. Îl poți opri sau reaprinde oricând din butonul cu tastatură{" "}
              <span className="inline-flex items-center align-middle text-[var(--color-accent)]" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" />
                </svg>
              </span>{" "}
              din bara de sus. Pe telefon nu apare, fiindcă n-are sens fără tastatură.
            </p>
          </div>
          <Link
            href="/practica"
            onClick={onClose}
            className="mt-3 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[#0C0C0E] font-bold text-sm transition-all duration-200 hover:bg-[var(--color-accent-hover)] active:scale-[0.98]"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
          >
            Încearcă la Practică
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </section>

        {/* Section 1: per-version recap since the previous popup (REPLACE per release) */}
        <section>
          <div className="flex items-center gap-2 mb-2.5">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] border border-[var(--color-border-strong)]">
              Recap
            </div>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)] mb-2" style={{ fontFamily: "var(--font-display)" }}>
            De la ultimul anunț
          </h3>
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] mb-3">
            De când n-ai mai văzut acest popup am tot lucrat la platformă. Pe scurt:
          </p>
          <div className="space-y-2">
            {RECAP.map((item) => (
              <div
                key={item.version}
                className="flex items-start gap-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2.5"
              >
                <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-[0.08em] bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)] border-opacity-30">
                  {item.version}
                </span>
                <span className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">{item.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Scroll hint / divider */}
        <div className="flex items-center gap-3" aria-hidden="true">
          <div className="h-px flex-1 bg-[var(--color-border)]" />
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]" style={{ fontFamily: "var(--font-display)" }}>
            Mai jos, un gând de la mine
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
          <div className="h-px flex-1 bg-[var(--color-border)]" />
        </div>

        {/* Section 2: the personal thank-you for the votes */}
        <section>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
            <div className="min-w-0 flex-1">
              <h3
                className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)] mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Mulțumesc pentru voturi!
              </h3>
              <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                Datorită vouă, Algebo.ai stă foarte bine la expoziția Gen-E. Avem deja o grămadă de voturi, apreciez
                enorm fiecare dintre ele și împingem împreună spre locul 1. Lucrurile arată bine! Dacă n-ai apucat încă
                să votezi, încă un vot ne ajută mult. Durează zece secunde și{" "}
                <strong className="text-[var(--color-text-primary)]">nu ai nevoie de cont</strong>.
              </p>
            </div>
            <a
              href={VOTE_EXPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block flex-shrink-0 w-[120px] mx-auto sm:mx-0"
              aria-label="Deschide pagina de vot Algebo.ai"
            >
              <img
                src={VOTE_IMAGE}
                alt="Pagina Algebo.ai de la Gen-E, cu butonul Vote evidențiat"
                width={1437}
                height={2048}
                className="w-full h-auto rounded-[var(--radius-md)] border border-[var(--color-border)] shadow-[var(--shadow-md)]"
              />
            </a>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 mt-4">
            <a
              href={VOTE_EXPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 px-5 py-3 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[#0C0C0E] font-bold text-sm transition-all duration-200 hover:bg-[var(--color-accent-hover)] hover:shadow-[0_0_24px_rgba(232,166,49,0.28)] active:scale-[0.98]"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3z" />
                <path d="M7 11l4-7a2 2 0 0 1 2 2v3h5.5a2 2 0 0 1 2 2.3l-1.4 7A2 2 0 0 1 17 20H7" />
              </svg>
              Votează aici
            </a>
            <button
              type="button"
              onClick={onSeeDetails}
              className="inline-flex flex-1 items-center justify-center gap-1.5 px-5 py-3 rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] border border-[var(--color-border)] font-medium text-sm transition-all hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-hover)] active:scale-[0.98] cursor-pointer"
            >
              Vezi detalii
            </button>
          </div>
        </section>
      </div>
    </Modal>
  );
}
