import { expect, test } from "./helpers";
import type { Page } from "@playwright/test";

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
