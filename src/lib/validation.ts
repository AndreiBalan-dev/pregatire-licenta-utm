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

export function validateSessionData(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") {
    return { success: false, error: "Date invalide." };
  }

  const b = body as Record<string, unknown>;

  // Validate displayName
  if (b.displayName !== undefined && b.displayName !== null) {
    if (typeof b.displayName !== "string" || b.displayName.length > MAX_DISPLAY_NAME_LENGTH) {
      return { success: false, error: `Numele este prea lung (max ${MAX_DISPLAY_NAME_LENGTH} caractere).` };
    }
    // Sanitize: remove control characters
    if (/[\x00-\x1f\x7f]/.test(b.displayName)) {
      return { success: false, error: "Numele conține caractere invalide." };
    }
  }

  // Validate sessionData
  if (!b.sessionData || typeof b.sessionData !== "object") {
    return { success: false, error: "Datele sesiunii lipsesc." };
  }

  const sd = b.sessionData as Record<string, unknown>;
  if (sd.version !== 1) {
    return { success: false, error: "Versiune incompatibilă." };
  }

  // Validate stats
  if (typeof b.totalAnswered !== "number" || b.totalAnswered < 0 || b.totalAnswered > MAX_QUESTIONS) {
    return { success: false, error: "Date statistice invalide." };
  }
  if (typeof b.totalCorrect !== "number" || b.totalCorrect < 0 || b.totalCorrect > MAX_QUESTIONS) {
    return { success: false, error: "Date statistice invalide." };
  }
  if (b.totalCorrect > b.totalAnswered) {
    return { success: false, error: "Date statistice invalide." };
  }

  // Size check
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
    key.length <= 16 &&
    /^[a-zA-Z0-9_-]+$/.test(key)
  );
}
