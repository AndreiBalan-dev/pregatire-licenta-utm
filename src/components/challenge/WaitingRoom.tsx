"use client";

interface Member { id: string; name: string }

export function WaitingRoom({ code, members, isHost, capacity, onStart, starting }: {
  code: string; members: Member[]; isHost: boolean; capacity: number; onStart: () => void; starting: boolean;
}) {
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/provocare/${code}` : "";
  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-2">Sala de așteptare</h1>
      <p className="text-sm text-[var(--color-text-tertiary)] mb-4">{members.length}/{capacity} jucători</p>

      <button onClick={() => navigator.clipboard?.writeText(shareUrl)}
        aria-label="Copiază linkul provocării"
        className="w-full mb-5 px-3 py-2 rounded-md border border-dashed border-[var(--color-border-strong)] text-sm text-left truncate">
        {shareUrl} <span className="text-[var(--color-accent)]">(copiază)</span>
      </button>

      <ul className="space-y-2 mb-6">
        {members.map((m) => (
          <li key={m.id} className="px-3 py-2 rounded-md bg-[var(--color-bg-secondary)] text-sm">{m.name}</li>
        ))}
      </ul>

      {isHost ? (
        <button onClick={onStart} disabled={starting || members.length < 1}
          className="w-full py-3 rounded-md bg-[var(--color-accent)] text-[#0C0C0E] font-semibold disabled:opacity-60">
          {starting ? "Se pornește..." : "Începe provocarea"}
        </button>
      ) : (
        <p className="text-center text-sm text-[var(--color-text-tertiary)]">Așteptăm ca gazda să înceapă...</p>
      )}
    </main>
  );
}
