import { describe, expect, it } from "vitest";
import { exampleState } from "@/lib/engine/__tests__/fixtures";
import { CTX_EN, CTX_FR, EN, FR } from "@/lib/engine/__tests__/props";
import type { LeverId } from "@/lib/engine/types";
import {
  dotsInUse,
  funnelSteps,
  gainText,
  kpiRows,
  leverGains,
  leverRows,
  scenarioFor,
  scenarioGrid,
  targetAt,
  withTarget,
} from "../scenario-view";

/**
 * The « Et si » panel's view model (2026-09-26). The §6.0 example: 820
 * sign-ups from 26 000 visitors, 18 % activated, paid 6-9 % (estimated),
 * 42 new payers at 120 €, churn 2.5 %, no gross margin.
 */

const count = (dots: readonly string[], kind: string) => dots.filter((d) => d === kind).length;

describe("scenarioGrid — one dot per 1 % of today's sign-ups", () => {
  it("today alone fills its share of the 100, in ink", () => {
    const g = scenarioGrid({ lo: 18, hi: 18 }, { lo: 18, hi: 18 }, 1);
    expect(g.dots).toHaveLength(100);
    expect(count(g.dots, "filled")).toBe(18);
    expect(count(g.dots, "empty")).toBe(82);
  });

  it("what the what-ifs add beyond today is red, and the grid grows past 100 in rows of 10", () => {
    // Sign-ups 100 → 127: the 27 more don't fit in the 100 of today, the grid grows to 130.
    const g = scenarioGrid({ lo: 100, hi: 100 }, { lo: 127, hi: 127 }, 1);
    expect(g.dots).toHaveLength(130);
    expect(count(g.dots, "filled")).toBe(100);
    expect(count(g.dots, "gained")).toBe(27);
    expect(count(g.dots, "empty")).toBe(3);
  });

  it("what the projection loses is outlined in red, never a blank that reads as nobody", () => {
    const g = scenarioGrid({ lo: 30, hi: 30 }, { lo: 24, hi: 24 }, 1);
    expect(count(g.dots, "filled")).toBe(24);
    expect(count(g.dots, "lost")).toBe(6);
  });

  it("an estimate stays hatched from its low end to its high end, and the part beyond today's reach is a red hatch", () => {
    const g = scenarioGrid({ lo: 6, hi: 9 }, { lo: 8, hi: 12 }, 1);
    expect(count(g.dots, "filled")).toBe(8);
    expect(count(g.dots, "range")).toBe(1); // dot 9, inside today's 6-9 reach
    expect(count(g.dots, "gainedRange")).toBe(3); // dots 10-12
  });

  it("an unknown step is the unknown shape, never 0 dots", () => {
    expect(scenarioGrid(null, { lo: 1, hi: 1 }, 1)).toEqual({ kind: "unknown", dots: [] });
    expect(scenarioGrid({ lo: 1, hi: 1 }, { lo: 1, hi: 1 }, 0).kind).toBe("unknown");
  });
});

