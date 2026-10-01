import type { Page } from "@playwright/test";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { getSubmissionById } from "@/lib/submissions/repository";
import { expect, seedOwnedResult, test } from "./helpers";
import { EMULATOR_HOST, REAL_DEEP_DIVE, REAL_RESULTS, SENTINEL, SKIP_EMULATOR_REASON } from "./real-results";

/**
 * A real `/r/<id>`, read from the Firestore emulator — CHANTIERS.md A7.11
 * (C17). Until now every composition spec went through `/r/sample`, a branch
 * of its own that never reads Firestore and never renders the owner's view:
 * the path readers actually take — a stored document, narrowed by the view
 * model, serialised to the client — had no e2e at all. The results are
 * written by `global-setup.ts`; see `real-results.ts` for why the emulator
 * and not a test door.
 */
test.skip(!EMULATOR_HOST, SKIP_EMULATOR_REASON);

const GAME_OPEN = process.env.GAME_ENABLED === "true";
const { clear, shared, level, deep, twoLevels } = REAL_RESULTS;

/** Every key of a stored document, nested ones included — the answers map's question ids among them. */
function keysOf(value: unknown, into = new Set<string>()): Set<string> {
  if (Array.isArray(value)) value.forEach((item) => keysOf(item, into));
  else if (value && typeof value === "object") {
    for (const [key, inner] of Object.entries(value)) {
      into.add(key);
      keysOf(inner, into);
    }
  }
  return into;
}

