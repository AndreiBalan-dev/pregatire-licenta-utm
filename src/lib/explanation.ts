import type { AnswerKey } from "@/data/types";

const POSITION_LETTERS: readonly AnswerKey[] = ["a", "b", "c", "d"];

/**
 * When answer options are shuffled and relabeled A-D by position, the stored
 * explanation still references the original letters. This rewrites the two
 * STRUCTURED letter references that are safe to transform, then sorts the
 * bullets so they read in the new A-D order:
 *   - the "Corect: x" header
 *   - each "• x - ..." option-bullet leader
 *
 * Inline letter mentions in prose are deliberately left untouched. In this
 * corpus a bare letter can be the Romanian word "a" ("a doua", "pentru a"), a
 * C++ class named A/B/C/D, an IP "clasa C/D", an array literal ['a','b'], or a
 * variable name. Remapping those would corrupt far more than it fixes. The
 * header and bullet leaders are what tell the reader which on-screen option
 * each line refers to.
 *
 * `optionOrder` is the display order of the original keys (a permutation of
 * a/b/c/d). A missing or identity order returns the text unchanged.
 */
export function remapExplanationForOrder(text: string, optionOrder?: AnswerKey[]): string {
  if (!text || !optionOrder || optionOrder.length !== 4) return text;

  // original option key -> new positional letter (e.g. ["c","a","b","d"] => c→a, a→b, b→c, d→d)
  const toNew = new Map<AnswerKey, AnswerKey>();
  let changed = false;
  optionOrder.forEach((origKey, i) => {
    const next = POSITION_LETTERS[i];
    toNew.set(origKey, next);
    if (origKey !== next) changed = true;
  });
  if (!changed) return text;

  const lines = text.split("\n");
  const bulletPositions: number[] = [];

  const mapped = lines.map((line, i) => {
    const corect = /^(\s*Corect:\s*)([a-d])(\b[\s\S]*)$/.exec(line);
    if (corect) {
      const orig = corect[2] as AnswerKey;
      return `${corect[1]}${toNew.get(orig) ?? orig}${corect[3]}`;
    }
    const bullet = /^(\s*•\s*)([a-d])(\s*-\s[\s\S]*)$/.exec(line);
    if (bullet) {
      bulletPositions.push(i);
      const orig = bullet[2] as AnswerKey;
      return `${bullet[1]}${toNew.get(orig) ?? orig}${bullet[3]}`;
    }
    return line;
  });

  // Reorder the (now-remapped) bullet lines so they read in A-D order, keeping
  // them in the same line slots they already occupy.
  if (bulletPositions.length > 1) {
    const letterOf = (l: string): string => {
      const m = /^\s*•\s*([a-d])/.exec(l);
      return m ? m[1] : "z";
    };
    const sorted = bulletPositions
      .map((p) => mapped[p])
      .sort((a, b) => letterOf(a).localeCompare(letterOf(b)));
    bulletPositions.forEach((p, k) => {
      mapped[p] = sorted[k];
    });
  }

  return mapped.join("\n");
}
