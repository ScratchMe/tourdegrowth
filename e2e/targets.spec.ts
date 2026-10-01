import { ADMIN_PASSWORD, expect, grantOwnerPreview, openFold, seedOwnedResult, SKIP_ADMIN_REASON, test } from "./helpers";
import type { Page } from "@playwright/test";
import { ENGINE_COPY } from "@/content/engine-copy";
import { exampleState, hybridState } from "../src/lib/engine/__tests__/fixtures";
import { writeEngineSeed } from "./engine-helpers";
import { EMULATOR_HOST, REAL_RESULTS, SKIP_EMULATOR_REASON } from "./real-results";

/**
 * DS v3 H-2 and H-3 — touch targets measured the way a finger meets them.
 *
 * Both defects were invisible to every earlier check because each checked
 * the drawn box. `Segmented size="compact"` claimed a 44px hit from a
 * transparent 6px pad — but the pad was on the group, so a tap in it landed
 * on a `div`, never on the option (28px real target). `DefinitionTrigger`
 * was 16×16 with nothing around it. A bounding-box assertion passes on both;
 * only `document.elementFromPoint` says what a tap outside the drawn box
 * actually reaches, so that is what every assertion here uses.
 *
 * At 390px, the width the defects were measured at, and the width where a
 * finger is the only pointer.
 */

test.use({ viewport: { width: 390, height: 844 } });

/** Height (or width) of the strip, through the element's centre, where a tap lands on it. */
async function hitExtent(page: Page, selector: string, index: number, axis: "y" | "x"): Promise<number> {
  return page.evaluate(
    ({ selector, index, axis }) => {
      const el = document.querySelectorAll(selector)[index] as HTMLElement;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const step = 0.25;
      let hits = 0;
      for (let d = -40; d <= 40; d += step) {
        const x = axis === "x" ? cx + d : cx;
        const y = axis === "y" ? cy + d : cy;
        const hit = document.elementFromPoint(x, y);
        if (hit && (hit === el || el.contains(hit))) hits += 1;
      }
      return hits * step;
    },
    { selector, index, axis },
  );
}

/** The compact segments on the page: options drawn under 32px tall, inside a named group. */
const COMPACT_OPTIONS = '[role="group"] a, [role="group"] button';

async function compactIndices(page: Page): Promise<number[]> {
  return page.evaluate((sel) => {
    const out: number[] = [];
    document.querySelectorAll(sel).forEach((el, i) => {
      const r = el.getBoundingClientRect();
      if (!el.hasAttribute("aria-expanded") && r.height > 0 && r.height <= 32) out.push(i);
    });
    return out;
  }, COMPACT_OPTIONS);
}

for (const [where, path] of [
  ["landing header and preview card", "/en"],
  ["result header", "/r/sample?lang=fr"],
] as const) {
  test(`compact segments on the ${where} take a tap 44px tall, on the option itself`, async ({ page }) => {
    await page.goto(path);
    await page.locator("main").waitFor();

    const indices = await compactIndices(page);
    // Non-vacuity: the landing has the EN|FR switcher and the tone toggle, the result its switcher.
    expect(indices.length).toBeGreaterThanOrEqual(2);

    for (const i of indices) {
      // Centred in the window first: hit-testing only sees what is on screen.
      // The preview card's toggle sat above a phone's fold until the header
      // grew its space band (2026-09-29); from there `elementFromPoint`
      // answered null and the tap strip measured 0. Centred rather than
      // scrolled to the edge, so the sticky header covers none of the strip.
      await page.locator(COMPACT_OPTIONS).nth(i).evaluate((el) => el.scrollIntoView({ block: "center" }));
      const drawn = await page.locator(COMPACT_OPTIONS).nth(i).boundingBox();
      expect(drawn!.height).toBeLessThanOrEqual(32); // still the compact look
      expect(await hitExtent(page, COMPACT_OPTIONS, i, "y")).toBeGreaterThanOrEqual(43.5);

      // The exact claim of the fix: 7.5px above and below the drawn box is still this option.
      const reached = await page.evaluate(
        ({ sel, i }) => {
          const el = document.querySelectorAll(sel)[i] as HTMLElement;
          const r = el.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          return [r.top - 7.5, r.bottom + 7.5].map((y) => {
            const hit = document.elementFromPoint(cx, y);
            return !!hit && (hit === el || el.contains(hit));
          });
        },
        { sel: COMPACT_OPTIONS, i },
      );
      expect(reached).toEqual([true, true]);
    }
  });
}

