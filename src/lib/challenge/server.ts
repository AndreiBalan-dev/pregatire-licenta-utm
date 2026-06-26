import "server-only";
import { db } from "@/db";
import { challengeLobbies, challengePlayers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashToken } from "@/lib/crypto";
import { CHALLENGE, CHALLENGE_TIMER } from "@/lib/constants";
import { rankPlayers, type PlayerRow } from "./scoring";
import { getTimer, totalDeadlineMs } from "./timing";
import { publishToLobby } from "@/lib/realtime/pusher-server";
import { EVENTS, type Standing } from "@/lib/realtime/events";
import type { ChallengeConfig } from "./types";

export function getClientIp(request: Request): string {
  return request.headers.get("x-real-ip") || "unknown";
}

/** Postgres unique_violation (23505). The neon-http driver wraps the DB error
 *  inside a generic "Failed query" Error, so the real PG code lives on `.cause`,
 *  not the top-level error - check both. */
export function isUniqueViolation(err: unknown): boolean {
  const e = err as { code?: string; cause?: { code?: string } } | null;
  return e?.code === "23505" || e?.cause?.code === "23505";
}

export async function loadLobby(code: string) {
  const rows = await db.select().from(challengeLobbies).where(eq(challengeLobbies.code, code)).limit(1);
  return rows[0] ?? null;
}

export async function loadPlayerByToken(code: string, token: string) {
  const lobby = await loadLobby(code);
  if (!lobby) return null;
  const hash = hashToken(token);
  const players = await db
    .select()
    .from(challengePlayers)
    .where(eq(challengePlayers.playerTokenHash, hash))
    .limit(1);
  const player = players[0];
  if (!player || player.lobbyCode !== code) return null;
  return { lobby, player };
}

export async function buildStandings(code: string): Promise<Standing[]> {
  const lobby = await loadLobby(code);
  const total = Array.isArray(lobby?.questionIds) ? (lobby!.questionIds as number[]).length : 0;
  const players = await db.select().from(challengePlayers).where(eq(challengePlayers.lobbyCode, code));
  const rows: PlayerRow[] = players.map((p) => ({
    id: p.id,
    name: p.name,
    score: Number(p.score),
    correctCount: p.correctCount,
    answeredCount: p.answeredCount,
    totalTimeMs: p.totalTimeMs,
    finishedAt: p.finishedAt ? p.finishedAt.toISOString() : null,
  }));
  return rankPlayers(rows, total);
}

/** Mark a never-started lobby as expired once it is older than the abandon
 *  window. Lazy: runs on access, no cron required. */
export async function expireIfStale(lobby: typeof challengeLobbies.$inferSelect): Promise<boolean> {
  if (lobby.status !== "lobby") return false;
  const age = Date.now() - lobby.createdAt.getTime();
  if (age < CHALLENGE.ABANDON_MS) return false;
  await db.update(challengeLobbies).set({ status: "expired" }).where(eq(challengeLobbies.code, lobby.code));
  return true;
}

/** A player counts as connected if we've heard from them within the grace
 *  window. Used so a disconnected player doesn't block the round from finishing. */
export function isActive(lastSeenAt: Date | null, now: number): boolean {
  return lastSeenAt !== null && now - lastSeenAt.getTime() <= CHALLENGE_TIMER.GRACE_MS;
}

/** Finish a running lobby when its total timer has elapsed, or when every player
 *  is done - either finished or gone past the grace window. Lazy: runs on access
 *  (no cron). Returns true if it just transitioned to finished. */
export async function maybeFinishRunning(
  lobby: typeof challengeLobbies.$inferSelect,
): Promise<boolean> {
  if (lobby.status !== "running") return false;
  const timer = getTimer(lobby.config as { timer?: ChallengeConfig["timer"] });
  const now = Date.now();

  const deadline = totalDeadlineMs(timer, lobby.startedAt);
  let done = deadline !== null && now >= deadline;

  if (!done) {
    const players = await db
      .select({ finishedAt: challengePlayers.finishedAt, lastSeenAt: challengePlayers.lastSeenAt })
      .from(challengePlayers)
      .where(eq(challengePlayers.lobbyCode, lobby.code));
    done = players.length > 0 && players.every((p) => p.finishedAt !== null || !isActive(p.lastSeenAt, now));
  }
  if (!done) return false;

  await db.update(challengeLobbies)
    .set({ status: "finished", finishedAt: new Date() })
    .where(eq(challengeLobbies.code, lobby.code));
  await publishToLobby(lobby.code, EVENTS.ROUND_FINISHED, { standings: await buildStandings(lobby.code) });
  return true;
}
