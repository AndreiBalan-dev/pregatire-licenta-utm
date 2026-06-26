"use client";
import { useState } from "react";

export function JoinDialog({ code, onJoined }: { code: string; onJoined: (token: string, name: string) => void }) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function join() {
    setError(null); setBusy(true);
    try {
      const res = await fetch("/api/challenge/join", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ code, name }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Eroare."); return; }
      onJoined(data.playerToken, data.name);
    } finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-[var(--color-bg-secondary)] rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold mb-4">Intră în provocare</h2>
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={20}
          placeholder="Numele tău" onKeyDown={(e) => e.key === "Enter" && join()}
          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 mb-3" />
        {error && <p className="text-[var(--color-wrong)] text-sm mb-2">{error}</p>}
        <button onClick={join} disabled={busy || name.trim().length === 0}
          className="w-full py-2.5 rounded-md bg-[var(--color-accent)] text-[#0C0C0E] font-semibold disabled:opacity-60">
          {busy ? "..." : "Intră"}
        </button>
      </div>
    </div>
  );
}
