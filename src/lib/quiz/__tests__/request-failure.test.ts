import { afterEach, describe, expect, it, vi } from "vitest";
import { failureFromResponse, failureOf, failureSentence, RequestFailedError, requestOrFail } from "../request-failure";

/**
 * A14.4 (2026-10-01): the error screens of the quiz and the Deep dive say
 * which failure it is — the reader's connection, the hourly limit and its
 * real wait, or ours — and keep a short stable code for support (REVIEW.md
 * R-04), never a sentence a route or `fetch` produced.
 */
const WORDS = { body: "ours", offline: "your network", rateLimited: "wait {m} min" };

describe("failureFromResponse", () => {
  it("keeps a stable code our routes send, as the code", () => {
    expect(failureFromResponse(502, { error: "SCORING_FAILED" }, null)).toEqual({ kind: "server", code: "SCORING_FAILED" });
  });

  it("never passes a sentence on: a route's validation message becomes HTTP_<status>", () => {
    expect(failureFromResponse(400, { error: 'tone must be "neutral" or "roast".' }, null)).toEqual({ kind: "server", code: "HTTP_400" });
    expect(failureFromResponse(504, null, null)).toEqual({ kind: "server", code: "HTTP_504" });
  });

  it("reads the wait of a 429 from Retry-After, in whole minutes rounded up", () => {
    expect(failureFromResponse(429, { error: "RATE_LIMITED" }, "1790")).toEqual({ kind: "rate-limited", code: "RATE_LIMITED", retryAfterMinutes: 30 });
    expect(failureFromResponse(429, { error: "RATE_LIMITED" }, "5")).toMatchObject({ retryAfterMinutes: 1 });
  });

  it("says the whole window when a 429 gives no usable wait", () => {
    for (const header of [null, "", "soon", "-3"]) {
      expect(failureFromResponse(429, { error: "RATE_LIMITED" }, header)).toMatchObject({ retryAfterMinutes: 60 });
    }
  });
});

describe("requestOrFail", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("is offline when fetch itself rejects: no answer came back", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    const err = await requestOrFail("/api/x", {}).catch((e: unknown) => e);
    expect(failureOf(err)).toEqual({ kind: "offline", code: "NETWORK" });
  });

  it("reads a refused response, header included", async () => {
    const res = new Response(JSON.stringify({ error: "RATE_LIMITED" }), { status: 429, headers: { "Retry-After": "600" } });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(res));
    const err = await requestOrFail("/api/x", {}).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(RequestFailedError);
    expect(failureOf(err)).toEqual({ kind: "rate-limited", code: "RATE_LIMITED", retryAfterMinutes: 10 });
  });

  it("hands an ok response back untouched", async () => {
    const res = new Response("{}", { status: 201 });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(res));
    await expect(requestOrFail("/api/x", {})).resolves.toBe(res);
  });
});

describe("failureOf and failureSentence", () => {
  it("treats anything that is not a request failure as ours, with no message passed on", () => {
    expect(failureOf(new SyntaxError("Unexpected token < in JSON"))).toEqual({ kind: "server", code: "UNKNOWN" });
  });

  it("words each kind, and fills the wait", () => {
    expect(failureSentence({ kind: "offline", code: "NETWORK" }, WORDS)).toBe("your network");
    expect(failureSentence({ kind: "rate-limited", code: "RATE_LIMITED", retryAfterMinutes: 12 }, WORDS)).toBe("wait 12 min");
    expect(failureSentence({ kind: "server", code: "HTTP_504" }, WORDS)).toBe("ours");
    expect(failureSentence(null, WORDS)).toBe("ours");
  });
});
