import { describe, expect, it } from "vitest";

import { METRIC_SHAPES } from "@/lib/engine/catalog-shape";
import { emptyState, exampleState, hybridState } from "@/lib/engine/__tests__/fixtures";
import {
  NUMBER_COUNT,
  nextGroupStart,
  nextPosition,
  numberPlace,
  numberSequence,
  phaseOf,
  previousPosition,
  resumePosition,
  type StepPosition,
} from "../steps-model";

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

/**
 * The step-by-step with the motions (A7.3.c S3, engine spec §18.7). Every
 * function defaults to self-serve, so the v1 walk above is unchanged (the
 * golden v1 holds `resumePosition`). Non-vacuity, measured on 2026-10-01:
 * putting sales-assisted's base before self-serve's fails the hybrid walk;
 * counting the link as a group of its own in the skip fails the skip test.
 */
describe("the step-by-step, per motion", () => {
  const hybrid = { plg: true, slg: true };
  const slgOnly = { plg: false, slg: true };

  it("the hybrid walks targets → both bases → self-serve's numbers → sales-assisted's → the link → what if, and back", () => {
    const walk: StepPosition[] = [{ phase: "targets" }];
    while (walk.at(-1)!.phase !== "done") walk.push(nextPosition(walk.at(-1)!, hybrid));
    const sequence = numberSequence(hybrid);
    expect(sequence.map((s) => s.scope)).toEqual([...Array(17).fill("plg"), ...Array(15).fill("slg"), "link"]);
    expect(walk.slice(0, 3)).toEqual([{ phase: "targets" }, { phase: "base" }, { phase: "base", motion: "slg" }]);
    expect(walk).toHaveLength(1 + 2 + sequence.length + 1 + 1);
    const back: StepPosition[] = [walk.at(-1)!];
    while (back.at(-1)!.phase !== "targets") back.push(previousPosition(back.at(-1)!, hybrid));
    expect(back.reverse()).toEqual(walk);
  });

  it("sales-assisted alone has its own base and its fifteen numbers, no link", () => {
    expect(nextPosition({ phase: "targets" }, slgOnly)).toEqual({ phase: "base", motion: "slg" });
    expect(numberSequence(slgOnly).map((s) => s.scope)).toEqual(Array(15).fill("slg"));
    expect(previousPosition({ phase: "number", index: 0 }, slgOnly)).toEqual({ phase: "base", motion: "slg" });
  });

  it("numbers each number within its motion — « Assisté · chiffre 4 sur 15 », never « 21 sur 32 »", () => {
    expect(numberPlace(0, hybrid)).toEqual({ group: "plg", i: 1, n: 17 });
    expect(numberPlace(20, hybrid)).toEqual({ group: "slg", i: 4, n: 15 });
    expect(numberPlace(32, hybrid)).toEqual({ group: "link", i: 1, n: 1 });
  });

  it("skips to sales-assisted from self-serve, and past the optional link to the what-if from sales-assisted", () => {
    expect(nextGroupStart(3, hybrid)).toBe(17);
    expect(nextGroupStart(20, hybrid)).toBeNull();
    expect(nextGroupStart(32, hybrid)).toBeNull();
    expect(nextGroupStart(3, { plg: true, slg: false })).toBeNull();
  });

  it("resumes at the first « to do » in the fixed order — the link, optional, is never waited on", () => {
    const state = hybridState();
    const snap = state.snapshots[0]!;
    // The §18.9 hybrid: every self-serve number is in; sales-assisted's first « to do » is where it resumes.
    const first = numberSequence(hybrid).findIndex((s) => s.scope !== "link" && (snap.metrics[s.id]?.status ?? "todo") === "todo");
    expect(resumePosition(snap, hybrid)).toEqual(first === -1 ? { phase: "whatif" } : { phase: "number", index: first });
    const onlyLink = structuredClone(snap);
    for (const s of numberSequence(hybrid)) if (s.scope !== "link" && !onlyLink.metrics[s.id]) onlyLink.metrics[s.id] = { status: "missing", updatedAt: "2026-09-20T10:00:00.000Z" };
    delete onlyLink.metrics["link.pql-handoff"];
    expect(resumePosition(onlyLink, hybrid)).toEqual({ phase: "whatif" });
    const empty = emptyState().snapshots[0]!;
    expect(resumePosition({ ...empty, targets: { "slg.rev.win-rate": 30 } }, slgOnly)).toEqual({ phase: "base", motion: "slg" });
  });
});
