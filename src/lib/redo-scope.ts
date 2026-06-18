import type { Module } from "@/data/types";

/** What a redo set is narrowed to: everything, one module, or one materie (subject). */
export type Scope =
  | { kind: "all" }
  | { kind: "module"; id: string }
  | { kind: "subject"; id: string };

export interface ScopeSubjectOption {
  id: string;
  name: string;
  count: number;
}

export interface ScopeModuleOption {
  id: string;
  name: string;
  color: string;
  count: number;
  subjects: ScopeSubjectOption[];
}

export interface ScopeOptions {
  /** Questions in the pool that map to a known materie. */
  total: number;
  /** Modules that have at least one question in the pool, in catalog order. */
  modules: ScopeModuleOption[];
}

/** Resolves a question id to the module/materie it belongs to (e.g. via getQuestion). */
export type ResolveQuestion = (
  id: number,
) => { moduleId: string; subjectId: string } | undefined;

/**
 * Group a pool of question ids into a module -> materie tree with per-bucket
 * counts, ordered by `catalog` (the canonical `modules` array). Modules and
 * materii with no questions are omitted; ids that don't resolve are skipped.
 * `catalog` is injected rather than imported so this stays pure and testable.
 */
export function buildScopeOptions(
  ids: number[],
  resolve: ResolveQuestion,
  catalog: Module[],
): ScopeOptions {
  const counts = new Map<string, number>(); // subjectId -> count
  for (const id of ids) {
    const where = resolve(id);
    if (!where) continue;
    counts.set(where.subjectId, (counts.get(where.subjectId) ?? 0) + 1);
  }

  let total = 0;
  const modules: ScopeModuleOption[] = [];
  for (const mod of catalog) {
    const subjects: ScopeSubjectOption[] = [];
    let moduleCount = 0;
    for (const subject of mod.subjects) {
      const count = counts.get(subject.id) ?? 0;
      if (count === 0) continue;
      subjects.push({ id: subject.id, name: subject.name, count });
      moduleCount += count;
    }
    if (moduleCount === 0) continue;
    modules.push({ id: mod.id, name: mod.name, color: mod.color, count: moduleCount, subjects });
    total += moduleCount;
  }

  return { total, modules };
}

/** Narrow a pool of ids to `scope`. `all` returns the pool unchanged. */
export function filterByScope(ids: number[], scope: Scope, resolve: ResolveQuestion): number[] {
  if (scope.kind === "all") return ids;
  return ids.filter((id) => {
    const where = resolve(id);
    if (!where) return false;
    return scope.kind === "module" ? where.moduleId === scope.id : where.subjectId === scope.id;
  });
}

/**
 * Whether `scope` still points at something present in `options`. Lets the UI
 * fall back to "all" when the chosen materie/module leaves the pool (e.g. its
 * progress was reset), without storing the reset via an effect.
 */
export function scopeStillValid(scope: Scope, options: ScopeOptions): boolean {
  if (scope.kind === "all") return true;
  if (scope.kind === "module") return options.modules.some((m) => m.id === scope.id);
  return options.modules.some((m) => m.subjects.some((s) => s.id === scope.id));
}

/** True when the pool spans more than one materie (so a scope menu is worth showing). */
export function hasMultipleScopes(options: ScopeOptions): boolean {
  let subjects = 0;
  for (const mod of options.modules) {
    subjects += mod.subjects.length;
    if (subjects > 1) return true;
  }
  return false;
}
