export interface Question {
  id: number;
  moduleId: string;
  subjectId: string;
  text: string;
  code?: string;
  codeLanguage?: "c" | "cpp" | "python" | "java" | "js" | "php" | "sql" | "bash";
  figure?: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correctAnswer: "a" | "b" | "c" | "d";
  lockOptions?: boolean;
  /** Romanian "why correct / why wrong" explanation, shown after answering. Attached at load from src/data/explanations.ts. */
  explanation?: string;
}

export interface Subject {
  id: string;
  name: string;
  moduleId: string;
  questionCount: number;
  icon: string;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  color: string;
  subjects: Subject[];
}

export type AnswerKey = "a" | "b" | "c" | "d";
