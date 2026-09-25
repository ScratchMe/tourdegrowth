import { afterEach, describe, expect, it } from "vitest";
import { generateMetadata as hubMetadata } from "../page";
import { generateMetadata as levelMetadata } from "../retention/page";
import { gameMetadata } from "../game-metadata";

/**
 * X18 — the game's pages ask not to be indexed, and declare no hreflang set,
 * when the game is closed at build (GAME-BRIEF 13.2). Tested through the
 * pages' own `generateMetadata`, with the variable flipped, rather than only
 * through the helper: the wiring from page to helper is what can be forgotten.
 */
const previous = process.env.GAME_ENABLED;
afterEach(() => {
  if (previous === undefined) delete process.env.GAME_ENABLED;
  else process.env.GAME_ENABLED = previous;
});

const params = (locale: string) => ({ params: Promise.resolve({ locale }) });

describe("gameMetadata", () => {
  it("is ordinary content-page metadata when open", () => {
    const open = gameMetadata("fr", "/game", "t", "d", true);
    expect(open.robots).toBeUndefined();
    expect(open.alternates?.canonical).toBe("/fr/game");
    expect(open.alternates?.languages).toMatchObject({ en: "/en/game", fr: "/fr/game", "x-default": "/en/game" });
  });

  it("declares no share image in config — the game's own opengraph-image files must win (G4b)", () => {
    // A config image REPLACES the file-based one (lib/i18n/meta.ts): with it,
    // a link to the game would unfurl as the landing's questionnaire picture.
    for (const open of [true, false]) {
      const metadata = gameMetadata("fr", "/game", "t", "d", open);
      expect(metadata.openGraph?.images).toBeUndefined();
      expect(metadata.twitter?.images).toBeUndefined();
    }
  });

  it("drops the hreflang set and asks for noindex, nofollow when closed", () => {
    const closed = gameMetadata("fr", "/game", "t", "d", false);
    expect(closed.robots).toEqual({ index: false, follow: false });
    expect(closed.alternates).toBeUndefined();
    expect(closed.title).toBe("t");
  });
});

describe("the game pages' generateMetadata (X18)", () => {
  for (const [name, generate, path] of [
    ["hub", hubMetadata, "/game"],
    ["level", levelMetadata, "/game/retention"],
  ] as const) {
    it(`${name}: noindex and no hreflang when closed at build`, async () => {
      delete process.env.GAME_ENABLED;
      const metadata = await generate(params("en"));
      expect(metadata.robots).toEqual({ index: false, follow: false });
      expect(metadata.alternates).toBeUndefined();
    });

    it(`${name}: indexable with its hreflang set when open at build`, async () => {
      process.env.GAME_ENABLED = "true";
      const metadata = await generate(params("fr"));
      expect(metadata.robots).toBeUndefined();
      expect(metadata.alternates?.canonical).toBe(`/fr${path}`);
    });
  }
});
