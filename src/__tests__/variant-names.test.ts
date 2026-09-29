import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Design audit S-16 (CHANTIERS.md A5, 2026-09-29): one word per axis. `size`
 * says the scale and nothing else — `xs`, `sm`, `md`, `lg`, or `auto` — and
 * the red of a diagnosis is `alert`, never `red`. The table, with where every
 * retired name went, is in `.design-sync/conventions.md` (« Variant names »).
 *
 * The migration goes one family of components per PR. PENDING is what has
 * not moved yet, by file: it may only shrink, and it may not name a word a
 * file no longer has — a family that moves takes its line out here.
 *
 * Non-vacuity (2026-09-29): `size?: "desktop" | "mobile"` put back on
 * AnswerOption fails the first test; `QuestionCard` added to PENDING with a
 * word it does not have fails the last.
 */

const COMPONENTS = join(process.cwd(), "src", "components");
const SCALE = new Set(["xs", "sm", "md", "lg", "auto"]);

// Empty since the four families moved (2026-09-29). A component that comes
// in with a retired name is renamed, not listed.
const PENDING: Record<string, readonly string[]> = {};

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : name.endsWith(".tsx") ? [full] : [];
  });

const words = (union: string) => [...union.matchAll(/"([a-zA-Z-]+)"/g)].map((m) => m[1]!);

/** Every word a component's `size` / `tone` props can take, aliases resolved (`size?: Size`, `type Size = …`). */
function variants(source: string, prop: "size" | "tone"): string[] {
  const found: string[] = [];
  for (const m of source.matchAll(new RegExp(`\\b${prop}\\??:\\s*((?:"[a-zA-Z-]+"\\s*\\|\\s*)*"[a-zA-Z-]+"|[A-Z]\\w*)\\s*;`, "g"))) {
    const value = m[1]!;
    if (value.startsWith('"')) found.push(...words(value));
    else found.push(...words(source.match(new RegExp(`type ${value} = ([^;]+);`))?.[1] ?? ""));
  }
  return found;
}

const FILES = walk(COMPONENTS).map((file) => {
  const source = readFileSync(file, "utf8");
  return {
    name: relative(COMPONENTS, file).split("\\").join("/"),
    size: variants(source, "size"),
    tone: variants(source, "tone"),
    compactFlag: /\bcompact\?:\s*boolean/.test(source),
  };
});

describe("variant names: one word per axis (S-16)", () => {
  it("`size` says the scale, and nothing else", () => {
    const withSize = FILES.filter((f) => f.size.length > 0);
    expect(withSize.length).toBeGreaterThanOrEqual(15);
    const offending = withSize.flatMap((f) =>
      f.size.filter((w) => !SCALE.has(w) && !PENDING[f.name]?.includes(w)).map((w) => `${f.name}: size "${w}"`),
    );
    expect(offending).toEqual([]);
  });

  it("the red of a diagnosis is `alert`, never `red`", () => {
    const offending = FILES.filter((f) => f.tone.includes("red") && !PENDING[f.name]?.includes("red")).map((f) => f.name);
    expect(offending).toEqual([]);
  });

  it("a smaller size is `size`, not a `compact` flag beside it", () => {
    const offending = FILES.filter((f) => f.compactFlag && !PENDING[f.name]?.includes("compact flag")).map((f) => f.name);
    expect(offending).toEqual([]);
  });

  it("PENDING names only what is still there, so it shrinks as each family moves", () => {
    const stale = Object.entries(PENDING).flatMap(([name, list]) => {
      const file = FILES.find((f) => f.name === name);
      if (!file) return [`${name}: no such component`];
      return list
        .filter((w) => (w === "compact flag" ? !file.compactFlag : !file.size.includes(w) && !file.tone.includes(w)))
        .map((w) => `${name}: "${w}" has already moved`);
    });
    expect(stale).toEqual([]);
  });
});
