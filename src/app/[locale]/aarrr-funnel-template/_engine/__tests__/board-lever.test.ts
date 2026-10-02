import { describe, expect, it } from "vitest";
import { diagnose } from "@/lib/engine/diagnose";
import type { EngineState, MetricId } from "@/lib/engine/types";
import { exampleState, withoutTargets } from "@/lib/engine/__tests__/fixtures";
import { CTX_EN, EN } from "@/lib/engine/__tests__/props";
import { cardLever } from "../BoardLever";
import { leverRows, scenarioFor } from "../scenario-view";

/**
 * Which lever « Et si ? » shows on the board (design system extension 07,
 * A18 T2.c): the one of the stage a team target names, else the first typed
 * lever in the funnel's order — never one with no value, which has no slider.
 *
 * Non-vacuity: picking the first typed lever whatever the target fails the
 * first case (the example's first lever is the sign-up rate, not activation).
 */
const rows = (state: EngineState) => leverRows(scenarioFor(state, {}, CTX_EN), CTX_EN, EN.strings, state.setup.currency, EN.metrics);
const named = (state: EngineState): MetricId[] => {
  const d = diagnose(state, CTX_EN);
  return d.state === "clear" || d.state === "shared" ? d.named : [];
};

describe("cardLever", () => {
  it("the example: the target names activation, and its rate is the lever", () => {
    const state = exampleState();
    expect(named(state)).toEqual(["act.rate"]);
    expect(cardLever(rows(state), named(state))).toMatchObject({ row: { id: "act.rate" }, byStage: true });
  });

  it("no target: the first typed lever in the funnel's order, and the card says no stage", () => {
    const state = withoutTargets(exampleState());
    expect(named(state)).toEqual([]);
    const chosen = cardLever(rows(state), []);
    expect(chosen?.byStage).toBe(false);
    expect(chosen?.row.id).toBe(rows(state).find((r) => r.today !== null)!.id);
    // Not activation: the first case holds the target's lever, not the funnel's first.
    expect(chosen?.row.id).not.toBe("act.rate");
  });

  it("a named number that is not a lever: the first typed lever of its stage", () => {
    const state = exampleState();
    expect(cardLever(rows(state), ["act.ttv"])).toMatchObject({ row: { id: "act.rate" }, byStage: true });
  });

  it("no lever typed: no card", () => {
    expect(cardLever(rows(exampleState()).map((r) => ({ ...r, today: null })), ["act.rate"])).toBeNull();
  });
});
