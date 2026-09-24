import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { RETENTION_DARK_IDS, RETENTION_HONEST_IDS, type RetentionCardId } from "../levels/retention";
import {
  clearGame,
  isGameState,
  loadCollection,
  loadGame,
  recordYearEnd,
  resumeMode,
  saveGame,
} from "../storage";
import { GAME_COLLECTION_KEY, GAME_SAVE_KEYS } from "../storage-keys";

const GAME_SAVE_KEY = GAME_SAVE_KEYS.retention;
import type { GameState, LevelDefinition } from "../types";

// Plan §4.2, G3 — X13 (save) and X14 (collection). The engine's real
// LevelDefinition is written in parallel (G1); storage only reads the slug,
// the model version, the card ids and picksPerQuarter from it, so a level
// carrying exactly those is the honest fixture — anything more would be
// testing numbers this module never looks at.
const ALL_IDS = [...RETENTION_HONEST_IDS, ...RETENTION_DARK_IDS];
const LEVEL = {
  slug: "retention",
  modelVersion: 3,
  constants: { picksPerQuarter: 2 },
  cards: Object.fromEntries(ALL_IDS.map((id) => [id, { id }])),
} as unknown as LevelDefinition<RetentionCardId>;

/** The prototype's fresh() state (design/game/prototype-s-ils-reviennent.html), typed. */
function fresh(): GameState<RetentionCardId> {
  return {
    v: 1, level: "retention", q: 0, month: 0, subs: 100_000, churn: 0.06, mrr: 1_199_000,
    trust: 60, radar: 10, patience: 55, lagTrust: 60, callOpen: true,
    order: null, orders: [], obeyed: [], refused: [], active: [], since: {},
    everDark: [], removedDark: [], seenDark: [], insight: false, presented: 0, picks: [],
    history: [{ m: 0, churn: 0.06, trust: 60, subs: 100_000, mrr: 1_199_000 }], log: [],
    sanction: false, fired: false, over: false, ending: null, spike: 0, press: 0,
  };
}

/** A state one quarter in: what the resume prompt exists for. */
function afterQ1(): GameState<RetentionCardId> {
  const s = fresh();
  return {
    ...s, q: 1, month: 3, callOpen: false, active: ["pdef"], since: { pdef: 1 },
    everDark: ["pdef"], seenDark: ["pdef", "bury"],
    history: [...s.history, { m: 1, churn: 0.058, trust: 58, subs: 99_000, mrr: 1_190_000 }],
    log: [{
      q: 0, picked: ["pdef", "survey"], order: null, fx: [{ card: "pdef", effect: { kind: "none" } }],
      churnStart: 0.06, churnEnd: 0.055, target: 0.056, gap: -0.001, subs: 98_000, mrr: 1_180_000,
      patience: 60, events: [{ kind: "competitor" }], boss: { verdict: "hit", order: null }, moodAfter: "calm",
    }],
  };
}

function createFakeLocalStorage() {
  const store = new Map<string, string>();
  return {
    store,
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
  };
}

const originalWindow = (globalThis as { window?: unknown }).window;
let storage: ReturnType<typeof createFakeLocalStorage>;

beforeEach(() => {
  storage = createFakeLocalStorage();
  (globalThis as { window?: unknown }).window = { localStorage: storage };
});

afterEach(() => {
  (globalThis as { window?: unknown }).window = originalWindow;
});

describe("saved year (X13)", () => {
  it("round-trips a state under the level's key with its model version", () => {
    const now = new Date("2026-09-24T10:00:00Z");
    saveGame(LEVEL, afterQ1(), now);

    const envelope = JSON.parse(storage.store.get(GAME_SAVE_KEY)!);
    expect(envelope.modelVersion).toBe(3);
    expect(envelope.savedAt).toBe(now.toISOString());

    expect(loadGame(LEVEL)).toEqual({ savedAt: now.toISOString(), state: afterQ1() });
  });

  it("ignores a save written by another model version", () => {
    saveGame(LEVEL, afterQ1());
    expect(loadGame({ ...LEVEL, modelVersion: 4 })).toBeNull();
  });

  it("ignores corrupt JSON and an envelope with no state", () => {
    storage.setItem(GAME_SAVE_KEY, "{not json");
    expect(loadGame(LEVEL)).toBeNull();
    storage.setItem(GAME_SAVE_KEY, JSON.stringify({ modelVersion: 3, savedAt: "x" }));
    expect(loadGame(LEVEL)).toBeNull();
  });

  it("keeps the game going when localStorage throws on every access", () => {
    (globalThis as { window?: unknown }).window = {
      localStorage: {
        getItem: () => { throw new Error("SecurityError"); },
        setItem: () => { throw new Error("QuotaExceededError"); },
        removeItem: () => { throw new Error("SecurityError"); },
      },
    };
    expect(() => saveGame(LEVEL, fresh())).not.toThrow();
    expect(loadGame(LEVEL)).toBeNull();
    expect(() => clearGame(LEVEL)).not.toThrow();
    expect(() => recordYearEnd(LEVEL, { seen: [], used: [], ending: "fine" })).not.toThrow();
    expect(loadCollection()).toEqual({ patterns: {}, endings: {} });
  });

  it("is a no-op on the server", () => {
    (globalThis as { window?: unknown }).window = undefined;
    expect(() => saveGame(LEVEL, fresh())).not.toThrow();
    expect(loadGame(LEVEL)).toBeNull();
    expect(loadCollection()).toEqual({ patterns: {}, endings: {} });
  });

  it("clearGame removes the save, so « Recommencer » starts from the fresh year", () => {
    saveGame(LEVEL, afterQ1());
    clearGame(LEVEL);
    expect(loadGame(LEVEL)).toBeNull();
  });

  it("asks before resuming only when a quarter has been played (P15)", () => {
    expect(resumeMode(null)).toBe("none");
    expect(resumeMode({ savedAt: "", state: fresh() })).toBe("silent");
    expect(resumeMode({ savedAt: "", state: afterQ1() })).toBe("prompt");
  });
});

