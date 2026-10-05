import { describe, expect, it } from "vitest";
import { resolveBottleneck } from "@/lib/scoring/bottleneck";
import { PILLARS, type Pillar } from "@/lib/scoring/pillars";
import { enabledLevelSlugs, GAME_LEVELS_BY_PILLAR, gameEntriesFor, nextLevelFor, type GameLevelTable } from "../levels";
import type { ModelSlug } from "../types";

function board(scores: Record<Pillar, number>) {
  return resolveBottleneck(PILLARS.map((pillar) => ({ pillar, score: scores[pillar] })));
}

// A clear retention bottleneck: /r/sample's own board (8 against 12 and up).
const RETENTION_CLEAR = board({ acquisition: 18, activation: 12, retention: 8, referral: 16, revenue: 20 });
const ACQUISITION_CLEAR = board({ acquisition: 2, activation: 13, retention: 13, referral: 16, revenue: 13 });
const ACTIVATION_CLEAR = board({ acquisition: 13, activation: 2, retention: 13, referral: 16, revenue: 13 });
/** The table as it stood before level 2 (A12.f): the shared-bottleneck rules below are about retention. */
const RETENTION_ONLY: GameLevelTable = { retention: { slug: "retention", enabled: true } };
const LEVEL = board({ acquisition: 16, activation: 16, retention: 20, referral: 16, revenue: 20 });

describe("GAME_LEVELS_BY_PILLAR (GAME-BRIEF.md 13.4)", () => {
  it("ships with three levels, acquisition, activation and retention, enabled, in AARRR order", () => {
    expect(GAME_LEVELS_BY_PILLAR).toEqual({
      acquisition: { slug: "acquisition", enabled: true },
      activation: { slug: "activation", enabled: true },
      retention: { slug: "retention", enabled: true },
    });
    // The sitemap, /llms.txt and the hub's image list the levels in this order.
    expect(enabledLevelSlugs()).toEqual(["acquisition", "activation", "retention"]);
  });

  it("an enabled: false level is not playable", () => {
    expect(enabledLevelSlugs({ retention: { slug: "retention", enabled: false } })).toEqual([]);
  });
});

// Série G, test G6.
describe("gameEntriesFor", () => {
  it("offers the retention level when retention is the clear bottleneck and access is open", () => {
    expect(RETENTION_CLEAR.sharpness).toBe("clear");
    expect(gameEntriesFor({ bottleneck: RETENTION_CLEAR, access: "open" })).toEqual([{ pillar: "retention", slug: "retention" }]);
  });

  it("offers nothing when access is closed", () => {
    expect(gameEntriesFor({ bottleneck: RETENTION_CLEAR, access: "closed" })).toEqual([]);
  });

  it("offers the acquisition level when acquisition is the clear bottleneck (level 2, A12.f)", () => {
    expect(ACQUISITION_CLEAR.sharpness).toBe("clear");
    expect(gameEntriesFor({ bottleneck: ACQUISITION_CLEAR, access: "open" })).toEqual([{ pillar: "acquisition", slug: "acquisition" }]);
  });

  it("offers the activation level when activation is the clear bottleneck (level 3, A24 ACT-3)", () => {
    expect(ACTIVATION_CLEAR.sharpness).toBe("clear");
    expect(gameEntriesFor({ bottleneck: ACTIVATION_CLEAR, access: "open" })).toEqual([{ pillar: "activation", slug: "activation" }]);
  });

  // An explicit table, not the real one: a stage with no level is, level by
  // level, a moving target (activation had none until A24 ACT-3).
  it("offers nothing for a pillar with no level", () => {
    expect(ACTIVATION_CLEAR.sharpness).toBe("clear");
    expect(gameEntriesFor({ bottleneck: ACTIVATION_CLEAR, access: "open", levels: RETENTION_ONLY })).toEqual([]);
  });

  it("offers nothing on a level board — no stage is named, so no stage is sold", () => {
    expect(LEVEL.sharpness).toBe("level");
    expect(gameEntriesFor({ bottleneck: LEVEL, access: "open" })).toEqual([]);
    // Even a hand-built level view that still lists pillars stands down.
    expect(
      gameEntriesFor({ bottleneck: { sharpness: "level", pillars: [{ pillar: "retention" }] }, access: "open" }),
    ).toEqual([]);
  });

  it("offers nothing when the level exists but is not enabled yet", () => {
    const levels: GameLevelTable = { retention: { slug: "retention", enabled: false } };
    expect(gameEntriesFor({ bottleneck: RETENTION_CLEAR, access: "open", levels })).toEqual([]);
  });
});

