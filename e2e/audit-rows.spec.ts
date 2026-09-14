import { ADMIN_PASSWORD, SKIP_ADMIN_REASON, adminCredentials, expect, test } from "./helpers";

/**
 * AUDIT-PLAN.md §3.4/1.3a — the collect view and the row editor.
 *
 * What these specs hold is the pair of rules that make coverage honest: a row
 * nobody has looked at is PENDING and never absent, and the fields a status
 * asks for are the fields the validator will demand. Both are easy to break
 * from JSX, and neither shows up until an export fails.
 *
 * 1.3b adds the versioned definition. Its rule — editing a definition strikes
 * a NEW version and leaves the old one standing — is the reason a number
 * recorded three weeks ago still means what it meant. It is also the rule a
 * form breaks most easily, by writing a v2 whose only difference is the empty
 * strings an `<input>` produces, so the "reopen and save unchanged" spec below
 * is the one that matters.
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

  /** Fill the four fields the validator demands, and save. */
  async function fillDefinition(page: import("@playwright/test").Page, overrides: { denominator?: string } = {}) {
    await page.locator("#def-unit").fill("euro");
    await page.locator("#def-numerator").fill("revenu récurrent normalisé du mois clos");
    await page.locator("#def-denominator").fill(overrides.denominator ?? "sans objet (valeur absolue)");
    await page.locator("#def-scope").fill("tout");
  }

  async function exportedJson(page: import("@playwright/test").Page) {
    const download = await Promise.all([page.waitForEvent("download"), page.getByTestId("export-mission").click()]).then(([d]) => d);
    const path = await download.path();
    return JSON.parse(await import("node:fs/promises").then((fs) => fs.readFile(path, "utf8")));
  }

  test("a measured row asks for a definition, and says what is still missing", async ({ page }) => {
    await openMission(page);
    await page.getByTestId("row-list").locator("> li").first().getByRole("button", { name: "Renseigner" }).click();
    await page.locator("#status").selectOption("measured");

    await expect(page.getByTestId("definition-fields")).toBeVisible();
    // Nothing filled: the screen names the required fields rather than
    // blocking the save. A row still being nailed down is saved as such, and
    // the export is what says it is incomplete.
    await expect(page.getByTestId("definition-missing")).toContainText("unité");
    await expect(page.getByTestId("save-row")).toBeEnabled();

    await fillDefinition(page);
    await expect(page.getByTestId("definition-missing")).toHaveCount(0);
  });

  test("saving strikes v1, and the file carries both the definition and the entry that points at it", async ({ page }) => {
    await openMission(page);
    await page.getByTestId("row-list").locator("> li").first().getByRole("button", { name: "Renseigner" }).click();
    await page.locator("#status").selectOption("measured");
    await fillDefinition(page);
    await page.getByTestId("save-row").click();

    const parsed = await exportedJson(page);
    const refs = Object.keys(parsed.definitions);
    expect(refs).toHaveLength(1);
    expect(refs[0]).toMatch(/@1$/);
    const measured = parsed.passes[0].entries.filter((e: { status: string }) => e.status === "measured");
    expect(measured).toHaveLength(1);
    // The entry points at the ref that was struck — not at a ref the form
    // guessed, which is how a file ends up referencing a definition that is
    // not in it.
    expect(measured[0].definitionRef).toBe(refs[0]);
    expect(parsed.definitions[refs[0]!]).toMatchObject({ unit: "euro", scope: "tout", version: 1 });
  });

  /**
   * The rule of the whole module, exercised through the two gestures that
   * actually produce empty strings: starting to type in an optional axis and
   * thinking better of it, and pasting a value with a space on the end. Both
   * leave `""`/`" "` where the schema has nothing, and without
   * `normalizeDraft` either would strike a v2 whose only difference is
   * whitespace — after which every observation recorded against v1 quietly
   * starts reading as "the old definition".
   *
   * Reopening and saving with no keystroke at all does NOT exercise this: the
   * stored definition has already been normalised, so the seeded draft matches
   * it byte for byte. That version of this spec passed with the normalisation
   * removed — which is why it is written this way.
   */
  test("reopening a row and saving it back unchanged does not strike a second version", async ({ page }) => {
    await openMission(page);
    await page.getByTestId("row-list").locator("> li").first().getByRole("button", { name: "Renseigner" }).click();
    await page.locator("#status").selectOption("measured");
    await fillDefinition(page);
    await page.getByTestId("save-row").click();

    await page.getByTestId("row-list").locator("> li").first().getByRole("button", { name: "Modifier" }).click();
    await expect(page.getByTestId("definition-fields")).toContainText("Définition en vigueur");
    await page.getByTestId("definition-fields").getByRole("group").click();
    await page.locator("#def-gross").fill("net de remises");
    await page.locator("#def-gross").fill("");
    await page.locator("#def-unit").fill("euro ");
    await page.getByTestId("save-row").click();
    await expect(page.getByTestId("notice")).toHaveCount(0);

    const parsed = await exportedJson(page);
    expect(Object.keys(parsed.definitions)).toHaveLength(1);
    expect(parsed.definitions[Object.keys(parsed.definitions)[0]!].unit).toBe("euro");
  });

  test("changing an axis strikes the next version, keeps the old one, and says so", async ({ page }) => {
    await openMission(page);
    await page.getByTestId("row-list").locator("> li").first().getByRole("button", { name: "Renseigner" }).click();
    await page.locator("#status").selectOption("measured");
    await fillDefinition(page);
    await page.getByTestId("save-row").click();

    await page.getByTestId("row-list").locator("> li").first().getByRole("button", { name: "Modifier" }).click();
    await page.locator("#def-denominator").fill("clients actifs au premier jour du mois");
    await page.getByTestId("save-row").click();
    await expect(page.getByTestId("notice")).toContainText("frappée");

    const parsed = await exportedJson(page);
    const refs = Object.keys(parsed.definitions).sort();
    expect(refs).toHaveLength(2);
    expect(refs.map((ref) => parsed.definitions[ref].version).sort()).toEqual([1, 2]);
    // The entry follows the new one; the old one is still in the file, which
    // is the point of immutability.
    const measured = parsed.passes[0].entries.find((e: { status: string }) => e.status === "measured");
    expect(parsed.definitions[measured.definitionRef].version).toBe(2);
    expect(parsed.definitions[refs[0]!].denominatorPopulation).toBe("sans objet (valeur absolue)");

    // The notice belongs to the save that produced it. Opening another row
    // takes it away — a message left standing while you navigate ends up
    // describing an action nobody remembers taking.
    await page.getByTestId("row-list").locator("> li").nth(1).getByRole("button", { name: "Renseigner" }).click();
    await expect(page.getByTestId("notice")).toHaveCount(0);
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
