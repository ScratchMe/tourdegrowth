import { describe, expect, it } from "vitest";
import { parseVerdict } from "../verdict";

const validJson = JSON.stringify({
  headline: "Solid engine, one flat tyre.",
  strengths: ["Strong acquisition discipline.", "Revenue model is validated."],
  weaknesses: ["Retention isn't tracked.", "No re-engagement mechanism."],
  recommendation: "Set up a D7/D30 retention dashboard before anything else.",
});

describe("parseVerdict", () => {
  it("parses a well-formed Gemini response", () => {
    const verdict = parseVerdict(validJson, "gemini-3.7-flash");
    expect(verdict).toEqual({
      headline: "Solid engine, one flat tyre.",
      strengths: ["Strong acquisition discipline.", "Revenue model is validated."],
      weaknesses: ["Retention isn't tracked.", "No re-engagement mechanism."],
      recommendation: "Set up a D7/D30 retention dashboard before anything else.",
      modelUsed: "gemini-3.7-flash",
    });
  });

  it("strips ```json fences before validating", () => {
    const verdict = parseVerdict(`\`\`\`json\n${validJson}\n\`\`\``, "gemini-3.6-flash");
    expect(verdict.modelUsed).toBe("gemini-3.6-flash");
  });

  it("rejects a missing headline", () => {
    const bad = JSON.stringify({ strengths: ["a", "b"], weaknesses: ["a", "b"], recommendation: "x" });
    expect(() => parseVerdict(bad, "m")).toThrow(/headline/);
  });

  it("rejects a missing strengths field", () => {
    const bad = JSON.stringify({ headline: "h", weaknesses: ["a", "b"], recommendation: "x" });
    expect(() => parseVerdict(bad, "m")).toThrow(/strengths/);
  });

  it("rejects strengths with the wrong number of items", () => {
    const bad = JSON.stringify({ headline: "h", strengths: ["only one"], weaknesses: ["a", "b"], recommendation: "x" });
    expect(() => parseVerdict(bad, "m")).toThrow(/strengths/);
  });

  it("rejects an empty-string item", () => {
    const bad = JSON.stringify({ headline: "h", strengths: ["a", "   "], weaknesses: ["a", "b"], recommendation: "x" });
    expect(() => parseVerdict(bad, "m")).toThrow(/strengths/);
  });

  it("rejects a missing recommendation", () => {
    const bad = JSON.stringify({ headline: "h", strengths: ["a", "b"], weaknesses: ["a", "b"] });
    expect(() => parseVerdict(bad, "m")).toThrow(/recommendation/);
  });

  it("rejects text that isn't valid JSON at all", () => {
    expect(() => parseVerdict("not json", "m")).toThrow();
  });
});
