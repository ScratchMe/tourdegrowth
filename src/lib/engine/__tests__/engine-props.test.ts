import { describe, expect, it } from "vitest";
import { ALL_DERIVED_SHAPES, ALL_METRIC_SHAPES } from "../catalog-shape";
import { EN, FR } from "./props";

/**
 * What the page hands the island (engine spec §21.4.7, A22 APP-1): the SaaS catalogue alone. The app's six numbers and
 * four figures exist in the code and in the server-side prose, but travel to no one until APP-2 builds the app's own
 * catalogue (`typeCatalogs`); a SaaS engine's payload gains nothing from this unit.
 *
 * Non-vacuity, measured on 2026-10-05: taking either `filter` out of `resolveEngineProps` fails the same three tests
 * below (39 numbers, or 12 figures, arrive).
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
