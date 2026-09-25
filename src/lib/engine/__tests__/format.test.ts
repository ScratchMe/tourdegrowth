import { describe, expect, it } from "vitest";
import {
  capitalise,
  fillTemplate,
  formatApproxMoney,
  formatApproxMoneyInterval,
  formatApproxNumber,
  formatCountInterval,
  formatDay,
  formatDuration,
  formatDurationInterval,
  formatInterval,
  formatMoney,
  formatMonth,
  formatNumber,
  formatPercent,
  formatPerHundred,
  formatRatio,
  joinList,
  lowerFirst,
  roundDisplay,
} from "../format";
import type { Currency } from "../types";
import { CTX_EN, CTX_FR, EN, FR } from "./props";

// Engine spec §13.1 "format" — the §6.2 table in both languages, and the
// glyph sweep of §10.4. Non-vacuity, measured: removing the U+202F → U+00A0
// step fails 7 tests — the French amounts, approximations and ranges, the
// sweep (which names the glyph), and the French figures in the impact,
// peloton and deck tests; every English test passes, which is why French is
// tested on its own. Rounding with a bare Math.round (no half-up nudge)
// fails "half away from zero" only: 0.145 would print 0.14.

const NBSP = " ";
const uF = FR.strings.units;
const uE = EN.strings.units;

/**
 * §10.4: printable Latin-1 (U+00A0 included), plus – — ’ « » … € · × ÷ ±.
 * Everything else — U+202F, ≈, →, ≤, ✓, ●, ʳᵉ, U+2212 — is a hole on a slide.
 */
const ALLOWED = /^[ -~ -ÿ–—’«»…€·×÷±]*$/u;
function offending(s: string): string[] {
  return [...s].filter((c) => !ALLOWED.test(c)).map((c) => `U+${c.codePointAt(0)!.toString(16).toUpperCase()} in "${s}"`);
}

describe("format — §6.2 in French", () => {
  it("rates: two significant digits, an integer from 10 up, two decimals under 1, U+00A0 before %", () => {
    expect(formatPercent(18, "fr")).toBe(`18${NBSP}%`);
    expect(formatPercent(18.04, "fr")).toBe(`18${NBSP}%`);
    expect(formatPercent(3.15, "fr")).toBe(`3,2${NBSP}%`);
    expect(formatPercent(0.4213, "fr")).toBe(`0,42${NBSP}%`);
    expect(formatPercent(100, "fr")).toBe(`100${NBSP}%`);
    // A small cohort loses its decimals (§6.2 "petits effectifs").
    expect(formatPercent(3.15, "fr", { noDecimals: true })).toBe(`3${NBSP}%`);
  });

  it("amounts as entered, grouped with U+00A0 — never U+202F", () => {
    expect(formatMoney(21_000, "EUR", "fr")).toBe(`21${NBSP}000${NBSP}€`);
    expect(formatMoney(120, "EUR", "fr")).toBe(`120${NBSP}€`);
    expect(formatMoney(119.5, "EUR", "fr")).toBe(`119,50${NBSP}€`);
    expect(formatNumber(26_000, "fr")).toBe(`26${NBSP}000`);
  });

  it("derived amounts and upstream volumes: two significant digits and ~", () => {
    expect(formatApproxMoney(560, "EUR", "fr", uF)).toBe(`~560${NBSP}€`);
    expect(formatApproxMoney(6_288, "EUR", "fr", uF)).toBe(`~6${NBSP}300${NBSP}€`);
    expect(formatApproxNumber(3_170.7, "fr", uF)).toBe(`~3${NBSP}200`);
    expect(formatApproxMoneyInterval({ lo: 490, hi: 740 }, "EUR", CTX_FR, uF)).toBe(`~490${NBSP}€ à 740${NBSP}€`);
  });

  it("per 100: whole people; under half a person, the per-thousand sentence instead of a false 0", () => {
    expect(formatPerHundred({ lo: 18, hi: 18 }, CTX_FR, uF)).toBe("18 sur 100");
    expect(formatPerHundred({ lo: 6, hi: 9 }, CTX_FR, uF)).toBe("6 à 9 sur 100");
    expect(formatPerHundred({ lo: 0.4, hi: 0.4 }, CTX_FR, uF)).toMatch(/^moins de 1 sur 100 \(4 sur 1.000\)$/);
  });

  it("ranges, durations, months, days", () => {
    expect(formatInterval({ lo: 6, hi: 9 }, "percent", CTX_FR, uF)).toBe(`6 à 9${NBSP}%`);
    expect(formatInterval({ lo: 21_000, hi: 25_000 }, "money", CTX_FR, uF, { currency: "EUR" })).toBe(`21${NBSP}000${NBSP}€ à 25${NBSP}000${NBSP}€`);
    expect(formatDurationInterval({ lo: 1, hi: 3 }, "days", CTX_FR, uF)).toBe("1 à 3 jours");
    expect(formatDuration(1, "days", CTX_FR, uF)).toBe("1 jour");
    expect(formatDuration(4.2, "months", CTX_FR, uF)).toBe("4 mois");
    // A positive duration never prints as 0.
    expect(formatDuration(0.3, "days", CTX_FR, uF)).toBe("0,3 jours");
    expect(formatMonth("2026-07", "fr")).toBe("juillet 2026");
    expect(formatDay(new Date(2026, 9, 1), "fr")).toBe("1 octobre 2026");
  });
});

