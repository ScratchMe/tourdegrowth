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
}

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

  if (typeof text === "string") return text;

  // A candidate exists but carries no text — `finishReason` says why.
  // "STOP" here would mean an empty but complete answer, which is its own
  // kind of broken, so it is reported too rather than silently excluded.
  if (candidate?.finishReason) {
    throw new Error(
      `Gemini returned no text (finishReason: ${candidate.finishReason}). ` +
        (candidate.finishReason === "MAX_TOKENS"
          ? "The answer was cut off at the output ceiling — see MAX_OUTPUT_TOKENS in client.ts."
          : "This is a property of the request, not of the model, so retrying another model would not help."),
    );
  }

  throw new Error(`Unexpected Gemini response shape: no text at candidates[0].content.parts[0].text (${briefly(data)})`);
}
