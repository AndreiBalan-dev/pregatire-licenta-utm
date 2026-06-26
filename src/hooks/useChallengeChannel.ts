"use client";
import { useEffect, useState } from "react";
import { createPusherClient } from "@/lib/realtime/pusher-client";
import { CHANNELS, EVENTS, type Standing, type MilestoneEvent } from "@/lib/realtime/events";

interface Member { id: string; name: string }

export function useChallengeChannel(code: string | null, token: string | null) {
  const [members, setMembers] = useState<Member[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [lastMilestone, setLastMilestone] = useState<MilestoneEvent | null>(null);
  const [status, setStatus] = useState<"started" | "finished" | null>(null);

  useEffect(() => {
    if (!code || !token) return;
    // Reset any state carried over from a previous channel before subscribing fresh.
    setMembers([]);
    setStandings([]);
    setLastMilestone(null);
    setStatus(null);
    const pusher = createPusherClient(token, code);
    const channel = pusher.subscribe(CHANNELS.lobby(code));

    const syncMembers = () => {
      const list: Member[] = [];
      // @ts-expect-error pusher-js members has a typed-loose `each`
      channel.members?.each((m) => list.push({ id: m.id, name: m.info?.name ?? "?" }));
      setMembers(list);
    };

    channel.bind("pusher:subscription_succeeded", syncMembers);
    channel.bind("pusher:member_added", syncMembers);
    channel.bind("pusher:member_removed", syncMembers);
    channel.bind(EVENTS.ROUND_STARTED, () => setStatus("started"));
    channel.bind(EVENTS.LEADERBOARD, (p: { standings: Standing[] }) => setStandings(p.standings));
    channel.bind(EVENTS.MILESTONE, (m: MilestoneEvent) => setLastMilestone(m));
    channel.bind(EVENTS.ROUND_FINISHED, (p: { standings: Standing[] }) => { setStandings(p.standings); setStatus("finished"); });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(CHANNELS.lobby(code));
      pusher.disconnect();
    };
  }, [code, token]);

  return { members, standings, lastMilestone, status };
}
