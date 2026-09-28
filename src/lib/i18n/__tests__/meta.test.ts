import { describe, expect, it } from "vitest";
import { appMetadata, contentMetadata } from "../meta";

/**
 * The two `generateMetadata` builders. What is pinned here is what a share
 * preview and a search engine read — the share text, the canonical, and
 * (for an app page) the image — because none of it is visible on the page,
 * so none of it is caught by looking at the page.
 */
describe("contentMetadata", () => {
  it("carries the hreflang set and the share text in the page's language", () => {
    const meta = contentMetadata("fr", "/about", "Titre", "Description de la page.");
    expect(meta.alternates?.canonical).toBe("/fr/about");
    expect(meta.alternates?.languages).toMatchObject({ en: "/en/about", fr: "/fr/about", "x-default": "/en/about" });
    expect(meta.openGraph).toMatchObject({ title: "Titre", url: "/fr/about", locale: "fr_FR", alternateLocale: ["en_US"] });
    expect(meta.twitter).toMatchObject({ card: "summary_large_image", title: "Titre" });
  });

  /**
   * The fallback image: the landing's, in the page's language. A page with
   * its own `opengraph-image` file overrides it (file-based metadata wins);
   * every other content page used to unfurl with no picture at all.
   */
  it("falls back to the landing image of the page's own language", () => {
    for (const locale of ["en", "fr"] as const) {
      const meta = contentMetadata(locale, "/aarrr-vs-okr", "T", "D");
      for (const images of [meta.openGraph?.images, meta.twitter?.images]) {
        expect(images).toMatchObject([
          { url: `/${locale}/opengraph-image/${locale}`, width: 1200, height: 630, type: "image/png" },
        ]);
      }
    }
  });

  /**
   * An image declared in the config replaces the file-based one (measured on
   * the build), so a page that carries its own `opengraph-image` must not get
   * the fallback — it would trade its own address for the landing's.
   */
  it("declares no image for a page that carries its own file", () => {
    const meta = contentMetadata("en", "/how-it-works", "T", "D", { ownShareImage: true });
    expect(meta.openGraph).not.toHaveProperty("images");
    expect(meta.twitter).not.toHaveProperty("images");
    expect(meta.openGraph).toMatchObject({ title: "T", url: "/en/how-it-works" });
  });
});

/**
 * SEO lot 4 (2026-09-28): an Article page (open-door pages, comparisons) is
 * an `article` to the platforms too, with the dates it is handed — the same
 * pair as its JSON-LD and the sitemap — and the CV as author. Every other
 * content page stays a `website`.
 */
describe("contentMetadata for an Article page", () => {
  const article = { published: "2026-09-14", modified: "2026-09-24" };

  it("declares og:type article with both dates and the author, and keeps the fallback image", () => {
    const meta = contentMetadata("fr", "/aarrr-vs-okr", "T", "D", { article });
    expect(meta.openGraph).toMatchObject({
      type: "article",
      publishedTime: "2026-09-14",
      modifiedTime: "2026-09-24",
      authors: ["https://cv.antoine.berthaud.me/"],
      url: "/fr/aarrr-vs-okr",
    });
    expect(meta.openGraph?.images).toMatchObject([{ url: "/fr/opengraph-image/fr" }]);
  });

  it("stays a website without dates, and never carries article fields", () => {
    const meta = contentMetadata("en", "/about", "T", "D");
    expect(meta.openGraph).toMatchObject({ type: "website" });
    expect(meta.openGraph).not.toHaveProperty("publishedTime");
    expect(meta.openGraph).not.toHaveProperty("authors");
  });

  it("is an article with its own image file too", () => {
    const meta = contentMetadata("en", "/x", "T", "D", { ownShareImage: true, article });
    expect(meta.openGraph).toMatchObject({ type: "article", publishedTime: "2026-09-14" });
    expect(meta.openGraph).not.toHaveProperty("images");
  });
});

describe("appMetadata (SEO audit v1 §1.1, §1.4)", () => {
  const meta = appMetadata("fr", "/quiz", "Le Tour", "Réponds à 15 questions.", {
    url: "/quiz/share/fr",
    alt: "Texte alternatif",
  });

  it("declares a self-referencing canonical and no hreflang — one URL serves both languages", () => {
    expect(meta.alternates).toEqual({ canonical: "/quiz" });
  });

  it("gives the share preview its text AND its image, on both Open Graph and Twitter", () => {
    expect(meta.openGraph).toMatchObject({ title: "Le Tour", description: "Réponds à 15 questions.", url: "/quiz", locale: "fr_FR" });
    expect(meta.twitter).toMatchObject({ card: "summary_large_image", title: "Le Tour" });
    for (const images of [meta.openGraph?.images, meta.twitter?.images]) {
      expect(images).toEqual([{ url: "/quiz/share/fr", width: 1200, height: 630, alt: "Texte alternatif", type: "image/png" }]);
    }
  });
});
