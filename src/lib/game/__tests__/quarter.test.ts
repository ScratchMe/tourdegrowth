import { describe, expect, it } from "vitest";

import { RETENTION_DARK_IDS, RETENTION_HONEST_IDS, RETENTION_LEVEL, type RetentionCardId } from "../levels/retention";
import { applyPicks, fresh, pickOrder, runQuarter } from "../model";
import type { GameEvent, GameState, LevelDefinition, ModelConstants } from "../types";
import { deepFreeze, ENDING_PATHS, finalState, PATH_A, PATH_C, PATH_M, playPath, type Pick2 } from "./paths";

// GAME-BRIEF.md §5.8 and §7.1, série Q, plus X4 and X5.
type Id = RetentionCardId;
const L = RETENTION_LEVEL;

/**
 * The level with every end-of-quarter event switched off and every target
 * out of reach of failure, so a test isolates one rule: the patience change
 * of a quarter is then exactly the hit bonus plus the rule under test.
 */
function quiet(overrides: Partial<ModelConstants> = {}): LevelDefinition<Id> {
  const c = L.constants;
  return {
    ...L,
    constants: {
      ...c,
      targets: [1, 1, 1, 1],
      control: { ...c.control, radar: 999 },
      reports: { ...c.reports, radar: 999 },
      viral: { ...c.viral, trust: -1 },
      press: { ...c.press, trust: 999 },
      ...overrides,
    },
  };
}

/** A state ready to run: call hung up, these two cards picked. */
function picked(state: GameState<Id>, picks: Pick2): GameState<Id> {
  return { ...state, callOpen: false, picks: [...picks] };
}

const eventKinds = (events: GameEvent[]) => events.map((e) => e.kind);

describe("Q1 — the target", () => {
  it("hit: +12; missed by half a point: −14; missed by two points or more: −32", () => {
    const probe = runQuarter(quiet(), picked(fresh(quiet()), ["remind", "reco"]));
    const end = probe.churn;
    const run = (target: number) => {
      const level = quiet({ targets: [target, 1, 1, 1] });
      return runQuarter(level, picked(fresh(level), ["remind", "reco"])).patience - 55;
    };
    expect(run(end)).toBe(12);
    expect(run(end - 0.005)).toBe(-14);
    expect(run(end - 0.02)).toBe(-32);
    expect(run(end - 0.5)).toBe(-32);
  });
});

describe("Q2 — the CEO's order", () => {
  const level = quiet();
  const q1 = runQuarter(level, picked(fresh(level), ["remind", "reco"]));

  it("sets up the test: the second quarter opens on an order", () => {
    expect(q1.patience).toBe(67);
    expect(q1.order).toBe("pdef");
  });

  it("obeyed: +10, and it is filed under obeyed", () => {
    const s = runQuarter(level, picked(q1, ["pdef", "onboard"]));
    expect(s.patience).toBe(67 + 12 + 10);
    expect(s).toMatchObject({ orders: ["pdef"], obeyed: ["pdef"], refused: [] });
  });

  it("refused: −8, and it is filed under refused", () => {
    const s = runQuarter(level, picked(q1, ["pause", "onboard"]));
    expect(s.patience).toBe(67 + 12 - 8);
    expect(s).toMatchObject({ orders: ["pdef"], obeyed: [], refused: ["pdef"] });
  });

  it("no order: nothing", () => {
    expect(q1).toMatchObject({ orders: [], obeyed: [], refused: [] });
    expect(q1.log[0]?.boss.order).toBeNull();
  });
});

