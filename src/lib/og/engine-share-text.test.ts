import { describe, expect, it } from "vitest";
import { ENGINE_HEADLINE } from "@/content/engine-share";
import { LOCALES } from "@/lib/i18n/locale";
import { SPACE_STRINGS } from "@/lib/i18n/space-strings";
import { tc } from "@/lib/i18n/translatable";
import { SITE_DOMAIN_LABEL } from "@/lib/site";
import { engineShareText, titleLines } from "./engine-share-text";

/**
 * The engine's share image (design brief 06, T6.2): what it draws is the
 * page's own headline and the band's own words, and its alt text says what
 * the picture shows — every check below is one way that could stop being
 * true without anything else failing.
 */
const NBSP = " ";

describe("engineShareText", () => {
  for (const locale of LOCALES) {
    describe(locale, () => {
      const text = engineShareText(locale);
      const words = text.title.map((line) => line.map((segment) => segment.text).join(" "));

      it("draws the page's H1, on two lines, and nothing else as the title", () => {
        expect(text.title).toHaveLength(2);
        expect(words.join(" ")).toBe(tc(ENGINE_HEADLINE.title, locale));
      });

      it("paints exactly one word of it in the engine's colour", () => {
        expect(text.title.flat().filter((segment) => segment.accent)).toHaveLength(1);
      });

      it("wears the band's words in its pill, as the result wears « 1/3 · PLAINE »", () => {
        expect(text.space).toBe(`2/3 · ${tc(SPACE_STRINGS.kind.engine, locale)}`.toLocaleUpperCase(locale));
      });

      it("sets the eyebrow and the promise in capitals here, so the font test sees what is drawn", () => {
        expect(text.eyebrow).toBe(tc(ENGINE_HEADLINE.eyebrow, locale).toLocaleUpperCase(locale));
        expect(text.promise).toBe(text.promise.toLocaleUpperCase(locale));
        expect(text.domain).toBe(SITE_DOMAIN_LABEL);
      });

      it("builds the alt text from what is drawn: the pill, the H1, the line, the promise, the address", () => {
        expect(text.alt).not.toMatch(/[{}]/);
        expect(text.alt).toContain(tc(ENGINE_HEADLINE.title, locale));
        expect(text.alt).toContain(text.line);
        expect(text.alt).toContain(text.space.toLocaleLowerCase(locale));
        expect(text.alt.toLocaleUpperCase(locale)).toContain(text.promise);
        expect(text.alt.endsWith(SITE_DOMAIN_LABEL)).toBe(true);
      });
    });
  }

  it("keeps the French house rules: a no-break space before « : » and inside « »", () => {
    const fr = engineShareText("fr");
    expect(fr.line).toContain(`${NBSP}:`);
    expect(fr.alt).toContain(`«${NBSP}${tc(ENGINE_HEADLINE.title, "fr")}${NBSP}»`);
    expect(fr.alt).not.toMatch(/ [:;?!»]|« /);
  });

  it("is two different pictures, one per language", () => {
    expect(engineShareText("fr")).not.toEqual(engineShareText("en"));
  });
});

describe("titleLines", () => {
  it("cuts a line around its accent word, wherever the word sits", () => {
    expect(titleLines("Ton moteur de growth", "Ton moteur", "moteur")).toEqual([
      [
        { text: "Ton", accent: false },
        { text: "moteur", accent: true },
      ],
      [{ text: "de growth", accent: false }],
    ]);
    expect(titleLines("Your growth engine", "Your growth", "engine")).toEqual([
      [{ text: "Your growth", accent: false }],
      [{ text: "engine", accent: true }],
    ]);
  });

  it("fails loudly when the H1 is renamed under it, rather than draw half a title", () => {
    expect(() => titleLines("Ton tableau de growth", "Ton moteur", "moteur")).toThrow(/does not start with/);
    // A first line that is the whole H1 leaves no second line to draw.
    expect(() => titleLines("Ton moteur", "Ton moteur", "moteur")).toThrow(/does not start with/);
  });

  it("fails loudly when the accent word is gone, rather than draw a title with no blue in it", () => {
    expect(() => titleLines("Ton outil de growth", "Ton outil", "moteur")).toThrow(/has no word/);
  });
});
