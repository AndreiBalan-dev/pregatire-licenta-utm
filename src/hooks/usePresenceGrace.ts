"use client";

import { useEffect, useRef, useState } from "react";

export interface GraceState {
  connected: boolean;
  /** Seconds left in the reconnect grace window (0 once it has expired). */
  secondsLeft: number;
}

/**
 * Tracks per-player connection state by cross-referencing the live presence
 * member ids (which equal the DB player ids) against the known roster. When a
 * player drops out of presence we start a local countdown so the others can see
 * "reconnecting, Ns left"; when they reappear the entry clears. Driven by
 * presence changes (real-time) plus a 1s tick while anyone is away.
 */
export function usePresenceGrace(
  memberIds: string[],
  playerIds: number[],
  graceSeconds: number,
): Map<number, GraceState> {
  const disconnectedAt = useRef<Map<number, number>>(new Map());
  const [grace, setGrace] = useState<Map<number, GraceState>>(() => new Map());

  const presentKey = [...new Set(memberIds)].join(",");
  const rosterKey = [...playerIds].sort((a, b) => a - b).join(",");

  useEffect(() => {
    const present = new Set(memberIds.map(Number));
    const da = disconnectedAt.current;

    const recompute = () => {
      const now = Date.now();
      for (const pid of playerIds) {
        if (present.has(pid)) da.delete(pid);
        else if (!da.has(pid)) da.set(pid, now);
      }
      for (const pid of [...da.keys()]) if (!playerIds.includes(pid)) da.delete(pid);

      const next = new Map<number, GraceState>();
      for (const pid of playerIds) {
        const since = da.get(pid);
        next.set(
          pid,
          since === undefined
            ? { connected: true, secondsLeft: 0 }
            : { connected: false, secondsLeft: Math.max(0, graceSeconds - Math.floor((now - since) / 1000)) },
        );
      }
      setGrace(next);
    };

    recompute();
    const hasDisconnected = playerIds.some((pid) => !present.has(pid));
    if (!hasDisconnected) return;
    const id = setInterval(recompute, 1000);
    return () => clearInterval(id);
  }, [presentKey, rosterKey, graceSeconds]); // eslint-disable-line react-hooks/exhaustive-deps

  return grace;
}
