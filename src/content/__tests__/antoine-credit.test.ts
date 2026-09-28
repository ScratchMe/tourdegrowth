import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ANTOINE_LINKS, cvUrl } from "../antoine-credit";

/**
 * SEO lot 6 (2026-09-28) — a visible link to the CV opens it in the language
 * of the page it sits on; the identity in the structured data does not move.
 */
describe("cvUrl", () => {
  it("opens the English CV from an English page and leaves the French address bare", () => {
    expect(cvUrl("en")).toBe("https://cv.antoine.berthaud.me/en/");
    expect(cvUrl("fr")).toBe(ANTOINE_LINKS.cv);
    expect(ANTOINE_LINKS.cv).toBe("https://cv.antoine.berthaud.me");
  });

  /**
   * The Deep dive credit card cannot be rendered end to end (the sample
   * result has no Deep dive, and CI has no Firestore), so this is what keeps
   * its link — and any link added tomorrow — on `cvUrl`: no component or
   * page may point at the bare CV address. Only the identity builders
   * (`lib/seo/jsonld.tsx`, `lib/i18n/meta.ts`) read it, and they are `.ts`
   * logic, not markup. Counted on code with comments stripped.
   *
   * Non-vacuity (2026-09-28): putting `href={ANTOINE_LINKS.cv}` back on the
   * Deep dive card fails it, naming ResultView.tsx.
   */
  it("no component or page links the bare CV address — visible links go through cvUrl", () => {
    const tsx: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) walk(path);
        else if (path.endsWith(".tsx")) tsx.push(path);
      }
    };
    walk(join(__dirname, "..", ".."));
    expect(tsx.length).toBeGreaterThan(50);
    const offenders = tsx.filter((path) => {
      const code = readFileSync(path, "utf8").replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");
      return /ANTOINE_LINKS\.cv\b/.test(code) && !path.endsWith(join("lib", "seo", "jsonld.tsx"));
    });
    expect(offenders).toEqual([]);
  });
});
