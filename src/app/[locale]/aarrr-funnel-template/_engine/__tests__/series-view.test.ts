import { describe, expect, it } from "vitest";
import { estimated, exampleState, measured, ratio, withMonthBefore } from "@/lib/engine/__tests__/fixtures";
import { CTX_EN, CTX_FR, EN, FR } from "@/lib/engine/__tests__/props";
import { deriveEngine } from "@/lib/engine/derive";
import type { EngineState } from "@/lib/engine/types";
import { previousLeakLine, rowDelta } from "../series-view";
import type { EngineView } from "../view";

/**
 * The monthly series in the board's words (A14 T2, engine spec §19.2.5): a
 * number's change on its row, and the leak of the month before in the
 * diagnosis — read from the same printers as the slide, in « tu ».
 *
 * Non-vacuity: see the journal's T2 entry.
 */

const props = { fr: { ...FR, ctx: CTX_FR }, en: { ...EN, ctx: CTX_EN } } as const;
const amplitude = { kind: "tool", tool: "amplitude" } as const;
const stripe = { kind: "tool", tool: "stripe" } as const;

function viewOf(state: EngineState, locale: "fr" | "en" = "fr"): EngineView {
  const p = props[locale];
  const derived = deriveEngine(state, p.ctx, null, p.bridges, p.strings.units);
  return { state, derived, strings: p.strings, metrics: p.metrics, derivedCopy: p.derived, bridges: p.bridges, ctx: p.ctx, tourResult: null, tourOnDevice: false, deviceTour: null };
}

/** July before the example's August: activation 15 % then 18 %, churn estimated in July. */
function twoMonths(): EngineState {
  return withMonthBefore(exampleState(), (july) => {
    july.metrics["act.rate"] = measured(ratio(120, 800), amplitude);
    july.metrics["ret.logo-churn"] = estimated(2, 3);
  });
}

describe("rowDelta — a number's change since the month before, on its row", () => {
  it("nothing with one month: a v1 or v2 engine's rows are unchanged", () => {
    expect(rowDelta("act.rate", viewOf(exampleState()))).toBeNull();
  });

  it("a change in points, with « vers ta cible » when a number behind its target moved its way", () => {
    expect(rowDelta("act.rate", viewOf(twoMonths()))).toBe("+3 points depuis juillet 2026, vers ta cible");
    expect(rowDelta("act.rate", viewOf(twoMonths(), "en"))).toBe("+3 points since July 2026, toward your target");
  });

  it("stable, and why two months don't compare; nothing for a number this month doesn't have", () => {
    const view = viewOf(twoMonths());
    expect(rowDelta("acq.signup-rate", view)).toBe("stable depuis juillet 2026");
    expect(rowDelta("ret.logo-churn", view)).toBe("estimé en juillet 2026");
    expect(rowDelta("ret.d30", view)).toBeNull();
    // Estimated THIS month: the row's tag says « estimé » already, the delta says nothing.
    expect(rowDelta("act.ttv", view)).toBeNull();
    // A number that is no number has no change.
    expect(rowDelta("act.event", view)).toBeNull();
  });

  it("money in value and in percent, as on the slide", () => {
    const state = withMonthBefore(exampleState(), (july) => void (july.metrics["rev.arpa"] = measured(ratio(46_000, 400), stripe)));
    expect(rowDelta("rev.arpa", viewOf(state))).toBe("+5 € · +4,3 % depuis juillet 2026");
  });
});

describe("previousLeakLine — the month before's leak, when it changed stage", () => {
  it("nothing with one month, nor when the leak stayed", () => {
    expect(previousLeakLine(viewOf(exampleState()), "plg")).toBeNull();
    expect(previousLeakLine(viewOf(withMonthBefore(exampleState())), "plg")).toBeNull();
  });

  it("« En juillet 2026, la fuite était le churn logo. » when activation took its place", () => {
    const state = withMonthBefore(exampleState(), (july) => {
      july.metrics["act.rate"] = measured(ratio(200, 800), amplitude);
      july.metrics["ret.logo-churn"] = measured(ratio(16, 400), stripe);
    });
    expect(previousLeakLine(viewOf(state), "plg")).toBe("En juillet 2026, la fuite était le churn logo.");
    expect(previousLeakLine(viewOf(state, "en"), "plg")).toBe("In July 2026, the leak was logo churn.");
  });
});
