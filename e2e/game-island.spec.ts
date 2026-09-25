import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, test, trackedEvents } from "./helpers";
import { LEVEL_PATH, hangUp, pickUpCall, playQuarter, seedGame } from "./game-helpers";
import { PATH_A, PATH_C, PATH_D, playPath } from "../src/lib/game/__tests__/paths";

/**
 * The island, smoke-tested on a production build (game plan G8a): the first
 * screen as prerendered, one full quarter, the resume paths — a reload, a
 * language switch, a finished year — and axe at the two phases a URL alone
 * cannot reach (the report and December). The long paths (P6-P9, P13-P16,
 * P20) belong to chantier G8b; this file holds the island to its own
 * contract so it cannot ship without a single browser having played it.
 *
 * The game must be OPEN for this run (`GAME_ENABLED: "true"`, as in CI).
 * Without it the level page is a 404 and every spec here would fail for a
 * reason that says nothing about the island, so they skip instead (R-11).
 */
const GAME_OPEN = process.env.GAME_ENABLED === "true";
test.skip(!GAME_OPEN, "GAME_ENABLED is not \"true\" for this run — the level page is closed.");

async function axeSeriousOrCritical(page: Page): Promise<string[]> {
  // Both grounds are gradients (the page's and the night band's): axe files
  // text over a gradient as "incomplete", never as a violation. Flattened to
  // their base colour, it measures them (accessibility.spec.ts explains).
  await page.addStyleTag({ content: "body, [data-world] { background-image: none !important; }" });
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  return violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .flatMap((v) =>
      v.nodes
        // The logotype's red GROWTH, exempt under WCAG 1.4.3 and matched on its
        // own markup, never on its colour pair (accessibility.spec.ts).
        .filter((n) => !(v.id === "color-contrast" && /^<span[^>]*>GROWTH<\/span>$/.test(n.html.trim())))
        .map((n) => `${v.id} on ${n.target.join(" ")}`),
    );
}

test.describe("the first screen, as prerendered", () => {
  test("the first call is open, the hand is locked, the two secret tiles carry no value", async ({ page, request }) => {
    const html = await (await request.get(LEVEL_PATH.fr)).text();
    // The HTML a crawler and a first paint get is the year's first call —
    // not a skeleton, not the resume prompt (plan E16).
    expect(html).toContain('data-testid="game-call"');
    expect(html).toContain('data-state="open"');
    expect(html).not.toContain('data-testid="game-resume"');

    await page.goto(LEVEL_PATH.fr);
    await expect(page.getByTestId("game-call")).toHaveAttribute("data-state", "open");
    await expect(page.getByTestId("game-card-pause")).toBeDisabled();
    await expect(page.getByTestId("game-actionbar")).toHaveCount(0);
    for (const id of ["game-dash-trust", "game-dash-radar"]) {
      await expect(page.getByTestId(id)).not.toContainText(/\d/);
    }
    // A fresh year is counted once, as a direct arrival.
    await expect.poll(() => trackedEvents(page)).toContain("game_started/retention/direct");
  });

  test("?from= is read, counted and then removed from the address", async ({ page }) => {
    await page.goto(`${LEVEL_PATH.en}?from=result`);
    await expect.poll(() => trackedEvents(page)).toContain("game_started/retention/result");
    await expect.poll(() => page.url()).not.toContain("from=");
  });
});

test.describe("one quarter", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("hang up, pick two, run: the report says what happened, once", async ({ page }) => {
    await page.goto(LEVEL_PATH.en);
    await hangUp(page);
    await expect(page.getByTestId("game-hand")).toBeVisible();
    // The focus follows the gesture to the hand's title (plan §3.5).
    await expect(page.locator("#game-hand-title")).toBeFocused();
    // One « Reread the CEO's message », the call's own — never a second one in the hand.
    await expect(page.getByTestId("game-reread")).toHaveCount(1);

    await playQuarterFromHand(page, PATH_A[0]!);
    const report = page.getByTestId("game-report-1");
    await expect(report).toBeVisible();
    await expect(report.locator("h2").first()).toBeFocused();
    await expect(page.getByTestId("game-live")).toContainText("End of quarter 1");
    await expect(page.getByTestId("game-actionbar")).toHaveCount(0);

    const events = await trackedEvents(page);
    expect(events.indexOf("game_hangup/1")).toBeGreaterThan(-1);
    expect(events.indexOf("game_quarter/1")).toBeGreaterThan(events.indexOf("game_hangup/1"));

    await pickUpCall(page);
    await expect(page.getByTestId("game-call")).toBeFocused();
    await expect(page.getByTestId("game-journal-1")).toBeVisible();
  });

  test("one live region: a card that lengthens the path is said there, the pill stays silent (plan E5)", async ({ page }) => {
    await page.goto(LEVEL_PATH.en);
    await hangUp(page);
    // The island's region is the only one in the night band.
    await expect(page.getByTestId("game-island").locator("[aria-live]")).toHaveCount(1);
    await expect(page.getByTestId("game-clicks")).not.toHaveAttribute("aria-live", /.*/);

    await page.getByTestId("game-card-bury").click();
    await expect(page.getByTestId("game-clicks")).toHaveAttribute("data-clicks", "5");
    await expect(page.getByTestId("game-live")).toContainText("5 clicks to cancel · the law expects a direct path");
    await page.getByTestId("game-card-bury").click();
    await expect(page.getByTestId("game-live")).toContainText("2 clicks to cancel");
  });

  for (const width of [1280, 390]) {
    test(`the sentence about what happens next is said once, by the hand (${width}px)`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.goto(LEVEL_PATH.en);
      await hangUp(page);
      const next = page.getByTestId("game-island").getByText("Three months are about to pass", { exact: false });
      // Fewer than two cards: nothing says the months are about to pass.
      await expect(next).toHaveCount(0);
      for (const card of PATH_A[0]!) await page.getByTestId(`game-card-${card}`).click();
      await expect(next).toHaveCount(1);
      await expect(page.locator("#game-hand-hint")).toContainText("Three months are about to pass");
    });
  }

  async function playQuarterFromHand(page: Page, picks: readonly [string, string]) {
    for (const card of picks) await page.getByTestId(`game-card-${card}`).click();
    await expect(page.getByTestId("game-run")).toBeEnabled();
    await page.getByTestId("game-run").click();
  }
});

