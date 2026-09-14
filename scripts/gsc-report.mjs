#!/usr/bin/env node
/**
 * Search Console report for `.github/workflows/stats.yml` — GROWTH-PLAN.md 2.7.
 *
 * Reads the site's Search Analytics with a Google service account and prints
 * one JSON document on stdout: totals, top queries and top pages for the last
 * 28 and 90 days, plus query×page pairs for the long window. That is what
 * choosing the next glossary terms needs (queries the site already ranks
 * for at position 10-50), and what measuring a launch needs (impressions
 * before and after).
 *
 * No dependency — the OAuth exchange is a signed JWT (`node:crypto`, RS256)
 * against Google's token endpoint, then plain `fetch`. The service account
 * must be added to the Search Console property as a RESTRICTED user (read
 * only); its key never leaves the workflow's environment, and this script
 * never prints it.
 *
 * Env: GSC_SERVICE_ACCOUNT_JSON (the key file's contents), optional
 * GSC_SITE (a property name, e.g. `sc-domain:tourdegrowth.com`; otherwise
 * the first property containing "tourdegrowth" is used, domain property
 * preferred).
 */
import { createSign } from "node:crypto";
import { pathToFileURL } from "node:url";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API = "https://www.googleapis.com/webmasters/v3";
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
/** Search Console data is final about three days behind today. */
const DATA_LAG_DAYS = 3;
export const WINDOWS = { last28: 28, last90: 90 };

function base64url(input) {
  return Buffer.from(input).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

/** A service-account JWT for the token endpoint (RFC 7523), signed RS256 with the account's private key. */
export function buildJwt(account, nowSeconds = Math.floor(Date.now() / 1000)) {
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({ iss: account.client_email, scope: SCOPE, aud: TOKEN_URL, iat: nowSeconds, exp: nowSeconds + 3600 }),
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const signature = signer.sign(account.private_key, "base64url");
  return `${header}.${claims}.${signature}`;
}

/** The property to read: an explicit name, else the domain property for tourdegrowth, else any tourdegrowth property. */
export function pickSite(entries, preferred = "") {
  const names = entries.map((e) => e.siteUrl);
  if (preferred) {
    if (!names.includes(preferred)) throw new Error(`GSC_SITE ${preferred} is not among this account's properties: ${names.join(", ") || "(none)"}`);
    return preferred;
  }
  const ours = names.filter((n) => n.includes("tourdegrowth"));
  const domain = ours.find((n) => n.startsWith("sc-domain:"));
  const chosen = domain ?? ours[0];
  if (!chosen) throw new Error(`No tourdegrowth property visible to this service account: ${names.join(", ") || "(none)"}`);
  return chosen;
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

/** `{ start, end }` for a window of `days` ending DATA_LAG_DAYS before `today`. */
export function windowDates(days, today = new Date()) {
  const end = new Date(today);
  end.setUTCDate(end.getUTCDate() - DATA_LAG_DAYS);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  return { start: isoDate(start), end: isoDate(end) };
}

async function getToken(account, fetchImpl) {
  const body = new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: buildJwt(account) });
  const res = await fetchImpl(TOKEN_URL, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body });
  if (!res.ok) throw new Error(`token exchange failed: HTTP ${res.status}`);
  const json = await res.json();
  if (!json.access_token) throw new Error("token exchange returned no access_token");
  return json.access_token;
}

async function query(fetchImpl, token, site, body) {
  const res = await fetchImpl(`${API}/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ dataState: "final", ...body }),
  });
  if (!res.ok) throw new Error(`searchAnalytics.query failed: HTTP ${res.status}`);
  const json = await res.json();
  return (json.rows ?? []).map((r) => ({
    keys: r.keys ?? [],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: r.position,
  }));
}

/** The whole report. `fetchImpl` is injectable so the shape can be tested without Google. */
export async function buildReport(account, { fetchImpl = fetch, preferredSite = "", today = new Date() } = {}) {
  const token = await getToken(account, fetchImpl);
  const sitesRes = await fetchImpl(`${API}/sites`, { headers: { authorization: `Bearer ${token}` } });
  if (!sitesRes.ok) throw new Error(`sites.list failed: HTTP ${sitesRes.status}`);
  const site = pickSite((await sitesRes.json()).siteEntry ?? [], preferredSite);

  const windows = {};
  for (const [name, days] of Object.entries(WINDOWS)) {
    const { start, end } = windowDates(days, today);
    const range = { startDate: start, endDate: end };
    const [totals, queries, pages] = await Promise.all([
      query(fetchImpl, token, site, { ...range, dimensions: [], rowLimit: 1 }),
      query(fetchImpl, token, site, { ...range, dimensions: ["query"], rowLimit: 250 }),
      query(fetchImpl, token, site, { ...range, dimensions: ["page"], rowLimit: 100 }),
    ]);
    windows[name] = {
      start,
      end,
      totals: totals[0] ? { clicks: totals[0].clicks, impressions: totals[0].impressions, ctr: totals[0].ctr, position: totals[0].position } : null,
      queries: queries.map((r) => ({ query: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position })),
      pages: pages.map((r) => ({ page: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position })),
    };
  }
  // Query × page on the long window only: which page answers which query.
  const long = windowDates(WINDOWS.last90, today);
  const pairs = await query(fetchImpl, token, site, { startDate: long.start, endDate: long.end, dimensions: ["query", "page"], rowLimit: 250 });
  windows.last90.queriesByPage = pairs.map((r) => ({ query: r.keys[0], page: r.keys[1], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position }));

  return { generatedAt: today.toISOString(), site, windows };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const raw = process.env.GSC_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    console.error("GSC_SERVICE_ACCOUNT_JSON is not set");
    process.exit(2);
  }
  let account;
  try {
    account = JSON.parse(raw);
  } catch {
    console.error("GSC_SERVICE_ACCOUNT_JSON is not valid JSON");
    process.exit(2);
  }
  buildReport(account, { preferredSite: process.env.GSC_SITE ?? "" })
    .then((report) => process.stdout.write(JSON.stringify(report)))
    .catch((err) => {
      // The message never contains the key; it names an endpoint and a status.
      console.error(`gsc-report: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    });
}
