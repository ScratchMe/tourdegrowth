import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { LOCALES, type Locale } from "@/lib/i18n/locale";
import { PILLARS } from "@/lib/scoring/pillars";
import { SITE_DOMAIN_LABEL } from "@/lib/site";

/**
 * Every character the two share images draw must exist in the subset font
 * that draws it. Satori has no system fallback: a code point missing from
 * the subset renders as an empty box, and nothing fails — that is exactly
 * how the "№" of the landing bib tag shipped as tofu on 2026-09-06 (the
 * Plex Mono subset stopped at Latin). Emoji are excluded: next/og draws
 * them with Twemoji, not with these fonts.
 *
 * The strings below mirror what `src/app/[locale]/opengraph-image.tsx` and
 * `src/app/(app)/r/[id]/opengraph-image.tsx` actually render, family by
 * family. Adding text to an image means adding it here too.
 */

const WORDMARK = "TOUR DE GROWTH";
const NUMERALS = "0123456789/";

function textsByFamily(locale: Locale) {
  const landing = UI_STRINGS.landing;
  const og = UI_STRINGS.og;
  const pillars = PILLARS.map((pillar) => tc(UI_STRINGS.pillars[pillar], locale));
  return {
    stardos: [WORDMARK, tc(landing.h1Line1, locale), tc(landing.h1Line2, locale), tc(landing.h1Accent, locale), NUMERALS],
    inter: [
      tc(landing.subtitle, locale),
      ...pillars.map((label) => tc(og.stallSentenceTemplate, locale).replace("{pillar}", label)),
      tc(og.whereDoesYours, locale),
    ],
    mono: [
      tc(landing.bibTag, locale),
      ...pillars,
      tc(og.checkupBadge, locale),
      tc(og.checkupBadgeDeepDive, locale),
      tc(og.roastBadge, locale),
      tc(og.scoreLabel, locale),
      SITE_DOMAIN_LABEL,
      NUMERALS,
    ],
  };
}

const FILES_BY_FAMILY = {
  stardos: ["stardos-stencil-700.ttf"],
  inter: ["inter-500.ttf", "inter-600.ttf"],
  mono: ["ibm-plex-mono-500.ttf", "ibm-plex-mono-600.ttf"],
} as const;

const isEmoji = (char: string) => /\p{Extended_Pictographic}|️/u.test(char);

/** Code points a TrueType file maps to a real glyph (cmap formats 4 and 12). */
function codePointsOf(file: string): Set<number> {
  const bytes = readFileSync(fileURLToPath(new URL(`./fonts/${file}`, import.meta.url)));
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const tableCount = view.getUint16(4);
  let cmap = -1;
  for (let i = 0; i < tableCount; i++) {
    const record = 12 + i * 16;
    if (bytes.toString("latin1", record, record + 4) === "cmap") {
      cmap = view.getUint32(record + 8);
      break;
    }
  }
  if (cmap < 0) throw new Error(`${file}: no cmap table`);

  const mapped = new Set<number>();
  const subtableCount = view.getUint16(cmap + 2);
  for (let i = 0; i < subtableCount; i++) {
    const sub = cmap + view.getUint32(cmap + 4 + i * 8 + 4);
    const format = view.getUint16(sub);
    if (format === 4) {
      const segCountX2 = view.getUint16(sub + 6);
      const ends = sub + 14;
      const starts = ends + segCountX2 + 2;
      const deltas = starts + segCountX2;
      const rangeOffsets = deltas + segCountX2;
      for (let s = 0; s < segCountX2 / 2; s++) {
        const end = view.getUint16(ends + s * 2);
        const start = view.getUint16(starts + s * 2);
        const delta = view.getInt16(deltas + s * 2);
        const rangeOffset = view.getUint16(rangeOffsets + s * 2);
        for (let c = start; c <= end && c !== 0xffff; c++) {
          let glyph: number;
          if (rangeOffset === 0) {
            glyph = (c + delta) & 0xffff;
          } else {
            glyph = view.getUint16(rangeOffsets + s * 2 + rangeOffset + (c - start) * 2);
            if (glyph !== 0) glyph = (glyph + delta) & 0xffff;
          }
          if (glyph !== 0) mapped.add(c);
        }
      }
    } else if (format === 12) {
      const groupCount = view.getUint32(sub + 12);
      for (let g = 0; g < groupCount; g++) {
        const group = sub + 16 + g * 12;
        const start = view.getUint32(group);
        const end = view.getUint32(group + 4);
        const startGlyph = view.getUint32(group + 8);
        for (let c = start; c <= end; c++) if (startGlyph + (c - start) !== 0) mapped.add(c);
      }
    }
  }
  return mapped;
}

function missingChars(texts: readonly string[], mapped: Set<number>): string[] {
  const missing = new Set<string>();
  for (const text of texts) {
    for (const char of text) {
      if (isEmoji(char)) continue;
      if (!mapped.has(char.codePointAt(0)!)) missing.add(char);
    }
  }
  return [...missing];
}

describe("share image fonts", () => {
  it("the cmap reader can say no, not only yes", () => {
    const stencil = codePointsOf("stardos-stencil-700.ttf");
    const mono = codePointsOf("ibm-plex-mono-500.ttf");
    expect(stencil.has("A".codePointAt(0)!)).toBe(true);
    expect(mono.has("№".codePointAt(0)!)).toBe(true);
    expect(stencil.has("№".codePointAt(0)!)).toBe(false);
  });

  for (const [family, files] of Object.entries(FILES_BY_FAMILY)) {
    for (const file of files) {
      it(`${file} covers every character ${family} draws, in both languages`, () => {
        const mapped = codePointsOf(file);
        for (const locale of LOCALES) {
          const texts = textsByFamily(locale)[family as keyof typeof FILES_BY_FAMILY];
          expect(missingChars(texts, mapped), `${file} (${locale}) lacks glyphs`).toEqual([]);
        }
      });
    }
  }
});
