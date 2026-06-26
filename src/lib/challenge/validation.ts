import { CHALLENGE } from "@/lib/constants";
import type { ChallengeConfig } from "./types";

export function validateName(raw: unknown): { ok: true; name: string } | { ok: false; error: string } {
  if (typeof raw !== "string") return { ok: false, error: "Nume invalid." };
  const name = raw.trim();
  if (name.length === 0) return { ok: false, error: "Introdu un nume." };
  if (name.length > CHALLENGE.MAX_NAME_LENGTH) return { ok: false, error: `Numele este prea lung (max ${CHALLENGE.MAX_NAME_LENGTH}).` };
  if (/[\x00-\x1f\x7f]/.test(name)) return { ok: false, error: "Numele conține caractere invalide." };
  if (/<[^>]*>/.test(name)) return { ok: false, error: "Numele conține caractere invalide." };
  return { ok: true, name };
}

export function validateCreateConfig(
  raw: unknown,
  validSubjectIds: Set<string>,
): { ok: true; config: ChallengeConfig } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { ok: false, error: "Configurație invalidă." };
  const c = raw as Record<string, unknown>;

  if (c.mode !== "self_paced" && c.mode !== "lockstep") return { ok: false, error: "Mod invalid." };

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
      subjectIds: c.subjectIds as string[],
      questionCount: count,
      shuffleOrder: c.shuffleOrder as boolean,
      shuffleOptions: c.shuffleOptions as boolean,
      instantFeedback: c.instantFeedback as boolean,
      perQuestionSeconds,
      capacity,
      hostPlays: c.hostPlays as boolean,
    },
  };
}
