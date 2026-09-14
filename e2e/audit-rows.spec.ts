import { ADMIN_PASSWORD, SKIP_ADMIN_REASON, adminCredentials, expect, test } from "./helpers";

/**
 * AUDIT-PLAN.md §3.4/1.3a — the collect view and the row editor.
 *
 * What these specs hold is the pair of rules that make coverage honest: a row
 * nobody has looked at is PENDING and never absent, and the fields a status
 * asks for are the fields the validator will demand. Both are easy to break
 * from JSX, and neither shows up until an export fails.
 */
test.describe("the audit instrument's rows", () => {
  test.skip(ADMIN_PASSWORD === "", SKIP_ADMIN_REASON);
  test.use({ httpCredentials: adminCredentials });

  async function openMission(page: import("@playwright/test").Page) {
    await page.goto("/admin/audit");
    await page.getByTestId("new-mission").click();
    await page.locator("#company").fill("Acme Analytics");
    await page.getByTestId("create-mission").click();
    await expect(page.getByTestId("row-list")).toBeVisible();
  }

  test("lists the applicable rows, costliest tier first, all pending", async ({ page }) => {
    await openMission(page);

    const items = page.getByTestId("row-list").locator("> li");
    await expect(items).toHaveCount(25);

    /**
     * Tier order is the point: T4 needs a mandate and T3 an analyst queue, so
     * they must leave on day one. Sorting by pillar would bury them at the
     * bottom of the page. Asserted as a real ordering over every row rather
     * than on the first and last, which two lucky rows could satisfy.
     */
    const badges = await items.allInnerTexts();
    const ranks = badges.map((text) => ["T4", "T3", "T2", "T1", "T0"].indexOf(text.slice(0, 2)));
    expect(ranks).not.toContain(-1);
    expect([...ranks].sort((a, b) => a - b)).toEqual(ranks);

    // Nothing is defaulted: every row reads "en attente" until the auditor speaks.
    const statuses = await page.getByTestId("row-list").locator('[data-testid^="status-"]').allTextContents();
    expect(new Set(statuses)).toEqual(new Set(["En attente"]));
  });

  test("the editor shows the catalog card, and asks nothing until a status is chosen", async ({ page }) => {
    await openMission(page);
    const firstRow = page.getByTestId("row-list").locator("> li").first();
    await firstRow.getByRole("button", { name: "Renseigner" }).click();

    await expect(page.getByTestId("catalog-card")).toBeVisible();
    await expect(page.getByTestId("entry-form")).toBeVisible();
    // No status, so no fields and nothing to save.
    await expect(page.getByTestId("absence-fields")).toHaveCount(0);
    await expect(page.getByTestId("save-row")).toBeDisabled();
  });

  /**
   * The rule from `entryFieldGroups`, exercised through the screen: absence
   * asks for its three fields, a measured row asks for a value instead, and
   * switching between them never leaves the other set behind.
   */
  test("the fields follow the status, and switching away takes them with it", async ({ page }) => {
    await openMission(page);
    await page.getByTestId("row-list").locator("> li").first().getByRole("button", { name: "Renseigner" }).click();

    await page.locator("#status").selectOption("absent");
    await expect(page.getByTestId("absence-fields")).toBeVisible();
    await expect(page.getByTestId("value-fields")).toHaveCount(0);

    await page.locator("#status").selectOption("measured");
    await expect(page.getByTestId("absence-fields")).toHaveCount(0);
    await expect(page.getByTestId("value-fields")).toBeVisible();

    await page.locator("#status").selectOption("not-accessible");
    await expect(page.getByTestId("access-fields")).toBeVisible();
    await expect(page.getByTestId("absence-fields")).toHaveCount(0);
    await expect(page.getByTestId("value-fields")).toHaveCount(0);
  });

  test("never offers « hors profil » — that status comes from the catalog, never from a choice", async ({ page }) => {
    await openMission(page);
    await page.getByTestId("row-list").locator("> li").first().getByRole("button", { name: "Renseigner" }).click();
    const values = await page.locator("#status option").evaluateAll((options) => options.map((o) => (o as HTMLOptionElement).value));
    expect(values).not.toContain("not-applicable");
    expect(values).toContain("absent");
  });

  test("an absent row is saved to the device and moves the counters", async ({ page }) => {
    await openMission(page);
    const before = await page.getByTestId("coverage-counters").textContent();
    expect(before).toContain("en attente 25 sur 25");

    await page.getByTestId("row-list").locator("> li").first().getByRole("button", { name: "Renseigner" }).click();
    await page.locator("#status").selectOption("absent");
    await page.locator("#absentCause").selectOption("not-instrumented");
    await page.locator("#repairScale").selectOption("sprint");
    await page.getByTestId("save-row").click();

    // One row left "pending" and landed in "the company doesn't have it".
    const after = await page.getByTestId("coverage-counters").textContent();
    expect(after).toContain("en attente 24 sur 25");
    expect(after).toContain("l'entreprise n'en a pas 1 sur 25");

    // Written to the device, not just held in React state — the lesson from 1.2.
    // A reload lands on the mission LIST: which mission is open is session
    // state, deliberately not persisted (same call as the tone and the
    // segment). Reopening is one click, so nothing is lost.
    await page.reload();
    await page.getByTestId("open-mission").first().click();
    await expect(page.getByTestId("coverage-counters")).toContainText("en attente 24 sur 25");
    await expect(page.getByTestId("row-list").locator('[data-testid^="status-"]').first()).toHaveText("L'entreprise ne l'a pas");
  });

  test("the exported file carries the entry, and the validator reads it back", async ({ page }) => {
    await openMission(page);
    await page.getByTestId("row-list").locator("> li").first().getByRole("button", { name: "Renseigner" }).click();
    await page.locator("#status").selectOption("absent");
    await page.locator("#repairScale").selectOption("meeting");
    await page.getByTestId("save-row").click();

    const download = await Promise.all([page.waitForEvent("download"), page.getByTestId("export-mission").click()]).then(([d]) => d);
    const path = await download.path();
    const text = await import("node:fs/promises").then((fs) => fs.readFile(path, "utf8"));
    const parsed = JSON.parse(text);
    const entries = parsed.passes[0].entries.filter((e: { status: string }) => e.status === "absent");
    expect(entries).toHaveLength(1);
    expect(entries[0].repairCost.scale).toBe("meeting");
    // The default cause, applied because nobody chose one — never guessed as
    // something more specific.
    expect(entries[0].absentCause).toBe("type-not-established");
  });
});
