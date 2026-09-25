import { describe, expect, it } from "vitest";
import { GAME_ENTRY_COPY } from "../game/entry";
import { GAME_LEVEL_SLUGS } from "@/lib/game/events";
import { enabledLevelSlugs } from "@/lib/game/levels";

/**
 * The result page's game card copy (GAME-BRIEF.md 13.3 A) — série C.
 *
 * The parity walk is structural, as for the hub: any object with an `fr` and
 * an `en` key is a translatable, and both sides must be there. A string added
 * in one language only fails here, wherever it sits.
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
  translatables(GAME_ENTRY_COPY, "GAME_ENTRY_COPY", out);
  return out;
})();

const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe("game entry copy", () => {
  it("walks a corpus that exists — otherwise the parity check below proves nothing", () => {
    // title, two openings, body, cta, meta, three band labels — per level.
    expect(ALL.length).toBe(9 * Object.keys(GAME_ENTRY_COPY).length);
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

  it("leaves the band's churn to the level model — a placeholder, never a number", () => {
    for (const copy of Object.values(GAME_ENTRY_COPY)) {
      expect(copy.band.churn.fr).toContain("{churn}");
      expect(copy.band.churn.en).toContain("{churn}");
    }
  });

  it("has a card for every level the vocabulary counts, and for every enabled level", () => {
    // Every enabled level can trigger the card, so it must have the words for
    // it; the type already forces one entry per LevelSlug, this says the
    // tables agree with each other at runtime too.
    expect(Object.keys(GAME_ENTRY_COPY).sort()).toEqual([...GAME_LEVEL_SLUGS].sort());
    for (const slug of enabledLevelSlugs()) expect(GAME_ENTRY_COPY).toHaveProperty(slug);
  });

  it("keeps the brief's two opening sentences distinct — the Deep dive variant must read differently", () => {
    for (const copy of Object.values(GAME_ENTRY_COPY)) {
      expect(copy.opening.deepDive.fr).not.toBe(copy.opening.result.fr);
      expect(copy.opening.deepDive.en).not.toBe(copy.opening.result.en);
    }
  });
});
