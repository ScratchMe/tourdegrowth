import { describe, expect, it } from "vitest";
import { extractGeminiText } from "../response";

describe("extractGeminiText", () => {
  it("extracts the text from a well-formed Gemini response", () => {
    const data = { candidates: [{ content: { parts: [{ text: '{"a":1}' }] } }] };
    expect(extractGeminiText(data)).toBe('{"a":1}');
  });

  it("throws a descriptive error when candidates is missing", () => {
    expect(() => extractGeminiText({})).toThrow(/Unexpected Gemini response shape/);
  });

  it("throws when the text field is missing deep in the structure", () => {
    expect(() => extractGeminiText({ candidates: [{ content: { parts: [{}] } }] })).toThrow(
      /Unexpected Gemini response shape/,
    );
  });

  it("throws on null/undefined input instead of crashing", () => {
    expect(() => extractGeminiText(null)).toThrow(/Unexpected Gemini response shape/);
    expect(() => extractGeminiText(undefined)).toThrow(/Unexpected Gemini response shape/);
  });
});