test("the strip above a compact track has no dead column between its two options", async ({ page }) => {
  await page.goto("/en");
  await page.locator("main").waitFor();
  const group = page.getByRole("group", { name: /language/i }).first();
  const box = await group.boundingBox();
  // A horizontal scan 4px inside the group's top pad, across the whole track.
  const misses = await page.evaluate(
    ({ left, width, y }) => {
      const out: number[] = [];
      for (let x = left + 1; x < left + width - 1; x += 0.5) {
        const hit = document.elementFromPoint(x, y);
        if (!hit?.closest("a, button")) out.push(Math.round(x));
      }
      return out;
    },
    { left: box!.x, width: box!.width, y: box!.y + 4 },
  );
  expect(misses).toEqual([]);
});

/** Definition triggers are the `?` buttons that carry aria-expanded (their popover state). */
const TRIGGER = "button[aria-expanded]";

async function triggerCentres(page: Page) {
  return page.evaluate((sel) => {
    return [...document.querySelectorAll(sel)]
      .filter((el) => el.textContent?.trim() === "?")
      .map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
      });
  }, TRIGGER);
}

test("every definition trigger on the result page takes a 44px tap, and no two targets overlap", async ({ page }) => {
  await page.goto("/r/sample");
  await page.locator("main").waitFor();

  const centres = await triggerCentres(page);
  // The five pillar chips each carry one.
  expect(centres.length).toBeGreaterThanOrEqual(5);

  const indices = await page.evaluate(
    (sel) =>
      [...document.querySelectorAll(sel)].flatMap((el, i) => (el.textContent?.trim() === "?" ? [i] : [])),
    TRIGGER,
  );
  const radii: number[] = [];
  for (const i of indices) {
    // `elementFromPoint` only sees the viewport. Since the stage profile sits
    // over the chips (design I + B, 2026-09-28) the lower ones start below the
    // fold at 1280×720, and a trigger off screen measured a 0px target.
    await page.locator(TRIGGER).nth(i).evaluate((el) => el.scrollIntoView({ block: "center" }));
    const drawn = await page.locator(TRIGGER).nth(i).boundingBox();
    expect(Math.round(drawn!.width)).toBe(16); // the drawn circle does not grow
    const across = await hitExtent(page, TRIGGER, i, "x");
    expect(across).toBeGreaterThanOrEqual(43.5);
    expect(await hitExtent(page, TRIGGER, i, "y")).toBeGreaterThanOrEqual(43.5);
    radii.push(across / 2);
  }

  // Two discs are apart as long as their centres are at least the sum of their
  // MEASURED radii apart — measured, not assumed 22, so a disc that grows later
  // is caught here rather than by a mis-tap on a phone.
  for (let a = 0; a < centres.length; a++) {
    for (let b = a + 1; b < centres.length; b++) {
      const d = Math.hypot(centres[a]!.x - centres[b]!.x, centres[a]!.y - centres[b]!.y);
      expect(d, `triggers ${a} and ${b}`).toBeGreaterThanOrEqual(radii[a]! + radii[b]! - 0.5);
    }
  }
});

test("a trigger inside question copy takes a 44px tap without covering an answer", async ({ page }) => {
  // Two answers stored: the quiz resumes on acq-3, whose copy carries the CAC trigger.
  await page.addInitScript(() => {
    localStorage.setItem("tdg.quiz.answers.v1", JSON.stringify({ "acq-1": 0, "acq-2": 0 }));
  });
  await page.goto("/quiz");
  await page.locator(TRIGGER).filter({ hasText: "?" }).first().waitFor();

  const index = await page.evaluate((sel) => {
    return [...document.querySelectorAll(sel)].findIndex((el) => el.textContent?.trim() === "?");
  }, TRIGGER);
  expect(index).toBeGreaterThanOrEqual(0);
  expect(await hitExtent(page, TRIGGER, index, "y")).toBeGreaterThanOrEqual(43.5);

  // Every answer is still reached at its own centre and 2px inside its top edge —
  // the edge nearest the question copy, where an overreaching disc would land.
  const { checked, covered } = await page.evaluate((sel) => {
    const trig = [...document.querySelectorAll(sel)].find((el) => el.textContent?.trim() === "?");
    const answers = [...document.querySelectorAll("button:not([aria-expanded])")].filter(
      (el) => el.getBoundingClientRect().height >= 44,
    );
    const covered = answers.flatMap((el) => {
      const r = el.getBoundingClientRect();
      return [r.top + 2, r.top + r.height / 2].flatMap((y) => {
        const hit = document.elementFromPoint(r.left + r.width / 2, y);
        return hit && trig && trig.contains(hit) ? [el.textContent ?? ""] : [];
      });
    });
    return { checked: answers.length, covered };
  }, TRIGGER);
  expect(checked).toBeGreaterThanOrEqual(3); // the three answers of acq-3
  expect(covered).toEqual([]);
});