describe("Q3 — the data meeting pays when the cards are played", () => {
  const level = quiet();

  it("+15 with the survey's insight, +3 without, before any month runs", () => {
    const withData = applyPicks(level, picked({ ...fresh(level), insight: true }, ["present", "remind"]));
    expect(withData.patience).toBe(55 + 15);
    expect(withData.month).toBe(0);
    const blind = applyPicks(level, picked(fresh(level), ["present", "remind"]));
    expect(blind.patience).toBe(55 + 3);
  });

  it("in pick order: a survey picked first gives the meeting its data, picked second does not", () => {
    // The prototype's order of operations, kept on purpose and pinned so a
    // change is a decision: the data arrive when the survey lands.
    expect(applyPicks(level, picked(fresh(level), ["survey", "present"])).patience).toBe(55 + 15);
    expect(applyPicks(level, picked(fresh(level), ["present", "survey"])).patience).toBe(55 + 3);
  });

  it("lands every other pick effect too: trust, radar, production, patterns used", () => {
    const s = applyPicks(level, picked(fresh(level), ["bury", "pause"]));
    expect(s.trust).toBe(60 - 5 + 4);
    expect(s.radar).toBe(10 + 15 - 2);
    expect(s.active).toEqual(["bury", "pause"]);
    expect(s.since).toEqual({ bury: 0, pause: 0 });
    expect(s.everDark).toEqual(["bury"]);
  });

  it("cleaning takes every pattern out of production and files it as removed", () => {
    const s = { ...fresh(level), active: ["bury", "pause", "shame"] as Id[], picks: ["clean", "remind"] as Id[] };
    const cleaned = applyPicks(level, s);
    expect(cleaned.active).toEqual(["pause", "remind"]);
    expect(cleaned.removedDark).toEqual(["bury", "shame"]);
  });
});

describe("Q4 — the DGCCRF", () => {
  const level = quiet({ control: L.constants.control, reports: L.constants.reports });

  it("radar 75: control — fine, patterns archived, radar 20, trust −10, patience −15, spike", () => {
    // radar 57 + bury 15 + shame 3 = 75 at the quarter's end (a live pattern stops the cooling).
    const s = runQuarter(level, picked({ ...fresh(level), radar: 57 }, ["bury", "shame"]));
    const control = s.log[0]?.events.find((e) => e.kind === "control");
    expect(control).toEqual({ kind: "control", fine: 60_000 + 75 * 500, leavers: Math.round(s.subs * 0.015) });
    expect(s.sanction).toBe(true);
    expect(s.active).toEqual([]);
    expect(s.removedDark).toEqual(["bury", "shame"]);
    expect(s.radar).toBe(20);
    expect(s.trust).toBe(60 - 5 - 2 - 10);
    expect(s.patience).toBe(55 + 12 - 15);
    expect(s.spike).toBeCloseTo(0.015, 12);
  });

  it("radar 74: reports — patience −5, trust −3, no sanction", () => {
    const s = runQuarter(level, picked({ ...fresh(level), radar: 56 }, ["bury", "shame"]));
    expect(eventKinds(s.log[0]?.events ?? [])).toContain("reports");
    expect(s.sanction).toBe(false);
    expect(s.patience).toBe(55 + 12 - 5);
    expect(s.trust).toBe(60 - 5 - 2 - 3);
  });

  it("radar 44: nothing; 45: reports", () => {
    // No pattern: the radar cools 3 a month, so 53 → 44 and 54 → 45.
    const quietQ = runQuarter(level, picked({ ...fresh(level), radar: 53 }, ["survey", "onboard"]));
    expect(quietQ.radar).toBe(44);
    expect(eventKinds(quietQ.log[0]?.events ?? [])).not.toContain("reports");
    const loud = runQuarter(level, picked({ ...fresh(level), radar: 54 }, ["survey", "onboard"]));
    expect(eventKinds(loud.log[0]?.events ?? [])).toContain("reports");
  });
});