/** Whether `key` crosses as a JSON key: in the HTML, or in the RSC payload, where its quotes are escaped. */
function crossesAsKey(html: string, key: string): boolean {
  const k = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\\\?"${k}\\\\?"\\s*:`).test(html);
}

/**
 * The stored keys the page is allowed to carry to the browser, each for a
 * reason the page can name. Everything else a document holds stays on the
 * server — and "everything else" is read from the stored document itself, so
 * a field `createSubmissionFlow` or `saveDeepDive` starts writing next month
 * is checked the day it is written, without anyone remembering to list it
 * (NEXTJS.md §1.8, convention 11: a guard counts what crosses, it does not
 * name props). What the fixtures do not write, it cannot see: that is why
 * `deep` carries every field a Deep dive document can hold.
 */
const CROSSES_BY_DESIGN: Record<string, string> = {
  id: "the result's own address, in its links and its share image",
  pillars: "the NARROWED rows (`toPillarViews`): the array's name crosses, the stored rows do not",
  pillar: "each stage's name, on its row",
  score: "each stage's points, on its row",
  total: "the score, the page's first line",
  weakestPillar: "the lowest stage, which the bottleneck block names anyway",
  segment: "the author's stage and model, named in the benchmark line when a segment average exists",
  tone: "the verdicts' voice, chosen by the author",
  locale: "the author's language, which the share image keeps",
  createdAt: "the date the owner's Tour is kept under on this device",
  deepDive: "the NARROWED Deep dive (`toDeepDiveView`), null without one",
  verdicts: "the Deep dive's two tones, narrowed",
  neutral: "one tone's sentences",
  roast: "the other tone's sentences",
  pillarRecommendations: "the Deep dive's line per stage",
  priorityAction: "the Deep dive's one action",
  acquisition: "a stage, keying its Deep dive line",
  activation: "a stage, keying its Deep dive line",
  retention: "a stage, keying its Deep dive line",
  referral: "a stage, keying its Deep dive line",
  revenue: "a stage, keying its Deep dive line",
};

test.describe("a real result's payload", () => {
  for (const [name, result] of Object.entries(REAL_RESULTS)) {
    test(`carries nothing stored-only (${name}, ${result.total}/100)`, async ({ request }) => {
      const stored = await getSubmissionById(result.id);
      expect(stored, `global-setup.ts did not write ${result.id}`).not.toBeNull();
      const keys = [...keysOf(stored)];
      // A guard that reads nothing proves nothing: the document really holds
      // the fields that leaked before, and the answers keyed by question id.
      expect(keys).toEqual(expect.arrayContaining(["rawPoints", "answers", "ownerTokenHash", "acq-1"]));

      const html = await (await request.get(`/r/${result.id}?lang=en`)).text();
      expect(html).toContain(`${result.total}/100`);

      const leaked = keys.filter((key) => !(key in CROSSES_BY_DESIGN) && crossesAsKey(html, key));
      expect(leaked, "stored-only fields in the public payload").toEqual([]);
      expect(html).not.toContain(stored!.ownerTokenHash);
      expect(html, "a stored-only value crossed").not.toContain(SENTINEL);
    });
  }

  test("the Deep dive's stored-only fields are in the document, and only there", async ({ request }) => {
    const stored = await getSubmissionById(deep.id);
    expect([...keysOf(stored)]).toEqual(expect.arrayContaining(["modelUsed", "freeContext", "contextAnswers", "freeContextProvided"]));
    const html = await (await request.get(`/r/${deep.id}?lang=en`)).text();
    // The narrowed Deep dive did cross — so the sentinel's absence means something.
    expect(html).toContain(REAL_DEEP_DIVE.verdicts.neutral.priorityAction);
    expect(html).not.toContain(SENTINEL);
  });
});

test("a Deep dive replaces the free action with its own, for a visitor too", async ({ page }) => {
  await page.goto(`/r/${deep.id}?lang=en`);
  await expect(page.getByTestId("priority-move")).toContainText(REAL_DEEP_DIVE.verdicts.neutral.priorityAction);
});

test.describe("a visitor's view of a clear bottleneck", () => {
  test("names the stage, gives the action, and offers no Deep dive nor breakdown", async ({ page }) => {
    await page.goto(`/r/${clear.id}?lang=en`);
    const block = page.getByTestId("bottleneck");
    await expect(block).toBeVisible();
    await expect(block).toContainText("Retention");
    await expect(page.locator('[class*="slotScore"]')).toContainText(String(clear.total));

    const move = page.getByTestId("priority-move");
    await expect(move).toBeVisible();
    await expect(move).toContainText("Retention");

    await expect(page.getByTestId("deep-dive-cta")).toHaveCount(0);
    await expect(page.getByTestId("score-breakdown")).toHaveCount(0);
  });

  test("shows this result's own share image, and it loads", async ({ page, request }) => {
    await page.goto(`/r/${clear.id}?lang=en`);
    const img = page.getByTestId("share-card").locator("img");
    await expect(img).toHaveAttribute("src", new RegExp(`^/r/${clear.id}/share/[a-f0-9]{12}\\.png$`));
    await expect(img).toHaveAttribute("alt", new RegExp(`${clear.total}/100`));
    const src = (await img.getAttribute("src"))!;
    const response = await request.get(src);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("image/png");
  });

  test("offers the game on its retention bottleneck", async ({ page }) => {
    test.skip(!GAME_OPEN, "GAME_ENABLED is not \"true\" for this build: the card only exists with the game open.");
    await page.goto(`/r/${clear.id}?lang=en`);
    const entry = page.getByTestId("game-entry");
    await expect(entry).toBeVisible();
    await expect(page.getByTestId("game-entry-cta")).toHaveAttribute("href", /^\/en\/game\/retention(\?|$)/);
  });

  test("offers level 2 on an acquisition bottleneck, as the Deep dive door (A12.f)", async ({ page }) => {
    test.skip(!GAME_OPEN, "GAME_ENABLED is not \"true\" for this build: the card only exists with the game open.");
    await page.goto(`/r/${deep.id}?lang=en`);
    await expect(page.getByTestId("game-entry")).toBeVisible();
    await expect(page.getByTestId("game-entry-cta")).toHaveAttribute("href", "/en/game/acquisition?from=deep_dive");
    // Level 2's number in level 2's format: new customers, never a percentage.
    await expect(page.getByTestId("game-entry-band")).toContainText("New customers 2,000");
  });

  test("offers BOTH levels on one card when acquisition and retention tie at the bottom (C30 Q5)", async ({ page }) => {
    test.skip(!GAME_OPEN, "GAME_ENABLED is not \"true\" for this build: the card only exists with the game open.");
    await page.goto(`/r/${twoLevels.id}?lang=en`);
    // One card, never two.
    await expect(page.getByTestId("game-entry")).toHaveCount(1);
    await expect(page.getByTestId("game-entry")).toHaveAttribute("data-levels", "2");
    await expect(page.getByTestId("game-entry").getByRole("heading", { level: 2 })).toHaveText("The dark side of your stages");
    // Stage by stage, lowest first: the reader chooses, AARRR order does not.
    const ctas = page.getByTestId("game-entry-cta");
    await expect(ctas).toHaveCount(2);
    await expect(ctas.nth(0)).toHaveAttribute("href", "/en/game/acquisition?from=result");
    await expect(ctas.nth(1)).toHaveAttribute("href", "/en/game/retention?from=result");
    await expect(page.getByTestId("game-entry-band")).toContainText("New customers 2,000");
    await expect(page.getByTestId("game-entry-band")).toContainText("Churn 6.0%");
  });
});

test.describe("the owner's view", () => {
  test("adds the breakdown and the Deep dive, on the same stored result", async ({ page }) => {
    await page.goto(`/r/${clear.id}?lang=en`);
    await expect(page.getByTestId("score-breakdown")).toHaveCount(0);
    await seedOwnedResult(page, clear.id, clear.total, clear.answers);
    await page.reload();
    await expect(page.getByTestId("score-breakdown")).toBeVisible();
    await expect(page.getByTestId("deep-dive-cta")).toBeVisible();
  });

  /*
   * Engine spec §19.10 (C32 Q16, A14 T6): under the action, for its owner
   * only, a way into the engine — and only on a build that opened it. The CI
   * builds it closed: the line must then be absent; `ENGINE_ENABLED=true` at
   * build and test time checks the open side.
   */
  test("offers its owner the engine under the action — only on a build that opened it, never to a visitor", async ({ page }) => {
    const entry = page.getByTestId("result-engine-entry");
    await page.goto(`/r/${clear.id}?lang=en`);
    await expect(page.getByTestId("priority-move")).toBeVisible();
    await expect(entry).toHaveCount(0);
    await seedOwnedResult(page, clear.id, clear.total, clear.answers);
    await page.reload();
    await expect(page.getByTestId("score-breakdown")).toBeVisible();
    if (process.env.ENGINE_ENABLED === "true") {
      await expect(entry).toHaveText(tc(UI_STRINGS.result.engineEntry, "en"));
      await expect(entry).toHaveAttribute("href", "/en/aarrr-funnel-template");
    } else {
      await expect(entry).toHaveCount(0);
    }
  });
});

test.describe("the other two states of the bottleneck block", () => {
  test("a shared bottleneck names both stages, in the reader's language", async ({ page }) => {
    await page.goto(`/r/${shared.id}?lang=fr`);
    const block = page.getByTestId("bottleneck");
    await expect(block).toContainText("Activation");
    await expect(block).toContainText("Retention");
  });

  test("a level board names no stage, and carries no game card", async ({ page }) => {
    await page.goto(`/r/${level.id}?lang=fr`);
    await expect(page.locator('[class*="slotScore"]')).toContainText(String(level.total));
    const block = page.getByTestId("bottleneck");
    await expect(block).toBeVisible();
    for (const stage of ["Acquisition", "Activation", "Retention", "Referral", "Revenue"]) {
      await expect(block).not.toContainText(stage);
    }
    await expect(page.getByTestId("game-entry")).toHaveCount(0);
  });
});

/** Every visible filled button — the Button recipe's `primary` class, whatever the element. */
function visiblePrimaries(page: Page) {
  return page.locator('a[class*="__primary"]:visible, button[class*="__primary"]:visible');
}

/** Cumulative layout shift since navigation, as the browser counts it (`layout-shift` entries, no input). */
async function trackShifts(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as unknown as { __cls: number };
    w.__cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
        if (!entry.hadRecentInput) w.__cls += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
}

/**
 * C16, decided 2026-09-29 (CHANTIERS.md A7.10): on the owner's own result,
 * « Partager ce résultat » is the one primary and « Refaire le Tour » steps
 * down to secondary. On a phone the share block comes before the CTA row, so
 * the primary is never under a secondary. The visitor does not change.
 *
 * `isOwner` is only known after mount, so the owner's page first paints as
 * the visitor's: the shift that follows is measured, and must stay under
 * 0.1, the "good" CLS threshold — it happens ~1700px down on a phone, below
 * the first screen, where the browser does not count it.
 */
test.describe("the owner's primary is sharing (C16)", () => {
  for (const locale of ["en", "fr"] as const) {
    for (const width of [1280, 390]) {
      test(`${locale} at ${width}px: sharing is the one visible primary, retaking is secondary`, async ({ page }) => {
        await page.setViewportSize({ width, height: 844 });
        await page.goto(`/r/${clear.id}?lang=${locale}`);
        await seedOwnedResult(page, clear.id, clear.total, clear.answers);
        await trackShifts(page);
        await page.reload();
        const retake = page.getByTestId("take-again-cta");
        await expect(retake).toBeVisible();
        await expect(retake).toHaveClass(/__secondary/);
        await expect(retake).toHaveText(tc(UI_STRINGS.result.ctaAgain, locale));

        const primaries = visiblePrimaries(page);
        await expect(primaries).toHaveCount(1);
        await expect(primaries.first()).toHaveAttribute("data-testid", "share-button");
        await expect(primaries.first()).toHaveText(tc(UI_STRINGS.result.ctaShareResult, locale));

        const share = (await page.getByTestId("share-card").boundingBox())!;
        const cta = (await retake.boundingBox())!;
        if (width === 390) expect(share.y, "on a phone the share block comes first").toBeLessThan(cta.y);

        const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
        expect(cls, "layout shift when the owner's view replaces the visitor's").toBeLessThan(0.1);
      });
    }
  }

  test("a visitor keeps their own Tour as the primary, with sharing secondary and after it on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/r/${clear.id}?lang=en`);
    const own = page.getByTestId("own-tour-cta");
    await expect(own).toBeVisible();
    const primaries = visiblePrimaries(page);
    await expect(primaries).toHaveCount(1);
    await expect(primaries.first()).toHaveAttribute("data-testid", "own-tour-cta");
    await expect(page.getByTestId("share-button")).toHaveClass(/__secondary/);
    const share = (await page.getByTestId("share-card").boundingBox())!;
    const cta = (await own.boundingBox())!;
    expect(share.y).toBeGreaterThan(cta.y);
  });
});
