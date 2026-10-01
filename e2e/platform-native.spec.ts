import { readFileSync } from "node:fs";
import type { Locator, Page } from "@playwright/test";
import { exampleState } from "../src/lib/engine/__tests__/fixtures";
import { PATH_A } from "../src/lib/game/__tests__/paths";
import { hangUp, LEVEL_PATH } from "./game-helpers";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test } from "./helpers";

/**
 * What the platform now does in our place (audit du kit §6, CHANTIERS.md A4,
 * 2026-09-29). Each is an enhancement: the page is right without it, so what
 * is read here is that the enhancement is really on, in the build, in the
 * browser CI runs — a computed value, a box, an event — and that it gives
 * back what it replaced.
 *
 * Ctrl+F itself cannot be driven here: headless Chromium reveals
 * `hidden="until-found"` neither for `window.find()` nor for a text
 * fragment, even on a static page (probed 2026-09-29). So the folded rows
 * are read for what makes them findable (the attribute, the text in the
 * page, no height) and for what the browser's `beforematch` does to them.
 *
 * Non-vacuity (2026-09-29), one sabotage each, each failing its own test:
 * the Disclosure's `@supports` block removed; the glossary popover back to
 * `placement` anchored; `StageTabs` rendering the
 * body only when open again; the header's `scroll-state` block removed; the
 * tabs' negative margin dropped; the news' `onClick` fallback emptied, and
 * `command` taken off the skip button; `Segmented`'s anchor block removed;
 * `color-scheme` removed from the night world. Two tests hold what stays and
 * pass on the old code too: a Disclosure under reduced motion, and a folded
 * row dropping an unsaved edit. So does the PNG half of the deck's: a lift of
 * the skip during the export was written, measured useless (the off-screen
 * slide came out byte for byte the same without it) and taken out.
 */

const STORAGE_KEY = "tdg.engine.v2";
const EXAMPLE_CLOCK = new Date(2026, 8, 24, 12);
const GAME_OPEN = process.env.GAME_ENABLED === "true";

const frames = (page: Page, n = 2) =>
  page.evaluate((count) => new Promise<void>((resolve) => {
    const step = (left: number) => (left ? requestAnimationFrame(() => step(left - 1)) : resolve());
    step(count);
  }), n);

test.describe("the site header's rule", () => {
  test("drawn only once the page scrolls under the header, and nothing moves by a pixel", async ({ page }) => {
    await page.goto("/fr/glossary/cac");
    const header = page.locator('header[data-site-header="plain"]');
    const read = () =>
      header.evaluate((h) => ({
        rule: getComputedStyle(h, "::after").borderBottomStyle,
        drawn: getComputedStyle(h, "::after").content !== "none",
        border: getComputedStyle(h).borderBottomColor,
        height: h.getBoundingClientRect().height,
      }));
    const top = await read();
    expect(top.drawn).toBe(false);
    expect(top.border).toBe("rgba(0, 0, 0, 0)");

    await page.mouse.wheel(0, 600);
    await expect.poll(async () => (await read()).drawn).toBe(true);
    const scrolled = await read();
    expect(scrolled.rule).toBe("dashed");
    expect(scrolled.height).toBe(top.height);
  });
});

test.describe("Segmented: the fill slides to the choice", () => {
  const toggle = (page: Page) => page.getByTestId("preview-card").getByRole("group").first();
  const fill = (group: Locator) =>
    group.evaluate((g) => {
      const track = g.firstElementChild as HTMLElement;
      const on = track.querySelector<HTMLElement>('[aria-pressed="true"]')!;
      const before = getComputedStyle(track, "::before");
      return {
        left: parseFloat(before.left),
        right: parseFloat(before.right),
        onLeft: on.offsetLeft,
        onRight: track.clientWidth - on.offsetLeft - on.offsetWidth,
        fill: before.backgroundColor,
        text: getComputedStyle(on).color,
        own: getComputedStyle(on).backgroundColor,
      };
    });

  /** WCAG 2 contrast of two opaque `rgb()` colours. */
  function contrast(a: string, b: string): number {
    const lum = (c: string) => {
      const [r, g, bl] = c.match(/[\d.]+/g)!.slice(0, 3).map((v) => {
        const x = Number(v) / 255;
        return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r! + 0.7152 * g! + 0.0722 * bl!;
    };
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi! + 0.05) / (lo! + 0.05);
  }

  test("one fill for the track, under whichever option is on, and part-way between them on the way", async ({ page }) => {
    await page.goto("/en");
    const group = toggle(page);
    const first = await fill(group);
    // The option is see-through: the fill is the track's, sitting exactly under it.
    expect(first.own).toBe("rgba(0, 0, 0, 0)");
    expect(first.left).toBeCloseTo(first.onLeft, 0);
    expect(first.right).toBeCloseTo(first.onRight, 0);

    await group.getByRole("button", { pressed: false }).click();
    await frames(page, 3);
    const moving = await fill(group);
    expect(moving.left).toBeGreaterThan(first.left);
    expect(moving.left).toBeLessThan(moving.onLeft);

    await expect.poll(async () => { const f = await fill(group); return Math.abs(f.left - f.onLeft); }).toBeLessThan(0.5);
    const settled = await fill(group);
    expect(settled.right).toBeCloseTo(settled.onRight, 0);
  });

  test.describe("under reduced motion", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });

    // axe files a label over a pseudo-element's fill under "incomplete", so the gate is here.
    test("the chosen label reads at AA on the fill it really sits on, in both tones", async ({ page }) => {
      await page.goto("/en");
      const group = toggle(page);
      const seen = new Set<string>();
      for (let i = 0; i < 2; i++) {
        const f = await fill(group);
        expect(f.fill, "an opaque fill: the ratio is measured on it alone").toMatch(/^rgb\(/);
        expect(contrast(f.text, f.fill), `${f.text} on ${f.fill}`).toBeGreaterThanOrEqual(4.5);
        seen.add(f.fill);
        await group.getByRole("button", { pressed: false }).click();
      }
      // Non-vacuity: the two tones are two fills (ink, and the roast's red).
      expect(seen.size).toBe(2);
    });
  });
});

