import process from "node:process";
import assert from "node:assert/strict";
import {
  searchQuestions,
  countActiveFilters,
  hasAnyCriteria,
  normalize,
  criteriaToParams,
  criteriaFromParams,
  EMPTY_CRITERIA,
} from "../src/lib/search.ts";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

// Minimal question fixture (Question-shaped) covering the searchable dimensions.
const q = (over) => ({
  id: 0,
  moduleId: "programming",
  subjectId: "fundamentele-programarii",
  text: "",
  options: { a: "", b: "", c: "", d: "" },
  correctAnswer: "a",
  ...over,
});

const QUESTIONS = [
  q({ id: 1, subjectId: "fundamentele-programarii", text: "Ce valoare va fi memorata in x", code: "float x = a/b;", codeLanguage: "c", correctAnswer: "b", explanation: "Corect: b. Impartire intreaga." }),
  q({ id: 2, subjectId: "programare-python", text: "Care este tipul unei liste in Python", correctAnswer: "a" }),
  q({ id: 3, moduleId: "databases", subjectId: "baze-de-date", text: "O baza de date reprezinta un ansamblu", correctAnswer: "b", explanation: "Corect: b." }),
  q({ id: 4, moduleId: "networks", subjectId: "criptografie", text: "Cheia simetrica foloseste acelasi secret", correctAnswer: "c" }),
  q({ id: 5, moduleId: "web", subjectId: "tehnologii-web", text: "Primul fisier imagine din pagina", options: { a: "document.images[0].src", b: "baza temporara", c: "x", d: "y" }, code: "document.images[0].src='a.jpg';", codeLanguage: "js", correctAnswer: "a" }),
  q({ id: 6, moduleId: "databases", subjectId: "sgbd", text: "Un SGBD gestioneaza datele", correctAnswer: "d", figure: "/figures/fig1.png" }),
  q({ id: 7, subjectId: "poo-cpp", text: "Mostenirea in C++ permite reutilizarea", code: "class A {};", codeLanguage: "cpp", correctAnswer: "b", explanation: "Corect: b." }),
  q({ id: 8, moduleId: "networks", subjectId: "criptografie", text: "Functia hash produce un șir de lungime fixa", correctAnswer: "a" }),
];

const ids = (list) => list.map((x) => x.id);
const crit = (over) => ({ ...EMPTY_CRITERIA, ...over });
const run = (over, ctx, shuffle) => searchQuestions(QUESTIONS, crit(over), ctx, shuffle);

check("normalize: lowercases and strips Romanian diacritics", () => {
  assert.equal(normalize("Criptografie"), "criptografie");
  assert.equal(normalize("Șir Țară Înălțime ă â"), "sir tara inaltime a a");
});

check("empty criteria returns everything (relevance, id order)", () => {
  assert.deepEqual(ids(run({})), [1, 2, 3, 4, 5, 6, 7, 8]);
});

check("free text matches question body, diacritic-insensitive", () => {
  assert.deepEqual(ids(run({ q: "baza" })), [3, 5]); // 3 in text, 5 in option b
  assert.deepEqual(ids(run({ q: "sir" })), [8]); // matches "șir"
});

check("relevance ranks text matches above option-only matches", () => {
  // "baza": Q3 hits the question text (higher), Q5 only an option (lower).
  assert.deepEqual(ids(run({ q: "baza" })), [3, 5]);
});

check("#id searches strictly by id; bare number prioritizes id", () => {
  assert.deepEqual(ids(run({ q: "#5" })), [5]);
  assert.deepEqual(ids(run({ q: "5" }))[0], 5);
});

check("module / subject filters", () => {
  assert.deepEqual(ids(run({ moduleIds: ["databases"] })), [3, 6]);
  assert.deepEqual(ids(run({ subjectIds: ["criptografie"] })), [4, 8]);
});

