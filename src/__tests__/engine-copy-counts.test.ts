import { describe, expect, it } from "vitest";
import { ENGINE_COPY } from "@/content/engine-copy";
import { DERIVED_SHAPES, METRIC_SHAPES } from "@/lib/engine/catalog-shape";

/**
 * The engine's page says how many numbers it asks for, in words — and the
 * catalogue is what decides (design audit 2026-09-27).
 *
 * Expansion and contraction joined on 2026-09-26: the catalogue went to
 * seventeen, NRR and GRR joined the computed figures (five), and Revenue
 * went to five numbers. The page's promise still said « Quinze chiffres,
 * trois par étape », its list still « trois par étape », and the computed
 * block « Et trois chiffres calculés » over five cards. Nothing failed: a
 * count written in words is invisible to every other test. So these read
 * the counts from the catalogue and require the copy to say them.
 *
 * Non-vacuity, checked by sabotage on 2026-09-28: the promise put back to
 * « Quinze chiffres » fails the first test; « Et trois chiffres calculés »
 * put back fails the third.
 */

const WORDS: Record<"fr" | "en", readonly string[]> = {
  fr: ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf", "vingt"],
  en: ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"],
};

const word = (n: number, locale: "fr" | "en") => {
  const w = WORDS[locale][n];
  if (!w) throw new Error(`no word for ${n} — extend WORDS`);
  return w;
};

const perStage = METRIC_SHAPES.reduce<Record<string, number>>((acc, m) => ({ ...acc, [m.stage]: (acc[m.stage] ?? 0) + 1 }), {});

describe("the engine's copy counts what the catalogue holds", () => {
  it("the promise, the list's title and its toggle say how many numbers there are", () => {
    for (const locale of ["fr", "en"] as const) {
      const n = word(METRIC_SHAPES.length, locale);
      expect(ENGINE_COPY.page.promise[locale].toLowerCase().startsWith(`${n} `)).toBe(true);
      expect(ENGINE_COPY.page.catalogueTitle[locale].toLowerCase()).toContain(n);
      expect(ENGINE_COPY.page.catalogueToggle[locale].toLowerCase()).toContain(n);
    }
  });

  it("« three per stage » is said only with the stage that has more", () => {
    // Today: three for four stages, five for revenue. If that changes, this
    // test says which sentence to rewrite.
    expect(perStage).toEqual({ acquisition: 3, activation: 3, retention: 3, referral: 3, revenue: 5 });
    expect(ENGINE_COPY.page.promise.fr).toContain(`trois par étape et ${word(5, "fr")} pour Revenue`);
    expect(ENGINE_COPY.page.promise.en).toContain(`three per stage and ${word(5, "en")} for Revenue`);
    expect(ENGINE_COPY.page.catalogueIntro.fr).toContain(`${word(5, "fr")} pour Revenue`);
    expect(ENGINE_COPY.page.catalogueIntro.en).toContain(`${word(5, "en")} for Revenue`);
  });

  it("the computed block's title counts the computed figures", () => {
    expect(ENGINE_COPY.page.catalogueComputedTitle.fr).toContain(` ${word(DERIVED_SHAPES.length, "fr")} `);
    expect(ENGINE_COPY.page.catalogueComputedTitle.en).toContain(` ${word(DERIVED_SHAPES.length, "en")} `);
  });
});
