import { afterEach, describe, expect, it } from "vitest";
import { resolveGameAccess } from "../access";
import { gameOpenWith, gamePageRobots, gameSitemapPaths, isGameOpenAtBuild } from "../build-flag";

describe("gameOpenWith", () => {
  it("follows resolveGameAccess with no preview cookie — one rule, not two", () => {
    for (const env of ["true", undefined, "", "TRUE", "1", "yes", "true "]) {
      expect(gameOpenWith(env), String(env)).toBe(resolveGameAccess({ env, cookie: null }) === "open");
    }
    expect(gameOpenWith("true")).toBe(true);
    expect(gameOpenWith(undefined)).toBe(false);
  });
});

describe("isGameOpenAtBuild", () => {
  const previous = process.env.GAME_ENABLED;
  afterEach(() => {
    if (previous === undefined) delete process.env.GAME_ENABLED;
    else process.env.GAME_ENABLED = previous;
  });

  it("reads GAME_ENABLED as this process sees it", () => {
    process.env.GAME_ENABLED = "true";
    expect(isGameOpenAtBuild()).toBe(true);
    delete process.env.GAME_ENABLED;
    expect(isGameOpenAtBuild()).toBe(false);
  });
});

// P27, the unit half: the sitemap lists the game only when it is open at build.
describe("gameSitemapPaths", () => {
  it("is empty when the game is closed at build", () => {
    expect(gameSitemapPaths(false)).toEqual([]);
  });

  it("lists the hub and every enabled level when open", () => {
    expect(gameSitemapPaths(true)).toEqual(["/game", "/game/retention"]);
  });

  it("never lists a level that is not enabled", () => {
    expect(gameSitemapPaths(true, { retention: { slug: "retention", enabled: false } })).toEqual(["/game"]);
  });
});

// X18: noindex when closed at build.
describe("gamePageRobots", () => {
  it("asks not to be indexed nor followed when closed at build", () => {
    expect(gamePageRobots(false)).toEqual({ index: false, follow: false });
  });

  it("leaves the default in place when open", () => {
    expect(gamePageRobots(true)).toBeUndefined();
  });
});
