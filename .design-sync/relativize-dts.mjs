/*
 * Rewrites the `@/...` path-alias specifiers that tsc preserves verbatim in
 * the emitted declarations into real relative paths.
 *
 * Why this exists: design-sync reads `dist/types/**` with ts-morph, and that
 * project has no `paths` mapping. An unresolved import makes the referenced
 * type an error type, so the extractor cannot expand it and prints the bare
 * alias name instead — `locale: Locale`, `sharpness: Sharpness` — in the
 * `<Name>.d.ts` that IS the contract the design agent codes against. With the
 * imports resolvable, those expand to `"en" | "fr"` and
 * `"clear" | "shared" | "level"` on their own.
 *
 * Run after `tsc -p .design-sync/tsconfig.dts.json`; see cfg.buildCmd.
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";

const ROOT = "dist/types";

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (p.endsWith(".d.ts")) out.push(p);
  }
  return out;
}

let files = 0;
let rewrites = 0;
for (const file of walk(ROOT)) {
  const src = readFileSync(file, "utf8");
  const out = src.replace(/(["'])@\/([^"']+)\1/g, (_m, q, rest) => {
    let rel = relative(dirname(file), join(ROOT, rest)).split("\\").join("/");
    if (!rel.startsWith(".")) rel = "./" + rel;
    rewrites++;
    return q + rel + q;
  });
  if (out !== src) { writeFileSync(file, out); files++; }
}
console.log(`[relativize-dts] rewrote ${rewrites} alias import(s) across ${files} file(s)`);
