import type { Question } from "./types";

// Import all question sets
import { fundamenteleProgramarii } from "./questions/programming/fundamentele-programarii";
import { programarePython } from "./questions/programming/programare-python";
import { pooCpp } from "./questions/programming/poo-cpp";
import { metodeAvansateJava } from "./questions/programming/metode-avansate-java";
import { tehniciAvansate } from "./questions/programming/tehnici-avansate";
import { algoritmiStructuriDate } from "./questions/programming/algoritmi-structuri-date";
import { bazeDeDate } from "./questions/databases/baze-de-date";
import { sgbd } from "./questions/databases/sgbd";
import { reteleCalculatoare } from "./questions/networks/retele-calculatoare";
import { criptografie } from "./questions/networks/criptografie";
import { tehnologiiWeb } from "./questions/web/tehnologii-web";
import { comertElectronic } from "./questions/web/comert-electronic";
import { cloudComputing } from "./questions/web/cloud-computing";
import { inovareTransformareDigitala } from "./questions/web/inovare-transformare-digitala";

export const allQuestions: Question[] = [
  ...fundamenteleProgramarii,
  ...programarePython,
  ...pooCpp,
  ...metodeAvansateJava,
  ...tehniciAvansate,
  ...algoritmiStructuriDate,
  ...bazeDeDate,
  ...sgbd,
  ...reteleCalculatoare,
  ...criptografie,
  ...tehnologiiWeb,
  ...comertElectronic,
  ...cloudComputing,
  ...inovareTransformareDigitala,
];

// Lookup maps
export const questionsByModule: Record<string, Question[]> = {};
export const questionsBySubject: Record<string, Question[]> = {};
const questionMap = new Map<number, Question>();

for (const q of allQuestions) {
  // By module
  if (!questionsByModule[q.moduleId]) questionsByModule[q.moduleId] = [];
  questionsByModule[q.moduleId].push(q);

  // By subject
  if (!questionsBySubject[q.subjectId]) questionsBySubject[q.subjectId] = [];
  questionsBySubject[q.subjectId].push(q);

  // By ID
  questionMap.set(q.id, q);
}

export function getQuestion(id: number): Question | undefined {
  return questionMap.get(id);
}
