import { describe, expect, it } from "vitest";
import { generateImageMetadata } from "@/app/[locale]/game/opengraph-image";
import { enabledLevelSlugs } from "@/lib/game/levels";
import { GAME_HUB, LEVEL_TEASERS } from "../game/hub";
import {
  ACQUISITION_INTRO,
  ACTIVATION_INTRO,
  GAME_META,
  GAME_OPEN_COUNT_WORDS,
  REFERRAL_INTRO,
  RETENTION_INTRO,
  REVENUE_INTRO,
} from "../game/meta";
import { LOCALES } from "@/lib/i18n/locale";
import { PILLARS } from "@/lib/scoring/pillars";

/**
 * Série C for the hub and the game's metadata (plan §4.2 G4a).
 *
 * The parity walk is structural rather than a hand-kept key list: any object
 * with an `fr` and an `en` key is a translatable, and both sides must be
 * non-empty. A string added in one language only fails here, wherever it sits.
 */
function translatables(value: unknown, path: string, out: { path: string; fr: unknown; en: unknown }[]): void {
  if (typeof value !== "object" || value === null) return;
  const record = value as Record<string, unknown>;
  if ("fr" in record && "en" in record) {
    out.push({ path, fr: record.fr, en: record.en });
    return;
  }
  for (const [key, child] of Object.entries(record)) translatables(child, `${path}.${key}`, out);
}

const ALL = (() => {
  const out: { path: string; fr: unknown; en: unknown }[] = [];
  translatables(GAME_HUB, "GAME_HUB", out);
  translatables(GAME_META, "GAME_META", out);
  translatables(GAME_OPEN_COUNT_WORDS, "GAME_OPEN_COUNT_WORDS", out);
  translatables(LEVEL_TEASERS, "LEVEL_TEASERS", out);
  translatables(RETENTION_INTRO, "RETENTION_INTRO", out);
  translatables(ACQUISITION_INTRO, "ACQUISITION_INTRO", out);
  translatables(ACTIVATION_INTRO, "ACTIVATION_INTRO", out);
  translatables(REFERRAL_INTRO, "REFERRAL_INTRO", out);
  translatables(REVENUE_INTRO, "REVENUE_INTRO", out);
  return out;
})();

const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe("game hub and metadata copy", () => {
  it("walks a corpus that exists — otherwise the parity check below proves nothing", () => {
    expect(ALL.length).toBeGreaterThan(40);
  });

  it("has both languages, non-empty, on every string", () => {
    for (const { path, fr, en } of ALL) {
      expect(typeof fr === "string" && fr.trim().length > 0, `${path}.fr`).toBe(true);
      expect(typeof en === "string" && en.trim().length > 0, `${path}.en`).toBe(true);
    }
  });

  it("carries the same placeholders in both languages", () => {
    for (const { path, fr, en } of ALL) {
      expect(placeholders(fr as string), path).toEqual(placeholders(en as string));
    }
  });

  it("names every zone of the Tour, in AARRR order", () => {
    expect(Object.keys(GAME_HUB.zones)).toEqual([...PILLARS]);
  });

  it("labels all seven endings a year can reach", () => {
    expect(Object.keys(GAME_HUB.endings).sort()).toEqual(
      ["applause", "cleanMiss", "fine", "firedClean", "firedDark", "labyrinth", "repentant"].sort(),
    );
  });

  it("explains a year in exactly three steps", () => {
    expect(RETENTION_INTRO.steps).toHaveLength(3);
    expect(ACQUISITION_INTRO.steps).toHaveLength(3);
    expect(ACTIVATION_INTRO.steps).toHaveLength(3);
    expect(REFERRAL_INTRO.steps).toHaveLength(3);
    expect(REVENUE_INTRO.steps).toHaveLength(3);
  });

  /**
   * The SEO audit's first point for the game (seo-audit §4.1): put the length
   * rule on the new pages from the first line rather than retrofit it, as had
   * to be done for seven descriptions elsewhere. Titles past ~60 characters
   * get cut in results; descriptions outside 70-160 get rewritten by Google.
   */
  it("keeps titles to 60 characters and descriptions within 70-160, in both languages", () => {
    for (const page of [
      GAME_META.hub,
      GAME_META.retention,
      GAME_META.acquisition,
      GAME_META.activation,
      GAME_META.referral,
      GAME_META.revenue,
    ]) {
      for (const locale of LOCALES) {
        const title = page.title[locale];
        const description = page.description[locale];
        expect(title.length, `${title} is ${title.length} chars`).toBeLessThanOrEqual(60);
        expect(description.length, `${description} is ${description.length}`).toBeGreaterThanOrEqual(70);
        expect(description.length, `${description} is ${description.length}`).toBeLessThanOrEqual(160);
      }
    }
  });
});

