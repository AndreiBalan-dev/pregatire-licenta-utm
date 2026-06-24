import process from "node:process";
import assert from "node:assert/strict";
import { resolveInitialHighlighter } from "../src/lib/highlighter.ts";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

// The marker ("evidenţiator") is ON by default for first-time visitors; once a
// visitor toggles it, we honor their stored choice.
check("first-time visitor (no stored value) defaults ON", () => {
  assert.equal(resolveInitialHighlighter(null), true);
});

check("explicit on ('1') stays on", () => {
  assert.equal(resolveInitialHighlighter("1"), true);
});

check("explicit off ('0') stays off", () => {
  assert.equal(resolveInitialHighlighter("0"), false);
});

check("any other stored value is treated as off (not first-time)", () => {
  assert.equal(resolveInitialHighlighter(""), false);
  assert.equal(resolveInitialHighlighter("yes"), false);
});

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
