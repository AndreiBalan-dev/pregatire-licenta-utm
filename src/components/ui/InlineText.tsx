import { Fragment, type ReactNode } from "react";

/**
 * Render backtick-delimited inline `code` spans as monospace chips, leaving the
 * rest of the text untouched. Shared by the question prompt and the explanation
 * panel so inline code reads the same everywhere. Text with no backticks comes
 * back as a single plain fragment, so existing content renders unchanged.
 */
export function renderInlineCode(text: string): ReactNode[] {
  return text.split("`").map((part, i) =>
    i % 2 === 1 ? (
      <code
        key={i}
        className="px-1 py-0.5 mx-px rounded-[var(--radius-sm)] bg-[var(--color-bg-primary)] border border-[var(--color-border)] font-mono text-[0.88em] text-[var(--color-text-primary)] break-words"
      >
        {part}
      </code>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
