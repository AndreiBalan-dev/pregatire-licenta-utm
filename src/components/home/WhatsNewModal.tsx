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

/**
 * One-time "what's new" popup. Leads with the new feature (choosing a
 * module/materie when redoing wrong or marked questions), then (on scroll) a
 * personal thank-you for the Gen-E votes. Shown once per visitor who already
 * has data; see HomePage gating.
 */
export function WhatsNewModal({ open, onClose, onSeeDetails }: WhatsNewModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Ce e nou pe UTMLearn" className="!max-w-lg">
      <div className="max-h-[68vh] overflow-y-auto pr-1 -mr-1 space-y-6">
        {/* Section 1: the new feature */}
        <section>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mb-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)] border-opacity-30">
            v2.0.0
          </div>
          <h3
            className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)] mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Caută orice întrebare, pornește exact ce vrei
          </h3>
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Avem o pagină nouă de <span className="font-semibold text-[var(--color-text-primary)]">Căutare</span>. Cauți în
            toate cele 715 întrebări, filtrezi cum vrei și apoi exersezi fix ce ai găsit.
          </p>

          <div className="mt-3 space-y-2">
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="flex-shrink-0 text-[var(--color-accent)]" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </span>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
                  Cauți și filtrezi orice
                </p>
              </div>
              <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                După cuvinte, variante de răspuns sau explicație (nu contează diacriticele), plus filtre după materie,
                cod și limbaj, figură, răspuns corect și progresul tău (nerezolvate, corecte, greșite, marcate).
              </p>
            </div>
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="flex-shrink-0 text-[var(--color-accent)]" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </span>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
                  Pornești pe loc
                </p>
              </div>
              <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                Din rezultate dai <span className="font-semibold text-[var(--color-text-primary)]">Exersează</span> cu
                feedback sau <span className="font-semibold text-[var(--color-text-primary)]">Simulează</span> cu scor la
                final. Sau <span className="font-semibold text-[var(--color-text-primary)]">Surprinde-mă</span> pentru 20
                de întrebări la întâmplare.
              </p>
            </div>
          </div>

          <Link
            href="/cautare"
            onClick={onClose}
            className="mt-3 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[#0C0C0E] font-bold text-sm transition-all duration-200 hover:bg-[var(--color-accent-hover)] active:scale-[0.98]"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
          >
            Deschide Căutarea
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
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
