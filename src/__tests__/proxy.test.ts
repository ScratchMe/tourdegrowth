import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resetRateLimitsForTests } from "@/lib/rate-limit";
import { constantTimeEqual, isAuthorizedForAdmin, proxy } from "../proxy";
import { ENGINE_PREVIEW_COOKIE } from "@/lib/engine/access";
import { GAME_PREVIEW_COOKIE } from "@/lib/game/access";
import { ownerPreviewToken } from "@/lib/owner-preview";

function requestWithAuth(pathname: string, authHeader?: string): NextRequest {
  const headers = authHeader ? { authorization: authHeader } : undefined;
  return new NextRequest(`https://tourdegrowth.com${pathname}`, { headers });
}

function basicHeader(userPass: string): string {
  return `Basic ${Buffer.from(userPass).toString("base64")}`;
}

describe("isAuthorizedForAdmin", () => {
  const originalPassword = process.env.ADMIN_DASHBOARD_PASSWORD;

  afterEach(async () => {
    if (originalPassword === undefined) delete process.env.ADMIN_DASHBOARD_PASSWORD;
    else process.env.ADMIN_DASHBOARD_PASSWORD = originalPassword;
  });

  it("fails closed when ADMIN_DASHBOARD_PASSWORD isn't configured at all", async () => {
    delete process.env.ADMIN_DASHBOARD_PASSWORD;
    const request = requestWithAuth("/admin/stats", basicHeader("anyone:anything"));
    expect(isAuthorizedForAdmin(request)).toBe(false);
  });

  it("rejects a missing Authorization header", async () => {
    process.env.ADMIN_DASHBOARD_PASSWORD = "correct-horse-battery-staple";
    expect(isAuthorizedForAdmin(requestWithAuth("/admin/stats"))).toBe(false);
  });

  it("rejects a non-Basic Authorization header", async () => {
    process.env.ADMIN_DASHBOARD_PASSWORD = "correct-horse-battery-staple";
    expect(isAuthorizedForAdmin(requestWithAuth("/admin/stats", "Bearer sometoken"))).toBe(false);
  });

  it("rejects the wrong password", async () => {
    process.env.ADMIN_DASHBOARD_PASSWORD = "correct-horse-battery-staple";
    const request = requestWithAuth("/admin/stats", basicHeader("admin:wrong-password"));
    expect(isAuthorizedForAdmin(request)).toBe(false);
  });

  it("accepts the right password regardless of the username", async () => {
    process.env.ADMIN_DASHBOARD_PASSWORD = "correct-horse-battery-staple";
    const request = requestWithAuth("/admin/stats", basicHeader("whoever:correct-horse-battery-staple"));
    expect(isAuthorizedForAdmin(request)).toBe(true);
  });

  it("splits on the FIRST colon only, so a password containing ':' isn't truncated", async () => {
    process.env.ADMIN_DASHBOARD_PASSWORD = "pass:with:colons";
    const request = requestWithAuth("/admin/stats", basicHeader("admin:pass:with:colons"));
    expect(isAuthorizedForAdmin(request)).toBe(true);
  });

  it("accepts a password with non-ASCII characters, sent UTF-8 encoded as browsers do (REVIEW-02.md R2-22)", async () => {
    process.env.ADMIN_DASHBOARD_PASSWORD = "clé-d'été-très-sûre";
    expect(isAuthorizedForAdmin(requestWithAuth("/admin/stats", basicHeader("admin:clé-d'été-très-sûre")))).toBe(true);
    expect(isAuthorizedForAdmin(requestWithAuth("/admin/stats", basicHeader("admin:cle-d'ete-tres-sure")))).toBe(false);
  });

  it("rejects malformed base64", async () => {
    process.env.ADMIN_DASHBOARD_PASSWORD = "correct-horse-battery-staple";
    expect(isAuthorizedForAdmin(requestWithAuth("/admin/stats", "Basic not-valid-base64!!"))).toBe(false);
  });
});

