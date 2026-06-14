/* eslint-disable @typescript-eslint/no-require-imports -- Node build script (CommonJS), not app code */
/**
 * Assembles src/data/explanations.ts from the AI generation+verification workflow output.
 *
 * Usage: node build-explanations.cjs <path-to-workflow-output.json>
 *
 * - Reads the workflow result ({ explanations, flagged, datasetErrors, stats }).
 * - EXCLUDES flagged ids (questions whose stored answer the verifier disputed) so we
 *   never ship a known-contradictory explanation. Those need a question-data fix first.
 * - Merges SUPPLEMENTAL (the 4 ids that dropped from the run, regenerated + verified).
 * - Cross-checks coverage against the real question ids in src/data/questions.
 * - Writes src/data/explanations.ts as Record<string, string> (id -> explanation).
 */
const fs = require("fs");
const path = require("path");

const OUT = process.argv[2];
if (!OUT) {
  console.error("Pass the workflow output JSON path as argv[2]");
  process.exit(1);
}

// The 4 ids (679-682, sisteme-de-operare) that dropped from the workflow, regenerated + verified.
const SUPPLEMENTAL = {
  679: "Corect: d\n\n`gcc -o program file1.c file2.c` compilează și linkează ambele fișiere sursă într-un singur executabil numit `program`.\n\nDe ce nu celelalte:\n• a — `make` nu primește fișiere `.c` ca argumente; folosește un `Makefile` cu reguli.\n• b — `-shared` creează o bibliotecă partajată (`.so`), nu un program executabil.\n• c — `-c` doar compilează în fișiere obiect (`.o`), fără să linkeze un executabil.",
  680: "Corect: c\n\n`ping -c 4` trimite exact 4 pachete ICMP echo request către `google.com`, apoi se oprește. Opțiunea `-c` = count.\n\nDe ce nu celelalte:\n• a — ping continuu este comportamentul implicit fără `-c`, nu cu el.\n• b — verificarea unui port se face cu `nc` sau `nmap`, nu cu `ping`; `4` e numărul de pachete, nu un port.\n• d — `ping` măsoară latența (RTT), nu viteza/lățimea de bandă a conexiunii.",
  681: "Corect: d\n\nToate cele trei comenzi afișează variabilele de mediu, deci varianta corectă le include pe toate.\n\nDe ce nu celelalte:\n• a — `env` listează toate variabilele de mediu ale sesiunii curente.\n• b — `export -p` afișează variabilele exportate (cele de mediu), fiecare cu prefix `declare -x`.\n• c — `printenv` tipărește variabilele de mediu (sau valoarea uneia anume dacă îi dai un nume).",
  682: "Corect: d\n\nToate variantele rulează scriptul detașat de terminalul interactiv, deci varianta corectă le include pe toate.\n\nDe ce nu celelalte:\n• a — `bash script.sh &` pornește scriptul în fundal prin operatorul `&`.\n• b — `nohup bash script.sh` îl rulează imun la deconectare (HUP), tipic combinat cu `&` și redirectare; rămâne activ după închiderea sesiunii.\n• c — `./script.sh &` face același lucru ca (a), dacă scriptul are bit de execuție și shebang.",
};

const result = JSON.parse(fs.readFileSync(OUT, "utf8")).result;
const excluded = new Set((result.flagged || []).map((f) => f.id));

// Held back: the generation agents silently edited the SOURCE question for these
// (consistency fixes that were reverted to respect the dataset). Their explanations
// were written against the changed data, so we ship them only after a human fixes the
// question. id 106 (poo-cpp destructor output) and id 430 (retele subnet mask typo).
for (const id of [106, 430]) excluded.add(id);

// Normalize AI-tell punctuation: em/en dashes -> hyphen (the platform avoids em dashes).
const norm = (s) => s.replace(/[—–]/g, "-");

const map = {};
for (const e of result.explanations) {
  if (!excluded.has(e.id)) map[e.id] = norm(e.explanation);
}
for (const [id, exp] of Object.entries(SUPPLEMENTAL)) map[Number(id)] = norm(exp);

// Expected question ids from the source data.
function walk(d) {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    const f = path.join(d, e.name);
    return e.isDirectory() ? walk(f) : [f];
  });
}
const files = walk("src/data/questions").filter((f) => f.endsWith(".ts"));
const expected = [
  ...new Set(
    files.flatMap((f) =>
      (fs.readFileSync(f, "utf8").match(/^[ \t]*id:[ \t]*(\d+)/gm) || []).map((x) => +x.replace(/[^0-9]/g, "")),
    ),
  ),
].sort((a, b) => a - b);

const have = new Set(Object.keys(map).map(Number));
const missing = expected.filter((id) => !have.has(id));

const sortedKeys = [...have].sort((a, b) => a - b);
const obj = {};
for (const k of sortedKeys) obj[k] = map[k];

const header =
  "// AUTO-GENERATED - do not edit by hand.\n" +
  '// Romanian "de ce e corect / de ce e greșit" explanations, keyed by question id.\n' +
  "// Generated and independently verified by AI (Opus 4.8). Rebuild with build-explanations.cjs.\n\n";
const body = `export const explanations: Record<string, string> = ${JSON.stringify(obj, null, 2)};\n`;
fs.writeFileSync("src/data/explanations.ts", header + body, "utf8");

console.log("Wrote src/data/explanations.ts:", sortedKeys.length, "explanations");
console.log("Excluded (flagged, need data fix):", [...excluded].sort((a, b) => a - b));
console.log("Coverage:", sortedKeys.length, "of", expected.length, "questions");
console.log("Without explanation:", missing.length ? missing : "(only the flagged ids above)");
