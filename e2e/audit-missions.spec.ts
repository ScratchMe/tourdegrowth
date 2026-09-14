import AxeBuilder from "@axe-core/playwright";
import { ADMIN_PASSWORD, SKIP_ADMIN_REASON, adminCredentials, expect, test } from "./helpers";

/**
 * AUDIT-PLAN.md §3.4/1.2 — the mission file is the only durable copy of a
 * mission, so what these specs protect is the round trip: create it, carry it
 * out as a file, wipe the device, bring it back, find the same work.
 *
 * They run against the REAL build and a real browser download, not a mocked
 * one: the whole point is that `URL.createObjectURL` + `<a download>` puts a
 * readable file on Antoine's disk.
 */
test.describe("the audit instrument's missions", () => {
  test.skip(ADMIN_PASSWORD === "", SKIP_ADMIN_REASON);
  test.use({ httpCredentials: adminCredentials });

  async function createMission(page: import("@playwright/test").Page, company: string) {
    await page.goto("/admin/audit");
    await page.getByTestId("new-mission").click();
    await page.locator("#company").fill(company);
    await page.getByTestId("create-mission").click();
    await expect(page.getByTestId("coverage-counters")).toBeVisible();
  }

  test("a new mission opens with its first pass, and every applicable row starts pending", async ({ page }) => {
    await createMission(page, "Acme Analytics");

    // B2B assisté is the default profile — 25 applicable rows (AUDIT-PLAN §3.2).
    // Nothing is documented yet, and nothing is absent: an unexamined row is
    // PENDING, never counted as either. That is the counter that makes the
    // instrument honest.
    const counters = await page.getByTestId("coverage-counters").textContent();
    expect(counters).toContain("0 sur 25 documentées");
    expect(counters).toContain("en attente 25 sur 25");
  });

  /**
   * With nothing documented, coverage is below a third, so the bar shows the
   * escalation title rather than "Diagnostic growth" — the auditor sees the
   * cost of absence while collecting, not when writing.
   */
  test("the bar shows the title the deliverable would take today, escalation included", async ({ page }) => {
    await createMission(page, "Acme Analytics");
    const title = page.getByTestId("deliverable-title");
    await expect(title).toContainText("ne peut pas encore conclure");
    // No mandate (the default) means the word "audit" never appears.
    await expect(title).toContainText("diagnostic");
    await expect(title).not.toContainText("audit");
  });

  /**
   * The one assertion that proves the mission is WRITTEN and not merely held
   * in React state: reload without clearing anything. Found by a non-vacuity
   * check — with `saveMission` neutered, every other spec in this file still
   * passed, because each one reads the mission back out of memory.
   */
  test("a mission survives a reload — it is written to the device, not just held in memory", async ({ page }) => {
    await createMission(page, "Acme Analytics");
    await page.reload();
    await expect(page.getByTestId("mission-list")).toContainText("Acme Analytics");
  });

  test("the file round-trips: export, wipe the device, import, find the same mission", async ({ page, context }) => {
    await createMission(page, "Acme Analytics");

    const download = await Promise.all([page.waitForEvent("download"), page.getByTestId("export-mission").click()]).then(([d]) => d);
    expect(download.suggestedFilename()).toMatch(/^diagnostic-growth-acme-analytics-\d{4}-\d{2}-\d{2}\.json$/);
    const path = await download.path();
    const text = await import("node:fs/promises").then((fs) => fs.readFile(path, "utf8"));
    const parsed = JSON.parse(text);
    expect(parsed.header.company).toBe("Acme Analytics");
    expect(parsed.catalog.rows.length).toBeGreaterThan(30);

    // Site data cleared: the mission is gone from this device, exactly as the
    // empty screen warns. The file is all that is left.
    await context.clearCookies();
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
    await expect(page.getByText("Aucune mission sur cet appareil.")).toBeVisible();

    await page.getByTestId("import-file").setInputFiles(path);
    await expect(page.getByTestId("import-preview")).toContainText("Acme Analytics");
    await page.getByTestId("confirm-import").click();
    await expect(page.getByTestId("coverage-counters")).toContainText("0 sur 25 documentées");

    await page.getByTestId("close-mission").click();
    await expect(page.getByTestId("mission-list")).toContainText("Acme Analytics");
    // And the imported one is on the device too, not only in this render.
    await page.reload();
    await expect(page.getByTestId("mission-list")).toContainText("Acme Analytics");
  });

  test("a purged copy carries no company name, and leaves the working mission untouched", async ({ page }) => {
    await createMission(page, "Acme Analytics");

    const download = await Promise.all([page.waitForEvent("download"), page.getByTestId("export-purged").click()]).then(([d]) => d);
    expect(download.suggestedFilename()).toContain("-purge.json");
    const path = await download.path();
    const text = await import("node:fs/promises").then((fs) => fs.readFile(path, "utf8"));
    expect(text).not.toContain("Acme Analytics");
    expect(JSON.parse(text).purged).toBe(true);

    // Non-destructive: this is what produces a showable example.
    await expect(page.getByTestId("coverage-counters")).toBeVisible();
    await page.getByTestId("close-mission").click();
    await expect(page.getByTestId("mission-list")).toContainText("Acme Analytics");
  });

  test("the destructive purge asks for the company name before it destroys anything", async ({ page }) => {
    await createMission(page, "Acme Analytics");
    await page.getByTestId("open-purge").click();

    const confirm = page.getByTestId("confirm-purge");
    await expect(confirm).toBeDisabled();
    await page.locator("#purge-confirm").fill("Acme");
    await expect(confirm).toBeDisabled();
    await page.locator("#purge-confirm").fill("Acme Analytics");
    await expect(confirm).toBeEnabled();

    await confirm.click();
    await expect(page.getByText("Aucune mission sur cet appareil.")).toBeVisible();
    // Gone from the device, not just from this render.
    await page.reload();
    await expect(page.getByText("Aucune mission sur cet appareil.")).toBeVisible();
  });

  test("a file it cannot read is refused rather than opened with errors", async ({ page }) => {
    await page.goto("/admin/audit");
    await page.getByTestId("import-file").setInputFiles({
      name: "pas-une-mission.json",
      mimeType: "application/json",
      buffer: Buffer.from('{"hello":"world"}'),
    });
    await expect(page.getByTestId("import-unreadable")).toBeVisible();
    await expect(page.getByTestId("confirm-import")).toHaveCount(0);
  });

  test("the three screens pass axe at serious and critical", async ({ page }) => {
    await page.goto("/admin/audit");
    for (const open of [null, "new-mission"] as const) {
      if (open) await page.getByTestId(open).click();
      const results = await new AxeBuilder({ page }).analyze();
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(serious.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
    }
    await page.getByTestId("create-mission").isDisabled();
    await page.locator("#company").fill("Acme Analytics");
    await page.getByTestId("create-mission").click();
    await expect(page.getByTestId("coverage-counters")).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });
});
