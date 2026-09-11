import { describe, expect, it } from "vitest";
import { boardBand, LEVEL_HEADLINE, SUMMARY_HEADLINES } from "@/content/copy-library";
import { UI_STRINGS } from "@/lib/i18n/dictionary";
import { tc } from "@/lib/i18n/translatable";
import type { Locale } from "@/lib/i18n/locale";
import type { Tone } from "@/lib/quiz/tone";
import { resolveBottleneck } from "../bottleneck";
import { PILLARS } from "../pillars";
import { buildQuickVerdict } from "../verdict";

const TONES: Tone[] = ["neutral", "roast"];
const LOCALES: Locale[] = ["en", "fr"];

/** The five pillars in canonical AARRR order, at the scores given. */
function scored(scores: readonly number[]) {
  return PILLARS.map((pillar, i) => ({ pillar, score: scores[i]! }));
}

/**
 * The 21st headline (`LEVEL_HEADLINE`) exists because `SUMMARY_HEADLINES` is
 * indexed by the weakest pillar and all 20 of its lines assert that stage
 * still needs work. On a board where every pillar is strong that assertion is
 * false — and design system extension 03 made it visible, printing "Nothing
 * is stalling you" in the score card directly above "…but acquisition still
 * needs work before going further".
 */
describe("buildQuickVerdict on a board where nothing is behind", () => {
  // 16 is the lowest strong-band score reachable from three answers (20+20+7
  // → 47 raw → 16/20), so this is the tightest real level board there is.
  const LEVEL = scored([16, 16, 16, 16, 16]);
  const NOT_LEVEL = scored([16, 16, 8, 16, 20]);

  it("is a level board by the same rule the score card uses", () => {
    expect(resolveBottleneck(LEVEL).sharpness).toBe("level");
    expect(resolveBottleneck(NOT_LEVEL).sharpness).toBe("clear");
  });

  it("substitutes the level headline, in both tones and both languages", () => {
    for (const tone of TONES) {
      for (const locale of LOCALES) {
        const { headline } = buildQuickVerdict(tone, locale, LEVEL, "acquisition");
        expect(headline, `${tone}/${locale}`).toBe(tc(LEVEL_HEADLINE[tone], locale));
      }
    }
  });

  it("still uses the weakest-pillar headline as soon as a stage IS behind", () => {
    for (const tone of TONES) {
      for (const locale of LOCALES) {
        const { headline } = buildQuickVerdict(tone, locale, NOT_LEVEL, "retention");
        expect(headline, `${tone}/${locale}`).toBe(
          tc(SUMMARY_HEADLINES.retention[boardBand(NOT_LEVEL, "retention")][tone], locale),
        );
      }
    }
  });

  /**
   * The invariant, rather than the wiring: whatever the level sentence says,
   * it must not name a stage. That is the whole defect — a name on a board
   * where the scores support none — and it is what a future rewrite of this
   * copy could quietly reintroduce.
   */
  it("names no stage, in either tone or language", () => {
    for (const tone of TONES) {
      for (const locale of LOCALES) {
        const headline = tc(LEVEL_HEADLINE[tone], locale).toLowerCase();
        for (const pillar of PILLARS) {
          expect(headline, `${tone}/${locale} names ${pillar}`).not.toContain(
            tc(UI_STRINGS.pillars[pillar], locale).toLowerCase(),
          );
        }
      }
    }
  });

  /**
   * And the same board must not be told "nothing is stalling you" by one part
   * of the card while another names a stage — the three level signals on the
   * result page (sharpness label, verdict, next move) come from one predicate
   * on purpose. `resolveNextMove` is cross-checked against sharpness in
   * `bottleneck.test.ts`; this closes the third corner.
   */
  it("agrees with the sharpness the same board resolves to, across every reachable board", () => {
    const ACHIEVABLE = [0, 2, 5, 7, 9, 11, 13, 16, 20];
    for (const a of ACHIEVABLE) {
      for (const b of ACHIEVABLE) {
        const board = scored([a, b, 20, 20, 20]);
        const level = resolveBottleneck(board).sharpness === "level";
        const { headline } = buildQuickVerdict("neutral", "en", board, "acquisition");
        expect(headline === tc(LEVEL_HEADLINE.neutral, "en"), `${a}/${b}`).toBe(level);
      }
    }
  });
});
