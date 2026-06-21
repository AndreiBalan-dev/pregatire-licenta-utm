import type { AnswerKey } from "@/data/types";

export interface AnswerRecord {
  selected: "a" | "b" | "c" | "d";
  isCorrect: boolean;
  answeredAt: string;
  timeSpentMs: number;
}

/**
 * Where a redo session traces back to, so the results popup can offer
 * "redo the full original session" and "redo all initial mistakes". Created
 * once on the first redo out of an origin and propagated unchanged.
 */
export interface RedoLineage {
  origin: {
    kind: "exam" | "practice";
    /** Full question set of the original session (to repeat it). */
    questionIds: number[];
    /** Practice origin only: enables "next batch" continuation. */
    subjectIds?: string[];
    batchSize?: number | null;
  };
  /** Snapshot of the origin's wrong answers (cannot be recomputed later). */
  firstWrong: number[];
}

export interface PracticeState {
  subjectIds: string[];
  questionIds: number[];
  currentIndex: number;
  /**
   * "practice" gives instant feedback + explanations as you answer.
   * "test" hides correctness until the end (a simulation of a custom set,
   * e.g. redoing your wrong/marked questions), then shows the score.
   */
  mode: "practice" | "test";
  startedAt: string;
  batchSize: number | null;
  /**
   * Per-question display order of the answer options, set when the session
   * was started with "shuffle answers" on. Keyed by question id. Absent when
   * options are shown in natural a/b/c/d order. Each option keeps its own
   * letter; only the on-screen position changes.
   */
  optionOrder?: Record<number, AnswerKey[]>;
  /** Set when this session is a redo derived from a larger session. */
  redoLineage?: RedoLineage;
  /**
   * Whether the session was started with "doar nerezolvate". Drives the
   * "next batch" CTA: when true it counts/serves only never-answered questions,
   * when false it pages through the whole pool. Absent on legacy sessions.
   */
  onlyUnanswered?: boolean;
  /**
   * Question ids already served in this batch-paging chain (including the
   * current batch). Lets the "next batch" page through the pool without
   * re-offering earlier batches. Absent on non-paging or legacy sessions.
   */
  seenIds?: number[];
}

export interface TrainingState {
  /** Chosen scope (subject ids). */
  subjectIds: string[];
  /** All in-scope question ids, in introduction order (shuffled if chosen). */
  pool: number[];
  /** qid -> absolute seq target (session-local schedule). */
  due: Record<number, number>;
  /** Questions answered so far this session (the scheduler clock). */
  seq: number;
  /** The question currently on screen. */
  currentQuestionId: number;
  /** Dedup: never pick this as the immediate next question. */
  lastQuestionId: number | null;
  /** Unique question ids shown this session (for the deduped end summary). */
  seenIds: number[];
  answeredCount: number;
  correctCount: number;
  startedAt: string;
  shuffleOptions: boolean;
  /** Per-question answer-option display order, built lazily when shuffleOptions is on. */
  optionOrder?: Record<number, AnswerKey[]>;
}

export interface SubjectStat {
  attempted: number;
  correct: number;
  lastPracticedAt: string;
}

export interface SessionSettings {
  showImmediateFeedback: boolean;
  /** Shuffle answer-option positions during practice. */
  shuffleOptions: boolean;
  simulatorShowFeedback: boolean;
  /** Shuffle answer-option positions during the exam simulator. */
  simulatorShuffleOptions: boolean;
}

export interface ExamState {
  examId: string;
  questionIds: number[];
  answers: Record<number, "a" | "b" | "c" | "d">;
  currentIndex: number;
  startedAt: string;
  submittedAt: string | null;
  durationMs: number | null;
  showFeedback?: boolean;
  isRepeat?: boolean;
  repeatShuffled?: boolean;
  /**
   * Per-question display order of the answer options when the exam was started
   * with "shuffle answers" on. Same shape and rules as PracticeState.optionOrder.
   */
  optionOrder?: Record<number, AnswerKey[]>;
}

export interface LocalSession {
  version: 1;
  startedAt: string;
  lastActiveAt: string;
  answers: Record<number, AnswerRecord>;
  bookmarks: number[];
  currentPractice: PracticeState | null;
  currentExam: ExamState | null;
  examHistory: ExamState[];
  subjectStats: Record<string, SubjectStat>;
  settings: SessionSettings;
  savedKey: string | null;
  /** Persistent per-question strength (Leitner box 0..5) for Antrenament. Optional/additive. */
  trainingBoxes?: Record<number, number>;
  /** The active unlimited-training session, or null. */
  currentTraining?: TrainingState | null;
}

export const MAX_EXAM_HISTORY = 20;

export function createDefaultSession(): LocalSession {
  return {
    version: 1,
    startedAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    answers: {},
    bookmarks: [],
    currentPractice: null,
    currentExam: null,
    examHistory: [],
    subjectStats: {},
    settings: {
      showImmediateFeedback: true,
      shuffleOptions: false,
      simulatorShowFeedback: false,
      simulatorShuffleOptions: false,
    },
    savedKey: null,
    trainingBoxes: {},
    currentTraining: null,
  };
}
