import { expect, test } from "./helpers";

/**
 * The proxy checks the path the router matches, decoded once (`gatePath` in
 * `proxy.ts`, 2026-10-05). Before, it compared the raw, percent-encoded path
 * while the router decoded it: in production, `/en/a%61rrr-funnel-template`
 * served the closed engine, `/en/gam%65/retention` the closed game, and
 * `/%61dmin/stats` reached the admin routes without the Basic Auth (a 500
 * stopped it, not the gate).
 *
 * Against the real router, which the unit tests cannot be: the engine is
 * closed on the server these specs run against (`ENGINE_ENABLED` unset, as in
 * `engine-flag.spec.ts`), and `/admin` fails closed with or without
 * `ADMIN_DASHBOARD_PASSWORD`. The game is open in CI, so its closed side is
 * held by `proxy.test.ts` alone. The status the server really answers, with
 * no redirect followed.
 */
const get = (request: import("@playwright/test").APIRequestContext, path: string) =>
  request.get(path, { maxRedirects: 0, failOnStatusCode: false });

test("the closed engine is a 404 under any encoding the router reads as its page", async ({ request }) => {
  for (const path of ["/en/a%61rrr-funnel-template", "/%66r/aarrr-funnel-template", "/fr%2Faarrr-funnel-template"]) {
    expect((await get(request, path)).status(), path).toBe(404);
  }
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
