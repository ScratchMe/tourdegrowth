import { describe, expect, it } from "vitest";
import { EXAMPLE_TODAY, exampleState, hybridState } from "@/lib/engine/__tests__/fixtures";
import { EN, FR } from "@/lib/engine/__tests__/props";
import { catalogFill, metricById } from "../text";

/**
 * The sheet's own catalogue filler (it fills the draft's window and variant,
 * not the saved ones, so it is not `phrases.ts#catalogueValues`). Since the
 * sales-assisted prose (A7.3.c S2) it fills `{period}` too: without it a
 * sales-assisted sheet printed « Leads créés {period} » as a field label.
 * Non-vacuity, measured on 2026-10-01: dropping the `period` slot from
 * `catalogFill` fails both tests below.
 */
describe("catalogFill — {period}", () => {
  it("fills the months a sales-assisted number covers, with its preposition", () => {
    const state = hybridState();
    const label = metricById(FR.metrics, "slg.acq.lead-to-opp").inputs!.denominator;
    const filled = catalogFill(label, {
      state,
      locale: "fr",
      strings: FR.strings,
      metrics: FR.metrics,
      windowDays: 30,
      period: { id: "slg.acq.lead-to-opp", today: EXAMPLE_TODAY },
    });
    expect(filled).toBe("Leads créés de mai à juillet 2026");
    const en = catalogFill(metricById(EN.metrics, "slg.ret.renewal").formula, {
      state,
      locale: "en",
      strings: EN.strings,
      metrics: EN.metrics,
      windowDays: null,
      period: { id: "slg.ret.renewal", today: EXAMPLE_TODAY },
    });
    expect(en).toContain("up for renewal from June to August 2026");
    expect(en).not.toMatch(/[{}]/);
  });

  it("a self-serve sheet keeps its month, and every number of every motion fills without a brace", () => {
    for (const [state, props, locale] of [
      [hybridState(), FR, "fr"],
      [exampleState(), EN, "en"],
    ] as const) {
      for (const metric of props.metrics) {
        for (const text of [metric.formula, metric.request, metric.inputs?.numerator ?? "", metric.inputs?.denominator ?? ""]) {
          const filled = catalogFill(text, {
            state,
            locale,
            strings: props.strings,
            metrics: props.metrics,
            windowDays: 7,
            variantLabel: "x",
            period: { id: metric.id, today: EXAMPLE_TODAY },
          });
          expect(filled, `${metric.id}: ${text}`).not.toMatch(/[{}]/);
        }
      }
    }
  });
});
