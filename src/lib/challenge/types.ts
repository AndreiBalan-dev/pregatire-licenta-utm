export type ChallengeMode = "self_paced" | "lockstep";
export type LobbyStatus = "lobby" | "running" | "finished" | "expired";

export interface ChallengeConfig {
  mode: ChallengeMode;
  subjectIds: string[];
  questionCount: number;
  shuffleOrder: boolean;
  shuffleOptions: boolean;
  instantFeedback: boolean;
  perQuestionSeconds: number | null; // null in self-paced
  capacity: number; // 2..10
  hostPlays: boolean;
}
