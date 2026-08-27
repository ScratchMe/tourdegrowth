/**
 * Multi-model fallback Gemini caller — ported from the CV site's
 * `gemini-fit` Supabase Edge Function (see CLAUDE.md), adapted to run in a
 * Next.js Route Handler on Vercel instead of a Deno Edge Function (step 6:
 * moved off Supabase entirely, per the build conversation).
 *
 * CLAUDE.md non-negotiable: never a single hard-coded model name. The last
 * candidate, `gemini-flash-latest`, is Google's own maintained alias to
 * whatever Flash model is current — the fallback that never breaks.
 *
 * One deliberate fix over the ported original: there, a "non-retriable"
 * error was `throw`n *inside* the same `try` block it was meant to escape,
 * so its own `catch` swallowed it and looped to the next model anyway —
 * quietly defeating the fail-fast intent the code's own comment described.
 * Here the HTTP response is inspected *outside* any try/catch around the
 * fetch, so a non-retriable status genuinely fails fast instead of wasting
 * 3 more calls.
 */
export const GEMINI_MODEL_CANDIDATES = [
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-flash-latest",
] as const;

/** Statuses worth retrying with the next model candidate. */
const RETRIABLE_STATUSES = [404, 429, 500, 503];

export interface GeminiCallResult {
  data: unknown;
  modelUsed: string;
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/**
 * Calls the Gemini API, trying each model in {@link GEMINI_MODEL_CANDIDATES}
 * in order. A retriable HTTP status (overloaded/unavailable/not-found) or a
 * network-level failure moves on to the next candidate; any other HTTP
 * error fails immediately (it would be identical on every model). Throws
 * once every candidate has been exhausted.
 */
export async function callGeminiWithFallback(
  prompt: string,
  apiKey: string,
  fetchImpl: typeof fetch = fetch,
): Promise<GeminiCallResult> {
  let lastError = "";

  for (const model of GEMINI_MODEL_CANDIDATES) {
    let response: Response;
    try {
      response = await fetchImpl(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, responseMimeType: "application/json" },
          }),
        },
      );
    } catch (networkErr) {
      lastError = `${model} → ${errorMessage(networkErr)}`;
      continue;
    }

    if (response.ok) {
      const data: unknown = await response.json();
      return { data, modelUsed: model };
    }

    if (RETRIABLE_STATUSES.includes(response.status)) {
      lastError = `${model} → HTTP ${response.status}`;
      continue;
    }

    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  throw new Error(`All Gemini model candidates failed. Last error: ${lastError}`);
}

/** Gemini sometimes wraps its JSON in ```json fences despite instructions not to — strip them. */
export function extractJson(text: string): unknown {
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}
