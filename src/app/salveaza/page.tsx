"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSession } from "@/hooks/useSession";

export default function SalveazaPage() {
  const { session, getOverallStats, exportSession, setSavedKey } = useSession();
  const [displayName, setDisplayName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(session.savedKey);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const stats = getOverallStats();

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const sessionData = exportSession();
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim() || undefined,
          sessionData,
          totalAnswered: stats.totalAnswered,
          totalCorrect: stats.totalCorrect,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Eroare la salvare.");
        return;
      }

      setGeneratedKey(data.key);
      setSavedKey(data.key);
    } catch {
      setError("Eroare de conexiune. Verifică internetul.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedKey) return;
    try {
      await navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = generatedKey;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
              Salvează Progresul
            </h1>
            <p className="text-[var(--color-text-secondary)] animate-fade-in stagger-1">
              Generează o cheie unică pentru a-ți recupera progresul pe orice dispozitiv.
            </p>
          </div>

          {/* Progress summary card */}
          <div
            className="relative rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5 mb-8 overflow-hidden animate-slide-up stagger-1"
            style={{ background: "linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-tertiary) 100%)" }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse 60% 80% at 100% 0%, var(--color-accent), transparent)",
                opacity: 0.04,
              }}
            />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-accent-muted)] flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <div>
                  <span className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider">Progres curent</span>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                    <span className="text-sm text-[var(--color-text-primary)] font-semibold">
                      {stats.totalAnswered} rezolvate
                    </span>
                    <span className="w-px h-3 bg-[var(--color-border)] hidden sm:block" />
                    <span className="text-sm text-[var(--color-accent)] font-semibold">
                      {stats.accuracy}% acuratețe
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {generatedKey ? (
            <div
              className="relative rounded-[var(--radius-xl)] border-2 border-[var(--color-accent)] overflow-hidden animate-scale-in"
              style={{ background: "linear-gradient(180deg, var(--color-bg-tertiary) 0%, var(--color-bg-secondary) 40%, var(--color-bg-secondary) 100%)" }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse 70% 40% at 50% 0%, var(--color-accent), transparent)",
                  opacity: 0.08,
                }}
              />

              <div className="relative text-center px-6 pt-8 pb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-accent-muted)] mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>

                <div
                  className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-accent)] mb-5"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Cheia ta de salvare
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 justify-center mb-5">
                  <code
                    className="text-lg sm:text-2xl font-bold tracking-wider text-[var(--color-text-primary)] bg-[var(--color-bg-primary)] px-4 sm:px-6 py-3 rounded-[var(--radius-md)] border border-[var(--color-border)]"
                    style={{ fontFamily: "var(--font-code)" }}
                  >
                    {generatedKey}
                  </code>
                  <Button variant="secondary" size="sm" onClick={handleCopy}>
                    {copied ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-correct)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Copiat!
                      </>
                    ) : "Copiază"}
                  </Button>
                </div>

                <p className="text-sm text-[var(--color-text-tertiary)] max-w-sm mx-auto">
                  Salvează această cheie! O vei folosi pentru a-ți recupera progresul pe orice dispozitiv.
                </p>

                <Button
                  variant="ghost"
                  className="mt-5"
                  onClick={() => {
                    setGeneratedKey(null);
                    setDisplayName("");
                  }}
                >
                  Generează cheie nouă
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="relative rounded-[var(--radius-xl)] border border-[var(--color-border)] overflow-hidden animate-slide-up stagger-2"
              style={{ background: "linear-gradient(180deg, var(--color-bg-tertiary) 0%, var(--color-bg-secondary) 40%, var(--color-bg-secondary) 100%)" }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse 70% 40% at 50% 0%, var(--color-accent), transparent)",
                  opacity: 0.06,
                }}
              />

              <div className="relative px-6 pt-8 pb-2 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-accent-muted)] mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-accent)] block"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Salvare Nouă
                </span>
              </div>

              <div className="relative px-6 pb-6 pt-4">
                <div className="space-y-4">
                  <Input
                    label="Nume (opțional)"
                    placeholder="ex. Sesiunea mea de studiu"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={50}
                  />

                  {error && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] bg-[var(--color-wrong-bg)] border border-[var(--color-wrong-border)]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-wrong)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                      <p className="text-sm text-[var(--color-wrong)]">{error}</p>
                    </div>
                  )}

                  <Button
                    onClick={handleSave}
                    disabled={loading || stats.totalAnswered === 0}
                    size="lg"
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#0C0C0E]/30 border-t-[#0C0C0E]" />
                        Se salvează...
                      </>
                    ) : (
                      "Generează Cheie de Salvare"
                    )}
                  </Button>

                  {stats.totalAnswered === 0 && (
                    <p className="text-xs text-[var(--color-text-tertiary)] text-center">
                      Rezolvă cel puțin o întrebare înainte de a salva.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </Container>
      </main>
      <MobileNav />
    </>
  );
}
