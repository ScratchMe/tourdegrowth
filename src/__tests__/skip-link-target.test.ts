import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The skip link and its target live in different files, so nothing but this
 * test keeps them pointing at each other (ds-critique L-9, 2026-09-24).
 *
 * `RootShell` renders `<a href="#main">` first in every `<body>`, and it
 * cannot know where a page's content starts — the id lives on each page's
 * own `<main>`, twenty of them across the two trees. A page added tomorrow
 * with a bare `<main>` would give the one link a keyboard reader relies on
 * a target that does not exist, and nothing would look broken: the link
 * would simply do nothing. `e2e/skip-link.spec.ts` checks the behaviour on
 * real pages; this checks every page, including the ones no spec renders.
 */
const SRC = join(process.cwd(), "src");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.tsx$/.test(name) && !/\.test\.tsx$/.test(name) ? [full] : [];
  });
}

/** Source with comments removed, so a docblock that mentions `<main>` is not a tag. */
function code(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/^\s*\/\/.*$/gm, "");
}

const FILES = walk(SRC).map((full) => ({ path: relative(process.cwd(), full), source: code(readFileSync(full, "utf8")) }));

const MAIN_TAGS = FILES.flatMap((f) => [...f.source.matchAll(/<main\b[^>]*>/g)].map((m) => ({ path: f.path, tag: m[0] })));

describe("skip link ↔ <main id=\"main\"> (ds-critique L-9)", () => {
  it("finds the <main> elements it polices — a floor, so a regex drift cannot pass by matching nothing", () => {
    // Twenty on 2026-09-24: the quiz and the deep dive each render two
    // (pre-mount shell and the real screen), everything else one.
    expect(MAIN_TAGS.length).toBeGreaterThanOrEqual(20);
  });

  it("every <main> carries id=\"main\"", () => {
    const offenders = MAIN_TAGS.filter((t) => !/\bid="main"/.test(t.tag)).map((t) => `${t.path}: ${t.tag}`);
    expect(offenders).toEqual([]);
  });

  it("the shell renders the skip link pointing at that id", () => {
    const shell = FILES.find((f) => f.path.endsWith(join("app", "root-shell.tsx")));
    expect(shell).toBeDefined();
    expect(shell!.source).toMatch(/<a className="tdg-skip" href="#main">/);
  });
});
