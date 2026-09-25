import { describe, expect, it } from "vitest";

import { RETENTION_LEVEL, type RetentionCardId } from "../levels/retention";
import { fresh, stepMonth, trustMult } from "../model";
import type { GameState, LevelDefinition } from "../types";
import { deepFreeze } from "./paths";

// GAME-BRIEF.md §5.7 and §7.1, série M.
type Id = RetentionCardId;
const L = RETENTION_LEVEL;

function base(overrides: Partial<GameState<Id>> = {}): GameState<Id> {
  return { ...fresh(L), ...overrides };
}

describe("M1 — trust weighs on churn a quarter late", () => {
  it("is neutral at 60, heavier below, lighter above", () => {
    expect(trustMult(60)).toBe(1);
    expect(trustMult(30)).toBeCloseTo(1.2, 12);
    expect(trustMult(90)).toBeCloseTo(0.9, 12);
  });

  it("reads lagTrust, not the trust of the moment", () => {
    const a = stepMonth(L, base({ trust: 20, lagTrust: 60 }));
    const b = stepMonth(L, base({ trust: 95, lagTrust: 60 }));
    const c = stepMonth(L, base({ trust: 60, lagTrust: 30 }));
    expect(a.churn).toBe(b.churn);
    expect(c.churn).toBeCloseTo(a.churn * 1.2, 12);
  });
});

describe("série M — one month", () => {
  it("M2 · a competitor adds 0,3 point in months 4, 5 and 6 only", () => {
    for (let from = 0; from < 12; from++) {
      const churn = stepMonth(L, base({ month: from })).churn;
      const spring = [4, 5, 6].includes(from + 1);
      expect(churn).toBeCloseTo(spring ? 0.063 : 0.06, 12);
    }
  });

  it("M3 · churn never goes below its floor", () => {
    const easy: LevelDefinition<Id> = { ...L, constants: { ...L.constants, churn0: 0.001 } };
    expect(stepMonth(easy, fresh(easy)).churn).toBe(L.constants.churnFloor);
  });

  it("M4 · a spike counts in full this month, then fades by half a point a month", () => {
    let s = base({ spike: 0.012 });
    s = stepMonth(L, s);
    expect(s.churn).toBeCloseTo(0.072, 12);
    expect(s.spike).toBeCloseTo(0.007, 12);
    s = stepMonth(L, s);
    expect(s.spike).toBeCloseTo(0.002, 12);
    s = stepMonth(L, s);
    expect(s.spike).toBe(0);
  });

  it("M5 · 5 000 newcomers a month at trust 60, 6 000 while the press is good", () => {
    const quiet = stepMonth(L, base());
    expect(quiet.subs).toBeCloseTo(100_000 - 6_000 + 5_000, 6);
    const press = stepMonth(L, base({ press: 3 }));
    expect(press.subs).toBeCloseTo(100_000 - 6_000 + 6_000, 6);
    expect(press.press).toBe(2);
    expect(stepMonth(L, base({ press: 0 })).press).toBe(0);
  });

  it("M5 · newcomers follow trust of the moment", () => {
    const s = stepMonth(L, base({ trust: 90 }));
    expect(s.subs).toBeCloseTo(100_000 - 6_000 + 5_000 * 1.2, 6);
  });

  it("M6 · revenue carries the annual discount and a last month billed to leavers", () => {
    const price = L.constants.price;
    const plain = stepMonth(L, base());
    expect(plain.mrr).toBeCloseTo(plain.subs * price, 6);

    const annual = stepMonth(L, base({ active: ["annual"], since: { annual: 0 } }));
    expect(annual.mrr).toBeCloseTo(annual.subs * price * 0.97, 6);

    const notice = stepMonth(L, base({ active: ["notice"], since: { notice: 0 } }));
    const cancels = 100_000 * notice.churn;
    expect(notice.mrr).toBeCloseTo(notice.subs * price + cancels * price, 6);
  });

  it("M7 · the radar cools by 3 a month while no pattern runs, down to 0", () => {
    expect(stepMonth(L, base({ radar: 10 })).radar).toBe(7);
    expect(stepMonth(L, base({ radar: 2 })).radar).toBe(0);
    expect(stepMonth(L, base({ radar: 40, active: ["shame"], since: { shame: 0 } })).radar).toBe(40);
  });

  it("M8 · the history gains exactly one point a month, with the trust of the moment", () => {
    let s = base({ trust: 71 });
    for (let m = 1; m <= 3; m++) {
      s = stepMonth(L, s);
      expect(s.history).toHaveLength(m + 1);
      expect(s.history.at(-1)).toEqual({ m, churn: s.churn, trust: 71, subs: s.subs, mrr: s.mrr });
    }
  });

  it("never touches the state it is given", () => {
    const s = deepFreeze(base({ spike: 0.01, press: 2, active: ["pause", "bury"], since: { pause: 0, bury: 0 } }));
    const next = stepMonth(L, s);
    expect(next).not.toBe(s);
    expect(s.month).toBe(0);
    expect(s.history).toHaveLength(1);
  });
});
