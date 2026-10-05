import { describe, expect, it } from "vitest";
import { ENGINE_CATALOG_CONSUMER, ENGINE_DERIVED_CATALOG_CONSUMER } from "../engine-catalog-consumer";
import { ENGINE_CATALOG, ENGINE_DERIVED_CATALOG } from "../engine-catalog";
import { displayDerivedShapeOf, displayShapeOf } from "@/lib/engine/business-type";
import { APP_REPLACED, METRIC_SHAPES } from "@/lib/engine/catalog-shape";
import type { Translatable } from "@/lib/i18n/translatable";
import { catalogRules } from "./engine-test-helpers";

/**
 * The consumer app's catalogue (engine spec §21.4.6, A22 APP-2): the prose of the fifteen self-serve numbers it shows, in
 * its own words, and of the two computed figures it keeps. Whole entries, so the rules `engine-catalog.test.ts` holds for
 * the SaaS catalogue run on these (`catalogRules`), against the shapes the app DISPLAYS — which is what makes the new 20-30 %
 * of `ret.d30` be checked against the approved `retention` term, and each `where` against the app's own sources.
 *
 * Non-vacuity, measured on 2026-10-05 (each sabotage applied alone, the unit's test files run, then restored; the count
 * is the tests that fall): a `benchmarkCaveat` left on `acq.signup-rate`, whose reference the app removes, falls the
 * caveat rule (1); a SaaS word (« Inscrits ») put back in a label falls the vocabulary rule and the shared-count parity
 * of `shared-counts.test.ts` (2); the `ret.d30` reference taken off the displayed shape falls « has references to check »,
 * the caveat rule and the addition's test (3).
 */

const IDS = METRIC_SHAPES.map((s) => s.id).filter((id) => !APP_REPLACED.includes(id));
const SHAPES = IDS.map((id) => displayShapeOf(id, "consumer-app"));
const DERIVED_SHAPES = (["rev.grr", "rev.nrr"] as const).map((id) => displayDerivedShapeOf(id, "consumer-app"));

// The floor of references is two: the retention's 20-30 % (added) and the viral coefficient's (kept), the only ones an app shows.
catalogRules("the consumer app's catalogue", ENGINE_CATALOG_CONSUMER, ENGINE_DERIVED_CATALOG_CONSUMER, SHAPES, DERIVED_SHAPES, {
  minReferences: 2,
  carriesPeriod: false,
});

describe("the consumer app's catalogue: shape ↔ prose (§21.4.6, D6)", () => {
  it("has the prose of exactly the fifteen numbers an app keeps, in the shapes' order, and of the two figures", () => {
    expect(Object.keys(ENGINE_CATALOG_CONSUMER)).toEqual(IDS);
    expect(IDS).toHaveLength(15);
    expect(Object.keys(ENGINE_DERIVED_CATALOG_CONSUMER)).toEqual(["rev.grr", "rev.nrr"]);
  });

  it("labels exactly the closed-list ids the shape declares — the SaaS's own, id for id, in the same order", () => {
    for (const shape of SHAPES) {
      const prose = ENGINE_CATALOG_CONSUMER[shape.id as keyof typeof ENGINE_CATALOG_CONSUMER];
      expect(prose.variants?.map((v) => v.id), `${shape.id} variants`).toEqual(shape.variants);
      expect(prose.naReasons?.map((v) => v.id), `${shape.id} naReasons`).toEqual(shape.naReasons);
      expect(prose.choices?.map((v) => v.id), `${shape.id} choices`).toEqual(shape.choices);
    }
  });

  it("prints a caveat next to the reference it displays — and only there — and a reason where a number has none to show", () => {
    for (const shape of SHAPES) {
      const prose = ENGINE_CATALOG_CONSUMER[shape.id as keyof typeof ENGINE_CATALOG_CONSUMER];
      if (shape.benchmark) {
        expect(prose.benchmarkCaveat, shape.id).toBeDefined();
        expect(prose.noReferenceReason, shape.id).toBeUndefined();
      } else {
        expect(prose.benchmarkCaveat, shape.id).toBeUndefined();
        // A number a person types (not an event or a closed choice) says why it has no reference.
        if (shape.unit !== "text" && shape.unit !== "choice") expect(prose.noReferenceReason, shape.id).toBeDefined();
      }
    }
  });

  it("names the two counts of every number entered as counts, and at most three places to look", () => {
    for (const shape of SHAPES) {
      const prose = ENGINE_CATALOG_CONSUMER[shape.id as keyof typeof ENGINE_CATALOG_CONSUMER];
      if (shape.valueKinds.includes("ratio")) expect(prose.inputs, shape.id).toBeDefined();
      expect(prose.where.length, shape.id).toBeGreaterThan(0);
      expect(prose.where.length, shape.id).toBeLessThanOrEqual(3);
    }
  });

  it("puts the stores first for the install rate, as the table of §21.4.3 does (the sheet offers the sources in this order)", () => {
    const tools = (id: keyof typeof ENGINE_CATALOG_CONSUMER) => ENGINE_CATALOG_CONSUMER[id].where.flatMap((w) => (w.source.kind === "tool" ? [w.source.tool] : []));
    expect(tools("acq.signup-rate")).toEqual(["app-store-connect", "play-console", "appsflyer"]);
    expect(tools("ret.logo-churn")).toEqual(["revenuecat", "stripe"]);
  });
});

