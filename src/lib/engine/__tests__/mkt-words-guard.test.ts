import { describe, expect, it } from "vitest";
import { SUPPLY_NAMED_PHRASES, SUPPLY_WORDS, refusedIn, type Kind, type Offering } from "@/content/__tests__/mkt-words";
import { ENGINE_COPY } from "@/content/engine-copy";
import { buildDeck, deckMarkdown } from "../deck";
import { deriveEngine } from "../derive";
import { EXAMPLE_MKT_WHATIF } from "../example";
import { marketplaceStrings } from "../strings";
import { SLIDE_ORDER } from "../types";
import type { DeckModel, EngineState, MktSide } from "../types";
import { marketplaceNoSubscriptionsState, marketplaceState } from "./fixtures";
import { CTX_EN, CTX_FR, EN, FR } from "./props";

/**
 * The marketplace's words, on the slides (engine spec §22.11.3, A23 MKT-10).
 *
 * `engine-copy-marketplace.test.ts` guards the COPY: every leaf the rule designates is rewritten by the side's overlay.
 * This guards what the deck PRINTS, once the overlays are merged and a slide has picked its side's words (`slideStrings`,
 * §22.8.1) — the way the copy test cannot: a leaf the rule does not designate, a title resolved with the wrong set, a
 * catalogue formula the annex prints. The word lists are the copy test's own (`src/content/__tests__/mkt-words.ts`, never
 * copied), so the copy and what is displayed cannot disagree on what a SaaS word is. The board's and the settings' screens are
 * read in a browser (`e2e/engine-marketplace.spec.ts`), by the same lists.
 *
 * A slide's text is its section of `deckMarkdown` (from its `## {index}. …` line to the next one), brought back to its slide
 * by `index`: the title, every row and every note, the words the export prints. On each:
 *   - a slide of the demand side holds no word of `DEMAND_WORDS`;
 *   - a slide of the supply side holds no word of `SUPPLY_WORDS`, once `SUPPLY_TARGETS` (the expressions the supply SAYS,
 *     which contain such a word) are out;
 *   - a slide of neither (the total, the visibility, the ask, the appendix…) never says « SaaS », and, in « produits »,
 *     says neither « client » nor « customer »;
 *   - in « services », no slide holds a word of `SERVICES_BANNED`.
 *
 * Read for both languages, both vocabularies, with and without the sellers' subscriptions, with the example's « Et si »
 * moved and not, every slide ticked. **Exceptions are named one by one, each with its reason**: the supply's bare « abonné »
 * in two leaves of the marketplace's own (`SUPPLY_NAMED_PHRASES`, `mkt-words.ts`, held below to still be there); « client » on
 * the demand side in « services » (§22.8.4: acheteur → client), which `DEMAND_WORDS_SERVICES` leaves out of the rule.
 *
 * Non-vacuity, measured on 2026-10-29 (each break alone, this file run, the file restored): see the entry « A23, MKT-10 » of
 * `JOURNAL.md` for the counts.
 */

type Locale = "fr" | "en";

const props = { fr: { ...FR, ctx: CTX_FR }, en: { ...EN, ctx: CTX_EN } };

