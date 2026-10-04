import { describe, expect, it } from "vitest";
import { exampleState, hybridState, withEntry } from "@/lib/engine/__tests__/fixtures";
import { CTX_FR, FR } from "@/lib/engine/__tests__/props";
import { deriveEngine } from "@/lib/engine/derive";
import type { EngineState, MetricId } from "@/lib/engine/types";
import { numberRemaining } from "../BoardNumbers";
import { fill } from "../text";
import type { EngineView } from "../view";

/**
 * A number's screen's header, « 6 à faire » (A18 T3.b): what remains to find. In the hybrid it counts both
 * engines, since « Enregistre et continue » walks from one engine's numbers to the other's (A21.8).
 *
 * Non-vacuity: counted in the number's engine alone (the code before A21.8), the hybrid case says « Plus rien à
 * faire » and fails.
 */
function viewOf(state: EngineState): EngineView {
  const derived = deriveEngine(state, CTX_FR, null, FR.bridges, FR.strings.units);
  return { state, derived, strings: FR.strings, metrics: FR.metrics, derivedCopy: FR.derived, bridges: FR.bridges, ctx: CTX_FR, tourResult: null, tourOnDevice: false, deviceTour: null };
}

/** The state with these numbers back to « à faire ». */
function onlyTodo(state: EngineState, ids: readonly MetricId[]): EngineState {
  return ids.reduce((s, id) => withEntry(s, id, undefined), state);
}

describe("numberRemaining", () => {
  it("one engine: what remains in it", () => {
    expect(numberRemaining("act.rate", viewOf(exampleState()))).toBe(FR.strings.list.noneToGo);
    expect(numberRemaining("act.rate", viewOf(onlyTodo(exampleState(), ["act.rate"])))).toBe(FR.strings.list.lastOne);
  });

  it("the hybrid: self-serve done, one sales-assisted number left — the self-serve margin's sheet does not say « Plus rien à faire »", () => {
    // §18.9's hybrid: every self-serve number in, sales-assisted's time to go live still « à faire ». Counted in the
    // margin's engine alone, its sheet said « Plus rien à faire » over « Enregistre et continue → », which leads there.
    const view = viewOf(hybridState());
    expect(numberRemaining("rev.gross-margin", view)).toBe(FR.strings.list.lastOne);
    expect(numberRemaining("slg.act.time-to-live", view)).toBe(FR.strings.list.lastOne);
    expect(numberRemaining("rev.gross-margin", viewOf(onlyTodo(hybridState(), ["act.rate"])))).toBe(fill(FR.strings.list.toGo, { n: 2 }));
  });
});
