import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GEMINI_MODEL_CANDIDATES, callGeminiWithFallback, extractJson } from "../client";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status });
}

function textResponse(status: number, body: string): Response {
  return new Response(body, { status });
}

describe("callGeminiWithFallback", () => {
  it("returns the first model's result when it succeeds", async () => {
    const calls: string[] = [];
    const fetchImpl = async (url: string | URL | Request) => {
      calls.push(String(url));
      return jsonResponse(200, { ok: true });
    };

    const result = await callGeminiWithFallback("prompt", "key", fetchImpl);

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

    const result = await callGeminiWithFallback("prompt", "key", fetchImpl);

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

    const result = await callGeminiWithFallback("prompt", "key", fetchImpl);

    expect(result.modelUsed).toBe(GEMINI_MODEL_CANDIDATES[1]);
    expect(attempt).toBe(2);
  });

  it("exhausts all 4 candidates and throws when every one is retriable-failing", async () => {
    const fetchImpl = async () => textResponse(429, "rate limited");

    await expect(callGeminiWithFallback("prompt", "key", fetchImpl)).rejects.toThrow(
      /All Gemini model candidates failed/,
    );
  });

  it("fails FAST on a non-retriable status (400) — does not burn through every model", async () => {
    let calls = 0;
    const fetchImpl = async () => {
      calls += 1;
      return textResponse(400, "bad request: malformed prompt");
    };

    await expect(callGeminiWithFallback("prompt", "key", fetchImpl)).rejects.toThrow(
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

      const promise = callGeminiWithFallback("prompt", "key", fetchImpl);
      // Let the first attempt's timeout fire, then let the retry's microtasks settle.
      await vi.advanceTimersByTimeAsync(20_000);

      const result = await promise;
      expect(result.modelUsed).toBe(GEMINI_MODEL_CANDIDATES[1]);
      expect(calls).toHaveLength(2);
    });
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

    await callGeminiWithFallback("prompt", "super-secret-key", fetchImpl);

    const [url, init] = (fetchImpl as unknown as { mock: { calls: [string, RequestInit][] } }).mock.calls[0]!;
    expect(url).not.toContain("super-secret-key");
    expect(url).not.toContain("key=");
    expect((init.headers as Record<string, string>)["x-goog-api-key"]).toBe("super-secret-key");
  });

  it("caps the output so a runaway answer can't bill forever", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "{}" }] } }] }), { status: 200 }),
    ) as unknown as typeof fetch;

    await callGeminiWithFallback("prompt", "k", fetchImpl);

    const [, init] = (fetchImpl as unknown as { mock: { calls: [string, RequestInit][] } }).mock.calls[0]!;
    const body = JSON.parse(init.body as string);
    expect(body.generationConfig.maxOutputTokens).toBeGreaterThan(0);
    expect(body.generationConfig.responseMimeType).toBe("application/json");
  });
});
