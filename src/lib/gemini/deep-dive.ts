import { PILLARS } from "@/lib/scoring/pillars";
import { callGeminiWithFallback, type GeminiCallOptions, type GeminiCallResult } from "./client";

/**
 * The shape of a Deep dive verdict, as the Gemini API enforces it
 * (REVIEW.md R-25). Three places describe this same contract, on purpose:
 *
 *   - `prompt.ts#DEEP_DIVE_OUTPUT_INSTRUCTION` TELLS the model, in words and
 *     with an example — still needed, the schema constrains keys and types
 *     but says nothing about "3-4 sentences" or "THE single next action";
 *   - this schema makes the API GUARANTEE the keys and types, so a reply can
 *     no longer come back fenced, prefixed, or missing a pillar;
 *   - `submissions/verdict.ts#parseDeepDiveVerdict` still VALIDATES what
 *     arrives (non-empty strings, every pillar), because a guarantee from a
 *     remote service is a second line of defence, not a reason to drop ours.
 *
 * Built from `PILLARS` rather than spelled out, so a pillar can never be
 * present in the parser and absent here. `propertyOrdering` is Gemini's own
 * extension: without it the model may emit keys in any order, which is
 * harmless for JSON but makes the raw text harder to read in logs.
 *
 * Type names are the API's OpenAPI-subset spelling (`OBJECT`, `STRING`), not
 * JSON Schema's lowercase ones — verified against the real API by the live
 * probe, which is the only place this can be verified at all.
 */
export const DEEP_DIVE_RESPONSE_SCHEMA: Record<string, unknown> = {
  type: "OBJECT",
  properties: {
    pillarRecommendations: {
      type: "OBJECT",
      properties: Object.fromEntries(PILLARS.map((pillar) => [pillar, { type: "STRING" }])),
      required: [...PILLARS],
      propertyOrdering: [...PILLARS],
    },
    priorityAction: { type: "STRING" },
  },
  required: ["pillarRecommendations", "priorityAction"],
  propertyOrdering: ["pillarRecommendations", "priorityAction"],
};

/**
 * The one Gemini call this product makes, with the schema attached. The
 * Deep dive route and the live probe both go through here, so what the probe
 * sends to the real API is byte-for-byte what production sends — a probe
 * that assembled its own request would validate a copy.
 */
export function callDeepDiveGemini(
  prompt: string,
  apiKey: string,
  options: Omit<GeminiCallOptions, "responseSchema"> = {},
): Promise<GeminiCallResult> {
  return callGeminiWithFallback(prompt, apiKey, { ...options, responseSchema: DEEP_DIVE_RESPONSE_SCHEMA });
}
