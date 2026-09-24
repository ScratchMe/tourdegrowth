import { describe, expect, it } from "vitest";
import {
  GAME_ENTRY_DETAILS,
  GAME_ENTRY_EVENT,
  GAME_START_FROM,
  gameEventPaths,
  gameStartedDetail,
  parseGameStartFrom,
} from "../events";

describe("game analytics vocabulary (plan §3.8)", () => {
  it("lists every path exactly once", () => {
    const paths = gameEventPaths();
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("carries only fixed segments — no digits beyond the quarter number, no spaces", () => {
    // A path that could carry a player's own number or text would make the
    // dashboard an unbounded list and ship something about their year off
    // the device. Quarters 1-4 are the one numeric segment, and they are a
    // closed list too.
    for (const path of gameEventPaths()) {
      expect(path).toMatch(/^[a-z_]+(\/[a-zA-Z_]+|\/[1-4])*$/);
    }
  });

  it("has the four entry doors the brief names (G7's source list)", () => {
    expect(GAME_ENTRY_DETAILS.map((d) => `${GAME_ENTRY_EVENT}/${d}`)).toEqual([
      "game_entry_clicked/result/retention",
      "game_entry_clicked/deep_dive/retention",
      "game_entry_clicked/footer",
      "game_entry_clicked/hub",
    ]);
  });

  it("includes the resume answer (orchestrator decision 5) and every start origin", () => {
    const paths = gameEventPaths();
    expect(paths).toEqual(expect.arrayContaining(["game_resume/resume", "game_resume/restart"]));
    for (const from of GAME_START_FROM) expect(paths).toContain(`game_started/retention/${from}`);
  });

  it("builds the game_started detail from the level and origin", () => {
    expect(gameStartedDetail("retention", "result")).toBe("retention/result");
  });

  it("reads ?from= as a closed list, anything else being a direct arrival", () => {
    expect(parseGameStartFrom("deep_dive")).toBe("deep_dive");
    for (const v of [null, undefined, "", "twitter", "RESULT", "result/"]) {
      expect(parseGameStartFrom(v)).toBe("direct");
    }
  });
});
