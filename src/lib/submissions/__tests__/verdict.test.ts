import { describe, expect, it } from "vitest";
import { parseDeepDiveVerdict } from "../verdict";

const validJson = JSON.stringify({
  pillarRecommendations: {
    acquisition: "Specific acquisition recommendation.",
    activation: "Specific activation recommendation.",
    retention: "Specific retention recommendation.",
    referral: "Specific referral recommendation.",
    revenue: "Specific revenue recommendation.",
  },
  priorityAction: "Instrument week-4 retention by cohort this month.",
});

describe("parseDeepDiveVerdict", () => {
  it("parses a well-formed Gemini response", () => {
    const verdict = parseDeepDiveVerdict(validJson, "gemini-3.7-flash");
    expect(verdict).toEqual({
      pillarRecommendations: {
        acquisition: "Specific acquisition recommendation.",
        activation: "Specific activation recommendation.",
        retention: "Specific retention recommendation.",
        referral: "Specific referral recommendation.",
        revenue: "Specific revenue recommendation.",
      },
      priorityAction: "Instrument week-4 retention by cohort this month.",
      modelUsed: "gemini-3.7-flash",
    });
  });

  it("strips ```json fences before validating", () => {
    const verdict = parseDeepDiveVerdict(`\`\`\`json\n${validJson}\n\`\`\``, "gemini-3.6-flash");
    expect(verdict.modelUsed).toBe("gemini-3.6-flash");
  });

  it("rejects a missing pillarRecommendations object", () => {
    const bad = JSON.stringify({ priorityAction: "x" });
    expect(() => parseDeepDiveVerdict(bad, "m")).toThrow(/pillarRecommendations/);
  });

  it("rejects a pillarRecommendations object missing one pillar", () => {
    const bad = JSON.stringify({
      pillarRecommendations: {
        acquisition: "a",
        activation: "b",
        retention: "c",
        referral: "d",
        // revenue missing
      },
      priorityAction: "x",
    });
    expect(() => parseDeepDiveVerdict(bad, "m")).toThrow(/pillarRecommendations\.revenue/);
  });

  it("rejects an empty-string pillar recommendation", () => {
    const bad = JSON.stringify({
      pillarRecommendations: {
        acquisition: "a",
        activation: "b",
        retention: "   ",
        referral: "d",
        revenue: "e",
      },
      priorityAction: "x",
    });
    expect(() => parseDeepDiveVerdict(bad, "m")).toThrow(/pillarRecommendations\.retention/);
  });

  it("rejects a missing priorityAction", () => {
    const bad = JSON.stringify({
      pillarRecommendations: {
        acquisition: "a",
        activation: "b",
        retention: "c",
        referral: "d",
        revenue: "e",
      },
    });
    expect(() => parseDeepDiveVerdict(bad, "m")).toThrow(/priorityAction/);
  });

  it("rejects text that isn't valid JSON at all", () => {
    expect(() => parseDeepDiveVerdict("not json", "m")).toThrow();
  });
});
