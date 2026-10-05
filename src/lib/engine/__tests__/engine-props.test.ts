import { describe, expect, it } from "vitest";
import { ALL_DERIVED_SHAPES, ALL_METRIC_SHAPES } from "../catalog-shape";
import { SHARED_COUNTS, sharedWith } from "../shared-counts";
import type { MetricId } from "../types";
import { EN, FR } from "./props";

/**
 * What the page hands the island (engine spec §21.4.7, A22 APP-1): the SaaS catalogue alone. The app's six numbers and
 * four figures exist in the code and in the server-side prose, but travel to no one until APP-2 builds the app's own
 * catalogue (`typeCatalogs`); a SaaS engine's payload gains nothing from this unit.
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
