import { expect, test } from "./helpers";

/**
 * Design system extension 03 §4 and §5 — the landing preview card.
 *
 * Why the landing gets a tone control and the result page does not: the
 * result screen shows exactly two CTAs and a third was refused (R-23). This
 * card is a demo, and a demo you can poke is a stronger promise that a roast
 * exists than a line of copy saying so.
 *
 * What the toggle may change is the narrow part, and it is what these specs
 * pin: the verdict sentence, and the colour of the bottleneck name. The
 * frame, the shadow, the chips and the action stay put — the full roast
 * treatment would put a red raised card beside the primary CTA and break the
 * one-primary rule, and it would promise a real roast result from a sample.
 */

test.describe("the preview card mirrors the result", () => {
  test("shows a score, the stage holding it back, the pillars and the next move", async ({ page }) => {
    await page.goto("/en");
    const card = page.getByTestId("preview-card");
    await expect(card).toContainText("Overall Growth Score");
    await expect(card).toContainText("74");
    await expect(card.getByTestId("preview-bottleneck")).toContainText("One stage holding you back");
    await expect(card.getByTestId("preview-bottleneck")).toContainText("Retention");
    await expect(card.getByTestId("preview-move")).toContainText("Next move");
    await expect(card.getByTestId("preview-move")).toContainText("Take one month's cohort of new users");
  });

  test("is translated, action included", async ({ page }) => {
    await page.goto("/fr");
    const card = page.getByTestId("preview-card");
    await expect(card.getByTestId("preview-bottleneck")).toContainText("Une étape te freine");
    await expect(card.getByTestId("preview-move")).toContainText("Prends la cohorte de nouveaux utilisateurs");
  });
});

test.describe("the tone toggle on the card", () => {
  test("starts neutral, and switching swaps the verdict and reddens the stage", async ({ page }) => {
    await page.goto("/en");
    const card = page.getByTestId("preview-card");
    const toggle = card.getByRole("group", { name: /tone|ton/i });
    await expect(toggle).toBeVisible();

    // SPEC.md §6bis: neutral is the explicit default, everywhere.
    await expect(toggle.getByRole("button", { name: /straight up/i })).toHaveAttribute("aria-pressed", "true");

    const name = card.locator('[data-testid="preview-bottleneck"] span').first();
    const before = {
      verdict: await card.getByTestId("preview-bottleneck").textContent(),
      colour: await name.evaluate((el) => getComputedStyle(el).color),
    };

    await toggle.getByRole("button", { name: /roast/i }).click();

    const after = {
      verdict: await card.getByTestId("preview-bottleneck").textContent(),
      colour: await name.evaluate((el) => getComputedStyle(el).color),
    };

    expect(after.verdict).not.toBe(before.verdict);
    // --paint-red, the large-text red. The AA-safe --paint-red-deep is for
    // small text; at 30px stencil 700 this pair measures 4.42:1 against a
    // 3:1 floor.
    expect(after.colour).toBe("rgb(210, 64, 44)");
    expect(before.colour).not.toBe(after.colour);
  });

  test("changes the tone and nothing else — the card is still a sample, not a roast result", async ({ page }) => {
    await page.goto("/en");
    const card = page.getByTestId("preview-card");
    const frameBefore = await card.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { border: cs.borderColor, shadow: cs.boxShadow };
    });
    const chipsBefore = await card.getByTestId("preview-move").textContent();

    await card.getByRole("button", { name: /roast/i }).click();

    const frameAfter = await card.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { border: cs.borderColor, shadow: cs.boxShadow };
    });
    expect(frameAfter).toEqual(frameBefore);
    // The action has no roast variant: an action that mocks you is not an action.
    expect(await card.getByTestId("preview-move").textContent()).toBe(chipsBefore);
  });

  test("is on the card at phone width too, and nothing overflows", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/fr");
    // It lives in the card, not the header — the header is full since R-21.
    const toggle = page.getByTestId("preview-card").getByRole("group", { name: /ton|tone/i });
    await expect(toggle).toBeVisible();
    const { sw, cw } = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }));
    expect(sw).toBe(cw);
  });
});

test.describe("the problem statement", () => {
  for (const [locale, text] of [
    ["en", "Growth rarely stalls everywhere at once."],
    ["fr", "La croissance cale rarement partout à la fois."],
  ] as const) {
    test(`says the problem before showing the sample, in ${locale}`, async ({ page }) => {
      await page.goto(`/${locale}`);
      const problem = page.getByTestId("landing-problem");
      await expect(problem).toContainText(text);

      // Above the card at both widths — it is the claim the card is evidence for.
      const p = (await problem.boundingBox())!;
      const card = (await page.getByTestId("preview-card").boundingBox())!;
      expect(p.y).toBeLessThan(card.y);
    });
  }

  test("is above the card on a phone too, where the columns stack", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en");
    const p = (await page.getByTestId("landing-problem").boundingBox())!;
    const card = (await page.getByTestId("preview-card").boundingBox())!;
    expect(p.y).toBeLessThan(card.y);
  });
});
