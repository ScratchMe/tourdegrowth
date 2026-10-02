import { describe, expect, it } from "vitest";
import { FILES } from "./helpers/import-graph";

/**
 * Every `opengraph-image` file answers for a language and for nothing else
 * (`lib/og/image-metadata.ts`, the security review of T6.2).
 *
 * Next's generated `GET` for an image route serves whatever id its
 * `generateImageMetadata` lists, for whatever `[locale]` the URL carries: the
 * layout's `dynamicParams = false` does not reach it, and the proxy closes
 * only the first segments it recognises as a language. So a file that fell
 * back to English for an unknown segment answered `/xx/game/opengraph-image/en`
 * with the closed game's picture — measured on a production build, 200 and a
 * PNG. An empty list is what makes Next answer 404 before any render.
 *
 * Walked from the file tree, not from a list, so the next image is held to
 * the same rule the day it is added.
 */
const IMAGE_ROUTES = FILES.map((f) => f.path).filter((p) => /^app\/.*\/opengraph-image\.tsx$/.test(p));

type Metadata = { id: string }[];
type Route = { generateImageMetadata?: (a: { params: Promise<Record<string, string>> }) => Promise<Metadata> };

/** The params the route's own segments give it: a term for the glossary's term page. */
const paramsFor = (route: string, locale: string): Promise<Record<string, string>> =>
  Promise.resolve<Record<string, string>>(route.includes("[term]") ? { locale, term: "cac" } : { locale });

describe("share image routes", () => {
  it("are found — otherwise the rule below holds for nothing", () => {
    // The landing (and its three re-exports), the game's three, the engine's.
    expect(IMAGE_ROUTES.length).toBeGreaterThanOrEqual(8);
    expect(IMAGE_ROUTES).toContain("app/[locale]/aarrr-funnel-template/opengraph-image.tsx");
  });

  for (const route of IMAGE_ROUTES) {
    it(`${route}: one image per language, none for a segment that is not one`, async () => {
      const mod = (await import(`@/${route.replace(/\.tsx$/, "")}`)) as Route;
      expect(mod.generateImageMetadata, "a [locale] image lists its ids").toBeTypeOf("function");
      const list = (locale: string) => mod.generateImageMetadata!({ params: paramsFor(route, locale) });
      expect((await list("fr")).map((m) => m.id)).toEqual(["fr"]);
      expect((await list("en")).map((m) => m.id)).toEqual(["en"]);
      for (const stray of ["xx", "EN", "Fr", "en-US", "opengraph-image", ""]) {
        expect(await list(stray), JSON.stringify(stray)).toEqual([]);
      }
    });
  }
});
