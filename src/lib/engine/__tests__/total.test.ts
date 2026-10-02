import { describe, expect, it } from "vitest";
import { displayedSum, formatSum, sumParts } from "../total";
import { buildTotal } from "../total";
import type { Interval } from "../types";
import { estimated, exampleState, hybridState, salesAssistedState, withEntry } from "./fixtures";
import { CTX_EN, CTX_FR, EN, FR } from "./props";

// Engine spec §18.6.2, §18.9.5 and §18.10.1 « total » (A7.3.c S1).
// Non-vacuity, measured on 2026-10-01:
// - a total that returns the known part when the other is missing fails
//   « never the known part » (and S9 with it);
// - rounding each part to its OWN two significant digits fails the grid's
//   « within half a common unit » only — beside 1 234, 98 765 must print
//   98 800, not 99 000. (Without that line the sabotage passed: a multiple
//   of 1 000 is a multiple of 100 too.)
// - marking a typed MRR « approximate » fails « 228 000 €, exact ».

const nb = (s: string) => s.replace(/\^/g, " ");

describe("the §18.9.5 example", () => {
  const total = buildTotal(hybridState(), CTX_FR)!;

  it("MRR: 48 000 € + 180 000 € = 228 000 €, exact — two amounts typed as counts", () => {
    expect(total.mrr.total).toEqual({ kind: "known", value: { lo: 228_000, hi: 228_000 }, confidence: "solid" });
    expect(formatSum(total.mrr, "EUR", CTX_FR, FR.strings.units)).toEqual({
      plg: nb("48^000^€"),
      slg: nb("180^000^€"),
      total: nb("228^000^€"),
      exact: true,
    });
  });

  it("new MRR a month: ~5 000 € + ~12 000 € = ~17 000 € (the real 17 040 rounds the same)", () => {
    expect(total.newMrrPerMonth.plg).toMatchObject({ kind: "known", value: { lo: 5_040, hi: 5_040 } });
    expect(total.newMrrPerMonth.slg).toMatchObject({ kind: "known", value: { lo: 12_000, hi: 12_000 } });
    expect(formatSum(total.newMrrPerMonth, "EUR", CTX_EN, EN.strings.units)).toEqual({ plg: "~€5,000", slg: "~€12,000", total: "~€17,000", exact: false });
  });

  it("MRR in 12 months at the current pace: ~100 000 € + ~330 000 to 340 000 € = ~430 000 to 440 000 €", () => {
    expect(total.mrrIn12Months.plg.kind === "known" && total.mrrIn12Months.plg.value.lo).toBeCloseTo(104_487.7, 1);
    expect(total.mrrIn12Months.slg).toMatchObject({ kind: "known", value: { lo: 331_200, hi: 338_400 } });
    expect(formatSum(total.mrrIn12Months, "EUR", CTX_FR, FR.strings.units)).toEqual({
      plg: nb("~100^000^€"),
      slg: nb("~330^000^€ à 340^000^€"),
      total: nb("~430^000^€ à 440^000^€"),
      exact: false,
    });
  });

  it("the link: 31 of the 130 opportunities came from self-serve accounts", () => {
    expect(total.link).toMatchObject({ fromSelfServe: 31, oppsCreated: 130 });
    expect(total.link.known.kind).toBe("known");
  });
});

describe("a total exists only when both parts do (S9)", () => {
  it("null outside the hybrid", () => {
    expect(buildTotal(exampleState(), CTX_FR)).toBeNull();
    expect(buildTotal(salesAssistedState(), CTX_FR)).toBeNull();
  });

  it("a part unknown: uncomputable, naming it — never the known part presented as the total", () => {
    const t = buildTotal(withEntry(hybridState(), "slg.rev.arpa", undefined), CTX_FR)!;
    expect(t.mrr.slg).toEqual({ kind: "uncomputable", missing: ["slg.rev.arpa"] });
    expect(t.mrr.total).toEqual({ kind: "uncomputable", missing: ["slg.rev.arpa"] });
    expect(t.mrr.plg.kind).toBe("known");
    expect(formatSum(t.mrr, "EUR", CTX_FR, FR.strings.units)).toBeNull();
    const plgGone = buildTotal(withEntry(hybridState(), "rev.arpa", undefined), CTX_FR)!;
    expect(plgGone.mrr.total).toEqual({ kind: "uncomputable", missing: ["rev.arpa"] });
  });

  it("an estimated part makes the sum a range with « ~ »", () => {
    const t = buildTotal(withEntry(hybridState(), "slg.rev.arpa", estimated(1_700, 1_900)), CTX_FR)!;
    // 100 customers (the base) × 1 700 to 1 900 €.
    expect(t.mrr.total).toEqual({ kind: "known", value: { lo: 218_000, hi: 238_000 }, confidence: "approximate" });
    // The common unit is the smallest part's, 48 000 € → the thousand: 48 000 + 170 000 to 190 000.
    expect(formatSum(t.mrr, "EUR", CTX_FR, FR.strings.units)).toMatchObject({ plg: nb("~48^000^€"), total: nb("~218^000^€ à 238^000^€") });
  });

  it("sumParts lists every missing input, self-serve's first", () => {
    expect(sumParts({ kind: "uncomputable", missing: ["rev.arpa"] }, { kind: "uncomputable", missing: ["slg.rev.arpa"] })).toEqual({
      kind: "uncomputable",
      missing: ["rev.arpa", "slg.rev.arpa"],
    });
  });
});

describe("the sum printed is the sum of the parts printed (§18.6.2)", () => {
  it("over a grid of amounts, one common unit: the two significant digits of the smallest part", () => {
    const amounts = [3.4, 87, 640, 1_234, 5_040, 12_000, 98_765, 104_487.7, 331_200, 2_400_000];
    let checked = 0;
    for (const a of amounts) {
      for (const b of amounts) {
        for (const spread of [1, 1.03]) {
          const parts: Interval[] = [{ lo: a, hi: a }, { lo: b, hi: b * spread }];
          const shown = displayedSum(parts, false);
          expect(shown.total.lo).toBeCloseTo(shown.parts[0]!.lo + shown.parts[1]!.lo, 9);
          expect(shown.total.hi).toBeCloseTo(shown.parts[0]!.hi + shown.parts[1]!.hi, 9);
          const smallest = Math.min(a, b);
          const unit = 10 ** (Math.floor(Math.log10(smallest)) - 1);
          for (const p of shown.parts) for (const v of [p.lo, p.hi]) expect(Math.abs(v / unit - Math.round(v / unit))).toBeLessThan(1e-9);
          // At the common unit, never coarser: each part printed within half a unit of what it is.
          shown.parts.forEach((p, k) => {
            expect(Math.abs(p.lo - parts[k]!.lo)).toBeLessThanOrEqual(unit / 2 + 1e-9);
            expect(Math.abs(p.hi - parts[k]!.hi)).toBeLessThanOrEqual(unit / 2 + 1e-9);
          });
          checked++;
        }
      }
    }
    expect(checked).toBe(200);
    // The example (§18.9.5): unit 10 000.
    expect(displayedSum([{ lo: 104_487.7, hi: 104_487.7 }, { lo: 331_200, hi: 338_400 }], false)).toEqual({
      parts: [{ lo: 100_000, hi: 100_000 }, { lo: 330_000, hi: 340_000 }],
      total: { lo: 430_000, hi: 440_000 },
    });
  });

  it("exact parts print as they are", () => {
    expect(displayedSum([{ lo: 48_000, hi: 48_000 }, { lo: 180_123, hi: 180_123 }], true).total).toEqual({ lo: 228_123, hi: 228_123 });
  });
});
