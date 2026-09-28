import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Every animation a CSS Module names must resolve INSIDE that module
 * (design audit 2026-09-27, S-1).
 *
 * CSS Modules scope an animation name exactly as they scope a class. Four
 * modules named the global `@keyframes tdg-stamp` / `tdg-pulse` of
 * tokens/motion.css; each reference compiled to a hashed name that existed
 * nowhere, the browser created no animation, and the score numeral, the
 * quiz's progress pulse, December's title and the quarter's verdict never
 * moved — from the DS v2 migration (#14) until 2026-09-28. Nothing failed:
 * the code read correctly, which is why this is a test and not a review note.
 *
 * Two rules:
 *  1. A name given to `animation` or `animation-name` in a `.module.css` is
 *     declared by an `@keyframes` of the same file. Shared keyframes live in
 *     styles/motion.module.css and reach a consumer through `composes`.
 *  2. A class that `composes` from motion.module.css does not use the
 *     `animation` shorthand: the shorthand resets `animation-name` to `none`,
 *     and which of the two classes won would depend on stylesheet order.
 *
 * Non-vacuity, checked by sabotage on 2026-09-28 (TESTING.md §1.1):
 *  - ScoreDisplay's `.animate` put back to `animation: tdg-stamp …` → two
 *    tests fail: rule 1, naming ScoreDisplay.module.css and `tdg-stamp`, and
 *    rule 2's consumer count, which drops from four to three;
 *  - `animation: 1s both` added next to its `composes` → exactly one test
 *    fails (rule 2), naming the class.
 * The e2e half (motion.spec.ts) proves the compiled result actually animates.
 */

const SRC = join(process.cwd(), "src");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return name.endsWith(".module.css") ? [full] : [];
  });
}

const stripComments = (source: string) => source.replace(/\/\*[\s\S]*?\*\//g, "");

/** Everything an `animation` shorthand can hold that is not a keyframe name. */
const NOT_A_NAME = new Set([
  "none",
  "both",
  "forwards",
  "backwards",
  "infinite",
  "normal",
  "reverse",
  "alternate",
  "alternate-reverse",
  "running",
  "paused",
  "ease",
  "ease-in",
  "ease-out",
  "ease-in-out",
  "linear",
  "step-start",
  "step-end",
  "initial",
  "inherit",
  "unset",
  "revert",
]);

/** The keyframe names a declaration value refers to. */
function namesIn(value: string): string[] {
  // Drop functions (var(), cubic-bezier(), steps()) before splitting on commas
  // and whitespace, so their arguments are never mistaken for names.
  let flat = value;
  for (let i = 0; i < 5 && /\([^()]*\)/.test(flat); i++) flat = flat.replace(/[a-z-]*\([^()]*\)/gi, " ");
  return flat
    .split(/[\s,]+/)
    .filter(Boolean)
    .filter((token) => !NOT_A_NAME.has(token) && !/^[-+.\d]/.test(token));
}

const MODULES = walk(SRC);

describe("CSS Modules name only keyframes they can reach (S-1)", () => {
  it("scans the real modules, not an empty set", () => {
    expect(MODULES.length).toBeGreaterThan(40);
    expect(MODULES.some((f) => f.endsWith("ScoreDisplay.module.css"))).toBe(true);
    expect(MODULES.some((f) => f.endsWith(join("styles", "motion.module.css")))).toBe(true);
  });

  it("every animation name is declared by an @keyframes of the same file", () => {
    const unresolved: string[] = [];
    let checked = 0;
    for (const full of MODULES) {
      const source = stripComments(readFileSync(full, "utf8"));
      const declared = new Set([...source.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1] ?? ""));
      for (const match of source.matchAll(/(?:^|[;{\s])animation(?:-name)?\s*:\s*([^;{}]+)/g)) {
        for (const name of namesIn(match[1] ?? "")) {
          checked++;
          if (!declared.has(name)) unresolved.push(`${relative(process.cwd(), full)}: ${name}`);
        }
      }
    }
    // Non-vacuity: the modules name well over a dozen keyframes today.
    expect(checked).toBeGreaterThan(12);
    expect(unresolved).toEqual([]);
  });

  it("a class composing the shared motion never uses the animation shorthand", () => {
    const offending: string[] = [];
    let composing = 0;
    for (const full of MODULES) {
      const source = stripComments(readFileSync(full, "utf8"));
      // Declaration blocks are the innermost braces; nesting is not used in
      // these rules, and a block with nested braces is skipped, not misread.
      for (const block of source.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        const [, selector = "", body = ""] = block;
        if (!/composes\s*:[^;]*motion\.module\.css/.test(body)) continue;
        composing++;
        if (/(?:^|[;\s])animation\s*:/.test(body)) {
          offending.push(`${relative(process.cwd(), full)}: ${selector.trim()}`);
        }
      }
    }
    // The four consumers: ScoreDisplay, StageProgress, EndingHero, QuarterNews.
    expect(composing).toBeGreaterThanOrEqual(4);
    expect(offending).toEqual([]);
  });
});
