import { describe, expect, it } from "vitest";
import { METRIC_SHAPES, shapeOf } from "../catalog-shape";
import {
  currentMonth,
  defaultCohortMonth,
  defaultMonths,
  defaultReferenceMonth,
  isImmature,
  isYearMonth,
  defaultSpanEnd,
  matureCohortMonth,
  monthsBefore,
  nextMonth,
  periodOf,
  periodRangeOf,
  previousMonth,
  windowDaysOf,
} from "../cohort";
import { EXAMPLE_TODAY, exampleState } from "./fixtures";

// Engine spec §13.1 "cohort". `today` is always injected and read as a LOCAL
// calendar date. Non-vacuity, measured: requiring one day MORE than the
// window (`>=` instead of `>` in the loop) fails the four boundary tests
// (exactly the window, 30/31-day months, February and the leap year, the
// zero window) while the four 24/09 examples still pass — none of them sits
// on a boundary, which is why the boundaries are tested on their own.

describe("months", () => {
  it("validates YYYY-MM and steps across the year boundary", () => {
    expect(isYearMonth("2026-09")).toBe(true);
    for (const bad of ["2026-9", "2026-13", "2026-00", "26-09", "2026-09-01"]) expect(isYearMonth(bad)).toBe(false);
    expect(previousMonth("2026-01")).toBe("2025-12");
    expect(nextMonth("2026-12")).toBe("2027-01");
    expect(nextMonth("2026-02")).toBe("2026-03");
    expect(currentMonth(EXAMPLE_TODAY)).toBe("2026-09");
    expect(() => previousMonth("2026-9")).toThrow();
  });
});

describe("matureCohortMonth — last day of M + window ≤ today", () => {
  it("the four examples of 24/09/2026 (§6.3)", () => {
    expect(matureCohortMonth(7, EXAMPLE_TODAY)).toBe("2026-08");
    expect(matureCohortMonth(30, EXAMPLE_TODAY)).toBe("2026-07"); // 31/08 + 30 = 30/09 > 24/09
    expect(matureCohortMonth(60, EXAMPLE_TODAY)).toBe("2026-06");
    expect(matureCohortMonth(90, EXAMPLE_TODAY)).toBe("2026-05");
  });

  it("exactly the window is mature", () => {
    // 31/08 + 24 days = 24/09.
    expect(matureCohortMonth(24, EXAMPLE_TODAY)).toBe("2026-08");
    expect(matureCohortMonth(25, EXAMPLE_TODAY)).toBe("2026-07");
  });

  it("30- and 31-day months", () => {
    // 30/06 + 30 = 30/07 ; 31/07 + 30 = 30/08.
    expect(matureCohortMonth(30, new Date(2026, 6, 30))).toBe("2026-06");
    expect(matureCohortMonth(30, new Date(2026, 6, 29))).toBe("2026-05");
    expect(matureCohortMonth(30, new Date(2026, 7, 30))).toBe("2026-07");
    expect(matureCohortMonth(30, new Date(2026, 7, 29))).toBe("2026-06");
  });

  it("February, in a common and in a leap year", () => {
    // 28/02/2026 + 7 = 07/03 ; 29/02/2028 + 7 = 07/03.
    expect(matureCohortMonth(7, new Date(2026, 2, 7))).toBe("2026-02");
    expect(matureCohortMonth(7, new Date(2026, 2, 6))).toBe("2026-01");
    expect(matureCohortMonth(7, new Date(2028, 2, 7))).toBe("2028-02");
    expect(matureCohortMonth(7, new Date(2028, 2, 6))).toBe("2028-01");
  });

  it("a zero window makes the current month mature on its last day only", () => {
    expect(matureCohortMonth(0, new Date(2026, 8, 30))).toBe("2026-09");
    expect(matureCohortMonth(0, new Date(2026, 8, 29))).toBe("2026-08");
  });

  it("immaturity compares against the window's mature month", () => {
    expect(isImmature("2026-08", 30, EXAMPLE_TODAY)).toBe(true);
    expect(isImmature("2026-07", 30, EXAMPLE_TODAY)).toBe(false);
    expect(isImmature("2026-08", 7, EXAMPLE_TODAY)).toBe(false);
  });
});