describe("the consumer app's catalogue speaks the app's words (C57: installs and subscribers, not sign-ups and customers)", () => {
  const all = (tree: unknown, locale: "fr" | "en", out: string[] = []): string[] => {
    if (!tree || typeof tree !== "object") return out;
    const record = tree as Record<string, unknown>;
    if (typeof record.fr === "string" && typeof record.en === "string") out.push(record[locale] as string);
    else for (const child of Object.values(record)) all(child, locale, out);
    return out;
  };

  it("never says « inscrit », « inscription » or « client » in French, nor sign-up or customer in English", () => {
    const offenders = [
      ...[...all(ENGINE_CATALOG_CONSUMER, "fr"), ...all(ENGINE_DERIVED_CATALOG_CONSUMER, "fr")].filter((s) => /inscri|\bclients?\b/i.test(s)),
      ...[...all(ENGINE_CATALOG_CONSUMER, "en"), ...all(ENGINE_DERIVED_CATALOG_CONSUMER, "en")].filter((s) => /sign-?ups?\b|\bcustomers?\b/i.test(s)),
    ];
    expect(offenders).toEqual([]);
  });

  it("rewrites every number the spec words differently: the name, or the sentence, is not the SaaS's", () => {
    const texts = (t: Translatable | undefined) => (t ? [t.fr, t.en] : []);
    // The seven that count sign-ups, customers or logos in the SaaS; the others keep part of their SaaS prose, as the spec says.
    for (const id of ["acq.signup-rate", "act.rate", "ret.d30", "ret.logo-churn", "ref.referred-share", "rev.paid-conversion", "rev.arpa"] as const) {
      const app = ENGINE_CATALOG_CONSUMER[id];
      const saas = ENGINE_CATALOG[id];
      expect(texts(app.oneLiner), id).not.toEqual(texts(saas.oneLiner));
      expect(texts(app.formula), id).not.toEqual(texts(saas.formula));
    }
    // The two figures keep the SaaS's maths and rewrite their reserve only (§21.4.6, « Les deux calculés »).
    for (const id of ["rev.grr", "rev.nrr"] as const) {
      const app = ENGINE_DERIVED_CATALOG_CONSUMER[id];
      const saas = ENGINE_DERIVED_CATALOG[id];
      expect(app.name).toEqual(saas.name);
      expect(app.formula).toEqual(saas.formula);
      expect(app.uncomputable).toEqual(saas.uncomputable);
      expect(app.caveat).not.toEqual(saas.caveat);
    }
  });
});
