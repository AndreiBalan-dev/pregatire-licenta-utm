import type { RedoLineage } from "./session-types";

export type RedoRole = "wrong" | "initial" | "full";

export interface RedoTarget {
  role: RedoRole;
  ids: number[];
}

/**
 * Ordered, de-duplicated ladder of redo targets for a session's results popup.
 * Order is wrong -> initial -> full; the first item is the primary button.
 * Empty sets are dropped and exact set-duplicates collapse (compared as sorted
 * ids). When the origin's first mistakes equal the whole origin, "initial" is
 * omitted because the "full" button already covers it.
 */
export function buildRedoTargets(args: {
  wrongIds: number[];
  lineage?: RedoLineage;
}): RedoTarget[] {
  const out: RedoTarget[] = [];
  const seen = new Set<string>();
  const key = (ids: number[]) => [...ids].sort((a, b) => a - b).join(",");
  const push = (role: RedoRole, ids: number[]) => {
    if (!ids || ids.length === 0) return;
    const k = key(ids);
    if (seen.has(k)) return;
    seen.add(k);
    out.push({ role, ids: [...ids] });
  };

  push("wrong", args.wrongIds);
  if (args.lineage) {
    if (key(args.lineage.firstWrong) !== key(args.lineage.origin.questionIds)) {
      push("initial", args.lineage.firstWrong);
    }
    push("full", args.lineage.origin.questionIds);
  }
  return out;
}
