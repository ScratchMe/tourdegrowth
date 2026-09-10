import { describe, expect, it } from "vitest";
import { latestProgression, NUDGE_AFTER_DAYS, progressionFor, retakeNudge } from "../progression";
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

describe("retakeNudge", () => {
  const NOW = Date.parse("2026-09-11T12:00:00.000Z");
  const daysAgo = (n: number) => new Date(NOW - n * 86_400_000).toISOString();
  const at = (createdAt: string, total?: number): StoredResult =>
    ({ id: `r-${createdAt}`, ownerToken: "t", createdAt, ...(total === undefined ? {} : { total }) }) as StoredResult;

  it("says nothing about a Tour taken this month", () => {
    expect(retakeNudge([at(daysAgo(29))], NOW)).toBeNull();
    expect(retakeNudge([at(daysAgo(0))], NOW)).toBeNull();
  });

  it("fires exactly at the threshold, not a day before", () => {
    expect(retakeNudge([at(daysAgo(NUDGE_AFTER_DAYS - 1))], NOW)).toBeNull();
    expect(retakeNudge([at(daysAgo(NUDGE_AFTER_DAYS))], NOW)).toEqual({ unit: "weeks", value: 4 });
  });

  it("counts weeks up to two months and months past that", () => {
    expect(retakeNudge([at(daysAgo(59))], NOW)).toEqual({ unit: "weeks", value: 8 });
    expect(retakeNudge([at(daysAgo(60))], NOW)).toEqual({ unit: "months", value: 2 });
    expect(retakeNudge([at(daysAgo(365))], NOW)).toEqual({ unit: "months", value: 12 });
  });

  /* The whole point of C1 is "when did you last do this", which an entry
     written before R-20 answers just as well — unlike the progression
     reading, which genuinely needs two scores. */
  it("counts an entry that carries no score", () => {
    expect(retakeNudge([at(daysAgo(90))], NOW)).toEqual({ unit: "months", value: 3 });
  });

  it("measures the most recent Tour, whatever order it is stored in", () => {
    const results = [at(daysAgo(200)), at(daysAgo(31)), at(daysAgo(400))];
    expect(retakeNudge(results, NOW)).toEqual({ unit: "weeks", value: 4 });
  });

  /* A device whose clock is ahead of ours would otherwise produce a negative
     age and, with a naive floor, a nudge claiming "-1 weeks". */
  it("ignores a result dated in the future", () => {
    expect(retakeNudge([at(new Date(NOW + 5 * 86_400_000).toISOString())], NOW)).toBeNull();
  });

  it("skips unparseable dates rather than treating them as ancient", () => {
    expect(retakeNudge([at("not a date")], NOW)).toBeNull();
    expect(retakeNudge([at("not a date"), at(daysAgo(31))], NOW)).toEqual({ unit: "weeks", value: 4 });
  });

  it("has nothing to say with no results at all", () => {
    expect(retakeNudge([], NOW)).toBeNull();
  });
});