/*
 * Design audit S-11 (2026-09-29) — the system's one text button.
 *
 * `Button variant="quiet"` was drawn 31px tall and tapped 31px tall, with no
 * hover and no press; the engine had two more recipes (32px and 44px). The
 * engine's now render the Button, and the Button carries a transparent strip
 * (`::before`) at least 44px on each axis, centred on the label, that moves
 * nothing. Three claims, each measured the way a finger meets the page:
 *   1. a tap anywhere in a 44px strip through the label reaches the button;
 *   2. the strip covers no part of another target (a slider, a field, a
 *      button next to it) — an extension that steals a neighbour's tap is
 *      worse than none;
 *   3. the drawn button did not grow: the page lays out as it did.
 *
 * Non-vacuity (2026-09-29): claim 2 failed for real on the first build — the
 * what-if row had lost the 44px its old reset gave it, and the strip reached
 * up over the slider (« Back to today » covers a neighbour: INPUT). Fixed in
 * WhatIfPanel.module.css. A build without the `::before` fails exactly the
 * three engine tests, on claim 1 (strips of 31.75, 31.75 and 29.75px); the
 * six others pass. Against main's build (before this change) the hover test
 * fails too — the quiet button had no hover.
 */
const QUIET = '[class*="Button-module__"][class*="__quiet"]';

/** Indices of the buttons matching `sel` a person can see (a hidden nav link has no box). */
async function visibleTargets(page: Page, sel: string): Promise<number[]> {
  return page.evaluate((sel) => {
    const out: number[] = [];
    document.querySelectorAll(sel).forEach((el, i) => {
      const r = el.getBoundingClientRect();
      // checkVisibility: a folded engine row keeps its sheet in the page,
      // `hidden="until-found"` (StageTabs), and a skipped subtree still
      // answers getBoundingClientRect with a box nobody can see or tap.
      if (r.width > 0 && r.height > 0 && el.checkVisibility()) out.push(i);
    });
    return out;
  }, sel);
}

/** How close a neighbour has to be for claim 2 to be worth checking against it. */
const NEAR = 16;

/**
 * Claim 2, for button `index`: every other target whose drawn box meets the
 * button's 44px zone is still reached at every point of that overlap
 * (sampled every 1px). Returns the labels of the targets that lost a point,
 * and how many targets stand within NEAR px of the zone — so an empty list
 * can be told apart from a check with nothing around it.
 */
