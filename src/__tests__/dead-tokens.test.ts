import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Design audit A1.6 (2026-09-29): --width-mobile and --texture-spray-strong
 * were declared, transcribed from the bundle, and read by nothing. A token
 * nothing reads is worse than none: the contrast tests measure it, Claude
 * Design receives it as part of the system, and the next person reaches for
 * it believing it is in use. Every token a stylesheet declares is now read
 * somewhere under src/ — or listed below, with the reason it waits.
 *
 * Non-vacuity (2026-09-29): putting --width-mobile back fails the second
 * test on that name alone. A listed token that gains a reader fails the
 * third, so the allowance cannot outlive its reason.
 */

const SRC = join(process.cwd(), "src");
const TOKENS = join(SRC, "styles", "tokens");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.(css|tsx?)$/.test(name) ? [full] : [];
  });
}

const WAITING: Record<string, string> = {
  "--surface-desk":
    "kept out of use on purpose (L-10): --text-muted clears AA on it by 0.005, and token-contrast.test.ts forbids a reader until one re-measures",
  "--state-warn-text":
    "the middle of the status triplet (good · warn · bad), measured in both worlds by the contrast tests; no screen says « warn » yet",
};
// The categorical and sequential chart scales: A2.2 (CHANTIERS.md) decides
// whether the dot grid uses them, or whether they go.
for (let i = 1; i <= 5; i++) {
  WAITING[`--viz-cat-${i}`] = "chart scale, waiting on A2.2";
  WAITING[`--viz-seq-${i}`] = "chart scale, waiting on A2.2";
  WAITING[`--viz-seq-${i}-text`] = "chart scale, waiting on A2.2";
}

const sheets = readdirSync(TOKENS).filter((f) => f.endsWith(".css"));
const declared = new Map<string, string>();
for (const sheet of sheets) {
  const css = readFileSync(join(TOKENS, sheet), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  for (const m of css.matchAll(/(?:^|[;{\s])(--[a-z0-9-]+)\s*:/g)) declared.set(m[1]!, sheet);
}

const corpus = walk(SRC)
  .filter((f) => !f.includes("__tests__"))
  .map((f) => readFileSync(f, "utf8"))
  .join("\n");
const isRead = (name: string) => new RegExp(`var\\(\\s*${name.replace(/-/g, "\\-")}(?![\\w-])`).test(corpus);

describe("every token has a reader (design audit A1.6)", () => {
  it("reads the real token sheets", () => {
    expect(sheets.map((s) => basename(s))).toEqual(expect.arrayContaining(["colors.css", "shape.css", "spacing.css", "typography.css"]));
    expect(declared.size).toBeGreaterThan(200);
  });

  it("declares no token that nothing reads", () => {
    const dead = [...declared.keys()].filter((name) => !isRead(name) && !(name in WAITING));
    expect(dead).toEqual([]);
  });

  it("the waiting list holds only tokens that are still unread", () => {
    expect(Object.keys(WAITING).filter((name) => !declared.has(name) || isRead(name))).toEqual([]);
  });
});