describe("proxy (admin gate)", () => {
  const originalPassword = process.env.ADMIN_DASHBOARD_PASSWORD;

  beforeEach(async () => {
    process.env.ADMIN_DASHBOARD_PASSWORD = "correct-horse-battery-staple";
  });

  afterEach(async () => {
    if (originalPassword === undefined) delete process.env.ADMIN_DASHBOARD_PASSWORD;
    else process.env.ADMIN_DASHBOARD_PASSWORD = originalPassword;
  });

  it("returns 401 with a WWW-Authenticate challenge for /admin without credentials", async () => {
    const response = await proxy(requestWithAuth("/admin/stats"));
    expect(response.status).toBe(401);
    expect(response.headers.get("WWW-Authenticate")).toMatch(/^Basic realm=/);
  });

  it("gates the JSON twin of the dashboard exactly like the page — /admin/stats/json is under /admin", async () => {
    expect((await proxy(requestWithAuth("/admin/stats/json"))).status).toBe(401);
    expect((await proxy(requestWithAuth("/admin/stats/json", basicHeader("admin:correct-horse-battery-staple")))).status).not.toBe(401);
  });

  it("lets an authorized /admin request through (not a 401)", async () => {
    const response = await proxy(requestWithAuth("/admin/stats", basicHeader("admin:correct-horse-battery-staple")));
    expect(response.status).not.toBe(401);
  });

  it("never checks credentials for non-admin paths", async () => {
    const response = await proxy(requestWithAuth("/quiz"));
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

  it("sets the cookie when a URL prefix disagrees with it", async () => {
    expect((await proxy(request("/fr/glossary/cac", "en"))).cookies.get("tdg_locale")?.value).toBe("fr");
  });

  it("sets the cookie when there is none yet", async () => {
    expect((await proxy(request("/fr"))).cookies.get("tdg_locale")?.value).toBe("fr");
  });

  it("sets the cookie from ?lang= on an unprefixed app page", async () => {
    expect((await proxy(request("/quiz?lang=fr"))).cookies.get("tdg_locale")?.value).toBe("fr");
  });

  it("does NOT re-send an identical cookie on an already-agreeing page", async () => {
    // Every one of these responses is a CDN-cacheable prerender; a
    // `Set-Cookie` repeating what the browser already holds is pure noise on
    // it.
    expect((await proxy(request("/fr/glossary/cac", "fr"))).cookies.get("tdg_locale")).toBeUndefined();
  });

  it("never writes a cookie for a page that expresses no choice", async () => {
    expect((await proxy(request("/quiz", "fr"))).cookies.get("tdg_locale")).toBeUndefined();
    expect((await proxy(request("/r/abc"))).cookies.get("tdg_locale")).toBeUndefined();
  });

  it("hands the resolved locale down to the root layout as a header", async () => {
    const withPrefix = await proxy(request("/fr/how-it-works", "en"));
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

  it("lets 120 result reads through in ten minutes, then answers 429 with a real Retry-After", async () => {
    for (let i = 0; i < 120; i += 1) {
      expect((await proxy(resultRequest(ID, "203.0.113.9"))).status).not.toBe(429);
    }
    const blocked = await proxy(resultRequest(ID, "203.0.113.9"));
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get("retry-after"))).toBeGreaterThan(0);
  });

  it("counts per IP: another visitor is not affected by a flood from the first", async () => {
    for (let i = 0; i < 121; i += 1) (await proxy(resultRequest(ID, "203.0.113.9")));
    expect((await proxy(resultRequest(ID, "198.51.100.4"))).status).not.toBe(429);
  });

  it("never counts the sample result, which reads no Firestore", async () => {
    for (let i = 0; i < 200; i += 1) {
      expect((await proxy(resultRequest("/r/sample", "203.0.113.9"))).status).not.toBe(429);
    }
    // …and the budget it did not spend is still there for a real result.
    expect((await proxy(resultRequest(ID, "203.0.113.9"))).status).not.toBe(429);
  });

  it("leaves every other path alone", async () => {
    for (let i = 0; i < 200; i += 1) {
      expect((await proxy(resultRequest("/quiz", "203.0.113.9"))).status).not.toBe(429);
    }
  });
});

describe("constantTimeEqual (REVIEW-02.md R2-22)", () => {
  it("agrees with === on equal and unequal strings, including non-ASCII", async () => {
    expect(constantTimeEqual("secret", "secret")).toBe(true);
    expect(constantTimeEqual("clé", "clé")).toBe(true);
    expect(constantTimeEqual("secret", "secreT")).toBe(false);
    expect(constantTimeEqual("secret", "secret ")).toBe(false);
    expect(constantTimeEqual("", "")).toBe(true);
    expect(constantTimeEqual("", "a")).toBe(false);
  });

  it("reads every byte even when the first one already differs", async () => {
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
  const vary = async (pathname: string, headers?: Record<string, string>) =>
    (await proxy(new NextRequest(`https://tourdegrowth.com${pathname}`, { headers }))).headers.get("vary") ?? "";

  it("marks the language redirect of an unprefixed content URL as depending on Accept-Language", async () => {
    const response = await proxy(new NextRequest("https://tourdegrowth.com/", { headers: { "accept-language": "fr" } }));
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://tourdegrowth.com/fr");
    expect(response.headers.get("vary")).toMatch(/accept-language/i);
  });

  it("marks the legacy content URLs' redirects the same way", async () => {
    for (const path of ["/how-it-works", "/glossary", "/glossary/cac", "/about"]) {
      expect(await vary(path), path).toMatch(/accept-language/i);
    }
  });

  it("never marks a prefixed content page — its language is in the URL, and the CDN caches it once", async () => {
    for (const path of ["/en", "/fr", "/fr/glossary/cac", "/en/about"]) {
      expect(await vary(path), path).not.toMatch(/accept-language/i);
    }
  });
});

/**
 * The owner preview (`lib/owner-preview.ts`, 2026-09-25). Until then any
 * browser could open a closed feature with `?game=preview`, a parameter
 * written in this public repository. Now the cookie's value is an HMAC under
 * the admin password, minted only by `POST /admin/preview` behind the admin
 * gate — so these tests pin the three things that make it "owner only": the
 * public parameter is inert, a guessable cookie value is refused, and minting
 * needs the password.
 */
const PASSWORD = "correct-horse-battery-staple";

function request(url: string, init: { cookie?: string; auth?: string; method?: string } = {}): NextRequest {
  const headers: Record<string, string> = {};
  if (init.cookie) headers.cookie = init.cookie;
  if (init.auth) headers.authorization = init.auth;
  return new NextRequest(`https://tourdegrowth.com${url}`, { headers, method: init.method ?? "GET" });
}
const rewriteOf = (res: Response) => res.headers.get("x-middleware-rewrite");
const setCookies = (res: Response) => res.headers.getSetCookie().join("\n");

function useFlagEnv() {
  const ORIGINAL = {
    game: process.env.GAME_ENABLED,
    engine: process.env.ENGINE_ENABLED,
    password: process.env.ADMIN_DASHBOARD_PASSWORD,
  };
  beforeEach(() => {
    delete process.env.GAME_ENABLED;
    delete process.env.ENGINE_ENABLED;
    process.env.ADMIN_DASHBOARD_PASSWORD = PASSWORD;
  });
  afterEach(() => {
    const restore = (name: string, value: string | undefined) => {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    };
    restore("GAME_ENABLED", ORIGINAL.game);
    restore("ENGINE_ENABLED", ORIGINAL.engine);
    restore("ADMIN_DASHBOARD_PASSWORD", ORIGINAL.password);
  });
}

/**
 * GAME-BRIEF.md 13.1-13.2 — the game is closed by default and opens per
 * request, from the env var or from the owner's signed preview cookie.
 */
describe("proxy (game flag and owner preview)", () => {
  useFlagEnv();

  it("rewrites a closed game page to an unmatched address under the same language", async () => {
    expect(rewriteOf(await proxy(request("/fr/game")))).toBe("https://tourdegrowth.com/fr/game-unavailable");
    expect(rewriteOf(await proxy(request("/en/game/retention")))).toBe("https://tourdegrowth.com/en/game-unavailable");
  });

  it("closes the game's share images with the pages, and opens them with the same signed cookie (X20)", async () => {
    const cookie = `${GAME_PREVIEW_COOKIE}=${await ownerPreviewToken("game", PASSWORD)}`;
    for (const path of ["/fr/game/opengraph-image/fr", "/en/game/retention/opengraph-image/en"]) {
      const locale = path.slice(1, 3);
      expect(rewriteOf(await proxy(request(path)))).toBe(`https://tourdegrowth.com/${locale}/game-unavailable`);
      expect(rewriteOf(await proxy(request(path, { cookie })))).toBeNull();
    }
  });

  it("serves the game to everybody when GAME_ENABLED is \"true\"", async () => {
    process.env.GAME_ENABLED = "true";
    expect(rewriteOf(await proxy(request("/fr/game/retention")))).toBeNull();
  });

  it("serves it to the owner's signed cookie while closed for everybody else", async () => {
    const cookie = `${GAME_PREVIEW_COOKIE}=${await ownerPreviewToken("game", PASSWORD)}`;
    expect(rewriteOf(await proxy(request("/en/game", { cookie })))).toBeNull();
  });

  it("refuses the guessable cookie value the public preview used to set", async () => {
    for (const value of ["1", "true", "", "preview"]) {
      const res = await proxy(request("/en/game", { cookie: `${GAME_PREVIEW_COOKIE}=${value}` }));
      expect(rewriteOf(res), value).toBe("https://tourdegrowth.com/en/game-unavailable");
    }
  });

  it("refuses a signature made with another password — rotating it revokes every cookie", async () => {
    const cookie = `${GAME_PREVIEW_COOKIE}=${await ownerPreviewToken("game", "an-old-password")}`;
    expect(rewriteOf(await proxy(request("/en/game", { cookie })))).toBe("https://tourdegrowth.com/en/game-unavailable");
  });

  it("fails closed without ADMIN_DASHBOARD_PASSWORD, even for a once-valid cookie", async () => {
    const cookie = `${GAME_PREVIEW_COOKIE}=${await ownerPreviewToken("game", PASSWORD)}`;
    delete process.env.ADMIN_DASHBOARD_PASSWORD;
    expect(rewriteOf(await proxy(request("/en/game", { cookie })))).toBe("https://tourdegrowth.com/en/game-unavailable");
  });

  it("?game=preview is inert now: no cookie set, the game stays closed", async () => {
    const res = await proxy(request("/fr/game?game=preview"));
    expect(rewriteOf(res)).toBe("https://tourdegrowth.com/fr/game-unavailable");
    expect(setCookies(res)).not.toMatch(new RegExp(GAME_PREVIEW_COOKIE));
  });

  it("never touches a page that is not the game", async () => {
    expect(rewriteOf(await proxy(request("/fr/glossary/cac")))).toBeNull();
    expect(rewriteOf(await proxy(request("/quiz")))).toBeNull();
  });
});

/**
 * Engine spec §11.2 — the growth engine is closed by default, like the game,
 * on its own env var and its own cookie. The two flags must never leak into
 * each other: a game preview does not open the engine, and vice versa.
 */
describe("proxy (engine flag and owner preview)", () => {
  useFlagEnv();

  it("rewrites the closed engine page to an unmatched address under the same language", async () => {
    expect(rewriteOf(await proxy(request("/fr/aarrr-funnel-template")))).toBe(
      "https://tourdegrowth.com/fr/engine-unavailable",
    );
    expect(rewriteOf(await proxy(request("/en/aarrr-funnel-template")))).toBe(
      "https://tourdegrowth.com/en/engine-unavailable",
    );
  });

  it("serves the engine when ENGINE_ENABLED is exactly \"true\", and only then", async () => {
    process.env.ENGINE_ENABLED = "true";
    expect(rewriteOf(await proxy(request("/fr/aarrr-funnel-template")))).toBeNull();
    process.env.ENGINE_ENABLED = "yes";
    expect(rewriteOf(await proxy(request("/fr/aarrr-funnel-template")))).not.toBeNull();
  });

  it("serves it to the owner's signed cookie, refuses the old \"1\"", async () => {
    const cookie = `${ENGINE_PREVIEW_COOKIE}=${await ownerPreviewToken("engine", PASSWORD)}`;
    expect(rewriteOf(await proxy(request("/en/aarrr-funnel-template", { cookie })))).toBeNull();
    expect(rewriteOf(await proxy(request("/en/aarrr-funnel-template", { cookie: `${ENGINE_PREVIEW_COOKIE}=1` })))).toBe(
      "https://tourdegrowth.com/en/engine-unavailable",
    );
  });

  it("?engine=preview is inert now: no cookie set, the engine stays closed", async () => {
    const res = await proxy(request("/fr/aarrr-funnel-template?engine=preview"));
    expect(rewriteOf(res)).toBe("https://tourdegrowth.com/fr/engine-unavailable");
    expect(setCookies(res)).not.toMatch(new RegExp(ENGINE_PREVIEW_COOKIE));
  });

  it("keeps the two flags apart: a game signature never opens the engine, even under the engine's cookie name", async () => {
    const gameToken = await ownerPreviewToken("game", PASSWORD);
    const engineToken = await ownerPreviewToken("engine", PASSWORD);
    expect(gameToken).not.toBe(engineToken);
    // The right cookie name with the other feature's signature.
    expect(rewriteOf(await proxy(request("/fr/aarrr-funnel-template", { cookie: `${ENGINE_PREVIEW_COOKIE}=${gameToken}` })))).toBe(
      "https://tourdegrowth.com/fr/engine-unavailable",
    );
    expect(rewriteOf(await proxy(request("/fr/game", { cookie: `${GAME_PREVIEW_COOKIE}=${engineToken}` })))).toBe(
      "https://tourdegrowth.com/fr/game-unavailable",
    );
    // The other feature's cookie, correctly signed for it.
    expect(rewriteOf(await proxy(request("/fr/aarrr-funnel-template", { cookie: `${GAME_PREVIEW_COOKIE}=${gameToken}` })))).toBe(
      "https://tourdegrowth.com/fr/engine-unavailable",
    );
    process.env.GAME_ENABLED = "true";
    expect(rewriteOf(await proxy(request("/fr/aarrr-funnel-template")))).not.toBeNull();
  });

  it("never touches a page that is not the engine", async () => {
    expect(rewriteOf(await proxy(request("/fr/aarrr-vs-okr")))).toBeNull();
    expect(rewriteOf(await proxy(request("/fr/glossary/cac")))).toBeNull();
    expect(rewriteOf(await proxy(request("/quiz")))).toBeNull();
  });

  it("redirects the unprefixed address to its localized form (308), like every content page", async () => {
    const res = await proxy(new NextRequest("https://tourdegrowth.com/aarrr-funnel-template", {
      headers: { "accept-language": "fr" },
    }));
    expect(res.status).toBe(308);
    expect(res.headers.get("location")).toBe("https://tourdegrowth.com/fr/aarrr-funnel-template");
  });
});

/** `POST /admin/preview` — the one place the signed cookies are minted. */
describe("proxy (minting the owner preview at /admin/preview)", () => {
  useFlagEnv();
  const auth = basicHeader(`admin:${PASSWORD}`);

  it("asks for the password first: without it, a POST mints nothing", async () => {
    const res = await proxy(request("/admin/preview?game=on&engine=on", { method: "POST" }));
    expect(res.status).toBe(401);
    expect(setCookies(res)).toBe("");
    const wrong = await proxy(request("/admin/preview?game=on", { method: "POST", auth: basicHeader("admin:nope") }));
    expect(wrong.status).toBe(401);
    expect(setCookies(wrong)).toBe("");
  });

  it("with the password, mints the signed, HttpOnly, Secure cookies and answers 303 to the page", async () => {
    const res = await proxy(request("/admin/preview?game=on&engine=on", { method: "POST", auth }));
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("https://tourdegrowth.com/admin/preview");
    const game = res.cookies.get(GAME_PREVIEW_COOKIE);
    const engine = res.cookies.get(ENGINE_PREVIEW_COOKIE);
    expect(game?.value).toBe(await ownerPreviewToken("game", PASSWORD));
    expect(engine?.value).toBe(await ownerPreviewToken("engine", PASSWORD));
    const header = setCookies(res).toLowerCase();
    expect(header).toContain("httponly");
    expect(header).toContain("secure");
    expect(header).toContain("samesite=lax");
  });

  it("the minted cookie really opens the page on the next request", async () => {
    const res = await proxy(request("/admin/preview?engine=on", { method: "POST", auth }));
    const cookie = `${ENGINE_PREVIEW_COOKIE}=${res.cookies.get(ENGINE_PREVIEW_COOKIE)?.value}`;
    expect(rewriteOf(await proxy(request("/fr/aarrr-funnel-template", { cookie })))).toBeNull();
  });

  it("=off clears a cookie; one feature at a time; a stray value changes nothing", async () => {
    const off = await proxy(request("/admin/preview?game=off", { method: "POST", auth }));
    expect(setCookies(off)).toMatch(new RegExp(`${GAME_PREVIEW_COOKIE}=;`));
    expect(setCookies(off)).not.toMatch(new RegExp(ENGINE_PREVIEW_COOKIE));
    const stray = await proxy(request("/admin/preview?game=yes&engine=preview", { method: "POST", auth }));
    expect(stray.status).toBe(303);
    expect(setCookies(stray)).toBe("");
  });

  it("a GET never mints: link prefetchers and unfurlers must not toggle anything", async () => {
    const res = await proxy(request("/admin/preview?game=on&engine=on", { auth }));
    expect(res.status).not.toBe(303);
    expect(setCookies(res)).not.toMatch(/tdg_(game|engine)_preview/);
  });
});
