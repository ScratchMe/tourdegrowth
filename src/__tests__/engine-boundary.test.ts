import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Engine spec §11.4 — the growth engine's boundary, rules 1-3 and 6. (Rule 4,
 * no static `html-to-image` import, lands with the deck; rule 5, the closed
 * analytics vocabulary, with the analytics wiring.)
 *
 * The promise the page makes in writing (D16) is that no number and no text
 * the user types leaves the browser. A canary spec proves it end to end once
 * the screens exist; these static rules make it hold for every commit before
 * then, and they fail a build instead of surviving as a comment:
 *
 * 1. Nothing under `lib/engine/` nor the engine's route imports Firebase,
 *    Gemini, the submissions layer, the audit instrument, the OG pipeline or
 *    the dictionary — and `lib/engine` imports no content VALUE at all: it is
 *    pure and browser-side, the page resolves copy and passes props.
 * 2. The island reaches none of that transitively, however many hops away —
 *    R2-14 found three separate paths that brought the dictionary back into
 *    a bundle after it had supposedly been taken out, none of them direct.
 * 3. No network or form primitive is written anywhere in the engine's code.
 * 6. The rules are not vacuous: the island exists and the walk walks.
 *
 * Same method as `audit-boundary.test.ts`: import specifiers read from the
 * real files, value imports only (`import type` is erased by the compiler).
 */
const SRC = join(process.cwd(), "src");
const ISLAND = "app/[locale]/aarrr-funnel-template/EngineWorkbench.tsx";

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

const FILES = walk(SRC).map((full) => ({ path: relative(SRC, full).replaceAll("\\", "/"), source: readFileSync(full, "utf8") }));
const BY_PATH = new Map(FILES.map((f) => [f.path, f.source]));

/** The engine's shipped code: its pure library and its route. Tests are not shipped. */
const ENGINE = FILES.filter(
  (f) =>
    (f.path.startsWith("lib/engine/") || f.path.startsWith("app/[locale]/aarrr-funnel-template/")) &&
    !f.path.includes("__tests__/"),
);

const FORBIDDEN = [
  /^@\/lib\/firebase/,
  /^firebase(-admin)?(\/|$)/,
  /^@\/lib\/gemini/,
  /^@\/lib\/submissions/,
  /^@\/lib\/audit(\/|$)/,
  /^@\/content\/audit-catalog$/,
  /^@\/lib\/og(\/|$)/,
  /^@\/lib\/i18n\/dictionary$/,
];

/** Modules the island must never reach: content, and the scoring modules that pull the copy library in (§6). */
const UNREACHABLE = [
  /^content\//,
  /^lib\/scoring\/(score|questions|bottleneck|verdict|next-move)\.ts$/,
  /^app\/\[locale\]\/aarrr-funnel-template\/engine-props\.ts$/,
];

/** Every specifier, type-only included — for the "never imported at all" rule. */
const ALL_IMPORTS = (source: string) => [...source.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]!);

/** Specifiers that survive compilation: `import type` / `export type` are erased and are not edges. */
function valueImports(source: string): string[] {
  return [...source.matchAll(/(^|\n)\s*(?:import|export)(\s+type)?\s[^;]*?from\s+["']([^"']+)["']/g)]
    .filter((m) => !m[2])
    .map((m) => m[3]!);
}

function resolveSpecifier(fromPath: string, spec: string): string | null {
  let base: string;
  if (spec.startsWith("@/")) base = spec.slice(2);
  else if (spec.startsWith(".")) {
    const dir = fromPath.split("/").slice(0, -1);
    for (const part of spec.split("/")) {
      if (part === ".") continue;
      else if (part === "..") dir.pop();
      else dir.push(part);
    }
    base = dir.join("/");
  } else return null; // a package — not our source tree
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]) {
    if (BY_PATH.has(candidate)) return candidate;
  }
  return null;
}

function reachable(entries: string[]): Set<string> {
  const seen = new Set<string>();
  const queue = [...entries];
  while (queue.length) {
    const current = queue.pop()!;
    if (seen.has(current)) continue;
    seen.add(current);
    const source = BY_PATH.get(current);
    if (!source) continue;
    for (const spec of valueImports(source)) {
      const resolved = resolveSpecifier(current, spec);
      if (resolved && !seen.has(resolved)) queue.push(resolved);
    }
  }
  return seen;
}

