import { describe, expect, it } from "vitest";
import { GAME_HUB } from "../game/hub";
import { GAME_META, RETENTION_INTRO } from "../game/meta";
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
  translatables(RETENTION_INTRO, "RETENTION_INTRO", out);
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
  });

  /**
   * The SEO audit's first point for the game (seo-audit §4.1): put the length
   * rule on the new pages from the first line rather than retrofit it, as had
   * to be done for seven descriptions elsewhere. Titles past ~60 characters
   * get cut in results; descriptions outside 70-160 get rewritten by Google.
   */
  it("keeps titles to 60 characters and descriptions within 70-160, in both languages", () => {
    for (const page of [GAME_META.hub, GAME_META.retention]) {
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
