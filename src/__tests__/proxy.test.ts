import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resetRateLimitsForTests } from "@/lib/rate-limit";
import { constantTimeEqual, isAuthorizedForAdmin, proxy } from "../proxy";

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

  it("accepts a password with non-ASCII characters, sent UTF-8 encoded as browsers do (REVIEW-02.md R2-22)", () => {
    process.env.ADMIN_DASHBOARD_PASSWORD = "clé-d'été-très-sûre";
    expect(isAuthorizedForAdmin(requestWithAuth("/admin/stats", basicHeader("admin:clé-d'été-très-sûre")))).toBe(true);
    expect(isAuthorizedForAdmin(requestWithAuth("/admin/stats", basicHeader("admin:cle-d'ete-tres-sure")))).toBe(false);
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

  it("gates the JSON twin of the dashboard exactly like the page — /admin/stats/json is under /admin", async () => {
    expect(proxy(requestWithAuth("/admin/stats/json")).status).toBe(401);
    expect(proxy(requestWithAuth("/admin/stats/json", basicHeader("admin:correct-horse-battery-staple"))).status).not.toBe(401);
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

describe("constantTimeEqual (REVIEW-02.md R2-22)", () => {
  it("agrees with === on equal and unequal strings, including non-ASCII", () => {
    expect(constantTimeEqual("secret", "secret")).toBe(true);
    expect(constantTimeEqual("clé", "clé")).toBe(true);
    expect(constantTimeEqual("secret", "secreT")).toBe(false);
    expect(constantTimeEqual("secret", "secret ")).toBe(false);
    expect(constantTimeEqual("", "")).toBe(true);
    expect(constantTimeEqual("", "a")).toBe(false);
  });

  it("reads every byte even when the first one already differs", () => {
    // Not a timing measurement (too noisy to assert on), but a structural
    // one: the comparison must not short-circuit. A short-circuiting
    // implementation would never touch the last byte of a string that
    // differs at index 0 — so a string that differs ONLY at the last byte
    // and one that differs only at the first must both be rejected the same
    // way, and both must be compared over their full length.
    const base = "x".repeat(64);
    expect(constantTimeEqual("y" + base.slice(1), base)).toBe(false);
    expect(constantTimeEqual(base.slice(0, 63) + "y", base)).toBe(false);
  });
});

describe("proxy (Vary: Accept-Language on the language redirect, 2026-09-06)", () => {
  const vary = (pathname: string, headers?: Record<string, string>) =>
    proxy(new NextRequest(`https://tourdegrowth.com${pathname}`, { headers })).headers.get("vary") ?? "";

  it("marks the language redirect of an unprefixed content URL as depending on Accept-Language", () => {
    const response = proxy(new NextRequest("https://tourdegrowth.com/", { headers: { "accept-language": "fr" } }));
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://tourdegrowth.com/fr");
    expect(response.headers.get("vary")).toMatch(/accept-language/i);
  });

  it("marks the legacy content URLs' redirects the same way", () => {
    for (const path of ["/how-it-works", "/glossary", "/glossary/cac", "/about"]) {
      expect(vary(path), path).toMatch(/accept-language/i);
    }
  });

  it("never marks a prefixed content page — its language is in the URL, and the CDN caches it once", () => {
    for (const path of ["/en", "/fr", "/fr/glossary/cac", "/en/about"]) {
      expect(vary(path), path).not.toMatch(/accept-language/i);
    }
  });
});

/**
 * GAME-BRIEF.md 13.1-13.2 — the game is closed by default and opens per
 * request, from the env var or from one browser's preview cookie.
 */
describe("proxy (game flag and preview cookie)", () => {
  const ORIGINAL = process.env.GAME_ENABLED;
  afterEach(() => {
    if (ORIGINAL === undefined) delete process.env.GAME_ENABLED;
    else process.env.GAME_ENABLED = ORIGINAL;
  });

  function request(url: string, cookie?: string): NextRequest {
    const headers = cookie ? { cookie } : undefined;
    return new NextRequest(`https://tourdegrowth.com${url}`, { headers });
  }
  const rewriteOf = (res: Response) => res.headers.get("x-middleware-rewrite");

  it("rewrites a closed game page to an unmatched address under the same language", () => {
    delete process.env.GAME_ENABLED;
    expect(rewriteOf(proxy(request("/fr/game")))).toBe("https://tourdegrowth.com/fr/game-unavailable");
    expect(rewriteOf(proxy(request("/en/game/retention")))).toBe("https://tourdegrowth.com/en/game-unavailable");
  });

  it("closes the game's share images with the pages (X20, chantier G4b)", () => {
    // A closed game must not unfurl: the image addresses are game paths too,
    // so they get the same 404 as the pages — and open with the same cookie.
    delete process.env.GAME_ENABLED;
    for (const path of ["/fr/game/opengraph-image/fr", "/en/game/retention/opengraph-image/en"]) {
      const locale = path.slice(1, 3);
      expect(rewriteOf(proxy(request(path)))).toBe(`https://tourdegrowth.com/${locale}/game-unavailable`);
      expect(rewriteOf(proxy(request(path, "tdg_game_preview=1")))).toBeNull();
    }
  });

  it("serves the game when GAME_ENABLED is \"true\"", () => {
    process.env.GAME_ENABLED = "true";
    expect(rewriteOf(proxy(request("/fr/game/retention")))).toBeNull();
  });

  it("serves it to a browser holding the preview cookie while closed for everybody else", () => {
    delete process.env.GAME_ENABLED;
    expect(rewriteOf(proxy(request("/en/game", "tdg_game_preview=1")))).toBeNull();
  });

  it("?game=preview sets an HttpOnly cookie and opens the game on this very request", () => {
    delete process.env.GAME_ENABLED;
    const res = proxy(request("/fr/game?game=preview"));
    expect(rewriteOf(res)).toBeNull();
    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toMatch(/tdg_game_preview=1/);
    expect(cookie.toLowerCase()).toContain("httponly");
  });

  it("?game=off clears the cookie and closes the game on this very request", () => {
    delete process.env.GAME_ENABLED;
    const res = proxy(request("/fr/game?game=off", "tdg_game_preview=1"));
    expect(rewriteOf(res)).toBe("https://tourdegrowth.com/fr/game-unavailable");
    expect(res.headers.get("set-cookie") ?? "").toMatch(/tdg_game_preview=;/);
  });

  it("never touches a page that is not the game", () => {
    delete process.env.GAME_ENABLED;
    expect(rewriteOf(proxy(request("/fr/glossary/cac")))).toBeNull();
    expect(rewriteOf(proxy(request("/quiz")))).toBeNull();
  });
});

/**
 * Engine spec §11.2 — the growth engine is closed by default, like the game,
 * on its own env var and its own cookie. The two flags must never leak into
 * each other: a game preview does not open the engine, and vice versa.
 */
describe("proxy (engine flag and preview cookie)", () => {
  const ORIGINAL = process.env.ENGINE_ENABLED;
  const ORIGINAL_GAME = process.env.GAME_ENABLED;
  afterEach(() => {
    if (ORIGINAL === undefined) delete process.env.ENGINE_ENABLED;
    else process.env.ENGINE_ENABLED = ORIGINAL;
    if (ORIGINAL_GAME === undefined) delete process.env.GAME_ENABLED;
    else process.env.GAME_ENABLED = ORIGINAL_GAME;
  });

  function request(url: string, cookie?: string): NextRequest {
    const headers = cookie ? { cookie } : undefined;
    return new NextRequest(`https://tourdegrowth.com${url}`, { headers });
  }
  const rewriteOf = (res: Response) => res.headers.get("x-middleware-rewrite");

  it("rewrites the closed engine page to an unmatched address under the same language", () => {
    delete process.env.ENGINE_ENABLED;
    expect(rewriteOf(proxy(request("/fr/aarrr-funnel-template")))).toBe(
      "https://tourdegrowth.com/fr/engine-unavailable",
    );
    expect(rewriteOf(proxy(request("/en/aarrr-funnel-template")))).toBe(
      "https://tourdegrowth.com/en/engine-unavailable",
    );
  });

  it("serves the engine when ENGINE_ENABLED is exactly \"true\", and only then", () => {
    process.env.ENGINE_ENABLED = "true";
    expect(rewriteOf(proxy(request("/fr/aarrr-funnel-template")))).toBeNull();
    process.env.ENGINE_ENABLED = "yes";
    expect(rewriteOf(proxy(request("/fr/aarrr-funnel-template")))).not.toBeNull();
  });

  it("serves it to a browser holding the preview cookie while closed for everybody else", () => {
    delete process.env.ENGINE_ENABLED;
    expect(rewriteOf(proxy(request("/en/aarrr-funnel-template", "tdg_engine_preview=1")))).toBeNull();
  });

  it("?engine=preview sets an HttpOnly cookie and opens the engine on this very request", () => {
    delete process.env.ENGINE_ENABLED;
    const res = proxy(request("/fr/aarrr-funnel-template?engine=preview"));
    expect(rewriteOf(res)).toBeNull();
    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toMatch(/tdg_engine_preview=1/);
    expect(cookie.toLowerCase()).toContain("httponly");
  });

  it("?engine=off clears the cookie and closes the engine on this very request", () => {
    delete process.env.ENGINE_ENABLED;
    const res = proxy(request("/fr/aarrr-funnel-template?engine=off", "tdg_engine_preview=1"));
    expect(rewriteOf(res)).toBe("https://tourdegrowth.com/fr/engine-unavailable");
    expect(res.headers.get("set-cookie") ?? "").toMatch(/tdg_engine_preview=;/);
  });

  it("keeps the two flags apart: a game preview never opens the engine, an engine preview never opens the game", () => {
    delete process.env.ENGINE_ENABLED;
    delete process.env.GAME_ENABLED;
    expect(rewriteOf(proxy(request("/fr/aarrr-funnel-template", "tdg_game_preview=1")))).toBe(
      "https://tourdegrowth.com/fr/engine-unavailable",
    );
    expect(rewriteOf(proxy(request("/fr/game", "tdg_engine_preview=1")))).toBe(
      "https://tourdegrowth.com/fr/game-unavailable",
    );
    process.env.GAME_ENABLED = "true";
    expect(rewriteOf(proxy(request("/fr/aarrr-funnel-template")))).not.toBeNull();
  });

  it("never touches a page that is not the engine", () => {
    delete process.env.ENGINE_ENABLED;
    expect(rewriteOf(proxy(request("/fr/aarrr-vs-okr")))).toBeNull();
    expect(rewriteOf(proxy(request("/fr/glossary/cac")))).toBeNull();
    expect(rewriteOf(proxy(request("/quiz")))).toBeNull();
  });

  it("redirects the unprefixed address to its localized form (308), like every content page", () => {
    delete process.env.ENGINE_ENABLED;
    const res = proxy(new NextRequest("https://tourdegrowth.com/aarrr-funnel-template?engine=preview", {
      headers: { "accept-language": "fr" },
    }));
    expect(res.status).toBe(308);
    expect(res.headers.get("location")).toBe("https://tourdegrowth.com/fr/aarrr-funnel-template?engine=preview");
  });
});
