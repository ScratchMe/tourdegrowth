import { describe, expect, it } from "vitest";
import { latestProgression, progressionFor } from "../progression";
import type { StoredResult } from "../storage";

function r(id: string, total: number | undefined, day: number): StoredResult {
  return {
    id,
    ownerToken: "t",
    createdAt: `2026-09-${String(day).padStart(2, "0")}T10:00:00.000Z`,
    ...(total === undefined ? {} : { total }),
  };
}

describe("latestProgression (REVIEW-02.md R2-27)", () => {
  it("compares the two most recent scored Tours", () => {
    expect(latestProgression([r("c", 66, 7), r("b", 58, 5), r("a", 40, 1)])).toEqual({
      previousTotal: 58,
      currentTotal: 66,
      delta: 8,
    });
  });

  it("reads dates rather than array order, so a badly ordered store still works", () => {
    expect(latestProgression([r("b", 58, 5), r("c", 66, 7)])?.delta).toBe(8);
  });

  it("reports a drop and a flat result as real answers", () => {
    expect(latestProgression([r("b", 51, 5), r("a", 60, 1)])?.delta).toBe(-9);
    expect(latestProgression([r("b", 60, 5), r("a", 60, 1)])?.delta).toBe(0);
  });

  it("has nothing to say with one Tour, none, or only unscored ones", () => {
    expect(latestProgression([])).toBeNull();
    expect(latestProgression([r("a", 60, 1)])).toBeNull();
    // Pre-R-20 entries carry no score: two results, still nothing to compare.
    expect(latestProgression([r("b", undefined, 5), r("a", undefined, 1)])).toBeNull();
    expect(latestProgression([r("b", 60, 5), r("a", undefined, 1)])).toBeNull();
  });
});

describe("progressionFor", () => {
  const store = [r("c", 66, 7), r("b", 58, 5), r("a", 40, 1)];

  it("anchors on the given result, not on the most recent one", () => {
    // Opening the middle result must compare it with the one BEFORE it,
    // never with the newest — that progression happened after this page.
    expect(progressionFor(store, "b")).toEqual({ previousTotal: 40, currentTotal: 58, delta: 18 });
    expect(progressionFor(store, "c")).toEqual({ previousTotal: 58, currentTotal: 66, delta: 8 });
  });

  it("says nothing for the first Tour ever, or for someone else's result", () => {
    expect(progressionFor(store, "a")).toBeNull();
    expect(progressionFor(store, "someone-elses-id")).toBeNull();
  });

  it("skips unscored entries when picking the one before", () => {
    const mixed = [r("c", 66, 7), r("b", undefined, 5), r("a", 40, 1)];
    expect(progressionFor(mixed, "c")).toEqual({ previousTotal: 40, currentTotal: 66, delta: 26 });
  });
});
