import { describe, expect, it } from "vitest";
import { resolveBottleneck } from "@/lib/scoring/bottleneck";
import { PILLARS, type Pillar } from "@/lib/scoring/pillars";
import { enabledLevelSlugs, GAME_LEVELS_BY_PILLAR, gameEntryFor, type GameLevelTable } from "../levels";

function board(scores: Record<Pillar, number>) {
  return resolveBottleneck(PILLARS.map((pillar) => ({ pillar, score: scores[pillar] })));
}

// A clear retention bottleneck: /r/sample's own board (8 against 12 and up).
const RETENTION_CLEAR = board({ acquisition: 18, activation: 12, retention: 8, referral: 16, revenue: 20 });
const ACQUISITION_CLEAR = board({ acquisition: 2, activation: 13, retention: 13, referral: 16, revenue: 13 });
const LEVEL = board({ acquisition: 16, activation: 16, retention: 20, referral: 16, revenue: 20 });

describe("GAME_LEVELS_BY_PILLAR (GAME-BRIEF.md 13.4)", () => {
  it("ships with exactly one level, retention, enabled", () => {
    expect(GAME_LEVELS_BY_PILLAR).toEqual({ retention: { slug: "retention", enabled: true } });
    expect(enabledLevelSlugs()).toEqual(["retention"]);
  });

  it("an enabled: false level is not playable", () => {
    expect(enabledLevelSlugs({ retention: { slug: "retention", enabled: false } })).toEqual([]);
  });
});

// Série G, test G6.
describe("gameEntryFor", () => {
  it("offers the retention level when retention is the clear bottleneck and access is open", () => {
    expect(RETENTION_CLEAR.sharpness).toBe("clear");
    expect(gameEntryFor({ bottleneck: RETENTION_CLEAR, access: "open" })).toEqual({
      pillar: "retention",
      slug: "retention",
    });
  });

  it("offers nothing when access is closed", () => {
    expect(gameEntryFor({ bottleneck: RETENTION_CLEAR, access: "closed" })).toBeNull();
  });

  it("offers nothing for a pillar with no level", () => {
    expect(ACQUISITION_CLEAR.sharpness).toBe("clear");
    expect(gameEntryFor({ bottleneck: ACQUISITION_CLEAR, access: "open" })).toBeNull();
  });

  it("offers nothing on a level board — no stage is named, so no stage is sold", () => {
    expect(LEVEL.sharpness).toBe("level");
    expect(gameEntryFor({ bottleneck: LEVEL, access: "open" })).toBeNull();
    // Even a hand-built level view that still lists pillars stands down.
    expect(
      gameEntryFor({ bottleneck: { sharpness: "level", pillars: [{ pillar: "retention" }] }, access: "open" }),
    ).toBeNull();
  });

  it("offers nothing when the level exists but is not enabled yet", () => {
    const levels: GameLevelTable = { retention: { slug: "retention", enabled: false } };
    expect(gameEntryFor({ bottleneck: RETENTION_CLEAR, access: "open", levels })).toBeNull();
  });
});

// X16 — orchestrator decision 2: a shared bottleneck that includes retention
// shows the card, even when retention is not first in the group.
describe("gameEntryFor, shared bottleneck (X16)", () => {
  it("finds retention anywhere in the bottleneck group, not only at pillars[0]", () => {
    // Acquisition and retention tie at the bottom: AARRR order puts
    // acquisition first, which is a tie-break, not a diagnosis.
    const shared = board({ acquisition: 7, activation: 16, retention: 7, referral: 16, revenue: 20 });
    expect(shared.sharpness).toBe("shared");
    expect(shared.pillars[0]?.pillar).toBe("acquisition");
    expect(gameEntryFor({ bottleneck: shared, access: "open" })).toEqual({ pillar: "retention", slug: "retention" });
  });

  it("offers nothing for a shared bottleneck that leaves retention out", () => {
    const shared = board({ acquisition: 5, activation: 7, retention: 16, referral: 16, revenue: 20 });
    expect(shared.sharpness).toBe("shared");
    expect(shared.pillars.map((p) => p.pillar)).not.toContain("retention");
    expect(gameEntryFor({ bottleneck: shared, access: "open" })).toBeNull();
  });

  it("picks the lowest stage that has a level when several do", () => {
    const levels: GameLevelTable = {
      referral: { slug: "retention", enabled: true },
      retention: { slug: "retention", enabled: true },
    };
    const shared = board({ acquisition: 16, activation: 16, retention: 7, referral: 5, revenue: 20 });
    expect(shared.pillars.map((p) => p.pillar)).toEqual(["referral", "retention"]);
    expect(gameEntryFor({ bottleneck: shared, access: "open", levels })?.pillar).toBe("referral");
  });
});
