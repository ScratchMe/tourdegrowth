#!/usr/bin/env node
/**
 * Verifies every length stated in the marketing drafts, so a count in a
 * draft is never recopied by hand (marketing/campaigns/brand-review.md,
 * « Longueurs »). Lives in marketing/, outside the app: nothing in src/
 * imports it, and a change here triggers no Vercel build.
 *
 *   node marketing/check-lengths.mjs          report, exit 1 on any mismatch
 *   node marketing/check-lengths.mjs --fix    rewrite wrong counts in place
 *
 * What it checks:
 *   - every "`text` (n)" pair: n must equal the text's length in code
 *     points (what form fields and X count for Latin text; a U+00A0 is one
 *     character, like the space it replaced);
 *   - the limit implied by the section the pair sits under (a "140" section
 *     heading means ≤ 140, "≤ 60", "≤ 50", "≤ 80");
 *   - numbered posts in social.md: ≤ 280 on X, counting a [link]/[lien]
 *     placeholder as 23 characters (X shortens every URL to 23).
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const FIX = process.argv.includes("--fix");

const files = ["kit.md"];
for (const dir of ["campaigns/engine", "campaigns/game"]) {
  for (const f of readdirSync(join(ROOT, dir)).sort()) {
    if (f.endsWith(".md")) files.push(`${dir}/${f}`);
  }
}

const PAIR = /`([^`\n]+)` \((\d+)\)/g;
let problems = 0;
let checked = 0;

function limitFor(heading) {
  const m = heading.match(/≤\s*(\d+)/) ?? heading.match(/—\s*(\d+)\s*caract/);
  return m ? Number(m[1]) : null;
}

for (const rel of files) {
  const path = join(ROOT, rel);
  const lines = readFileSync(path, "utf8").split("\n");
  let limit = null;
  let changed = false;
  lines.forEach((line, i) => {
    if (line.startsWith("#") || line.startsWith("**")) limit = limitFor(line);
    lines[i] = line.replace(PAIR, (whole, text, stated) => {
      checked += 1;
      const real = [...text].length;
      if (Number(stated) !== real) {
        problems += 1;
        console.log(`${rel}:${i + 1} stated ${stated}, real ${real}`);
        if (FIX) {
          changed = true;
          return `\`${text}\` (${real})`;
        }
      }
      if (limit !== null && real > limit) {
        problems += 1;
        console.log(`${rel}:${i + 1} ${real} > limit ${limit}`);
      }
      return whole;
    });
    if (rel.endsWith("social.md")) {
      const post = line.match(/^\s*\d+\. > (.+)$/);
      if (post) {
        checked += 1;
        const x = [...post[1].replace(/\[(link|lien)\]/g, "x".repeat(23))].length;
        if (x > 280) {
          problems += 1;
          console.log(`${rel}:${i + 1} post is ${x} characters on X (> 280)`);
        }
      }
    }
  });
  if (changed) writeFileSync(path, lines.join("\n"));
}

console.log(`${checked} lengths checked, ${problems} problem(s).`);
if (checked === 0) {
  // A checker that found nothing to check proves nothing.
  console.log("Nothing was checked — the pattern no longer matches the drafts.");
  process.exit(1);
}
process.exit(problems && !FIX ? 1 : 0);
