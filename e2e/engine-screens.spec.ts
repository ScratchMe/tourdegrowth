import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { exampleState, hybridState, withEntry } from "../src/lib/engine/__tests__/fixtures";
import type { EngineState } from "../src/lib/engine/types";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test } from "./helpers";
import { openEngineMenu, skipToAsks, writeEngineSeed } from "./engine-helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the
// owner's signed preview, minted by /admin/preview (e2e/helpers.ts).
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/**
 * The simplified engine, screen by screen (A18 T7): the start card and its
 * full setup, the « Cibles » screen, a number's screen untouched and with
 * every fold of its knowledge open, the requests, the returning board with
 * its menu shut and open, the settings, and the hybrid board under its total
 * — in both languages, at 1 280, 390 and 320px. On each:
 *
 *   - axe finds no serious or critical violation (contrast included) in the
 *     tool;
 *   - every control a person can see takes a 44px tap through its middle,
 *     down and across (across: its own width when it is narrower, a text
 *     button's strip aside) — what a finger meets, measured with
 *     `elementFromPoint`, so a quiet button's transparent strip counts and a
 *     neighbour that covers it does not;
 *   - nothing pushes the page sideways — held at 390 and 1 280, measured and
 *     reported at 320 (§18.10.3: « à 320, mesure seulement »).
 *
 * Each step of the port held these on its own screens; this walks them all
 * once more, as one person would, after the last step.
 *
 * Non-vacuity, measured on 2026-10-03: the first run failed for real, at
 * every width and in both languages — the setup's company field took 42.5px
 * down, the number fields 38: the field's box is drawn 48px (44 small), but
 * its 3px edge was the box's, and a tap there reached nothing. Fixed in
 * `core/Field.module.css`, where the control now reaches over the edge; its
 * pixels are unchanged. The width checks' own non-vacuity is
 * engine-mobile.spec.ts's.
 */

const CLOCK = new Date(2026, 8, 24, 12);

/** The §6.0 example with four numbers back to « to do », last touched twelve days before the clock. */
function returning(base: EngineState = exampleState()): EngineState {
  let state = base;
  for (const id of ["ref.referred-share", "rev.expansion", "rev.contraction", "acq.cac"] as const) state = withEntry(state, id, undefined);
  return { ...state, updatedAt: "2026-09-12T09:00:00.000Z" };
}

interface Small {
  label: string;
  down: number;
  across: number;
}

/**
 * Every visible control inside `scope` whose tap strip through its middle is
 * under 44px down, or under min(44, its width) across. A radio or a checkbox
 * is reached through its label, the way a finger reaches it.
 */
