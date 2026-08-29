import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
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
