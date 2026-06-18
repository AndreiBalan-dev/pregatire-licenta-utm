import process from "node:process";
import assert from "node:assert/strict";
import { buildScopeOptions, filterByScope, hasMultipleScopes, scopeStillValid } from "../src/lib/redo-scope.ts";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

// Real-shaped catalog (a stand-in for src/data/modules.ts `modules`), in canonical order.
const catalog = [
  { id: "programming", name: "Programare", color: "#p", subjects: [
    { id: "fundamentele-programarii", name: "Fundamentele Programării" },
    { id: "programare-python", name: "Programare în Python" },
    { id: "metode-avansate-java", name: "Metode Avansate (Java)" },
  ] },
  { id: "databases", name: "Baze de Date", color: "#d", subjects: [
    { id: "baze-de-date", name: "Baze de Date" },
  ] },
  { id: "networks", name: "Rețele", color: "#n", subjects: [
    { id: "sisteme-de-operare", name: "Sisteme de Operare" },
  ] },
  { id: "web", name: "Web", color: "#w", subjects: [
    { id: "tehnologii-web", name: "Tehnologii Web" },
  ] },
];

// Map question id -> where it lives.
const WHERE = {
  1: { moduleId: "programming", subjectId: "metode-avansate-java" },
  2: { moduleId: "programming", subjectId: "metode-avansate-java" },
  3: { moduleId: "programming", subjectId: "programare-python" },
  4: { moduleId: "networks", subjectId: "sisteme-de-operare" },
  5: { moduleId: "databases", subjectId: "baze-de-date" },
};
const resolve = (id) => WHERE[id];

check("buildScopeOptions: groups + counts, canonical order, drops empty modules and unknown ids", () => {
  const opts = buildScopeOptions([1, 2, 3, 4, 5, 99], resolve, catalog);
  assert.equal(opts.total, 5); // 99 doesn't resolve -> skipped
  // canonical module order; "web" excluded (count 0)
  assert.deepEqual(opts.modules.map((m) => m.id), ["programming", "databases", "networks"]);
  const prog = opts.modules.find((m) => m.id === "programming");
  assert.equal(prog.count, 3);
  assert.equal(prog.name, "Programare");
  assert.equal(prog.color, "#p");
  // subjects in canonical within-module order (python before java), empties dropped
  assert.deepEqual(prog.subjects.map((s) => [s.id, s.name, s.count]), [
    ["programare-python", "Programare în Python", 1],
    ["metode-avansate-java", "Metode Avansate (Java)", 2],
  ]);
});

check("buildScopeOptions: empty pool / all-unknown -> no modules", () => {
  assert.deepEqual(buildScopeOptions([], resolve, catalog), { total: 0, modules: [] });
  assert.deepEqual(buildScopeOptions([98, 99], resolve, catalog), { total: 0, modules: [] });
});

check("filterByScope: all -> unchanged; module -> by moduleId; subject -> by subjectId", () => {
  const ids = [1, 2, 3, 4, 5];
  assert.deepEqual(filterByScope(ids, { kind: "all" }, resolve), [1, 2, 3, 4, 5]);
  assert.deepEqual(filterByScope(ids, { kind: "module", id: "programming" }, resolve), [1, 2, 3]);
  assert.deepEqual(filterByScope(ids, { kind: "subject", id: "metode-avansate-java" }, resolve), [1, 2]);
});

check("filterByScope: module/subject drop unresolved ids; no match -> empty", () => {
  assert.deepEqual(filterByScope([1, 99], { kind: "module", id: "programming" }, resolve), [1]);
  assert.deepEqual(filterByScope([1, 2], { kind: "subject", id: "criptografie" }, resolve), []);
});

check("hasMultipleScopes: true only when >1 materie is represented", () => {
  assert.equal(hasMultipleScopes(buildScopeOptions([1, 2, 3, 4, 5], resolve, catalog)), true);
  assert.equal(hasMultipleScopes(buildScopeOptions([1, 2], resolve, catalog)), false); // one materie (java x2)
  assert.equal(hasMultipleScopes(buildScopeOptions([1, 3], resolve, catalog)), true); // two materii, same module
  assert.equal(hasMultipleScopes(buildScopeOptions([], resolve, catalog)), false); // none
});

check("scopeStillValid: all always valid; module/subject valid only if present in options", () => {
  const opts = buildScopeOptions([1, 2, 3, 4, 5], resolve, catalog);
  assert.equal(scopeStillValid({ kind: "all" }, opts), true);
  assert.equal(scopeStillValid({ kind: "module", id: "programming" }, opts), true);
  assert.equal(scopeStillValid({ kind: "module", id: "web" }, opts), false); // no questions in web
  assert.equal(scopeStillValid({ kind: "subject", id: "metode-avansate-java" }, opts), true);
  assert.equal(scopeStillValid({ kind: "subject", id: "criptografie" }, opts), false);
});

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
