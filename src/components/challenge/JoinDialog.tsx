"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NameModal } from "./NameModal";

export function JoinDialog({ code, onJoined }: { code: string; onJoined: (token: string, name: string) => void }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function join(name: string) {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/challenge/join", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Nu te-ai putut alătura.");
        return;
      }
      onJoined(data.playerToken, data.name);
    } catch {
      setError("Conexiune eșuată. Mai încearcă.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <NameModal
      open
      title="Intră în provocare"
      subtitle="Ai fost invitat. Scrie-ți numele ca să te alături."
      submitLabel="Intră în provocare"
      busy={busy}
      error={error}
      onSubmit={join}
      onClose={() => router.push("/")}
    />
  );
}
