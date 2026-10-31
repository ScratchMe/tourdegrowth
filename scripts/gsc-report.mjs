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
 * Since 2026-10-31 (A27.e) it also inspects every address of the live
 * sitemap with the URL Inspection API: whether Google indexed it, and if not
 * why (`coverageState`), when it last crawled it, and which canonical it
 * chose. That is the « Indexation des pages » report, which until then only
 * an export by hand could give. A refusal there (the API answers 403 to an
 * account whose permission is too low) is written into the report and ends
 * the inspection, never the report: the search figures still arrive.
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
const INSPECT_URL = "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect";
const SITEMAP_URL = "https://www.tourdegrowth.com/sitemap.xml";
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

/**
 * What Google said about a non-2xx response, so the workflow log names the
 * cause instead of a bare status: `accessNotConfigured` (the Search Console
 * API is not enabled on the service account's Cloud project) reads very
 * differently from an empty property list (the account was not added in
 * Search Console), and both came back as "HTTP 403" on the first real run.
 *
 * Two shapes: the token endpoint answers `{error, error_description}`, the
 * APIs answer `{error: {code, message, status, errors: [{reason}]}}`. Only
 * Google's own fields are echoed, truncated to 300 characters — the same
 * discipline as the Gemini error body (REVIEW-02.md R2-24). Nothing of
 * ours is in a response body, but it is still text we did not write.
 */
export async function describeFailure(res) {
  let text = "";
  try {
    text = await res.text();
  } catch {
    return `HTTP ${res.status}`;
  }
  try {
    const json = JSON.parse(text);
    const e = json.error;
    if (typeof e === "string") {
      return `HTTP ${res.status} ${e}${json.error_description ? `: ${json.error_description}` : ""}`.slice(0, 300);
    }
    if (e && typeof e === "object") {
      const reason = e.errors?.[0]?.reason ?? e.status ?? "";
      return `HTTP ${res.status}${reason ? ` ${reason}` : ""}${e.message ? `: ${e.message}` : ""}`.slice(0, 300);
    }
  } catch {
    // Not JSON — fall through to the raw text.
  }
  return `HTTP ${res.status}${text ? `: ${text.slice(0, 200)}` : ""}`;
}

async function getToken(account, fetchImpl) {
  const body = new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: buildJwt(account) });
  const res = await fetchImpl(TOKEN_URL, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body });
  if (!res.ok) throw new Error(`token exchange failed: ${await describeFailure(res)}`);
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
  if (!res.ok) throw new Error(`searchAnalytics.query failed: ${await describeFailure(res)}`);
  const json = await res.json();
  return (json.rows ?? []).map((r) => ({
    keys: r.keys ?? [],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: r.position,
  }));
}

/** Every `<loc>` of a sitemap, in order. */
export function sitemapUrls(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

/** Requests in flight at once: well under the API's 600 a minute, and three times faster than one by one. */
const INSPECT_CONCURRENCY = 3;
/** One answer may take this long; a slower one counts as a refusal of that URL. */
const INSPECT_TIMEOUT_MS = 20_000;
/** The inspection stops starting new URLs after this, so the workflow's ten minutes always leave room to encrypt. */
const INSPECT_BUDGET_MS = 5 * 60_000;

/**
 * Google's index status for each URL, three at a time. The first refusal is
 * kept as `error` and stops the inspection: every other URL would be refused
 * the same way, and the report must still be written. The time budget does
 * the same for a slow day (`truncated`), so the workflow never times out
 * with the whole report lost — the first run, on 2026-10-31, took minutes.
 */
export async function inspectUrls(fetchImpl, token, site, urls, { budgetMs = INSPECT_BUDGET_MS, now = Date.now } = {}) {
  const started = now();
  const results = [];
  let error = null;
  let truncated = false;
  let next = 0;
  async function worker() {
    while (error === null && next < urls.length) {
      if (now() - started > budgetMs) {
        truncated = true;
        return;
      }
      const index = next++;
      const url = urls[index];
      let res;
      try {
        res = await fetchImpl(INSPECT_URL, {
          method: "POST",
          headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
          body: JSON.stringify({ inspectionUrl: url, siteUrl: site }),
          signal: AbortSignal.timeout(INSPECT_TIMEOUT_MS),
        });
      } catch (err) {
        error ??= `urlInspection failed on ${url}: ${err instanceof Error ? err.name : "network error"}`;
        return;
      }
      if (!res.ok) {
        error ??= `urlInspection failed on ${url}: ${await describeFailure(res)}`;
        return;
      }
      const status = (await res.json()).inspectionResult?.indexStatusResult ?? {};
      results[index] = {
        url,
        verdict: status.verdict ?? null,
        coverageState: status.coverageState ?? null,
        lastCrawlTime: status.lastCrawlTime ?? null,
        googleCanonical: status.googleCanonical ?? null,
        userCanonical: status.userCanonical ?? null,
      };
    }
  }
  await Promise.all(Array.from({ length: Math.min(INSPECT_CONCURRENCY, urls.length) }, worker));
  return { error, truncated, results: results.filter(Boolean) };
}

/** The whole report. `fetchImpl` is injectable so the shape can be tested without Google. */
export async function buildReport(account, { fetchImpl = fetch, preferredSite = "", today = new Date(), inspect = [] } = {}) {
  const token = await getToken(account, fetchImpl);
  const sitesRes = await fetchImpl(`${API}/sites`, { headers: { authorization: `Bearer ${token}` } });
  if (!sitesRes.ok) throw new Error(`sites.list failed: ${await describeFailure(sitesRes)}`);
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

  const inspection = inspect.length ? await inspectUrls(fetchImpl, token, site, inspect) : null;
  return { generatedAt: today.toISOString(), site, windows, inspection };
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
  // The live sitemap names what to inspect; an unreachable one skips the inspection, never the report.
  fetch(SITEMAP_URL)
    .then((res) => (res.ok ? res.text() : ""))
    .catch(() => "")
    .then((xml) => buildReport(account, { preferredSite: process.env.GSC_SITE ?? "", inspect: sitemapUrls(xml) }))
    .then((report) => process.stdout.write(JSON.stringify(report)))
    .catch((err) => {
      // The message never contains the key; it names an endpoint, a status
      // and what Google said about it (describeFailure).
      console.error(`gsc-report: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    });
}
