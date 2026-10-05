import { describe, expect, it } from "vitest";
import { derivedFor, metricsFor } from "@/app/[locale]/aarrr-funnel-template/_engine/view";
import { displayDerivedShapeOf, displayShapeOf } from "../business-type";
import { ALL_DERIVED_SHAPES, ALL_METRIC_SHAPES, APP_DERIVED_SHAPES, APP_METRIC_SHAPES, derivedShapesOf, shapesOf, type SetupShapes } from "../catalog-shape";
import { SHARED_COUNTS, sharedWith } from "../shared-counts";
import type { MetricId } from "../types";
import { EN, FR } from "./props";

/**
 * What the page hands the island (engine spec §21.4.7, A22 APP-1 and APP-2): the SaaS catalogue in `metrics` and
 * `derived`, alone — the app's six numbers and four figures travel in `typeCatalogs` (below), never here; a SaaS engine's
 * payload gains nothing from the app.
 *
 * Non-vacuity, measured on 2026-10-05: taking either `filter` out of `resolveEngineProps` fails the same three tests
 * below (39 numbers, or 12 figures, arrive). The second block (the shared line) is measured with `sharedWith`'s
 * sabotages, listed in shared-counts.test.ts: `named` ignored fails its three tests (two for the 33 numbers, one for
 * the link and the cost per install).
 */
describe("the island's catalogue props", () => {
  it.each([
    ["fr", FR],
    ["en", EN],
  ] as const)("carry the 33 numbers and the 8 computed figures of the SaaS, in %s — a count, not a list of names", (_locale, props) => {
    expect(props.metrics).toHaveLength(33);
    expect(props.derived).toHaveLength(8);
  });

  it("carry no id of the app's, and every id of the others", () => {
    for (const props of [FR, EN]) {
      expect(props.metrics.filter((m) => m.id.startsWith("app."))).toEqual([]);
      expect(props.derived.filter((d) => d.id.startsWith("app."))).toEqual([]);
      expect(props.metrics.map((m) => m.id)).toEqual(ALL_METRIC_SHAPES.filter((s) => s.scope !== "app").map((s) => s.id));
      expect(props.derived.map((d) => d.id)).toEqual(ALL_DERIVED_SHAPES.filter((s) => !s.id.startsWith("app.")).map((s) => s.id));
    }
  });
});

/**
 * The line under a number's boxes (« changer ce compte ici le change partout », `MetricSheet`'s `sharedSides`) as a
 * SaaS engine gets it (engine spec §21.2.4, A22 APP-1): `monthSignups` now carries `app.acq.cpi`, which these props
 * do not, so the sheet of `acq.signup-rate` threw until `sharedWith` took the view's numbers as the ones it may name.
 * The expectation below is read from `SHARED_COUNTS` and the id prefix alone, not from `sharedWith`: every place of a
 * group but the app's, the link included.
 */
describe("the shared line of a SaaS engine's numbers", () => {
  /** The places of the group `id` carries on `side`, itself and the app's left out — [] without a group. */
  function expected(id: MetricId, side: "numerator" | "denominator"): MetricId[] {
    const group = Object.values(SHARED_COUNTS).find((slots) => slots.some((slot) => slot.metric === id && slot.side === side));
    return (group ?? []).map((slot) => slot.metric).filter((m) => m !== id && !m.startsWith("app."));
  }

  it.each([
    ["fr", FR],
    ["en", EN],
  ] as const)("names, for each of the 33 numbers and each side, exactly the places of its group that are not the app's, in %s", (_locale, props) => {
    const named = new Set<MetricId>(props.metrics.map((m) => m.id));
    let withGroup = 0;
    let sides = 0;
    for (const { id } of props.metrics) {
      for (const side of ["numerator", "denominator"] as const) {
        const want = expected(id, side);
        expect(sharedWith(id, side, named), `${id} ${side}`).toEqual(want);
        sides += 1;
        if (want.length > 0) withGroup += 1;
      }
    }
    // Not vacuous: 66 sides read, and the 18 shared places of the SaaS groups all name someone.
    expect(sides).toBe(66);
    expect(withGroup).toBe(18);
  });

  it("keeps the link in the sales-assisted line, and never names the cost per install", () => {
    const named = new Set<MetricId>(FR.metrics.map((m) => m.id));
    expect(sharedWith("slg.ref.referred-share", "denominator", named)).toEqual(["link.pql-handoff"]);
    expect(sharedWith("acq.signup-rate", "numerator", named)).toEqual(["acq.top-channel-share"]);
    expect(sharedWith("acq.top-channel-share", "denominator", named)).toEqual(["acq.signup-rate"]);
    for (const { id } of FR.metrics) {
      for (const side of ["numerator", "denominator"] as const) expect(sharedWith(id, side, named), `${id} ${side}`).not.toContain("app.acq.cpi");
    }
  });
});

