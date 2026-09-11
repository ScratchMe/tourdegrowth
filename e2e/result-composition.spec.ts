import { expect, test } from "./helpers";

/**
 * Design system extension 03 — the result page recomposed.
 *
 * What this pins is the READING ORDER, because that is the change and it is
 * the thing a stylesheet edit can silently undo. Mobile is one column and the
 * order the design asks for is not "everything in the left column, then
 * everything in the right": the action sits directly under the score card,
 * and the share block after the CTA. `ResultView.module.css` gets that with
 * `display: contents` plus `order`, which is exactly the kind of rule that
 * looks right in a diff and lands wrong in a browser.
 *
 * `/r/sample` is the only result page that renders without Firestore, and it
 * carries no id, so it is always the visitor variant. The owner variant —
 * the upgrade seam inside the action card, and the CTA row without a share
 * button — was checked by hand with a local, never-committed patch, the same
 * method R-12 and R2-02 used. Said here rather than left implied.
 */

/** Vertical position in the rendered page, so the assertion is about what a reader sees. */
async function topOf(page: import("@playwright/test").Page, testId: string) {
  const box = await page.getByTestId(testId).boundingBox();
  expect(box, `${testId} is not on the page`).not.toBeNull();
  return box!.y;
}

test.describe("the result page reads in one order on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("score and bottleneck, then the action, then the evidence, then sharing", async ({ page }) => {
    await page.goto("/r/sample?lang=en");
    await page.locator("main").waitFor();

    const bottleneck = await topOf(page, "bottleneck");
    const move = await topOf(page, "priority-move");
    const pitch = await topOf(page, "visitor-pitch");
    const cta = await topOf(page, "own-tour-cta");
    const share = await topOf(page, "share-card");

    // The whole point of the recomposition: the action is reachable without
    // scrolling past the strengths.
    expect(bottleneck).toBeLessThan(move);
    expect(move).toBeLessThan(pitch);
    expect(pitch).toBeLessThan(cta);
    // ...and the share block comes after the CTA, not before it.
    expect(cta).toBeLessThan(share);
  });

  test("nothing overflows sideways", async ({ page }) => {
    await page.goto("/r/sample?lang=fr");
    await page.locator("main").waitFor();
    const { sw, cw } = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }));
    expect(sw).toBe(cw);
  });
});

test.describe("the bottleneck block", () => {
  test("replaces the floating verdict line and names the stage with its score", async ({ page }) => {
    await page.goto("/r/sample?lang=en");
    const block = page.getByTestId("bottleneck");
    await expect(block).toBeVisible();

    // The sample is 18/12/8/16/20 — retention is 4 clear of activation, so
    // the claim is earned and exactly one stage is named.
    await expect(block).toContainText("One stage holding you back");
    await expect(block).toContainText("Retention");
    await expect(block).toContainText("8");
    // The verdict sentence closed the block rather than leaving with it.
    await expect(block).toContainText("Retention is lagging, and the rest of the engine isn't solid enough to cover for it.");

    /* The sample was itself one of the boards the old library got wrong: with
       activation at 12/20 the engine is NOT solid, yet every headline used to
       open "Solid engine overall", and the retention line counted the problem
       ("one flat tyre") under a label that counts the bottleneck group.
       Asserted as properties as well as text, because these two survive a
       copy edit while the sentence above does not. */
    await expect(block).not.toContainText("Solid engine");
    await expect(block).not.toContainText("flat tyre");

    // And it lives INSIDE the raised score card, under the numeral — not as
    // a second element somewhere else on the page. Measured, because the
    // first version of this assertion looked for a test id on the block
    // itself and could only ever pass.
    const card = (await page.locator('[class*="slotScore"]').boundingBox())!;
    const box = (await block.boundingBox())!;
    await expect(page.locator('[class*="slotScore"]')).toContainText("74");
    expect(box.y).toBeGreaterThan(card.y);
    expect(box.y + box.height).toBeLessThanOrEqual(card.y + card.height + 1);
  });

  test("says it in the reader's language, not the author's", async ({ page }) => {
    await page.goto("/r/sample?lang=fr");
    await expect(page.getByTestId("bottleneck")).toContainText("Une étape te freine");
  });
});

