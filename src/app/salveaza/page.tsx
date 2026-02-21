"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
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
      // Fallback
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
      <main className="py-8 pb-24 md:pb-8">
        <Container narrow>
          <h1
            className="text-3xl font-bold text-[var(--color-text-primary)] mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Salvează Progresul
          </h1>
          <p className="text-[var(--color-text-secondary)] mb-8">
            Generează o cheie unică pentru a-ți recupera progresul pe orice dispozitiv.
          </p>

          {/* Current stats */}
          <Card className="p-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">Progres curent:</span>
              <div className="flex items-center gap-4">
                <span className="text-[var(--color-text-primary)] font-medium">
                  {stats.totalAnswered} rezolvate
                </span>
                <span className="text-[var(--color-accent)] font-medium">
                  {stats.accuracy}% acuratețe
                </span>
              </div>
            </div>
          </Card>

          {generatedKey ? (
            /* Key display */
            <Card className="p-6 border-[var(--color-accent)] border-2">
              <div className="text-center">
                <div
                  className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Cheia ta de salvare
                </div>

                <div className="flex items-center gap-2 justify-center mb-4">
                  <code className="text-2xl font-bold tracking-wider text-[var(--color-text-primary)] bg-[var(--color-bg-primary)] px-6 py-3 rounded-[var(--radius-md)] border border-[var(--color-border)]"
                    style={{ fontFamily: "var(--font-code)" }}
                  >
                    {generatedKey}
                  </code>
                  <Button variant="secondary" size="sm" onClick={handleCopy}>
                    {copied ? "Copiat!" : "Copiază"}
                  </Button>
                </div>

                <p className="text-sm text-[var(--color-text-tertiary)] max-w-sm mx-auto">
                  Salvează această cheie! O vei folosi pentru a-ți recupera progresul pe orice dispozitiv.
                </p>

                <Button
                  variant="ghost"
                  className="mt-4"
                  onClick={() => {
                    setGeneratedKey(null);
                    setDisplayName("");
                  }}
                >
                  Generează cheie nouă
                </Button>
              </div>
            </Card>
          ) : (
            /* Save form */
            <Card className="p-6">
              <div className="space-y-4">
                <Input
                  label="Nume (opțional)"
                  placeholder="ex. Sesiunea mea de studiu"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={50}
                />

                {error && (
                  <p className="text-sm text-[var(--color-wrong)]">{error}</p>
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
            </Card>
          )}
        </Container>
      </main>
      <MobileNav />
    </>
  );
}