describe("defaults", () => {
  it("reference month = last closed month; cohort = mature for max(30, payment window)", () => {
    const setup = exampleState().setup;
    expect(defaultReferenceMonth(EXAMPLE_TODAY)).toBe("2026-08");
    expect(defaultCohortMonth(setup, EXAMPLE_TODAY)).toBe("2026-07");
    expect(defaultCohortMonth({ ...setup, paidWindowDays: 90 }, EXAMPLE_TODAY)).toBe("2026-05");
    const months = defaultMonths(setup, EXAMPLE_TODAY);
    expect(months["act.rate"]).toBe("2026-07");
    expect(months["ret.d30"]).toBe("2026-07");
    expect(months["acq.signup-rate"]).toBe("2026-08");
    expect(months["rev.arpa"]).toBe("2026-08");
    expect(Object.keys(months)).toHaveLength(METRIC_SHAPES.length);
  });

  it("windows come from the setup; periods from the entry, else the snapshot", () => {
    const state = exampleState();
    const snapshot = state.snapshots[0]!;
    expect(windowDaysOf(shapeOf("act.rate"), state.setup)).toBe(7);
    expect(windowDaysOf(shapeOf("rev.paid-conversion"), { ...state.setup, paidWindowDays: 60 })).toBe(60);
    expect(windowDaysOf(shapeOf("ret.d30"), state.setup)).toBe(30);
    expect(windowDaysOf(shapeOf("rev.arpa"), state.setup)).toBe(0);
    expect(periodOf(shapeOf("act.rate"), snapshot.metrics["act.rate"], snapshot)).toBe("2026-07");
    expect(periodOf(shapeOf("act.rate"), { ...snapshot.metrics["act.rate"]!, cohortMonth: "2026-06" }, snapshot)).toBe("2026-06");
    expect(periodOf(shapeOf("rev.arpa"), undefined, snapshot)).toBe("2026-08");
    expect(periodOf(shapeOf("act.event"), undefined, snapshot)).toBeNull();
  });
});

describe("three rolling months for sales-assisted (engine spec §18.2 S4, C25 Q2 — A7.3.c S0)", () => {
  // Non-vacuity, measured on 2026-09-30: every range read as one month fails the three range tests;
  // ending a cohort at the snapshot's cohort month instead of its window's mature one fails « the
  // ranges of §18.9 »; reading the qualification window as the go-live one fails « the windows »,
  // « a cohort ends » and « the ranges ».
  const today = new Date(2026, 8, 24);
  const state = exampleState();
  const snapshot = state.snapshots[0]!;
  const setup = state.setup;
  const at = "2026-09-30T10:00:00.000Z";

  it("the windows are the setup's: qualification for lead → opportunity, go-live for the go-live", () => {
    expect(windowDaysOf(shapeOf("slg.acq.lead-to-opp"), setup)).toBe(30);
    expect(windowDaysOf(shapeOf("slg.act.go-live"), setup)).toBe(90);
    expect(windowDaysOf(shapeOf("slg.acq.lead-to-opp"), { ...setup, qualificationWindowDays: 60 })).toBe(60);
  });

  it("a cohort ends at the month mature for its window: 30 days → July, 90 days → May, on 24/09/2026", () => {
    expect(defaultSpanEnd(shapeOf("slg.acq.lead-to-opp"), setup, today)).toBe("2026-07");
    expect(defaultSpanEnd(shapeOf("slg.act.go-live"), setup, today)).toBe("2026-05");
    expect(defaultSpanEnd(shapeOf("slg.acq.lead-to-opp"), { ...setup, qualificationWindowDays: 60 }, today)).toBe("2026-06");
  });

  it("the ranges of §18.9: flows June to August, leads May to July, new customers March to May", () => {
    expect(periodRangeOf(shapeOf("slg.rev.win-rate"), undefined, snapshot, setup, today)).toEqual({ from: "2026-06", to: "2026-08" });
    expect(periodRangeOf(shapeOf("slg.acq.lead-to-opp"), undefined, snapshot, setup, today)).toEqual({ from: "2026-05", to: "2026-07" });
    expect(periodRangeOf(shapeOf("slg.act.go-live"), undefined, snapshot, setup, today)).toEqual({ from: "2026-03", to: "2026-05" });
    // The link reads over the same three months as the opportunities it divides.
    expect(periodRangeOf(shapeOf("link.pql-handoff"), undefined, snapshot, setup, today)).toEqual({ from: "2026-06", to: "2026-08" });
  });

  it("an entry keeps the month it was measured on: the range ends there", () => {
    const entry = { status: "todo" as const, updatedAt: at, cohortMonth: "2026-06" };
    expect(periodRangeOf(shapeOf("slg.acq.lead-to-opp"), entry, snapshot, setup, today)).toEqual({ from: "2026-04", to: "2026-06" });
  });

  it("the NRR spans twelve months to the flows' month; a definition has no period; self-serve is one month", () => {
    expect(periodRangeOf(shapeOf("slg.ret.nrr"), undefined, snapshot, setup, today)).toEqual({ from: "2025-09", to: "2026-08" });
    expect(periodRangeOf(shapeOf("slg.act.live-event"), undefined, snapshot, setup, today)).toBeNull();
    expect(periodRangeOf(shapeOf("act.rate"), undefined, snapshot, setup, today)).toEqual({ from: "2026-07", to: "2026-07" });
    expect(periodRangeOf(shapeOf("rev.arpa"), undefined, snapshot, setup, today)).toEqual({ from: "2026-08", to: "2026-08" });
  });

  it("monthsBefore crosses the year", () => {
    expect(monthsBefore("2026-02", 2)).toBe("2025-12");
    expect(monthsBefore("2026-02", 0)).toBe("2026-02");
  });
});
