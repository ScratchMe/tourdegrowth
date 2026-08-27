import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, isLocale, parseAcceptLanguage, resolveLocale } from "../locale";

describe("isLocale", () => {
  it("accepts en and fr", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("fr")).toBe(true);
  });

  it("rejects anything else, including null/undefined", () => {
    expect(isLocale("de")).toBe(false);
    expect(isLocale("")).toBe(false);
    expect(isLocale(null)).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});

describe("parseAcceptLanguage", () => {
  it("reads the primary language tag", () => {
    expect(parseAcceptLanguage("fr-FR,fr;q=0.9,en-US;q=0.8")).toBe("fr");
    expect(parseAcceptLanguage("en-US,en;q=0.9")).toBe("en");
  });

  it("falls back to the default for unsupported or missing headers", () => {
    expect(parseAcceptLanguage("de-DE,de;q=0.9")).toBe(DEFAULT_LOCALE);
    expect(parseAcceptLanguage(null)).toBe(DEFAULT_LOCALE);
    expect(parseAcceptLanguage(undefined)).toBe(DEFAULT_LOCALE);
    expect(parseAcceptLanguage("")).toBe(DEFAULT_LOCALE);
  });
});

describe("resolveLocale", () => {
  it("prioritizes ?lang= over everything else", () => {
    expect(
      resolveLocale({ queryLang: "fr", cookieLocale: "en", acceptLanguage: "en-US" }),
    ).toBe("fr");
  });

  it("falls back to the cookie when there is no query param", () => {
    expect(
      resolveLocale({ queryLang: null, cookieLocale: "fr", acceptLanguage: "en-US" }),
    ).toBe("fr");
  });

  it("falls back to Accept-Language when there is neither query nor cookie", () => {
    expect(
      resolveLocale({ queryLang: null, cookieLocale: null, acceptLanguage: "fr-FR,fr;q=0.9" }),
    ).toBe("fr");
  });

  it("falls back to the default locale when nothing resolves", () => {
    expect(resolveLocale({ queryLang: null, cookieLocale: null, acceptLanguage: null })).toBe(
      DEFAULT_LOCALE,
    );
  });

  it("ignores invalid values at any priority level", () => {
    expect(
      resolveLocale({ queryLang: "de", cookieLocale: "fr", acceptLanguage: "en-US" }),
    ).toBe("fr");
    expect(
      resolveLocale({ queryLang: undefined, cookieLocale: "xx", acceptLanguage: "fr-FR" }),
    ).toBe("fr");
  });
});
