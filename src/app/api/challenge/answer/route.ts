import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { challengeLobbies, challengePlayers, challengeAnswers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashIp } from "@/lib/crypto";
import { checkRateLimit } from "@/lib/rate-limit";
import { RATE_LIMITS, MAX_QUESTION_TIME_MS } from "@/lib/constants";
import { getQuestion } from "@/data";
import { loadPlayerByToken, getClientIp, buildStandings } from "@/lib/challenge/server";
import { detectMilestones } from "@/lib/challenge/milestones";
import { publishToLobby } from "@/lib/realtime/pusher-server";
import { EVENTS } from "@/lib/realtime/events";

const VALID = new Set(["a", "b", "c", "d"]);

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`ch:answer:${hashIp(ip)}`, RATE_LIMITS.challengeAnswer);
  if (!rl.allowed) return NextResponse.json({ error: "Prea multe cereri." }, { status: 429 });

  let body: { code?: unknown; token?: unknown; questionId?: unknown; selected?: unknown; timeMs?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Date invalide." }, { status: 400 }); }

  const code = typeof body.code === "string" ? body.code.trim() : "";
  const token = typeof body.token === "string" ? body.token : "";
  const questionId = Number(body.questionId);
  const selected = String(body.selected);
  const timeMs = Math.max(0, Math.min(Number(body.timeMs) || 0, MAX_QUESTION_TIME_MS));

  if (!code || !token || !Number.isInteger(questionId) || !VALID.has(selected)) {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }

  const found = await loadPlayerByToken(code, token);
  if (!found) return NextResponse.json({ error: "Neautorizat." }, { status: 403 });
  const { lobby, player } = found;
  if (lobby.status !== "running") return NextResponse.json({ error: "Provocarea nu este activă." }, { status: 409 });

  const order = (player.questionOrder as number[] | null) ?? [];
  if (!order.includes(questionId)) return NextResponse.json({ error: "Întrebare în afara setului." }, { status: 400 });

  const question = getQuestion(questionId);
  if (!question) return NextResponse.json({ error: "Întrebare inexistentă." }, { status: 400 });
  const isCorrect = selected === question.correctAnswer;
  const total = order.length;

  const beforeAnswered = player.answeredCount;

  // Record the answer; the unique(playerId, questionId) constraint makes this the
  // single source of "no redo". A duplicate throws and we return 409.
  try {
    await db.insert(challengeAnswers).values({
      lobbyCode: code, playerId: player.id, questionId,
      selected, isCorrect, timeMs, pointsAwarded: isCorrect ? "1" : "0",
    });
  } catch (e: unknown) {
    // Postgres unique_violation (the no-redo constraint). Any other error is a
    // real failure and must not be masked as a duplicate.
    if ((e as { code?: string })?.code === "23505") {
      return NextResponse.json({ error: "Ai răspuns deja la această întrebare." }, { status: 409 });
    }
    throw e;
  }

  const afterAnswered = beforeAnswered + 1;
  const newCorrect = player.correctCount + (isCorrect ? 1 : 0);
  const justFinished = afterAnswered >= total;

  // Determine leader before, to detect a lead change after this answer.
  const beforeStandings = await buildStandings(code);
  const beforeLeaderId = beforeStandings[0]?.playerId ?? null;

  await db.update(challengePlayers).set({
    answeredCount: afterAnswered,
    correctCount: newCorrect,
    score: String(newCorrect), // self-paced score = correct count
    totalTimeMs: player.totalTimeMs + timeMs,
    finishedAt: justFinished ? new Date() : player.finishedAt,
    lastSeenAt: new Date(),
  }).where(eq(challengePlayers.id, player.id));

  // Only needed when this answer completed the set (used for first-finish vs finish).
  let anyoneFinishedBefore = false;
  if (justFinished) {
    const others = await db.select({ finishedAt: challengePlayers.finishedAt })
      .from(challengePlayers).where(eq(challengePlayers.lobbyCode, code));
    // The current player's finishedAt is already set, so > 1 means someone else finished earlier.
    anyoneFinishedBefore = others.filter((o) => o.finishedAt !== null).length > 1;
  }

  const afterStandings = await buildStandings(code);
  const afterLeaderId = afterStandings[0]?.playerId ?? null;
  const becameLeader = afterLeaderId === player.id && beforeLeaderId !== player.id;

  const milestones = detectMilestones({
    playerId: player.id, name: player.name, total,
    beforeAnswered, afterAnswered, justFinished, anyoneFinishedBefore, becameLeader,
  });

  // Publish: leaderboard first, then any milestones.
  await publishToLobby(code, EVENTS.LEADERBOARD, { standings: afterStandings });
  for (const m of milestones) await publishToLobby(code, EVENTS.MILESTONE, m);

  // If everyone has finished, close the lobby and announce the final podium.
  const allFinished = afterStandings.every((s) => s.finished);
  if (allFinished) {
    await db.update(challengeLobbies).set({ status: "finished", finishedAt: new Date() }).where(eq(challengeLobbies.code, code));
    await publishToLobby(code, EVENTS.ROUND_FINISHED, { standings: afterStandings });
  }

  const config = lobby.config as { instantFeedback: boolean };
  if (config.instantFeedback) {
    return NextResponse.json({ recorded: true, isCorrect, correctAnswer: question.correctAnswer, explanation: question.explanation ?? null });
  }
  return NextResponse.json({ recorded: true });
}
