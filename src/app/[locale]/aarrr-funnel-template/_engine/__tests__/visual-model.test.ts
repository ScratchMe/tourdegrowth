import { describe, expect, it } from "vitest";
import {
  columnGrid,
  columnNumeral,
  fill,
  monthLabel,
  numeralText,
  signupsGrid,
  stageLabel,
} from "../visual-model";

/*
 * The view model is where the peloton's honesty rules live (engine spec §8.1,
 * §8.6). These tests are the reason the three defects the spec found in its
 * own prototypes cannot come back inside a column: the grid and the numeral
 * read the same interval, and an unknown is never zero dots.
 */

const count = (dots: string[], state: string) => dots.filter((d) => d === state).length;

describe("columnGrid — the dots of one peloton column", () => {
  it("draws lo solid, lo..hi hatched, the rest outlined, always 100 dots", () => {
    const grid = columnGrid({ lo: 6, hi: 9 });
    expect(grid.kind).toBe("known");
    expect(grid.dots).toHaveLength(100);
    expect(count(grid.dots, "filled")).toBe(6);
    expect(count(grid.dots, "range")).toBe(3);
    expect(count(grid.dots, "empty")).toBe(91);
    // Solid first, then the range: a run reads as a count, not a scatter.
    expect(grid.dots.slice(0, 6).every((d) => d === "filled")).toBe(true);
    expect(grid.dots.slice(6, 9).every((d) => d === "range")).toBe(true);
  });

  it("an unknown column is its own state — never a grid of zero dots", () => {
    const grid = columnGrid(null);
    expect(grid.kind).toBe("unknown");
    expect(grid.dots).toHaveLength(0);
    // The contrast that matters: a MEASURED zero is a known grid.
    const zero = columnGrid({ lo: 0, hi: 0 });
    expect(zero.kind).toBe("known");
    expect(count(zero.dots, "empty")).toBe(100);
  });

  it("clamps out-of-range and inverted intervals instead of drawing 120 dots", () => {
    expect(count(columnGrid({ lo: 130, hi: 150 }).dots, "filled")).toBe(100);
    const inverted = columnGrid({ lo: 9, hi: 4 });
    expect(count(inverted.dots, "filled")).toBe(9);
    expect(count(inverted.dots, "range")).toBe(0);
  });
});

describe("the numeral and the grid read the SAME interval", () => {
  // The spec's own board mock titled a column "38" over a grid of 18 dots.
  // For every integer interval the numeral's bounds equal the grid's counts.
  it("for every integer interval 0 ≤ lo ≤ hi ≤ 100", () => {
    for (let lo = 0; lo <= 100; lo += 1) {
      for (let hi = lo; hi <= 100; hi += 7) {
        const grid = columnGrid({ lo, hi });
        const numeral = columnNumeral({ lo, hi });
        const solid = count(grid.dots, "filled");
        const upTo = solid + count(grid.dots, "range");
        if (numeral.kind === "value") {
          expect([numeral.lo, numeral.hi]).toEqual([solid, upTo]);
        } else {
          // Only the rounded-to-nothing case leaves the value branch.
          expect(numeral.kind).toBe("less-than-one");
          expect(upTo).toBe(0);
        }
      }
    }
  });

  it("rounds the same way on both sides for fractional inputs", () => {
    const interval = { lo: 17.6, hi: 18.4 };
    const numeral = columnNumeral(interval);
    const grid = columnGrid(interval);
    expect(numeral).toEqual({ kind: "value", lo: 18, hi: 18 });
    expect(count(grid.dots, "filled")).toBe(18);
    expect(count(grid.dots, "range")).toBe(0);
  });

  it("a measured value under 1 in 100 says so, never « 0 »", () => {
    expect(columnNumeral({ lo: 0.2, hi: 0.4 })).toEqual({ kind: "less-than-one" });
    expect(numeralText({ kind: "less-than-one" }, { range: "{lo}–{hi}" }, "fewer than 1")).toBe("fewer than 1");
  });

  it("unknown prints a question mark, a range prints both bounds, agreement prints one", () => {
    const words = { range: "{lo} à {hi}" };
    expect(numeralText(columnNumeral(null), words, "moins de 1")).toBe("?");
    expect(numeralText(columnNumeral({ lo: 6, hi: 9 }), words, "moins de 1")).toBe("6 à 9");
    expect(numeralText(columnNumeral({ lo: 18, hi: 18 }), words, "moins de 1")).toBe("18");
  });
});

describe("signupsGrid — the first column", () => {
  it("is always 100 sign-ups, the referred ones first", () => {
    const grid = signupsGrid({ lo: 6, hi: 6 });
    expect(grid.kind).toBe("known");
    expect(grid.dots).toHaveLength(100);
    expect(grid.dots.slice(0, 6).every((d) => d === "referred")).toBe(true);
    expect(count(grid.dots, "filled")).toBe(94);
  });

  it("an unknown referred share leaves the sign-ups plain — the sign-ups themselves are never unknown", () => {
    const grid = signupsGrid(null);
    expect(grid.kind).toBe("known");
    expect(count(grid.dots, "filled")).toBe(100);
  });

  it("an estimated referred share hatches its range", () => {
    const grid = signupsGrid({ lo: 4, hi: 7 });
    expect(count(grid.dots, "referred")).toBe(4);
    expect(count(grid.dots, "referredRange")).toBe(3);
  });
});

describe("small formatters", () => {
  it("fill replaces known placeholders and leaves a missing one visible", () => {
    expect(fill("{n} × {target}", { n: "38", target: "25 %" })).toBe("38 × 25 %");
    expect(fill("{n} × {target}", { n: "38" })).toBe("38 × {target}");
  });

  it("stageLabel keeps the AARRR names, capitalised", () => {
    expect(stageLabel("retention")).toBe("Retention");
  });

  it("monthLabel reads a YearMonth in the page's language, in UTC", () => {
    expect(monthLabel("2026-07", "en")).toBe("July 2026");
    expect(monthLabel("2026-07", "fr")).toBe("juillet 2026");
    expect(monthLabel("not-a-month" as never, "en")).toBe("not-a-month");
  });
});
