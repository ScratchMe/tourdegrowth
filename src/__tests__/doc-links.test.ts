import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Every relative link in the documentation leads to a file that exists.
 *
 * Since 2026-10-01 the long documents are split: the journal's archived volumes, the v1 spec of
 * the engine and the game's level 2 live under docs/, and an index at the head of each original
 * (JOURNAL.md, ENGINE.md, GAME-BRIEF.md) points to them. An index whose link breaks — a volume
 * renamed, a part moved again — sends the next session nowhere, silently. On the day of the split,
 * the 34 files below held no dead link; this test keeps it that way.
 *
 * Non-vacuity, measured on 2026-10-01: renaming docs/engine/v1.md fails it, naming the two
 * indexes that point to it (ENGINE.md, README.md).
 */

const ROOT = process.cwd();

function markdownUnder(dir: string): string[] {
  return readdirSync(join(ROOT, dir)).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(join(ROOT, path)).isDirectory()) return markdownUnder(path);
    return name.endsWith(".md") ? [path] : [];
  });
}

const FILES = [
  ...readdirSync(ROOT).filter((name) => name.endsWith(".md")),
  ...markdownUnder("docs"),
  "design/README.md",
  "marketing/README.md",
];

/** `[text](target)` and `[text](target#anchor)`, without a scheme: what a reader clicks to another file. */
const LINK = /\]\(([^)\s#]+)(?:#[^)]*)?\)/g;

describe("documentation links", () => {
  it("reads a plausible set of files", () => {
    expect(FILES).toContain("JOURNAL.md");
    expect(FILES).toContain("ENGINE.md");
    expect(FILES).toContain("docs/engine/v1.md");
    expect(FILES.length).toBeGreaterThan(30);
  });

  it("points only to files that exist", () => {
    const dead: string[] = [];
    for (const file of FILES) {
      for (const match of readFileSync(join(ROOT, file), "utf8").matchAll(LINK)) {
        const target = match[1] ?? "";
        if (/^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
        if (!existsSync(join(ROOT, normalize(join(dirname(file), target))))) dead.push(`${file} → ${target}`);
      }
    }
    expect(dead).toEqual([]);
  });
});