describe("Q5 — what people say", () => {
  const level = quiet({ viral: L.constants.viral, press: L.constants.press });

  it("trust 35: a viral thread — spike +1 point, patience −5", () => {
    // 30 + survey 2 + onboard 3 = 35.
    const s = runQuarter(level, picked({ ...fresh(level), trust: 30 }, ["survey", "onboard"]));
    expect(eventKinds(s.log[0]?.events ?? [])).toEqual(["midMail", "viral"]);
    expect(s.spike).toBeCloseTo(0.01, 12);
    expect(s.patience).toBe(55 + 12 - 5);
  });

  it("trust 80: a good article — three months of press, patience +8", () => {
    const s = runQuarter(level, picked({ ...fresh(level), trust: 75 }, ["survey", "onboard"]));
    expect(eventKinds(s.log[0]?.events ?? [])).toEqual(["midMail", "press"]);
    expect(s.press).toBe(3);
    expect(s.patience).toBe(55 + 12 + 8);
  });

  it("never both in one quarter", () => {
    expect(L.constants.viral.trust).toBeLessThan(L.constants.press.trust);
    for (const path of Object.values(ENDING_PATHS)) {
      for (const entry of finalState(path).log) {
        const kinds = eventKinds(entry.events);
        expect(kinds.includes("viral") && kinds.includes("press")).toBe(false);
      }
    }
  });
});

describe("Q6-Q9 — the rest of the reckoning", () => {
  it("Q6 · the competitor's spring offer is news in the second quarter only", () => {
    const log = finalState(PATH_A).log;
    log.forEach((entry, q) => expect(eventKinds(entry.events).includes("competitor")).toBe(q === 1));
  });

  it("Q7 · trust, radar and patience stay within 0-100 on every quarter of every year", () => {
    for (const path of Object.values(ENDING_PATHS)) {
      for (const s of playPath(path)) {
        for (const v of [s.trust, s.radar, s.patience]) expect(v >= 0 && v <= 100).toBe(true);
        for (const entry of s.log) expect(entry.patience >= 0 && entry.patience <= 100).toBe(true);
      }
    }
    // And the clamp is actually exercised: the control drives trust through
    // zero on a year that starts low enough.
    const level = quiet({ control: L.constants.control });
    const s = runQuarter(level, picked({ ...fresh(level), trust: 8, radar: 57 }, ["bury", "shame"]));
    expect(s.trust).toBe(0);
  });

  it("Q8 · patience under 25 fires after quarters 1-3, never after the last", () => {
    const level = quiet();
    const early = runQuarter(level, picked({ ...fresh(level), patience: 12 }, ["remind", "reco"]));
    expect(early).toMatchObject({ patience: 24, fired: true, over: true, callOpen: false, order: null, q: 1 });
    expect(early.ending).toBe("firedClean");

    const edge = runQuarter(level, picked({ ...fresh(level), patience: 13 }, ["remind", "reco"]));
    expect(edge).toMatchObject({ patience: 25, fired: false, over: false });

    const q3 = playPath([["remind", "survey"], ["pause", "onboard"], ["annual", "reco"]], level).at(-1);
    if (!q3) throw new Error("three quarters");
    // The fourth quarter's order is bury: obeying it (+10) plus the hit
    // (+12) takes patience 2 to exactly 24.
    expect(q3.order).toBe("bury");
    const last = runQuarter(level, picked({ ...q3, patience: 2 }, ["bury", "three"]));
    expect(last).toMatchObject({ patience: 24, fired: false, over: true, q: 4 });
  });

  it("Q9 · after a quarter: no picks, the call reopens if the year goes on, a new order", () => {
    const [, q1] = playPath(PATH_A);
    expect(q1).toMatchObject({ picks: [], callOpen: true, order: "pdef", over: false });
    const end = finalState(PATH_A);
    expect(end).toMatchObject({ picks: [], callOpen: false, order: null, over: true });
  });
});

