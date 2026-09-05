/**
 * Navigates the Gemini `generateContent` response to the text it produced,
 * and says something useful when there isn't any — REVIEW.md R-16.
 *
 * Before this, every non-answer collapsed into one message: "Unexpected
 * Gemini response shape". A prompt refused on safety grounds, an answer cut
 * off at the token ceiling and a genuinely malformed payload were
 * indistinguishable in the logs, on the one code path where the model is
 * allowed to say no — the roast tone, which by design pushes at the edge of
 * what a model will write.
 *
 * None of these are worth retrying on another model: a refusal or a
 * truncation is a property of the request, not of the model that served it.
 * They therefore throw rather than returning, which the caller's fallback
 * loop already treats as final (it only retries on HTTP status or network
 * failure).
 */

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: unknown }[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
  /** Present on thinking models; `thoughtsTokenCount` is what silently eats the output ceiling. */
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; thoughtsTokenCount?: number };
}

/** The only `finishReason` that means the model said everything it meant to. */
const COMPLETE = "STOP";

/** Bounded — a whole Gemini payload in a log line is noise, not evidence. */
function briefly(data: unknown): string {
  return JSON.stringify(data)?.slice(0, 300) ?? String(data);
}

export function extractGeminiText(data: unknown): string {
  const response = (data ?? {}) as GeminiResponse;

  // The prompt itself was refused: no candidate was ever generated.
  const blockReason = response.promptFeedback?.blockReason;
  if (blockReason) {
    throw new Error(`Gemini refused the prompt (blockReason: ${blockReason})`);
  }

  const candidate = response.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text;

  // Checked BEFORE the text, not only when there isn't any. A cut-off answer
  // still carries the part that was written, so returning it looked like
  // success and then failed much further away, as a JSON syntax error inside
  // `extractJson` — which is exactly the opacity this module exists to
  // remove. Found by the live Gemini probe: a long French roast came back
  // truncated mid-object and surfaced as
  // "Expected ',' or '}' after property value at position 2037".
  if (candidate?.finishReason && candidate.finishReason !== COMPLETE) {
    const usage = response.usageMetadata;
    const spent = usage
      ? ` (thoughts: ${usage.thoughtsTokenCount ?? 0}, answer: ${usage.candidatesTokenCount ?? 0} tokens)`
      : "";
    throw new Error(
      `Gemini stopped early (finishReason: ${candidate.finishReason})${spent}. ` +
        (candidate.finishReason === "MAX_TOKENS"
          ? "The answer was cut off at the output ceiling — on a thinking model, reasoning tokens count against MAX_OUTPUT_TOKENS in client.ts."
          : "This is a property of the request, not of the model, so retrying another model would not help."),
    );
  }

  if (typeof text === "string") return text;

  // A candidate exists but carries no text, and finished normally — its own
  // kind of broken, reported rather than silently excluded.
  // "STOP" here would mean an empty but complete answer, which is its own
  // kind of broken, so it is reported too rather than silently excluded.
  if (candidate?.finishReason) {
    throw new Error(`Gemini returned no text at all (finishReason: ${candidate.finishReason}).`);
  }

  throw new Error(`Unexpected Gemini response shape: no text at candidates[0].content.parts[0].text (${briefly(data)})`);
}
