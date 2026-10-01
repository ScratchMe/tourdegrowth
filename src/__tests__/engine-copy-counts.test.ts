import { describe, expect, it } from "vitest";
import { ENGINE_COPY } from "@/content/engine-copy";
import { DERIVED_SHAPES, METRIC_SHAPES, SLG_DERIVED_SHAPES, SLG_METRIC_SHAPES } from "@/lib/engine/catalog-shape";

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
 * put back fails the last. Since A7.3.c S3 the counts are per motion: the
 * subsections' titles take theirs from the catalogue itself (`{n}`), so only
 * the sentences written in words are held here.
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

const perStage = (shapes: readonly { stage: string }[]) =>
  shapes.reduce<Record<string, number>>((acc, m) => ({ ...acc, [m.stage]: (acc[m.stage] ?? 0) + 1 }), {});

describe("the engine's copy counts what the catalogue holds", () => {
  // Since A7.3.c S3 the page counts both motions: « Dix-sept chiffres en libre-service, quinze en vente assistée ».
  it("the promise says how many numbers each motion asks for, self-serve first", () => {
    for (const locale of ["fr", "en"] as const) {
      const promise = ENGINE_COPY.page.promise[locale].toLowerCase();
      expect(promise.startsWith(`${word(METRIC_SHAPES.length, locale)} `)).toBe(true);
      expect(promise).toContain(`, ${word(SLG_METRIC_SHAPES.length, locale)} `);
      expect(ENGINE_COPY.page.durationIntro[locale]).toContain(word(METRIC_SHAPES.length, locale));
      expect(ENGINE_COPY.page.durationIntroSlg[locale]).toContain(word(SLG_METRIC_SHAPES.length, locale));
    }
  });

  it("the list's title and its toggle no longer name one motion's count", () => {
    for (const locale of ["fr", "en"] as const) {
      for (const text of [ENGINE_COPY.page.catalogueTitle[locale], ENGINE_COPY.page.catalogueToggle[locale], ENGINE_COPY.page.noscript[locale]]) {
        expect(text.toLowerCase()).not.toContain(word(METRIC_SHAPES.length, locale));
        expect(text.toLowerCase()).not.toContain(word(SLG_METRIC_SHAPES.length, locale));
      }
    }
  });

  it("« three per stage » is said only with the stages that differ, in each motion", () => {
    // Today: three for four stages, five for revenue (self-serve); three, two for referral, four for revenue
    // (sales-assisted). If that changes, this test says which sentence to rewrite.
    expect(perStage(METRIC_SHAPES)).toEqual({ acquisition: 3, activation: 3, retention: 3, referral: 3, revenue: 5 });
    expect(ENGINE_COPY.page.catalogueIntro.fr).toContain(`${word(5, "fr")} pour Revenue`);
    expect(ENGINE_COPY.page.catalogueIntro.en).toContain(`${word(5, "en")} for Revenue`);
    expect(perStage(SLG_METRIC_SHAPES)).toEqual({ acquisition: 3, activation: 3, retention: 3, referral: 2, revenue: 4 });
    expect(ENGINE_COPY.page.catalogueIntroSlg.fr).toContain(`Trois par étape, ${word(2, "fr")} pour Referral et ${word(4, "fr")} pour Revenue`);
    expect(ENGINE_COPY.page.catalogueIntroSlg.en).toContain(`Three per stage, ${word(2, "en")} for Referral and ${word(4, "en")} for Revenue`);
  });

  it("each computed block's title counts its motion's computed figures", () => {
    for (const locale of ["fr", "en"] as const) {
      expect(ENGINE_COPY.page.catalogueComputedTitle[locale]).toContain(` ${word(DERIVED_SHAPES.length, locale)} `);
      expect(ENGINE_COPY.page.catalogueComputedTitleSlg[locale]).toContain(` ${word(SLG_DERIVED_SHAPES.length, locale)} `);
    }
  });
});
