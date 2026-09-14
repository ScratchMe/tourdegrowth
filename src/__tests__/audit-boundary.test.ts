import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * AUDIT.md §5 — the audit instrument is browser-only and file-based, and the
 * numbers it holds are an employer's. Two things must stay true, and both are
 * the kind that a later refactor breaks without noticing:
 *
 * 1. Nothing under `lib/audit/` (nor the catalog) reaches Firestore, Gemini,
 *    the analytics wrapper or the submissions layer. A mission never becomes
 *    a document, an event or a prompt.
 * 2. Nothing OUTSIDE the instrument imports it: the public app must not pull
 *    the catalog (39 rows of French prose) into a bundle, and no route but
 *    `/admin/audit` may touch a mission. The allow-list is the instrument's
 *    own directory, its tests, and the admin route that will host it.
 *
 * 3. The island of `/admin/audit` does not REACH the catalog, however many
 *    hops away. Rules 1 and 2 only look at direct imports; R2-14 showed
 *    three separate paths that brought the dictionary back into a bundle
 *    after it had supposedly been taken out, and none of them was a direct
 *    import. So this one walks.
 *
 * Same method as `client-bundles.test.ts`: import specifiers, read from the
 * real files, so the rule fails a build instead of surviving as a comment.
 */
const SRC = join(process.cwd(), "src");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

const FILES = walk(SRC).map((full) => ({ path: relative(SRC, full).replaceAll("\\", "/"), source: readFileSync(full, "utf8") }));
const INSTRUMENT = FILES.filter((f) => f.path.startsWith("lib/audit/") || f.path === "content/audit-catalog.ts");
const IMPORTS = (source: string) => [...source.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]!);

const FORBIDDEN_INSIDE = [
  /^@\/lib\/firebase/,
  /^firebase-admin/,
  /^@\/lib\/gemini/,
  /^@\/lib\/analytics/,
  /^@\/lib\/submissions/,
  /^@\/lib\/i18n\/dictionary$/,
  /^next(\/|$)/,
  /^@vercel/,
];

const ALLOWED_IMPORTERS = [/^lib\/audit\//, /^content\/audit-catalog\.ts$/, /^content\/__tests__\/audit-catalog\.test\.ts$/, /^app\/\(app\)\/admin\/audit\//, /^__tests__\//];

const BY_PATH = new Map(FILES.map((f) => [f.path, f.source]));

/**
 * Import specifiers that survive compilation. `import type { X } from "y"`
 * is erased by TypeScript and never reaches the bundler, so it is NOT an
 * edge for this walk — that is exactly how `lib/audit` keeps the catalog's
 * row type while leaving its 39 rows of prose on the server.
 */
function valueImports(source: string): string[] {
  return [...source.matchAll(/(^|\n)\s*(?:import|export)(\s+type)?\s[^;]*?from\s+["']([^"']+)["']/g)]
    .filter((m) => !m[2])
    .map((m) => m[3]!);
}

/** A specifier resolved to a repo path under `src/`, or null when it leaves the repo. */
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

/** Every module the given entry points reach through value imports. */
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

describe("audit instrument boundary (AUDIT.md §5)", () => {
  it("the instrument exists and is not empty — otherwise the rules below pass vacuously", () => {
    expect(INSTRUMENT.filter((f) => !f.path.includes("__tests__")).length).toBeGreaterThanOrEqual(7);
  });

  it("nothing under lib/audit or the catalog imports Firebase, Gemini, analytics, submissions, the dictionary or Next", () => {
    const offenders = INSTRUMENT.flatMap((f) =>
      IMPORTS(f.source)
        .filter((spec) => FORBIDDEN_INSIDE.some((re) => re.test(spec)))
        .map((spec) => `${f.path} → ${spec}`),
    );
    expect(offenders).toEqual([]);
  });

  it("nothing outside the instrument (and its future admin route) imports it", () => {
    const offenders = FILES.filter((f) => !ALLOWED_IMPORTERS.some((re) => re.test(f.path))).flatMap((f) =>
      IMPORTS(f.source)
        .filter((spec) => /^@\/lib\/audit(\/|$)/.test(spec) || /^@\/content\/audit-catalog$/.test(spec))
        .map((spec) => `${f.path} → ${spec}`),
    );
    expect(offenders).toEqual([]);
  });

  it("the island exists — otherwise the transitive walk below has nothing to walk", () => {
    expect(BY_PATH.has("app/(app)/admin/audit/AuditWorkbench.tsx")).toBe(true);
  });

  /**
   * The rule that AUDIT-PLAN.md §3.4/1.1 exists for: whatever the island
   * ends up importing, no chain of value imports from it may land in
   * `content/`. `lib/audit/server.ts` is the one module of the instrument
   * that reads content, and the island must never reach it — the Server
   * Component calls it and passes props down.
   *
   * Non-vacuity: add `import { AUDIT_CATALOG } from "@/content/audit-catalog"`
   * to AuditWorkbench.tsx and this test names it.
   */
  it("nothing the island reaches, at any depth, is under content/", () => {
    const reached = reachable(["app/(app)/admin/audit/AuditWorkbench.tsx"]);
    expect([...reached].filter((p) => p.startsWith("content/")).sort()).toEqual([]);
  });

  it("the walk follows value imports and ignores erased type-only ones", () => {
    // lib/audit/server.ts DOES read the catalog — it is the designated
    // server-side module — so the walk must find it from there. If this
    // fails, the walk is not walking and the test above proves nothing.
    expect([...reachable(["lib/audit/server.ts"])]).toContain("content/audit-catalog.ts");
    // schema.ts names the catalog's row type with `import type`, which the
    // compiler erases — so it must NOT count as an edge.
    expect(BY_PATH.get("lib/audit/schema.ts")).toMatch(/import type \{ AuditCatalogRow \}/);
    expect([...reachable(["lib/audit/schema.ts"])]).not.toContain("content/audit-catalog.ts");
  });

  /**
   * VALUE imports only. A Client Component naming `AuditCatalogRow` to type
   * a prop it receives is exactly the shape this architecture wants, and the
   * compiler erases that import — the 39 rows never reach the browser. The
   * bundle rule is the transitive walk above; this one stays as the direct,
   * fast-failing statement of the same intent.
   */
  it("no Client Component imports a catalog VALUE — the server resolves rows and passes props", () => {
    const offenders = FILES.filter(
      (f) => /^\s*["']use client["'];?/m.test(f.source.split("\n").slice(0, 3).join("\n")) && valueImports(f.source).some((spec) => /^@\/content\/audit-catalog$/.test(spec)),
    ).map((f) => f.path);
    expect(offenders).toEqual([]);
  });
});
