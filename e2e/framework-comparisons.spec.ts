import { expect, test } from "./helpers";
import { COMPARISON_ORDER, COMPARISONS } from "../src/content/comparisons";

/**
 * GROWTH-PLAN.md vague 2.3 — le cluster « frameworks comparés ».
 *
 * Ce que ces specs tiennent :
 *
 * 1. **Chaque page du cluster existe aux deux langues, à un slug plat**, et
 *    l'adresse non préfixée redirige — sans le slug dans `LOCALIZED_ROOTS`
 *    elle tomberait dans les routes applicatives et rendrait un 404, en
 *    silence, sur une URL qu'on aurait déjà publiée.
 * 2. **Le cluster se parcourt depuis n'importe laquelle de ses entrées** :
 *    chaque page sort vers toutes les autres, jamais vers elle-même.
 *
 * Aucun compte n'est écrit en dur : il dérive de `COMPARISON_ORDER`, sinon
 * chaque page ajoutée au cluster (la cinquième, HEART, audit SEO v1 §3.1)
 * demanderait de retoucher des nombres qu'on finit par retoucher sans les lire.
 * 3. **Chacune reçoit son lien entrant** depuis `/how-it-works`, la page qui
 *    explique le cadre (règle 2.4).
 * 4. **Chacune tranche** — le bloc verdict est ce qu'un lecteur venu d'une
 *    requête comparative cherche vraiment, et c'est ce qu'une page qui
 *    renvoie les deux cadres dos à dos ne donne pas.
 *
 * Les libellés attendus sont LUS depuis `content/comparisons.ts` plutôt que
 * recopiés : une spec qui recopie une phrase teste sa propre copie, et
 * survit à une correction de contenu en affirmant l'ancienne version.
 */
test.describe("the compared-frameworks cluster", () => {
  for (const locale of ["en", "fr"] as const) {
    test(`every page of the cluster exists in ${locale}, each with its own title and description`, async ({ page }) => {
      const titles = new Set<string>();
      for (const slug of COMPARISON_ORDER) {
        const response = await page.goto(`/${locale}/${slug}`);
        expect(response?.status(), slug).toBe(200);
        await expect(page.locator("html")).toHaveAttribute("lang", locale);

        const h1 = await page.locator("h1").innerText();
        expect(h1).toBe(COMPARISONS[slug].title[locale]);
        // Several pages on one topic: each title has to be a different page.
        expect(titles.has(h1), `${slug} repeats a title`).toBe(false);
        titles.add(h1);

        const description = await page.locator('meta[name="description"]').getAttribute("content");
        expect(description, slug).toBe(COMPARISONS[slug].metaDescription[locale]);
      }
      expect(titles.size).toBe(COMPARISON_ORDER.length);
    });
  }

  test("each page shows the side-by-side rows, naming both frameworks on every row", async ({ page }) => {
    for (const slug of COMPARISON_ORDER) {
      await page.goto(`/en/${slug}`);
      const table = page.getByTestId("comparison-table");
      await expect(table).toBeVisible();
      const text = await table.innerText();
      // The framework names are carried in the DOM on every row rather than in
      // a table header, so they survive the mobile stack — see ComparisonView.
      const aarrrLabels = (text.match(/AARRR/g) ?? []).length;
      expect(aarrrLabels, slug).toBeGreaterThanOrEqual(4);
      for (const row of COMPARISONS[slug].rows) {
        expect(text, `${slug} / ${row.aspect.en}`).toContain(row.aspect.en);
      }
    }
  });

  test("each page ends on a verdict rather than sending the two frameworks back to back", async ({ page }) => {
    for (const slug of COMPARISON_ORDER) {
      await page.goto(`/en/${slug}`);
      await expect(page.getByTestId("comparison-verdict")).toContainText(COMPARISONS[slug].verdict.en);
    }
  });

  test("the cluster is walkable from any of its entries, and no page links to itself", async ({ page }) => {
    for (const slug of COMPARISON_ORDER) {
      await page.goto(`/en/${slug}`);
      const links = page.getByTestId("other-comparisons").locator("a");
      await expect(links).toHaveCount(COMPARISON_ORDER.length - 1);
      const hrefs = await links.evaluateAll((els) => els.map((el) => el.getAttribute("href")));
      expect(hrefs, slug).not.toContain(`/en/${slug}`);
      for (const other of COMPARISON_ORDER.filter((id) => id !== slug)) {
        expect(hrefs, `${slug} links ${other}`).toContain(`/en/${other}`);
      }
    }
  });

  test("each page sends readers on to real glossary pages", async ({ page }) => {
    await page.goto("/en/aarrr-vs-growth-loops");
    const links = page.getByTestId("comparison-glossary").locator("a");
    const hrefs = await links.evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));
    expect(hrefs.length).toBeGreaterThanOrEqual(3);
    for (const href of hrefs) {
      const response = await page.request.get(href);
      expect(response.status(), href).toBe(200);
    }
  });

  test("how it works links to every comparison — the page that explains the framework", async ({ page }) => {
    await page.goto("/fr/how-it-works");
    const links = page.getByTestId("framework-comparisons").locator("a");
    await expect(links).toHaveCount(COMPARISON_ORDER.length);
    const hrefs = await links.evaluateAll((els) => els.map((el) => el.getAttribute("href")));
    for (const slug of COMPARISON_ORDER) expect(hrefs).toContain(`/fr/${slug}`);
  });

  test("the unprefixed addresses redirect instead of falling through to a 404", async ({ request }) => {
    for (const slug of COMPARISON_ORDER) {
      const response = await request.get(`/${slug}`, {
        maxRedirects: 0,
        headers: { "accept-language": "fr" },
      });
      expect(response.status(), slug).toBe(308);
      expect(response.headers()["location"], slug).toBe(`/fr/${slug}`);
    }
  });

  test("the French pages do not scroll sideways on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const slug of COMPARISON_ORDER) {
      await page.goto(`/fr/${slug}`);
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth, slug).toBe(clientWidth);
    }
  });
});
