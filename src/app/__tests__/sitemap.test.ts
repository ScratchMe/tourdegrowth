import { afterEach, describe, expect, it } from "vitest";
import sitemap from "../sitemap";
import { COMPARISON_ORDER } from "@/content/comparisons";
import { GLOSSARY } from "@/content/glossary";
import { isEngineOpenAtBuild } from "@/lib/engine/access";
import { gameSitemapPaths, isGameOpenAtBuild } from "@/lib/game/build-flag";
import { LOCALES } from "@/lib/i18n/locale";

// REVIEW-02.md R2-08 — `lastmod` is the one sitemap field Google reads, and
// it was the one field missing; `x-default` was in the <head> but not here.
describe("sitemap", () => {
  const entries = sitemap();

  it("lists every content page once per language", () => {
    // Dérivé, jamais un littéral : le glossaire gagne et perd des termes par
    // lots (GROWTH-PLAN.md 2.2, puis la coupe d'activation-rate), et un
    // nombre écrit à la main se retouche à chaque fois — donc il finit par
    // être retouché sans être lu. Les 8 pages fixes : la landing,
    // how-it-works, about, les deux « porte ouverte », l'index du glossaire,
    // privacy et terms. Le jeu s'y ajoute seulement s'il est ouvert au build
    // (la CI le construit ouvert — GAME_ENABLED au niveau du workflow).
    const fixed = 8;
    const game = gameSitemapPaths(isGameOpenAtBuild()).length;
    const engine = isEngineOpenAtBuild() ? 1 : 0;
    const expected = (fixed + COMPARISON_ORDER.length + Object.keys(GLOSSARY).length + game + engine) * LOCALES.length;
    expect(entries).toHaveLength(expected);
  });

  it("dates every entry with a real, hand-maintained lastModified", () => {
    for (const entry of entries) {
      expect(entry.lastModified, entry.url).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("declares both languages and an x-default on every entry", () => {
    for (const entry of entries) {
      const languages = entry.alternates?.languages as Record<string, string>;
      expect(Object.keys(languages).sort()).toEqual(["en", "fr", "x-default"]);
      expect(languages["x-default"]).toBe(languages.en);
    }
  });
});

/**
 * GAME-BRIEF 13.2 / P27, the unit half: the game is in the sitemap only when
 * open at build. `sitemap()` reads the flag when it runs, so the variable is
 * flipped here rather than mocked.
 */
describe("sitemap and the game's build flag (P27)", () => {
  const previous = process.env.GAME_ENABLED;
  afterEach(() => {
    if (previous === undefined) delete process.env.GAME_ENABLED;
    else process.env.GAME_ENABLED = previous;
  });

  const gameEntries = () => sitemap().filter((e) => /\/(en|fr)\/game(\/|$)/.test(e.url));

  it("lists no game page when the game is closed at build", () => {
    delete process.env.GAME_ENABLED;
    expect(gameEntries()).toEqual([]);
  });

  it("lists the hub and the level in both languages when open, dated, below the Tour's own pages", () => {
    process.env.GAME_ENABLED = "true";
    const game = gameEntries();
    expect(game).toHaveLength(2 * LOCALES.length);
    for (const locale of LOCALES) {
      expect(game.some((e) => e.url.endsWith(`/${locale}/game`))).toBe(true);
      expect(game.some((e) => e.url.endsWith(`/${locale}/game/retention`))).toBe(true);
    }
    for (const entry of game) {
      expect(entry.lastModified, entry.url).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(entry.priority, entry.url).toBeLessThan(0.7);
    }
  });
});

/**
 * Engine spec §11.1: the growth engine follows the game's rule — in the
 * sitemap only when ENGINE_ENABLED is open at build. Non-vacuity, measured
 * 2026-09-25: drop the flag check from `enginePaths()` and the "closed" case
 * fails with both locales listed (and so does the page count above); the
 * "open" case passes either way, as a companion assertion should.
 */
describe("sitemap and the engine's build flag (engine spec §11.1)", () => {
  const previous = process.env.ENGINE_ENABLED;
  afterEach(() => {
    if (previous === undefined) delete process.env.ENGINE_ENABLED;
    else process.env.ENGINE_ENABLED = previous;
  });

  const engineEntries = () => sitemap().filter((e) => /\/(en|fr)\/aarrr-funnel-template$/.test(e.url));

  it("lists no engine page while the flag is closed at build — nor for any value but \"true\"", () => {
    delete process.env.ENGINE_ENABLED;
    expect(engineEntries()).toEqual([]);
    process.env.ENGINE_ENABLED = "1";
    expect(engineEntries()).toEqual([]);
  });

  it("lists the page in both languages when open, dated by hand", () => {
    process.env.ENGINE_ENABLED = "true";
    const engine = engineEntries();
    expect(engine).toHaveLength(LOCALES.length);
    for (const entry of engine) expect(entry.lastModified, entry.url).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