test.describe("the months, with motion on", () => {
  test.use({ contextOptions: { reducedMotion: "no-preference" } });

  test("« Lancer » takes the focus to the dashboard, the months scroll, then the report", async ({ page }) => {
    await page.goto(LEVEL_PATH.fr);
    await hangUp(page);
    for (const card of PATH_A[0]!) await page.getByTestId(`game-card-${card}`).click();
    await page.getByTestId("game-run").click();
    await expect(page.getByTestId("game-dashboard")).toBeFocused();
    await expect(page.getByTestId("game-desk")).toHaveAttribute("data-phase", "running");
    await expect(page.getByTestId("game-report-1")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByTestId("game-desk")).toHaveAttribute("data-phase", "report");
  });
});

test.describe("coming back to a year", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("a reload asks « Reprendre ? », and resuming lands on the last report", async ({ page }) => {
    await page.goto(LEVEL_PATH.fr);
    await playQuarter(page, PATH_A[0]!);
    const churnAfterQ1 = (await page.getByTestId("game-dash-churn").textContent()) ?? "";
    // Not January's 6,0 %: otherwise the comparison below would pass on a fresh year.
    expect(churnAfterQ1).toContain("5,7");
    await page.reload();
    await expect(page.getByTestId("game-resume")).toBeVisible();
    // The question is asked in front of the saved year, not a fresh January:
    // the tiles and the journal read as the player left them.
    await expect(page.getByTestId("game-dash-churn")).toHaveText(churnAfterQ1);
    await expect(page.getByTestId("game-journal-1")).toBeVisible();
    await page.getByTestId("game-resume-accept").click();
    await expect(page.getByTestId("game-report-1")).toBeVisible();
    await expect.poll(() => trackedEvents(page)).toContain("game_resume/resume");
    // A resumed year is not a new one.
    expect(await trackedEvents(page)).not.toContain("game_started/retention/direct");
  });

  test("« Recommencer » clears the save and opens the first call", async ({ page }) => {
    await seedGame(page, playPath(PATH_A)[2]!);
    await page.getByTestId("game-resume-restart").click();
    await expect(page.getByTestId("game-call")).toHaveAttribute("data-state", "open");
    await expect(page.getByTestId("game-journal")).toHaveCount(0);
    await page.reload();
    await expect(page.getByTestId("game-resume")).toHaveCount(0);
  });

  test("switching language mid-quarter keeps the year, without asking", async ({ page }) => {
    await page.goto(LEVEL_PATH.en);
    await playQuarter(page, PATH_A[0]!);
    await pickUpCall(page);
    await hangUp(page);
    await page.getByTestId(`game-card-${PATH_A[1]![0]}`).click();

    await page.getByRole("group", { name: "Language" }).getByRole("link", { name: "FR" }).click();
    await page.waitForURL(/\/fr\/game\/retention/);
    await expect(page.getByTestId("game-resume")).toHaveCount(0);
    await expect(page.getByTestId("game-hand")).toBeVisible();
    await expect(page.getByTestId(`game-card-${PATH_A[1]![0]}`)).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("game-journal-1")).toContainText("Trimestre 1");
    await expect(page.getByTestId("game-live")).toContainText("Année reprise");
    await expect.poll(() => page.url()).not.toContain("resume=");
  });

  test("a finished year offers to review December, without replaying the stamp", async ({ page }) => {
    await seedGame(page, playPath(PATH_C).at(-1)!, LEVEL_PATH.en);
    await page.getByTestId("game-resume-accept").click();
    await expect(page.getByTestId("game-ending")).toBeVisible();
    await expect(page.getByTestId("game-call")).toHaveAttribute("data-state", "ended");
    await expect(page.getByTestId("game-hand")).toHaveCount(0);
    // Where the hand stood: the year is closed, nothing to run (brief P9).
    await expect(page.getByTestId("game-year-closed")).toContainText("Year over");
    await expect(page.getByTestId("game-run")).toHaveCount(0);
  });

  test("a year cut short says so where the hand stood (brief P9)", async ({ page }) => {
    await seedGame(page, playPath(PATH_D).at(-1)!);
    await page.getByTestId("game-resume-accept").click();
    await expect(page.getByTestId("game-ending")).toBeVisible();
    await expect(page.getByTestId("game-year-closed")).toHaveAttribute("data-fired", "true");
    await expect(page.getByTestId("game-year-closed")).toContainText("Année interrompue");
    await expect(page.getByTestId("game-run")).toHaveCount(0);
  });
});

test.describe("axe at the phases a URL cannot reach", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  for (const [name, width] of [["desktop", 1280], ["phone", 390]] as const) {
    test(`the report (${name})`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await seedGame(page, playPath(PATH_C)[3]!);
      await page.getByTestId("game-resume-accept").click();
      await expect(page.getByTestId("game-report-3")).toBeVisible();
      expect(await axeSeriousOrCritical(page)).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
    });

    test(`December (${name})`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await seedGame(page, playPath(PATH_A).at(-1)!);
      await page.getByTestId("game-resume-accept").click();
      await expect(page.getByTestId("game-ending")).toBeVisible();
      expect(await axeSeriousOrCritical(page)).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
    });
  }
});
