import { extractJson } from "@/lib/gemini/client";
import { PILLARS } from "@/lib/scoring/pillars";
import type { DeepDiveVerdict } from "./types";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Parses and validates Gemini's raw Deep dive response text against the
 * pillarRecommendations/priorityAction schema (see
 * gemini/prompt.ts's DEEP_DIVE_OUTPUT_INSTRUCTION). Throws a descriptive
 * error if Gemini didn't follow the instructions — better to surface that
 * as a clear failure than to silently store a malformed verdict.
 *
 * Quick mode's verdict used to be parsed here too (headline/strengths/
 * weaknesses/recommendation) — replaced by the deterministic
 * `lib/scoring/verdict.ts` lookup, SPEC-ADDENDUM-01.md §0. This module is
 * now Deep dive-only.
 */
export function parseDeepDiveVerdict(rawText: string, modelUsed: string): DeepDiveVerdict {
  const parsed = extractJson(rawText) as Record<string, unknown>;

  const recommendations = parsed.pillarRecommendations;
  if (typeof recommendations !== "object" || recommendations === null) {
    throw new Error(
      `Gemini Deep dive verdict missing a valid "pillarRecommendations" object: ${JSON.stringify(parsed)}`,
    );
  }
  const pillarRecommendations = {} as Record<(typeof PILLARS)[number], string>;
  for (const pillar of PILLARS) {
    const value = (recommendations as Record<string, unknown>)[pillar];
    if (!isNonEmptyString(value)) {
      throw new Error(
        `Gemini Deep dive verdict missing a valid "pillarRecommendations.${pillar}": ${JSON.stringify(parsed)}`,
      );
    }
    pillarRecommendations[pillar] = value;
  }

  if (!isNonEmptyString(parsed.priorityAction)) {
    throw new Error(`Gemini Deep dive verdict missing a valid "priorityAction": ${JSON.stringify(parsed)}`);
  }

  return { pillarRecommendations, priorityAction: parsed.priorityAction, modelUsed };
}
