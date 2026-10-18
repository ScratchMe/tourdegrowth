import { describe, expect, it } from "vitest";
import { ENGINE_CATALOG, ENGINE_DERIVED_CATALOG } from "../engine-catalog";
import { ENGINE_COPY } from "../engine-copy";
import { ALL_DERIVED_SHAPES, ALL_METRIC_SHAPES, APP_DERIVED_SHAPES, APP_METRIC_SHAPES, LTV_CAP_MONTHS, MKT_DERIVED_SHAPES, MKT_METRIC_SHAPES } from "@/lib/engine/catalog-shape";
import { LOCALES } from "@/lib/i18n/locale";
import { catalogRules } from "./engine-test-helpers";

/**
 * The growth engine's catalogue prose (engine spec §5, content PR P3).
 *
 * The shape ↔ prose id match, the closed-list labels and "a caveat next to
 * every reference" are pinned by `lib/engine/__tests__/catalog-shape.test.ts`
 * (P0). This file pins what the PROSE promises on top of that: that its
 * references never drift from the approved glossary, that everything a slide
 * can print stays inside the three fonts, that its placeholders are the six
 * the consumers fill, and that French never needs an elision a template
 * cannot make. Every catalogue: self-serve's, sales-assisted's and the
 * link's (A7.3.c S2), whose records are keyed by every id the types know.
 */

// The rules that hold for every engine catalogue (references, placeholders, slides, the prose itself) live in
// `engine-test-helpers.ts#catalogRules`: this file runs them on the SaaS catalogue (all three motions' entries and
// the app's own six, which the record holds too), and `engine-catalog-consumer.test.ts` on the consumer app's.
catalogRules("", ENGINE_CATALOG, ENGINE_DERIVED_CATALOG, ALL_METRIC_SHAPES, ALL_DERIVED_SHAPES, { minReferences: 7, carriesPeriod: true });

describe("references never drift from the approved glossary", () => {
  it.each(["rev.ltv", "slg.rev.ltv", "app.rev.install-ltv", "mkt.rev.ltv", "mkt.sell.ltv"] as const)("writes the LTV cap with the constant the calculation uses (%s)", (id) => {
    const ltv = ENGINE_DERIVED_CATALOG[id];
    for (const locale of LOCALES) {
      expect(ltv.formula[locale]).toContain(String(LTV_CAP_MONTHS));
      expect(ltv.capNote?.[locale]).toContain(String(LTV_CAP_MONTHS));
      expect(ENGINE_COPY.slide.unitCap[locale]).toContain(String(LTV_CAP_MONTHS));
    }
  });
});

describe("the consumer app's prose (engine spec §21.4.4 and §21.4.5, A22 APP-1)", () => {
  it("has the prose of its six numbers and four figures — the records are keyed by every id, so none can be missing", () => {
    for (const shape of APP_METRIC_SHAPES) expect(ENGINE_CATALOG[shape.id], shape.id).toBeDefined();
    for (const shape of APP_DERIVED_SHAPES) expect(ENGINE_DERIVED_CATALOG[shape.id], shape.id).toBeDefined();
    expect(APP_METRIC_SHAPES).toHaveLength(6);
    expect(APP_DERIVED_SHAPES).toHaveLength(4);
  });

  it("prints no reference caveat for them (D14: none carries a reference) — a 'no reference' reason instead", () => {
    for (const shape of APP_METRIC_SHAPES) {
      expect(ENGINE_CATALOG[shape.id].benchmarkCaveat, shape.id).toBeUndefined();
      expect(ENGINE_CATALOG[shape.id].noReferenceReason, shape.id).toBeDefined();
    }
    for (const shape of APP_DERIVED_SHAPES) expect(ENGINE_DERIVED_CATALOG[shape.id].caveat, shape.id).toBeUndefined();
  });

  it("names both counts of each, so the sheet can ask for them (and `cpi` and the two per-active revenues share theirs)", () => {
    for (const shape of APP_METRIC_SHAPES) {
      const inputs = ENGINE_CATALOG[shape.id].inputs;
      expect(inputs, shape.id).toBeDefined();
      for (const l of LOCALES) expect(inputs!.numerator[l].trim() && inputs!.denominator[l].trim(), `${shape.id}.${l}`).toBeTruthy();
    }
    expect(ENGINE_CATALOG["app.rev.purchases-per-active"].inputs?.denominator).toEqual(ENGINE_CATALOG["app.rev.ads-per-active"].inputs?.denominator);
  });

  it("gives the cost per install the variants of the CAC, id for id and label for label", () => {
    expect(ENGINE_CATALOG["app.acq.cpi"].variants).toEqual(ENGINE_CATALOG["acq.cac"].variants);
  });
});

