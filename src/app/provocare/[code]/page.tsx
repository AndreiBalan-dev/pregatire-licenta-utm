"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { getIdentity, savePlayer } from "@/lib/challenge/identity";
import { useChallengeChannel } from "@/hooks/useChallengeChannel";
import { JoinDialog } from "@/components/challenge/JoinDialog";
import { WaitingRoom } from "@/components/challenge/WaitingRoom";
import { SelfPacedRuntime } from "@/components/challenge/SelfPacedRuntime";
import { ResultsScreen } from "@/components/challenge/ResultsScreen";
import { ShareModal } from "@/components/challenge/ShareModal";
import { getTimer } from "@/lib/challenge/timing";
import { usePresenceGrace } from "@/hooks/usePresenceGrace";
import { CHALLENGE_TIMER } from "@/lib/constants";
import type { Standing } from "@/lib/realtime/events";
import type { TimerConfig } from "@/lib/challenge/types";

interface Snapshot {
  status: string;
  mode: string;
  config: { capacity: number; instantFeedback: boolean; timer?: TimerConfig };
  questionIds: number[] | null;
  totalRemainingSeconds?: number | null;
  me: { playerId: number; name: string; isHost: boolean; questionOrder: number[] | null; optionOrder: Record<number, string[]> | null; answers: { questionId: number; selected: string; isCorrect: boolean }[] };
  standings: Standing[];
}

export default function LobbyPage() {
  const { code } = useParams<{ code: string }>();
  const [token, setToken] = useState<string | null>(null);
  const [hostToken, setHostToken] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [needsJoin, setNeedsJoin] = useState(false);
  const [starting, setStarting] = useState(false);
  const [showShare, setShowShare] = useState(false);

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

  // Freshly-created lobby (flagged by the create page): show the share overlay once.
  useEffect(() => {
    try {
      if (sessionStorage.getItem(`provocare:new:${code}`)) {
        sessionStorage.removeItem(`provocare:new:${code}`);
        setShowShare(true);
      }
    } catch { /* ignore */ }
  }, [code]);

  const { members, standings, lastMilestone, status, connected } = useChallengeChannel(code, token ?? hostToken);

  // Cross-reference live presence (member ids == player ids) against the roster so
  // the leaderboard can grey out whoever dropped and count down their grace window.
  const rosterIds = (standings.length ? standings : snapshot?.standings ?? []).map((s) => s.playerId);
  const connection = usePresenceGrace(members.map((m) => m.id), rosterIds, CHALLENGE_TIMER.GRACE_MS / 1000);

  // When realtime says the round started/finished, refetch our snapshot.
  const refetch = useCallback(() => {
    const t = token ?? hostToken; if (!t) return;
    fetch(`/api/challenge/state?code=${code}&token=${encodeURIComponent(t)}`).then((r) => r.json()).then((d) => !d.error && setSnapshot(d));
  }, [code, token, hostToken]);
  useEffect(() => { if (status) refetch(); }, [status, refetch]);

  // Heartbeat while the round is live: keeps our grace window open (so we aren't
  // treated as gone), resyncs the total clock, and notices a server-side finish.
  useEffect(() => {
    const running = snapshot?.status === "running" || status === "started";
    if (!running) return;
    const t = token ?? hostToken;
    if (!t) return;
    const id = setInterval(() => {
      fetch(`/api/challenge/state?code=${code}&token=${encodeURIComponent(t)}`)
        .then((r) => r.json())
        .then((d) => { if (!d.error) setSnapshot(d); })
        .catch(() => { /* transient network blip - the next tick retries */ });
    }, 15000);
    return () => clearInterval(id);
  }, [snapshot?.status, status, token, hostToken, code]);

  function onJoined(playerToken: string, name: string) {
    savePlayer(code, { playerToken, name });
    setToken(playerToken);
    setNeedsJoin(false);
    // Fetch with the fresh token directly - refetch() would capture the pre-join
    // null token and exit early, leaving the joiner stuck on the loading screen.
    fetch(`/api/challenge/state?code=${code}&token=${encodeURIComponent(playerToken)}`)
      .then((r) => r.json())
      .then((d) => { if (!d.error) setSnapshot(d); });
  }

  async function onStart() {
    setStarting(true);
    try {
      const res = await fetch("/api/challenge/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code, hostToken }),
      });
      if (res.ok) refetch();
    } finally {
      setStarting(false);
    }
  }

  if (needsJoin) return <JoinDialog code={code} onJoined={onJoined} />;
  if (!snapshot) return <main className="p-8 text-center text-sm text-[var(--color-text-tertiary)]">Se încarcă...</main>;

  const liveStandings = standings.length ? standings : snapshot.standings;

  if (snapshot.status === "finished" || status === "finished") {
    return <ResultsScreen standings={liveStandings} meId={snapshot.me?.playerId} />;
  }
  if (snapshot.status === "running" || status === "started") {
    return (
      <>
        {!connected && (
          <div className="fixed top-0 inset-x-0 z-[130] flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[var(--color-wrong)]">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1 1l22 22" /><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" /><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" /><path d="M10.71 5.05A16 16 0 0 1 22.58 9" /><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" />
            </svg>
            Conexiune pierdută. Se reîncearcă...
          </div>
        )}
        <SelfPacedRuntime
          code={code}
          token={token!}
          snapshot={snapshot}
          standings={liveStandings}
          lastMilestone={lastMilestone}
          timer={getTimer(snapshot.config)}
          totalRemaining={snapshot.totalRemainingSeconds ?? null}
          onTimeUp={refetch}
          connection={connection}
        />
      </>
    );
  }
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/provocare/${code}` : "";
  return (
    <>
      <WaitingRoom code={code} members={members} isHost={!!hostToken} capacity={snapshot.config.capacity} meId={snapshot.me?.playerId} onStart={onStart} starting={starting} />
      {showShare && <ShareModal open code={code} url={shareUrl} onEnter={() => setShowShare(false)} />}
    </>
  );
}
