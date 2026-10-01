import { describe, expect, it } from "vitest";
import { SETUP_TOOLS, TOOL_FAMILIES, teamTools } from "../tools";

/** « Tes outils » (engine spec §19.5.1, C32 Q9, A14 T4): by family, optional, read in one order. */
describe("the team's tools", () => {
  it("five families, every tool once, and no app store: no number cites them yet", () => {
    expect(TOOL_FAMILIES.map((f) => f.family)).toEqual(["analytics", "billing", "crm", "ads", "other"]);
    expect(new Set(SETUP_TOOLS).size).toBe(SETUP_TOOLS.length);
    expect(SETUP_TOOLS).not.toContain("app-store-connect");
    expect(SETUP_TOOLS).not.toContain("play-console");
  });

  it("read in the families' order, once each, the offered ones only; nothing said is nothing", () => {
    expect(teamTools(["stripe", "ga4", "stripe", "play-console"])).toEqual(["ga4", "stripe"]);
    expect(teamTools(undefined)).toEqual([]);
    expect(teamTools([])).toEqual([]);
  });
});
