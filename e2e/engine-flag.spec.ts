import { expect, test } from "./helpers";

/**
 * The growth engine's page ships closed (engine spec §11.2): `ENGINE_ENABLED`
 * is unset on the server these specs run against, so the proxy rewrites the
 * page to a 404. `?engine=preview` sets an HttpOnly cookie that opens it for
 * that browser only, `?engine=off` removes it. This is how Antoine tests the
 * page before bon à tirer nº6 — and the reason the page is noindex at build
 * time: a preview cookie must never make it indexable.
 *
 * Behaviour, not attributes: the status the browser really receives, the
 * cookie the browser really keeps, and the island really hydrating.
 */
const PATH = "/fr/aarrr-funnel-template";

test("closed by default: the engine page is a real 404", async ({ page }) => {
  const res = await page.goto(PATH);
  expect(res?.status()).toBe(404);
  await expect(page.getByTestId("engine-workbench")).toHaveCount(0);
});

test("?engine=preview opens it for this browser, and the cookie carries to the next visit", async ({ page, context }) => {
  const res = await page.goto(`${PATH}?engine=preview`);
  expect(res?.status()).toBe(200);
  const cookie = (await context.cookies()).find((c) => c.name === "tdg_engine_preview");
  expect(cookie?.httpOnly).toBe(true);

  // The other language, without the parameter: the cookie alone opens it.
  const again = await page.goto("/en/aarrr-funnel-template");
  expect(again?.status()).toBe(200);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("the preview page has one h1, stays noindex, and the island hydrates", async ({ page }) => {
  await page.goto(`${PATH}?engine=preview`);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.getByTestId("engine-privacy")).toBeVisible();
  const island = page.getByTestId("engine-workbench");
  await expect(island).toHaveAttribute("data-state", "ready");
  await expect(island).toHaveAttribute("data-locale", "fr");
});

test("?engine=off closes it again", async ({ page }) => {
  await page.goto(`${PATH}?engine=preview`);
  const res = await page.goto(`${PATH}?engine=off`);
  expect(res?.status()).toBe(404);
  const again = await page.goto(PATH);
  expect(again?.status()).toBe(404);
});

test("the preview page does not scroll sideways on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${PATH}?engine=preview`);
  const [scroll, client] = await page.evaluate(() => [
    document.documentElement.scrollWidth,
    document.documentElement.clientWidth,
  ]);
  expect(scroll).toBe(client);
});
