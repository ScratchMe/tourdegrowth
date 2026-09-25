import { ADMIN_PASSWORD, SKIP_ADMIN_REASON, adminCredentials, expect, grantOwnerPreview, test } from "./helpers";

/**
 * The growth engine's page ships closed (engine spec §11.2): `ENGINE_ENABLED`
 * is unset on the server these specs run against, so the proxy rewrites the
 * page to a 404 — for everybody but the owner.
 *
 * Since 2026-09-25 the owner's preview is a cookie signed with the admin
 * password, minted only by `/admin/preview` behind that password
 * (`lib/owner-preview.ts`). Before, `?engine=preview` on any URL opened the
 * page, and that parameter is written in this public repository. So these
 * specs pin both halves: nothing a stranger can type opens the page, and the
 * owner's switchboard does — and it stays noindex at build time, since a
 * preview must never make the page indexable.
 *
 * Behaviour, not attributes: the status the browser really receives, the
 * cookie the browser really keeps, and the island really hydrating.
 */
const PATH = "/fr/aarrr-funnel-template";

const previewCookie = async (context: import("@playwright/test").BrowserContext) =>
  (await context.cookies()).find((c) => c.name === "tdg_engine_preview");

test("closed by default: the engine page is a real 404", async ({ page }) => {
  const res = await page.goto(PATH);
  expect(res?.status()).toBe(404);
  await expect(page.getByTestId("engine-workbench")).toHaveCount(0);
});

test("?engine=preview is inert now: still a 404, and no cookie", async ({ page, context }) => {
  const res = await page.goto(`${PATH}?engine=preview`);
  expect(res?.status()).toBe(404);
  expect(await previewCookie(context)).toBeUndefined();
});

test("a guessed cookie opens nothing — \"1\" was the old value, readable in the repository", async ({ page, context, baseURL }) => {
  for (const value of ["1", "true", "preview"]) {
    await context.addCookies([{ name: "tdg_engine_preview", value, url: baseURL! }]);
    expect((await page.goto(PATH))?.status(), value).toBe(404);
  }
});

test.describe("the owner's switchboard at /admin/preview", () => {
  test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
  test.use({ httpCredentials: adminCredentials });

  test("opens the engine for this browser, the cookie carries to the other language, and it closes again", async ({ page, context }) => {
    await page.goto("/admin/preview");
    const state = page.getByTestId("preview-state-engine");
    await expect(state).toHaveAttribute("data-state", "closed");

    await page.getByTestId("preview-on-engine").click();
    await expect(state).toHaveAttribute("data-state", "this-browser");
    const cookie = await previewCookie(context);
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("Lax");
    // A signature, not a flag: 43 base64url characters of HMAC-SHA256.
    expect(cookie?.value).toMatch(/^[A-Za-z0-9_-]{43}$/);
    // A year, give or take the seconds the request took.
    expect(cookie!.expires - Date.now() / 1000).toBeGreaterThan(360 * 24 * 3600);

    expect((await page.goto(PATH))?.status()).toBe(200);
    const again = await page.goto("/en/aarrr-funnel-template");
    expect(again?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await page.goto("/admin/preview");
    await page.getByTestId("preview-off-engine").click();
    await expect(page.getByTestId("preview-state-engine")).toHaveAttribute("data-state", "closed");
    expect(await previewCookie(context)).toBeUndefined();
    expect((await page.goto(PATH))?.status()).toBe(404);
  });

  test("a game preview never opens the engine", async ({ page, context }) => {
    await grantOwnerPreview(context.request, "game");
    expect((await page.goto(PATH))?.status()).toBe(404);
  });
});

test.describe("the page, with the owner's preview", () => {
  test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
  test.beforeEach(async ({ context }) => {
    await grantOwnerPreview(context.request, "engine");
  });

  test("it has one h1, stays noindex, and the island hydrates", async ({ page }) => {
    await page.goto(PATH);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.getByTestId("engine-privacy")).toBeVisible();
    const island = page.getByTestId("engine-workbench");
    await expect(island).toHaveAttribute("data-state", "ready");
    await expect(island).toHaveAttribute("data-locale", "fr");
  });

  test("it does not scroll sideways on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(PATH);
    const [scroll, client] = await page.evaluate(() => [
      document.documentElement.scrollWidth,
      document.documentElement.clientWidth,
    ]);
    expect(scroll).toBe(client);
  });
});
