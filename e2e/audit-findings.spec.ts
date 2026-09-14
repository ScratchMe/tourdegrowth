import AxeBuilder from "@axe-core/playwright";
import { ADMIN_PASSWORD, SKIP_ADMIN_REASON, adminCredentials, expect, test } from "./helpers";

/**
 * AUDIT-PLAN.md §3.4/1.5 — les constats et le bloc de tête.
 *
 * Deux règles portent cet écran, et ce sont les deux que le validateur
 * refuserait si le formulaire les laissait passer :
 *
 * 1. **La rareté est structurelle.** Le neuvième « à la une » est refusé par
 *    le plafond, et marquer une seconde action prioritaire démarque la
 *    première. Un livrable qui met huit choses en avant n'en met aucune.
 * 2. **Un constat sans valeur référencée est une opinion.** Le validateur le
 *    refuse ; le formulaire doit donc le refuser avant, sinon l'erreur se
 *    découvre au moment où le fichier part.
 */
test.describe("les constats", () => {
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

  /** Rend une ligne promouvable : un repère ET une décision en jeu. */
  async function makePromotable(page: Page, metricId: string) {
    await page.getByTestId(`open-row-${metricId}`).click();
    await page.locator("#status").selectOption("measured");
    await page.locator("#criterionKind").selectOption("internal-trend");
    await page.locator("#criterionValue").fill("12");
    await page.getByTestId("context-disclosure").click();
    await page.locator("#decisionAtStake").fill("Le budget du trimestre prochain.");
    await page.getByTestId("save-row").click();
    await expect(page.getByTestId(`status-${metricId}`)).toBeVisible();
  }

  /** Crée un constat depuis une ligne promouvable, avec l'écart et la cause. */
  async function createFinding(page: Page, metricId: string, title: string) {
    await page.getByTestId(`promote-${metricId}`).click();
    await page.locator("#finding-title").fill(title);
    await page.locator("#finding-gap").selectOption("evidence");
    await page.locator("#finding-cause").selectOption("definition-never-settled");
    await page.getByTestId("save-finding").click();
    await expect(page.getByTestId("finding-list")).toBeVisible();
  }

  test("only rows with a criterion AND a decision at stake can become findings", async ({ page }) => {
    await openMission(page);
    await page.getByTestId("open-findings").click();

    // Nothing is promotable yet: a number with no benchmark stays a number.
    await expect(page.getByTestId("none-promotable")).toBeVisible();
    await expect(page.getByTestId("no-findings")).toBeVisible();

    await page.getByTestId("close-findings").click();
    await makePromotable(page, "m01");
    await page.getByTestId("open-findings").click();
    await expect(page.getByTestId("promotable-m01")).toBeVisible();

    /**
     * The denominator counts rows the auditor actually addressed. `newPass`
     * seeds a `not-applicable` entry for every out-of-profile row, so
     * counting `pass.entries` would read "1 of 15 filled in" to someone who
     * has filled in exactly one.
     */
    await expect(page.getByTestId("findings-screen")).toContainText("1 sur 1 lignes");
  });

  test("a finding cannot be saved without a gap and a system cause", async ({ page }) => {
    await openMission(page);
    await makePromotable(page, "m01");
    await page.getByTestId("open-findings").click();
    await page.getByTestId("promote-m01").click();

    // Neither is pre-selected: each value prints into a deliverable, so
    // defaulting one would write a sentence in the auditor's place.
    await expect(page.getByTestId("save-finding")).toBeDisabled();
    await expect(page.getByTestId("finding-missing")).toContainText("l'écart");

    await page.locator("#finding-gap").selectOption("decision");
    await expect(page.getByTestId("save-finding")).toBeDisabled();
    await page.locator("#finding-cause").selectOption("no-owner");
    await expect(page.getByTestId("save-finding")).toBeEnabled();
  });

  test("the ninth headline is refused — the cap is structural, and stays visible", async ({ page }) => {
    await openMission(page);
    await makePromotable(page, "m01");
    await page.getByTestId("open-findings").click();

    const ids: string[] = [];
    for (let i = 0; i < 9; i++) {
      await createFinding(page, "m01", `Constat ${i}`);
      const id = await page
        .getByTestId("finding-list")
        .locator("> li")
        .nth(i)
        .locator('[data-testid^="headline-"]')
        .getAttribute("data-testid");
      ids.push(id!.replace("headline-", ""));
    }

    for (let i = 0; i < 8; i++) await page.getByTestId(`headline-${ids[i]!}`).click();
    await expect(page.getByTestId("headline-count")).toContainText("8 sur 8");

    // Greyed out rather than hidden: the auditor must SEE that they already
    // have eight, not hunt for where the button went.
    await expect(page.getByTestId(`headline-${ids[8]!}`)).toBeDisabled();

    /**
     * And the OUTCOME, not just the attribute. The cap lives in two places —
     * the disabled button, and a guard in the handler — and a sabotage check
     * showed only the first is reachable from the UI, because a disabled
     * button never dispatches. Asserting the count too means the spec still
     * catches an over-cap state if someone later drops `disabled` and leans
     * on the handler alone.
     */
    await page.getByTestId(`headline-${ids[8]!}`).click({ force: true });
    await expect(page.getByTestId("headline-count")).toContainText("8 sur 8");
  });

  test("marking a second priority unmarks the first — the screen shows it", async ({ page }) => {
    await openMission(page);
    await makePromotable(page, "m01");
    await page.getByTestId("open-findings").click();
    await createFinding(page, "m01", "Premier");
    await createFinding(page, "m01", "Second");

    const rows = page.getByTestId("finding-list").locator("> li");
    const first = (await rows.nth(0).locator('[data-testid^="priority-"]').getAttribute("data-testid"))!.replace("priority-", "");
    const second = (await rows.nth(1).locator('[data-testid^="priority-"]').getAttribute("data-testid"))!.replace("priority-", "");

    await page.getByTestId(`priority-${first}`).click();
    await expect(page.getByTestId(`finding-${first}`)).toContainText("Action prioritaire");

    await page.getByTestId(`priority-${second}`).click();
    await expect(page.getByTestId(`finding-${second}`)).toContainText("Action prioritaire");
    // The first is no longer the priority — it stays a headline, because it
    // was judged important; only exclusivity is taken back.
    await expect(page.getByTestId(`priority-${first}`)).toBeEnabled();
    await expect(page.getByTestId(`finding-${first}`)).toContainText("À la une");
  });

  test("the brief counts its three fields together, and shows what would go to the annex", async ({ page }) => {
    await openMission(page);
    await page.getByTestId("open-findings").click();

    await page.getByTestId("brief-main").fill("un deux trois");
    await expect(page.getByTestId("brief-budget")).toHaveText("3 mots sur 400");
    await page.getByTestId("brief-action").fill("quatre cinq");
    // The budget is on the BLOCK, not per field (§4.1 of the readout).
    await expect(page.getByTestId("brief-budget")).toHaveText("5 mots sur 400");
    await expect(page.getByTestId("brief-overflow")).toHaveCount(0);

    const long = Array.from({ length: 401 }, (_, i) => `mot${i}`).join(" ");
    await page.getByTestId("brief-main").fill(long);
    await page.getByTestId("brief-action").fill("");
    await expect(page.getByTestId("brief-budget")).toHaveText("401 mots sur 400");
    // Shown, never cut: a silently truncated deliverable is the worst outcome.
    await expect(page.getByTestId("brief-overflow")).toContainText("mot400");
  });

  test("findings and the brief survive a reload, and export with the mission", async ({ page }) => {
    await openMission(page);
    await makePromotable(page, "m01");
    await page.getByTestId("open-findings").click();
    await createFinding(page, "m01", "Deux MRR coexistent");
    await page.getByTestId("brief-main").fill("Le MRR n'a jamais été tranché.");

    await page.reload();
    await page.getByTestId("open-mission").first().click();
    await page.getByTestId("open-findings").click();
    await expect(page.getByTestId("finding-list")).toContainText("Deux MRR coexistent");
    await expect(page.getByTestId("brief-main")).toHaveValue("Le MRR n'a jamais été tranché.");

    const download = page.waitForEvent("download");
    await page.getByTestId("close-findings").click();
    await page.getByTestId("export-mission").click();
    const stream = await (await download).createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    const file = JSON.parse(Buffer.concat(chunks).toString("utf8"));

    expect(file.passes[0].findings).toHaveLength(1);
    expect(file.passes[0].findings[0].refs).toEqual([{ metricId: "m01" }]);
    expect(file.passes[0].brief.mainFinding).toBe("Le MRR n'a jamais été tranché.");
    // The three return fields of the Ledger are filled at the NEXT pass —
    // writing them empty now would make them boxes to fill while drafting.
    expect(file.passes[0].findings[0].ledger).not.toHaveProperty("actual");
  });

  test("both screens pass axe at serious and critical", async ({ page }) => {
    await openMission(page);
    await makePromotable(page, "m01");
    await page.getByTestId("open-findings").click();
    await createFinding(page, "m01", "Deux MRR coexistent");

    for (const step of ["list", "editor"] as const) {
      if (step === "editor") {
        await page.getByTestId("promote-m01").click();
        await expect(page.getByTestId("finding-form")).toBeVisible();
      }
      const results = await new AxeBuilder({ page }).analyze();
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(serious.map((v) => `${step} — ${v.id}: ${v.nodes.length}`)).toEqual([]);
    }
  });
});
