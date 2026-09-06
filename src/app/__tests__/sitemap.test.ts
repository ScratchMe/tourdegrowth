import { describe, expect, it } from "vitest";
import sitemap from "../sitemap";

// REVIEW-02.md R2-08 — `lastmod` is the one sitemap field Google reads, and
// it was the one field missing; `x-default` was in the <head> but not here.
describe("sitemap", () => {
  const entries = sitemap();

  it("lists every content page once per language", () => {
    expect(entries).toHaveLength(38);
  });

  it("dates every entry with a real, hand-maintained lastModified", () => {
    for (const entry of entries) {
      expect(entry.lastModified, entry.url).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("declares both languages and an x-default on every entry", () => {
    for (const entry of entries) {
      const languages = entry.alternates?.languages as Record<string, string>;
      expect(Object.keys(languages).sort()).toEqual(["en", "fr", "x-default"]);
      expect(languages["x-default"]).toBe(languages.en);
    }
  });
});
