import { MAX_SESSION_SIZE, MAX_DISPLAY_NAME_LENGTH, MAX_QUESTIONS } from "./constants";

interface ValidationResult {
  success: boolean;
  data?: {
    displayName: string | undefined;
    sessionData: object;
    totalAnswered: number;
    totalCorrect: number;
  };
  error?: string;
}

const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);
const VALID_ANSWER_KEYS = new Set(["a", "b", "c", "d"]);

function hasForbiddenKeys(obj: unknown): boolean {
  if (!obj || typeof obj !== "object") return false;
  for (const key of Object.keys(obj as Record<string, unknown>)) {
    if (FORBIDDEN_KEYS.has(key)) return true;
  }
  return false;
}

export function validateSessionData(body: unknown): ValidationResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { success: false, error: "Date invalide." };
  }

  if (hasForbiddenKeys(body)) {
    return { success: false, error: "Date invalide." };
  }

  const b = body as Record<string, unknown>;

  if (b.displayName !== undefined && b.displayName !== null) {
    if (typeof b.displayName !== "string" || b.displayName.length > MAX_DISPLAY_NAME_LENGTH) {
      return { success: false, error: `Numele este prea lung (max ${MAX_DISPLAY_NAME_LENGTH} caractere).` };
    }
    if (/[\x00-\x1f\x7f]/.test(b.displayName)) {
      return { success: false, error: "Numele conține caractere invalide." };
    }
    if (/<[^>]*>/.test(b.displayName)) {
      return { success: false, error: "Numele conține caractere invalide." };
    }
  }

  if (!b.sessionData || typeof b.sessionData !== "object" || Array.isArray(b.sessionData)) {
    return { success: false, error: "Datele sesiunii lipsesc." };
  }

  if (hasForbiddenKeys(b.sessionData)) {
    return { success: false, error: "Date invalide." };
  }

  const sd = b.sessionData as Record<string, unknown>;
  if (sd.version !== 1) {
    return { success: false, error: "Versiune incompatibilă." };
  }

  if (sd.answers !== undefined) {
    if (!sd.answers || typeof sd.answers !== "object" || Array.isArray(sd.answers)) {
      return { success: false, error: "Format răspunsuri invalid." };
    }
    if (hasForbiddenKeys(sd.answers)) {
      return { success: false, error: "Date invalide." };
    }
    const answers = sd.answers as Record<string, unknown>;
    const answerKeys = Object.keys(answers);

    if (answerKeys.length > MAX_QUESTIONS) {
      return { success: false, error: "Prea multe răspunsuri." };
    }

    for (const qIdStr of answerKeys) {
      const qId = Number(qIdStr);
      if (!Number.isInteger(qId) || qId < 0 || qId > 100_000) {
        return { success: false, error: "ID întrebare invalid." };
      }
      const answer = answers[qIdStr];
      if (!answer || typeof answer !== "object" || Array.isArray(answer)) {
        return { success: false, error: "Format răspuns invalid." };
      }
      const a = answer as Record<string, unknown>;
      if (!VALID_ANSWER_KEYS.has(a.selected as string)) {
        return { success: false, error: "Răspuns selectat invalid." };
      }
      if (typeof a.isCorrect !== "boolean") {
        return { success: false, error: "Format răspuns invalid." };
      }
      if (typeof a.answeredAt !== "string") {
        return { success: false, error: "Format răspuns invalid." };
      }
      if (typeof a.timeSpentMs !== "number" || a.timeSpentMs < 0 || a.timeSpentMs > 3_600_000) {
        return { success: false, error: "Timp invalid." };
      }
    }
  }

  if (sd.bookmarks !== undefined) {
    if (!Array.isArray(sd.bookmarks)) {
      return { success: false, error: "Format marcaje invalid." };
    }
    if (sd.bookmarks.length > MAX_QUESTIONS) {
      return { success: false, error: "Prea multe marcaje." };
    }
    for (const b of sd.bookmarks) {
      if (!Number.isInteger(b) || b < 0 || b > 100_000) {
        return { success: false, error: "ID marcaj invalid." };
      }
    }
  }

  if (typeof b.totalAnswered !== "number" || b.totalAnswered < 0 || b.totalAnswered > MAX_QUESTIONS) {
    return { success: false, error: "Date statistice invalide." };
  }
  if (typeof b.totalCorrect !== "number" || b.totalCorrect < 0 || b.totalCorrect > MAX_QUESTIONS) {
    return { success: false, error: "Date statistice invalide." };
  }
  if (b.totalCorrect > b.totalAnswered) {
    return { success: false, error: "Date statistice invalide." };
  }

  const jsonSize = JSON.stringify(b.sessionData).length;
  if (jsonSize > MAX_SESSION_SIZE) {
    return { success: false, error: "Datele sesiunii sunt prea mari." };
  }

  return {
    success: true,
    data: {
      displayName: typeof b.displayName === "string" ? b.displayName.trim() : undefined,
      sessionData: b.sessionData as object,
      totalAnswered: Math.floor(b.totalAnswered as number),
      totalCorrect: Math.floor(b.totalCorrect as number),
    },
  };
}

export function validateSaveKey(key: unknown): key is string {
  return (
    typeof key === "string" &&
    key.length >= 8 &&
    key.length <= 24 &&
    /^[a-zA-Z0-9_-]+$/.test(key)
  );
}
