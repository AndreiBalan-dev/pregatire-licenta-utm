"use client";

import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Container } from "@/components/layout/Container";

type ChangeType = "feature" | "fix" | "improvement" | "docs";

interface Change {
  text: string;
  type: ChangeType;
}

interface Version {
  version: string;
  date: string;
  title: string;
  changes: Change[];
}

const typeConfig: Record<ChangeType, { label: string; color: string; bg: string }> = {
  feature: {
    label: "Nou",
    color: "#34D399",
    bg: "rgba(52, 211, 153, 0.1)",
  },
  fix: {
    label: "Fix",
    color: "#60A5FA",
    bg: "rgba(96, 165, 250, 0.1)",
  },
  improvement: {
    label: "Update",
    color: "#E8A631",
    bg: "rgba(232, 166, 49, 0.1)",
  },
  docs: {
    label: "Docs",
    color: "#94A3B8",
    bg: "rgba(148, 163, 184, 0.1)",
  },
};

const changelog: Version[] = [
  {
    version: "1.3.1",
    date: "8 Aprilie 2026",
    title: "Figuri si pagina noutati",
    changes: [
      { text: "Figuri adaugate la intrebarile care necesita imagini", type: "feature" },
      { text: "Pagina Noutati cu istoricul tuturor actualizarilor", type: "feature" },
    ],
  },
  {
    version: "1.3.0",
    date: "24 Februarie 2026",
    title: "Imbunatatiri de design",
    changes: [
      { text: "Design nou pe pagina de sesiune practica", type: "improvement" },
      { text: "Imbunatatiri vizuale pe toata platforma", type: "improvement" },
      { text: "Efect glow pe cardurile de pe pagina principala reparat", type: "fix" },
      { text: "Mai multe corectii de bug-uri", type: "fix" },
    ],
  },
  {
    version: "1.2.0",
    date: "23 Februarie 2026",
    title: "Navigare mobil imbunatatita",
    changes: [
      { text: "Pagina Revizuire adaugata in navigarea mobila", type: "feature" },
      { text: "Butonul Salveaza vizibil acum si pe mobil in header", type: "feature" },
    ],
  },
  {
    version: "1.1.1",
    date: "22 Februarie 2026",
    title: "Corectii minore",
    changes: [
      { text: "Imbunatatiri pe componenta intrebarilor", type: "improvement" },
      { text: "Curatare cod", type: "improvement" },
    ],
  },
  {
    version: "1.1.0",
    date: "21 Februarie 2026",
    title: "Syntax highlighting si analytics",
    changes: [
      { text: "Syntax highlighting pentru codul din intrebari", type: "feature" },
      { text: "Syntax highlighting pentru variante de raspuns cu cod", type: "feature" },
      { text: "Vercel Web Analytics integrat", type: "feature" },
      { text: "Vercel Speed Insights integrat", type: "feature" },
      { text: "Imbunatatiri SEO - meta tags, Open Graph, structura", type: "improvement" },
      { text: "Imbunatatiri selector materii", type: "improvement" },
    ],
  },
  {
    version: "1.0.1",
    date: "21 Februarie 2026",
    title: "Corectii dupa lansare",
    changes: [
      { text: "Corectii la continutul intrebarilor si ID-uri", type: "fix" },
      { text: "Imbunatatiri SEO initiale", type: "improvement" },
      { text: "Fix-uri pe design ModuleCard", type: "fix" },
      { text: "Corectii multiple de stabilitate", type: "fix" },
      { text: "Fix-uri frontend generale", type: "fix" },
    ],
  },
  {
    version: "1.0.0",
    date: "21 Februarie 2026",
    title: "Lansare platforma",
    changes: [
      { text: "715 intrebari grila din materialele oficiale UTM", type: "feature" },
      { text: "4 module: Programare, Baze de Date, Retele, Tehnologii Web", type: "feature" },
      { text: "15 discipline acoperite", type: "feature" },
      { text: "Mod practica cu selectare materii si intrebari aleatorii", type: "feature" },
      { text: "Pagina rezultate cu statistici detaliate per materie", type: "feature" },
      { text: "Sistem salvare/incarcare sesiuni cu cheie unica", type: "feature" },
      { text: "Design responsive - mobil, tableta si desktop", type: "feature" },
      { text: "Mod intunecat si luminos", type: "feature" },
    ],
  },
];

export default function NoutatiPage() {
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
              Noutati
            </h1>
            <p className="text-[var(--color-text-secondary)] animate-fade-in stagger-1">
              Toate actualizarile platformei, de la lansare pana acum.
            </p>
          </div>

          {/* Current version badge */}
          <div className="flex items-center gap-3 mb-8 animate-fade-in stagger-1">
            <span
              className="text-xs font-bold px-3 py-1.5 rounded-full bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)]"
              style={{ borderColor: "rgba(232, 166, 49, 0.3)" }}
            >
              Versiune curenta: v{changelog[0].version}
            </span>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[11px] top-4 bottom-4 w-px bg-[var(--color-border)] hidden sm:block" />

            <div className="space-y-6">
              {changelog.map((release, i) => (
                <div
                  key={release.version}
                  className="relative animate-slide-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-[22px] hidden sm:flex">
                    <div
                      className="w-[23px] h-[23px] rounded-full border-2 flex items-center justify-center"
                      style={{
                        borderColor: i === 0 ? "var(--color-accent)" : "var(--color-border-strong)",
                        background: i === 0 ? "var(--color-accent-muted)" : "var(--color-bg-primary)",
                      }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          background: i === 0 ? "var(--color-accent)" : "var(--color-border-strong)",
                        }}
                      />
                    </div>
                  </div>

                  {/* Version card */}
                  <div className="sm:ml-10">
                    <div
                      className="rounded-[var(--radius-xl)] border overflow-hidden"
                      style={{
                        borderColor: i === 0 ? "rgba(232, 166, 49, 0.3)" : "var(--color-border)",
                        background: "var(--color-bg-secondary)",
                      }}
                    >
                      {i === 0 && (
                        <div
                          className="absolute inset-0 pointer-events-none rounded-[var(--radius-xl)]"
                          style={{
                            background: "radial-gradient(ellipse 60% 30% at 30% 0%, var(--color-accent), transparent)",
                            opacity: 0.05,
                          }}
                        />
                      )}

                      <div className="relative p-5">
                        {/* Header */}
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className="text-lg font-bold text-[var(--color-text-primary)]"
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            v{release.version}
                          </span>
                          {i === 0 && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)] bg-[var(--color-accent-muted)] px-2 py-0.5 rounded-full">
                              Latest
                            </span>
                          )}
                          {release.version === "1.0.0" && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-correct)] px-2 py-0.5 rounded-full" style={{ background: "rgba(52, 211, 153, 0.1)" }}>
                              Lansare
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                            {release.title}
                          </span>
                          <span className="text-xs text-[var(--color-text-tertiary)]">
                            {release.date}
                          </span>
                        </div>

                        {/* Changes */}
                        <div className="space-y-2">
                          {release.changes.map((change, j) => {
                            const config = typeConfig[change.type];
                            return (
                              <div
                                key={j}
                                className="flex items-start gap-2.5"
                              >
                                <div
                                  className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-[7px]"
                                  style={{ background: config.color }}
                                />
                                <span className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                                  {change.text}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </main>
      <MobileNav />
    </>
  );
}