function smallTargets(page: Page, scope: string): Promise<{ checked: number; small: Small[] }> {
  return page.evaluate((scope) => {
    const root = document.querySelector(scope);
    if (!root) return { checked: 0, small: [] };
    const controls = Array.from(root.querySelectorAll<HTMLElement>("button, a[href], input:not([type=hidden]), select, textarea, summary"));
    const small: Small[] = [];
    let checked = 0;
    for (const control of controls) {
      if (control.closest("details:not([open])") && control.tagName !== "SUMMARY") continue;
      if (control.closest("details:not([open]) details")) continue;
      const choice = control.matches("input[type=radio], input[type=checkbox]");
      const target: HTMLElement | null = choice ? (control as HTMLInputElement).labels?.[0] ?? null : control;
      if (!target || !target.checkVisibility()) continue;
      const box = target.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) continue;
      target.scrollIntoView({ block: "center", inline: "center" });
      const r = target.getBoundingClientRect();
      const reaches = (x: number, y: number) => {
        const hit = document.elementFromPoint(x, y);
        return !!hit && (hit === target || target.contains(hit) || hit === control || control.contains(hit));
      };
      const extent = (axis: "x" | "y") => {
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        let hits = 0;
        for (let d = -40; d <= 40; d += 0.5) if (reaches(axis === "x" ? cx + d : cx, axis === "y" ? cy + d : cy)) hits += 1;
        return hits * 0.5;
      };
      checked += 1;
      const down = extent("y");
      const across = extent("x");
      if (down < 43.5 || across < Math.min(43.5, r.width - 1)) {
        const named = (target.getAttribute("aria-label") || target.textContent || "").trim().slice(0, 40);
        small.push({ label: named || `${target.tagName.toLowerCase()}${target.id ? `#${target.id}` : ""}`, down, across });
      }
    }
    window.scrollTo(0, 0);
    return { checked, small };
  }, scope);
}

async function overflow(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

async function seed(page: Page, state: EngineState): Promise<void> {
  await writeEngineSeed(page, state);
  await page.reload();
  await expect(page.getByTestId("engine-board")).toBeVisible();
}

/** The tool's screens in the order a person meets them, each handed to `check` with the scope it lives in. */
async function walk(page: Page, locale: "fr" | "en", check: (name: string, scope: string) => Promise<void>): Promise<void> {
  await page.clock.setFixedTime(CLOCK);
  await page.goto(`/${locale}/aarrr-funnel-template`);
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
  await check("start", '[data-testid="engine-start"]');
  await page.getByTestId("engine-start-change").click();
  await expect(page.getByTestId("engine-setup")).toBeVisible();
  await check("setup", '[data-testid="engine-setup"]');
  await page.getByTestId("engine-setup-start").click();
  await expect(page.getByTestId("engine-targets-start")).toBeVisible();
  await check("targets", '[data-testid="engine-targets-start"]');
  await page.getByTestId("engine-targets-next").click();
  const number = page.getByTestId("engine-number");
  await expect(number).toBeVisible();
  await check("number", '[data-testid="engine-number"]');
  await number.evaluate((root) => {
    for (const d of Array.from(root.querySelectorAll("details"))) (d as HTMLDetailsElement).open = true;
  });
  await check("number, every fold open", '[data-testid="engine-number"]');
  await skipToAsks(page);
  await check("requests", '[data-testid="engine-asks-screen"]');

  await seed(page, returning());
  await check("board", '[data-testid="engine-board"]');
  await openEngineMenu(page);
  await check("board, menu open", '[data-testid="engine-board"]');
  await page.getByTestId("engine-bar-settings").click();
  await expect(page.getByTestId("engine-settings")).toBeVisible();
  await check("settings", '[data-testid="engine-settings"]');
  await seed(page, returning(hybridState()));
  await check("hybrid board", '[data-testid="engine-board"]');
}

for (const locale of ["fr", "en"] as const) {
  for (const [width, height] of [
    [1280, 900],
    [390, 844],
  ] as const) {
    test(`${locale} at ${width}: every screen — no contrast or serious violation, 44px taps, nothing sideways`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.setViewportSize({ width, height });
      const seen: string[] = [];
      await walk(page, locale, async (name, scope) => {
        const axe = await new AxeBuilder({ page }).include(scope).analyze();
        const serious = axe.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
        expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`), `${name}: axe`).toEqual([]);
        const { checked, small } = await smallTargets(page, scope);
        expect(checked, `${name}: controls checked`).toBeGreaterThan(0);
        expect(small, `${name}: tap strips under 44px`).toEqual([]);
        expect(await overflow(page), `${name}: sideways`).toBe(0);
        seen.push(name);
      });
      expect(seen).toHaveLength(10);
    });
  }

  test(`${locale} at 320: every screen measured — taps and contrast held, the width reported, not held (§18.10.3)`, async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 320, height: 640 });
    const widths: Record<string, number> = {};
    await walk(page, locale, async (name, scope) => {
      const axe = await new AxeBuilder({ page }).include(scope).withRules(["color-contrast"]).analyze();
      expect(axe.violations.map((v) => v.id), `${name}: contrast`).toEqual([]);
      const { small } = await smallTargets(page, scope);
      expect(small, `${name}: tap strips under 44px`).toEqual([]);
      widths[name] = await overflow(page);
    });
    await testInfo.attach("overflow-320.json", { body: JSON.stringify(widths, null, 2), contentType: "application/json" });
    console.log(`OVERFLOW-320 ${locale} ${JSON.stringify(widths)}`);
  });
}
