import { describe, expect, it } from "vitest";
import type { FunnelWindow } from "@/lib/analytics/goatcounter-api";
import { gamePass } from "../game";

const GROWTH = { gameBottleneckResults: { allTime: 40, last30Days: 8 } };

function window(label: string, entries: Record<string, number>): FunnelWindow {
  const all = {
    "result/acquisition": 0, "deep_dive/acquisition": 0, "result/activation": 0, "deep_dive/activation": 0,
    "result/retention": 0, "deep_dive/retention": 0, "result/referral": 0, "deep_dive/referral": 0,
    "result/revenue": 0, "deep_dive/revenue": 0,
    footer: 0, hub: 0, ...entries,
  };
  return { label, stats: { game: { entries: all } } } as unknown as FunnelWindow;
}

describe("gamePass — result → game (GAME-BRIEF.md §13.5)", () => {
  it("counts both result-page variants of every level over the results of the same window", () => {
    const pass = gamePass(
      window("Last 30 days", { "result/retention": 3, "deep_dive/retention": 1, "result/acquisition": 2, "result/activation": 1, "deep_dive/referral": 1, "result/revenue": 1, footer: 9, hub: 3 }),
      GROWTH,
    );
    // Footer and hub clicks are other doors: they do not belong to the result page.
    expect(pass).toEqual({ label: "Last 30 days", resultClicks: 9, gameResults: 8, clicksPerResult: 1.125 });
  });

  it("pairs the all-time window with the all-time count", () => {
    expect(gamePass(window("All-time", { "result/retention": 10 }), GROWTH)?.clicksPerResult).toBe(0.25);
  });

  it("has nothing to divide by when no such result exists, or the window is unknown", () => {
    expect(gamePass(window("Last 30 days", { "result/retention": 2 }), { gameBottleneckResults: { allTime: 0, last30Days: 0 } })?.clicksPerResult).toBeNull();
    expect(gamePass(window("Last 7 days", { "result/retention": 2 }), GROWTH)).toMatchObject({ gameResults: null, clicksPerResult: null });
  });

  it("is null when GoatCounter was unavailable", () => {
    expect(gamePass({ label: "All-time", stats: null, error: "down" }, GROWTH)).toBeNull();
  });
});
