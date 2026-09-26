import { describe, expect, it } from "vitest";

import { METRIC_SHAPES } from "@/lib/engine/catalog-shape";
import { emptyState, exampleState } from "@/lib/engine/__tests__/fixtures";
import { NUMBER_COUNT, nextPosition, phaseOf, previousPosition, resumePosition, type StepPosition } from "../steps-model";

describe("the step-by-step's positions", () => {
  it("walks targets → base → the fifteen numbers in catalogue order → what if → done, and back the same way", () => {
    const walk: StepPosition[] = [{ phase: "targets" }];
    while (walk.at(-1)!.phase !== "done") walk.push(nextPosition(walk.at(-1)!));
    expect(walk).toHaveLength(1 + 1 + NUMBER_COUNT + 1 + 1);
    expect(NUMBER_COUNT).toBe(METRIC_SHAPES.length);
    expect(walk.map(phaseOf)).toEqual(["targets", ...Array(NUMBER_COUNT + 1).fill("numbers"), "whatif", "deck"]);
    const back: StepPosition[] = [walk.at(-1)!];
    while (back.at(-1)!.phase !== "targets") back.push(previousPosition(back.at(-1)!));
    expect(back.reverse()).toEqual(walk);
    // The ends hold.
    expect(previousPosition({ phase: "targets" })).toEqual({ phase: "targets" });
    expect(nextPosition({ phase: "done" })).toEqual({ phase: "done" });
  });

  it("resumes at the start, at the base, at the first number nobody has looked at, or at the what-if", () => {
    const empty = emptyState().snapshots[0]!;
    expect(resumePosition(empty)).toEqual({ phase: "targets" });
    expect(resumePosition({ ...empty, targets: { "act.rate": 30 } })).toEqual({ phase: "base" });
    expect(resumePosition({ ...empty, base: { cohortSignups: 800 } })).toEqual({ phase: "number", index: 0 });
    // The example has every number looked at.
    expect(resumePosition(exampleState().snapshots[0]!)).toEqual({ phase: "whatif" });
    const snap = exampleState().snapshots[0]!;
    delete snap.metrics["act.ttv"];
    expect(resumePosition(snap)).toEqual({ phase: "number", index: METRIC_SHAPES.findIndex((s) => s.id === "act.ttv") });
  });
});