/**
 * The consumer app's own catalogue (engine spec §21.4.7, A22 APP-2): the fifteen self-serve numbers it keeps in its own
 * words, then its six, and its figures, resolved like the SaaS's and chosen per type by `metricsFor` / `derivedFor`.
 *
 * Non-vacuity, measured on 2026-10-05 (each sabotage applied alone, the unit's test files run, then restored): `metricsFor`
 * handing an app the SaaS's `metrics` falls 3; the six `app.*` left out of `typeCatalogs` falls 6.
 */
describe("the island's consumer-app catalogue (`typeCatalogs`)", () => {
  const THREE: SetupShapes = {
    type: "consumer-app",
    motions: { plg: true, slg: false },
    monetization: { subscriptions: true, purchases: true, ads: true },
  };

  it.each([
    ["fr", FR],
    ["en", EN],
  ] as const)("carries the 21 numbers and the 6 figures an app can show, in %s", (_locale, props) => {
    const catalog = props.typeCatalogs["consumer-app"];
    expect(catalog.metrics).toHaveLength(21);
    expect(catalog.derived).toHaveLength(6);
  });

  it("lists them in the order the app shows them: the fifteen it keeps, then its six; rev.grr and rev.nrr, then its four", () => {
    for (const props of [FR, EN]) {
      const catalog = props.typeCatalogs["consumer-app"];
      // With all three ways ticked, `shapesOf` and `derivedShapesOf` list everything an app can show, in their order.
      expect(catalog.metrics.map((m) => m.id)).toEqual(shapesOf(THREE).map((s) => s.id));
      expect(catalog.derived.map((d) => d.id)).toEqual(derivedShapesOf(THREE).map((s) => s.id));
      expect(catalog.metrics.slice(15).map((m) => m.id)).toEqual(APP_METRIC_SHAPES.map((s) => s.id));
      expect(catalog.derived.slice(2).map((d) => d.id)).toEqual(APP_DERIVED_SHAPES.map((s) => s.id));
    }
  });

  it("never carries the two numbers an app replaces, nor a figure only a SaaS shows", () => {
    for (const props of [FR, EN]) {
      const ids = new Set<string>(props.typeCatalogs["consumer-app"].metrics.map((m) => m.id));
      expect(ids.has("acq.cac")).toBe(false);
      expect(ids.has("rev.gross-margin")).toBe(false);
      for (const id of ["rev.ltv", "rev.cac-payback", "rev.ltv-cac"]) expect(props.typeCatalogs["consumer-app"].derived.map((d) => d.id)).not.toContain(id);
    }
  });

  it("says the app's words, not the SaaS's: « Taux d'installation », « Coût par installation » — and in English", () => {
    const named = (props: typeof FR, id: MetricId) => props.typeCatalogs["consumer-app"].metrics.find((m) => m.id === id)?.name;
    expect(named(FR, "acq.signup-rate")).toBe("Taux d'installation");
    expect(named(EN, "acq.signup-rate")).toBe("Install rate");
    expect(named(FR, "app.acq.cpi")).toBe("Coût par installation");
    expect(named(EN, "app.acq.cpi")).toBe("Cost per install");
    // …while the SaaS's own props keep theirs.
    expect(FR.metrics.find((m) => m.id === "acq.signup-rate")?.name).toBe("Taux d'inscription");
  });

  it("links each number to the glossary term the app DISPLAYS for it, in the page's language", () => {
    for (const [locale, props] of [["fr", FR], ["en", EN]] as const) {
      for (const m of props.typeCatalogs["consumer-app"].metrics) {
        expect(m.glossaryHref, `${locale} ${m.id}`).toMatch(new RegExp(`/glossary/${displayShapeOf(m.id, "consumer-app").glossary}$`));
        expect(m.glossaryHref, `${locale} ${m.id}`).toContain(locale === "fr" ? "/fr/" : "/en/");
      }
      for (const d of props.typeCatalogs["consumer-app"].derived) {
        expect(d.glossaryHref, `${locale} ${d.id}`).toMatch(new RegExp(`/glossary/${displayDerivedShapeOf(d.id, "consumer-app").glossary}$`));
      }
    }
  });

  it("is chosen per type by metricsFor / derivedFor — the SaaS's props for a SaaS, the app's for an app, the same arrays", () => {
    for (const props of [FR, EN]) {
      expect(metricsFor(props, "b2b-saas")).toBe(props.metrics);
      expect(derivedFor(props, "b2b-saas")).toBe(props.derived);
      expect(metricsFor(props, "consumer-app")).toBe(props.typeCatalogs["consumer-app"].metrics);
      expect(derivedFor(props, "consumer-app")).toBe(props.typeCatalogs["consumer-app"].derived);
    }
  });

  it("names, for every number the app shows with any ticked way, a prose entry — and the SaaS's own list is untouched", () => {
    for (const props of [FR, EN]) {
      const ids = new Set<string>(metricsFor(props, "consumer-app").map((m) => m.id));
      for (const shape of shapesOf(THREE)) expect(ids.has(shape.id), shape.id).toBe(true);
      expect(props.metrics.map((m) => m.id)).toEqual(ALL_METRIC_SHAPES.filter((s) => s.scope !== "app").map((s) => s.id));
      expect(props.derived.map((d) => d.id)).toEqual(ALL_DERIVED_SHAPES.filter((s) => !s.id.startsWith("app.")).map((s) => s.id));
    }
  });
});

