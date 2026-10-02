import { describe, expect, it } from "vitest";
import { resolveBottleneck } from "@/lib/scoring/bottleneck";
import { PILLARS, type Pillar } from "@/lib/scoring/pillars";
import { enabledLevelSlugs, GAME_LEVELS_BY_PILLAR, gameEntriesFor, type GameLevelTable } from "../levels";

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
  it("ships with two levels, acquisition and retention, enabled, in AARRR order", () => {
    expect(GAME_LEVELS_BY_PILLAR).toEqual({
      acquisition: { slug: "acquisition", enabled: true },
      retention: { slug: "retention", enabled: true },
    });
    // The sitemap, /llms.txt and the hub's image list the levels in this order.
    expect(enabledLevelSlugs()).toEqual(["acquisition", "retention"]);
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

  it("offers nothing for a pillar with no level", () => {
    expect(ACTIVATION_CLEAR.sharpness).toBe("clear");
    expect(gameEntriesFor({ bottleneck: ACTIVATION_CLEAR, access: "open" })).toEqual([]);
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
    expect(gameEntriesFor({ bottleneck: shared, access: "open" })).toEqual([]);
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
