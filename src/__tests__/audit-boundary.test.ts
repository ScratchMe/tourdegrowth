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

  it("no Client Component imports the catalog — the server resolves rows and passes props", () => {
    const offenders = FILES.filter(
      (f) => /^\s*["']use client["'];?/m.test(f.source.split("\n").slice(0, 3).join("\n")) && IMPORTS(f.source).some((spec) => /^@\/content\/audit-catalog$/.test(spec)),
    ).map((f) => f.path);
    expect(offenders).toEqual([]);
  });
});
