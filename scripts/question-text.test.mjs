import process from "node:process";
import assert from "node:assert/strict";
import { parseQuestionText } from "../src/lib/question-text.ts";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

check("no fence -> a single prose segment, untouched (incl. inline backticks)", () => {
  assert.deepEqual(parseQuestionText("Care e valoarea expresiei `x[1]`?"), [
    { kind: "prose", text: "Care e valoarea expresiei `x[1]`?" },
  ]);
});

check("empty string -> one empty prose segment", () => {
  assert.deepEqual(parseQuestionText(""), [{ kind: "prose", text: "" }]);
});

check("one fenced block with language, prose before and after", () => {
  const t = "Intro:\n~~~python\ndef f(n):\n    return n\n~~~\nGata?";
  assert.deepEqual(parseQuestionText(t), [
    { kind: "prose", text: "Intro:" },
    { kind: "code", lang: "python", code: "def f(n):\n    return n\n" },
    { kind: "prose", text: "Gata?" },
  ]);
});

check("fence without a language -> lang undefined", () => {
  assert.deepEqual(parseQuestionText("~~~\nx = 1\n~~~"), [
    { kind: "code", lang: undefined, code: "x = 1\n" },
  ]);
});

check("multiple labeled blocks keep their prose labels between them", () => {
  const t = "Functii:\na)\n~~~python\ndef a():\n    pass\n~~~\nb)\n~~~python\ndef b():\n    pass\n~~~\nCate?";
  const segs = parseQuestionText(t);
  assert.deepEqual(segs.map((s) => s.kind), ["prose", "code", "prose", "code", "prose"]);
  assert.equal(segs[0].text, "Functii:\na)");
  assert.equal(segs[2].text, "b)");
  assert.equal(segs[4].text, "Cate?");
});

check("code body preserves indentation and inner braces", () => {
  const t = "~~~python\nd = {int(x): 1}\nreturn d\n~~~";
  const segs = parseQuestionText(t);
  assert.equal(segs.length, 1);
  assert.equal(segs[0].code, "d = {int(x): 1}\nreturn d\n");
});

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
