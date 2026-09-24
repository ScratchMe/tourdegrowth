import { describe, expect, it } from "vitest";
import { shapeOf } from "../catalog-shape";
import {
  currentMonth,
  defaultCohortMonth,
  defaultMonths,
  defaultReferenceMonth,
  isImmature,
  isYearMonth,
  matureCohortMonth,
  nextMonth,
  periodOf,
  previousMonth,
  windowDaysOf,
} from "../cohort";
import { EXAMPLE_TODAY, exampleState } from "./fixtures";

// Engine spec §13.1 "cohort". `today` is always injected and read as a LOCAL
// calendar date. Non-vacuity: writing the maturity rule as `<` instead of
// `≤` (a month whose last sign-up has had exactly the window is mature)
// fails "exactly the window" only; computing the last day as day 31 of every
// month fails the February / leap-year tests only; the four 24/09 examples
// pass under the second sabotage (July, June, May all have 30-31 days).

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
    expect(Object.keys(months)).toHaveLength(15);
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