// X16 — orchestrator decision 2: a shared bottleneck that includes retention
// shows the card, even when retention is not first in the group.
describe("gameEntriesFor, shared bottleneck (X16)", () => {
  it("finds retention anywhere in the bottleneck group, not only at pillars[0]", () => {
    // Acquisition and retention tie at the bottom: AARRR order puts
    // acquisition first, which is a tie-break, not a diagnosis.
    const shared = board({ acquisition: 7, activation: 16, retention: 7, referral: 16, revenue: 20 });
    expect(shared.sharpness).toBe("shared");
    expect(shared.pillars[0]?.pillar).toBe("acquisition");
    expect(gameEntriesFor({ bottleneck: shared, access: "open", levels: RETENTION_ONLY })).toEqual([{ pillar: "retention", slug: "retention" }]);
  });

  it("offers nothing for a shared bottleneck whose stages have no level", () => {
    const shared = board({ acquisition: 16, activation: 5, retention: 16, referral: 7, revenue: 20 });
    expect(shared.sharpness).toBe("shared");
    expect(shared.pillars.map((p) => p.pillar)).toEqual(["activation", "referral"]);
    expect(gameEntriesFor({ bottleneck: shared, access: "open", levels: RETENTION_ONLY })).toEqual([]);
  });

  // C30 Q5 (Antoine, 2026-10-01): every stage of the group that has a level,
  // lowest first — the reader chooses, AARRR order no longer does.
  it("offers every stage of the group that has a level, lowest first (C30 Q5)", () => {
    const shared = board({ acquisition: 7, activation: 16, retention: 5, referral: 16, revenue: 20 });
    expect(shared.pillars.map((p) => p.pillar)).toEqual(["retention", "acquisition"]);
    expect(gameEntriesFor({ bottleneck: shared, access: "open" })).toEqual([
      { pillar: "retention", slug: "retention" },
      { pillar: "acquisition", slug: "acquisition" },
    ]);
  });

  it("offers a level once, even when two stages point at it", () => {
    const levels: GameLevelTable = {
      referral: { slug: "retention", enabled: true },
      retention: { slug: "retention", enabled: true },
    };
    const shared = board({ acquisition: 16, activation: 16, retention: 7, referral: 5, revenue: 20 });
    expect(shared.pillars.map((p) => p.pillar)).toEqual(["referral", "retention"]);
    expect(gameEntriesFor({ bottleneck: shared, access: "open", levels })).toEqual([{ pillar: "referral", slug: "retention" }]);
  });
});

