export type ChallengeMode = "self_paced" | "lockstep";
export type LobbyStatus = "lobby" | "running" | "finished" | "expired";

export type TimerMode = "total" | "per_question";

export interface TimerConfig {
  mode: TimerMode;
  /** Whole-quiz budget in seconds (used in "total" mode). */
  totalSeconds: number;
  /** Per-question budget in seconds (used in "per_question" mode). */
  perQuestionSeconds: number;
}

export interface ChallengeConfig {
  mode: ChallengeMode;
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