describe("funnelSteps — visitors first, then the four grids", () => {
  it("a better sign-up rate finally shows: visitors unchanged, sign-ups and every step below in red", () => {
    const s = scenarioFor(exampleState(), { "acq.signup-rate": 4 }, CTX_FR);
    const steps = funnelSteps(s, CTX_FR, FR.strings);
    expect(steps.map((x) => x.id)).toEqual(["visitors", "signups", "activated", "d30", "paying"]);
    const [visitors, signups, activated] = steps;
    expect(visitors!.grid).toBeNull();
    expect(visitors!.delta).toBeNull(); // the same visitors
    expect(signups!.delta).toContain("+220");
    expect(signups!.deltaSign).toBe("up");
    expect(count(signups!.grid!.dots, "gained")).toBe(27); // 1 040 / 820 = 127 %
    expect(activated!.deltaSign).toBe("up");
  });

  it("referral brings visitors with its sign-ups, and the sign-up column names how many were referred", () => {
    const s = scenarioFor(exampleState(), { "ref.referred-share": 20 }, CTX_EN);
    const [visitors, signups] = funnelSteps(s, CTX_EN, EN.strings);
    expect(visitors!.deltaSign).toBe("up");
    expect(signups!.detail).toMatch(/^of whom referred /);
  });

  it("day 30 unknown in the example: its column is the unknown shape and says so", () => {
    const steps = funnelSteps(scenarioFor(exampleState(), { "act.rate": 24 }, CTX_FR), CTX_FR, FR.strings);
    const d30 = steps.find((x) => x.id === "d30")!;
    expect(d30.grid!.kind).toBe("unknown");
    expect(d30.numeral).toBe("?");
  });

  it("nothing moved: no deltas, no red", () => {
    const steps = funnelSteps(scenarioFor(exampleState(), {}, CTX_FR), CTX_FR, FR.strings);
    expect(steps.every((x) => x.delta === null)).toBe(true);
    const inUse = dotsInUse(steps);
    expect(inUse.has("gained")).toBe(false);
    expect(inUse.has("lost")).toBe(false);
  });
});

describe("kpiRows — the growth numbers, better or worse in words", () => {
  it("activation 18 → 24 %: new MRR and the MRR in 12 months up, the CAC down — and a lower CAC is better", () => {
    const s = scenarioFor(exampleState(), { "act.rate": 24 }, CTX_FR);
    const rows = kpiRows(s, CTX_FR, FR.strings, "EUR", { state: exampleState(), metrics: FR.metrics });
    const byId = Object.fromEntries(rows.map((r) => [r.id, r]));
    expect(rows.map((r) => r.id)).toEqual(["mrr12", "newMrr", "nrr", "grr", "cac", "ltv", "payback"]);
    expect(byId.newMrr!.tone).toBe("better");
    expect(byId.newMrr!.direction).toBe("up");
    expect(byId.mrr12!.tone).toBe("better");
    expect(byId.cac!.direction).toBe("down");
    expect(byId.cac!.tone).toBe("better");
    expect(byId.cac!.delta).toMatch(/^−/); // U+2212, never a hyphen
    // Churn didn't move: NRR and GRR print the same, so no change is claimed.
    expect(byId.nrr!.delta).toBeNull();
    expect(byId.grr!.delta).toBeNull();
  });

  it("a figure nobody can compute says what to enter, and only what is missing", () => {
    const rows = kpiRows(scenarioFor(exampleState(), {}, CTX_FR), CTX_FR, FR.strings, "EUR", { state: exampleState(), metrics: FR.metrics });
    const ltv = rows.find((r) => r.id === "ltv")!;
    expect(ltv.projected).toBeNull();
    expect(ltv.unknown).toContain("marge brute");
    expect(ltv.unknown).not.toContain("ARPA"); // entered in the example
  });

  it("a churn that goes up is worse, in points", () => {
    const s = scenarioFor(exampleState(), { "ret.logo-churn": 4 }, CTX_EN);
    const grr = kpiRows(s, CTX_EN, EN.strings, "EUR", { state: exampleState(), metrics: EN.metrics }).find((r) => r.id === "grr")!;
    expect(grr.tone).toBe("worse");
    expect(grr.delta).toMatch(/^−1\.5 pt$/);
  });
});

