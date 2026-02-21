export const STORAGE_KEY = "utm-licenta-session";
export const SESSION_VERSION = 1;
export const MAX_SESSION_SIZE = 500_000; // 500KB
export const SAVE_KEY_LENGTH = 12;
export const MAX_DISPLAY_NAME_LENGTH = 50;
export const MAX_QUESTIONS = 1000;

export const MAX_SESSIONS_PER_IP = 20;

export const RATE_LIMITS = {
  save: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
  load: { windowMs: 5 * 60 * 1000, maxRequests: 10 },
} as const;
