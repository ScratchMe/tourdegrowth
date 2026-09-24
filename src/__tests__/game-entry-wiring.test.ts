import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { reachable } from "./helpers/import-graph";

/**
 * How the game card reaches the result page — a static guard, orchestrator
 * decision 3 (2026-09-24).
 *
 * P24 and P25 (no card on an acquisition bottleneck; one card, Deep dive
 * variant, on a result with a Deep dive) are proven on the pure resolver in
 * `app/(app)/r/[id]/__tests__/game-entry.test.ts`, because a real result page
 * needs Firestore and CI has none. Those proofs only transfer to the page if
 * the page has no OTHER way to produce a card — which is what this file
 * reads out of the source:
 *
 * - the page gives `ResultView` a card only through `resultGameEntry`, on
 *   both branches (the sample and a real submission), with the access read
 *   from the flag and the preview cookie exactly as the proxy reads it;
 * - `resultGameEntry` only has a card to give when `gameEntryFor` says so;
 * - `ResultView` renders `GameEntry` from that prop and nothing else, and
 *   renders nothing when it is null;
 * - the card's link is a bare anchor, because the game lives under the other
 *   root layout (cross-root-links.test.ts polices the content tree; this is
 *   the same rule in the other direction, for the one link that needs it).
 */
const SRC = join(process.cwd(), "src");
const read = (path: string) => readFileSync(join(SRC, path), "utf8");

/** Comments cite the rules they follow; only code counts. */
const code = (source: string) => source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const PAGE = code(read("app/(app)/r/[id]/page.tsx"));
const VIEW = code(read("app/(app)/r/[id]/ResultView.tsx"));
const RESOLVER = code(read("app/(app)/r/[id]/game-entry.ts"));
const CARD = code(read("components/game/GameEntry.tsx"));

describe("the game card's wiring (P24/P25 hold on the page, not just on the resolver)", () => {
  it("the page hands ResultView a card only through resultGameEntry, on both branches", () => {
    const renders = PAGE.match(/<ResultView\b/g) ?? [];
    const props = [...PAGE.matchAll(/gameEntry=\{\s*([A-Za-z]+)\(/g)].map((m) => m[1]);
    expect(renders.length, "found no ResultView render — this guard would pass on nothing").toBe(2);
    expect(props).toEqual(["resultGameEntry", "resultGameEntry"]);
    // …and no `gameEntry=` that is not one of those calls.
    expect(PAGE.match(/gameEntry=/g)).toHaveLength(2);
  });

  it("the page reads access from the flag and the preview cookie, the proxy's way", () => {
    expect(PAGE).toMatch(/resolveGameAccess\(\{\s*env:\s*process\.env\.GAME_ENABLED,\s*cookie:[^}]*GAME_PREVIEW_COOKIE/);
    const calls = [...PAGE.matchAll(/resultGameEntry\(\{[\s\S]*?\}\)/g)].map((m) => m[0]);
    expect(calls).toHaveLength(2);
    for (const call of calls) expect(call).toMatch(/access:\s*await readGameAccess\(\)/);
  });

  it("the page neither builds a card by hand nor reaches past the resolver", () => {
    expect(PAGE).not.toMatch(/from\s+["']@\/content\/game\//);
    expect(PAGE).not.toMatch(/from\s+["']@\/components\/game\/GameEntry["']/);
    expect(PAGE).not.toMatch(/gameEntryFor\(/);
  });

  it("the resolver's only source of a card is gameEntryFor, and no target means no card", () => {
    expect(RESOLVER).toMatch(/const target = gameEntryFor\(\{[^}]*access[^}]*\}\);\s*if \(!target\) return null;/);
    expect(RESOLVER.match(/gameEntryFor\(/g)).toHaveLength(1);
  });

  it("ResultView renders GameEntry once, from a non-null prop, spreading exactly that prop", () => {
    const tags = VIEW.match(/<GameEntry\b[^>]*\/>/g) ?? [];
    expect(tags).toHaveLength(1);
    expect(VIEW).toMatch(/\{gameEntry \? <GameEntry \{\.\.\.gameEntry\}[^>]*\/> : null\}/);
    // The prop defaults to null — the closed game's shape.
    expect(VIEW).toMatch(/gameEntry = null,/);
  });

  it("the result page pulls the card's copy, and none of the game's other text", () => {
    // The level's own text (`content/game/retention.ts`, the whole year) and
    // the hub's must not ride into the result page's function to render one
    // card — counted per route, that weight is the Functions Storage bill
    // (VERCEL.md §2.2).
    const game = [...reachable("app/(app)/r/[id]/page.tsx")].filter((p) => p.startsWith("content/game/"));
    expect(game).toEqual(["content/game/entry.ts"]);
  });

  it("the card's link is a bare anchor — never next/link across root layouts", () => {
    expect(CARD).not.toMatch(/from\s+["']next\/link["']/);
    // Up to the test id rather than to the first `>`: the tag's `onClick`
    // arrow contains one.
    const button = CARD.match(/<Button\b[\s\S]*?data-testid="game-entry-cta"/)?.[0] ?? "";
    expect(button, "no Button found in GameEntry — the guard would pass on nothing").not.toBe("");
    expect(button).toMatch(/\bhref=\{href\}/);
    expect(button).toMatch(/\bhard\b/);
  });
});
