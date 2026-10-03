import { expect, test, type Locator, type Page } from "@playwright/test";
import { renameSync } from "node:fs";
import sharp from "sharp";
import { FILM_LEVERS, exampleState, filmState, hybridState, measured, noMarginState, ratio, withEntry, withMonthBefore } from "../src/lib/engine/__tests__/fixtures";
import type { EngineState, PlgLeverId } from "../src/lib/engine/types";
import { engineSeed, openNumber, skipToAsks } from "../e2e/engine-helpers";

/**
 * The engine's density, captured and measured — design brief 07 (CHANTIERS.md
 * B10, 2026-10-02): the screens in `design/ds-extension-07/`, its
 * `CATALOGUE.md`, and the « measurements » test, whose MEASURE lines are the
 * brief's table. Kept so the port of the return measures the same things the
 * same way: run it again with OUT pointing elsewhere and compare.
 * Not a test suite: its own config, outside `e2e/`, so CI never runs it.
 *
 * Since A18 T7 (2026-10-03) it walks the ported flows — the start card, the
 * « Cibles » screen, a number's own screen, the requests' screen, the board
 * with its list of numbers — and its MEASURE lines carry the keys of the
 * return's own measures (`design/ds-extension-07-return/board/measures.js`,
 * read the same way: CSS pixels, a control is visible when no closed
 * `<details>` holds it), so the three columns line up: before (B10, in
 * `JOURNAL.md`), the return's proposal, and the port. The before's
 * screens are in `design/ds-extension-07/`, the port's in
 * `design/ds-extension-07-after/`, numbered alike where a screen survived.
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
 *
 * Since A20 (2026-10-03) it also takes the screens of brief 09, the money
 * (`design/ds-extension-09/`), on the film's SaaS (`filmState`, engine spec
 * §20.10): the tests named « brief 09 », with their own MEASURE09 lines.
 *
 *   OUT=design/ds-extension-09 npx playwright test --config scripts/engine-density.config.ts --grep "brief 09"
 *
 * Since A20.d T7 (2026-10-03) the same tests take the port, in
 * `design/ds-extension-09-after/`, numbered alike, with their MEASURE09
 * lines in `JOURNAL.md` beside the before's. Two changes, so a screen still
 * shows what it showed: « the example without a margin » is
 * `noMarginState()` since the example has one (C50), and two screens are
 * new — the example with its margin (13, 14) and the « together » slide with
 * every lever moved (15).
 *
 *   OUT=design/ds-extension-09-after npx playwright test --config scripts/engine-density.config.ts --grep "brief 09"
 */
const OUT = process.env.OUT ?? "design/ds-extension-07-after";
/** Every self-serve lever moved, as `e2e/engine-deck-whatif.spec.ts` moves them: the densest « together » slide. */
const EVERY_LEVER: Record<PlgLeverId, number> = {
  "acq.signup-rate": 4,
  "ref.referred-share": 10,
  "act.rate": 24,
  "ret.d30": 18,
  "rev.paid-conversion": 10,
  "ret.logo-churn": 1.5,
  "rev.contraction": 0.5,
  "rev.expansion": 5,
  "rev.arpa": 150,
};
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
  // A sticky element turns `relative`, not `static`: it stays where it stands and stays the box
  // its absolute layers sit in — static, the header's edge (A19) fell to the bottom of the first
  // screen and drew a rule across the board, 900px down the page.
  await page.evaluate(() => {
    for (const node of Array.from(document.querySelectorAll<HTMLElement>("body *"))) {
      const position = getComputedStyle(node).position;
      if (position === "sticky") node.style.setProperty("position", "relative", "important");
      else if (position === "fixed") node.style.setProperty("position", "static", "important");
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
    // The start card (A18 T3.a): one question, the defaults said, « Commencer ».
    await shootEl(page.getByTestId("engine-start"), `02-start-${tag}`);
    // « Changer » opens the whole setup card, the one every visit met before.
    await page.getByTestId("engine-start-change").click();
    await shootEl(page.getByTestId("engine-setup"), `02b-setup-${tag}`);
  });

  test(`the first numbers (${tag})`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.clock.setFixedTime(CLOCK);
    await page.goto(`/${locale}/aarrr-funnel-template`);
    await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
    await page.getByTestId("engine-start-go").click();
    const targets = page.getByTestId("engine-targets-start");
    await expect(targets).toBeVisible();
    await shootEl(targets, `03-targets-${tag}`);
    // The cohort and the month are no longer a screen of their own (04 before): each number asks its own counts.
    await page.getByTestId("engine-targets-next").click();
    const number = page.getByTestId("engine-number");
    await expect(number).toBeVisible();
    await shootEl(number, `05-number-untouched-${tag}`);
    await number.locator("summary", { hasText: /Où le trouver|Where to find/ }).click();
    await shootEl(number, `06-number-where-open-${tag}`);
  });

  test(`the requests (${tag})`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.clock.setFixedTime(CLOCK);
    await page.goto(`/${locale}/aarrr-funnel-template`);
    await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
    await page.getByTestId("engine-start-go").click();
    await page.getByTestId("engine-targets-next").click();
    // The five-minute numbers passed, every request on one screen (A18 T3.c), where « done » was before.
    await skipToAsks(page);
    await shootEl(page.getByTestId("engine-asks-screen"), `07-asks-${tag}`);
  });

  test(`the lever (${tag})`, async ({ page }) => {
    // The what-if, a lever on the board (A18 T2.c), where the steps had a screen of their own.
    await page.setViewportSize(viewport);
    await seed(page, locale, exampleState());
    await expect(page.getByTestId("engine-board")).toBeVisible();
    await shootEl(page.getByTestId("engine-lever"), `08-lever-${tag}`);
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
    await expect(page.getByTestId("engine-board")).toBeVisible();
    // Its row in « Tes chiffres » opens its own screen (A18 T2.b), where the stage tabs opened it under the board.
    await openNumber(page, "act-rate");
    await shootEl(page.getByTestId("engine-number"), `10-return-number-${tag}`);
  });
}

