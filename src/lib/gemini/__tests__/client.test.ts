import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CHAIN_BUDGET_MS, GEMINI_MODEL_CANDIDATES, REQUEST_TIMEOUT_MS, callGeminiWithFallback, extractJson } from "../client";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status });
}

function textResponse(status: number, body: string): Response {
  return new Response(body, { status });
}

/**
 * The retry pause, injected away. Every test below is about WHICH calls are
 * made and in what order — none of them should spend real seconds waiting for
 * a backoff to elapse.
 */
const noSleep = async () => {};

describe("callGeminiWithFallback", () => {
  it("returns the first model's result when it succeeds", async () => {
    const calls: string[] = [];
    const fetchImpl = async (url: string | URL | Request) => {
      calls.push(String(url));
      return jsonResponse(200, { ok: true });
    };

    const result = await callGeminiWithFallback("prompt", "key", fetchImpl, noSleep);

    expect(result).toEqual({ data: { ok: true }, modelUsed: GEMINI_MODEL_CANDIDATES[0] });
    expect(calls).toHaveLength(1);
    expect(calls[0]).toContain(GEMINI_MODEL_CANDIDATES[0]);
  });

  it("falls back to the next model on a retriable status (503)", async () => {
    const calls: string[] = [];
    const fetchImpl = async (url: string | URL | Request) => {
      calls.push(String(url));
      if (calls.length === 1) return textResponse(503, "overloaded");
      return jsonResponse(200, { ok: true });
    };

    const result = await callGeminiWithFallback("prompt", "key", fetchImpl, noSleep);

    expect(result.modelUsed).toBe(GEMINI_MODEL_CANDIDATES[1]);
    expect(calls).toHaveLength(2);
  });

  it("falls back on a network-level failure (fetch throws)", async () => {
    let attempt = 0;
    const fetchImpl = async () => {
      attempt += 1;
      if (attempt === 1) throw new Error("ECONNRESET");
      return jsonResponse(200, { ok: true });
    };

    const result = await callGeminiWithFallback("prompt", "key", fetchImpl, noSleep);

    expect(result.modelUsed).toBe(GEMINI_MODEL_CANDIDATES[1]);
    expect(attempt).toBe(2);
  });

  it("exhausts all 4 candidates and throws when every one is retriable-failing", async () => {
    const fetchImpl = async () => textResponse(429, "rate limited");

    await expect(callGeminiWithFallback("prompt", "key", fetchImpl, noSleep)).rejects.toThrow(
      /All Gemini model candidates failed/,
    );
  });

  it("fails FAST on a non-retriable status (400) — does not burn through every model", async () => {
    let calls = 0;
    const fetchImpl = async () => {
      calls += 1;
      return textResponse(400, "bad request: malformed prompt");
    };

    await expect(callGeminiWithFallback("prompt", "key", fetchImpl, noSleep)).rejects.toThrow(
      /Gemini API error \(400\)/,
    );
    // Regression guard: the ported reference implementation had a bug where
    // this threw-and-was-immediately-caught, silently looping through all 4
    // models anyway. Only 1 call means the fix holds.
    expect(calls).toBe(1);
  });

  it("last candidate is the Google-maintained alias, never a single hard-coded model", () => {
    expect(GEMINI_MODEL_CANDIDATES.at(-1)).toBe("gemini-flash-latest");
    expect(GEMINI_MODEL_CANDIDATES.length).toBeGreaterThan(1);
  });

  describe("timeout (a call that silently hangs forever, never erroring)", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("aborts a hung request and falls back to the next model instead of hanging forever", async () => {
      const calls: string[] = [];
      // Simulates exactly what this build session hit for real against
      // generativelanguage.googleapis.com: the request never resolves and
      // never rejects on its own — only responds to the abort signal.
      const fetchImpl = (url: string | URL | Request, init?: RequestInit) => {
        calls.push(String(url));
        if (calls.length === 1) {
          return new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
          });
        }
        return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
      };

      const promise = callGeminiWithFallback("prompt", "key", fetchImpl, noSleep);
      // Let the first attempt's timeout fire, then let the retry's microtasks settle.
      await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);

      const result = await promise;
      expect(result.modelUsed).toBe(GEMINI_MODEL_CANDIDATES[1]);
      expect(calls).toHaveLength(2);
    });

    /**
     * The fifth live run: production's Deep dive failed after 47s while the
     * same API answered the runner's probe in 18s. A per-attempt ceiling has
     * to be generous enough for a slow-but-working generation — but four
     * generous attempts in a row would blow past the route's own
     * `maxDuration`. Hence a budget for the whole chain, not just a ceiling
     * per model.
     */
    it("gives up on the whole chain once its budget is spent, clipping the last attempt to what is left", async () => {
      const calls: string[] = [];
      const hangForever = (url: string | URL | Request, init?: RequestInit) => {
        calls.push(String(url));
        return new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
        });
      };

      const promise = callGeminiWithFallback("prompt", "key", hangForever, noSleep);
      // Attach the handler before advancing, so the rejection is never unhandled.
      const outcome = promise.then(
        () => "resolved",
        (err: Error) => err.message,
      );
      await vi.advanceTimersByTimeAsync(CHAIN_BUDGET_MS + REQUEST_TIMEOUT_MS);

      const message = await outcome;
      // 45s + 45s + the 10s left over = 100s. The fourth model is never tried:
      // starting it with nothing left would be a fourth abort, not a chance.
      expect(calls.length).toBeLessThan(GEMINI_MODEL_CANDIDATES.length);
      expect(message).toMatch(/chain budget/);
      // The clipped attempt reports the timeout it was ACTUALLY given, not the nominal one.
      const leftover = CHAIN_BUDGET_MS - 2 * REQUEST_TIMEOUT_MS;
      expect(message).toContain(`timed out after ${leftover}ms`);
    });
  });
});