test.describe("the glossary definition: one panel, in the top layer", () => {
  const open = async (page: Page) => {
    await page.goto("/r/sample?lang=en");
    await page.locator("main").waitFor();
    const trigger = page.getByRole("button", { name: /definition: retention/i });
    await trigger.click();
    await expect(page.getByRole("dialog", { name: /retention/i })).toBeVisible();
    return trigger;
  };
  const panel = (page: Page) => page.getByRole("dialog", { name: /retention/i });

  test("on a desktop it hangs under its own trigger, with no ✕, and covers nothing else", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const trigger = await open(page);
    // One panel, not two copies with CSS hiding one; open in the top layer.
    await expect(page.locator("[role=dialog]")).toHaveCount(1);
    expect(await panel(page).evaluate((el) => el.matches(":popover-open"))).toBe(true);
    const t = (await trigger.boundingBox())!;
    const p = (await panel(page).boundingBox())!;
    expect(p.y).toBeGreaterThanOrEqual(t.y + t.height);
    expect(p.y).toBeLessThan(t.y + t.height + 12);
    expect(Math.abs(p.x - t.x)).toBeLessThan(2);
    expect(p.width).toBeLessThanOrEqual(280);
    await expect(panel(page).getByRole("button", { name: "Close" })).toBeHidden();
    expect(await page.evaluate(() => document.elementFromPoint(5, 450)?.getAttribute("role"))).not.toBe("dialog");

    // A click elsewhere still closes it, and goes where it was aimed.
    await page.mouse.click(5, 450);
    await expect(page.locator("[role=dialog]")).toHaveCount(0);
  });

  test("on a phone it is the sheet at the bottom; its ✕ and a tap outside close it, and that tap never reaches the page", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const trigger = await open(page);
    await expect(page.locator("[role=dialog]")).toHaveCount(1);
    const p = (await panel(page).locator(":scope > div").boundingBox())!;
    expect(Math.round(p.x)).toBe(16);
    expect(Math.round(p.width)).toBe(390 - 32);
    expect(Math.round(p.y + p.height)).toBe(844 - 16);
    // Focus goes into the sheet too, now there is one panel to give it to.
    await expect(panel(page)).toBeFocused();

    await panel(page).getByRole("button", { name: "Close" }).click();
    await expect(page.locator("[role=dialog]")).toHaveCount(0);
    await expect(trigger).toBeFocused();

    // A tap outside lands on the popover's own layer, not on the page under it.
    await trigger.click();
    const landed = await page.evaluate(() => {
      const el = document.elementFromPoint(195, 200);
      return el?.getAttribute("role") ?? el?.tagName;
    });
    expect(landed).toBe("dialog");
    await page.mouse.click(195, 200);
    await expect(page.locator("[role=dialog]")).toHaveCount(0);
  });
});

