import { expect, test, type Locator, type Page } from "@playwright/test";
import { renameSync } from "node:fs";
import sharp from "sharp";
import { exampleState, hybridState, withEntry, withMonthBefore } from "../src/lib/engine/__tests__/fixtures";
import type { EngineState } from "../src/lib/engine/types";
import { engineSeed } from "../e2e/engine-helpers";

/**
 * The engine's density, captured and measured — design brief 07 (CHANTIERS.md
 * B10, 2026-10-02): the screens in `design/ds-extension-07/`, its
 * `CATALOGUE.md`, and the « measurements » test, whose MEASURE lines are the
 * brief's table (where the tool starts, the setup's and the board's heights
 * and controls, one sheet). Kept so the port of the return measures the same
 * things the same way: run it again with OUT pointing elsewhere and compare.
 * Not a test suite: its own config, outside `e2e/`, so CI never runs it.
 *
 * Against a LOCAL production build with the engine open, at runtime too:
 *
 *   ENGINE_ENABLED=true GAME_ENABLED=true npm run build
 *   ENGINE_ENABLED=true GAME_ENABLED=true npx next start -p 3000 &
 *   OUT=/tmp/after npx playwright test --config scripts/engine-density.config.ts
 *
 * The data is the §6.0 example (`exampleState`); « returning » is that
 * example with four numbers back to « to do », last touched twelve days
 * before the clock (24 September 2026).
 */
const OUT = process.env.OUT ?? "design/ds-extension-07";
const DESKTOP = { width: 1280, height: 900 } as const;
const MOBILE = { width: 390, height: 844 } as const;
const CLOCK = new Date(2026, 8, 24, 12);

async function encode(path: string): Promise<void> {
  await sharp(path).png({ palette: true, quality: 85, compressionLevel: 9, effort: 8 }).toFile(`${path}.tmp`);
  renameSync(`${path}.tmp`, path);
}

async function shootViewport(page: Page, name: string): Promise<void> {
  await page.waitForTimeout(500);
  const path = `${OUT}/${name}.png`;
  await page.screenshot({ path });
  await encode(path);
}

async function unstick(page: Page): Promise<void> {
  // A tall element is captured beyond the viewport: a sticky header would be drawn across it.
  await page.evaluate(() => {
    for (const node of Array.from(document.querySelectorAll<HTMLElement>("body *"))) {
      const position = getComputedStyle(node).position;
      if (position === "sticky" || position === "fixed") node.style.setProperty("position", "static", "important");
    }
  });
}

async function shootEl(el: Locator, name: string): Promise<void> {
  await el.page().mouse.move(0, 0);
  await unstick(el.page());
  await el.page().waitForTimeout(500);
  const path = `${OUT}/${name}.png`;
  await el.screenshot({ path, animations: "disabled" });
  await encode(path);
}

async function shootFull(page: Page, name: string): Promise<void> {
  await page.waitForTimeout(500);
  const path = `${OUT}/${name}.png`;
  await page.screenshot({ path, fullPage: true });
  await encode(path);
}

async function seed(page: Page, locale: string, state: EngineState): Promise<void> {
  await page.clock.setFixedTime(CLOCK);
  await page.addInitScript(
    (items) => {
      if (sessionStorage.getItem("seeded")) return;
      for (const [key, value] of items) localStorage.setItem(key, value);
      sessionStorage.setItem("seeded", "1");
    },
    engineSeed(state),
  );
  await page.goto(`/${locale}/aarrr-funnel-template`);
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
}

/** A returning person: the §6.0 example, four numbers still to do, last touched twelve days ago. */
function returning(base: EngineState = exampleState()): EngineState {
  let state = base;
  for (const id of ["ref.referred-share", "rev.expansion", "rev.contraction", "acq.cac"] as const) state = withEntry(state, id, undefined);
  return { ...state, updatedAt: "2026-09-12T09:00:00.000Z" };
}

const SCREENS = [
  { locale: "fr", size: "desktop", viewport: DESKTOP },
  { locale: "en", size: "mobile", viewport: MOBILE },
] as const;

