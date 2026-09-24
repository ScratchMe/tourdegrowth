import { describe, expect, it } from "vitest";
import { FILES, isClientComponent, reachable, resolveSpecifier, valueImports } from "./helpers/import-graph";

/**
 * C7 — what the game's client code may import (plan §3.4, GAME-BRIEF 9.8).
 *
 * The game's text is resolved on the SERVER, in the page's language, and
 * reaches the island as props: one language shipped instead of two, and no
 * template machinery in the browser. The engine (`lib/game`) runs in the
 * island only. Four rules hold that shape, each for a way it has already
 * broken elsewhere in this repo:
 *
 * 1. No Client Component outside `app/[locale]/game/**` imports `lib/game` or
 *    `content/game` by value — the engine and the copy stay out of the bundles
 *    of the other 50 pages.
 * 2. Nothing under `components/game/**` imports `lib/game` other than as a
 *    TYPE — the presentation components receive views and strings, which is
 *    what keeps them reusable (hub, result card, design-sync previews).
 * 3. No Client Component under `app/[locale]/game/**` imports `content/**` or
 *    the dictionary directly.
 * 4. …nor reaches them through anything else, at any depth — R2-14 showed
 *    three separate paths bringing the dictionary back after it had been taken
 *    out, and a direct-import rule sees none of them.
 *
 * Rules 3 and 4 apply to EVERY client component of the game's tree rather
 * than to a list of names: `GameIsland.tsx` does not exist yet (plan G8a),
 * and a guard that names it would pass in silence until it does. The first
 * test makes sure the set is not empty.
 */
const GAME_TREE = "app/[locale]/game/";

const CLIENT = FILES.filter((f) => isClientComponent(f.source));
const GAME_CLIENT = CLIENT.filter((f) => f.path.startsWith(GAME_TREE));

function resolvedValueImports(path: string, source: string): string[] {
  return valueImports(source)
    .map((spec) => resolveSpecifier(path, spec))
    .filter((p): p is string => p !== null);
}

/** Every import line, type or value — for rule 2, which cares about the difference. */
function importLines(source: string): { spec: string; typeOnly: boolean }[] {
  return [...source.matchAll(/(^|\n)\s*(?:import|export)(\s+type)?\s[^;]*?from\s+["']([^"']+)["']/g)].map((m) => ({
    spec: m[3]!,
    typeOnly: !!m[2],
  }));
}

describe("C7 — the game's client bundles", () => {
  it("finds the game's client components — otherwise rules 3 and 4 hold over an empty set", () => {
    expect(GAME_CLIENT.map((f) => f.path)).toContain("app/[locale]/game/HubProgress.tsx");
  });

  it("1. no client component outside the game's tree imports lib/game or content/game by value", () => {
    const offenders = CLIENT.filter((f) => !f.path.startsWith(GAME_TREE)).flatMap((f) =>
      resolvedValueImports(f.path, f.source)
        .filter((p) => p.startsWith("lib/game/") || p.startsWith("content/game/"))
        .map((p) => `${f.path} → ${p}`),
    );
    expect(offenders).toEqual([]);
  });

  it("2. components/game imports lib/game only as types", () => {
    const offenders = FILES.filter((f) => f.path.startsWith("components/game/")).flatMap((f) =>
      importLines(f.source)
        .filter(({ spec, typeOnly }) => !typeOnly && resolveSpecifier(f.path, spec)?.startsWith("lib/game/"))
        .map(({ spec }) => `${f.path} → ${spec}`),
    );
    expect(offenders).toEqual([]);
  });

  it("3. the game's client components import neither content/** nor the dictionary", () => {
    const offenders = GAME_CLIENT.flatMap((f) =>
      resolvedValueImports(f.path, f.source)
        .filter((p) => p.startsWith("content/") || p === "lib/i18n/dictionary.ts")
        .map((p) => `${f.path} → ${p}`),
    );
    expect(offenders).toEqual([]);
  });

  it("4. …and reach no content module at any depth", () => {
    const offenders = GAME_CLIENT.flatMap((f) =>
      [...reachable(f.path)]
        .filter((p) => p.startsWith("content/") || p === "lib/i18n/dictionary.ts")
        .map((p) => `${f.path} ⇝ ${p}`),
    );
    expect(offenders).toEqual([]);
  });
});