/**
 * REVIEW.md — found by the live Gemini probe, not by reasoning: an entire
 * fallback chain died to a two-second 503 because it had no pause in it.
 */
describe("callGeminiWithFallback — backoff between attempts", () => {
  it("waits before each retry, with a growing ceiling", async () => {
    const waits: number[] = [];
    const fetchImpl = async () => jsonResponse(503, { error: "overloaded" });

    await expect(
      callGeminiWithFallback("prompt", "key", fetchImpl, async (ms) => {
        waits.push(ms);
      }),
    ).rejects.toThrow(/All Gemini model candidates failed/);

    // Four candidates, so three pauses — never before the first attempt.
    expect(waits).toHaveLength(GEMINI_MODEL_CANDIDATES.length - 1);
    for (const ms of waits) expect(ms).toBeGreaterThanOrEqual(0);
    // Full jitter, so each wait is a random point BELOW a growing ceiling:
    // 500, 1000, 2000. Asserting the ceilings, not the values.
    expect(waits[0]).toBeLessThanOrEqual(500);
    expect(waits[1]).toBeLessThanOrEqual(1000);
    expect(waits[2]).toBeLessThanOrEqual(2000);
  });

  it("never waits when the first model answers", async () => {
    const waits: number[] = [];
    const fetchImpl = async () => jsonResponse(200, { ok: true });

    await callGeminiWithFallback("prompt", "key", fetchImpl, async (ms) => {
      waits.push(ms);
    });

    expect(waits).toEqual([]);
  });

  it("does NOT wait after a 404 — a missing model will not appear because we paused", async () => {
    const waits: number[] = [];
    let call = 0;
    const fetchImpl = async () => {
      call += 1;
      return call === 1 ? jsonResponse(404, { error: "not found" }) : jsonResponse(200, { ok: true });
    };

    const result = await callGeminiWithFallback("prompt", "key", fetchImpl, async (ms) => {
      waits.push(ms);
    });

    expect(result.modelUsed).toBe(GEMINI_MODEL_CANDIDATES[1]);
    expect(waits).toEqual([]);
  });

  it("jitters, so four parallel generations do not retry in lockstep", async () => {
    // A Deep dive fires two tones x two languages at once. Identical backoffs
    // would send them all back at the same instant, at an API that is already
    // overloaded — which is the failure mode this is meant to soften.
    const runs: number[][] = [];
    for (let i = 0; i < 8; i += 1) {
      const waits: number[] = [];
      await expect(
        callGeminiWithFallback("prompt", "key", async () => jsonResponse(503, {}), async (ms) => {
          waits.push(ms);
        }),
      ).rejects.toThrow();
      runs.push(waits);
    }

    const firstWaits = new Set(runs.map((w) => w[0]));
    expect(firstWaits.size, "eight runs produced the same first delay — that is not jitter").toBeGreaterThan(1);
  });
});

describe("extractJson", () => {
  it("parses plain JSON", () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });

  it("strips ```json fences Gemini sometimes adds despite instructions", () => {
    expect(extractJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it("strips bare ``` fences too", () => {
    expect(extractJson('```\n{"a":1}\n```')).toEqual({ a: 1 });
  });
});

/** REVIEW.md R-16 — the key must not travel in a URL. */
describe("callGeminiWithFallback — request shape", () => {
  it("sends the API key as a header, never in the query string", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "{}" }] } }] }), { status: 200 }),
    ) as unknown as typeof fetch;

    await callGeminiWithFallback("prompt", "super-secret-key", fetchImpl, noSleep);

    const [url, init] = (fetchImpl as unknown as { mock: { calls: [string, RequestInit][] } }).mock.calls[0]!;
    expect(url).not.toContain("super-secret-key");
    expect(url).not.toContain("key=");
    expect((init.headers as Record<string, string>)["x-goog-api-key"]).toBe("super-secret-key");
  });

  it("caps the output so a runaway answer can't bill forever", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "{}" }] } }] }), { status: 200 }),
    ) as unknown as typeof fetch;

    await callGeminiWithFallback("prompt", "k", fetchImpl, noSleep);

    const [, init] = (fetchImpl as unknown as { mock: { calls: [string, RequestInit][] } }).mock.calls[0]!;
    const body = JSON.parse(init.body as string);
    expect(body.generationConfig.maxOutputTokens).toBeGreaterThan(0);
    expect(body.generationConfig.responseMimeType).toBe("application/json");
  });
});