test.describe("the next move", () => {
  test("is shown to a visitor, and names the stage it belongs to", async ({ page }) => {
    // A visitor has no answers on their device to derive an action from, so
    // this only works because it is resolved on the server. It is also what
    // makes a shared link worth opening.
    await page.goto("/r/sample?lang=en");
    const move = page.getByTestId("priority-move");
    await expect(move).toBeVisible();
    await expect(move).toContainText("Next move");
    await expect(move).toContainText("Retention");
    await expect(move).toContainText("Take one month's cohort of new users");
  });

  test("offers no Deep dive to someone who does not own the result", async ({ page }) => {
    await page.goto("/r/sample?lang=en");
    await page.locator("main").waitFor();
    // R-01: the id in a shared link is not proof of ownership, and clicking
    // this used to fill the SHARER's result with the clicker's context.
    await expect(page.getByTestId("deep-dive-cta")).toHaveCount(0);
  });

  test("is translated for the reader", async ({ page }) => {
    await page.goto("/r/sample?lang=fr");
    await expect(page.getByTestId("priority-move")).toContainText("Prochaine action");
  });
});

test.describe("the share block", () => {
  test("shows this result's own image, with a way to share it and a way to keep it", async ({ page }) => {
    await page.goto("/r/sample?lang=en");
    const card = page.getByTestId("share-card");
    await expect(card).toBeVisible();

    const img = card.locator("img");
    await expect(img).toHaveAttribute("src", "/r/sample/opengraph-image");
    // An alt that repeated the caption would tell a screen-reader user
    // nothing about THIS result.
    await expect(img).toHaveAttribute("alt", /74\/100/);
    // And it actually loads when a reader reaches it — a broken image here is
    // the whole block's point lost. Scrolled first because the image is
    // `loading="lazy"`: on a phone it sits well below the fold, and fetching
    // ~73 KB plus a server-side render for readers who never get there was
    // the cost this block quietly added to every result view.
    await img.scrollIntoViewIfNeeded();
    await expect
      .poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth))
      .toBeGreaterThan(0);

    await expect(card.getByRole("button", { name: "Share this result" })).toBeVisible();
    await expect(card.getByRole("link", { name: "Save image" })).toHaveAttribute("download", /\.png$/);
  });

  test("takes sharing out of the CTA row, which keeps the primary alone", async ({ page }) => {
    await page.goto("/r/sample?lang=en");
    await page.locator("main").waitFor();
    // Exactly one share control on the page, and it is in the block.
    const share = page.getByRole("button", { name: /Share this result/i });
    await expect(share).toHaveCount(1);
    const inCard = await share.evaluate((el) => Boolean(el.closest('[data-testid="share-card"]')));
    expect(inCard).toBe(true);
  });
});

/**
 * `order` moves boxes, not the document — so every step of it is a step where
 * what a screen reader announces and what the Tab key visits disagree with
 * what a sighted reader sees. That is a real cost of the mobile order above,
 * and the honest thing is to bound it and check the bound rather than to
 * assert it away.
 *
 * Measured before the share block was lifted out of the left column: worst
 * displacement 4 — a whole card with two controls, announced third and shown
 * seventh. After: 1, two adjacent swaps (the action and the pillar grid trade
 * places, and the share block is announced after the disclaimer rather than
 * before it). If a future stylesheet edit widens that again, this fails.
 *
 * IMPORTANT — what this can and cannot see. `/r/sample` carries no `id` and
 * no `breakdown` prop, so it is structurally always the VISITOR variant; the
 * owner's own page also renders the score breakdown, which puts the share
 * block 2 places out instead of 1. That variant needs Firestore and so
 * cannot be rendered here: it is computed from the source and the stylesheet,
 * for all four combinations, in `src/__tests__/result-reading-order.test.ts`.
 * This spec's job is to prove the browser really lays out the way those two
 * files say it does — not to stand in for the variants it cannot render.
 */
