import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import type { NextConfig } from "next";
import { describe, expect, it } from "vitest";

// A JS module in a `allowJs: false` project: the specifier is widened to
// `string` so the import is untyped, then narrowed to Next's own config type.
const nextConfig = (await import("../../next.config.mjs" as string)).default as NextConfig;

/**
 * `sharp` stays out of the serverless function — 2026-09-13.
 *
 * The Hobby plan caps Functions Storage (the summed size of every retained
 * deployment's function bundles) at 10 GB; this project stood at 9.24 GB.
 * Three quarters of each bundle was `sharp` and its libvips builds, traced in
 * for `next/image`, which this app has never used. `next.config.mjs` states
 * the intent (`images.unoptimized`) and removes the bytes
 * (`outputFileTracingExcludes`); this test keeps both, and keeps `next/image`
 * out of `src/`, so that reintroducing the optimiser is a decision that
 * re-reads that comment rather than a 48 MB accident per deployment.
 */
const SRC = join(process.cwd(), "src");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

describe("next.config.mjs keeps sharp out of the function bundle", () => {
  it("declares images unoptimized — there is no /_next/image route to serve", () => {
    expect(nextConfig.images?.unoptimized).toBe(true);
  });

  it("excludes sharp and its native builds from output file tracing, for every route", () => {
    const excludes = nextConfig.outputFileTracingExcludes?.["*"] ?? [];
    expect(excludes.some((glob) => /node_modules\/sharp\//.test(glob))).toBe(true);
    expect(excludes.some((glob) => /node_modules\/@img\//.test(glob))).toBe(true);
  });

  it("excludes the Edge build of the OG renderer, which nothing here can reach", () => {
    const excludes = nextConfig.outputFileTracingExcludes?.["*"] ?? [];
    expect(excludes.some((glob) => /@vercel\/og\/index\.edge\.js/.test(glob))).toBe(true);
  });

  it("no route opts into the Edge runtime — the condition that makes that exclude safe", () => {
    const offenders = walk(SRC)
      .filter((full) => /export\s+const\s+runtime\s*=\s*["']edge["']/.test(readFileSync(full, "utf8")))
      .map((full) => relative(SRC, full));
    expect(offenders).toEqual([]);
  });

  it("nothing under src/ imports next/image", () => {
    const offenders = walk(SRC)
      .filter((full) => /from\s+["']next\/image["']/.test(readFileSync(full, "utf8")))
      .map((full) => relative(SRC, full));
    expect(offenders).toEqual([]);
  });
});
