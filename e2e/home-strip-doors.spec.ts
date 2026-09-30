import { expect, test, trackedEvents } from "./helpers";

/**
 * The landing's strip as doors, and the band's pills measured — CHANTIERS.md
 * A7.9, decided by Antoine on 2026-09-29 (C15). And the hero's sample button
 * following the preview's tone (C24, 2026-09-30).
 *
 * An open card is ONE link, its name stretched over the card: a click
 * anywhere on it lands, a screen reader hears one name, and each click is
 * counted with `home_strip`. A closed leg has no link at all. The band's
 * engine and game pills count theirs with `space_band`.
 *
 * The run's own build decides what is open: the CI builds the game open and
 * the engine closed, so the engine's card is the closed case here, and the
 * game's the open one. A build with the game closed skips the game's door and
 * checks that its card has no link instead.
 */
const GAME_OPEN = process.env.GAME_ENABLED === "true";

/** A click that must not navigate: the event is fired on click, and the page it opens is another spec's. */
async function holdNavigation(page: import("@playwright/test").Page) {
  await page.evaluate(() => document.addEventListener("click", (e) => e.preventDefault(), { capture: true, once: true }));
}

for (const locale of ["fr", "en"] as const) {
  for (const width of [1280, 390]) {
    test(`${locale} at ${width}px: the Tour's card is one link to /quiz, counted as home_strip`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${locale}`);
      const card = page.getByTestId("space-strip-tour");
      // One link per card, named by the space — not the card's whole text.
      await expect(card.getByRole("link")).toHaveCount(1);
      const link = page.getByTestId("space-strip-link-tour");
      await expect(link).toHaveAttribute("href", "/quiz");
      await expect(link).toHaveAccessibleName(locale === "fr" ? "Le diagnostic" : "The check-up");
      // The whole card is the click target: its corner, not its name.
      await holdNavigation(page);
      await card.scrollIntoViewIfNeeded();
      const box = (await card.boundingBox())!;
      await page.mouse.click(box.x + box.width - 12, box.y + box.height - 12);
      await expect.poll(() => trackedEvents(page)).toContain("tour_entry_clicked/home_strip");
      // A click is not a start: the funnel's denominator is not fired from here.
      expect(await trackedEvents(page)).not.toContain("quiz_started");
    });
  }

  test(`${locale}: a closed leg's card has no link — the engine, closed in this build`, async ({ page }) => {
    await page.goto(`/${locale}`);
    const engine = page.getByTestId("space-strip-engine");
    await expect(engine).toHaveAttribute("data-state", "soon");
    await expect(engine.getByRole("link")).toHaveCount(0);
  });

  test(`${locale}: the game's card and the band's game pill are doors, each counted apart`, async ({ page }) => {
    const card = page.getByTestId("space-strip-game");
    if (!GAME_OPEN) {
      await page.goto(`/${locale}`);
      await expect(card).toHaveAttribute("data-state", "soon");
      await expect(card.getByRole("link")).toHaveCount(0);
      return;
    }
    await page.goto(`/${locale}`);
    const link = page.getByTestId("space-strip-link-game");
    await expect(link).toHaveAttribute("href", `/${locale}/game`);
    await holdNavigation(page);
    await link.click();
    await expect.poll(() => trackedEvents(page)).toContain("game_entry_clicked/home_strip");

    const pill = page.getByTestId("space-band").locator('[data-stop="game"] a');
    await expect(pill).toHaveAttribute("href", `/${locale}/game`);
    await holdNavigation(page);
    await pill.click();
    await expect.poll(() => trackedEvents(page)).toContain("game_entry_clicked/space_band");
    // The Tour's own pill on this page is the current one: not a link, not counted.
    await expect(page.getByTestId("space-band").locator('[data-stop="tour"] a')).toHaveCount(0);
  });

  test(`${locale}: the sample button follows the preview's tone (C24)`, async ({ page }) => {
    await page.goto(`/${locale}`);
    const cta = page.getByTestId("hero-sample-cta");
    await expect(cta).toHaveAttribute("href", "/r/sample");
    // The preview's tone toggle: two pressed/unpressed buttons, « Direct » then « Roast ».
    const toggle = page.getByTestId("preview-card").getByRole("group").getByRole("button");
    await toggle.nth(1).click();
    await expect(cta).toHaveAttribute("href", "/r/sample?tone=roast");
    await toggle.nth(0).click();
    await expect(cta).toHaveAttribute("href", "/r/sample");
  });
}

test("a hover underlines the card's name, and a keyboard focus rings the whole card", async ({ page }) => {
  await page.goto("/en");
  const card = page.getByTestId("space-strip-tour");
  const link = page.getByTestId("space-strip-link-tour");
  await expect(link).toHaveCSS("text-decoration-line", "none");
  await card.hover();
  await expect(link).toHaveCSS("text-decoration-line", "underline");
  await page.mouse.move(0, 0);
  await link.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(card).not.toHaveCSS("outline-style", "none");
});
