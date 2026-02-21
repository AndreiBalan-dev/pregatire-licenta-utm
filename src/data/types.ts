export interface Question {
  id: number;
  moduleId: string;
  subjectId: string;
  text: string;
  code?: string;
  codeLanguage?: "c" | "cpp" | "python" | "java" | "js" | "php" | "sql";
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correctAnswer: "a" | "b" | "c" | "d";
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