test("hybrid board (fr-desktop)", async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await seed(page, "fr", returning(hybridState()));
  await expect(page.getByTestId("engine-board")).toBeVisible();
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

test("the next step, returning (fr-desktop)", async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await seed(page, "fr", returning());
  // « À aller chercher » folded under the board (11 before) became the next step at its top and the requests' screen.
  await expect(page.getByTestId("engine-board")).toBeVisible();
  await shootEl(page.getByTestId("engine-next"), "11-return-next-step-fr-desktop");
});

/**
 * What the return measured, read the same way on the product (`measure.cjs`'s
 * `probe`): the tool is `#engine`; a control is a button, a link, a box, a
 * select or a summary, visible, and not inside a closed `<details>` (its own
 * summary aside).
 */
function probe(selector: string) {
  const CONTROL = "button, a[href], input:not([type=hidden]), select, textarea, summary";
  const visible = (el: Element) => {
    if (el.closest("details:not([open])") && el.tagName !== "SUMMARY") return false;
    if (el.closest("details:not([open]) details")) return false;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") return false;
    return (r.width > 0 && r.height > 0) || el.matches("input[type=radio], input[type=checkbox]");
  };
  const root = document.querySelector(selector);
  const tool = document.querySelector("#engine");
  const inRoot = root ? Array.from(root.querySelectorAll(CONTROL)).filter(visible) : [];
  const inTool = tool ? Array.from(tool.querySelectorAll(CONTROL)).filter(visible) : [];
  const firstScreen = inTool.filter((el) => {
    const r = el.getBoundingClientRect();
    return r.top < innerHeight && r.bottom > 0;
  });
  const primary = Array.from(document.querySelectorAll<HTMLElement>("#engine [class*='primary']")).filter((el) => el.matches("button, a[href]") && visible(el))[0];
  return {
    toolTop: tool ? Math.round(tool.getBoundingClientRect().top + scrollY) : null,
    height: root ? Math.round(root.getBoundingClientRect().height) : null,
    controls: inRoot.length,
    controlsFirstScreen: firstScreen.length,
    primaryBottom: primary ? Math.round(primary.getBoundingClientRect().bottom + scrollY) : null,
    pageHeight: document.documentElement.scrollHeight,
  };
}

