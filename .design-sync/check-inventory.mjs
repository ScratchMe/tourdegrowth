/*
 * Fails the build when `cfg.componentSrcMap` and `src/components/**` disagree.
 *
 * Why the map lists every component instead of four: with no `dist/`, the
 * converter only derives the component list from `src/` when the map adds
 * NOTHING (`resolvePackage` in `.ds-sync/lib/source-kit.mjs`: a single
 * non-null entry makes the pinned names the whole list). The four
 * `ProsePage.tsx` sub-exports need a pin — their file is not named after
 * them, so the fuzzy-find misses and they would lose their JSDoc and their
 * group — and a pin switches derivation off for everyone. Measured: four
 * pins, a 4-component bundle, and 36 "stale preview" lines.
 *
 * So the map is the inventory, and an inventory written by hand drifts: a
 * component added next month would simply be missing from the next sync,
 * with no error anywhere. This script is what makes that loud. It runs as
 * the last step of `cfg.buildCmd`, before the converter.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "src/components";
const cfg = JSON.parse(readFileSync(".design-sync/config.json", "utf8"));
const map = cfg.componentSrcMap ?? {};

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (p.endsWith(".tsx") && !/\.(test|spec|stories)\./.test(p)) out.push(p);
  }
  return out;
}

// Same shape the converter keeps: a PascalCase value export that is not an
// ALL-CAPS constant (`FACE_PATHS`) — see `isComponentName` in lib/dts.mjs.
const found = new Map();
for (const file of walk(ROOT)) {
  const src = readFileSync(file, "utf8");
  for (const m of src.matchAll(/^export (?:function|const) ([A-Z][A-Za-z0-9]*)/gm)) {
    if (/^[A-Z][A-Z0-9_]+$/.test(m[1])) continue;
    found.set(m[1], file);
  }
}

const problems = [];
for (const [name, file] of found) {
  if (!(name in map)) problems.push(`${name} (${file}) is exported but not in componentSrcMap — add it, or map it to null to exclude it on purpose`);
  else if (map[name] !== null && map[name] !== file) problems.push(`${name} is pinned to ${map[name]} but lives in ${file}`);
}
for (const [name, file] of Object.entries(map)) {
  if (file !== null && !found.has(name)) problems.push(`${name} is pinned to ${file}, which does not export it`);
}

if (problems.length) {
  for (const p of problems) console.error(`[inventory] ${p}`);
  process.exit(1);
}
const kept = Object.values(map).filter((v) => v !== null).length;
console.log(`[inventory] ${kept} components pinned, ${found.size - kept} excluded on purpose, none missing`);
