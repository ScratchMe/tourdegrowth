import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Game plan X22 — no color literal in the game's components or pages.
 *
 * The game lives in two worlds and two islands (world-night.css, game.css),
 * and every color it paints must come from one of them: a literal written in
 * a component is a color no world can rebind (the December "back to paper"
 * would leave it behind) and no contrast test has measured. The prototype
 * this game comes from had dozens; this is what keeps the port from
 * re-growing them. A missing color is a new token in game.css, with its
 * ratio in game-token-contrast.test.ts — never an exception here.
 *
 * Hex AND functional notation (rgb/rgba/hsl/hsla): the same leak by another
 * spelling. Comments are stripped, as in no-primitives.test.ts — prose that
 * quotes a rejected value ("the prototype's #7a4a3a") is how this repo
 * explains its choices.
 */

const ROOTS = [join(process.cwd(), "src/components/game"), join(process.cwd(), "src/app/[locale]/game")];

const COLOR_LITERAL = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?)\(/gi;

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.(css|tsx?)$/.test(name) ? [full] : [];
  });
}

const stripComments = (source: string) => source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

const FILES = ROOTS.flatMap(walk);

describe("X22 — the game writes no color literal", () => {
  it("scans the game's real files, not an empty set", () => {
    // Non-vacuity: src/components/game exists from the first game component
    // on; the page directory joins the scan the day it is created.
    expect(FILES.some((f) => f.endsWith("NightSurface.tsx"))).toBe(true);
    expect(FILES.some((f) => f.endsWith(".module.css"))).toBe(true);
  });

  it("no hex, rgb() or hsl() in components/game/** nor app/[locale]/game/**", () => {
    const offences = FILES.flatMap((full) =>
      [...stripComments(readFileSync(full, "utf8")).matchAll(COLOR_LITERAL)].map(
        (m) => `${relative(process.cwd(), full)}: ${m[0]}`,
      ),
    );
    expect(offences).toEqual([]);
  });
});