/** The sections of a deck's text export: the lines before the first slide, then one per `## {index}. …`. */
export function sectionsOf(markdown: string): { index: number | null; text: string }[] {
  const out: { index: number | null; text: string }[] = [];
  for (const part of markdown.split(/^(?=## \d+\. )/m)) {
    const head = /^## (\d+)\. /.exec(part);
    out.push({ index: head ? Number(head[1]) : null, text: part });
  }
  return out;
}

interface Reading {
  deck: DeckModel;
  sections: Map<number | null, string>;
}

/** Every slide ticked, as `sentences-guard.test.ts` reads a deck. */
function includeAll(state: EngineState): EngineState {
  const next = structuredClone(state);
  for (const id of SLIDE_ORDER) next.deck.include[id] = true;
  next.deck.include.evolution = true;
  next.deck.include["slg:evolution"] = true;
  return next;
}

function read(base: EngineState, locale: Locale, offering: Offering, moved: boolean): Reading {
  const p = props[locale];
  const state = includeAll({
    ...base,
    setup: { ...base.setup, offering },
    ...(moved ? { whatIf: { ...EXAMPLE_MKT_WHATIF, "mkt.sell.arpa": 55, "mkt.sell.paid-churn": 2 } } : {}),
  } as EngineState);
  const forSide = (side: MktSide | null) => marketplaceStrings(p.strings, p.typeStrings.marketplace, offering, side);
  const neutral = forSide(null);
  const catalog = p.typeCatalogs[offering === "services" ? "marketplace-services" : "marketplace"];
  const derived = deriveEngine(state, p.ctx, null, p.bridges, neutral.units);
  const deck = buildDeck(state, derived, neutral, catalog.metrics, p.ctx, { derived: catalog.derived, bridges: p.bridges, stringsForSide: forSide });
  const sections = new Map<number | null, string>();
  for (const s of sectionsOf(deckMarkdown(deck, neutral, forSide))) sections.set(s.index, s.text);
  return { deck, sections };
}

const BASES = [
  ["with the sellers' subscriptions", marketplaceState],
  ["without the sellers' subscriptions", marketplaceNoSubscriptionsState],
] as const;

describe("the words on the marketplace's slides (§22.11.3)", () => {
  for (const [label, build] of BASES) {
    for (const offering of ["products", "services"] as const) {
      for (const moved of [false, true]) {
        for (const locale of ["fr", "en"] as const) {
          const name = `${locale}, ${offering}, ${label}${moved ? ", the what-ifs moved" : ""}`;
          describe(name, () => {
            const { deck, sections } = read(build(), locale, offering, moved);
            const included = deck.slides.filter((s) => s.included);

            it("reads every ticked slide's section — and sections that are not slides' are only the header", () => {
              expect(included.length).toBeGreaterThan(6);
              expect(sections.has(null)).toBe(true);
              for (const slide of included) expect(sections.get(slide.index), `slide ${slide.id}`).toBeTypeOf("string");
              expect([...sections.keys()].filter((index) => index !== null)).toHaveLength(included.length);
            });

            it("holds the slides of the side(s) the state has", () => {
              const sides = new Set(included.map((s) => s.side));
              expect(sides.has("demand")).toBe(true);
              expect(sides.has("supply")).toBe(true);
              expect(sides.has(undefined)).toBe(true);
            });

            it("prints no word of the SaaS, nor of the other vocabulary", () => {
              const violations: string[] = [];
              const check = (where: string, text: string, kind: Kind) => {
                for (const line of text.split("\n")) {
                  const words = refusedIn(line, locale, kind, offering);
                  if (words.length > 0) violations.push(`${where} (${kind}): ${JSON.stringify(words)} in « ${line.trim().slice(0, 200)} »`);
                }
              };
              // The kicker and the data pill before the first slide, then every slide by its side.
              check("header", sections.get(null)!, "common");
              for (const slide of included) check(`slide ${slide.index} ${slide.id}`, sections.get(slide.index)!, slide.side ?? "common");
              expect(violations).toEqual([]);
            });
          });
        }
      }
    }
  }
});

describe("the guard itself — the words it refuses, the ones it lets through", () => {
  it("refuses an MRR, a customer or a SaaS on the demand side, in both languages", () => {
    expect(refusedIn("Ton MRR dans 12 mois", "fr", "demand", "products")).toEqual(["MRR"]);
    expect(refusedIn("Your paying customers", "en", "demand", "products")).toEqual(["paying", "customer"]);
    expect(refusedIn("Ton SaaS", "fr", "demand", "products")).toEqual(["SaaS"]);
  });

  it("lets the supply say its own words, and refuses the SaaS's", () => {
    expect(refusedIn("Sur 100 vendeurs inscrits, 15 vendeurs abonnés. Le MRR des abonnements, le LTV:CAC.", "fr", "supply", "products")).toEqual([]);
    expect(refusedIn("Out of 100 seller sign-ups, the subscription MRR.", "en", "supply", "products")).toEqual([]);
    expect(refusedIn("Sur 100 inscrits, ton MRR", "fr", "supply", "products")).toEqual(["inscrit", "MRR"]);
    expect(refusedIn("Cost per sign-up, CAC", "en", "supply", "products")).toEqual(["sign-up", "CAC"]);
  });

  it("holds a slide of neither side to « SaaS », and, in « produits », to « client »", () => {
    expect(refusedIn("Pour ton SaaS", "fr", "common", "products")).toEqual(["SaaS"]);
    expect(refusedIn("Nos clients", "fr", "common", "products")).toEqual(["client"]);
    expect(refusedIn("Our customers", "en", "common", "products")).toEqual(["customer"]);
    // In « services », « client » is the word for the buyer: the common rule does not look for it.
    expect(refusedIn("Nos clients", "fr", "common", "services")).toEqual([]);
  });

  it("refuses the words of « produits » in « services », whatever the side", () => {
    expect(refusedIn("Les acheteurs passent une commande", "fr", "common", "services")).toEqual(["acheteurs", "commande"]);
    expect(refusedIn("The buyers place an order", "en", "demand", "services")).toEqual(["buyers", "order"]);
    // « client » is the buyer's word in « services »; the rest of the demand's rule still applies there.
    expect(refusedIn("Les clients réservent", "fr", "demand", "services")).toEqual([]);
    expect(refusedIn("Les clients payants, ton MRR", "fr", "demand", "services")).toEqual(["payant", "MRR"]);
  });

  it("takes out of a supply text the named phrases and no word more", () => {
    expect(refusedIn("La conversion : garder un abonné.", "fr", "supply", "products")).toEqual([]);
    expect(refusedIn("Abonnés sous 60 jours", "fr", "supply", "services")).toEqual([]);
    expect(refusedIn("Keeping a subscriber", "en", "supply", "products")).toEqual([]);
    // The same bare noun anywhere else, or a SaaS word beside the phrase, is still refused.
    expect(refusedIn("Garder un abonné et un client", "fr", "supply", "products")).toEqual(["client"]);
    expect(refusedIn("Les abonnés restent", "fr", "supply", "products")).toEqual(["abonné"]);
    expect(refusedIn("Les abonnés restent", "fr", "demand", "products")).toEqual(["abonné"]);
  });

  it("names phrases that are all still in their leaf, in their language (an exception that stops being one leaves the list)", () => {
    const leaf = (path: string) => path.split(".").reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], ENGINE_COPY) as { fr: string; en: string };
    for (const { path, locale, phrase } of SUPPLY_NAMED_PHRASES) expect(leaf(path)[locale], `${path} ${locale}`).toContain(phrase);
    // Each one holds a word of the rule, or it would be a dead entry.
    for (const { phrase, locale } of SUPPLY_NAMED_PHRASES) expect(SUPPLY_WORDS[locale].test(phrase), `${phrase} holds no word of the rule: drop it from the list`).toBe(true);
  });

  it("holds any other text of the tool to « SaaS » alone, and, in « services », to the words of « produits »", () => {
    expect(refusedIn("Ton SaaS, tes clients", "fr", "anywhere", "products")).toEqual(["SaaS"]);
    expect(refusedIn("Tes acheteurs", "fr", "anywhere", "products")).toEqual([]);
    expect(refusedIn("Tes acheteurs", "fr", "anywhere", "services")).toEqual(["acheteurs"]);
  });

  it("splits a text export into the slides' sections by their index", () => {
    const sections = sectionsOf("Kicker\nPill\n\n## 1. First\n\n- a\n\n## 2. Second\n> note\n\nFooter");
    expect(sections.map((s) => s.index)).toEqual([null, 1, 2]);
    expect(sections[2]!.text).toContain("> note");
    expect(sections[0]!.text).not.toContain("## 1.");
  });
});
