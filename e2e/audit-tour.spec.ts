import AxeBuilder from "@axe-core/playwright";
import { ADMIN_PASSWORD, SKIP_ADMIN_REASON, adminCredentials, expect, test } from "./helpers";

/**
 * AUDIT-PLAN.md §3.4/1.4 — the auditor's Tour, and the method × reality
 * crossing it unlocks.
 *
 * Two rules carry this screen, and both are easy to break from JSX without
 * anything failing until an export is refused weeks later:
 *
 * 1. **The score exists at 15/15 and not before.** A partial score would put
 *    a number into the coverage that is still going to move, which is exactly
 *    what "documented" must never mean. The `m19` row follows it: measured at
 *    fifteen, pending at fourteen.
 * 2. **A blind spot needs one answer, not fifteen.** The crossing is made
 *    question by question, so a single 20-point answer against an absent row
 *    reveals one. Tying it to the score would make the most valuable finding
 *    of the exercise wait for the end of the interviews.
 */
test.describe("the auditor's Tour", () => {
  test.skip(ADMIN_PASSWORD === "", SKIP_ADMIN_REASON);
  test.use({ httpCredentials: adminCredentials });

  type Page = import("@playwright/test").Page;

  async function openMission(page: Page) {
    await page.goto("/admin/audit");
    await page.getByTestId("new-mission").click();
    await page.locator("#company").fill("Acme Analytics");
    await page.getByTestId("create-mission").click();
    await expect(page.getByTestId("row-list")).toBeVisible();
  }

  /** Answers `count` questions by taking each one's first option. */
  async function answer(page: Page, count: number) {
    const questions = page.getByTestId("tour-questions").locator("> li");
    for (let index = 0; index < count; index++) {
      await questions.nth(index).getByRole("button").first().click();
    }
  }

  test("the warning says whose answers these are, before anything is answered", async ({ page }) => {
    await openMission(page);
    await page.getByTestId("open-tour").click();

    // The distinction is not rhetorical: a team's self-assessment and a third
    // party's finding are different objects, and mixing them would put a
    // number in the diagnosis that could not be defended.
    await expect(page.getByTestId("tour-warning")).toContainText("jamais une auto-évaluation");
    await expect(page.getByTestId("tour-questions").locator("> li")).toHaveCount(15);
    await expect(page.getByTestId("tour-progress")).toHaveText("0 sur 15 répondues");
  });

  test("fourteen answers show no score, and leave m19 pending", async ({ page }) => {
    await openMission(page);
    await page.getByTestId("open-tour").click();
    await answer(page, 14);

    await expect(page.getByTestId("tour-progress")).toHaveText("14 sur 15 répondues");
    await expect(page.getByTestId("tour-score")).toHaveCount(0);
    await expect(page.getByTestId("tour-score-pending")).toBeVisible();

    await page.getByTestId("close-tour").click();
    await expect(page.getByTestId("status-m19")).toHaveText("En attente");
  });

  test("the fifteenth answer produces the score and the m19 row at once", async ({ page }) => {
    await openMission(page);
    await page.getByTestId("open-tour").click();
    await answer(page, 15);

    const score = page.getByTestId("tour-score");
    await expect(score).toBeVisible();
    // Always with its breakdown: a score out of 100 with no detail is exactly
    // what the catalog forbids doing with this line (`m19`, trap).
    for (const pillar of ["acquisition", "activation", "retention", "referral", "revenue"]) {
      await expect(page.getByTestId(`tour-pillar-${pillar}`)).toBeVisible();
    }

    // `m19` is never typed in — it is produced, here or nowhere.
    await page.getByTestId("close-tour").click();
    await expect(page.getByTestId("status-m19")).toHaveText("Mesuré");
  });

  test("the score and the produced row survive a reload — they were written, not held in memory", async ({ page }) => {
    await openMission(page);
    await page.getByTestId("open-tour").click();
    await answer(page, 15);
    await expect(page.getByTestId("tour-score")).toBeVisible();

    await page.reload();
    await page.getByTestId("open-mission").first().click();
    await expect(page.getByTestId("status-m19")).toHaveText("Mesuré");
    await page.getByTestId("open-tour").click();
    await expect(page.getByTestId("tour-progress")).toHaveText("15 sur 15 répondues");
    await expect(page.getByTestId("tour-score")).toBeVisible();
  });

  test("the produced row exports cleanly — its definition goes with it", async ({ page }) => {
    await openMission(page);
    await page.getByTestId("open-tour").click();
    await answer(page, 15);
    await page.getByTestId("close-tour").click();

    const download = page.waitForEvent("download");
    await page.getByTestId("export-mission").click();
    const stream = await (await download).createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    const file = JSON.parse(Buffer.concat(chunks).toString("utf8"));

    const m19 = file.passes[0].entries.find((e: { metricId: string }) => e.metricId === "m19");
    expect(m19.status).toBe("measured");
    expect(m19.observations).toHaveLength(1);
    expect(typeof m19.observations[0].value).toBe("number");
    // The definition the validator demands of a measured row — without it the
    // export would refuse precisely the line the tool produces best.
    expect(file.definitions[m19.definitionRef]).toBeTruthy();
    expect(file.definitions[m19.definitionRef].unit).toBe("points sur 100");
  });
});

