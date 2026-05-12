/**
 * SINGLE SOURCE OF TRUTH for app-wide display constants.
 *
 * When you change something here, it updates everywhere:
 * navbar version, hero text, SEO metadata, OG image, despre stats,
 * changelog banner — all read from this file.
 *
 * Bumping a version? Update APP_VERSION here, then add a new entry
 * to the `changelog` array in src/app/noutati/page.tsx.
 *
 * Added/removed questions? Update TOTAL_QUESTIONS here. The actual
 * runtime count comes from `allQuestions.length` in src/data/index.ts —
 * keep them in sync.
 */

export const APP_VERSION = "1.4.2";

export const EXAM_SESSION_YEAR = "2026";

export const SITE_URL = "https://utmlearn.com";
export const SITE_DOMAIN = "utmlearn.com";

export const SITE_NAME = "Pregătire Licență UTM";
export const SITE_NAME_SHORT = "Licență UTM";

export const AUTHOR_NAME = "Bălan Andrei Marian";

export const TOTAL_QUESTIONS = 715;
export const TOTAL_MODULES = 4;
export const TOTAL_SUBJECTS = 15;