test("measurements", async ({ browser }) => {
  for (const [label, viewport] of [["1280", DESKTOP], ["390", MOBILE]] as const) {
    for (const locale of ["fr", "en"]) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      await page.clock.setFixedTime(CLOCK);
      await page.goto(`/${locale}/aarrr-funnel-template`);
      await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
      const out: Record<string, number | null> = {};
      // The first visit: where the tool starts, the start card (« the setup card » before, B10).
      const start = await page.evaluate(probe, '[data-testid="engine-start"]');
      out.firstToolAt = start.toolTop;
      out.startHeight = start.height;
      out.startControls = start.controls;
      out.pageFirst = start.pageHeight;
      // The first number reached, untouched, then its « Où le trouver » open.
      await page.getByTestId("engine-start-go").click();
      await page.getByTestId("engine-targets-next").click();
      await expect(page.getByTestId("engine-number")).toBeVisible();
      const untouched = await page.evaluate(probe, '[data-testid^="engine-sheet-"]');
      out.sheetUntouched = untouched.height;
      out.sheetControls = untouched.controls;
      // How many screens from « Commencer » to the requests: the start, the targets, each number skipped, the requests.
      let screens = 3;
      const asks = page.getByTestId("engine-asks");
      while (!(await asks.count()) && screens < 60) {
        await page.getByTestId("engine-number-skip").click();
        await expect(page.getByTestId("engine-number").or(asks)).toBeVisible();
        screens += 1;
      }
      out.screensToAsks = screens;

      // Returning: the short page, the board, its first screen and its primary.
      await page.evaluate((items) => {
        localStorage.clear();
        for (const [k, v] of items) localStorage.setItem(k, v);
      }, engineSeed(returning()));
      await page.reload();
      await expect(page.getByTestId("engine-board")).toBeVisible();
      await page.evaluate(() => window.scrollTo(0, 0));
      const board = await page.evaluate(probe, '[data-testid="engine-board"]');
      out.returnToolAt = board.toolTop;
      out.returnFirstControls = board.controlsFirstScreen;
      out.returnPrimaryBottom = board.primaryBottom;
      out.boardHeight = board.height;
      out.boardControls = board.controls;
      out.pageReturn = board.pageHeight;
      out.verdictTop = await page.locator("#engine-verdict").evaluate((el) => Math.round(el.getBoundingClientRect().top + window.scrollY));
      // A number open from the board, « Où le trouver » open (« number-open » in the return: where, trap,
      // reference), then every fold open — « Ta définition et une note » too, which the return kept shut.
      const settle = async () => {
        // A fold opens with a transition: measured once every one has ended, or the height is the animation's.
        await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => undefined))));
        await page.waitForTimeout(300);
      };
      await openNumber(page, "act-rate");
      const number = page.getByTestId("engine-number");
      await number.locator("summary", { hasText: /Où le trouver|Where to find/ }).click();
      await settle();
      const open = await page.evaluate(probe, '[data-testid="engine-sheet-act-rate"]');
      out.sheetOpen = open.height;
      await number.evaluate((root) => {
        for (const d of Array.from(root.querySelectorAll("details"))) (d as HTMLDetailsElement).open = true;
      });
      await settle();
      const all = await page.evaluate(probe, '[data-testid="engine-sheet-act-rate"]');
      out.sheetAllOpen = all.height;
      out.sheetAllOpenControls = all.controls;
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

// --- Brief 09 (A20, 2026-10-03): the money, on the film's SaaS -------------------------------

/** The film's SaaS with its three levers moved: the « Et si » the film plays. */
function filmWithLevers(): EngineState {
  return { ...filmState(), whatIf: { ...FILM_LEVERS } };
}

/** The §18.9 hybrid with a sales-assisted margin of 75 %: both engines carry their money. */
function hybridWithMargins(): EngineState {
  let state = hybridState();
  for (const [id, value] of [
    ["rev.gross-margin", ratio(36_000, 48_000)],
    ["slg.rev.gross-margin", ratio(135_000, 180_000)],
  ] as const)
    state = withEntry(state, id, measured(value));
  return state;
}

async function openWhatIf(page: Page): Promise<Locator> {
  const fold = page.getByTestId("engine-board-whatif");
  await fold.evaluate((el) => ((el as HTMLDetailsElement).open = true));
  await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => undefined))));
  return fold;
}

async function openDeck(page: Page): Promise<void> {
  await page.getByTestId("engine-open-deck").click();
  await expect(page.getByTestId("engine-deck")).toBeVisible();
}

