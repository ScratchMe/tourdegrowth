import { describe, expect, it } from "vitest";
import { contentAlternates, isLocalizableContentPath, localePath, splitLocalePath } from "../routes";

/** REVIEW.md R-13 — which URLs carry a language, and which deliberately don't. */
describe("localePath", () => {
  it("prefixes a content path", () => {
    expect(localePath("fr", "/glossary/cac")).toBe("/fr/glossary/cac");
    expect(localePath("en", "/how-it-works")).toBe("/en/how-it-works");
  });

  it("maps the home path to the bare locale, with no trailing slash", () => {
    expect(localePath("fr")).toBe("/fr");
    expect(localePath("en", "/")).toBe("/en");
  });
});

describe("splitLocalePath", () => {
  it("splits a prefixed path", () => {
    expect(splitLocalePath("/fr/glossary/cac")).toEqual({ locale: "fr", rest: "/glossary/cac" });
    expect(splitLocalePath("/en")).toEqual({ locale: "en", rest: "/" });
  });

  it("returns null for app routes, which never carry a locale", () => {
    // `/r/<id>` links are already shared in the wild and a result has no
    // language of its own (R-09) — both reasons it stays unprefixed.
    expect(splitLocalePath("/r/abc")).toBeNull();
    expect(splitLocalePath("/quiz")).toBeNull();
    expect(splitLocalePath("/api/submissions")).toBeNull();
    expect(splitLocalePath("/")).toBeNull();
  });

  it("does not mistake a lookalike segment for a locale", () => {
    expect(splitLocalePath("/english/glossary")).toBeNull();
    expect(splitLocalePath("/de/glossary")).toBeNull();
  });
});

describe("isLocalizableContentPath", () => {
  it("covers every URL this site published before the split", () => {
    expect(isLocalizableContentPath("/")).toBe(true);
    expect(isLocalizableContentPath("/how-it-works")).toBe(true);
    expect(isLocalizableContentPath("/glossary")).toBe(true);
    expect(isLocalizableContentPath("/glossary/viral-coefficient")).toBe(true);
    expect(isLocalizableContentPath("/about")).toBe(true);
    expect(isLocalizableContentPath("/privacy")).toBe(true);
    expect(isLocalizableContentPath("/terms")).toBe(true);
  });

  it("leaves app routes alone", () => {
    for (const path of ["/quiz", "/r/abc", "/deep-dive/abc", "/api/submissions", "/admin/stats", "/sitemap.xml"]) {
      expect(isLocalizableContentPath(path)).toBe(false);
    }
  });
});

describe("contentAlternates", () => {
  it("declares every language plus x-default, and its own canonical", () => {
    expect(contentAlternates("fr", "/glossary/cac")).toEqual({
      canonical: "/fr/glossary/cac",
      languages: {
        en: "/en/glossary/cac",
        fr: "/fr/glossary/cac",
        "x-default": "/en/glossary/cac",
      },
    });
  });
});