test.describe("what the reading order costs is bounded, and checked", () => {
  const SLOTS = [
    "slotScore",
    "slotMove",
    "slotPillars",
    "slotStrengths",
    "slotWeaknesses",
    "slotCredit",
    "slotCta",
    "slotShare",
    "slotDisclaimer",
    "slotBreakdown",
  ];

  test("no block on a visitor's phone is more than one place from where it is announced", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/r/sample?lang=en");
    await page.locator("main").waitFor();

    const blocks = await page.evaluate((slots) => {
      const wanted = slots
        .map((s) => document.querySelector(`[class*="${s}"]`))
        .filter((el): el is Element => el !== null);
      // Document order, taken from the document rather than from the query
      // order, so this measures the sequence a screen reader follows.
      return [...document.querySelectorAll("*")]
        .filter((el) => wanted.includes(el))
        .map((el, dom) => ({
          slot: slots.find((s) => String(el.className).includes(s))!,
          dom,
          top: Math.round(el.getBoundingClientRect().top + window.scrollY),
        }));
    }, SLOTS);

    expect(blocks.length, "the slot class names moved — this measures nothing now").toBeGreaterThan(6);

    const visual = [...blocks].sort((a, b) => a.top - b.top);
    const displaced = visual
      .map((b, visualIndex) => ({ slot: b.slot, delta: Math.abs(visualIndex - b.dom) }))
      .filter((b) => b.delta > 1);

    expect(displaced, "a block is announced more than one place from where it is shown").toEqual([]);
  });
});

test.describe("the stretched pillar rows", () => {
  /*
   * The row has FOUR flex children — score, "/20", pillar name, glossary
   * trigger — so `justify-content: space-between` spread all three gaps and
   * the row read "18 … /20 … Acquisition … ?" in production for a month.
   * One auto margin on the name takes the free space instead.
   *
   * Measured, not asserted from a class name: a rule can be present and
   * beaten. What matters is that the score reads as one unit with its
   * denominator, and that the free space sits between the two halves.
   *
   * Deliberately NOT measuring the gap between the name and the "?": that
   * 4px is a margin on the button INSIDE the trigger's anchor, not a gap
   * between flex items, so it would measure something else entirely.
   */
  test("pair the score with its denominator and push the name right", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/r/sample?lang=en");
    await page.locator('[class*="pillarGrid"]').first().waitFor();

    const rows = await page.evaluate(() => {
      // Each grid cell is an unclassed wrapper div; the chip is inside it.
      const chips = document.querySelectorAll('[class*="pillarGrid"] [class*="chip"]');
      return [...chips].map((chip) => {
        const score = chip.querySelector('[class*="score"]')!.getBoundingClientRect();
        // The denominator is the only child with no class of its own.
        const denom = [...chip.children]
          .find((c) => c.tagName === "SPAN" && !c.className)!
          .getBoundingClientRect();
        const label = chip.querySelector('[class*="label"]')!.getBoundingClientRect();
        return {
          name: chip.querySelector('[class*="label"]')!.textContent,
          scoreToDenom: Math.round(denom.left - score.right),
          denomToLabel: Math.round(label.left - denom.right),
          width: Math.round(chip.getBoundingClientRect().width),
        };
      });
    });

    expect(rows.length, "the pillar grid moved — this measures nothing now").toBe(5);
    for (const row of rows) {
      expect(row.width, `${row.name}: the row should fill the column`).toBeGreaterThan(300);
      expect(row.scoreToDenom, `${row.name}: "18" and "/20" must read as one unit`).toBeLessThanOrEqual(2);
      expect(row.denomToLabel, `${row.name}: the free space belongs between the two halves`).toBeGreaterThan(60);
    }
  });
});
