"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { getIdentity, savePlayer } from "@/lib/challenge/identity";
import { useChallengeChannel } from "@/hooks/useChallengeChannel";
import { JoinDialog } from "@/components/challenge/JoinDialog";
import { WaitingRoom } from "@/components/challenge/WaitingRoom";
import { SelfPacedRuntime } from "@/components/challenge/SelfPacedRuntime";
import { ResultsScreen } from "@/components/challenge/ResultsScreen";

interface Snapshot {
  status: string; mode: string; config: { capacity: number; instantFeedback: boolean };
  questionIds: number[] | null;
  me: { playerId: number; name: string; isHost: boolean; questionOrder: number[] | null; optionOrder: Record<number, string[]> | null; answers: { questionId: number; selected: string; isCorrect: boolean }[] };
  standings: { playerId: number; name: string; score: number; rank: number; progress: number; finished: boolean; correctCount: number; answeredCount: number; totalQuestions: number }[];
}

export default function LobbyPage() {
  const { code } = useParams<{ code: string }>();
  const [token, setToken] = useState<string | null>(null);
  const [hostToken, setHostToken] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [needsJoin, setNeedsJoin] = useState(false);
  const [starting, setStarting] = useState(false);

  // Hydrate identity + state on mount.
  useEffect(() => {
    const id = getIdentity(code);
    if (!id?.playerToken && !id?.hostToken) { setNeedsJoin(true); return; }
    setToken(id.playerToken ?? null);
    setHostToken(id.hostToken ?? null);
    const t = id.playerToken ?? id.hostToken!;
    fetch(`/api/challenge/state?code=${code}&token=${encodeURIComponent(t)}`)
      .then((r) => r.json()).then((data) => { if (!data.error) setSnapshot(data); else setNeedsJoin(true); });
  }, [code]);

  const { members, standings, lastMilestone, status } = useChallengeChannel(code, token ?? hostToken);

  // When realtime says the round started/finished, refetch our snapshot.
  const refetch = useCallback(() => {
    const t = token ?? hostToken; if (!t) return;
    fetch(`/api/challenge/state?code=${code}&token=${encodeURIComponent(t)}`).then((r) => r.json()).then((d) => !d.error && setSnapshot(d));
  }, [code, token, hostToken]);
  useEffect(() => { if (status) refetch(); }, [status, refetch]);

  function onJoined(playerToken: string, name: string) {
    savePlayer(code, { playerToken, name });
    setToken(playerToken); setNeedsJoin(false); refetch();
  }

  async function onStart() {
    setStarting(true);
    try {
      await fetch("/api/challenge/start", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code, hostToken }) });
      refetch();
    } finally { setStarting(false); }
  }

  if (needsJoin) return <JoinDialog code={code} onJoined={onJoined} />;
  if (!snapshot) return <main className="p-8 text-center text-sm text-[var(--color-text-tertiary)]">Se încarcă...</main>;

  const liveStandings = standings.length ? standings : snapshot.standings;

  if (snapshot.status === "finished" || status === "finished") {
    return <ResultsScreen standings={liveStandings} meId={snapshot.me?.playerId} />;
  }
  if (snapshot.status === "running" || status === "started") {
    return <SelfPacedRuntime code={code} token={token!} snapshot={snapshot} standings={liveStandings} lastMilestone={lastMilestone} />;
  }
  return <WaitingRoom code={code} members={members} isHost={!!hostToken} capacity={snapshot.config.capacity} onStart={onStart} starting={starting} />;
}
