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
 * Wait between attempts, with full jitter — found by the live Gemini probe.
 *
 * The fallback chain protects against "this particular model is unavailable".
 * It did nothing against the far more common "the API is overloaded for a
 * couple of seconds": all four candidates were tried back to back with no
 * pause at all, so a brief 503 burnt the entire chain in under a second and
 * the user got a failed Deep dive. That is exactly what happened —
 * `All Gemini model candidates failed. Last error: gemini-flash-latest → HTTP 503`.
 *
 * The jitter is not decoration here. A Deep dive fires FOUR generations in
 * parallel (two tones x two languages); without it they would fail together
 * and retry together, in lockstep, against an API that is already struggling.
 *
 * Bounded on purpose: at most ~6s added across the whole chain in the worst
 * case, inside a route that already allows 120s.
 */
const RETRY_BASE_MS = 500;
const RETRY_MAX_MS = 4_000;

function backoffDelay(attempt: number): number {
  const ceiling = Math.min(RETRY_BASE_MS * 2 ** attempt, RETRY_MAX_MS);
  return Math.round(Math.random() * ceiling);
}

const realSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Per-attempt timeout.
 *
 * Raised from 20s to 45s after the fifth live run. The Gemini probe, calling
 * the same API with the same key from the GitHub runner, succeeded — an
 * English generation took 18s, two seconds under the old ceiling, on a prompt
 * one sixth the size of a real one. Production, whose prompts carry all 15
 * Quick answers and 10 context answers, failed after 47s with
 * `DEEP_DIVE_FAILED`. The reading: when Gemini is slow (18s where the same
 * call took 5s two runs earlier), real-length generations cross 20s and get
 * aborted by OUR OWN client, model after model. A thinking model spends
 * 1-2k tokens reasoning before ~500 tokens of answer; 20s was never sized
 * for that, it was sized for the case below.
 *
 * Originally found necessary the hard way while building this:
 * this build session's own network egress silently black-holes
 * `generateContent` calls (connects, sends, never responds — see
 * CLAUDE.md's step 6 note) with no error at all, which would otherwise hang
 * a whole model attempt (and, on Vercel, the Route Handler's function
 * timeout) indefinitely instead of falling back to the next candidate.
 */
export const REQUEST_TIMEOUT_MS = 45_000;

/**
 * The whole chain — every model, every pause — gives up after this, so that
 * the four generations a Deep dive runs in parallel all land inside the
 * route's `maxDuration` (120s) with room to spare. Without it, four attempts
 * at the per-attempt ceiling above would exceed the route's own budget.
 */
export const CHAIN_BUDGET_MS = 100_000;

/** Below this much remaining budget, starting another attempt is pointless. */
const MIN_ATTEMPT_MS = 5_000;

/**
 * Ceiling on one tone's Deep dive JSON (5 pillar recommendations of 3-4
 * sentences, plus a priority action) — REVIEW.md R-16. It exists to cap a
 * runaway response, not to shape a normal one.
 *
 * Raised from 4096 after the live Gemini probe caught a French roast coming
 * back truncated mid-JSON, on the theory that reasoning tokens (these are
 * thinking models, and they share this budget) were eating the ceiling.
 *
 * **That theory was not confirmed.** The next live run measured a real call
 * at `thoughts=765 answer=440` against a 4096 ceiling — nowhere near it. So
 * the raise is headroom, not a diagnosis: the actual cause of that one
 * truncation is still unknown. It is kept because it costs nothing (only the
 * tokens actually produced are billed) and because a bigger margin can only
 * help, not because it explains anything.
 *
 * What DID come out of that investigation is real and unrelated to this
 * number: `response.ts` now inspects `finishReason` before returning the
 * text, not only when there is none, so a truncation is reported as one
 * instead of surfacing as a JSON syntax error three call frames away. If it
 * happens again, the error will name the reason and the token counts.
 */
const MAX_OUTPUT_TOKENS = 16384;

export interface GeminiCallResult {
  data: unknown;
  modelUsed: string;
}

export interface GeminiCallOptions {
  /**
   * An OpenAPI-subset schema the API is asked to ENFORCE on the JSON it
   * returns (REVIEW.md R-25), on top of the textual instruction in the
   * prompt. Optional so the client stays generic; the Deep dive's lives in
   * `deep-dive.ts`. A malformed schema is a 400, which this client treats
   * as non-retriable — the live probe (`scripts/live/gemini.live.ts`) sends
   * the real one to the real API before any change to it ships.
   */
  responseSchema?: Record<string, unknown>;
  /** Injected for tests: the unit suite never makes a real network call. */
  fetchImpl?: typeof fetch;
  /** Injected for tests: exercises the retry policy without actually waiting. */
  sleepImpl?: (ms: number) => Promise<void>;
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/**
 * Calls the Gemini API, trying each model in {@link GEMINI_MODEL_CANDIDATES}
 * in order. A retriable HTTP status (overloaded/unavailable/not-found), a
 * network-level failure, or a timeout moves on to the next candidate, after a
 * jittered pause (see {@link backoffDelay}); any other HTTP error fails
 * immediately (it would be identical on every model). Throws once every
 * candidate has been exhausted.
 *
 * `sleepImpl` is injected for the same reason as `fetchImpl`: so tests can
 * exercise the retry policy without actually waiting.
 */
export async function callGeminiWithFallback(
  prompt: string,
  apiKey: string,
  options: GeminiCallOptions = {},
): Promise<GeminiCallResult> {
  const { responseSchema, fetchImpl = fetch, sleepImpl = realSleep } = options;
  let lastError = "";
  let attempt = 0;
  const deadline = Date.now() + CHAIN_BUDGET_MS;

  for (const model of GEMINI_MODEL_CANDIDATES) {
    // Never before the first try, and never after a 404: a model name that
    // does not exist will not start existing because we waited.
    if (attempt > 0 && !lastError.endsWith("HTTP 404")) {
      await sleepImpl(backoffDelay(attempt - 1));
    }
    attempt += 1;

    const remaining = deadline - Date.now();
    if (remaining < MIN_ATTEMPT_MS) {
      lastError = `${lastError} — chain budget of ${CHAIN_BUDGET_MS}ms exhausted before trying ${model}`;
      break;
    }

    const timeoutController = new AbortController();
    // Never past the chain's own deadline, whatever the per-attempt ceiling.
    const attemptTimeoutMs = Math.min(REQUEST_TIMEOUT_MS, remaining);
    const timeout = setTimeout(() => timeoutController.abort(), attemptTimeoutMs);

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
              ...(responseSchema ? { responseSchema } : {}),
            },
          }),
          signal: timeoutController.signal,
        },
      );
    } catch (networkErr) {
      const timedOut = timeoutController.signal.aborted;
      lastError = `${model} → ${timedOut ? `timed out after ${attemptTimeoutMs}ms` : errorMessage(networkErr)}`;
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

    // Truncated (REVIEW-02.md R2-24): Google's INVALID_ARGUMENT bodies can
    // echo the offending request, and the request carries the founder's
    // free-text context. Enough to diagnose, not enough to log a business.
    const errText = (await response.text()).slice(0, 300);
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  throw new Error(`All Gemini model candidates failed. Last error: ${lastError}`);
}

/** Gemini sometimes wraps its JSON in ```json fences despite instructions not to — strip them. */
export function extractJson(text: string): unknown {
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}
