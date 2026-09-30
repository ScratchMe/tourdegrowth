import { describe, expect, it } from "vitest";
import { EMPTY_DAY, dayPartsFromIso, isPartialDay, isRealDay, isoFromDayParts, monthsEndingAt } from "../date";

describe("monthsEndingAt", () => {
  it("lists the months newest first, across a year boundary", () => {
    expect(monthsEndingAt("2026-02", 4)).toEqual(["2026-02", "2026-01", "2025-12", "2025-11"]);
  });

  it("keeps a stored month older than the window at the end, rather than snapping it to another", () => {
    expect(monthsEndingAt("2026-08", 2, "2024-03")).toEqual(["2026-08", "2026-07", "2024-03"]);
    expect(monthsEndingAt("2026-08", 2, "2026-07")).toEqual(["2026-08", "2026-07"]);
  });
});

describe("a day as three chosen parts", () => {
  it("reads the stored yyyy-mm-dd into parts, and anything else into three empty parts", () => {
    expect(dayPartsFromIso("2026-09-29")).toEqual({ day: "29", month: "09", year: "2026" });
    expect(dayPartsFromIso("2026-09-05")).toEqual({ day: "5", month: "09", year: "2026" });
    expect(dayPartsFromIso("")).toEqual(EMPTY_DAY);
    expect(dayPartsFromIso("09/29/2026")).toEqual(EMPTY_DAY);
  });

  it("knows the days the calendar lacks", () => {
    expect(isRealDay({ day: "31", month: "02", year: "2026" })).toBe(false);
    expect(isRealDay({ day: "29", month: "02", year: "2028" })).toBe(true);
    expect(isRealDay({ day: "29", month: "02", year: "2027" })).toBe(false);
    expect(isRealDay({ day: "30", month: "09", year: "2026" })).toBe(true);
    expect(isRealDay({ day: "", month: "09", year: "2026" })).toBe(false);
  });

  it("stores a real day as yyyy-mm-dd, and nothing half-chosen", () => {
    expect(isoFromDayParts({ day: "5", month: "09", year: "2026" })).toBe("2026-09-05");
    expect(isoFromDayParts({ day: "31", month: "02", year: "2026" })).toBe("");
    expect(isoFromDayParts({ day: "5", month: "", year: "2026" })).toBe("");
  });

  it("tells a day being chosen from one not started", () => {
    expect(isPartialDay(EMPTY_DAY)).toBe(false);
    expect(isPartialDay({ day: "29", month: "09", year: "" })).toBe(true);
    expect(isPartialDay({ day: "29", month: "09", year: "2026" })).toBe(false);
  });

  it("goes round trip from what is stored", () => {
    for (const iso of ["2026-01-01", "2026-12-31", "2028-02-29"]) expect(isoFromDayParts(dayPartsFromIso(iso))).toBe(iso);
  });
});
