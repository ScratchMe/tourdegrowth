import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * A page stylesheet belongs to its page — ds-critique M-9, 2026-09-24.
 *
 * `how-it-works/page.module.css` had become the frame of seven other pages
 * (About, the comparisons, the two open-door pages, the legal pages, /metrics),
 * each importing it across folders and patching it with an `h1.title`
 * override of its own. A page stylesheet used as a component is invisible to
 * design-sync, so Claude Design could not reuse the pattern; and a change to
 * How it works silently restyled seven pages nobody was looking at. The frame
 * is `components/brand/ProsePage` now.
 *
 * The rule, checked on every import of a `page.module.css` under `src/`: it
 * must resolve to the importing file's own folder. The landing's PreviewCard
 * and the audit tool's screens share their route's stylesheet from the same
 * folder, which is what a route-local stylesheet is for.
 */
const SRC = join(process.cwd(), "src");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.tsx?$/.test(name) ? [full] : [];
  });
}

const PAGE_STYLES_IMPORT = /from\s+["']([^"']*page\.module\.css)["']/g;

function pageStyleImports(): { file: string; target: string; local: boolean }[] {
  return walk(SRC).flatMap((file) => {
    const source = readFileSync(file, "utf8");
    return [...source.matchAll(PAGE_STYLES_IMPORT)].map((m) => {
      const spec = m[1]!;
      const target = spec.startsWith("@/") ? join(SRC, spec.slice(2)) : resolve(dirname(file), spec);
      return {
        file: relative(SRC, file),
        target: relative(SRC, target),
        local: dirname(target) === dirname(file),
      };
    });
  });
}

describe("page stylesheets stay with their page (ds-critique M-9)", () => {
  const imports = pageStyleImports();

  it("finds the route-local imports it is supposed to allow", () => {
    // Non-vacuity: a pattern that silently matched nothing would pass below.
    expect(imports.length).toBeGreaterThan(10);
    expect(imports.some((i) => i.file.endsWith("PreviewCard.tsx") && i.local)).toBe(true);
  });

  it("no file imports another folder's page.module.css", () => {
    const crossed = imports.filter((i) => !i.local).map((i) => `${i.file} → ${i.target}`);
    expect(crossed).toEqual([]);
  });
});