async function stolenFrom(page: Page, sel: string, index: number): Promise<{ near: number; stolen: string[] }> {
  return page.evaluate(
    ({ sel, index, near_ }) => {
      const target = document.querySelectorAll(sel)[index] as HTMLElement;
      const q = target.getBoundingClientRect();
      const zone = {
        top: q.top + q.height / 2 - Math.max(q.height, 44) / 2,
        bottom: q.top + q.height / 2 + Math.max(q.height, 44) / 2,
        left: q.left + q.width / 2 - Math.max(q.width, 44) / 2,
        right: q.left + q.width / 2 + Math.max(q.width, 44) / 2,
      };
      // Only a neighbour someone can tap: not one inside a folded row's
      // `hidden="until-found"` sheet, which still reports a box (visibleTargets).
      const targets = [...document.querySelectorAll("a, button, input, select, textarea, summary, label")].filter(
        (el) => el !== target && !target.contains(el) && !el.contains(target) && el.checkVisibility(),
      );
      let near = 0;
      const stolen: string[] = [];
      for (const el of targets) {
        const r = el.getBoundingClientRect();
        if (r.width === 0) continue;
        const gap = Math.max(zone.top - r.bottom, r.top - zone.bottom, zone.left - r.right, r.left - zone.right);
        if (gap <= near_) near += 1;
        const top = Math.max(r.top, zone.top);
        const bottom = Math.min(r.bottom, zone.bottom);
        const left = Math.max(r.left, zone.left);
        const right = Math.min(r.right, zone.right);
        if (bottom <= top || right <= left) continue;
        let lost = false;
        for (let y = top + 0.5; y < bottom && !lost; y += 1) {
          for (let x = left + 0.5; x < right && !lost; x += 1) {
            const hit = document.elementFromPoint(x, y);
            if (hit && (hit === target || target.contains(hit))) lost = true;
          }
        }
        if (lost) stolen.push(`${el.tagName} "${(el.textContent ?? "").trim().slice(0, 40)}"`);
      }
      return { near, stolen };
    },
    { sel, index, near_: NEAR },
  );
}

/**
 * How each kind of button is drawn, for claim 3: no taller than `max` while
 * its label sits on one line, which it does below `oneLine` (a label that
 * wraps is two lines tall, and taller than 44 on its own).
 */
interface Look {
  what: string;
  max: number;
  oneLine: number;
}

/** A line of text, not a 44px box. */
const QUIET_LOOK: Look = { what: "a line of text", max: 32, oneLine: 40 };

/**
 * The three claims for every button matching `sel`. Scope `sel` to a test
 * id where a sheet can hold the page still: the buttons behind it cannot be
 * scrolled to, and a finger cannot reach them either.
 */
async function expectTapTargets(page: Page, sel: string, minimum: number, look: Look): Promise<number> {
  const indices = await visibleTargets(page, sel);
  expect(indices.length).toBeGreaterThanOrEqual(minimum);
  let neighbours = 0;
  for (const i of indices) {
    const button = page.locator(sel).nth(i);
    await button.evaluate((el) => el.scrollIntoView({ block: "center" }));
    const drawn = (await button.boundingBox())!;
    const label = (await button.textContent())?.trim();
    // Claim 3: the look is unchanged.
    if (drawn.height < look.oneLine) expect(drawn.height, `"${label}" is drawn as ${look.what}`).toBeLessThanOrEqual(look.max);
    // Claim 1.
    expect(await hitExtent(page, sel, i, "y"), `"${label}" tap strip, vertical`).toBeGreaterThanOrEqual(43.5);
    expect(await hitExtent(page, sel, i, "x"), `"${label}" tap strip, horizontal`).toBeGreaterThanOrEqual(
      Math.min(43.5, drawn.width),
    );
    // Claim 2.
    const { near, stolen } = await stolenFrom(page, sel, i);
    expect(stolen, `"${label}" covers a neighbour`).toEqual([]);
    neighbours += near;
  }
  return neighbours;
}

/** The three claims for every quiet button inside `scope` (a test id). */
function expectQuietTargets(page: Page, scope: string, minimum: number): Promise<number> {
  return expectTapTargets(page, `[data-testid="${scope}"] ${QUIET}`, minimum, QUIET_LOOK);
}

