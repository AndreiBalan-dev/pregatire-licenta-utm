"use client";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";

export default function DesprePage() {
  return (
    <>
      <Header />
      <main className="py-8 pb-24 md:pb-8">
        <Container narrow>
          <h1
            className="text-3xl font-bold text-[var(--color-text-primary)] mb-2 animate-fade-in"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Despre Proiect
          </h1>
          <p className="text-[var(--color-text-secondary)] mb-8 animate-fade-in stagger-1">
            Cine a creat platforma si de ce.
          </p>

          {/* Creator */}
          <Card className="p-6 mb-6 animate-slide-up">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src="https://i.imgur.com/UJhfuwT.jpeg"
                  alt="Bălan Andrei Marian"
                  className="w-full h-full object-cover scale-150"
                />
              </div>
              <div>
                <h2
                  className="text-xl font-bold text-[var(--color-text-primary)] mb-1"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  B&#259;lan Andrei Marian
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                  Creator si dezvoltator al platformei
                </p>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">
                  Aceasta platforma a fost creata pentru a ajuta studentii UTM sa se pregateasca
                  eficient pentru examenul de licenta. Toate intrebarile sunt extrase din materialele
                  oficiale de examen si organizate pe module si discipline.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="https://instagram.com/balyandrei"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] text-sm font-medium hover:bg-[var(--color-bg-hover)] transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                    @balyandrei
                  </a>
                  <a
                    href="https://www.linkedin.com/in/andrei-balan-dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] text-sm font-medium hover:bg-[var(--color-bg-hover)] transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] text-sm font-medium hover:bg-[var(--color-bg-hover)] transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                    </svg>
                    AndreiBalan-Dev
                  </a>
                  <a
                    href="https://github.com/AndreiBalanGT-dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] text-sm font-medium hover:bg-[var(--color-bg-hover)] transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                    </svg>
                    AndreiBalanGT-dev
                  </a>
                </div>
              </div>
            </div>
          </Card>

          {/* Algebo.ai promotion */}
          <Card className="p-6 mb-6 animate-slide-up stagger-1" accent="var(--color-accent)">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Recomandat
              </span>
            </div>
            <h3
              className="text-lg font-bold text-[var(--color-text-primary)] mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Algebo.ai
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-3">
              Platforma #1 din Romania pentru pregatirea la BAC Matematica. Lectii interactive,
              tutore AI personal disponibil 24/7 si exercitii rezolvate pas cu pas. Daca te pregatesti
              pentru Bacalaureat, Algebo.ai este instrumentul de care ai nevoie.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-xs px-2 py-1 rounded-full bg-[var(--color-accent-muted)] text-[var(--color-accent)] font-medium">Tutore AI Personal</span>
              <span className="text-xs px-2 py-1 rounded-full bg-[var(--color-accent-muted)] text-[var(--color-accent)] font-medium">1,000+ Exercitii</span>
              <span className="text-xs px-2 py-1 rounded-full bg-[var(--color-accent-muted)] text-[var(--color-accent)] font-medium">Simulari BAC</span>
              <span className="text-xs px-2 py-1 rounded-full bg-[var(--color-accent-muted)] text-[var(--color-accent)] font-medium">Lectii Interactive</span>
            </div>
            <a
              href="https://algebo.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[#0C0C0E] text-sm font-bold hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              Viziteaza Algebo.ai
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </a>
          </Card>

          {/* Blog article promotion */}
          <Card className="p-6 mb-6 animate-slide-up stagger-2">
            <h3
              className="text-lg font-bold text-[var(--color-text-primary)] mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Articole Recomandate
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
              Sfaturi si strategii de invatare de pe blogul Algebo.ai:
            </p>
            <div className="space-y-3">
              <a
                href="https://algebo.ai/blog/cum-invata-generatia-ai-metode-moderne"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 rounded-[var(--radius-md)] border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-hover)] transition-colors group"
              >
                <span className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                  Cum Invata Generatia AI: De Ce Metodele Traditionale Nu Mai Functioneaza
                </span>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                  Descopera metode moderne de invatare bazate pe cercetare stiintifica
                </p>
              </a>
              <a
                href="https://algebo.ai/blog/top-5-metode-invatare-bacalaureat"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 rounded-[var(--radius-md)] border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-hover)] transition-colors group"
              >
                <span className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                  Top 5 Metode de Invatare pentru Examene, Dovedite Stiintific
                </span>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                  Tehnici de studiu eficiente aplicabile si pentru licenta
                </p>
              </a>
              <a
                href="https://algebo.ai/blog/anxietate-examen-bac-ghid-complet"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 rounded-[var(--radius-md)] border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-hover)] transition-colors group"
              >
                <span className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                  Stresul de Examen: 7 Tehnici Care Chiar Functioneaza
                </span>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                  Cum sa gestionezi anxietatea inainte si in timpul examenului
                </p>
              </a>
            </div>
          </Card>

          {/* Project info */}
          <Card className="p-6 animate-slide-up stagger-3">
            <h3
              className="text-lg font-bold text-[var(--color-text-primary)] mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Despre platforma
            </h3>
            <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              <p>
                Platforma contine exercitii grilă extrase din materialele oficiale
                pentru examenul de licenta UTM, sesiunea 2026. Intrebarile acopera
                toate cele 4 module de examen.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)]">
                  <div className="text-2xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-display)" }}>665</div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">intrebari</div>
                </div>
                <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)]">
                  <div className="text-2xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-display)" }}>14</div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">discipline</div>
                </div>
                <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)]">
                  <div className="text-2xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-display)" }}>4</div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">module</div>
                </div>
                <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)]">
                  <div className="text-2xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-display)" }}>100%</div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">gratuit</div>
                </div>
              </div>
            </div>
          </Card>
        </Container>
      </main>
      <MobileNav />
    </>
  );
}