test.describe("the restitution view", () => {
  test.skip(ADMIN_PASSWORD === "", SKIP_ADMIN_REASON);
  test.use({ httpCredentials: adminCredentials });

  type Page = import("@playwright/test").Page;

  async function openMission(page: Page) {
    await page.goto("/admin/audit");
    await page.getByTestId("new-mission").click();
    await page.locator("#company").fill("Acme Analytics");
    await page.getByTestId("create-mission").click();
    await expect(page.getByTestId("row-list")).toBeVisible();
  }

  /** Marks `m09` (the CAC row, `tourQuestionId: acq-3`) as absent. */
  async function markCacAbsent(page: Page) {
    await page.getByTestId("open-row-m09").click();
    await page.locator("#status").selectOption("absent");
    await page.locator("#absentCause").selectOption("not-instrumented");
    await page.locator("#repairScale").selectOption("quarter");
    await page.getByTestId("save-row").click();
    await expect(page.getByTestId("status-m09")).toHaveText("L'entreprise ne l'a pas");
  }

  /** Answers `acq-3` — the CAC question — with its 20-point option. */
  async function claimTheyMeasureCac(page: Page) {
    await page.getByTestId("open-tour").click();
    const question = page.getByTestId("tour-question-acq-3");
    await question.getByRole("button", { name: /20 pts/ }).click();
    await page.getByTestId("close-tour").click();
  }

  test("an empty Tour establishes no blind spot, and says so rather than showing none", async ({ page }) => {
    await openMission(page);
    await markCacAbsent(page);
    await page.getByTestId("open-restitution").click();

    // "No blind spots" would be a claim. There is nothing to cross yet.
    await expect(page.getByTestId("blind-spots-need-tour")).toBeVisible();
    await expect(page.getByTestId("blind-spots")).toHaveCount(0);
    await expect(page.getByTestId("quadrant-m09")).toHaveText("Écart connu");
  });

  test("one 20-point answer against an absent row is a blind spot — fourteen more are not needed", async ({ page }) => {
    await openMission(page);
    await markCacAbsent(page);
    await claimTheyMeasureCac(page);
    await page.getByTestId("open-restitution").click();

    await expect(page.getByTestId("blind-spots")).toBeVisible();
    await expect(page.getByTestId("blind-spot-m09")).toBeVisible();
    await expect(page.getByTestId("quadrant-m09")).toContainText("Angle mort");
    // Highlighted, not moved: an étape concentrating three of them is a
    // finding in itself, and pulling them out of their pillar would hide it.
    await expect(page.getByTestId("restitution-acquisition").getByTestId("restitution-row-m09")).toBeVisible();
  });

  test("both screens lead back to the mission — neither is a dead end", async ({ page }) => {
    await openMission(page);
    await page.getByTestId("open-tour").click();
    await page.getByTestId("close-tour").click();
    await expect(page.getByTestId("row-list")).toBeVisible();

    await page.getByTestId("open-restitution").click();
    await page.getByTestId("close-restitution").click();
    await expect(page.getByTestId("row-list")).toBeVisible();
  });

  test("groups the rows by AARRR stage, in canonical order", async ({ page }) => {
    await openMission(page);
    await page.getByTestId("open-restitution").click();

    const order = ["acquisition", "activation", "retention", "referral", "revenue", "transverse"];
    const seen: string[] = [];
    for (const pillar of order) {
      if ((await page.getByTestId(`restitution-${pillar}`).count()) > 0) seen.push(pillar);
    }
    expect(seen).toEqual(order);

    const boxes = await Promise.all(seen.map((pillar) => page.getByTestId(`restitution-${pillar}`).boundingBox()));
    const tops = boxes.map((box) => box!.y);
    expect([...tops].sort((a, b) => a - b)).toEqual(tops);
  });

  test("both screens pass axe at serious and critical", async ({ page }) => {
    await openMission(page);
    await markCacAbsent(page);

    // The Tour first, with its score visible: the fifteen answers bring a
    // second block of content into the page, and axe only sees what is
    // rendered — a pass on the empty screen would say nothing about it.
    await page.getByTestId("open-tour").click();
    const questions = page.getByTestId("tour-questions").locator("> li");
    for (let index = 0; index < 15; index++) await questions.nth(index).getByRole("button").first().click();
    await expect(page.getByTestId("tour-score")).toBeVisible();
    for (const step of ["tour", "restitution"] as const) {
      if (step === "restitution") {
        await page.getByTestId("close-tour").click();
        await page.getByTestId("open-restitution").click();
        await expect(page.getByTestId("quadrant-counts")).toBeVisible();
        // The red card must be IN the pass, not merely reachable from it:
        // it is the only alert-toned surface of the tool, so it is the only
        // place where a contrast regression could hide. `acq-3`'s first
        // option is its 20-point one, which is what puts m09 here.
        await expect(page.getByTestId("blind-spots")).toBeVisible();
      }
      const results = await new AxeBuilder({ page }).analyze();
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(serious.map((v) => `${step} — ${v.id}: ${v.nodes.length}`)).toEqual([]);
    }
  });
});
