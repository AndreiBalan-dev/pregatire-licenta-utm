/**
 * Split a question prompt into prose and fenced-code segments.
 *
 * Multi-line code is authored as a tilde fence: a line `~~~lang` (language
 * optional), the code, then a line `~~~`. Tildes are used instead of triple
 * backticks so the markers don't need escaping inside the backtick-delimited
 * template literals the questions are stored in. Prose between/around fences is
 * trimmed; inline `code` inside prose is left for the prose renderer to handle.
 * A prompt with no fence yields a single prose segment (existing behaviour).
 */
export type QuestionSegment =
  | { kind: "prose"; text: string }
  | { kind: "code"; lang?: string; code: string };

export function parseQuestionText(text: string): QuestionSegment[] {
  const fence = /~~~([a-zA-Z0-9]+)?[ \t]*\r?\n([\s\S]*?)~~~/g;
  const out: QuestionSegment[] = [];
  let last = 0;

  for (const m of text.matchAll(fence)) {
    const idx = m.index ?? 0;
    const before = text.slice(last, idx).trim();
    if (before) out.push({ kind: "prose", text: before });
    out.push({ kind: "code", lang: m[1] || undefined, code: m[2] });
    last = idx + m[0].length;
  }

  const rest = text.slice(last).trim();
  if (rest || out.length === 0) out.push({ kind: "prose", text: rest });

  return out;
}
