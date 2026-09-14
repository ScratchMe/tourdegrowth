import { describe, expect, it } from "vitest";
import sitemap from "../sitemap";
import { COMPARISON_ORDER } from "@/content/comparisons";
import { GLOSSARY } from "@/content/glossary";
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
    // privacy et terms.
    const fixed = 8;
    const expected = (fixed + COMPARISON_ORDER.length + Object.keys(GLOSSARY).length) * LOCALES.length;
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