describe("isGameState", () => {
  it("accepts the fresh year and a year in progress", () => {
    expect(isGameState(LEVEL, fresh())).toBe(true);
    expect(isGameState(LEVEL, afterQ1())).toBe(true);
  });

  // Each case breaks exactly one thing the renderer relies on without
  // checking. One test per property, so a guard that silently stopped
  // checking one of them shows up by name.
  const broken: [string, (s: GameState<RetentionCardId>) => unknown][] = [
    ["another level", (s) => ({ ...s, level: "activation" })],
    ["another state version", (s) => ({ ...s, v: 2 })],
    ["a non-finite number", (s) => ({ ...s, churn: Number.NaN })],
    ["a gauge above 100", (s) => ({ ...s, trust: 140 })],
    ["a gauge below 0", (s) => ({ ...s, patience: -3 })],
    ["an unknown card id", (s) => ({ ...s, active: ["teleport"] })],
    ["an unknown order", (s) => ({ ...s, order: "teleport" })],
    ["an unknown id as a `since` key", (s) => ({ ...s, since: { teleport: 1 } })],
    ["more picks than a quarter allows", (s) => ({ ...s, picks: ["pause", "survey", "onboard"] })],
    ["an unknown ending", (s) => ({ ...s, ending: "winner" })],
    ["no history point", (s) => ({ ...s, history: [] })],
    ["a journal out of step with the quarter", (s) => ({ ...s, q: 2 })],
    ["a quarter past the year", (s) => ({ ...s, q: 5 })],
    ["a malformed journal entry", (s) => ({ ...s, q: 1, log: [{ q: 0 }] })],
    ["not an object at all", () => null],
  ];

  for (const [what, breakIt] of broken) {
    it(`rejects ${what}`, () => {
      expect(isGameState(LEVEL, breakIt(fresh()))).toBe(false);
    });
  }

  it("a save that fails the shape check is ignored on load", () => {
    storage.setItem(GAME_SAVE_KEY, JSON.stringify({ modelVersion: 3, savedAt: "x", state: { ...fresh(), trust: 400 } }));
    expect(loadGame(LEVEL)).toBeNull();
  });
});

describe("collection (X14)", () => {
  it("is empty until a year ends", () => {
    expect(loadCollection()).toEqual({ patterns: {}, endings: {} });
  });

  it("writes a year-end and reads it back", () => {
    const at = new Date("2026-12-31T23:00:00Z");
    recordYearEnd(LEVEL, { seen: ["pdef", "bury"], used: ["pdef"], ending: "firedDark" }, at);
    expect(loadCollection()).toEqual({
      patterns: { retention: { seen: ["pdef", "bury"], used: ["pdef"] } },
      endings: { retention: { id: "firedDark", at: at.toISOString() } },
    });
  });

  it("accumulates patterns across years and keeps the latest ending", () => {
    recordYearEnd(LEVEL, { seen: ["pdef"], used: ["pdef"], ending: "firedDark" });
    recordYearEnd(LEVEL, { seen: ["bury", "pdef"], used: [], ending: "applause" });
    const c = loadCollection();
    expect(c.patterns.retention).toEqual({ seen: ["pdef", "bury"], used: ["pdef"] });
    expect(c.endings.retention?.id).toBe("applause");
  });

  it("drops ids the level does not know", () => {
    recordYearEnd(LEVEL, { seen: ["pdef", "teleport" as RetentionCardId], used: [], ending: "fine" });
    expect(loadCollection().patterns.retention?.seen).toEqual(["pdef"]);
  });

  it("keeps what it can read when part of the stored collection is malformed", () => {
    storage.setItem(
      GAME_COLLECTION_KEY,
      JSON.stringify({ patterns: { retention: { seen: "nope", used: [] } }, endings: { retention: { id: "fine", at: "t" } } }),
    );
    expect(loadCollection()).toEqual({ patterns: {}, endings: { retention: { id: "fine", at: "t" } } });
  });
});
