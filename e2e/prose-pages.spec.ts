import { expect, test } from "./helpers";

/**
 * The prose pages, as a reader meets them — ds-critique M-1 to M-5, 2026-09-24.
 *
 * What these specs hold is what the refactor onto `ProsePage` / `Callout`
 * was for, measured in the browser rather than inferred from class names:
 *
 * 1. **At most one raised card per page** (M-1). The system's own rule;
 *    How it works had five and every glossary term had two.
 * 2. **No red frame around an aside** (M-2). The limitation / CTA boxes
 *    wore `--border-alert` through an `!important` — a fourth meaning for red.
 * 3. **Running text is read, not scanned** (M-3): 400 weight, full ink, and
 *    a line that stops in the 60-75 character band. The measure is checked
 *    as characters per line on the real rendering, because the token it came
 *    from (`68ch`) looked right and capped nothing — `ch` in Inter is wider
 *    than an average letter, so the cap was wider than the column.
 * 4. **Static cells do not dress as controls** (M-4/M-5): the glossary index
 *    and the comparison table are ruled rows, not bordered boxes.
 */
const PROSE_PAGES = [
  "/en/how-it-works",
  "/fr/glossary/cac",
  "/en/aarrr-vs-okr",
  "/fr/growth-audit-checklist",
  "/en/startup-growth-diagnostic",
  "/fr/about",
  "/en/privacy",
] as const;

test.describe("prose pages", () => {
  test("carry at most one raised card each", async ({ page }) => {
    for (const path of PROSE_PAGES) {
      await page.goto(path);
      const raised = await page
        .locator("main *")
        .evaluateAll((els) => els.filter((el) => getComputedStyle(el).boxShadow.startsWith("rgb") && /7px 7px 0px/.test(getComputedStyle(el).boxShadow)).length);
      expect(raised, path).toBeLessThanOrEqual(1);
    }
  });

  test("frame no aside in red", async ({ page }) => {
    for (const path of ["/en/how-it-works", "/en/aarrr-vs-okr", "/en/growth-audit-checklist", "/fr/startup-growth-diagnostic"]) {
      await page.goto(path);
      // --border-alert / --paint-red is rgb(210, 64, 44). Nothing in <main>
      // on these pages is a diagnosis, so nothing there takes a red edge.
      const redEdges = await page
        .locator("main *")
        .evaluateAll((els) => els.filter((el) => getComputedStyle(el).borderTopColor === "rgb(210, 64, 44)" && getComputedStyle(el).borderTopWidth !== "0px").length);
      expect(redEdges, path).toBe(0);
    }
  });

  test("set running text in the reading type, inside the reading measure", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    for (const path of PROSE_PAGES) {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      const lines = await page.evaluate(() => {
        const out: { weight: string; color: string; cpl: number }[] = [];
        for (const el of document.querySelectorAll("main p, main li")) {
          const cs = getComputedStyle(el);
          if (cs.fontSize !== "17px" || cs.fontWeight !== "400") continue;
          const range = document.createRange();
          range.selectNodeContents(el);
          const count = new Set([...range.getClientRects()].map((r) => Math.round(r.top))).size;
          if (count < 3) continue; // a short paragraph says nothing about the measure
          out.push({ weight: cs.fontWeight, color: cs.color, cpl: (el.textContent ?? "").length / count });
        }
        return out;
      });
      // A floor, so a page whose prose stopped matching cannot pass by measuring nothing.
      expect(lines.length, path).toBeGreaterThan(0);
      for (const line of lines) {
        expect(line.color, path).toBe("rgb(33, 28, 21)"); // --text-body, not the muted grey
        expect(line.cpl, path).toBeLessThanOrEqual(80);
      }
      const average = lines.reduce((sum, l) => sum + l.cpl, 0) / lines.length;
      expect(average, path).toBeLessThanOrEqual(75);
    }
  });

  test("the glossary index and the comparison table are ruled rows, not boxes", async ({ page }) => {
    for (const [path, selector] of [
      ["/en/glossary", "main li a"],
      ["/en/aarrr-vs-okr", "[data-testid=comparison-table] h3 + div > div"],
    ] as const) {
      await page.goto(path);
      const cells = page.locator(selector);
      expect(await cells.count(), path).toBeGreaterThan(3);
      const boxed = await cells.evaluateAll((els) =>
        els.filter((el) => ["Top", "Right", "Bottom", "Left"].every((s) => getComputedStyle(el).getPropertyValue(`border-${s.toLowerCase()}-width`) !== "0px")).length,
      );
      expect(boxed, path).toBe(0);
    }
  });
});