check("code presence + language", () => {
  assert.deepEqual(ids(run({ code: "with" })), [1, 5, 7]);
  assert.deepEqual(ids(run({ code: "without" })), [2, 3, 4, 6, 8]);
  assert.deepEqual(ids(run({ code: "with", codeLanguages: ["cpp"] })), [7]);
  // language is ignored unless code === "with"
  assert.deepEqual(ids(run({ code: "any", codeLanguages: ["cpp"] })), [1, 2, 3, 4, 5, 6, 7, 8]);
});

check("figure and explanation presence", () => {
  assert.deepEqual(ids(run({ figure: "with" })), [6]);
  assert.deepEqual(ids(run({ explanation: "with" })), [1, 3, 7]);
  assert.deepEqual(ids(run({ explanation: "without" })), [2, 4, 5, 6, 8]);
});

check("correct-answer letter filter", () => {
  assert.deepEqual(ids(run({ correctAnswer: "b" })), [1, 3, 7]);
});

check("progress filters use the injected answer map (OR within group)", () => {
  const ctx = { answered: new Map([[1, { isCorrect: true }], [4, { isCorrect: false }]]), bookmarks: new Set([8]) };
  assert.deepEqual(ids(run({ progress: ["correct"] }, ctx)), [1]);
  assert.deepEqual(ids(run({ progress: ["wrong"] }, ctx)), [4]);
  assert.deepEqual(ids(run({ progress: ["answered"] }, ctx)), [1, 4]);
  assert.deepEqual(ids(run({ progress: ["unanswered"] }, ctx)), [2, 3, 5, 6, 7, 8]);
  assert.deepEqual(ids(run({ progress: ["bookmarked"] }, ctx)), [8]);
  assert.deepEqual(ids(run({ progress: ["correct", "bookmarked"] }, ctx)), [1, 8]);
});

check("groups AND together across categories", () => {
  // code AND correctAnswer=b -> only Q1 and Q7 have code; both are answer b.
  assert.deepEqual(ids(run({ code: "with", correctAnswer: "b" })), [1, 7]);
  // databases AND has-figure -> only Q6.
  assert.deepEqual(ids(run({ moduleIds: ["databases"], figure: "with" })), [6]);
});

check("sort: id ascending and random via injected shuffle", () => {
  assert.deepEqual(ids(run({ sort: "id" })), [1, 2, 3, 4, 5, 6, 7, 8]);
  const reverse = (arr) => [...arr].reverse();
  assert.deepEqual(ids(run({ sort: "random" }, undefined, reverse)), [8, 7, 6, 5, 4, 3, 2, 1]);
});

check("countActiveFilters / hasAnyCriteria", () => {
  assert.equal(countActiveFilters(EMPTY_CRITERIA), 0);
  assert.equal(countActiveFilters(crit({ code: "with", codeLanguages: ["c"], figure: "with", progress: ["wrong"], correctAnswer: "b" })), 5);
  assert.equal(hasAnyCriteria(EMPTY_CRITERIA), false);
  assert.equal(hasAnyCriteria(crit({ q: "x" })), true);
  assert.equal(hasAnyCriteria(crit({ moduleIds: ["web"] })), true);
  assert.equal(hasAnyCriteria(crit({ sort: "random" })), false); // sort alone isn't a filter
});

check("URL params round-trip", () => {
  const original = crit({
    q: "test",
    moduleIds: ["databases"],
    subjectIds: ["sgbd"],
    code: "with",
    codeLanguages: ["cpp", "sql"],
    figure: "with",
    explanation: "without",
    progress: ["wrong", "bookmarked"],
    correctAnswer: "c",
    sort: "random",
  });
  const restored = criteriaFromParams(criteriaToParams(original));
  assert.deepEqual(restored, original);
});

check("URL params omit defaults and drop code language when code is not 'with'", () => {
  assert.equal(criteriaToParams(EMPTY_CRITERIA).toString(), "");
  const p = criteriaToParams(crit({ code: "any", codeLanguages: ["c"] }));
  assert.equal(p.get("lang"), null);
});

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
