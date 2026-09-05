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

/**
 * Per-attempt timeout. Found necessary the hard way while building this:
 * this build session's own network egress silently black-holes
 * `generateContent` calls (connects, sends, never responds — see
 * CLAUDE.md's step 6 note) with no error at all, which would otherwise hang
 * a whole model attempt (and, on Vercel, the Route Handler's function
 * timeout) indefinitely instead of falling back to the next candidate.
 */
const REQUEST_TIMEOUT_MS = 20_000;

/**
 * Generous ceiling on one tone's Deep dive JSON (5 pillar recommendations of
 * 3-4 sentences, plus a priority action) — REVIEW.md R-16. It exists to cap
 * a runaway response, not to shape a normal one, and hitting it is now
 * diagnosable rather than opaque: see `finishReason` handling in
 * `response.ts`.
 */
const MAX_OUTPUT_TOKENS = 4096;

export interface GeminiCallResult {
  data: unknown;
  modelUsed: string;
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/**
 * Calls the Gemini API, trying each model in {@link GEMINI_MODEL_CANDIDATES}
 * in order. A retriable HTTP status (overloaded/unavailable/not-found), a
 * network-level failure, or a timeout moves on to the next candidate; any
 * other HTTP error fails immediately (it would be identical on every
 * model). Throws once every candidate has been exhausted.
 */
export async function callGeminiWithFallback(
  prompt: string,
  apiKey: string,
  fetchImpl: typeof fetch = fetch,
): Promise<GeminiCallResult> {
  let lastError = "";

  for (const model of GEMINI_MODEL_CANDIDATES) {
    const timeoutController = new AbortController();
    const timeout = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetchImpl(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // REVIEW.md R-16: the key used to travel in the query string,
            // where any intermediate that logs URLs — a proxy, an error
            // tracker, a browser devtools export — would capture it. The
            // header is the supported alternative and leaks nowhere.
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              responseMimeType: "application/json",
              maxOutputTokens: MAX_OUTPUT_TOKENS,
            },
          }),
          signal: timeoutController.signal,
        },
      );
    } catch (networkErr) {
      const timedOut = timeoutController.signal.aborted;
      lastError = `${model} → ${timedOut ? `timed out after ${REQUEST_TIMEOUT_MS}ms` : errorMessage(networkErr)}`;
      continue;
    } finally {
      clearTimeout(timeout);
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
