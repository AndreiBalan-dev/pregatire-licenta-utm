/**
 * SINGLE SOURCE OF TRUTH for app-wide display constants.
 *
 * When you change something here, it updates everywhere:
 * navbar version, hero text, SEO metadata, OG image, despre stats,
 * changelog banner - all read from this file.
 *
 * Bumping a version? Update APP_VERSION here, then add a new entry
 * to the `changelog` array in src/app/noutati/page.tsx.
 *
 * Added/removed questions? Update TOTAL_QUESTIONS here. The actual
 * runtime count comes from `allQuestions.length` in src/data/index.ts -
 * keep them in sync.
 */

export const APP_VERSION = "3.0.0";

export const EXAM_SESSION_YEAR = "2026";

// Proba 1 (proba scrisa) a examenului de licenta: 30.06.2026, 09:00-11:00.
// Anchored to Bucharest exam-local time (EEST, UTC+3) so the countdown is the
// same instant for every viewer regardless of their device timezone.
export const EXAM_PROBA1_START = "2026-06-30T09:00:00+03:00";
export const EXAM_PROBA1_END = "2026-06-30T11:00:00+03:00";

export const SITE_URL = "https://utmlearn.com";
export const SITE_DOMAIN = "utmlearn.com";

export const SITE_NAME = "Pregătire Licență UTM";
export const SITE_NAME_SHORT = "Licență UTM";

export const AUTHOR_NAME = "Bălan Andrei Marian";

// Gen-E expo voting campaign (Algebo.ai). Temporary promo on the homepage + a one-time popup.
export const VOTE_EXPO_URL = "https://expo.gen-e.eu/expo/fafeaa60-f404-46e3-ab59-24dd07f520ec";
export const VOTE_IMAGE = "/vote-algebo-gene.jpg";
export const CONTACT_INSTAGRAM = "https://instagram.com/balyandrei";

export const TOTAL_QUESTIONS = 714;
export const TOTAL_MODULES = 4;
export const TOTAL_SUBJECTS = 15;
