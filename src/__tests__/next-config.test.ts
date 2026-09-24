import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import type { NextConfig } from "next";
import { describe, expect, it } from "vitest";
import { GAME_OPEN_AT_BUILD_ENV, gameOpenWith } from "@/lib/game/build-flag";

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

/**
 * The game's build-time flag (GAME-BRIEF.md 13.1) is decided twice: once in
 * `next.config.mjs`, which inlines it for the footer, and once in
 * `lib/game/build-flag.ts`, which the sitemap and the game pages read. The
 * config cannot import the TypeScript module, so this test is what keeps the
 * two to one answer — re-evaluating the config for each value of the variable.
 */
describe("next.config.mjs inlines the game's build flag with the same rule as build-flag.ts", () => {
  async function configWith(value: string | undefined): Promise<NextConfig> {
    const previous = process.env.GAME_ENABLED;
    if (value === undefined) delete process.env.GAME_ENABLED;
    else process.env.GAME_ENABLED = value;
    try {
      // A fresh query string is a fresh module instance, so the top-level
      // `process.env` read runs again under the value just set.
      const specifier = `../../next.config.mjs?game=${encodeURIComponent(String(value))}` as string;
      return (await import(specifier)).default as NextConfig;
    } finally {
      if (previous === undefined) delete process.env.GAME_ENABLED;
      else process.env.GAME_ENABLED = previous;
    }
  }

  for (const value of ["true", undefined, "", "TRUE", "1", "yes", "true "]) {
    it(`GAME_ENABLED=${JSON.stringify(value)}`, async () => {
      const config = await configWith(value);
      expect(config.env?.[GAME_OPEN_AT_BUILD_ENV]).toBe(gameOpenWith(value) ? "1" : "0");
    });
  }

  it("never exposes GAME_ENABLED itself to the client bundles", () => {
    expect(Object.keys(nextConfig.env ?? {})).not.toContain("GAME_ENABLED");
  });
});