test.describe("the quiet text button", () => {
  test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);

  test("on the engine's first screen, each takes a 44px tap and covers nothing", async ({ page, context }) => {
    await grantOwnerPreview(context.request, "engine");
    await page.goto("/fr/aarrr-funnel-template");
    await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
    // « Voir un exemple rempli » and « Importer un fichier ».
    await expectQuietTargets(page, "engine-workbench", 2);
  });

  test("the what-if resets sit under their sliders: 44px each, and no slider loses a tap", async ({ page, context }) => {
    await grantOwnerPreview(context.request, "engine");
    await page.clock.setFixedTime(new Date(2026, 8, 24, 12));
    await page.goto("/en/aarrr-funnel-template");
    await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
    await writeEngineSeed(page, exampleState());
    await page.reload();
    await openFold(page.getByTestId("engine-board-whatif"));
    const panel = page.getByTestId("engine-whatif-panel");
    await expect(panel).toBeVisible();
    // Two levers moved: two resets under two sliders, and « reset all » above them.
    for (const lever of ["act.rate", "rev.arpa"]) {
      await page.getByTestId(`whatif-slider-${lever}`).focus();
      await page.keyboard.press("ArrowRight");
      await expect(page.getByTestId(`whatif-reset-${lever}`)).toBeVisible();
    }
    const neighbours = await expectQuietTargets(page, "engine-whatif-panel", 3);
    // Non-vacuity of claim 2: each reset has its slider within NEAR px of its
    // zone — the neighbour a strip that grew would cover first.
    expect(neighbours).toBeGreaterThanOrEqual(2);
  });

  test("the text action under a metric's fields takes a 44px tap and covers no field", async ({ page, context }) => {
    await grantOwnerPreview(context.request, "engine");
    await page.goto("/en/aarrr-funnel-template");
    await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
    await page.getByTestId("engine-setup-board").click();
    const tab = page.getByTestId("engine-tab-activation");
    if ((await tab.getAttribute("aria-selected")) !== "true") await tab.click();
    const toggle = page.getByTestId("engine-metric-act-rate");
    if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
    const sheet = page.getByTestId("engine-sheet-act-rate");
    await sheet.getByRole("radio", { name: "I have it" }).check();
    const rateOnly = sheet.getByRole("button", { name: "I only have the rate" });
    await expect(rateOnly).toBeVisible();
    // Its fields stand right above it: the neighbours a strip would cover.
    expect(await expectQuietTargets(page, "engine-sheet-act-rate", 1)).toBeGreaterThanOrEqual(1);
    // The same action, the other way: back to the two counts.
    await rateOnly.click();
    await expect(sheet.getByRole("button", { name: "I have both counts" })).toBeVisible();
    expect(await expectQuietTargets(page, "engine-sheet-act-rate", 1)).toBeGreaterThanOrEqual(1);
  });
});

test("a quiet link answers the pointer: ink and a heavier underline on hover, the underline drawn in on press", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/en");
  const quiet = page.locator(QUIET).first();
  await expect(quiet).toBeVisible();
  const style = () =>
    quiet.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { color: cs.color, thickness: cs.textDecorationThickness, offset: cs.textUnderlineOffset };
    });
  await page.mouse.move(0, 0);
  const rest = await style();
  await quiet.hover();
  await expect.poll(async () => (await style()).color).not.toBe(rest.color);
  const hover = await style();
  expect(hover.thickness).toBe("2px");

  await page.mouse.down();
  await expect.poll(async () => (await style()).offset).toBe("1px");
  // Off the link before letting go: a press, not a click — the page stays.
  await page.mouse.move(0, 0);
  await page.mouse.up();
  expect(rest.offset).toBe("3px");
});

/*
 * The small button (`size="sm"`, 2026-10-01). Drawn 39px tall, it was tapped
 * 39px tall, under --hit-min, on the engine's margin action, a chart's retry
 * and the owner's badge copy, all within a finger's reach. It carries the
 * quiet button's strip now, and makes the same three claims: a 44px tap, no
 * neighbour's tap stolen, the box drawn as before. One test per place a
 * person meets it; the chart's retry is the fourth, and only an error state
 * renders it.
 *
 * Claim 2 is a guard for a later layout here, not a present risk, and the
 * tests do not ask for a neighbour within NEAR px the way the quiet ones do:
 * the strip reaches 2.5px past a 39px box, and on 2026-10-01 the closest
 * target to any small button was 12px away (the audit's « Nouvelle mission »),
 * 20px in the landing header, 36px on the owner's result, 50px in the engine,
 * the only sheets of 130 opened, in three states at 390 and 1280px, that
 * carry one.
 *
 * Non-vacuity (2026-10-01): a build without `.sm::before` fails exactly the
 * three tests below, on claim 1 (strips of 39.5, 40 and 39.75px); the nine
 * others pass.
 */
const SMALL = '[class*="Button-module__"][class*="__sm"]:not([class*="__quiet"])';

/** Still the compact box: 39px, not grown to 44. */
const SMALL_LOOK: Look = { what: "the compact box", max: 40, oneLine: 44 };

test("the landing header's small call to action takes a 44px tap where a tablet shows it", async ({ page }) => {
  // Hidden under 760px (page.module.css); a tablet held upright shows it, and is touched.
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.goto("/en");
  await page.locator("main").waitFor();
  await expectTapTargets(page, `header ${SMALL}`, 1, SMALL_LOOK);
});

