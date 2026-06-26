"use client";
import Link from "next/link";
import { Leaderboard } from "./Leaderboard";
import type { Standing } from "@/lib/realtime/events";

export function ResultsScreen({ standings, meId }: { standings: Standing[]; meId?: number }) {
  const winner = standings[0];
  return (
    <main className="max-w-md mx-auto px-4 py-10 text-center">
      <h1 className="text-2xl font-bold mb-1">Rezultate finale</h1>
      {winner && <p className="text-[var(--color-accent)] font-semibold mb-6">Câștigător: {winner.name}</p>}
      <div className="text-left mb-8"><Leaderboard standings={standings} meId={meId} /></div>
      <Link href="/provocare" className="inline-block px-5 py-2.5 rounded-md bg-[var(--color-accent)] text-[#0C0C0E] font-semibold">
        Provocare nouă
      </Link>
    </main>
  );
}
