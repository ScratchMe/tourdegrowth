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
   * the fallback — it would lose the file's cache-busting hash.
   */
  it("declares no image for a page that carries its own file", () => {
    const meta = contentMetadata("en", "/how-it-works", "T", "D", { ownShareImage: true });
    expect(meta.openGraph).not.toHaveProperty("images");
    expect(meta.twitter).not.toHaveProperty("images");
    expect(meta.openGraph).toMatchObject({ title: "T", url: "/en/how-it-works" });
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
