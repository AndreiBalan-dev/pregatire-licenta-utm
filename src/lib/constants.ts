export const STORAGE_KEY = "utm-licenta-session";
export const SESSION_VERSION = 1;
export const MAX_SESSION_SIZE = 500_000; // 500KB

export const MAX_DISPLAY_NAME_LENGTH = 50;
export const MAX_QUESTIONS = 1000;
export const MAX_QUESTION_TIME_MS = 3_600_000;

export const MAX_SESSIONS_PER_IP = 20;

export const RATE_LIMITS = {
  save: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
  load: { windowMs: 5 * 60 * 1000, maxRequests: 10 },
  challengeCreate: { windowMs: 15 * 60 * 1000, maxRequests: 10 },
  challengeJoin: { windowMs: 5 * 60 * 1000, maxRequests: 30 },
  challengeAnswer: { windowMs: 60 * 1000, maxRequests: 120 },
} as const;

export const CHALLENGE = {
  MIN_CAPACITY: 2,
  MAX_CAPACITY: 10,
  MAX_QUESTIONS: 1000, // hard ceiling above the whole bank (~714); the "Toate" option uses the full selected pool
  MIN_QUESTIONS: 1,
  MAX_NAME_LENGTH: 20,
  MAX_LOBBIES_PER_IP: 10,
  ABANDON_MS: 3 * 60 * 60 * 1000, // 3h with no Start -> expired
  RESULTS_TTL_MS: 7 * 24 * 60 * 60 * 1000, // results readable 7 days
} as const;

export const CHALLENGE_TIMER = {
  TOTAL_MIN_SECONDS: 60, // 1 min
  TOTAL_MAX_SECONDS: 7200, // 120 min
  TOTAL_DEFAULT_SECONDS: 600, // 10 min
  PER_QUESTION_OPTIONS: [15, 30, 60, 120, 180, 300], // 15s, 30s, 1, 2, 3, 5 min
  PER_QUESTION_DEFAULT: 120, // 2 min
  GRACE_MS: 60_000, // a disconnected player keeps their seat this long
  SCORE_REFERENCE_MS: 30_000, // total-mode speed reference for scoring
  MAX_POINTS: 1000,
  MIN_CORRECT_POINTS: 500,
  TICK_TAIL_PER_QUESTION: 5, // ticking sound: last N seconds of a question
  TICK_TAIL_TOTAL: 10, // ticking sound: last N seconds of the whole game
} as const;
