import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * REVIEW-02.md R2-14 — a static guard over what Client Components import.
 *
 * Two modules are big and server-only by intent: `lib/i18n/dictionary.ts`
 * (the whole bilingual UI copy) and `content/glossary.ts` (the long-form
 * glossary). A `"use client"` file that imports either ships it to the
 * browser — and, worse, so does a Server Component imported BY a client
 * one (`SiteFooter` inside the error boundary, the day R2-23 landed, put
 * the dictionary back into all 36 content pages an hour after R2-14 took
 * it out). This test makes that a red build instead of a chunk to grep.
 *
 * The allow-list is the set of screens that genuinely need the dictionary
 * on the client: the two questionnaires and the result page. Adding to it
 * is a decision, not a fix.
 */
const SRC = join(process.cwd(), "src");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return name === "__tests__" ? [] : walk(full);
    return /\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [full] : [];
  });
}

const FILES = walk(SRC).map((full) => ({ path: relative(SRC, full), source: readFileSync(full, "utf8") }));
const CLIENT = FILES.filter((f) => /^\s*["']use client["'];?/m.test(f.source.split("\n").slice(0, 3).join("\n")));

const DICTIONARY_ALLOWED_ON_CLIENT = new Set([
  "app/(app)/quiz/page.tsx",
  "app/(app)/quiz/ToneSelector.tsx",
  "app/(app)/deep-dive/[id]/page.tsx",
  "app/(app)/r/[id]/ResultView.tsx",
  "app/(app)/r/[id]/ScoreBreakdown.tsx",
  "components/quiz/LoadingScreen.tsx",
]);

describe("client bundles (REVIEW-02.md R2-14)", () => {
  it("no Client Component outside the questionnaire and result screens imports the dictionary", () => {
    const offenders = CLIENT.filter(
      (f) => /from ["']@\/lib\/i18n\/dictionary["']/.test(f.source) && !DICTIONARY_ALLOWED_ON_CLIENT.has(f.path),
    ).map((f) => f.path);
    expect(offenders).toEqual([]);
  });

  it("nothing under components/ imports the server-side glossary", () => {
    const offenders = FILES.filter(
      (f) => f.path.startsWith("components/") && /from ["']@\/content\/glossary(-deep)?["']/.test(f.source),
    ).map((f) => f.path);
    expect(offenders).toEqual([]);
  });

  it("the footer and the error screen — rendered inside every page's error boundary — import neither", () => {
    for (const path of ["components/brand/SiteFooter.tsx", "components/brand/ErrorScreen.tsx", "app/global-error.tsx"]) {
      const file = FILES.find((f) => f.path === path);
      expect(file, path).toBeDefined();
      expect(file!.source, path).not.toMatch(/from ["']@\/lib\/i18n\/dictionary["']/);
      expect(file!.source, path).not.toMatch(/from ["']@\/content\/glossary(-deep)?["']/);
    }
  });

  it("the sanity check of this test: the allow-list only names files that exist and are client components", () => {
    for (const path of DICTIONARY_ALLOWED_ON_CLIENT) {
      expect(CLIENT.some((f) => f.path === path), path).toBe(true);
    }
  });
});

/**
 * The same idea one layer out: a *declared* prop type is not a boundary.
 *
 * `ResultView` declares `pillars` as `{pillar, score}[]`, but TypeScript
 * accepts a wider object outside an object literal, so passing the stored
 * `PillarScore[]` (which also carries `rawPoints`) compiled cleanly and RSC
 * serialised the extra field into every public result payload. The fix is
 * `toPillarViews`; this is what stops it coming back, since no e2e can see
 * it — `/r/sample` has no `rawPoints` by construction and a real submission
 * needs Firestore, which CI does not have.
 */
describe("the result payload keeps stored-only fields on the server", () => {
  const RESULT_PAGE = "app/(app)/r/[id]/page.tsx";

  /** Comments quote `submission.pillars` to explain the rule; only code counts. */
  function code(source: string): string {
    return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
  }

  it("never reads the stored pillars except through the view model", () => {
    const page = FILES.find((f) => f.path === RESULT_PAGE);
    expect(page, `${RESULT_PAGE} not found — was it moved?`).toBeDefined();

    const source = code(page!.source);
    const uses = source.match(/submission\.pillars/g) ?? [];
    const narrowed = source.match(/toPillarViews\(submission\.pillars\)/g) ?? [];

    // The first version of this guard asserted `pillars={toPillarViews(` and
    // nothing more, so it passed while `bottleneck={resolveBottleneck(
    // submission.pillars)}` on the next line put `rawPoints` back into the
    // payload — `resolveBottleneck` is generic and returns the objects it is
    // handed. Per-prop assertions can only ever cover the props that already
    // exist; this covers the ones that don't yet. Every read of the stored
    // array has to go through the narrowing, wherever it is and whatever it
    // feeds — `generateMetadata` reads it too, and only ever needs a name.
    expect(uses.length, "the result page must read submission.pillars at least once").toBeGreaterThan(0);
    expect(narrowed, "every read of submission.pillars must be wrapped in toPillarViews").toHaveLength(uses.length);
    expect(source).toMatch(/const pillars = toPillarViews\(submission\.pillars\)/);
  });
});