/** Comments name the primitives they forbid; only code counts. */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
}

/** Rule 3's primitives: every way a browser page can send something somewhere. */
const NETWORK = [/\bfetch\s*\(/, /\bXMLHttpRequest\b/, /\bsendBeacon\b/, /\bWebSocket\b/, /\bEventSource\b/, /<form[\s>]/, /\bnew\s+Image\s*\(/];

/**
 * A floor on how much the walk from the island covers. 1 today: the island is
 * the P0 skeleton and imports nothing of ours by value yet. The spec's rule 6
 * asks for ≥ 10 once the screens exist — P4 raises this constant in the PR
 * that wires them, so a walk that silently stops walking goes red.
 */
const MIN_ISLAND_MODULES = 1;

describe("growth engine boundary (engine spec §11.4)", () => {
  it("rule 6 — the engine's code exists and the island is where the spec puts it", () => {
    expect(ENGINE.filter((f) => f.path.startsWith("lib/engine/")).length).toBeGreaterThanOrEqual(4);
    expect(BY_PATH.has(ISLAND), ISLAND).toBe(true);
    expect(BY_PATH.get(ISLAND)!, "the island must be a Client Component").toMatch(/^\s*["']use client["']/);
  });

  it("rule 6 — the walk follows value imports and ignores erased type-only ones", () => {
    // The page DOES resolve the copy on the server, through engine-props.ts:
    // if the walk can't find that chain, rule 2 below proves nothing.
    const fromPage = reachable(["app/[locale]/aarrr-funnel-template/page.tsx"]);
    expect([...fromPage]).toContain("content/engine-copy.ts");
    expect([...fromPage]).toContain("content/engine-catalog.ts");
    // strings.ts names ENGINE_COPY's shape with `import type`: erased, not an edge.
    expect(BY_PATH.get("lib/engine/strings.ts")).toMatch(/import type \{ ENGINE_COPY \}/);
    expect([...reachable(["lib/engine/strings.ts"])]).not.toContain("content/engine-copy.ts");
    // And the island's own walk covers at least the floor.
    expect(reachable([ISLAND]).size).toBeGreaterThanOrEqual(MIN_ISLAND_MODULES);
  });

  it("rule 1 — nothing in the engine imports Firebase, Gemini, submissions, the audit instrument, the OG pipeline or the dictionary", () => {
    const offenders = ENGINE.flatMap((f) =>
      ALL_IMPORTS(f.source)
        .filter((spec) => FORBIDDEN.some((re) => re.test(spec)))
        .map((spec) => `${f.path} → ${spec}`),
    );
    expect(offenders).toEqual([]);
  });

  it("rule 1 — lib/engine imports no content value: it is pure, the page resolves copy and passes props", () => {
    const offenders = ENGINE.filter((f) => f.path.startsWith("lib/engine/")).flatMap((f) =>
      valueImports(f.source)
        .filter((spec) => spec.startsWith("@/content/"))
        .map((spec) => `${f.path} → ${spec}`),
    );
    expect(offenders).toEqual([]);
  });

  /**
   * Non-vacuity, measured when this rule was written: add
   * `import { ENGINE_COPY } from "@/content/engine-copy"` to the island and
   * this test names content/engine-copy.ts; import `./engine-props` instead
   * and it names engine-props.ts AND the three content modules behind it.
   */
  it("rule 2 — nothing the island reaches, at any depth, is content, a copy-pulling scoring module, or the server-side resolver", () => {
    const reached = [...reachable([ISLAND])];
    expect(reached.filter((p) => UNREACHABLE.some((re) => re.test(p))).sort()).toEqual([]);
  });

  it("rule 3 — no network or form primitive is written in the engine's code", () => {
    const offenders = ENGINE.flatMap((f) => {
      const code = stripComments(f.source);
      return NETWORK.filter((re) => re.test(code)).map((re) => `${f.path} → ${re}`);
    });
    expect(offenders).toEqual([]);
  });

  it("the flag has one reader: only lib/engine/access.ts reads ENGINE_ENABLED", () => {
    const readers = FILES.filter(
      (f) => !f.path.includes("__tests__/") && /process\.env\.ENGINE_ENABLED|process\.env\[["']ENGINE_ENABLED["']\]/.test(f.source),
    ).map((f) => f.path);
    expect(readers).toEqual(["lib/engine/access.ts"]);
  });
});
