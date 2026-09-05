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

/** REVIEW.md R-16 — every non-answer used to collapse into one opaque message. */
describe("extractGeminiText — why there is no text", () => {
  it("names a refused prompt", () => {
    expect(() => extractGeminiText({ promptFeedback: { blockReason: "SAFETY" } })).toThrow(/blockReason: SAFETY/);
  });

  it("names a truncated answer and points at the ceiling", () => {
    expect(() => extractGeminiText({ candidates: [{ finishReason: "MAX_TOKENS" }] })).toThrow(
      /finishReason: MAX_TOKENS/,
    );
    expect(() => extractGeminiText({ candidates: [{ finishReason: "MAX_TOKENS" }] })).toThrow(/output ceiling/);
  });

  it("names a candidate blocked after generation started", () => {
    expect(() => extractGeminiText({ candidates: [{ finishReason: "SAFETY" }] })).toThrow(/finishReason: SAFETY/);
    // Retrying another model cannot help — the caller's fallback loop only
    // retries on HTTP/network failures, and the message says why.
    expect(() => extractGeminiText({ candidates: [{ finishReason: "SAFETY" }] })).toThrow(/not of the model/);
  });

  it("still reports a genuinely malformed payload, without dumping all of it", () => {
    const huge = { candidates: [{ content: { parts: [{ text: 12345 }] } }], filler: "x".repeat(2000) };
    let message = "";
    try {
      extractGeminiText(huge);
    } catch (err) {
      message = err instanceof Error ? err.message : String(err);
    }
    expect(message).toMatch(/Unexpected Gemini response shape/);
    expect(message.length).toBeLessThan(500);
  });

  it("prefers the prompt-level refusal when both are present", () => {
    expect(() =>
      extractGeminiText({ promptFeedback: { blockReason: "OTHER" }, candidates: [{ finishReason: "SAFETY" }] }),
    ).toThrow(/blockReason: OTHER/);
  });

  /**
   * The gap the live probe found: a cut-off answer still carries the part
   * that was written, so it used to be returned as if it were complete and
   * blow up much later inside `extractJson` as a JSON syntax error.
   */
  it("refuses a TRUNCATED answer even though it carries partial text", () => {
    const truncated = {
      candidates: [
        {
          content: { parts: [{ text: '{"pillarRecommendations":{"acquisition":"Une phrase coupée en plein' }] },
          finishReason: "MAX_TOKENS",
        },
      ],
      usageMetadata: { thoughtsTokenCount: 3800, candidatesTokenCount: 240 },
    };

    expect(() => extractGeminiText(truncated)).toThrow(/finishReason: MAX_TOKENS/);
    // The counts are the evidence that reasoning tokens ate the ceiling.
    expect(() => extractGeminiText(truncated)).toThrow(/thoughts: 3800/);
    expect(() => extractGeminiText(truncated)).toThrow(/reasoning tokens count against/);
  });

  it("refuses a partial answer stopped for any other reason too", () => {
    expect(() =>
      extractGeminiText({
        candidates: [{ content: { parts: [{ text: "half a sentence" }] }, finishReason: "SAFETY" }],
      }),
    ).toThrow(/finishReason: SAFETY/);
  });

  it("still returns the text when the model finished normally", () => {
    expect(
      extractGeminiText({ candidates: [{ content: { parts: [{ text: "{}" }] }, finishReason: "STOP" }] }),
    ).toBe("{}");
  });
});
