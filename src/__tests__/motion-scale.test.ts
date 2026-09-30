import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { declsOf, parseBlocks } from "./color-math";

/**
 * The motion scale (design audit S-12, 2026-09-27): one set of durations and
 * distances in tokens/motion.css, named by use, and nothing else.
 *
 * What the audit found, and what each rule below keeps from coming back:
 *  - dead tokens (--dur-exit, --dur-message, --game-dur-trace: declared,
 *    read by nothing, one of them contradicting the JavaScript it named);
 *  - literal durations in the stylesheets next to a token of the same value
 *    (Sparkline's 800ms beside an unused 800ms token);
 *  - a third copy of the numbers in lib/game/ui-timing.ts that nothing
 *    imported and nothing checked.
 *
 * So: every token of motion.css has a consumer; no `animation` or
 * `transition` in a stylesheet writes a duration of its own (a `calc()`
 * offset from a token is allowed: it says what it is relative to). Script
 * that waits on a CSS motion reads its length from the element
 * (QuarterNews's fade out) rather than copying it — the rule is written at
 * the head of lib/game/ui-timing.ts; a check by value could not tell a copy
 * from a coincidence (the months' 600ms step is not the reveal's 600ms).
 */

const SRC = join(process.cwd(), "src");
const TOKENS = join(SRC, "styles", "tokens");

function walk(dir: string, keep: (name: string) => boolean): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full, keep);
    return keep(name) ? [full] : [];
  });
}

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

const MOTION = declsOf(parseBlocks("motion.css"), ":root");
/** Every stylesheet and component outside the token layer. */
const CONSUMERS = walk(SRC, (n) => /\.(css|tsx?)$/.test(n)).filter((f) => !f.startsWith(TOKENS) && !f.includes("__tests__"));
const STYLESHEETS = CONSUMERS.filter((f) => f.endsWith(".css"));

/** `260ms` → 260, `1.6s` → 1600. */
function ms(value: string): number {
  const m = /^([\d.]+)(ms|s)$/.exec(value.trim());
  if (!m) throw new Error(`not a duration: ${value}`);
  return Number(m[1]) * (m[2] === "s" ? 1000 : 1);
}

describe("the motion scale", () => {
  it("reads the real file", () => {
    expect(MOTION.size).toBeGreaterThanOrEqual(12);
    expect(CONSUMERS.length).toBeGreaterThan(100);
  });

  it("has no dead token: every one of them is read somewhere", () => {
    const sources = CONSUMERS.map((f) => readFileSync(f, "utf8")).join("\n");
    const reads = (name: string, text: string) => new RegExp(`var\\(--${name}[,)]`).test(text);
    // A token may be a setting of another (--stamp-overshoot shapes
    // --ease-stamp, CHANTIERS.md A4): alive when a token that reads it is read.
    const dead = [...MOTION.keys()].filter(
      (name) =>
        !reads(name, sources) &&
        ![...MOTION].some(([other, value]) => other !== name && reads(name, value) && reads(other, sources)),
    );
    expect(dead).toEqual([]);
  });

  it("closes faster than it opens, and hover is the quickest of all", () => {
    const d = (name: string) => ms(MOTION.get(name)!);
    expect(d("dur-close")).toBeLessThan(d("dur-open"));
    for (const [name, value] of MOTION) {
      if (name.startsWith("dur-") && name !== "dur-fast") expect(ms(value), name).toBeGreaterThan(d("dur-fast"));
    }
  });

  it("writes no duration of its own in any animation or transition", () => {
    const offending: string[] = [];
    let checked = 0;
    for (const file of STYLESHEETS) {
      const source = stripComments(readFileSync(file, "utf8"));
      for (const m of source.matchAll(/(?:^|[;{\s])((?:animation|transition)(?:-duration|-delay)?)\s*:\s*([^;{}]+)/g)) {
        checked++;
        // A calc() offset from a token says what it is relative to.
        const bare = (m[2] ?? "").replace(/calc\([^()]*(?:\([^()]*\)[^()]*)*\)/g, "calc()");
        if (/(?:^|[\s,(])\d*\.?\d+m?s\b/.test(bare)) offending.push(`${relative(process.cwd(), file)}: ${m[1]}: ${m[2]?.trim()}`);
      }
    }
    expect(checked).toBeGreaterThan(30);
    expect(offending).toEqual([]);
  });
});
