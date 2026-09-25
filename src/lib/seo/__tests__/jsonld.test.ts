import { describe, expect, it } from "vitest";
import { GLOSSARY } from "@/content/glossary";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import {
  articleSchema,
  breadcrumbSchema,
  definedTermSchema,
  definedTermSetSchema,
  gameHubSchema,
  gameSchema,
  webApplicationSchema,
} from "../jsonld";

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

  /**
   * Engine spec §11.3: the growth engine is a second WebApplication of the
   * site, free, with no rating (SPEC-ADDENDUM-02 §3.2 — none until there is
   * honest volume), at its own URL and tied back to the site.
   */
  it("describes another application of the site at its own URL, free, unrated, part of the site", () => {
    const engine = webApplicationSchema("fr", { path: "/aarrr-funnel-template", name: "Moteur de croissance", description: "d" });
    expect(engine["@type"]).toBe("WebApplication");
    expect(engine.name).toBe("Moteur de croissance");
    expect(engine.url).toMatch(/\/fr\/aarrr-funnel-template$/);
    expect(engine.applicationCategory).toBe("BusinessApplication");
    expect(engine.isAccessibleForFree).toBe(true);
    expect(engine).not.toHaveProperty("aggregateRating");
    expect(engine.isPartOf).toMatchObject({ "@type": "WebSite", name: "Tour de Growth" });
    expect(engine.isPartOf?.url).toMatch(/\/fr$/);
    // The landing's own block is untouched by the new parameter: no isPartOf, the site's name.
    const landing = webApplicationSchema("fr");
    expect(landing.name).toBe("Tour de Growth");
    expect(landing).not.toHaveProperty("isPartOf");
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

  it("gives an Article the dates it is handed, and the same Person as author AND publisher (SEO audit v1 §1.5, §1.6)", () => {
    const article = articleSchema("fr", "/aarrr-vs-okr", "AARRR ou OKR", "Description.", {
      published: "2026-09-14",
      modified: "2026-09-23",
    });
    expect(article["@type"]).toBe("Article");
    expect(article.datePublished).toBe("2026-09-14");
    expect(article.dateModified).toBe("2026-09-23");
    expect(article.url).toMatch(/\/fr\/aarrr-vs-okr$/);
    // §1.6, décidé : ne PAS remplacer par une Organization. Tour de Growth est
    // le projet d'une personne ; un nœud inventé casserait le signal cohérent
    // de R2-15. Si ce test gêne un jour, c'est une décision à reprendre, pas
    // une assertion à assouplir.
    expect(article.publisher).toEqual(article.author);
    expect(article.publisher["@type"]).toBe("Person");
    expect(article.publisher["@id"]).toBe("https://cv.antoine.berthaud.me/#person");
  });

  it("builds breadcrumbs from the home page down, positions counted from 1", () => {
    // Le fil est construit par la page qui le rend, depuis son propre module de
    // contenu — donc le test le construit pareil, plutôt que via un helper partagé.
    const crumbs = breadcrumbSchema("fr", [
      { name: tc(UI_STRINGS.glossaryPage.indexTitle, "fr"), path: "/glossary" },
      { name: tc(GLOSSARY.cac.term, "fr"), path: "/glossary/cac" },
    ]);
    expect(crumbs.itemListElement.map((i) => i.position)).toEqual([1, 2, 3]);
    expect(crumbs.itemListElement[0]?.item).toMatch(/\/fr$/);
    expect(crumbs.itemListElement[2]?.name).toBe(GLOSSARY.cac.term.fr);
    expect(crumbs.itemListElement[2]?.item).toMatch(/\/fr\/glossary\/cac$/);
  });
});

// « Le côté obscur » — seo-audit §4.1, point 2: `Game`, never `VideoGame`
// (app-store shaped) nor `HowTo` (rich result withdrawn).
describe("the game's structured data", () => {
  it("describes a level as a free, educational browser Game at its own URL, by the same author", () => {
    const game = gameSchema("fr", { path: "/game/retention", name: "Une année chez Flixo", description: "d" });
    expect(game["@type"]).toBe("Game");
    expect(game.url).toMatch(/\/fr\/game\/retention$/);
    expect(game.inLanguage).toBe("fr");
    expect(game.isAccessibleForFree).toBe(true);
    expect(game.gamePlatform).toBe("Web browser");
    expect(game.author["@id"]).toBe("https://cv.antoine.berthaud.me/#person");
  });

  it("describes the hub as a collection whose items are the level Games, same @id", () => {
    const hub = gameHubSchema("en", {
      path: "/game",
      name: "The dark side",
      description: "d",
      levels: [{ path: "/game/retention", name: "A year at Flixo" }],
    });
    expect(hub["@type"]).toBe("CollectionPage");
    expect(hub.mainEntity.itemListElement).toHaveLength(1);
    const item = hub.mainEntity.itemListElement[0]!.item;
    expect(item["@type"]).toBe("Game");
    expect(item["@id"]).toBe(gameSchema("en", { path: "/game/retention", name: "x", description: "y" })["@id"]);
  });
});
