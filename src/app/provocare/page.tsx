"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { modules } from "@/data/modules";
import { savePlayer } from "@/lib/challenge/identity";

export default function ProvocarePage() {
  const router = useRouter();
  const [hostName, setHostName] = useState("");
  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [shuffleOrder, setShuffleOrder] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [instantFeedback, setInstantFeedback] = useState(true);
  const [capacity, setCapacity] = useState(6);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSubject = (id: string) =>
    setSubjectIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  async function createLobby() {
    setError(null);
    if (hostName.trim().length === 0) { setError("Introdu numele tău."); return; }
    if (subjectIds.length === 0) { setError("Alege cel puțin o materie."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/challenge/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          hostName,
          config: { mode: "self_paced", subjectIds, questionCount, shuffleOrder, shuffleOptions, instantFeedback, perQuestionSeconds: null, capacity, hostPlays: true },
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Eroare."); return; }
      savePlayer(data.code, { hostToken: data.hostToken, playerToken: data.playerToken ?? undefined, name: hostName || undefined });
      router.push(`/provocare/${data.code}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Creează o provocare</h1>

      <label className="block mb-4">
        <span className="text-sm font-medium">Numele tău</span>
        <input value={hostName} onChange={(e) => setHostName(e.target.value)} maxLength={20}
          className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2" />
      </label>

      <fieldset className="mb-4">
        <legend className="text-sm font-medium mb-2">Materii</legend>
        <div className="space-y-3">
          {modules.map((m) => (
            <div key={m.id}>
              <p className="text-xs uppercase tracking-wide text-[var(--color-text-tertiary)] mb-1">{m.name}</p>
              <div className="flex flex-wrap gap-2">
                {m.subjects.map((s) => (
                  <button key={s.id} type="button" onClick={() => toggleSubject(s.id)}
                    className={`px-3 py-1.5 rounded-full border text-sm ${subjectIds.includes(s.id) ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)]" : "border-[var(--color-border)]"}`}>
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <label className="block">
          <span className="text-sm font-medium">Întrebări</span>
          <select value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2">
            {[5, 10, 20, 30, 50].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Capacitate</span>
          <select value={capacity} onChange={(e) => setCapacity(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2">
            {[2,3,4,5,6,7,8,9,10].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </div>

      <div className="space-y-2 mb-6 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={shuffleOrder} onChange={(e) => setShuffleOrder(e.target.checked)} /> Amestecă ordinea întrebărilor</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={shuffleOptions} onChange={(e) => setShuffleOptions(e.target.checked)} /> Amestecă variantele de răspuns</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={instantFeedback} onChange={(e) => setInstantFeedback(e.target.checked)} /> Feedback instant după fiecare răspuns</label>
      </div>

      {error && <p className="text-[var(--color-wrong)] text-sm mb-3">{error}</p>}
      <button type="button" onClick={createLobby} disabled={busy}
        className="w-full py-3 rounded-md bg-[var(--color-accent)] text-[#0C0C0E] font-semibold disabled:opacity-60">
        {busy ? "Se creează..." : "Creează provocarea"}
      </button>
    </main>
  );
}