/**
 * A24.T0: how many stages are open is no longer typed into the hub image's
 * alt text. The template is filled where it is read — the image route's
 * `generateImageMetadata` — so this reads THAT text, filled: the Playwright
 * spec (`game-share-images.spec.ts`) only checks `/.+/`, and an `{open}` left
 * unfilled would pass it.
 */
describe("the hub image's alt text (A24.T0)", () => {
  const altOf = async (locale: string) => {
    const [image] = await generateImageMetadata({ params: Promise.resolve({ locale }) });
    return image!.alt;
  };

  it("says the number of open levels in words, in both languages, with no placeholder left", async () => {
    const open = enabledLevelSlugs().length as keyof typeof GAME_OPEN_COUNT_WORDS;
    expect(GAME_OPEN_COUNT_WORDS[open], `no word for ${open} open levels`).toBeDefined();
    for (const locale of LOCALES) {
      const alt = await altOf(locale);
      expect(alt).not.toMatch(/[{}]/);
      expect(alt).toContain(GAME_OPEN_COUNT_WORDS[open][locale]);
    }
  });

  it("reads « cinq » / « five » while five levels are open — the whole sentence, written out in both languages (A24, ACT-3, REF-3, then REV-3)", async () => {
    expect(enabledLevelSlugs()).toHaveLength(5);
    expect(await altOf("fr")).toBe("Le côté obscur de Tour de Growth\u00a0: les cinq étapes du Tour, dont cinq sont ouvertes.");
    expect(await altOf("en")).toBe("The dark side of Tour de Growth: the five stages of the Tour, five of them open.");
  });

  it("has a word for every count from two to five, and a template that takes exactly one placeholder", () => {
    expect(Object.keys(GAME_OPEN_COUNT_WORDS)).toEqual(["2", "3", "4", "5"]);
    for (const locale of LOCALES) expect(GAME_META.hub.shareImageAlt[locale].match(/\{open\}/g)).toHaveLength(1);
  });
});

describe("LEVEL_TEASERS (C75, A24.T0)", () => {
  it("announces each level once, by the line its December neighbour used to carry", () => {
    expect(Object.keys(LEVEL_TEASERS).sort()).toEqual(["acquisition", "activation", "referral", "retention", "revenue"]);
    expect(LEVEL_TEASERS.acquisition.fr).toContain("Comment les gens vous trouvent");
    expect(LEVEL_TEASERS.activation.fr).toContain("Comment ils comprennent ce que vous apportez");
    expect(LEVEL_TEASERS.retention.fr).toContain("S'ils reviennent");
    expect(LEVEL_TEASERS.referral.fr).toContain("S'ils vous recommandent");
    expect(LEVEL_TEASERS.revenue.fr).toContain("Comment vous gagnez de l'argent");
    expect(LEVEL_TEASERS.acquisition.en).toContain("How people find you");
    expect(LEVEL_TEASERS.activation.en).toContain("How they understand what you bring");
    expect(LEVEL_TEASERS.retention.en).toContain("If they come back");
    expect(LEVEL_TEASERS.referral.en).toContain("If they recommend you");
    expect(LEVEL_TEASERS.revenue.en).toContain("How you make money");
  });
});