describe("Q10 — which order", () => {
  const at = (overrides: Partial<GameState<Id>>) => pickOrder(L, { ...fresh(L), ...overrides });

  it("none in the first quarter; then the schedule: pdef, call, bury", () => {
    expect(at({ q: 0 })).toBeNull();
    expect(at({ q: 1 })).toBe("pdef");
    expect(at({ q: 2 })).toBe("call");
    expect(at({ q: 3 })).toBe("bury");
  });

  it("the first of the pool not already running when the scheduled one is", () => {
    expect(at({ q: 1, active: ["pdef"] })).toBe("call");
    expect(at({ q: 1, active: ["pdef", "call", "bury"] })).toBe("cascade");
  });

  it("after a control, never call nor bury again", () => {
    expect(at({ q: 2, sanction: true })).toBe("pdef");
    expect(at({ q: 3, sanction: true, active: ["pdef"] })).toBe("cascade");
    const c = playPath(PATH_C);
    expect(c[3]?.order).toBe("pdef"); // the quarter after the control
  });

  it("nothing left to ask for: no order", () => {
    expect(at({ q: 1, active: ["pdef", "call", "bury", "cascade", "notice"] })).toBeNull();
  });
});

describe("Q11 — the CEO's mid-quarter mail", () => {
  it("reads the quarter's second month against its target, on every quarter of every year", () => {
    let moving = 0;
    let stuck = 0;
    for (const path of Object.values(ENDING_PATHS)) {
      const s = finalState(path);
      for (const entry of s.log) {
        const second = s.history[entry.q * 3 + 2];
        const mail = entry.events[0];
        expect(mail?.kind).toBe("midMail");
        if (!second || mail?.kind !== "midMail") throw new Error("a mail per quarter");
        expect(mail.moving).toBe(!(second.churn > entry.target));
        if (mail.moving) moving++;
        else stuck++;
      }
    }
    // Both messages occur, or this would only ever check one of them.
    expect(moving).toBeGreaterThan(0);
    expect(stuck).toBeGreaterThan(0);
  });
});

describe("X4 — the CEO may ask twice for what you refused", () => {
  it("path M: call is asked in the second quarter, refused, and asked again in the third", () => {
    const s = playPath(PATH_M);
    expect(s[1]?.order).toBe("call");
    expect(s[2]?.order).toBe("call");
    expect(s[2]?.refused).toEqual(["call"]);
  });
});

describe("X5 — the journal holds data, never sentences", () => {
  // Plan R10: the prototype logged French sentences, so a game in progress
  // could not switch language. Every string leaf of a quarter's log must be
  // a card id or one of the closed vocabularies below — anything else is text.
  const vocabulary = new Set<string>([
    ...RETENTION_HONEST_IDS,
    ...RETENTION_DARK_IDS,
    "midMail", "present", "control", "reports", "viral", "press", "competitor",
    "insight", "clean", "extra", "down", "up", "none",
    "hit", "cover", "missed", "obeyed", "refused",
    "calm", "firm", "angry", "cold",
  ]);

  function leaves(value: unknown, path: string, out: [string, unknown][]): void {
    if (value && typeof value === "object") {
      for (const [k, v] of Object.entries(value)) leaves(v, `${path}.${k}`, out);
    } else out.push([path, value]);
  }

  it("on every year the tests play", () => {
    for (const path of Object.values(ENDING_PATHS)) {
      const out: [string, unknown][] = [];
      leaves(finalState(path).log, "log", out);
      for (const [where, v] of out) {
        if (typeof v === "string") expect(vocabulary.has(v), `${where} = ${v}`).toBe(true);
        else if (typeof v === "number") expect(Number.isFinite(v), where).toBe(true);
        else expect(v === null || typeof v === "boolean", where).toBe(true);
      }
    }
  });
});

describe("runQuarter refuses what the rules refuse", () => {
  it("returns its input unchanged without exactly two picks, or once the year is over", () => {
    const one = picked(fresh(L), ["pause", "survey"]);
    const oneOnly = { ...one, picks: ["pause"] as Id[] };
    expect(runQuarter(L, oneOnly)).toBe(oneOnly);
    const over = finalState(PATH_A);
    expect(runQuarter(L, { ...over, picks: ["pause", "survey"] as Id[] }).log).toHaveLength(4);
  });

  it("never touches the state it is given", () => {
    const s = deepFreeze(picked(fresh(L), ["pdef", "bury"]));
    const next = runQuarter(L, s);
    expect(next.q).toBe(1);
    expect(s.q).toBe(0);
    expect(s.log).toHaveLength(0);
  });
});