for (const { locale, size, viewport } of SCREENS) {
  const tag = `${locale}-${size}`;

  test(`first visit (${tag})`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.clock.setFixedTime(CLOCK);
    await page.goto(`/${locale}/aarrr-funnel-template`);
    await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
    await shootViewport(page, `01-first-visit-arrival-${tag}`);
    await shootEl(page.getByTestId("engine-setup"), `02-setup-${tag}`);
  });

  test(`step by step (${tag})`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.clock.setFixedTime(CLOCK);
    await page.goto(`/${locale}/aarrr-funnel-template`);
    await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
    await page.getByTestId("engine-setup-start").click();
    const steps = page.getByTestId("engine-steps");
    await expect(steps).toHaveAttribute("data-phase", "targets");
    await shootEl(steps, `03-steps-targets-${tag}`);
    await page.getByTestId("engine-steps-next").click();
    await expect(steps).toHaveAttribute("data-phase", "base");
    await shootEl(steps, `04-steps-base-${tag}`);
    await page.locator("#engine-base-cohort").fill("1200");
    await page.locator("#engine-base-month").fill("1400");
    await page.getByTestId("engine-steps-next").click();
    await expect(steps).toHaveAttribute("data-phase", "number");
    await shootEl(steps, `05-steps-number-untouched-${tag}`);
    await steps.locator('input[type="radio"][value="have"]').first().check();
    await steps.getByRole("button", { name: /Où le trouver|Where to find/ }).click();
    await shootEl(steps, `06-steps-number-have-open-${tag}`);
  });

  test(`what-if and done in the steps (${tag})`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await seed(page, locale, exampleState());
    await page.getByTestId("engine-open-steps").click();
    const steps = page.getByTestId("engine-steps");
    await expect(steps).toHaveAttribute("data-phase", "whatif");
    await shootEl(steps, `07-steps-whatif-${tag}`);
    await page.getByTestId("engine-steps-next").click();
    await expect(steps).toHaveAttribute("data-phase", "done");
    await shootEl(steps, `08-steps-done-${tag}`);
  });

  test(`returning (${tag})`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await seed(page, locale, returning());
    const board = page.getByTestId("engine-board");
    await expect(board).toBeVisible();
    await shootEl(board, `09-return-board-full-${tag}`);
  });

  test(`a number on the board (${tag})`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await seed(page, locale, returning());
    await page.getByTestId("engine-metric-act-rate").click();
    const sheet = page.getByTestId("engine-sheet-act-rate");
    await expect(sheet).toBeVisible();
    await shootEl(page.getByTestId("engine-stages"), `10-return-stage-sheet-${tag}`);
  });
}

test("hybrid board (fr-desktop)", async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await seed(page, "fr", returning(hybridState()));
  await shootEl(page.getByTestId("engine-board"), "12-return-hybrid-board-full-fr-desktop");
});

test("next month (en-desktop)", async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await page.clock.setFixedTime(new Date(2026, 9, 6, 12));
  const state = { ...withMonthBefore(exampleState()), updatedAt: "2026-09-24T09:00:00.000Z" };
  await page.addInitScript((items) => {
    if (sessionStorage.getItem("seeded")) return;
    for (const [key, value] of items) localStorage.setItem(key, value);
    sessionStorage.setItem("seeded", "1");
  }, engineSeed(state));
  await page.goto("/en/aarrr-funnel-template");
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
  const board = page.getByTestId("engine-board");
  await board.evaluate((el) => el.scrollIntoView({ block: "start" }));
  await page.evaluate(() => window.scrollBy(0, -130));
  await shootViewport(page, "13-return-next-month-en-desktop");
});

test("full page, first visit and return (fr-desktop, 1x)", async ({ browser }) => {
  const context = await browser.newContext({ viewport: DESKTOP, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.clock.setFixedTime(CLOCK);
  await page.goto("/fr/aarrr-funnel-template");
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
  await shootFull(page, "14-page-full-first-visit-fr-desktop-1x");
  await page.evaluate((items) => {
    for (const [key, value] of items) localStorage.setItem(key, value);
  }, engineSeed(returning()));
  await page.reload();
  await expect(page.getByTestId("engine-board")).toBeVisible();
  await shootFull(page, "15-page-full-return-fr-desktop-1x");
  await context.close();
});

test("the deck (fr-desktop)", async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await seed(page, "fr", exampleState());
  await page.getByTestId("engine-open-deck").click();
  await expect(page.getByTestId("engine-deck")).toBeVisible();
  await shootEl(page.locator('[data-testid^="slide-"]:not([data-testid^="slide-page-"])').first(), "16-deck-first-slide-fr-desktop");
});

test("to go and get, open (fr-desktop)", async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await seed(page, "fr", returning());
  const collect = page.getByTestId("engine-collect-disclosure");
  await collect.locator("summary").first().click();
  await shootEl(collect, "11-return-to-go-and-get-fr-desktop");
});

