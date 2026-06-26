import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { challengePlayers, challengeAnswers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashIp } from "@/lib/crypto";
import { checkRateLimit } from "@/lib/rate-limit";
import { RATE_LIMITS, MAX_QUESTION_TIME_MS } from "@/lib/constants";
import { getQuestion } from "@/data";
import { loadPlayerByToken, getClientIp, buildStandings, isUniqueViolation, maybeFinishRunning } from "@/lib/challenge/server";
import { getTimer, scoringBudgetMs, answerPoints, totalDeadlineMs } from "@/lib/challenge/timing";
import { detectMilestones } from "@/lib/challenge/milestones";
import { publishToLobby } from "@/lib/realtime/pusher-server";
import { EVENTS } from "@/lib/realtime/events";
import type { TimerConfig } from "@/lib/challenge/types";

const VALID = new Set(["a", "b", "c", "d"]);

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`ch:answer:${hashIp(ip)}`, RATE_LIMITS.challengeAnswer);
  if (!rl.allowed) return NextResponse.json({ error: "Prea multe cereri." }, { status: 429 });

  let body: { code?: unknown; token?: unknown; questionId?: unknown; selected?: unknown; timeMs?: unknown; timedOut?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Date invalide." }, { status: 400 }); }

  const code = typeof body.code === "string" ? body.code.trim() : "";
  const token = typeof body.token === "string" ? body.token : "";
  const questionId = Number(body.questionId);
  const timedOut = body.timedOut === true;
  const selected = timedOut ? "-" : String(body.selected);
  const timeMs = Math.max(0, Math.min(Number(body.timeMs) || 0, MAX_QUESTION_TIME_MS));

  if (!code || !token || !Number.isInteger(questionId) || (!timedOut && !VALID.has(selected))) {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }

  const found = await loadPlayerByToken(code, token);
  if (!found) return NextResponse.json({ error: "Neautorizat." }, { status: 403 });
  const { lobby, player } = found;
  if (lobby.status !== "running") return NextResponse.json({ error: "Provocarea nu este activă." }, { status: 409 });

  const timer = getTimer(lobby.config as { timer?: TimerConfig });

  // Total-timer hard stop: refuse answers once the deadline has passed and make
  // sure the lobby flips to finished.
  const deadline = totalDeadlineMs(timer, lobby.startedAt);
  if (deadline !== null && Date.now() >= deadline) {
    await maybeFinishRunning(lobby);
    return NextResponse.json({ error: "Timpul a expirat.", timeUp: true }, { status: 409 });
  }

  const order = (player.questionOrder as number[] | null) ?? [];
  if (!order.includes(questionId)) return NextResponse.json({ error: "Întrebare în afara setului." }, { status: 400 });

  const question = getQuestion(questionId);
  if (!question) return NextResponse.json({ error: "Întrebare inexistentă." }, { status: 400 });
  const isCorrect = !timedOut && selected === question.correctAnswer;
  const total = order.length;
  const points = answerPoints(isCorrect, timeMs, scoringBudgetMs(timer));

  const beforeAnswered = player.answeredCount;

  // Record the answer; the unique(playerId, questionId) constraint is the no-redo
  // guard. A duplicate (or timeout double-fire) returns 409 rather than scoring twice.
  try {
    await db.insert(challengeAnswers).values({
      lobbyCode: code, playerId: player.id, questionId,
      selected, isCorrect, timeMs, pointsAwarded: String(points),
    });
  } catch (e: unknown) {
    if (isUniqueViolation(e)) {
      return NextResponse.json({ error: "Ai răspuns deja la această întrebare." }, { status: 409 });
    }
    throw e;
  }

  const afterAnswered = beforeAnswered + 1;
  const newCorrect = player.correctCount + (isCorrect ? 1 : 0);
  const newScore = Number(player.score) + points;
  const justFinished = afterAnswered >= total;

  // Determine leader before, to detect a lead change after this answer.
  const beforeStandings = await buildStandings(code);
  const beforeLeaderId = beforeStandings[0]?.playerId ?? null;

  await db.update(challengePlayers).set({
    answeredCount: afterAnswered,
    correctCount: newCorrect,
    score: String(newScore),
    totalTimeMs: player.totalTimeMs + timeMs,
    finishedAt: justFinished ? new Date() : player.finishedAt,
    lastSeenAt: new Date(),
  }).where(eq(challengePlayers.id, player.id));

  // Only needed when this answer completed the set (used for first-finish vs finish).
  let anyoneFinishedBefore = false;
  if (justFinished) {
    const others = await db.select({ finishedAt: challengePlayers.finishedAt })
      .from(challengePlayers).where(eq(challengePlayers.lobbyCode, code));
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

  // End the round if everyone is now finished or gone (publishes the podium).
  await maybeFinishRunning(lobby);

  const config = lobby.config as { instantFeedback: boolean };
  if (config.instantFeedback) {
    return NextResponse.json({ recorded: true, isCorrect, points, correctAnswer: question.correctAnswer, explanation: question.explanation ?? null });
  }
  return NextResponse.json({ recorded: true, points });
}
