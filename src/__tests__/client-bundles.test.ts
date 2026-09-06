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
