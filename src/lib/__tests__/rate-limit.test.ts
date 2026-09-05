import { beforeEach, describe, expect, it } from "vitest";
import { clientKey, rateLimit, resetRateLimitsForTests } from "../rate-limit";

const OPTS = { limit: 3, windowSeconds: 60 };

describe("rateLimit", () => {
  beforeEach(resetRateLimitsForTests);

  it("allows up to the limit, then refuses", () => {
    const now = 1_000_000;
    for (let i = 0; i < 3; i += 1) {
      expect(rateLimit("k", OPTS, now).allowed).toBe(true);
    }
    expect(rateLimit("k", OPTS, now).allowed).toBe(false);
  });

  it("says how long to wait, in whole seconds", () => {
    const now = 1_000_000;
    for (let i = 0; i < 3; i += 1) rateLimit("k", OPTS, now);

    // 10s into a 60s window, the oldest request leaves in 50s.
    const denied = rateLimit("k", OPTS, now + 10_000);
    expect(denied.allowed).toBe(false);
    expect(denied.retryAfterSeconds).toBe(50);
  });

  it("never reports a Retry-After of zero, which would invite an instant retry", () => {
    const now = 1_000_000;
    for (let i = 0; i < 3; i += 1) rateLimit("k", OPTS, now);
    expect(rateLimit("k", OPTS, now + 59_999).retryAfterSeconds).toBeGreaterThanOrEqual(1);
  });

  it("lets the window slide rather than resetting in fixed blocks", () => {
    const now = 1_000_000;
    for (let i = 0; i < 3; i += 1) rateLimit("k", OPTS, now);
    expect(rateLimit("k", OPTS, now + 30_000).allowed).toBe(false);
    // Once the first three have aged out, the caller is free again.
    expect(rateLimit("k", OPTS, now + 61_000).allowed).toBe(true);
  });

  it("keeps callers independent", () => {
    const now = 1_000_000;
    for (let i = 0; i < 3; i += 1) rateLimit("a", OPTS, now);
    expect(rateLimit("a", OPTS, now).allowed).toBe(false);
    expect(rateLimit("b", OPTS, now).allowed).toBe(true);
  });

  it("keeps the two routes' budgets separate for the same caller", () => {
    const request = new Request("https://tourdegrowth.com/api/submissions", {
      headers: { "x-forwarded-for": "203.0.113.7" },
    });
    expect(clientKey(request, "submissions")).not.toBe(clientKey(request, "deep-dive"));
  });
});

describe("clientKey", () => {
  it("uses the first entry of x-forwarded-for, which is the real client", () => {
    const request = new Request("https://tourdegrowth.com/api/submissions", {
      headers: { "x-forwarded-for": "203.0.113.7, 70.41.3.18, 150.172.238.178" },
    });
    expect(clientKey(request, "submissions")).toBe("submissions:203.0.113.7");
  });

  it("falls back to one shared bucket when the caller can't be identified", () => {
    const request = new Request("https://tourdegrowth.com/api/submissions");
    expect(clientKey(request, "submissions")).toBe("submissions:unknown");
  });
});
