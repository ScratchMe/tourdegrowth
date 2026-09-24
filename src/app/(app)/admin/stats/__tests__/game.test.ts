import { describe, expect, it } from "vitest";
import type { FunnelWindow } from "@/lib/analytics/goatcounter-api";
import { gamePass } from "../game";

const GROWTH = { retentionBottleneckResults: { allTime: 40, last30Days: 8 } };

function window(label: string, entries: Record<string, number>): FunnelWindow {
  const all = { "result/retention": 0, "deep_dive/retention": 0, footer: 0, hub: 0, ...entries };
  return { label, stats: { game: { entries: all } } } as unknown as FunnelWindow;
}

describe("gamePass — result → game (GAME-BRIEF.md §13.5)", () => {
  it("counts both result-page variants over the retention results of the same window", () => {
    const pass = gamePass(window("Last 30 days", { "result/retention": 5, "deep_dive/retention": 1, footer: 9, hub: 3 }), GROWTH);
    // Footer and hub clicks are other doors: they do not belong to the result page.
    expect(pass).toEqual({ label: "Last 30 days", resultClicks: 6, retentionResults: 8, clicksPerResult: 0.75 });
  });

  it("pairs the all-time window with the all-time count", () => {
    expect(gamePass(window("All-time", { "result/retention": 10 }), GROWTH)?.clicksPerResult).toBe(0.25);
  });

  it("has nothing to divide by when no retention result exists, or the window is unknown", () => {
    expect(gamePass(window("Last 30 days", { "result/retention": 2 }), { retentionBottleneckResults: { allTime: 0, last30Days: 0 } })?.clicksPerResult).toBeNull();
    expect(gamePass(window("Last 7 days", { "result/retention": 2 }), GROWTH)).toMatchObject({ retentionResults: null, clicksPerResult: null });
  });

  it("is null when GoatCounter was unavailable", () => {
    expect(gamePass({ label: "All-time", stats: null, error: "down" }, GROWTH)).toBeNull();
  });
});
