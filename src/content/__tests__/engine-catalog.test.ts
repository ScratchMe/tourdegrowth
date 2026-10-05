import { describe, expect, it } from "vitest";
import { ENGINE_CATALOG, ENGINE_DERIVED_CATALOG } from "../engine-catalog";
import { ENGINE_COPY } from "../engine-copy";
import { ALL_DERIVED_SHAPES, ALL_METRIC_SHAPES, APP_DERIVED_SHAPES, APP_METRIC_SHAPES, LTV_CAP_MONTHS } from "@/lib/engine/catalog-shape";
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
  it.each(["rev.ltv", "slg.rev.ltv", "app.rev.install-ltv"] as const)("writes the LTV cap with the constant the calculation uses (%s)", (id) => {
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
