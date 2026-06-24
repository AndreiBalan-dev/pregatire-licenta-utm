// Dump the fully-loaded question set (with explanations attached) as JSON, using
// the SAME runtime strings the app renders - so any "highlight this substring"
// data computed downstream is guaranteed to match at runtime, including the one
// double-quoted file (metode-avansate-java) where regex-parsing the .ts would
// capture escaped source text instead.
//
//   node --import ./scripts/register-alias.mjs scripts/dump_questions.mjs <out.json>
//
// We import each question file directly with an explicit .ts extension (the files
// only `import type`, which type-stripping erases, so no resolver is needed).
import process from "node:process";
import { writeFileSync } from "node:fs";

import { fundamenteleProgramarii } from "../src/data/questions/programming/fundamentele-programarii.ts";
import { programarePython } from "../src/data/questions/programming/programare-python.ts";
import { pooCpp } from "../src/data/questions/programming/poo-cpp.ts";
import { metodeAvansateJava } from "../src/data/questions/programming/metode-avansate-java.ts";
import { tehniciAvansate } from "../src/data/questions/programming/tehnici-avansate.ts";
import { algoritmiStructuriDate } from "../src/data/questions/programming/algoritmi-structuri-date.ts";
import { bazeDeDate } from "../src/data/questions/databases/baze-de-date.ts";
import { sgbd } from "../src/data/questions/databases/sgbd.ts";
import { sistemeDeOperare } from "../src/data/questions/networks/sisteme-de-operare.ts";
import { reteleCalculatoare } from "../src/data/questions/networks/retele-calculatoare.ts";
import { criptografie } from "../src/data/questions/networks/criptografie.ts";
import { tehnologiiWeb } from "../src/data/questions/web/tehnologii-web.ts";
import { comertElectronic } from "../src/data/questions/web/comert-electronic.ts";
import { cloudComputing } from "../src/data/questions/web/cloud-computing.ts";
import { inovareTransformareDigitala } from "../src/data/questions/web/inovare-transformare-digitala.ts";
import { explanations } from "../src/data/explanations.ts";

const all = [
  ...fundamenteleProgramarii,
  ...programarePython,
  ...pooCpp,
  ...metodeAvansateJava,
  ...tehniciAvansate,
  ...algoritmiStructuriDate,
  ...bazeDeDate,
  ...sgbd,
  ...sistemeDeOperare,
  ...reteleCalculatoare,
  ...criptografie,
  ...tehnologiiWeb,
  ...comertElectronic,
  ...cloudComputing,
  ...inovareTransformareDigitala,
];

const out = all.map((q) => ({
  id: q.id,
  moduleId: q.moduleId,
  subjectId: q.subjectId,
  text: q.text,
  code: q.code ?? "",
  codeLanguage: q.codeLanguage ?? "",
  options: q.options,
  correctAnswer: q.correctAnswer,
  explanation: explanations[q.id] ?? q.explanation ?? "",
}));

const outPath = process.argv[2];
if (!outPath) {
  console.error("usage: dump_questions.mjs <out.json>");
  process.exit(1);
}
writeFileSync(outPath, JSON.stringify(out), "utf-8");
console.log(`wrote ${out.length} questions to ${outPath}`);
