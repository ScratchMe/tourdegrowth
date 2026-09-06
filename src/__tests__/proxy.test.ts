import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resetRateLimitsForTests } from "@/lib/rate-limit";
import { isAuthorizedForAdmin, proxy } from "../proxy";

function requestWithAuth(pathname: string, authHeader?: string): NextRequest {
  const headers = authHeader ? { authorization: authHeader } : undefined;
  return new NextRequest(`https://tourdegrowth.com${pathname}`, { headers });
}

function basicHeader(userPass: string): string {
  return `Basic ${Buffer.from(userPass).toString("base64")}`;
}

describe("isAuthorizedForAdmin", () => {
  const originalPassword = process.env.ADMIN_DASHBOARD_PASSWORD;

  afterEach(() => {
    if (originalPassword === undefined) delete process.env.ADMIN_DASHBOARD_PASSWORD;
    else process.env.ADMIN_DASHBOARD_PASSWORD = originalPassword;
  });

  it("fails closed when ADMIN_DASHBOARD_PASSWORD isn't configured at all", () => {
    delete process.env.ADMIN_DASHBOARD_PASSWORD;
    const request = requestWithAuth("/admin/stats", basicHeader("anyone:anything"));
    expect(isAuthorizedForAdmin(request)).toBe(false);
  });

  it("rejects a missing Authorization header", () => {
    process.env.ADMIN_DASHBOARD_PASSWORD = "correct-horse-battery-staple";
    expect(isAuthorizedForAdmin(requestWithAuth("/admin/stats"))).toBe(false);
  });

  it("rejects a non-Basic Authorization header", () => {
    process.env.ADMIN_DASHBOARD_PASSWORD = "correct-horse-battery-staple";
    expect(isAuthorizedForAdmin(requestWithAuth("/admin/stats", "Bearer sometoken"))).toBe(false);
  });

  it("rejects the wrong password", () => {
    process.env.ADMIN_DASHBOARD_PASSWORD = "correct-horse-battery-staple";
    const request = requestWithAuth("/admin/stats", basicHeader("admin:wrong-password"));
    expect(isAuthorizedForAdmin(request)).toBe(false);
  });

  it("accepts the right password regardless of the username", () => {
    process.env.ADMIN_DASHBOARD_PASSWORD = "correct-horse-battery-staple";
    const request = requestWithAuth("/admin/stats", basicHeader("whoever:correct-horse-battery-staple"));
    expect(isAuthorizedForAdmin(request)).toBe(true);
  });

  it("splits on the FIRST colon only, so a password containing ':' isn't truncated", () => {
    process.env.ADMIN_DASHBOARD_PASSWORD = "pass:with:colons";
    const request = requestWithAuth("/admin/stats", basicHeader("admin:pass:with:colons"));
    expect(isAuthorizedForAdmin(request)).toBe(true);
  });

  it("rejects malformed base64", () => {
    process.env.ADMIN_DASHBOARD_PASSWORD = "correct-horse-battery-staple";
    expect(isAuthorizedForAdmin(requestWithAuth("/admin/stats", "Basic not-valid-base64!!"))).toBe(false);
  });
});

describe("proxy (admin gate)", () => {
  const originalPassword = process.env.ADMIN_DASHBOARD_PASSWORD;

  beforeEach(() => {
    process.env.ADMIN_DASHBOARD_PASSWORD = "correct-horse-battery-staple";
  });

  afterEach(() => {
    if (originalPassword === undefined) delete process.env.ADMIN_DASHBOARD_PASSWORD;
    else process.env.ADMIN_DASHBOARD_PASSWORD = originalPassword;
  });

  it("returns 401 with a WWW-Authenticate challenge for /admin without credentials", async () => {
    const response = proxy(requestWithAuth("/admin/stats"));
    expect(response.status).toBe(401);
    expect(response.headers.get("WWW-Authenticate")).toMatch(/^Basic realm=/);
  });

  it("lets an authorized /admin request through (not a 401)", async () => {
    const response = proxy(requestWithAuth("/admin/stats", basicHeader("admin:correct-horse-battery-staple")));
    expect(response.status).not.toBe(401);
  });

  it("never checks credentials for non-admin paths", async () => {
    const response = proxy(requestWithAuth("/quiz"));
    expect(response.status).not.toBe(401);
  });
});