describe("format — §6.2 in English", () => {
  it("rates, amounts, approximations", () => {
    expect(formatPercent(18, "en")).toBe("18%");
    expect(formatPercent(3.15, "en")).toBe("3.2%");
    expect(formatPercent(0.4213, "en")).toBe("0.42%");
    expect(formatMoney(21_000, "EUR", "en")).toBe("€21,000");
    expect(formatApproxMoney(560, "EUR", "en", uE)).toBe("~€560");
    expect(formatApproxNumber(3_170.7, "en", uE)).toBe("~3,200");
    expect(formatRatio(0.153, "en")).toBe("0.15");
  });

  it("half away from zero on the number as written — what a reader's calculator does", () => {
    // 0.145 is stored 0.14499…, and 0.145 × 100 is 14.4999…: both toPrecision and a bare Math.round say 0.14.
    expect(formatPercent(0.145, "en")).toBe("0.15%");
    expect(formatPercent(3.15, "en")).toBe("3.2%");
    expect(formatPercent(-3.15, "en")).toBe("-3.2%");
  });

  it("ranges and durations use the copy's en dash", () => {
    expect(formatInterval({ lo: 6, hi: 9 }, "percent", CTX_EN, uE)).toBe("6–9%");
    expect(formatDurationInterval({ lo: 1, hi: 3 }, "days", CTX_EN, uE)).toBe("1–3 days");
    expect(formatPerHundred({ lo: 18, hi: 18 }, CTX_EN, uE)).toBe("18 in 100");
    expect(formatPerHundred({ lo: 0.4, hi: 0.4 }, CTX_EN, uE)).toBe("fewer than 1 in 100 (4 in 1,000)");
    expect(formatMonth("2026-07", "en")).toBe("July 2026");
  });
});

describe("format — shared rules", () => {
  it("a range whose rounded bounds agree prints once", () => {
    expect(formatInterval({ lo: 18.2, hi: 18.4 }, "percent", CTX_FR, uF)).toBe(`18${NBSP}%`);
    expect(formatCountInterval({ lo: 46.6, hi: 47.2 }, CTX_EN, uE)).toBe("47");
    expect(formatDurationInterval({ lo: 2.9, hi: 3.1 }, "days", CTX_EN, uE)).toBe("3 days");
  });

  it("rounding happens once: roundDisplay is what Intl prints", () => {
    for (const v of [0.0123, 0.456, 3.14159, 9.96, 18.5, 123.4]) {
      expect(formatPercent(v, "en")).toBe(`${roundDisplay(v)}%`);
    }
  });

  it("text and choice metrics have no interval to format — asking is a caller's bug", () => {
    expect(() => formatInterval({ lo: 1, hi: 1 }, "text", CTX_EN, uE)).toThrow();
  });

  it("templates, lists and case", () => {
    expect(fillTemplate("{a} et {b}", { a: 1 })).toBe("1 et {b}");
    expect(joinList([], FR.strings.grammar)).toBe("");
    expect(joinList(["a"], FR.strings.grammar)).toBe("a");
    expect(joinList(["a", "b", "c"], FR.strings.grammar)).toBe("a, b et c");
    expect(joinList(["a", "b"], EN.strings.grammar)).toBe("a and b");
    expect(capitalise("la rétention")).toBe("La rétention");
    expect(lowerFirst("Taux d'activation")).toBe("taux d'activation");
    expect(lowerFirst("CAC")).toBe("CAC");
    expect(lowerFirst("ARPA mensuel")).toBe("ARPA mensuel");
  });
});

describe("format — the glyph sweep (§10.4)", () => {
  it("no output from 10⁻⁴ to 10⁷, in either language, carries a glyph outside the fonts' whitelist", () => {
    const values: number[] = [];
    for (let e = -4; e <= 7; e++) for (const m of [1, 1.5, 2.35, 4.444, 9.99]) values.push(m * 10 ** e, -m * 10 ** e);
    values.push(0, -0);
    const currencies: Currency[] = ["EUR", "USD", "GBP", "CHF"];
    const bad: string[] = [];
    for (const [locale, ctx, u] of [["fr", CTX_FR, uF], ["en", CTX_EN, uE]] as const) {
      for (const v of values) {
        const outputs = [
          formatNumber(v, locale),
          formatPercent(v, locale),
          formatPercent(v, locale, { noDecimals: true }),
          formatRatio(v, locale),
          formatApproxNumber(v, locale, u),
          formatInterval({ lo: v, hi: v * 2 + 1 }, "percent", ctx, u),
          formatInterval({ lo: v, hi: Math.abs(v) + 1 }, "ratio", ctx, u),
          formatDuration(Math.abs(v), "days", ctx, u),
          formatDurationInterval({ lo: Math.abs(v), hi: Math.abs(v) * 3 }, "months", ctx, u),
          formatPerHundred({ lo: Math.abs(v) % 100, hi: Math.abs(v) % 100 }, ctx, u),
          ...currencies.flatMap((c) => [
            formatMoney(v, c, locale),
            formatApproxMoney(v, c, locale, u),
            formatInterval({ lo: v, hi: Math.abs(v) }, "money", ctx, u, { currency: c }),
          ]),
        ];
        for (const o of outputs) bad.push(...offending(o));
      }
      for (let m = 1; m <= 12; m++) bad.push(...offending(formatMonth(`2026-${String(m).padStart(2, "0")}`, locale)));
      bad.push(...offending(formatDay(new Date(2026, 10, 11), locale)));
    }
    expect(bad).toEqual([]);
  });

  it("the sweep can fail: U+202F and ≈ are caught", () => {
    expect(offending("3 200")).toHaveLength(1);
    expect(offending("≈ 600")).toHaveLength(1);
    expect(offending(`~3${NBSP}200 €`)).toHaveLength(0);
  });
});
