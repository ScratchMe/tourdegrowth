import { describe, expect, it } from "vitest";
import { GLOSSARY } from "@/content/glossary";
import { breadcrumbSchema, CRUMBS, definedTermSchema, definedTermSetSchema, webApplicationSchema } from "../jsonld";

// REVIEW-02.md R2-15 — one JSON-LD block existed, identical on /en and /fr,
// with a `url` that was not the page's own. These are the shapes we now emit.
describe("structured data", () => {
  it("describes the application in the page's language, at the page's own URL, priced in euros", () => {
    const fr = webApplicationSchema("fr");
    const en = webApplicationSchema("en");
    expect(fr.inLanguage).toBe("fr");
    expect(fr.url).toMatch(/\/fr$/);
    expect(en.url).toMatch(/\/en$/);
    expect(fr.description).not.toBe(en.description);
    expect(fr.offers.priceCurrency).toBe("EUR");
    expect(fr.author["@type"]).toBe("Person");
    expect(fr.author["@id"]).toBe("https://cv.antoine.berthaud.me/#person");
  });

  it("declares the glossary as one term set holding all fifteen terms, localized", () => {
    const set = definedTermSetSchema("fr");
    expect(set["@type"]).toBe("DefinedTermSet");
    expect(set.hasDefinedTerm).toHaveLength(Object.keys(GLOSSARY).length);
    const cac = set.hasDefinedTerm.find((t) => t.url.endsWith("/fr/glossary/cac"));
    expect(cac?.name).toBe(GLOSSARY.cac.term.fr);
  });

  it("ties each term page to the set and carries its short definition", () => {
    const term = definedTermSchema("en", "churn");
    expect(term["@type"]).toBe("DefinedTerm");
    expect(term.description).toBe(GLOSSARY.churn.definition.en);
    expect(term.inDefinedTermSet["@id"]).toBe(definedTermSetSchema("en")["@id"]);
    expect(term.url).toMatch(/\/en\/glossary\/churn$/);
  });

  it("builds breadcrumbs from the home page down, positions counted from 1", () => {
    const crumbs = breadcrumbSchema("fr", [CRUMBS.glossary("fr"), CRUMBS.term("fr", "cac")]);
    expect(crumbs.itemListElement.map((i) => i.position)).toEqual([1, 2, 3]);
    expect(crumbs.itemListElement[0]?.item).toMatch(/\/fr$/);
    expect(crumbs.itemListElement[2]?.name).toBe(GLOSSARY.cac.term.fr);
    expect(crumbs.itemListElement[2]?.item).toMatch(/\/fr\/glossary\/cac$/);
  });
});
