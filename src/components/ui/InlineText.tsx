import { Fragment, type ReactNode } from "react";

const CODE_CLASS =
  "px-1 py-0.5 mx-px rounded-[var(--radius-sm)] bg-[var(--color-bg-primary)] border border-[var(--color-border)] font-mono text-[0.88em] text-[var(--color-text-primary)] break-words";

// The "marker pen" look: a gold accent highlight with dark text so the tiny
// distinguishing token pops on any background (green correct option, red wrong
// option, or plain prose). Only ever shown after the answer is revealed.
const MARK_CLASS =
  "rounded-[2px] px-0.5 font-bold bg-[var(--color-accent)] text-[#0C0C0E] break-words";

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Wrap every literal occurrence of any `marks` substring in `text` with an accent <mark>. */
function highlightMarks(text: string, marks: string[], keyPrefix: string): ReactNode[] {
  const real = marks.filter((m) => m && m.length > 0);
  if (real.length === 0) return [<Fragment key={`${keyPrefix}p`}>{text}</Fragment>];
  // Longest-first so a more specific (longer) mark wins over a shorter overlapping one.
  const ordered = [...real].sort((a, b) => b.length - a.length);
  const re = new RegExp(`(${ordered.map(escapeRegExp).join("|")})`, "g");
  return text.split(re).map((part, i) =>
    i % 2 === 1 ? (
      <mark key={`${keyPrefix}m${i}`} className={MARK_CLASS}>
        {part}
      </mark>
    ) : (
      <Fragment key={`${keyPrefix}f${i}`}>{part}</Fragment>
    ),
  );
}

/**
 * Render text with backtick-delimited inline `code` spans as monospace chips and,
 * optionally, literal `marks` substrings wrapped in an accent <mark> highlight.
 * Marks are matched only inside the non-code parts. With no marks this is exactly
 * the old inline-code rendering, so existing content is untouched.
 */
export function renderMarkedText(text: string, marks?: string[]): ReactNode[] {
  const hasMarks = !!marks && marks.length > 0;
  const out: ReactNode[] = [];
  text.split("`").forEach((part, i) => {
    if (i % 2 === 1) {
      out.push(
        <code key={`c${i}`} className={CODE_CLASS}>
          {part}
        </code>,
      );
    } else if (hasMarks) {
      out.push(...highlightMarks(part, marks!, `p${i}`));
    } else {
      out.push(<Fragment key={`f${i}`}>{part}</Fragment>);
    }
  });
  return out;
}

/**
 * Render backtick-delimited inline `code` spans as monospace chips, leaving the
 * rest of the text untouched. Shared by the question prompt and the explanation
 * panel so inline code reads the same everywhere. Text with no backticks comes
 * back as a single plain fragment, so existing content renders unchanged.
 */
export function renderInlineCode(text: string): ReactNode[] {
  return renderMarkedText(text);
}
