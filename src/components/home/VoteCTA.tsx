"use client";

import { Container } from "@/components/layout/Container";
import { VOTE_EXPO_URL, VOTE_IMAGE, CONTACT_INSTAGRAM } from "@/lib/site-config";

/**
 * Personal message from Andrei asking visitors to vote for Algebo.ai at the Gen-E expo.
 * Sits on the homepage, between the hero and the simulator CTA. Anchor id "vot" so the
 * "What's new" popup can deep-link here with "Vezi detalii".
 */
export function VoteCTA() {
  return (
    <section id="vot" className="scroll-mt-20 py-6 sm:py-8">
      <Container>
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] animate-slide-up">
          {/* Warm glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 60% at 0% 0%, var(--color-accent), transparent 60%), radial-gradient(ellipse 50% 60% at 100% 100%, var(--color-accent), transparent 65%)",
              opacity: 0.07,
            }}
            aria-hidden="true"
          />

          <div className="relative p-5 sm:p-8 flex flex-col md:flex-row gap-6 sm:gap-8 md:items-center">
            {/* Message */}
            <div className="min-w-0 flex-1 order-2 md:order-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-4 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)] border-opacity-30">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 21s-6.7-4.4-9.3-8.3C1 9.9 2.3 6.5 5.4 6c1.9-.3 3.7.7 4.6 2.3C10.9 6.7 12.7 5.7 14.6 6c3.1.5 4.4 3.9 2.7 6.7C18.7 16.6 12 21 12 21z" />
                </svg>
                O rugăminte personală
              </div>

              <h2
                className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] leading-[1.1] mb-4"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
              >
                Am făcut UTMLearn gratis. Și rămâne gratis.
              </h2>

              <div className="space-y-3 text-sm sm:text-[15px] leading-relaxed text-[var(--color-text-secondary)] max-w-prose">
                <p>
                  Salut! Sunt Andrei. Am construit UTMLearn.com singur și pe gratis, ca să ne pregătim cu toții
                  mai ușor pentru examenul de licență. N-am cerut niciodată nimic în schimb și nici n-o să cer,
                  platforma rămâne gratuită pentru toți.
                </p>
                <p>
                  Acum am și eu o rugăminte, pentru prima dată. Particip cu proiectul meu, Algebo.ai, la
                  expoziția Gen-E, iar voturile chiar contează. Dacă UTMLearn te-a ajutat cât de puțin, acum mă
                  poți ajuta și tu.
                </p>
                <p>
                  Durează zece secunde, merge de pe orice telefon sau laptop și, cel mai important,{" "}
                  <strong className="text-[var(--color-text-primary)]">nu ai nevoie de niciun cont</strong>. Intri
                  pe link, apeși pe butonul &quot;Vote&quot; (exact ca în poză) și gata.
                </p>
              </div>

              <a
                href={VOTE_EXPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 mt-5 px-6 py-3 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[#0C0C0E] font-bold text-sm sm:text-base transition-all duration-200 hover:bg-[var(--color-accent-hover)] hover:shadow-[0_0_30px_rgba(232,166,49,0.3)] active:scale-[0.98]"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3z" />
                  <path d="M7 11l4-7a2 2 0 0 1 2 2v3h5.5a2 2 0 0 1 2 2.3l-1.4 7A2 2 0 0 1 17 20H7" />
                </svg>
                Votează pentru Algebo.ai
              </a>

              <div className="mt-5 space-y-2 text-[13px] sm:text-sm leading-relaxed text-[var(--color-text-tertiary)] max-w-prose">
                <p>
                  Dacă poți să trimiți link-ul mai departe, în grupele de an sau de facultate, îți rămân dator.
                  Fiecare vot ajută.
                </p>
                <p>
                  Iar dacă chiar vrei să pui umărul: cine îmi aduce cele mai multe voturi să-mi{" "}
                  <a
                    href={CONTACT_INSTAGRAM}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] underline underline-offset-2"
                  >
                    scrie în privat
                  </a>{" "}
                  și îl recompensez cu drag.
                </p>
                <p className="pt-1 text-[var(--color-text-secondary)]" style={{ fontFamily: "var(--font-display)" }}>
                  Mulțumesc, Andrei
                </p>
              </div>
            </div>

            {/* Photo */}
            <a
              href={VOTE_EXPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block flex-shrink-0 w-[230px] sm:w-[300px] mx-auto md:mx-0 order-1 md:order-2 group"
              aria-label="Deschide pagina de vot Algebo.ai"
            >
              <img
                src={VOTE_IMAGE}
                alt="Pagina Algebo.ai de la Gen-E, cu butonul Vote evidențiat"
                width={1437}
                height={2048}
                className="w-full h-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-lg)] transition-transform duration-200 group-hover:scale-[1.02]"
              />
              <span className="block mt-2 text-center text-[11px] text-[var(--color-text-tertiary)]">
                Un singur tap pe &quot;Vote&quot;. <strong className="text-[var(--color-text-secondary)]">Fără cont.</strong>
              </span>
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
