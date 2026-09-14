import { createVerify, generateKeyPairSync } from "node:crypto";
import { describe, expect, it } from "vitest";

type Account = { client_email: string; private_key: string };
type Row = { clicks: number; impressions: number; ctr: number; position: number; query?: string; page?: string };
type Window = { start: string; end: string; totals: Row | null; queries: Row[]; pages: Row[]; queriesByPage?: Row[] };
type Report = { generatedAt: string; site: string; windows: { last28: Window; last90: Window } };

// A JS module in an `allowJs: false` project — same trick as
// utm-channels.test.ts: widen the specifier so the import is untyped.
const { buildJwt, buildReport, pickSite, windowDates } = (await import("../../scripts/gsc-report.mjs" as string)) as {
  buildJwt: (account: Account, nowSeconds?: number) => string;
  pickSite: (entries: { siteUrl: string }[], preferred?: string) => string;
  windowDates: (days: number, today?: Date) => { start: string; end: string };
  buildReport: (
    account: Account,
    opts?: { fetchImpl?: typeof fetch; preferredSite?: string; today?: Date },
  ) => Promise<Report>;
};

/**
 * `scripts/gsc-report.mjs` cannot be exercised against Google from CI (no
 * service account there, by design). What can be pinned offline: the JWT is
 * one Google will accept (RS256 over header.claims, the right issuer, scope
 * and audience, a one-hour life), the property choice, the date windows,
 * and the exact requests the report makes — dimensions, limits, `final`
 * data — against a fake fetch.
 */
const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const account = {
  client_email: "reader@tourdegrowth.iam.gserviceaccount.com",
  private_key: privateKey.export({ type: "pkcs8", format: "pem" }) as string,
};

describe("buildJwt", () => {
  it("is an RS256 assertion for the token endpoint, verifiable with the account's public key", () => {
    const jwt = buildJwt(account, 1_800_000_000);
    const [header, claims, signature] = jwt.split(".");
    expect(JSON.parse(Buffer.from(header!, "base64url").toString())).toEqual({ alg: "RS256", typ: "JWT" });
    expect(JSON.parse(Buffer.from(claims!, "base64url").toString())).toEqual({
      iss: account.client_email,
      scope: "https://www.googleapis.com/auth/webmasters.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: 1_800_000_000,
      exp: 1_800_003_600,
    });
    const verifier = createVerify("RSA-SHA256");
    verifier.update(`${header}.${claims}`);
    expect(verifier.verify(publicKey, Buffer.from(signature!, "base64url"))).toBe(true);
  });
});

describe("pickSite", () => {
  const entries = [{ siteUrl: "https://example.org/" }, { siteUrl: "https://www.tourdegrowth.com/" }, { siteUrl: "sc-domain:tourdegrowth.com" }];
  it("prefers the domain property, falls back to any tourdegrowth property, honours an explicit name", () => {
    expect(pickSite(entries)).toBe("sc-domain:tourdegrowth.com");
    expect(pickSite(entries.slice(0, 2))).toBe("https://www.tourdegrowth.com/");
    expect(pickSite(entries, "https://www.tourdegrowth.com/")).toBe("https://www.tourdegrowth.com/");
  });
  it("names the properties it did see when none matches — the usual cause is the account not being added in Search Console", () => {
    expect(() => pickSite([{ siteUrl: "https://example.org/" }])).toThrow(/example\.org/);
    expect(() => pickSite(entries, "sc-domain:nope")).toThrow(/sc-domain:nope/);
  });
});

describe("windowDates", () => {
  it("ends three days before today (Search Console's final-data lag) and spans exactly the window", () => {
    expect(windowDates(28, new Date("2026-09-14T10:00:00Z"))).toEqual({ start: "2026-08-15", end: "2026-09-11" });
    expect(windowDates(90, new Date("2026-09-14T10:00:00Z"))).toEqual({ start: "2026-06-14", end: "2026-09-11" });
  });
});

describe("buildReport", () => {
  it("exchanges the JWT, lists sites, then asks for totals, queries, pages per window and query×page on the long one", async () => {
    const calls: { url: string; body: unknown }[] = [];
    const fetchImpl = (async (url: string, init?: RequestInit) => {
      const body = typeof init?.body === "string" ? JSON.parse(init.body) : init?.body ? String(init.body) : null;
      calls.push({ url, body });
      if (url.endsWith("/token")) return new Response(JSON.stringify({ access_token: "tok" }));
      if (url.endsWith("/sites")) return new Response(JSON.stringify({ siteEntry: [{ siteUrl: "sc-domain:tourdegrowth.com" }] }));
      const dims = (body as { dimensions: string[] }).dimensions;
      const keys = dims.map((d) => (d === "query" ? "growth audit template" : "https://www.tourdegrowth.com/en/glossary/cac"));
      return new Response(JSON.stringify({ rows: [{ keys, clicks: 3, impressions: 120, ctr: 0.025, position: 14.2 }] }));
    }) as unknown as typeof fetch;

    const report = await buildReport(account, { fetchImpl, today: new Date("2026-09-14T10:00:00Z") });

    expect(report.site).toBe("sc-domain:tourdegrowth.com");
    expect(calls[0]!.url).toBe("https://oauth2.googleapis.com/token");
    expect(String(calls[0]!.body)).toContain("grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer");
    expect(calls[1]!.url).toBe("https://www.googleapis.com/webmasters/v3/sites");
    const queries = calls.slice(2).map((c) => c.body as { dimensions: string[]; rowLimit: number; dataState: string; startDate: string });
    expect(queries.map((q) => q.dimensions)).toEqual([[], ["query"], ["page"], [], ["query"], ["page"], ["query", "page"]]);
    expect(queries.every((q) => q.dataState === "final")).toBe(true);
    for (const c of calls.slice(2)) expect(c.url).toContain(encodeURIComponent("sc-domain:tourdegrowth.com"));

    expect(report.windows.last28.totals).toEqual({ clicks: 3, impressions: 120, ctr: 0.025, position: 14.2 });
    expect(report.windows.last28.queries[0]).toMatchObject({ query: "growth audit template", impressions: 120 });
    expect(report.windows.last90.queriesByPage![0]).toMatchObject({ query: "growth audit template", page: expect.stringContaining("/glossary/cac") });
    expect(report.windows.last28.start).toBe("2026-08-15");
  });

  it("never puts the private key in an error message", async () => {
    const fetchImpl = (async () => new Response("nope", { status: 403 })) as unknown as typeof fetch;
    await expect(buildReport(account, { fetchImpl })).rejects.toThrow(/token exchange failed: HTTP 403/);
    try {
      await buildReport(account, { fetchImpl });
    } catch (err) {
      expect(String(err)).not.toContain("PRIVATE KEY");
    }
  });
});