test.describe("the small button inside the engine", () => {
  test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);

  test("« use the company-wide margin » takes a 44px tap and covers none of the choices under it", async ({ page, context }) => {
    await grantOwnerPreview(context.request, "engine");
    await page.clock.setFixedTime(new Date(2026, 8, 24, 12));
    await page.goto("/fr/aarrr-funnel-template");
    await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
    await writeEngineSeed(page, hybridState());
    await page.reload();
    await page.getByTestId("engine-motion-selector").getByRole("button", { name: ENGINE_COPY.hybrid.motionName.slg.fr }).click();
    await page.getByTestId("engine-metric-slg-rev-gross-margin").click();
    const scope = '[data-testid="engine-sheet-slg-rev-gross-margin"]';
    await expect(page.locator(`${scope} ${SMALL}`)).toBeVisible();
    await expectTapTargets(page, `${scope} ${SMALL}`, 1, SMALL_LOOK);
  });
});

test.describe("the small button on the owner's result", () => {
  test.skip(!EMULATOR_HOST, SKIP_EMULATOR_REASON);

  test("the badge's « copy » takes a 44px tap and covers nothing around it", async ({ page }) => {
    const { clear } = REAL_RESULTS;
    await page.goto(`/r/${clear.id}?lang=en`);
    await seedOwnedResult(page, clear.id, clear.total, clear.answers);
    await page.reload();
    await expect(page.getByTestId("badge-copy")).toBeVisible();
    await expectTapTargets(page, `[data-testid="badge-snippet"] ${SMALL}`, 1, SMALL_LOOK);
  });
});

/*
 * A15.1 (2026-10-01): what is not a Button and was drawn, and tapped, under
 * 44px — measured that day on ten pages at 390px with `elementFromPoint` —
 * now composes the same strip (`styles/hit.module.css`). Same three claims
 * per target; the related terms of a glossary page stand in rows, so their
 * claim 2 is the one that counts: at 12px between rows the two rows' strips
 * met and the upper link kept 31px of its 44, hence rows 26px apart.
 *
 * Non-vacuity (2026-10-01): without the shared `::before`, all seven fall on
 * claim 1; with the related terms' rows back at 10px apart, only that test
 * falls (« LTV — Lifetime Value », vertical strip), the six others pass.
 */
const STRIPPED: { where: string; path: string; sel: string; look: Look; minimum: number }[] = [
  { where: "the space band's pills", path: "/en", sel: 'a[class*="SpaceBand-module__"][class*="__pill"]', look: { what: "a 28px pill", max: 30, oneLine: 44 }, minimum: 1 },
  { where: "the wordmark", path: "/en", sel: 'a[class*="WordmarkLink-module__"][class*="__link"]', look: { what: "the wordmark", max: 24, oneLine: 44 }, minimum: 1 },
  { where: "a glossary term's way back", path: "/en/glossary/cac", sel: 'a[class*="__backLink"]', look: { what: "a line of text", max: 24, oneLine: 40 }, minimum: 1 },
  { where: "a glossary term's related terms", path: "/en/glossary/cac", sel: 'a[class*="__relatedLink"]', look: { what: "a line of text", max: 24, oneLine: 40 }, minimum: 3 },
  { where: "the stages of « how it works »", path: "/fr/how-it-works", sel: 'a[class*="__pillarLink"]', look: { what: "a heading", max: 26, oneLine: 40 }, minimum: 5 },
  { where: "the comparisons of « how it works »", path: "/fr/how-it-works", sel: 'a[class*="__comparisonLink"]', look: { what: "a 38px chip", max: 40, oneLine: 44 }, minimum: 4 },
  { where: "the stages of the checklist", path: "/fr/growth-audit-checklist", sel: 'a[class*="__pillarLink"]', look: { what: "a 41px heading", max: 42, oneLine: 50 }, minimum: 5 },
];

for (const { where, path, sel, look, minimum } of STRIPPED) {
  test(`${where} take a 44px tap and cover no neighbour`, async ({ page }) => {
    await page.goto(path);
    await page.locator("main").waitFor();
    await expectTapTargets(page, sel, minimum, look);
  });
}
