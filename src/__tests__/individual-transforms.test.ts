import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Audit du kit §6 (CHANTIERS.md A4, 2026-09-29): stamps and their settle.
 *
 * - A tilt at rest is written with the individual `rotate` property, and the
 *   two shared keyframes (`stamp`, `slam`) animate individual properties only,
 *   so one keyframe composes with any stamp's own tilt instead of overriding
 *   it — `transform` in a keyframe replaces the element's whole transform.
 * - The stamp's overshoot is `linear()`, the old cubic-bezier sampled, with
 *   how far it goes past its mark in one token, --stamp-overshoot.
 *
 * Non-vacuity (2026-09-29): the landing's bib tag put back on
 * `transform: rotate(-2deg)` fails the first test on that line; `transform`
 * put back in `@keyframes stamp` fails the second; the 50 % stop written as
 * the number 1.053 instead of reading --stamp-overshoot fails the last two.
 */

const SRC = join(process.cwd(), "src");
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : name.endsWith(".css") ? [full] : [];
  });
const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");
const SHEETS = walk(SRC);

describe("stamps turn with `rotate`, never with a transform that would override one", () => {
  it("no resting tilt is a `transform: rotate(…)`", () => {
    expect(SHEETS.length).toBeGreaterThan(80);
    const tilts: string[] = [];
    let rotates = 0;
    for (const file of SHEETS) {
      const css = strip(readFileSync(file, "utf8"));
      rotates += [...css.matchAll(/(?<![-\w])rotate:\s*-?[\d.]+deg/g)].length;
      for (const m of css.matchAll(/(?<![-\w])transform:\s*rotate\([^)]*\)\s*;/g)) tilts.push(`${relative(process.cwd(), file)}: ${m[0]}`);
    }
    // Non-vacuity: the stamps do tilt — nine of them, written the right way.
    expect(rotates).toBeGreaterThanOrEqual(9);
    expect(tilts).toEqual([]);
  });

  it("the shared stamp keyframes animate individual properties only", () => {
    const motion = strip(readFileSync(join(SRC, "styles", "motion.module.css"), "utf8"));
    for (const name of ["stamp", "slam"]) {
      const body = motion.match(new RegExp(`@keyframes ${name} \\{([\\s\\S]*?)\\n\\}`))?.[1];
      expect(body, name).toBeDefined();
      expect(body, name).toMatch(/\bscale:/);
      expect(body, name).not.toMatch(/\btransform:/);
    }
  });
});

describe("the stamp's overshoot is one token (linear())", () => {
  const tokens = strip(readFileSync(join(SRC, "styles", "tokens", "motion.css"), "utf8"));
  const ease = tokens.match(/--ease-stamp:\s*([^;]+);/)?.[1] ?? "";

  it("--ease-stamp is linear(), and every stop past 30 % reads --stamp-overshoot", () => {
    expect(ease.trim().startsWith("linear(")).toBe(true);
    const stops = ease.replace(/^\s*linear\(|\)\s*$/g, "").split(/,(?![^()]*\))/).map((x) => x.trim());
    expect(stops.length).toBeGreaterThan(10);
    const past = stops.filter((stop) => {
      const at = Number(stop.match(/([\d.]+)%$/)?.[1] ?? NaN);
      return at > 30;
    });
    expect(past.length).toBeGreaterThanOrEqual(6);
    for (const stop of past) expect(stop, stop).toContain("var(--stamp-overshoot)");
  });

  it("peaks where the DESIGN-BRIEF's cubic-bezier(.2,1.4,.4,1) peaked: 5.3 % past its mark, half-way", () => {
    const overshoot = Number(tokens.match(/--stamp-overshoot:\s*([\d.]+);/)?.[1]);
    expect(overshoot).toBeCloseTo(0.053, 3);
    expect(ease).toMatch(/calc\(1 \+ var\(--stamp-overshoot\)\) 50%/);
  });
});
