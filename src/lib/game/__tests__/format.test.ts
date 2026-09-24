import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  deltaSign,
  fill,
  formatDelta,
  formatEur,
  formatInt,
  formatMillions,
  formatPct,
  formatPoints,
  formatSigned,
  MINUS,
  NBSP,
  placeholders,
  type DeltaKind,
} from "../format";

// Plan §4.2, G1v: X7 (FR/EN formats) and X8 (fill refuses a hole).
const nb = (s: string) => s.replaceAll(" ", NBSP);

describe("X7 — French and English numbers", () => {
  it("rates: one decimal, the French space before %", () => {
    expect(formatPct("fr", 0.06)).toBe(nb("6,0 %"));
    expect(formatPct("en", 0.06)).toBe("6.0%");
    expect(formatPct("fr", 0.0399)).toBe(nb("4,0 %"));
    expect(formatPct("en", 0.05705)).toBe("5.7%");
    expect(formatPct("fr", 0.056, 2)).toBe(nb("5,60 %"));
  });

  it("counts: grouped by thousands, a no-break space in French, a comma in English", () => {
    expect(formatInt("fr", 100_000)).toBe(nb("100 000"));
    expect(formatInt("en", 100_000)).toBe("100,000");
    expect(formatInt("fr", 1_234_567.4)).toBe(nb("1 234 567"));
    expect(formatInt("en", 999)).toBe("999");
    expect(formatInt("fr", -1_450)).toBe(`${MINUS}1${NBSP}450`);
  });

  it("revenue in millions, two decimals, the currency where each language puts it", () => {
    expect(formatMillions("fr", 1_299_000)).toBe(nb("1,30 M€"));
    expect(formatMillions("en", 1_299_000)).toBe("€1.30M");
    expect(formatMillions("fr", 94_500)).toBe(nb("0,09 M€"));
    expect(formatMillions("en", -50_000)).toBe(`${MINUS}€0.05M`);
  });

  it("whole euros", () => {
    expect(formatEur("fr", 94_500)).toBe(nb("94 500 €"));
    expect(formatEur("en", 94_500)).toBe("€94,500");
  });

  it("percentage points", () => {
    expect(formatPoints("fr", 0.012)).toBe(nb("1,2 pt"));
    expect(formatPoints("en", 0.001)).toBe(nb("0.1 pts"));
  });

  it("signed whole numbers take a plus, or the minus sign — never a hyphen", () => {
    expect(formatSigned("fr", 4)).toBe("+4");
    expect(formatSigned("fr", -2)).toBe(`${MINUS}2`);
    expect(formatSigned("en", 0)).toBe("0");
    expect(formatSigned("en", -1_200)).toBe(`${MINUS}1,200`);
  });

  it("no output ever carries a hyphen-minus, a narrow no-break space, or a plain space next to a digit", () => {
    const outputs: string[] = [];
    for (const locale of ["fr", "en"] as const) {
      for (const n of [-1_234_567, -94_500, -0.06, -0.0004, 0, 0.0004, 0.06, 12.5, 94_500, 1_299_000]) {
        outputs.push(
          formatPct(locale, n),
          formatInt(locale, n),
          formatMillions(locale, n),
          formatEur(locale, n),
          formatPoints(locale, n),
          formatSigned(locale, n),
          formatDelta(locale, "churn", 0, n),
          formatDelta(locale, "int", 0, n),
          formatDelta(locale, "millions", 0, n),
        );
      }
    }
    for (const s of outputs) {
      expect(s, s).not.toMatch(/-/);
      expect(s, s).not.toMatch(/ /);
      expect(s, s).not.toMatch(/\d | \d/);
    }
  });

  it("is written without Intl, so Node's prerender and the browser print the same thing", () => {
    // toLocaleString depends on the ICU data of whatever runs it; a
    // difference between the server and the browser is a hydration
    // mismatch on the first number of the dashboard.
    const source = readFileSync(join(__dirname, "..", "format.ts"), "utf8").replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");
    expect(source).not.toMatch(/\bIntl\b|toLocaleString|toFixed/);
  });
});

describe("deltas", () => {
  it("print the change with its sign, in each tile's unit", () => {
    expect(formatDelta("fr", "churn", 0.06, 0.057)).toBe(`${MINUS}0,3${NBSP}pt`);
    expect(formatDelta("en", "churn", 0.057, 0.058)).toBe(`+0.1${NBSP}pts`);
    expect(formatDelta("fr", "int", 100_000, 98_550)).toBe(`${MINUS}1${NBSP}450`);
    expect(formatDelta("en", "int", 55, 67)).toBe("+12");
    expect(formatDelta("fr", "millions", 1_299_000, 1_280_000)).toBe(`${MINUS}0,02${NBSP}M€`);
    expect(formatDelta("en", "millions", 1_280_000, 1_299_000)).toBe("+€0.02M");
  });

  it("a change that rounds to nothing has no sign, and deltaSign says so too", () => {
    expect(formatDelta("fr", "churn", 0.06, 0.0596)).toBe(`0,0${NBSP}pt`);
    expect(deltaSign("churn", 0.06, 0.0596)).toBe(0);
    expect(formatDelta("en", "millions", 1_299_000, 1_297_000)).toBe("€0.00M");
    expect(deltaSign("millions", 1_299_000, 1_297_000)).toBe(0);
  });

  it("deltaSign always agrees with the sign formatDelta prints", () => {
    const kinds: DeltaKind[] = ["churn", "int", "millions"];
    const values = [-2_000_000, -5_000, -0.0006, -0.0004, -0.4, 0, 0.4, 0.0005, 0.0004, 4_999, 5_000, 2_000_000];
    for (const kind of kinds) {
      for (const b of values) {
        const printed = formatDelta("fr", kind, 0, b);
        const expected = printed.startsWith(MINUS) ? -1 : printed.startsWith("+") ? 1 : 0;
        expect(deltaSign(kind, 0, b), `${kind} ${b} → ${printed}`).toBe(expected);
      }
    }
  });
});

describe("X8 — templates", () => {
  it("fills every placeholder, as many times as it appears", () => {
    expect(fill("{a} et {b}, encore {a}", { a: "5,7 %", b: "52" })).toBe("5,7 % et 52, encore 5,7 %");
    expect(fill("rien à remplir", {})).toBe("rien à remplir");
  });

  it("ignores values the template does not ask for", () => {
    expect(fill("{churn}", { churn: "6,0 %", unused: "x" })).toBe("6,0 %");
  });

  it("throws on a placeholder without a value, naming it", () => {
    expect(() => fill("Résiliations à {churn}, confiance à {trust}.", { churn: "4,0 %" })).toThrow(/\{trust\}/);
    // An inherited property is not a value.
    expect(() => fill("{toString}", {})).toThrow(/\{toString\}/);
  });

  it("an empty string is a value", () => {
    expect(fill("[{suffix}]", { suffix: "" })).toBe("[]");
  });

  it("lists a template's placeholders once each, in order", () => {
    expect(placeholders("{b} {a} {b} {c_2}")).toEqual(["b", "a", "c_2"]);
    expect(placeholders("sans")).toEqual([]);
  });
});
