import "server-only";
import { db } from "@/db";
import { challengeLobbies, challengePlayers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashToken } from "@/lib/crypto";
import { CHALLENGE } from "@/lib/constants";
import { rankPlayers, type PlayerRow } from "./scoring";
import type { Standing } from "@/lib/realtime/events";

export function getClientIp(request: Request): string {
  return request.headers.get("x-real-ip") || "unknown";
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