// Non-vacuity, measured on 2026-10-18 (each sabotage alone, the tests of `src/lib/engine`, `src/content`, `src/app` and
// `src/__tests__` run, then put back): the `mkt.sell.first-sale` reason replaced by its own words falls the « same reason »
// test (1); `mkt.liq.fill-rate`'s variant label back at its first length (47 characters, for a limit of 40) falls the
// short-enough rule of `catalogRules` (1); a `benchmarkCaveat` added to a marketplace number falls the no-reference test
// below and « a caveat next to every reference » of catalog-shape.test.ts (2); the cap note taken off `mkt.sell.ltv`
// falls the cap test and the figures test (2).
describe("the marketplace's prose (engine spec §22.4.4, A23 MKT-1)", () => {
  it("has the prose of its nineteen numbers and six figures — the records are keyed by every id, so none can be missing", () => {
    for (const shape of MKT_METRIC_SHAPES) expect(ENGINE_CATALOG[shape.id], shape.id).toBeDefined();
    for (const shape of MKT_DERIVED_SHAPES) expect(ENGINE_DERIVED_CATALOG[shape.id], shape.id).toBeDefined();
    expect(MKT_METRIC_SHAPES).toHaveLength(19);
    expect(MKT_DERIVED_SHAPES).toHaveLength(6);
  });

  it("prints no reference caveat for them (D12, C73: none carries a reference) — a 'no reference' reason each", () => {
    for (const shape of MKT_METRIC_SHAPES) {
      expect(ENGINE_CATALOG[shape.id].benchmarkCaveat, shape.id).toBeUndefined();
      expect(ENGINE_CATALOG[shape.id].noReferenceReason, shape.id).toBeDefined();
    }
    // The two paybacks carry the commonly-cited-reference caveat and nothing else; the LTV:CACs none.
    expect(Object.keys(ENGINE_DERIVED_CATALOG).filter((id) => id.startsWith("mkt.") && ENGINE_DERIVED_CATALOG[id as keyof typeof ENGINE_DERIVED_CATALOG].caveat)).toEqual(["mkt.rev.cac-payback", "mkt.sell.cac-payback"]);
    expect(ENGINE_DERIVED_CATALOG["mkt.sell.cac-payback"].caveat).toEqual(ENGINE_DERIVED_CATALOG["mkt.rev.cac-payback"].caveat);
  });

  it("names both counts of each, so the sheet can ask for them", () => {
    for (const shape of MKT_METRIC_SHAPES) {
      const inputs = ENGINE_CATALOG[shape.id].inputs;
      expect(inputs, shape.id).toBeDefined();
      for (const l of LOCALES) expect(inputs!.numerator[l].trim() && inputs!.denominator[l].trim(), `${shape.id}.${l}`).toBeTruthy();
    }
  });

  it("copies the reasons the specification says to copy: the first sale's from the first order, the sellers' churn from the buyers', the frequency's from the second order's", () => {
    expect(ENGINE_CATALOG["mkt.sell.first-sale"].noReferenceReason).toEqual(ENGINE_CATALOG["mkt.buy.first-order"].noReferenceReason);
    expect(ENGINE_CATALOG["mkt.sell.churn"].noReferenceReason).toEqual(ENGINE_CATALOG["mkt.buy.churn"].noReferenceReason);
    expect(ENGINE_CATALOG["mkt.rev.frequency"].noReferenceReason).toEqual(ENGINE_CATALOG["mkt.buy.repeat"].noReferenceReason);
  });

  it("gives both costs the variants of the CAC, id for id — the sellers' team label its own — and the fill rate its two kinds of request", () => {
    const cac = ENGINE_CATALOG["acq.cac"].variants!;
    expect(ENGINE_CATALOG["mkt.buy.cac"].variants).toEqual(cac);
    expect(ENGINE_CATALOG["mkt.sell.cac"].variants?.map((v) => v.id)).toEqual(cac.map((v) => v.id));
    expect(ENGINE_CATALOG["mkt.sell.cac"].variants?.filter((v) => v.id !== "plus-team")).toEqual(cac.filter((v) => v.id !== "plus-team"));
    expect(ENGINE_CATALOG["mkt.sell.cac"].variants?.find((v) => v.id === "plus-team")?.label).toEqual({ fr: "+ équipe offre", en: "+ supply team" });
    expect(ENGINE_CATALOG["mkt.liq.fill-rate"].variants?.map((v) => v.id)).toEqual(["requests", "searches"]);
  });

  it("writes the figures as the app's: an 'uncomputable' line each, a cap note on the two LTVs only", () => {
    for (const shape of MKT_DERIVED_SHAPES) {
      const entry = ENGINE_DERIVED_CATALOG[shape.id];
      expect(entry.uncomputable, shape.id).toEqual(ENGINE_DERIVED_CATALOG["rev.ltv"].uncomputable);
      expect(entry.capNote !== undefined, shape.id).toBe(shape.id === "mkt.rev.ltv" || shape.id === "mkt.sell.ltv");
    }
    expect(ENGINE_DERIVED_CATALOG["mkt.rev.ltv"].capNote).toEqual(ENGINE_DERIVED_CATALOG["rev.ltv"].capNote);
    expect(ENGINE_DERIVED_CATALOG["mkt.sell.ltv"].capNote).toEqual(ENGINE_DERIVED_CATALOG["rev.ltv"].capNote);
  });

  it("names the Tour-bridged and liquidity numbers in the marketplace's own words: the first order, the first sale, the fill rate", () => {
    expect(ENGINE_CATALOG["mkt.buy.first-order"].name.fr).toBe("Première commande");
    expect(ENGINE_CATALOG["mkt.sell.first-sale"].name.fr).toBe("Première vente");
    expect(ENGINE_CATALOG["mkt.liq.fill-rate"].name.en).toBe("Fill rate");
  });
});