test("measurements", async ({ browser }) => {
  for (const [label, viewport] of [["1280", DESKTOP], ["390", MOBILE]] as const) {
    for (const locale of ["fr", "en"]) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      await page.clock.setFixedTime(CLOCK);
      await page.goto(`/${locale}/aarrr-funnel-template`);
      await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
      const top = (sel: string) => page.locator(sel).first().evaluate((el) => Math.round(el.getBoundingClientRect().top + window.scrollY));
      const height = (sel: string) => page.locator(sel).first().evaluate((el) => Math.round(el.getBoundingClientRect().height));
      const controls = (sel: string) =>
        page.locator(sel).first().evaluate((el) => Array.from(el.querySelectorAll("button, a[href], input, select, textarea, summary")).filter((n) => (n as HTMLElement).offsetParent !== null).length);
      const out: Record<string, number> = {};
      out.setupTop = await top('[data-testid="engine-setup"]');
      out.setupHeight = await height('[data-testid="engine-setup"]');
      out.setupControls = await controls('[data-testid="engine-setup"]');
      out.pageFirst = await page.evaluate(() => document.documentElement.scrollHeight);
      await page.evaluate((items) => { for (const [k, v] of items) localStorage.setItem(k, v); }, engineSeed(returning()));
      await page.reload();
      await expect(page.getByTestId("engine-board")).toBeVisible();
      out.boardTop = await top('[data-testid="engine-board"]');
      out.verdictTop = await top("#engine-verdict");
      out.boardHeight = await height('[data-testid="engine-board"]');
      out.boardControls = await controls('[data-testid="engine-board"]');
      out.pageReturn = await page.evaluate(() => document.documentElement.scrollHeight);
      out.boardChildren = await page.getByTestId("engine-board").evaluate((el) => el.children.length);
      await page.getByTestId("engine-metric-act-rate").click();
      out.sheetHeight = await height('[data-testid="engine-sheet-act-rate"]');
      out.sheetControls = await controls('[data-testid="engine-sheet-act-rate"]');
      console.log(`MEASURE ${locale} ${label} ${JSON.stringify(out)}`);
      await context.close();
    }
  }
});

test("the catalogue as text", async ({ page }) => {
  const { writeFileSync } = await import("node:fs");
  const parts: string[] = [];
  for (const locale of ["en", "fr"] as const) {
    await page.goto(`/${locale}/aarrr-funnel-template`);
    const md = await page.getByTestId("engine-catalogue").evaluate((root) => {
      const out: string[] = [];
      const text = (el: Element | null) => (el?.textContent ?? "").replace(/\s+/g, " ").trim();
      for (const node of Array.from(root.querySelectorAll("h3, [data-testid^='engine-stage-']"))) {
        if (node.tagName === "H3") {
          if (node.closest("[data-testid^='engine-stage-']")) continue;
          out.push(`\n### ${text(node)}\n`);
          const intro = node.parentElement?.querySelector("p");
          if (intro && intro !== node) out.push(`${text(intro)}\n`);
          continue;
        }
        const stage = node.querySelector("h4");
        if (stage) out.push(`\n#### ${text(stage)}\n`);
        const own = node.querySelector("h3");
        if (!stage && own) out.push(`\n### ${text(own)}\n`);
        for (const article of Array.from(node.querySelectorAll("article"))) {
          const primary = article.querySelector("p:first-child:not([class*='oneLiner'])");
          const name = text(article.querySelector("h5"));
          out.push(`- **${name}**${primary && primary !== article.querySelector("h5") && text(primary) !== text(article.querySelector("[class*='oneLiner']")) ? ` (${text(primary)})` : ""}`);
          const one = article.querySelector("[class*='oneLiner']");
          if (one) out.push(`  - ${text(one)}`);
          const dts = Array.from(article.querySelectorAll("dt"));
          for (const dt of dts) {
            const dd = dt.nextElementSibling;
            const items = dd ? Array.from(dd.querySelectorAll("li")) : [];
            if (items.length) {
              out.push(`  - *${text(dt)}*:`);
              for (const li of items) out.push(`    - ${text(li)}`);
            } else out.push(`  - *${text(dt)}*: ${text(dd)}`);
          }
        }
      }
      return out.join("\n");
    });
    parts.push(`## ${locale === "en" ? "English" : "Français"}\n${md}\n`);
  }
  writeFileSync(
    `${OUT}/CATALOGUE.md`,
    `# The engine's numbers, as its page prints them\n\n*Extracted on 2026-10-02 from the prerendered page (\`/en/aarrr-funnel-template\`, \`/fr/aarrr-funnel-template\`), section "The engine's numbers", folded by default. Generic slots (\`[cohort month]\`, the activation event) stand where a real setup fills in its own words. Every string is still marked "to be reviewed" in the code. This is the expertise brief 07 asks to keep: read it, do not rewrite it.*\n\n${parts.join("\n")}`,
  );
});
