export interface AnswerRecord {
  selected: "a" | "b" | "c" | "d";
  isCorrect: boolean;
  answeredAt: string;
  timeSpentMs: number;
}

export interface PracticeState {
  subjectIds: string[];
  questionIds: number[];
  currentIndex: number;
  mode: "practice" | "review";
}

export interface SubjectStat {
  attempted: number;
  correct: number;
  lastPracticedAt: string;
}

export interface SessionSettings {
  showImmediateFeedback: boolean;
  shuffleOptions: boolean;
}

export interface LocalSession {
  version: 1;
  startedAt: string;
  lastActiveAt: string;
  answers: Record<number, AnswerRecord>;
  bookmarks: number[];
  currentPractice: PracticeState | null;
  subjectStats: Record<string, SubjectStat>;
  settings: SessionSettings;
  savedKey: string | null;
}

export function createDefaultSession(): LocalSession {
  return {
    version: 1,
    startedAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    answers: {},
    bookmarks: [],
    currentPractice: null,
    subjectStats: {},
    settings: {
      showImmediateFeedback: true,
      shuffleOptions: false,
    },
    savedKey: null,
  };
}
