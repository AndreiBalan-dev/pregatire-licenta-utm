// Node ESM resolve hook that maps the project's "@/..." path alias
// (tsconfig.json -> "@/*": "./src/*") to real files, so the .ts test files
// can import application modules directly under `node`. Used only for tests.
import { pathToFileURL } from "node:url";
import { existsSync } from "node:fs";
import path from "node:path";

const srcDir = path.resolve(import.meta.dirname, "..", "src");

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const base = path.join(srcDir, specifier.slice(2));
    const candidates = [
      base,
      `${base}.ts`,
      `${base}.tsx`,
      `${base}.js`,
      path.join(base, "index.ts"),
    ];
    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        return nextResolve(pathToFileURL(candidate).href, context);
      }
    }
  }
  return nextResolve(specifier, context);
}
