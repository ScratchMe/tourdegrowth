import { describe, expect, it } from "vitest";
import { ENGINE_COPY } from "@/content/engine-copy";
import { titleAccent } from "../title-accent";
import type { SlideTitleKey } from "../types";

/**
 * C53 (Antoine, 2026-10-03): the figures of the slide titles in ink, the red
 * kept for the verdict — what we can't see — and the diagnosis — what holds
 * the engine back (BAT nº9, d-verdict-red).
 *
 * Non-vacuity of the marketplace's titles (A23 MKT-7b, measured 2026-10-28): one of the eight left out of the red set falls
 * « red for the verdict and the diagnosis only » (1).
 */
const keys = Object.keys(ENGINE_COPY.slideTitles) as SlideTitleKey[];
const red = keys.filter((k) => titleAccent(k) === "red");

describe("titleAccent", () => {
  it("red for the verdict and the diagnosis only — twenty-four titles, the marketplace's eight included (A23 MKT-7b)", () => {
    expect(red.sort()).toEqual(
      [
        "leakClearUnpriced",
        "leakLevel",
        "leakNotEnoughBelow",
        "leakShared",
        "mktFunnelEmpty",
        "mktFunnelGapOne",
        "mktFunnelTailBreakOne",
        "mktSupplyFunnelEmpty",
        "mktSupplyFunnelGapOne",
        "mktSupplyFunnelTailBreakOne",
        "mktTotalUnknown",
        "mktTotalUnknownBoth",
        "pelotonEmpty",
        "pelotonGap",
        "pelotonGapOne",
        "pelotonTailBreak",
        "pelotonTailBreakOne",
        "slgPelotonEmpty",
        "slgPelotonGap",
        "slgPelotonGapOne",
        "slgPelotonTailBreak",
        "slgPelotonTailBreakOne",
        "totalUnknown",
        "totalUnknownBoth",
      ].sort(),
    );
  });

  it("every red title has an accent to paint, in both languages", () => {
    for (const k of red) for (const lang of ["fr", "en"] as const) expect(ENGINE_COPY.slideTitles[k][lang], `${k} ${lang}`).toContain("**");
  });

  it("a figure is ink: the funnel's payers, a priced leak, the what-ifs' gain, the unit economics, the total, the ask", () => {
    for (const k of ["pelotonComplete", "slgPelotonComplete", "leakClearMrrNew", "whatIfLever", "scenario", "unitEconomics", "unitEconomicsBoth", "total", "ask", "visibility", "mirror", "evolution", "mktTotal", "mktFunnelComplete", "mktSupplyFunnelComplete", "mktSupplyFunnelCompleteOne"] as const) {
      expect(titleAccent(k), k).toBe("ink");
    }
  });
});
