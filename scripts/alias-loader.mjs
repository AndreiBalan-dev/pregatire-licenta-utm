// Node ESM resolve hook that maps the project's "@/..." path alias
// (tsconfig.json -> "@/*": "./src/*") to real files, so the .ts test files
// can import application modules directly under `node`. Used only for tests.
import { pathToFileURL, fileURLToPath } from "node:url";
import { existsSync, statSync } from "node:fs";
import path from "node:path";

const srcDir = path.resolve(import.meta.dirname, "..", "src");

/** Map a path without extension to the matching .ts/.tsx/.js or its index.ts. */
function resolveToFile(base) {
  const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, path.join(base, "index.ts")];
  for (const candidate of candidates) {
    // Only resolve to real files; a bare directory (e.g. "@/data") must fall
    // through to its index.ts candidate, since ESM cannot import a directory.
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      return pathToFileURL(candidate).href;
    }
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const hit = resolveToFile(path.join(srcDir, specifier.slice(2)));
    if (hit) return nextResolve(hit, context);
  }
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    // TS-aware fallback for extensionless / directory relative imports inside
    // the source graph (e.g. src/data/index.ts -> "./questions/.../x"), which
    // tsc/Next resolve but raw Node ESM does not. Only kicks in when normal
    // resolution has already failed, so existing resolutions are untouched.
    if (
      (specifier.startsWith("./") || specifier.startsWith("../")) &&
      context.parentURL &&
      (err?.code === "ERR_MODULE_NOT_FOUND" || err?.code === "ERR_UNSUPPORTED_DIR_IMPORT")
    ) {
      const base = path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier);
      const hit = resolveToFile(base);
      if (hit) return nextResolve(hit, context);
    }
    throw err;
  }
}
