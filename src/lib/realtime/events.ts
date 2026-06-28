// Channel + event names and payload shapes shared by the server publishers and
// the client subscriber. Kept provider-agnostic so the Pusher adapter is the
// only file that knows about Pusher.

export const CHANNELS = {
  lobby: (code: string) => `presence-lobby-${code}`,
};

export const EVENTS = {
  ROUND_STARTED: "round-started",
  LEADERBOARD: "leaderboard",
  MILESTONE: "milestone",
  ROUND_FINISHED: "round-finished",
  CHAT_MESSAGE: "chat-message",
} as const;

export interface Standing {
  playerId: number;
  name: string;
  score: number; // Kahoot-style points
  correctCount: number;
  answeredCount: number;
  totalQuestions: number;
  totalTimeMs: number; // summed response time, for the completion-time display + tiebreak
  progress: number; // 0..1
  finished: boolean;
  rank: number; // 1-based, ties share a rank
}

export type MilestoneType = "progress" | "finished" | "first_finish" | "lead_change";

export interface MilestoneEvent {
  type: MilestoneType;
  text: string; // Romanian, ready to toast
  playerId: number;
  value?: number; // e.g. 25/50/75/100 for progress
}

export interface RoundStartedPayload {
  totalQuestions: number;
}

export interface LeaderboardPayload {
  standings: Standing[];
}

export interface RoundFinishedPayload {
  standings: Standing[];
}

// A single lobby chat message. Ephemeral - never stored; the server stamps id/at
// and the trusted playerId/name from the sender's token.
export interface ChatMessage {
  id: string;       // server-generated (crypto.randomUUID) - React key + dedupe
  playerId: number;
  name: string;
  text: string;     // validated + whitespace-normalized
  at: number;       // server epoch ms
}
