export type ChallengeMode = "self_paced" | "lockstep";
export type LobbyStatus = "lobby" | "running" | "finished" | "expired";

/** "custom" = host-picked materii + count, Kahoot scoring (the default).
 *  "simulare" = a multiplayer exam: 36 balanced grile (9/module) graded on the
 *  1-10 nota, exactly like the solo Simulator. */
export type ChallengePreset = "custom" | "simulare";

/** Custom-game result system: "points" = Kahoot speed scoring (the default);
 *  "correct" = rank and show by number of correct answers (no 1-10 grade - that
 *  is Simulare-only). Ignored when preset is "simulare". */
export type ChallengeScoring = "points" | "correct";

/** "unlimited" has no clock at all: no countdown, no deadline; the round ends
 *  when everyone has finished. Total time is still tracked for the tiebreak. */
export type TimerMode = "total" | "per_question" | "unlimited";

export interface TimerConfig {
  mode: TimerMode;
  /** Whole-quiz budget in seconds (used in "total" mode). */
  totalSeconds: number;
  /** Per-question budget in seconds (used in "per_question" mode). */
  perQuestionSeconds: number;
}

export interface ChallengeConfig {
  mode: ChallengeMode;
  /** Defaults to "custom" for lobbies created before presets existed. */
  preset: ChallengePreset;
  /** Custom result system; defaults to "points" for older lobbies. Ignored for simulare. */
  scoring: ChallengeScoring;
  subjectIds: string[];
  questionCount: number;
  shuffleOrder: boolean;
  shuffleOptions: boolean;
  instantFeedback: boolean;
  perQuestionSeconds: number | null; // legacy lockstep field; null in self-paced
  capacity: number;
  hostPlays: boolean;
  timer: TimerConfig;
}
