"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useSession } from "@/hooks/useSession";
import type { LocalSession } from "@/lib/session-types";

export default function IncarcaPage() {
  const router = useRouter();
  const { hasExistingSession, importSession, setSavedKey } = useSession();
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    displayName: string | null;
    totalAnswered: number;
    totalCorrect: number;
    savedAt: string;
    sessionData: LocalSession;
  } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLoad = async () => {
    if (!key.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/load", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: key.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Eroare la încărcare.");
        return;
      }

      setPreview({
        displayName: data.displayName,
        totalAnswered: data.totalAnswered,
        totalCorrect: data.totalCorrect,
        savedAt: data.savedAt,
        sessionData: data.sessionData as LocalSession,
      });

      if (hasExistingSession) {
        setShowConfirm(true);
      } else {
        doImport(data.sessionData as LocalSession);
      }
    } catch {
      setError("Eroare de conexiune. Verifică internetul.");
    } finally {
      setLoading(false);
    }
  };

  const doImport = (sessionData: LocalSession) => {
    importSession(sessionData);
    setSavedKey(key.trim());
    router.push("/rezultate");
  };

  const accuracy = preview && preview.totalAnswered > 0
    ? Math.round((preview.totalCorrect / preview.totalAnswered) * 100)
    : 0;

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
              Încarcă Sesiune
            </h1>
            <p className="text-[var(--color-text-secondary)] animate-fade-in stagger-1">
              Introdu cheia de salvare pentru a-ți recupera progresul.
            </p>
          </div>

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
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <span
                className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-accent)] block"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Recuperează Progresul
              </span>
            </div>

            <div className="relative px-6 pb-6 pt-4">
              <div className="space-y-4">
                <Input
                  label="Cheie de salvare"
                  placeholder="ex. aBcDeFgHiJkL"
                  value={key}
                  onChange={(e) => {
                    setKey(e.target.value);
                    setError(null);
                  }}
                  error={error || undefined}
                  style={{ fontFamily: "var(--font-code)" }}
                  className="text-lg tracking-wider"
                />

                <Button
                  onClick={handleLoad}
                  disabled={loading || !key.trim()}
                  size="lg"
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#0C0C0E]/30 border-t-[#0C0C0E]" />
                      Se încarcă...
                    </>
                  ) : (
                    "Încarcă Sesiunea"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </main>
      <MobileNav />

      <Modal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirmare"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Ai deja progres local. Încărcarea acestei sesiuni va înlocui datele curente.
          </p>

          {preview && (
            <Card className="p-4">
              <div className="space-y-2 text-sm">
                {preview.displayName && (
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-tertiary)]">Nume:</span>
                    <span className="text-[var(--color-text-primary)] font-medium">{preview.displayName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-tertiary)]">Rezolvate:</span>
                  <span className="text-[var(--color-text-primary)] font-medium">{preview.totalAnswered}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-tertiary)]">Acuratețe:</span>
                  <span className="text-[var(--color-accent)] font-medium">{accuracy}%</span>
                </div>
              </div>
            </Card>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowConfirm(false)}
            >
              Anulează
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                if (preview) doImport(preview.sessionData);
              }}
            >
              Înlocuiește
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