/**
 * REVIEW.md R-24 — the content pages are prerendered and CDN-cacheable now,
 * so what the proxy adds to their responses matters in a way it did not
 * before.
 */
describe("proxy (locale cookie)", () => {
  function request(url: string, cookie?: string): NextRequest {
    const headers = cookie ? { cookie: `tdg_locale=${cookie}` } : undefined;
    return new NextRequest(`https://tourdegrowth.com${url}`, { headers });
  }

  it("sets the cookie when a URL prefix disagrees with it", () => {
    expect(proxy(request("/fr/glossary/cac", "en")).cookies.get("tdg_locale")?.value).toBe("fr");
  });

  it("sets the cookie when there is none yet", () => {
    expect(proxy(request("/fr")).cookies.get("tdg_locale")?.value).toBe("fr");
  });

  it("sets the cookie from ?lang= on an unprefixed app page", () => {
    expect(proxy(request("/quiz?lang=fr")).cookies.get("tdg_locale")?.value).toBe("fr");
  });

  it("does NOT re-send an identical cookie on an already-agreeing page", () => {
    // Every one of these responses is a CDN-cacheable prerender; a
    // `Set-Cookie` repeating what the browser already holds is pure noise on
    // it.
    expect(proxy(request("/fr/glossary/cac", "fr")).cookies.get("tdg_locale")).toBeUndefined();
  });

  it("never writes a cookie for a page that expresses no choice", () => {
    expect(proxy(request("/quiz", "fr")).cookies.get("tdg_locale")).toBeUndefined();
    expect(proxy(request("/r/abc")).cookies.get("tdg_locale")).toBeUndefined();
  });

  it("hands the resolved locale down to the root layout as a header", () => {
    const withPrefix = proxy(request("/fr/how-it-works", "en"));
    expect(withPrefix.headers.get("x-middleware-override-headers")).toContain("x-tdg-locale");
    expect(withPrefix.headers.get("x-middleware-request-x-tdg-locale")).toBe("fr");
  });
});

describe("proxy (result read budget — REVIEW-02.md R2-19)", () => {
  beforeEach(() => resetRateLimitsForTests());

  function resultRequest(pathname: string, ip: string): NextRequest {
    return new NextRequest(`https://tourdegrowth.com${pathname}`, { headers: { "x-forwarded-for": ip } });
  }
  const ID = "/r/3f1c2a7e-9b4d-4e21-a8c6-000000000000";

  it("lets 120 result reads through in ten minutes, then answers 429 with a real Retry-After", () => {
    for (let i = 0; i < 120; i += 1) {
      expect(proxy(resultRequest(ID, "203.0.113.9")).status).not.toBe(429);
    }
    const blocked = proxy(resultRequest(ID, "203.0.113.9"));
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get("retry-after"))).toBeGreaterThan(0);
  });

  it("counts per IP: another visitor is not affected by a flood from the first", () => {
    for (let i = 0; i < 121; i += 1) proxy(resultRequest(ID, "203.0.113.9"));
    expect(proxy(resultRequest(ID, "198.51.100.4")).status).not.toBe(429);
  });

  it("never counts the sample result, which reads no Firestore", () => {
    for (let i = 0; i < 200; i += 1) {
      expect(proxy(resultRequest("/r/sample", "203.0.113.9")).status).not.toBe(429);
    }
    // …and the budget it did not spend is still there for a real result.
    expect(proxy(resultRequest(ID, "203.0.113.9")).status).not.toBe(429);
  });

  it("leaves every other path alone", () => {
    for (let i = 0; i < 200; i += 1) {
      expect(proxy(resultRequest("/quiz", "203.0.113.9")).status).not.toBe(429);
    }
  });
});
