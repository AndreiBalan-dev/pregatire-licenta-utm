"use client";

import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Container } from "@/components/layout/Container";

export default function DesprePage() {
  return (
    <>
      <Header />
      <main className="relative py-8 pb-24 md:pb-8 overflow-hidden">
        <div
          className="absolute inset-0 grid-pattern opacity-40"
          aria-hidden="true"
        />
        <Container narrow className="relative">
          <div className="mb-10">
            <h1
              className="text-3xl font-bold text-[var(--color-text-primary)] mb-2 animate-fade-in"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Despre Proiect
            </h1>
            <p className="text-[var(--color-text-secondary)] animate-fade-in stagger-1">
              Cine a creat platforma si de ce.
            </p>
          </div>

          {/* Creator card - hero treatment */}
          <div
            className="relative rounded-[var(--radius-xl)] border border-[var(--color-border)] overflow-hidden mb-6 animate-slide-up"
            style={{ background: "linear-gradient(180deg, var(--color-bg-tertiary) 0%, var(--color-bg-secondary) 50%, var(--color-bg-secondary) 100%)" }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse 60% 40% at 30% 0%, var(--color-accent), transparent)",
                opacity: 0.06,
              }}
            />

            <div className="relative p-6">
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-[var(--color-bg-secondary)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://i.imgur.com/ftA62ZL.jpeg"
                    alt="Bălan Andrei Marian"
                    className="w-full h-full object-cover scale-[1.2]"
                  />
                </div>
                <div className="min-w-0">
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)] block mb-1"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Creator
                  </span>
                  <h2
                    className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] mb-1"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    B&#259;lan Andrei Marian
                  </h2>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Creator si dezvoltator al platformei
                  </p>
                </div>
              </div>

              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mt-5 mb-5">
                Aceasta platforma a fost creata pentru a ajuta studentii UTM sa se pregateasca
                eficient pentru examenul de licenta. Toate intrebarile sunt extrase din materialele
                oficiale de examen si organizate pe module si discipline.
              </p>

              {/* Social links as a proper grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <a
                  href="https://instagram.com/balyandrei"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] text-xs font-medium hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-border-strong)] transition-all duration-200 active:scale-[0.97]"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                  <span className="truncate">@balyandrei</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/andrei-balan-dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] text-xs font-medium hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-border-strong)] transition-all duration-200 active:scale-[0.97]"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                  LinkedIn
                </a>
                <a
                  href="https://github.com/andreibalan-dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] text-xs font-medium hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-border-strong)] transition-all duration-200 active:scale-[0.97]"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                  </svg>
                  <span className="truncate">GitHub</span>
                </a>
                <a
                  href="https://github.com/AndreiBalanGT-dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] text-xs font-medium hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-border-strong)] transition-all duration-200 active:scale-[0.97]"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                  </svg>
                  <span className="truncate">GitHub 2</span>
                </a>
              </div>
            </div>
          </div>

          {/* Algebo.ai promo - featured card */}
          <div
            className="relative rounded-[var(--radius-xl)] border-2 border-[var(--color-accent)] overflow-hidden mb-6 animate-slide-up stagger-1"
            style={{ background: "linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-tertiary) 50%, var(--color-bg-secondary) 100%)" }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse 70% 50% at 70% 0%, var(--color-accent), transparent)",
                opacity: 0.08,
              }}
            />

            <div className="relative p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Recomandat
                </span>
              </div>
              <h3
                className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Algebo.ai
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">
                Platforma #1 din Romania pentru pregatirea la BAC Matematica. Lectii interactive,
                tutore AI personal disponibil 24/7 si exercitii rezolvate pas cu pas. Daca te pregatesti
                pentru Bacalaureat sau ai prieteni si colegi care dau BAC-ul, recomanda-le Algebo.ai -
                ii va ajuta enorm.
              </p>
              <div className="flex flex-wrap gap-2 mb-5">
                {["Tutore AI Personal", "1,000+ Exercitii", "Simulari BAC", "Lectii Interactive"].map((tag) => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded-full border border-[var(--color-accent)] border-opacity-30 bg-[var(--color-accent-muted)] text-[var(--color-accent)] font-medium" style={{ borderColor: "rgba(232, 166, 49, 0.3)" }}>
                    {tag}
                  </span>
                ))}
              </div>
              <a
                href="https://algebo.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[#0C0C0E] text-sm font-bold hover:bg-[var(--color-accent-hover)] transition-all duration-200 shadow-[0_0_20px_rgba(232,166,49,0.15)] hover:shadow-[0_0_30px_rgba(232,166,49,0.25)] active:scale-[0.98]"
              >
                Viziteaza Algebo.ai
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </a>
            </div>
          </div>

          {/* Articles section */}
          <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] overflow-hidden mb-6 animate-slide-up stagger-2">
            <div className="p-6">
              <h3
                className="text-lg font-bold text-[var(--color-text-primary)] mb-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Articole Recomandate
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] mb-5">
                Sfaturi si strategii de invatare de pe blogul Algebo.ai:
              </p>
              <div className="space-y-2">
                {[
                  {
                    href: "https://algebo.ai/blog/cum-invata-generatia-ai-metode-moderne",
                    title: "Cum Invata Generatia AI: De Ce Metodele Traditionale Nu Mai Functioneaza",
                    desc: "Descopera metode moderne de invatare bazate pe cercetare stiintifica",
                  },
                  {
                    href: "https://algebo.ai/blog/top-5-metode-invatare-bacalaureat",
                    title: "Top 5 Metode de Invatare pentru Examene, Dovedite Stiintific",
                    desc: "Tehnici de studiu eficiente aplicabile si pentru licenta",
                  },
                  {
                    href: "https://algebo.ai/blog/anxietate-examen-bac-ghid-complet",
                    title: "Stresul de Examen: 7 Tehnici Care Chiar Functioneaza",
                    desc: "Cum sa gestionezi anxietatea inainte si in timpul examenului",
                  },
                ].map((article, i) => (
                  <a
                    key={i}
                    href={article.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-hover)] transition-all duration-200 group"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-[var(--radius-md)] bg-[var(--color-bg-primary)] border border-[var(--color-border)] flex items-center justify-center group-hover:border-[var(--color-accent)] group-hover:bg-[var(--color-accent-muted)] transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-text-tertiary)] group-hover:text-[var(--color-accent)] transition-colors">
                        <line x1="7" y1="17" x2="17" y2="7" />
                        <polyline points="7 7 17 7 17 17" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors block leading-snug">
                        {article.title}
                      </span>
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                        {article.desc}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Platform stats */}
          <div
            className="relative rounded-[var(--radius-xl)] border border-[var(--color-border)] overflow-hidden animate-slide-up stagger-3"
            style={{ background: "linear-gradient(180deg, var(--color-bg-tertiary) 0%, var(--color-bg-secondary) 40%, var(--color-bg-secondary) 100%)" }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse 60% 40% at 50% 0%, var(--color-accent), transparent)",
                opacity: 0.05,
              }}
            />

            <div className="relative p-6">
              <h3
                className="text-lg font-bold text-[var(--color-text-primary)] mb-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Despre platforma
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] mb-5">
                Platforma contine exercitii grilă extrase din materialele oficiale
                pentru examenul de licenta UTM, sesiunea 2026. Intrebarile acopera
                toate cele 4 module de examen.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { value: "715", label: "întrebări", color: "var(--color-accent)" },
                  { value: "15", label: "discipline", color: "var(--color-module-programming)" },
                  { value: "4", label: "module", color: "var(--color-module-databases)" },
                  { value: "100%", label: "gratuit", color: "var(--color-correct)" },
                ].map((stat) => (
                  <div key={stat.label} className="relative p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] overflow-hidden text-center">
                    <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${stat.color}, transparent)`, opacity: 0.06 }} />
                    <div className="relative text-2xl font-extrabold" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em", color: stat.color }}>{stat.value}</div>
                    <div className="relative text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </main>
      <MobileNav />
    </>
  );
}
