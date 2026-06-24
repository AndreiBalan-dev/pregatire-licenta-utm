/**
 * Shared highlighter ("evidenţiator") constants and first-load decision.
 * Framework-free (no JSX) so it can be unit-tested directly via the Node runner.
 */

/** localStorage key holding the visitor's highlighter preference ("1" = on, "0" = off). */
export const HIGHLIGHTER_STORAGE_KEY = "utm-highlighter";

/**
 * Decide the highlighter's initial state from the stored preference.
 * First-time visitors (no stored value yet) get it ON so the trap markers are
 * discoverable; once a visitor toggles it we honor their explicit choice.
 */
export function resolveInitialHighlighter(stored: string | null): boolean {
  if (stored === null) return true;
  return stored === "1";
}
