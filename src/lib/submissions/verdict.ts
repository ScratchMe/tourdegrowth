import { extractJson } from "@/lib/gemini/client";
import type { Verdict } from "./types";

function isPairOfNonEmptyStrings(value: unknown): value is [string, string] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every((item) => typeof item === "string" && item.trim().length > 0)
  );
}

/**
 * Parses and validates Gemini's raw response text against the Verdict
 * schema (see prompt.ts's OUTPUT_INSTRUCTION). Throws a descriptive error
 * if Gemini didn't follow the instructions — better to surface that as a
 * clear failure than to silently store a malformed verdict.
 */
export function parseVerdict(rawText: string, modelUsed: string): Verdict {
  const parsed = extractJson(rawText) as Record<string, unknown>;

  if (!isPairOfNonEmptyStrings(parsed.strengths)) {
    throw new Error(`Gemini verdict missing a valid "strengths" pair: ${JSON.stringify(parsed)}`);
  }
  if (!isPairOfNonEmptyStrings(parsed.weaknesses)) {
    throw new Error(`Gemini verdict missing a valid "weaknesses" pair: ${JSON.stringify(parsed)}`);
  }
  if (typeof parsed.recommendation !== "string" || parsed.recommendation.trim().length === 0) {
    throw new Error(`Gemini verdict missing a valid "recommendation": ${JSON.stringify(parsed)}`);
  }

  return {
    strengths: parsed.strengths,
    weaknesses: parsed.weaknesses,
    recommendation: parsed.recommendation,
    modelUsed,
  };
}