test.describe("the news: one way out, faded by the platform", () => {
  test.skip(!GAME_OPEN, 'GAME_ENABLED is not "true" for this run — the level page is closed.');

  async function openNews(page: Page) {
    await page.goto(LEVEL_PATH.fr);
    await hangUp(page);
    for (const card of PATH_A[0]!) await page.getByTestId(`game-card-${card}`).click();
    await page.getByTestId("game-run").click();
    await expect(page.getByTestId("game-news")).toBeVisible();
    // The fade in does not hold the focus back: the primary button has it (QuarterNews).
    await expect(page.getByTestId("game-news-next")).toBeFocused();
    await expect(page.getByTestId("game-news")).toHaveCSS("opacity", "1");
  }

  test("« Passer au bilan » is the dialog's own request to close, the one Escape makes; the dialog fades, then leaves", async ({ page }) => {
    await openNews(page);
    const news = page.getByTestId("game-news");
    const skip = page.getByTestId("game-news-skip");
    await expect(skip).toHaveAttribute("command", "request-close");
    await expect(skip).toHaveAttribute("commandfor", (await news.getAttribute("id"))!);
    // The news reads as the site's paragraphs do: no orphaned last word.
    await expect(page.getByTestId("game-news-item")).toHaveCSS("text-wrap-style", "pretty");

    const during = await news.evaluate(async (dialog: HTMLDialogElement) => {
      let cancelled = 0;
      dialog.addEventListener("cancel", () => cancelled++);
      document.querySelector<HTMLButtonElement>('[data-testid="game-news-skip"]')!.click();
      // A third of the way into the 150 ms fade.
      await new Promise((resolve) => setTimeout(resolve, 50));
      return { cancelled, open: dialog.open, display: getComputedStyle(dialog).display, opacity: Number(getComputedStyle(dialog).opacity) };
    });
    // The request went through `cancel` (a bare close() does not), the dialog is closed, and still drawn while it fades.
    expect(during.cancelled).toBe(1);
    expect(during.open).toBe(false);
    expect(during.display).toBe("block");
    expect(during.opacity).toBeLessThan(1);

    await expect(news).toHaveCount(0);
    await expect(page.getByTestId("game-desk")).toHaveAttribute("data-phase", "report");
  });

  test("where the button does not know `command`, its click closes the dialog itself", async ({ page }) => {
    await page.addInitScript(() => {
      delete (HTMLButtonElement.prototype as { command?: unknown }).command;
    });
    await openNews(page);
    // Without the attribute the browser has nothing to act on: only the fallback can close it.
    await page.getByTestId("game-news-skip").evaluate((b) => b.removeAttribute("command"));
    await page.getByTestId("game-news-skip").click();
    await expect(page.getByTestId("game-news")).toHaveCount(0);
    await expect(page.getByTestId("game-desk")).toHaveAttribute("data-phase", "report");
  });

  test("the night world asks the browser for dark controls and scrollbars", async ({ page }) => {
    await page.goto(LEVEL_PATH.fr);
    await expect(page.locator('[data-world="night"]').first()).toHaveCSS("color-scheme", "dark");
    await expect(page.locator("html")).toHaveCSS("color-scheme", "normal");
  });
});

