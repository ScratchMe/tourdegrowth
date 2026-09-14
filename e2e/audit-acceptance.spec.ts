import AxeBuilder from "@axe-core/playwright";
import { ADMIN_PASSWORD, SKIP_ADMIN_REASON, adminCredentials, expect, test } from "./helpers";

/**
 * AUDIT-PLAN.md §3.1 — le critère de sortie de la phase 1, vérifié.
 *
 * Les specs des étapes 1.2 à 1.5 couvrent chacune un écran. Celle-ci couvre
 * la PROMESSE : une mission renseignée sur au moins une ligne de chaque
 * statut, exportée, les données du site effacées, le fichier réimporté —
 * tout est là, compteurs compris, et le fichier passe le validateur.
 *
 * C'est la seule spec qui efface vraiment le stockage entre l'export et
 * l'import. Sans ça, on vérifierait que l'état React a survécu à un clic,
 * pas que le fichier porte le travail — et c'est le fichier qui est la seule
 * copie qui survit à un vidage des données du site (`AUDIT.md`).
 */
test.describe("phase 1 acceptance", () => {
  test.skip(ADMIN_PASSWORD === "", SKIP_ADMIN_REASON);
  test.use({ httpCredentials: adminCredentials });

  type Page = import("@playwright/test").Page;

  async function downloadText(page: Page, click: () => Promise<void>): Promise<string> {
    const download = page.waitForEvent("download");
    await click();
    const stream = await (await download).createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks).toString("utf8");
  }

  /** Renseigne une ligne de chaque famille de statut, plus le Tour complet. */
  async function fillMission(page: Page) {
    await page.goto("/admin/audit");
    await page.getByTestId("new-mission").click();
    await page.locator("#company").fill("Acme Analytics");
    await page.getByTestId("create-mission").click();
    await expect(page.getByTestId("row-list")).toBeVisible();

    // measured — définition + observation valuée + repère + décision en jeu,
    // donc aussi la seule ligne promouvable en constat.
    await page.getByTestId("open-row-m01").click();
    await page.locator("#status").selectOption("measured");
    await page.locator("#def-unit").fill("euro");
    await page.locator("#def-numerator").fill("revenu récurrent normalisé du mois clos");
    await page.locator("#def-denominator").fill("sans objet");
    await page.locator("#def-scope").fill("tout");
    await page.getByTestId("add-observation").click();
    await page.locator("#obs-0-value").fill("1200000");
    // Les dates sont vides sur une observation neuve, et le validateur les
    // exige — c'est voulu (une observation sans période ne se compare à
    // rien). L'auditeur les remplit ; la recette fait comme lui.
    await page.locator("#obs-0-start").fill("2026-08-01");
    await page.locator("#obs-0-end").fill("2026-08-31");
    await page.locator("#obs-0-asof").fill("2026-09-05");
    await page.locator("#criterionKind").selectOption("internal-trend");
    await page.locator("#criterionValue").fill("1100000");
    await page.getByTestId("context-disclosure").click();
    await page.locator("#decisionAtStake").fill("Le budget du trimestre prochain.");
    await page.getByTestId("save-row").click();
    await expect(page.getByTestId("status-m01")).toHaveText("Mesuré");

    // absent
    await page.getByTestId("open-row-m02").click();
    await page.locator("#status").selectOption("absent");
    await page.locator("#absentCause").selectOption("not-instrumented");
    await page.locator("#repairScale").selectOption("quarter");
    await page.getByTestId("save-row").click();
    await expect(page.getByTestId("status-m02")).toHaveText("L'entreprise ne l'a pas");

    // not-accessible — un fait sur MON accès, pas sur eux.
    await page.getByTestId("open-row-m03").click();
    await page.locator("#status").selectOption("not-accessible");
    await page.getByTestId("save-row").click();
    await expect(page.getByTestId("status-m03")).toHaveText("Pas accessible (mon accès)");

    // Le Tour au complet, qui produit `m19`.
    await page.getByTestId("open-tour").click();
    const questions = page.getByTestId("tour-questions").locator("> li");
    for (let index = 0; index < 15; index++) await questions.nth(index).getByRole("button").first().click();
    await expect(page.getByTestId("tour-score")).toBeVisible();
    await page.getByTestId("close-tour").click();

    // Un constat et le bloc de tête.
    await page.getByTestId("open-findings").click();
    await page.getByTestId("promote-m01").click();
    await page.locator("#finding-title").fill("Deux MRR coexistent");
    await page.locator("#finding-gap").selectOption("evidence");
    await page.locator("#finding-cause").selectOption("definition-never-settled");
    await page.getByTestId("save-finding").click();
    await page.getByTestId("brief-main").fill("Le MRR n'a jamais été tranché.");
    await page.getByTestId("close-findings").click();
  }

  test("a mission survives an export, a cleared browser and a reimport — counters included", async ({ page }) => {
    await fillMission(page);

    const counters = await page.getByTestId("coverage-counters").innerText();
    const exported = await downloadText(page, () => page.getByTestId("export-mission").click());

    /**
     * Effacé pour de bon, pas seulement fermé : c'est le scénario que le
     * fichier existe pour couvrir, et le seul qui prouve que le travail est
     * dans le fichier plutôt que dans l'onglet.
     */
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.getByTestId("mission-list")).toHaveCount(0);

    await page.getByTestId("import-file").setInputFiles({
      name: "mission.json",
      mimeType: "application/json",
      buffer: Buffer.from(exported),
    });
    await page.getByTestId("confirm-import").click();
    await expect(page.getByTestId("row-list")).toBeVisible();

    // Les mêmes compteurs, au caractère près.
    expect(await page.getByTestId("coverage-counters").innerText()).toBe(counters);
    await expect(page.getByTestId("status-m01")).toHaveText("Mesuré");
    await expect(page.getByTestId("status-m19")).toHaveText("Mesuré");
    await page.getByTestId("open-findings").click();
    await expect(page.getByTestId("finding-list")).toContainText("Deux MRR coexistent");
    await expect(page.getByTestId("brief-main")).toHaveValue("Le MRR n'a jamais été tranché.");
  });

  test("the exported file passes the validator, and the counters match what it says", async ({ page }) => {
    await fillMission(page);
    const exported = await downloadText(page, () => page.getByTestId("export-mission").click());
    const file = JSON.parse(exported);

    /**
     * Le validateur est importé par le test plutôt que réimplémenté : c'est
     * le MÊME code que l'outil, donc un fichier vert ici est un fichier que
     * l'outil rouvrira.
     */
    const { validateMission } = await import("../src/lib/audit/validate");
    const { computeCoverage, formatFraction } = await import("../src/lib/audit/coverage");
    const result = validateMission(file);
    expect(result.ok ? [] : result.errors).toEqual([]);

    // Et les compteurs affichés sont ceux que `computeCoverage` calcule —
    // lus des deux côtés plutôt que recopiés.
    const coverage = computeCoverage(file.passes[0], file);
    const shown = await page.getByTestId("coverage-counters").innerText();
    expect(shown).toContain(`${formatFraction(coverage.documented, coverage.denominator)} documentées`);
    expect(shown).toContain(`sans accès ${formatFraction(coverage.noAccess, coverage.denominator)}`);
  });

  test("a purged copy carries no absolute, and the working mission is untouched", async ({ page }) => {
    await fillMission(page);
    const purged = await downloadText(page, () => page.getByTestId("export-purged").click());

    // Ni le nom, ni une valeur, ni une ligne de prose écrite pour ce client.
    expect(purged).not.toContain("Acme Analytics");
    expect(purged).not.toContain("1200000");
    expect(purged).not.toContain("Le budget du trimestre prochain.");
    expect(purged).not.toContain("Le MRR n'a jamais été tranché.");
    expect(JSON.parse(purged).purged).toBe(true);

    // La mission de travail, elle, n'a pas bougé — c'est ce qui rend
    // l'export purgé utilisable comme exemple montrable.
    await expect(page.getByTestId("status-m01")).toHaveText("Mesuré");
    const full = await downloadText(page, () => page.getByTestId("export-mission").click());
    expect(full).toContain("Acme Analytics");
    expect(full).toContain("Le budget du trimestre prochain.");
  });

  test("every screen of the route passes axe, import panel and purge confirm included", async ({ page }) => {
    await fillMission(page);
    const exported = await downloadText(page, () => page.getByTestId("export-mission").click());

    // Les écrans que les specs d'étape ne traversent pas.
    await page.getByTestId("open-purge").click();
    await expect(page.getByTestId("confirm-purge")).toBeVisible();
    let results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `purge — ${v.id}`),
    ).toEqual([]);

    await page.goto("/admin/audit");
    await page.getByTestId("import-file").setInputFiles({
      name: "mission.json",
      mimeType: "application/json",
      buffer: Buffer.from(exported),
    });
    await expect(page.getByTestId("confirm-import")).toBeVisible();
    results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `import — ${v.id}`),
    ).toEqual([]);
  });
});
