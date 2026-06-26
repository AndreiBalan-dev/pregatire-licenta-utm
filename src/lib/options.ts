import type { AnswerKey, Question } from "@/data/types";

/**
 * Answer-option keys in display order: the optionOrder permutation when it is a
 * full 4-key array, else the question's own key order. Shared by QuestionCard and
 * the runtime pages so the focus cursor and the rendered options always agree.
 */
export function orderedOptionKeys(question: Question, optionOrder?: AnswerKey[]): AnswerKey[] {
  if (optionOrder && optionOrder.length === 4) return optionOrder;
  return Object.keys(question.options) as AnswerKey[];
}
