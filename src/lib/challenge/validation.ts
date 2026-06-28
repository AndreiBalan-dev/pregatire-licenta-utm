import { CHALLENGE, CHALLENGE_TIMER } from "@/lib/constants";
import type { ChallengeConfig, TimerMode } from "./types";

export function validateName(raw: unknown): { ok: true; name: string } | { ok: false; error: string } {
  if (typeof raw !== "string") return { ok: false, error: "Nume invalid." };
  const name = raw.trim();
  if (name.length === 0) return { ok: false, error: "Introdu un nume." };
  if (name.length > CHALLENGE.MAX_NAME_LENGTH) return { ok: false, error: `Numele este prea lung (max ${CHALLENGE.MAX_NAME_LENGTH}).` };
  if (/[\x00-\x1f\x7f]/.test(name)) return { ok: false, error: "Numele conține caractere invalide." };
  if (/<[^>]*>/.test(name)) return { ok: false, error: "Numele conține caractere invalide." };
  return { ok: true, name };
}

export function validateChatMessage(raw: unknown): { ok: true; text: string } | { ok: false; error: string } {
  if (typeof raw !== "string") return { ok: false, error: "Mesaj invalid." };
  // Collapse all whitespace runs (incl. pasted newlines/tabs) to single spaces so a
  // multi-line paste becomes a normal one-line message instead of tripping the
  // control-char check below.
  const text = raw.replace(/\s+/g, " ").trim();
  if (text.length === 0) return { ok: false, error: "Mesaj gol." };
  if (text.length > CHALLENGE.MAX_MESSAGE_LENGTH) return { ok: false, error: `Mesaj prea lung (max ${CHALLENGE.MAX_MESSAGE_LENGTH}).` };
  if (/[\x00-\x1f\x7f]/.test(text)) return { ok: false, error: "Mesaj invalid." };
  if (/<[^>]*>/.test(text)) return { ok: false, error: "Mesaj invalid." };
  return { ok: true, text };
}

export function validateCreateConfig(
  raw: unknown,
  validSubjectIds: Set<string>,
): { ok: true; config: ChallengeConfig } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { ok: false, error: "Configurație invalidă." };
  const c = raw as Record<string, unknown>;

  if (c.mode !== "self_paced" && c.mode !== "lockstep") return { ok: false, error: "Mod invalid." };

  // Preset is optional for backward compatibility; absent means a plain custom game.
  const preset = c.preset === undefined ? "custom" : c.preset;
  if (preset !== "custom" && preset !== "simulare") return { ok: false, error: "Tip de provocare invalid." };

  if (!Array.isArray(c.subjectIds) || c.subjectIds.length === 0) return { ok: false, error: "Alege cel puțin o materie." };
  for (const s of c.subjectIds) {
    if (typeof s !== "string" || !validSubjectIds.has(s)) return { ok: false, error: "Materie invalidă." };
  }

  const count = c.questionCount;
  if (typeof count !== "number" || !Number.isInteger(count) || count < CHALLENGE.MIN_QUESTIONS || count > CHALLENGE.MAX_QUESTIONS) {
    return { ok: false, error: `Numărul de întrebări trebuie să fie între ${CHALLENGE.MIN_QUESTIONS} și ${CHALLENGE.MAX_QUESTIONS}.` };
  }

  const capacity = c.capacity;
  if (typeof capacity !== "number" || !Number.isInteger(capacity) || capacity < CHALLENGE.MIN_CAPACITY || capacity > CHALLENGE.MAX_CAPACITY) {
    return { ok: false, error: `Capacitatea trebuie să fie între ${CHALLENGE.MIN_CAPACITY} și ${CHALLENGE.MAX_CAPACITY}.` };
  }

  for (const flag of ["shuffleOrder", "shuffleOptions", "instantFeedback", "hostPlays"]) {
    if (typeof c[flag] !== "boolean") return { ok: false, error: "Configurație invalidă." };
  }

  // Timer: either a whole-quiz budget ("total") or a per-question budget.
  const rawTimer = c.timer;
  if (!rawTimer || typeof rawTimer !== "object" || Array.isArray(rawTimer)) {
    return { ok: false, error: "Configurație timer invalidă." };
  }
  const tm = rawTimer as Record<string, unknown>;
  let timerTotal: number = CHALLENGE_TIMER.TOTAL_DEFAULT_SECONDS;
  let timerPerQuestion: number = CHALLENGE_TIMER.PER_QUESTION_DEFAULT;
  if (tm.mode === "total") {
    const ts = tm.totalSeconds;
    if (typeof ts !== "number" || !Number.isInteger(ts) || ts < CHALLENGE_TIMER.TOTAL_MIN_SECONDS || ts > CHALLENGE_TIMER.TOTAL_MAX_SECONDS) {
      return { ok: false, error: "Durata totală trebuie să fie între 1 și 120 de minute." };
    }
    timerTotal = ts;
  } else if (tm.mode === "per_question") {
    const pq = tm.perQuestionSeconds;
    if (typeof pq !== "number" || !(CHALLENGE_TIMER.PER_QUESTION_OPTIONS as readonly number[]).includes(pq)) {
      return { ok: false, error: "Timpul pe întrebare este invalid." };
    }
    timerPerQuestion = pq;
  } else if (tm.mode === "unlimited") {
    // No clock: keep the default total/per-question seconds (unused at runtime).
  } else {
    return { ok: false, error: "Mod timer invalid." };
  }

  // Phase 1 ships self_paced only; lockstep is accepted by the validator but the
  // create route rejects it until Phase 2 (see Task 9).
  const perQuestionSeconds =
    c.mode === "lockstep"
      ? (typeof c.perQuestionSeconds === "number" && c.perQuestionSeconds > 0 ? c.perQuestionSeconds : 20)
      : null;

  return {
    ok: true,
    config: {
      mode: c.mode,
      preset,
      subjectIds: c.subjectIds as string[],
      questionCount: count,
      shuffleOrder: c.shuffleOrder as boolean,
      shuffleOptions: c.shuffleOptions as boolean,
      instantFeedback: c.instantFeedback as boolean,
      perQuestionSeconds,
      capacity,
      hostPlays: c.hostPlays as boolean,
      timer: { mode: tm.mode as TimerMode, totalSeconds: timerTotal, perQuestionSeconds: timerPerQuestion },
    },
  };
}