/**
 * The line under a number's boxes as an APP gets it (engine spec §21.2.4, A22 APP-2): the app's catalogue names every
 * place of a group, `app.acq.cpi` included, so the sheet of the install rate says the cost per install shares its count.
 */
describe("the shared line of an app's numbers", () => {
  it("names the cost per install under the install rate and the top source, and each id it renders is named in the app's catalogue", () => {
    for (const props of [FR, EN]) {
      const named = new Set<MetricId>(metricsFor(props, "consumer-app").map((m) => m.id));
      expect(sharedWith("acq.signup-rate", "numerator", named)).toContain("app.acq.cpi");
      expect(sharedWith("acq.top-channel-share", "denominator", named)).toContain("app.acq.cpi");
      expect(sharedWith("app.acq.cpi", "denominator", named)).toEqual(["acq.signup-rate", "acq.top-channel-share"]);
      let rendered = 0;
      for (const { id } of metricsFor(props, "consumer-app")) {
        for (const side of ["numerator", "denominator"] as const) {
          for (const other of sharedWith(id, side, named)) {
            rendered += 1;
            const name = metricsFor(props, "consumer-app").find((m) => m.id === other)?.name;
            expect(name?.trim(), `${id} ${side} names ${other}`).toBeTruthy();
          }
        }
      }
      // Not vacuous: the groups an app holds (installs of the month, cohort sign-ups, actives) do name each other.
      expect(rendered).toBeGreaterThan(10);
      // The actives' group: both per-active revenues, each naming the other.
      expect(sharedWith("app.rev.purchases-per-active", "denominator", named)).toEqual(["app.rev.ads-per-active"]);
    }
  });
});
