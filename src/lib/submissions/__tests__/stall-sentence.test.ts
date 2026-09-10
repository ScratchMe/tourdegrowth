import { describe, expect, it } from "vitest";
import { UI_STRINGS } from "@/lib/i18n/dictionary";
import { tc } from "@/lib/i18n/translatable";
import type { Locale } from "@/lib/i18n/locale";
import { PILLARS } from "@/lib/scoring/pillars";
import { shareText, stallSentence } from "../stall-sentence";

const LOCALES: Locale[] = ["en", "fr"];

/**
 * Four surfaces say this about the same result and are seen together: the
 * share image's bottom hook, the `og:description` beside it in a link
 * preview, the share card's alt, and the text the native share sheet puts in
 * the user's own mouth. Three were swept when the level state was fixed and
 * one was missed, which is the whole reason this is one function.
 */
describe("the stall sentence", () => {
  it("names the stage when one is behind", () => {
    for (const locale of LOCALES) {
      for (const pillar of PILLARS) {
        const name = tc(UI_STRINGS.pillars[pillar], locale);
        expect(stallSentence(locale, pillar), `${locale}/${pillar}`).toContain(name);
        expect(stallSentence(locale, pillar)).not.toContain("{");
      }
    }
  });

  it("names none when none is", () => {
    for (const locale of LOCALES) {
      const sentence = stallSentence(locale, null);
      expect(sentence).toBe(tc(UI_STRINGS.og.stallSentenceLevel, locale));
      for (const pillar of PILLARS) {
        expect(sentence.toLowerCase(), `${locale} names ${pillar}`).not.toContain(
          tc(UI_STRINGS.pillars[pillar], locale).toLowerCase(),
        );
      }
    }
  });
});

describe("the text the native share sheet carries", () => {
  it("carries the score and the stall sentence, with nothing left unfilled", () => {
    for (const locale of LOCALES) {
      const text = shareText(locale, 74, "retention");
      expect(text).toContain("74/100");
      expect(text).toContain(stallSentence(locale, "retention"));
      expect(text).not.toContain("{");
    }
  });

  /**
   * The defect this replaced: `handleShare` filled the template from
   * `weakestPillar`, which still names the lowest pillar on a board where
   * every stage is strong. Tapping Share on a 100/100 result announced
   * "Acquisition is where this growth stalls" beside an image saying nothing
   * was stalling.
   */
  it("names no stage on a board where none is behind", () => {
    for (const locale of LOCALES) {
      const text = shareText(locale, 100, null).toLowerCase();
      for (const pillar of PILLARS) {
        expect(text, `${locale} names ${pillar}`).not.toContain(
          tc(UI_STRINGS.pillars[pillar], locale).toLowerCase(),
        );
      }
      expect(text).toContain("100/100");
    }
  });

  it("says the same words as before for a board that does have a bottleneck", () => {
    // The template gained a `{stall}` slot; a reader must not see a different
    // sentence because of it.
    expect(shareText("en", 74, "retention")).toBe(
      "I scored 74/100 on my AARRR growth check-up. Retention is where this growth stalls. Where does yours?",
    );
    expect(shareText("fr", 74, "retention")).toBe(
      "J'ai fait 74/100 à mon bilan growth AARRR. Retention est là où cette croissance cale. Et la tienne ?",
    );
  });
});