describe("the sliders", () => {
  const example = exampleState();

  it("every known lever gets a slider on its step, standing on today; the unknown ones get none", () => {
    const rows = leverRows(scenarioFor(example, {}, CTX_FR), CTX_FR, FR.strings, "EUR", FR.metrics);
    for (const r of rows) {
      if (r.today === null) {
        expect(r.todayValue, r.id).toBeNull();
        continue;
      }
      expect(r.moved, r.id).toBe(false);
      expect(r.position, r.id).toBeGreaterThanOrEqual(r.min);
      expect(r.position, r.id).toBeLessThanOrEqual(r.max);
      // min and max land on the step: a range input would otherwise never reach them.
      expect(Math.abs(r.min / r.step - Math.round(r.min / r.step)), r.id).toBeLessThan(1e-9);
      expect(Math.abs(r.max / r.step - Math.round(r.max / r.step)), r.id).toBeLessThan(1e-9);
    }
    const activation = rows.find((r) => r.id === "act.rate")!;
    expect(activation.valueText).toBe("18\u00a0%");
    expect(activation.today).toBe("aujourd'hui 18\u00a0%");
  });

  it("an estimated lever says its range until it is moved", () => {
    const paid = leverRows(scenarioFor(example, {}, CTX_FR), CTX_FR, FR.strings, "EUR", FR.metrics).find((r) => r.id === "rev.paid-conversion")!;
    expect(paid.valueText).toMatch(/6.*9/);
  });

  it("back on today's value is no target at all; anywhere else is a target on the step", () => {
    const lever = { today: { lo: 3.15, hi: 3.15 }, step: 0.1 };
    expect(targetAt(lever, 3.2)).toBeNull(); // 3.15 on a 0.1 step is 3.2
    expect(targetAt(lever, 3.3)).toBe(3.3);
    expect(targetAt(lever, 4.000000001)).toBe(4);
    expect(targetAt({ today: null, step: 1 }, 10)).toBeNull();
  });

  it("one slider moved changes its own target and no other; back to today removes it", () => {
    const targets: Partial<Record<LeverId, number>> = { "act.rate": 24, "rev.arpa": 150 };
    expect(withTarget(targets, "act.rate", 30)).toEqual({ "act.rate": 30, "rev.arpa": 150 });
    expect(withTarget(targets, "act.rate", null)).toEqual({ "rev.arpa": 150 });
    expect(withTarget({}, "ret.logo-churn", 2)).toEqual({ "ret.logo-churn": 2 });
  });

  it("a moved lever prints its target, and is marked moved", () => {
    const rows = leverRows(scenarioFor(example, { "rev.arpa": 150 }, CTX_EN), CTX_EN, EN.strings, "EUR", EN.metrics);
    const arpa = rows.find((r) => r.id === "rev.arpa")!;
    expect(arpa.moved).toBe(true);
    expect(arpa.position).toBe(150);
    expect(arpa.valueText).toBe("€150");
  });
});

describe("leverGains — what each lever brings alone, and together", () => {
  it("together is worth more than the sum: the compounding the panel's sentence names", () => {
    const targets: Partial<Record<LeverId, number>> = { "acq.signup-rate": 4, "act.rate": 24, "ret.logo-churn": 1.5 };
    const s = scenarioFor(exampleState(), targets, CTX_FR);
    const g = leverGains(exampleState(), s, CTX_FR);
    expect(g.alone.map((a) => a.id)).toEqual(["acq.signup-rate", "act.rate", "ret.logo-churn"]);
    expect(g.alone.every((a) => a.gain !== null && a.gain > 0)).toBe(true);
    expect(g.together! - g.sumAlone!).toBeGreaterThan(1);
  });

  it("rounds a gain to the projection's precision: never « +29 916,28 € » beside « ~130 000 € »", () => {
    expect(gainText(29_916.28, "EUR", CTX_FR)).toBe("+30\u00a0000\u00a0€");
    expect(gainText(1_113.4, "EUR", CTX_EN)).toBe("+€1,100");
    const rows = kpiRows(scenarioFor(exampleState(), { "act.rate": 24 }, CTX_FR), CTX_FR, FR.strings, "EUR", { state: exampleState(), metrics: FR.metrics });
    for (const r of rows) if (r.delta) expect(r.delta, r.id).not.toMatch(/,\d/);
  });

  it("signs a gain with a real minus", () => {
    expect(gainText(1200, "EUR", CTX_FR)).toBe("+1\u00a0200\u00a0€");
    expect(gainText(-300, "EUR", CTX_EN)).toBe("\u2212€300");
  });
});