for (const { locale, size, viewport } of SCREENS) {
  const tag = `${locale}-${size}`;

  test(`brief 09: the board and its lever (${tag})`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await seed(page, locale, filmState());
    const board = page.getByTestId("engine-board");
    await expect(board).toBeVisible();
    await shootEl(board, `01-board-full-${tag}`);
    await shootEl(page.getByTestId("engine-lever"), `02-lever-${tag}`);
    await openWhatIf(page);
    await shootEl(page.getByTestId("engine-whatif-panel"), `03-whatif-panel-${tag}`);
  });

  test(`brief 09: the film's three levers (${tag})`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await seed(page, locale, filmWithLevers());
    await expect(page.getByTestId("engine-board")).toBeVisible();
    await shootEl(page.getByTestId("engine-lever"), `04-lever-moved-${tag}`);
    await openWhatIf(page);
    await shootEl(page.getByTestId("engine-whatif-panel"), `05-whatif-three-levers-${tag}`);
  });

  test(`brief 09: the slides (${tag})`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await seed(page, locale, filmWithLevers());
    await openDeck(page);
    await shootEl(page.getByTestId("slide-unit-economics"), `06-slide-unit-economics-${tag}`);
    await shootEl(page.locator('[data-testid="slide-whatif:ret.logo-churn"]'), `07-slide-whatif-one-lever-${tag}`);
    await shootEl(page.getByTestId("slide-scenario"), `08-slide-scenario-${tag}`);
  });

  test(`brief 09: the page's promise (${tag})`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.clock.setFixedTime(CLOCK);
    await page.goto(`/${locale}/aarrr-funnel-template`);
    await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
    await shootViewport(page, `09-page-arrival-${tag}`);
  });
}

test("brief 09: the example without a margin, its unit economics (fr-desktop)", async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  // The example as it was before C50 gave it a margin.
  await seed(page, "fr", noMarginState());
  await openDeck(page);
  await shootEl(page.getByTestId("slide-unit-economics"), "10-slide-unit-economics-no-margin-fr-desktop");
});

for (const { locale, size, viewport } of SCREENS) {
  const tag = `${locale}-${size}`;
  test(`brief 09: the example with its estimated margin, C50 (${tag})`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await seed(page, locale, exampleState());
    await expect(page.getByTestId("engine-board")).toBeVisible();
    await shootEl(page.getByTestId("engine-money-plg"), `13-example-money-${tag}`);
    await openDeck(page);
    await shootEl(page.getByTestId("slide-unit-economics"), `14-example-slide-unit-economics-${tag}`);
  });

  test(`brief 09: the « together » slide, every lever moved (${tag})`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await seed(page, locale, { ...withEntry(exampleState(), "ret.d30", measured(ratio(120, 800))), whatIf: EVERY_LEVER });
    await openDeck(page);
    await shootEl(page.getByTestId("slide-scenario"), `15-slide-scenario-every-lever-${tag}`);
  });
}

test("brief 09: the hybrid, both engines with a margin (fr-desktop)", async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await seed(page, "fr", hybridWithMargins());
  const board = page.getByTestId("engine-board");
  await expect(board).toBeVisible();
  await shootEl(board, "11-hybrid-board-full-fr-desktop");
  await openDeck(page);
  await shootEl(page.getByTestId("slide-unit-economics"), "12-slide-unit-both-fr-desktop");
});

/** The board and the full « Et si » panel, on the film's SaaS: what A20 must not make denser (brief 07's measures). */
test("brief 09: measurements", async ({ browser }) => {
  for (const [label, viewport] of [["1280", DESKTOP], ["390", MOBILE]] as const) {
    for (const locale of ["fr", "en"]) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      await seed(page, locale, filmState());
      await expect(page.getByTestId("engine-board")).toBeVisible();
      await page.evaluate(() => window.scrollTo(0, 0));
      const out: Record<string, number | null> = {};
      const board = await page.evaluate(probe, '[data-testid="engine-board"]');
      out.boardHeight = board.height;
      out.boardControls = board.controls;
      out.boardFirstControls = board.controlsFirstScreen;
      out.leverTop = await page.getByTestId("engine-lever").evaluate((el) => Math.round(el.getBoundingClientRect().top + window.scrollY));
      const lever = await page.evaluate(probe, '[data-testid="engine-lever"]');
      out.leverHeight = lever.height;
      out.leverControls = lever.controls;
      await openWhatIf(page);
      await page.waitForTimeout(300);
      const panel = await page.evaluate(probe, '[data-testid="engine-whatif-panel"]');
      out.panelHeight = panel.height;
      out.panelControls = panel.controls;
      const open = await page.evaluate(probe, '[data-testid="engine-board"]');
      out.boardOpenHeight = open.height;
      out.boardOpenControls = open.controls;
      console.log(`MEASURE09 ${locale} ${label} ${JSON.stringify(out)}`);
      await context.close();
    }
  }
});