// The block that closes December (C31, then C75, A24.T0): the first open level
// the player has not finished, in the Tour's order, wrapping round.
describe("nextLevelFor (C75)", () => {
  /** `LevelSlug` names three levels until the next X-3: the five-level tables are declared on the model slugs. */
  type FiveLevels = Partial<Record<Pillar, { slug: ModelSlug; enabled: boolean }>>;
  const open = (slug: ModelSlug) => ({ slug, enabled: true });
  const FIVE: FiveLevels = {
    acquisition: open("acquisition"),
    activation: open("activation"),
    retention: open("retention"),
    referral: open("referral"),
    revenue: open("revenue"),
  };
  const done = (...slugs: ModelSlug[]): ReadonlySet<string> => new Set(slugs);

  it("with two levels open, each one points at the other, finished or not (C31 holds)", () => {
    const two: FiveLevels = { acquisition: open("acquisition"), retention: open("retention") };
    for (const finished of [done(), done("acquisition"), done("retention"), done("acquisition", "retention")]) {
      expect(nextLevelFor("acquisition", finished, two)).toBe("retention");
      expect(nextLevelFor("retention", finished, two)).toBe("acquisition");
    }
  });

  it("with the three levels the game ships (A24 ACT-3): the next in the Tour's order, then the one not finished", () => {
    expect(nextLevelFor("acquisition", done(), GAME_LEVELS_BY_PILLAR)).toBe("activation");
    expect(nextLevelFor("activation", done(), GAME_LEVELS_BY_PILLAR)).toBe("retention");
    expect(nextLevelFor("retention", done(), GAME_LEVELS_BY_PILLAR)).toBe("acquisition");
    // Activation finished: acquisition leads on to retention, never back to it.
    expect(nextLevelFor("acquisition", done("activation"), GAME_LEVELS_BY_PILLAR)).toBe("retention");
    // Everything else finished: the next one in the order, as with five.
    expect(nextLevelFor("acquisition", done("activation", "retention"), GAME_LEVELS_BY_PILLAR)).toBe("activation");
  });

  it("with five levels open and nothing finished, the next one in the Tour's order, wrapping round", () => {
    expect(nextLevelFor("acquisition", done(), FIVE)).toBe("activation");
    expect(nextLevelFor("activation", done(), FIVE)).toBe("retention");
    expect(nextLevelFor("retention", done(), FIVE)).toBe("referral");
    expect(nextLevelFor("referral", done(), FIVE)).toBe("revenue");
    expect(nextLevelFor("revenue", done(), FIVE)).toBe("acquisition");
  });

  it("skips a level the player has finished: retention done, activation leads to referral", () => {
    expect(nextLevelFor("activation", done("retention"), FIVE)).toBe("referral");
  });

  it("goes on past several finished levels, and round the end of the Tour", () => {
    expect(nextLevelFor("acquisition", done("activation", "retention"), FIVE)).toBe("referral");
    expect(nextLevelFor("referral", done("revenue", "acquisition"), FIVE)).toBe("activation");
  });

  it("when every other level is finished, falls back to the next one in the order", () => {
    const all = done("acquisition", "activation", "retention", "referral", "revenue");
    expect(nextLevelFor("acquisition", all, FIVE)).toBe("activation");
    expect(nextLevelFor("retention", all, FIVE)).toBe("referral");
    expect(nextLevelFor("revenue", all, FIVE)).toBe("acquisition");
  });

  it("ignores the level's own ending: finishing a level never sends the player back to it", () => {
    expect(nextLevelFor("retention", done("retention"), FIVE)).toBe("referral");
  });

  it("skips a closed level, finished or not", () => {
    const closed: FiveLevels = { ...FIVE, referral: { slug: "referral", enabled: false } };
    expect(nextLevelFor("retention", done(), closed)).toBe("revenue");
    expect(nextLevelFor("activation", done("retention"), closed)).toBe("revenue");
    // Only closed levels left besides this one: nothing to point at.
    const lone: FiveLevels = { activation: open("activation"), revenue: { slug: "revenue", enabled: false } };
    expect(nextLevelFor("activation", done(), lone)).toBeNull();
  });

  it("returns null when the level is the only one open, and when nothing is open", () => {
    expect(nextLevelFor("retention", done(), { retention: open("retention") })).toBeNull();
    expect(nextLevelFor("retention", done("retention"), { retention: open("retention") })).toBeNull();
    expect(nextLevelFor("retention", done(), {})).toBeNull();
  });

  it("a level named by two stages is still one level: finished, it is only the fallback", () => {
    const twice: FiveLevels = { acquisition: open("acquisition"), activation: open("retention"), retention: open("retention") };
    expect(nextLevelFor("acquisition", done("retention"), twice)).toBe("retention");
  });
});