test.describe("the engine", () => {
  test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
  test.beforeEach(async ({ context }) => {
    await grantOwnerPreview(context.request, "engine");
  });

  async function openExample(page: Page) {
    await page.clock.setFixedTime(EXAMPLE_CLOCK);
    await page.goto("/en/aarrr-funnel-template");
    await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
    await page.evaluate(({ key, state }) => window.localStorage.setItem(key, JSON.stringify({ schemaVersion: 2, state })), {
      key: STORAGE_KEY,
      state: exampleState(),
    });
    await page.reload();
    await expect(page.getByTestId("engine-board")).toBeVisible();
  }

  /** The board's « what if » fold, a `core/Disclosure`: its height five frames after it opens, and once it has. */
  async function openingHeights(page: Page) {
    return page.getByTestId("engine-board-whatif").evaluate(async (d: HTMLDetailsElement) => {
      const height = () => d.getBoundingClientRect().height;
      const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
      const closed = height();
      d.open = true;
      // Drawn from the very first frame: only the height moves.
      const drawn = getComputedStyle(d, "::details-content").contentVisibility;
      for (let i = 0; i < 5; i++) await frame();
      const early = height();
      await new Promise((resolve) => setTimeout(resolve, 600));
      return { closed, early, open: height(), drawn };
    });
  }

  test("a Disclosure opens by growing its content's box, with no script", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openExample(page);
    const h = await openingHeights(page);
    expect(h.open).toBeGreaterThan(h.closed + 100);
    // Its content is there at once — a control in it can take the focus the moment it opens.
    expect(h.drawn).toBe("visible");
    // Five frames in (~80 ms of --dur-open's 250), part-way: neither closed nor open yet.
    expect(h.early).toBeGreaterThan(h.closed);
    expect(h.early).toBeLessThan(h.open);
  });

  test.describe("under reduced motion", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });
    test("a Disclosure opens at once, as it always did", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await openExample(page);
      const h = await openingHeights(page);
      expect(h.open).toBeGreaterThan(h.closed + 100);
      expect(h.early).toBe(h.open);
    });
  });

  test("a folded number is in the page for Ctrl+F, takes no room, and opens when the browser finds it", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openExample(page);
    const toggle = page.getByTestId("engine-metric-act-event");
    const body = page.locator(`#${await toggle.getAttribute("aria-controls")}`);
    await expect(body).toHaveAttribute("hidden", "until-found");
    expect((await body.boundingBox())?.height ?? 0).toBe(0);
    // Its words are there to be found, not rendered in.
    await expect(body.getByTestId("engine-sheet-act-event")).toContainText(/\w/);
    await expect(body.getByTestId("engine-sheet-act-event")).toBeHidden();

    // What the browser does on a match: `beforematch`, then the attribute goes.
    await body.evaluate((el) => {
      el.dispatchEvent(new Event("beforematch"));
      el.removeAttribute("hidden");
    });
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(body.getByTestId("engine-sheet-act-event")).toBeVisible();
    await expect(body).not.toHaveAttribute("hidden");
  });

  test("folding a row drops what was typed and not saved, as closing it always did", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openExample(page);
    const toggle = page.getByTestId("engine-metric-act-event");
    await toggle.click();
    const field = page.getByTestId("engine-sheet-act-event").getByRole("textbox").first();
    const saved = await field.inputValue();
    expect(saved.length).toBeGreaterThan(0);
    await field.fill("typed, never saved");
    await toggle.click();
    await expect(page.getByTestId("engine-sheet-act-event")).toBeHidden();
    await toggle.click();
    await expect(page.getByTestId("engine-sheet-act-event").getByRole("textbox").first()).toHaveValue(saved);
  });

  test("on a phone the strip says which way more tabs are, and scrolls exactly as far as before", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openExample(page);
    const strip = page.getByTestId("engine-tabs");
    const read = () =>
      strip.evaluate((t) => ({
        before: getComputedStyle(t, "::before").content,
        after: getComputedStyle(t, "::after").content,
        width: t.scrollWidth,
      }));
    const at = async (left: number) => {
      await strip.evaluate((t, x) => (t.scrollLeft = x), left);
      await frames(page, 3);
      return read();
    };
    // Arriving on the stage the diagnosis names (the second tab), the strip
    // keeps that tab clear of the arrow drawn over its edge.
    const clear = await strip.evaluate((t) => {
      const tab = t.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')!.getBoundingClientRect();
      const box = t.getBoundingClientRect();
      return { right: box.right - tab.right, left: tab.left - box.left, hint: parseFloat(getComputedStyle(t, "::after").width) || 0 };
    });
    expect(clear.hint).toBeGreaterThan(0);
    expect(clear.right).toBeGreaterThanOrEqual(clear.hint);
    const start = await at(0);
    expect(start.before).toBe("none");
    expect(start.after).toContain("→");
    const middle = await at(120);
    expect(middle.before).toContain("←");
    expect(middle.after).toContain("→");
    const end = await at(100_000);
    expect(end.before).toContain("←");
    expect(end.after).toBe("none");
    // The arrows give their room back: the strip is as wide with either one as with the other.
    expect(new Set([start.width, middle.width, end.width]).size).toBe(1);
  });

  test("the deck: thumbnails off screen are skipped, and still export whole; its paper asks for light controls", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openExample(page);
    await page.getByTestId("engine-open-deck").click();
    await expect(page.getByTestId("engine-deck")).toBeVisible();
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    const viewports = page.locator('[data-print="viewport"]');
    expect(await viewports.count()).toBeGreaterThan(3);
    await expect(viewports.first()).toHaveCSS("content-visibility", "auto");
    await expect(page.locator('[data-print="viewport"] [data-world="paper"]').first()).toHaveCSS("color-scheme", "light");

    const last = page.locator('[data-print="thumb"]').last();
    const id = await last.locator('[data-testid^="deck-png-"]').getAttribute("data-testid");
    const png = async () => {
      const download = page.waitForEvent("download");
      // dispatchEvent: no scrolling to the button, so the slide stays where it is.
      await page.getByTestId(id!).dispatchEvent("click");
      return readFileSync((await (await download).path())!);
    };
    // Off screen: the page at its top, the last slide far below it.
    await page.evaluate(() => window.scrollTo(0, 0));
    await frames(page, 3);
    expect(await last.evaluate((el) => el.getBoundingClientRect().top > window.innerHeight * 2)).toBe(true);
    const offScreen = await png();
    // On screen, for the reference.
    await last.scrollIntoViewIfNeeded();
    await frames(page, 3);
    const onScreen = await png();
    expect(onScreen.length).toBeGreaterThan(20_000);
    expect(offScreen.length).toBe(onScreen.length);
  });
});
