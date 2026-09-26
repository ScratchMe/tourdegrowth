import { describe, expect, it } from "vitest";

import { RETENTION_LEVEL as L } from "../levels/retention";
import { DRIVER_ORDER, driverRows } from "../view";
import { ENDING_PATHS, finalState, PATH_A, PATH_C, PATH_M } from "./paths";

// « Pourquoi le churn a bougé » (Antoine, 2026-09-25): a quarter's move,
// split into what the player did, what was already running, an inspection's
// forced rollback, what people say and the market. The report prints these
// lines under a total; they are only worth printing if they can never
// disagree with it, nor with the tile above.

const years = Object.entries(ENDING_PATHS).map(([name, path]) => ({ name, log: finalState(path).log }));

describe("churnDrivers — the quarter's move, split", () => {
  it("adds up EXACTLY to the quarter's move, on every quarter of every year the tests play", () => {
    for (const { name, log } of years) {
      for (const entry of log) {
        const sum = DRIVER_ORDER.reduce((acc, key) => acc + entry.drivers[key], 0);
        expect(sum, `${name} Q${entry.q + 1}`).toBeCloseTo(entry.churnEnd - entry.churnStart, 12);
      }
    }
  });

  it("the first honest quarter moves churn by its picks alone", () => {
    const q1 = finalState(PATH_A).log[0]!;
    expect(q1.drivers.picks).toBeLessThan(0);
    for (const key of ["production", "inspection", "word", "market"] as const) expect(q1.drivers[key]).toBeCloseTo(0, 12);
  });

  it("the competitor's spring offer comes in with the second quarter and leaves with the third", () => {
    const [, q2, q3] = finalState(PATH_A).log;
    expect(q2!.drivers.market).toBeCloseTo(L.constants.season.add, 12);
    expect(q3!.drivers.market).toBeCloseTo(-L.constants.season.add, 12);
  });

  it("cleaning shows in the picks as churn going back UP — the effect line says so too", () => {
    const withClean = finalState(PATH_M).log.find((e) => e.picked.includes("clean"))!;
    expect(withClean.drivers.picks).toBeGreaterThan(0);
  });

  it("after an inspection, the forced rollback has its own line, and it is the quarter's largest with word of mouth", () => {
    const log = finalState(PATH_C).log;
    const after = log[3]!;
    expect(log[2]!.events.some((e) => e.kind === "control")).toBe(true);
    expect(after.drivers.inspection).toBeGreaterThan(0.01);
    expect(after.drivers.word).toBeGreaterThan(0.01);
    expect(Math.abs(after.drivers.picks)).toBeLessThan(after.drivers.inspection);
    // Never before an inspection happened.
    for (const entry of log.slice(0, 3)) expect(entry.drivers.inspection).toBeCloseTo(0, 12);
  });

  it("dark patterns cost trust, and the next quarter's word of mouth says so", () => {
    // C obeys twice: the first quarter's trust hit lands a quarter later.
    expect(finalState(PATH_C).log[1]!.drivers.word).toBeGreaterThan(0);
  });
});

describe("driverRows — the lines as printed", () => {
  it("each a whole tenth of a point, adding up to the move the TILES show, zeros dropped", () => {
    for (const { name, log } of years) {
      for (const entry of log) {
        const { total, rows } = driverRows(entry);
        const shown = Math.round(entry.churnEnd * 1000) - Math.round(entry.churnStart * 1000);
        expect(Math.round(total * 1000), `${name} Q${entry.q + 1} total`).toBe(shown);
        const tenths = rows.map((r) => r.value * 1000);
        for (const t of tenths) {
          expect(Math.abs(t - Math.round(t))).toBeLessThan(1e-9);
          expect(Math.round(t)).not.toBe(0);
        }
        expect(Math.round(tenths.reduce((a, b) => a + b, 0)), `${name} Q${entry.q + 1} sum`).toBe(shown);
        // In the report's order.
        const order = rows.map((r) => DRIVER_ORDER.indexOf(r.key));
        expect(order).toEqual([...order].sort((a, b) => a - b));
      }
    }
  });

  it("hands a rounding's missing tenth to the line that lost the most", () => {
    // 0,34 + 0,34 + 0,32 = 1,0 point; rounded 0,3 + 0,3 + 0,3 = 0,9.
    const log = {
      churnStart: 0.05,
      churnEnd: 0.06,
      drivers: { picks: 0.0034, production: 0.0034, inspection: 0, word: 0.0032, market: 0 },
    };
    const { total, rows } = driverRows(log);
    expect(total).toBeCloseTo(0.01, 12);
    expect(rows.map((r) => [r.key, Math.round(r.value * 1000)])).toEqual([
      ["picks", 4],
      ["production", 3],
      ["word", 3],
    ]);
  });

  it("a quarter that moved nothing on the tiles prints a zero total and no line", () => {
    const { total, rows } = driverRows({
      churnStart: 0.05,
      churnEnd: 0.0502,
      drivers: { picks: -0.0003, production: 0.0005, inspection: 0, word: 0, market: 0 },
    });
    expect(total).toBe(0);
    expect(rows).toEqual([]);
  });
});
