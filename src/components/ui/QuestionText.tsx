import { CodeBlock } from "./CodeBlock";
import { renderInlineCode } from "./InlineText";
import { parseQuestionText } from "@/lib/question-text";

const PROSE_CLASS =
  "text-[13px] sm:text-base leading-relaxed text-[var(--color-text-primary)] whitespace-pre-wrap break-words";

/**
 * Render a question prompt: prose paragraphs with inline `code` chips, plus
 * multi-line fenced code blocks (`~~~lang ... ~~~`) shown through the Prism
 * CodeBlock. Parsing lives in `parseQuestionText` (pure, tested); this only
 * maps segments to markup. A prompt with no fence renders as one prose
 * paragraph, so existing questions look exactly as before.
 */
export function QuestionText({ text }: { text: string }) {
  const segments = parseQuestionText(text);
  return (
    <>
      {segments.map((seg, i) =>
        seg.kind === "prose" ? (
          <p key={i} className={PROSE_CLASS}>
            {renderInlineCode(seg.text)}
          </p>
        ) : (
          <div key={i} className="-mx-4 sm:mx-0 my-3 sm:my-4">
            {seg.lang && (
              <div className="flex items-center gap-2 mb-2 mx-4 sm:mx-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
                <span className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
                  {seg.lang}
                </span>
              </div>
            )}
            <div className="sm:rounded-[var(--radius-md)] overflow-hidden">
              <CodeBlock code={seg.code} language={seg.lang} className="!rounded-none sm:!rounded-[var(--radius-md)]" />
            </div>
          </div>
        ),
      )}
    </>
  );
}
