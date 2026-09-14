import { ADMIN_PASSWORD, SKIP_ADMIN_REASON, adminCredentials, expect, test } from "./helpers";

/**
 * AUDIT-PLAN.md §3.6 — la spec canari.
 *
 * L'instrument d'audit tient les chiffres d'un employeur. `AUDIT.md` et
 * `content/legal.ts` promettent la même chose : **rien ne quitte le
 * navigateur**. Une garde statique vérifie qu'aucun module serveur n'est
 * importé (`audit-boundary.test.ts`), mais elle ne dit rien d'un `fetch`
 * écrit à la main, d'un `<img>` avec une URL construite, ou d'un formulaire
 * qui partirait un jour par erreur.
 *
 * Celle-ci teste l'invariant lui-même : des chaînes canari uniques sont
 * semées dans le nom de l'entreprise, une valeur d'observation et un texte
 * de constat, tout le parcours est joué, et **toutes** les requêtes du
 * navigateur sont enregistrées. Même raisonnement que la sonde de production
 * du 2026-09-05 : on teste l'invariant, pas un proxy de l'invariant.
 *
 * **La spec ne prouve rien si les canaris ne sont pas vraiment dans la
 * mission** — d'où l'assertion finale sur le fichier exporté. Sans elle, une
 * spec qui aurait cessé de saisir quoi que ce soit passerait en silence,
 * exactement le piège du premier run de la sonde de production.
 */
test.describe("the audit instrument keeps everything in the browser", () => {
  test.skip(ADMIN_PASSWORD === "", SKIP_ADMIN_REASON);
  test.use({ httpCredentials: adminCredentials });

  test("no request carries a byte of the mission", async ({ page }) => {
    const stamp = Date.now().toString(36);
    const COMPANY = `TDG-CANARY-COMPANY-${stamp}`;
    // Neuf chiffres plutôt que quatre : un nombre court finirait par
    // apparaître par hasard dans un hash de chunk, et la spec échouerait
    // pour la mauvaise raison.
    const VALUE = `9${Date.now().toString().slice(-8)}`;
    const PROSE = `TDG-CANARY-PROSE-${stamp}`;
    const canaries = [COMPANY, PROSE, VALUE];

    /** Toute requête vue, avec sa méthode, son URL et son corps. */
    const seen: { method: string; url: string; body: string }[] = [];
    await page.route("**/*", async (route) => {
      const request = route.request();
      seen.push({ method: request.method(), url: request.url(), body: request.postData() ?? "" });
      await route.continue();
    });

    // --- Le parcours complet -------------------------------------------------
    await page.goto("/admin/audit");
    await page.getByTestId("new-mission").click();
    await page.locator("#company").fill(COMPANY);
    await page.getByTestId("create-mission").click();
    await expect(page.getByTestId("row-list")).toBeVisible();

    // Une ligne mesurée, avec sa définition et une observation valuée.
    await page.getByTestId("open-row-m01").click();
    await page.locator("#status").selectOption("measured");
    await page.locator("#def-unit").fill("euro");
    await page.locator("#def-numerator").fill(PROSE);
    await page.locator("#def-denominator").fill("sans objet");
    await page.locator("#def-scope").fill("tout");
    await page.getByTestId("add-observation").click();
    await page.locator("#obs-0-value").fill(VALUE);
    await page.getByTestId("save-row").click();
    await expect(page.getByTestId("status-m01")).toHaveText("Mesuré");

    // Une ligne absente, pour qu'un statut de chaque famille soit exercé.
    await page.getByTestId("open-row-m02").click();
    await page.locator("#status").selectOption("absent");
    await page.locator("#absentCause").selectOption("not-instrumented");
    await page.locator("#repairScale").selectOption("quarter");
    await page.getByTestId("save-row").click();
    await expect(page.getByTestId("status-m02")).toBeVisible();

    // Le Tour, jusqu'au score — donc jusqu'à l'écriture de `m19`.
    await page.getByTestId("open-tour").click();
    const questions = page.getByTestId("tour-questions").locator("> li");
    for (let index = 0; index < 15; index++) await questions.nth(index).getByRole("button").first().click();
    await expect(page.getByTestId("tour-score")).toBeVisible();
    await page.getByTestId("close-tour").click();

    // La restitution, puis le bloc de tête.
    await page.getByTestId("open-restitution").click();
    await expect(page.getByTestId("quadrant-counts")).toBeVisible();
    await page.getByTestId("close-restitution").click();
    await page.getByTestId("open-findings").click();
    await page.getByTestId("brief-main").fill(PROSE);
    await page.getByTestId("close-findings").click();

    // L'export, et la réimportation du fichier obtenu.
    const download = page.waitForEvent("download");
    await page.getByTestId("export-mission").click();
    const stream = await (await download).createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    const exported = Buffer.concat(chunks).toString("utf8");

    await page.getByTestId("close-mission").click();
    await page.getByTestId("import-file").setInputFiles({
      name: "mission.json",
      mimeType: "application/json",
      buffer: Buffer.from(exported),
    });
    await page.getByTestId("confirm-import").click();
    await expect(page.getByTestId("row-list")).toBeVisible();

    // --- Ce que la spec prouve ----------------------------------------------

    /**
     * D'abord que les canaris SONT dans la mission. Sans ça, une spec qui
     * aurait cessé de saisir quoi que ce soit passerait en ne prouvant rien.
     */
    for (const canary of canaries) expect(exported).toContain(canary);

    // Aucune requête ne porte un canari, ni dans l'URL ni dans le corps.
    const leaks = seen.filter((r) => canaries.some((c) => r.url.includes(c) || r.body.includes(c)));
    expect(leaks.map((r) => `${r.method} ${r.url}`)).toEqual([]);

    /**
     * Et aucune requête non-`GET` de toute la session. C'est l'assertion la
     * plus large : elle attrape une fuite même si elle était encodée,
     * hachée, ou coupée en morceaux — trois façons dont une recherche de
     * sous-chaîne ne verrait rien.
     */
    const writes = seen.filter((r) => r.method !== "GET");
    expect(writes.map((r) => `${r.method} ${r.url}`)).toEqual([]);

    // Et la spec a bien regardé quelque chose : une vérification qui ne
    // trouve rien doit d'abord prouver qu'elle a regardé (run nº8).
    expect(seen.length).toBeGreaterThan(5);
  });
});
