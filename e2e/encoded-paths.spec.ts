import { expect, test } from "./helpers";

/**
 * The proxy checks the path the router matches, decoded once (`gatePath` in
 * `proxy.ts`, 2026-10-05). Before, it compared the raw, percent-encoded path
 * while the router decoded it: in production, `/en/a%61rrr-funnel-template`
 * served the closed engine, `/en/gam%65/retention` the closed game, and
 * `/%61dmin/stats` reached the admin routes without the Basic Auth (a 500
 * stopped it, not the gate).
 *
 * Against the real router, which the unit tests cannot be (they hold every
 * path read back from production, Vercel's router included): the engine is
 * closed on the server these specs run against (`ENGINE_ENABLED` unset, as in
 * `engine-flag.spec.ts`), and `/admin` fails closed with or without
 * `ADMIN_DASHBOARD_PASSWORD`. The game is open in CI, so its closed side is
 * held by `proxy.test.ts` alone, as are the closed pages' RSC payloads
 * (`/en/game.segments/_full.segment.rsc`): only Vercel serves them, `next
 * start` answers 404 with or without the fix, so a spec here would pass for
 * nothing. The status the server really answers, with no redirect followed.
 */
const get = (request: import("@playwright/test").APIRequestContext, path: string) =>
  request.get(path, { maxRedirects: 0, failOnStatusCode: false });

test("the closed engine is a 404 when its language is encoded — the segment next start decodes", async ({ request }) => {
  // Under `next start`, only the dynamic `[locale]` segment is decoded: this
  // path served the closed engine before the fix. Vercel decodes every
  // segment, which `proxy.test.ts` holds.
  expect((await get(request, "/%66r/aarrr-funnel-template")).status()).toBe(404);
});

test("an encoded legacy address never redirects off the site", async ({ request }) => {
  const res = await get(request, "/glossary/..%2F..%2F%2Fevil.com");
  expect(res.status()).toBe(400);
  expect(res.headers()["location"]).toBeUndefined();
});

test("/admin asks for the password under any encoding, never reaching the page", async ({ request }) => {
  for (const path of ["/%61dmin/stats", "/%61dmin/stats/json", "/adm%69n/preview"]) {
    const res = await get(request, path);
    expect(res.status(), path).toBe(401);
    expect(res.headers()["www-authenticate"], path).toMatch(/^Basic realm=/);
  }
});

test("a path that does not decode is refused, not guessed", async ({ request }) => {
  expect((await get(request, "/%61dmin%")).status()).toBe(400);
});
