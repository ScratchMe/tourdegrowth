import type { Page } from "@playwright/test";
import { ENGINE_COPY } from "@/content/engine-copy";
import { QUESTIONS } from "../src/content/copy-library";
import { tourResult } from "../src/lib/engine/__tests__/fixtures";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test, trackedEvents } from "./helpers";

/**
 * Linking a Tour after the fact — CHANTIERS.md A7.5, decided by Antoine on
 * 2026-09-29 (C8, ENGINE.md §8.5).
 *
 * The box « Comparer avec ce Tour » used to exist only on the setup card: a
 * Tour taken after the engine was started, or a box unticked by mistake, could
 * never be linked, and the board then showed nothing. Now the mirror has a
 * third state, `unlinked`, with « Relier ce Tour », and the settings carry the
 * box to link or unlink. Unlinking never takes the Tour off the device, and
 * linking only READS `tdg.results.v1` (D13): nothing is sent — checked on
 * every request the page makes.
 */
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/** Every answer given, so `tdg.results.v1` accepts it and the mirror has a verdict per bridge. */
const TOUR = tourResult(Object.fromEntries(QUESTIONS.map((q, i) => [q.id, (i % 3) as 0 | 1 | 2])));

/**
 * The fixture's Tour is dated 1 September: the day French writes « 1er ».
 * The mirror and the Settings card name the same Tour, so they print the same
 * day, through the engine's formatter (the mirror once formatted it by hand,
 * in `en-GB` and without « 1er » — found by `relecteur-copie`, 2026-09-30).
 */
const TOUR_DAY = { fr: "1er septembre 2026", en: "September 1, 2026" } as const;

async function startWithoutTour(page: Page, locale: "fr" | "en") {
  await page.goto(`/${locale}/aarrr-funnel-template`);
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
  await page.getByTestId("engine-setup-board").click();
  await expect(page.getByTestId("engine-board")).toBeVisible();
}

async function mirrorState(page: Page) {
  return page.getByTestId("engine-mirror").getAttribute("data-state");
}

for (const locale of ["fr", "en"] as const) {
  for (const width of [1280, 390]) {
    test(`${locale} at ${width}px: a Tour taken after the engine started can be linked from the board`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const sent: string[] = [];
      page.on("request", (r) => {
        if (r.method() !== "GET") sent.push(`${r.method()} ${r.url()}`);
      });

      // No Tour yet: the mirror invites to take one.
      await startWithoutTour(page, locale);
      await expect(page.getByTestId("engine-mirror")).toHaveAttribute("data-state", "none");

      // The Tour is taken meanwhile (its result lands on the device), and the reader comes back.
      await page.evaluate((tour) => localStorage.setItem("tdg.results.v1", JSON.stringify([tour])), TOUR);
      await page.reload();
      await expect(page.getByTestId("engine-board")).toBeVisible();
      const mirror = page.getByTestId("engine-mirror");
      await expect(mirror).toHaveAttribute("data-state", "unlinked");
      await expect(mirror).toContainText(`${TOUR.total}/100`);
      await expect(mirror).toContainText(TOUR_DAY[locale]);
      await expect(mirror.getByRole("button", { name: ENGINE_COPY.mirror.link[locale] })).toBeVisible();

      await page.getByTestId("mirror-link-tour").click();
      await expect(mirror).toHaveAttribute("data-state", "linked");
      await expect(mirror).toContainText(TOUR_DAY[locale]);
      await expect.poll(() => trackedEvents(page)).toContain("engine_tour_linked");
      // It holds across a reload: the link is in the engine's state, the Tour untouched.
      await page.reload();
      await expect(page.getByTestId("engine-mirror")).toHaveAttribute("data-state", "linked");
      const stored = await page.evaluate(() => localStorage.getItem("tdg.results.v1"));
      expect(JSON.parse(stored!)).toEqual([TOUR]);

      // Linking reads the device and sends nothing.
      expect(sent.filter((s) => !s.includes("/count"))).toEqual([]);
      const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
      expect(sw).toBe(cw);
    });
  }

  test(`${locale}: the settings link and unlink the Tour, and unlinking keeps it on the device`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await startWithoutTour(page, locale);
    await page.evaluate((tour) => localStorage.setItem("tdg.results.v1", JSON.stringify([tour])), TOUR);
    await page.reload();
    await expect(await mirrorState(page)).toBe("unlinked");

    // Link from the settings.
    await page.getByTestId("engine-bar-settings").click();
    const box = page.getByTestId("engine-setup-tour").getByRole("checkbox");
    await expect(page.getByTestId("engine-setup-tour")).toContainText(TOUR_DAY[locale]);
    await expect(box).not.toBeChecked();
    await box.check();
    await page.getByTestId("engine-settings-save").click();
    await expect(page.getByTestId("engine-mirror")).toHaveAttribute("data-state", "linked");

    // Unlink from the settings: the hint says the Tour stays, and it does.
    await page.getByTestId("engine-bar-settings").click();
    await expect(box).toBeChecked();
    await box.uncheck();
    await expect(page.getByTestId("engine-settings-unlink-hint")).toHaveText(ENGINE_COPY.setup.tourUnlinkHint[locale]);
    await page.getByTestId("engine-settings-save").click();
    await expect(page.getByTestId("engine-mirror")).toHaveAttribute("data-state", "unlinked");
    const stored = await page.evaluate(() => localStorage.getItem("tdg.results.v1"));
    expect(JSON.parse(stored!)).toEqual([TOUR]);
  });
}
