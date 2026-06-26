/**
 * Shared keyboard-navigation constants and pure helpers. Framework-free (no JSX)
 * so they can be unit-tested directly under the node runner.
 */

/** localStorage key holding the visitor's keyboard-nav preference ("1" on, "0" off). */
export const KEYBOARD_NAV_STORAGE_KEY = "utm-keyboard-nav";

/** First-time visitors (no stored value) get it ON; afterwards honor their choice. */
export function resolveInitialKeyboardNav(stored: string | null): boolean {
  if (stored === null) return true;
  return stored === "1";
}

/**
 * Next focus-cursor index for an Up/Down move. Seeds from null (Down -> 0,
 * Up -> last), then steps by delta and clamps to [0, count-1] with no wrap.
 */
export function nextFocusIndex(current: number | null, delta: 1 | -1, count: number): number {
  if (count <= 0) return 0;
  if (current === null) return delta === 1 ? 0 : count - 1;
  const next = current + delta;
  if (next < 0) return 0;
  if (next > count - 1) return count - 1;
  return next;
}
