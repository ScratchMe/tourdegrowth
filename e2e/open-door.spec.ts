import { expect, test } from "./helpers";

/**
 * GROWTH-PLAN.md vague 2.1 — les deux pages « porte ouverte ».
 *
 * Ce que ces specs tiennent, c'est ce qui rend les pages défendables :
 *
 * 1. **La checklist EST le questionnaire.** Les quinze points sont rendus
 *    depuis `copy-library.ts`, jamais recopiés — une seconde copie
 *    dériverait et la page décrirait un questionnaire qui n'existe plus. La
 *    spec lit la bibliothèque, elle ne recopie pas ses phrases.
 * 2. **Les deux pages ne se redisent pas.** Le plan les désignait par deux
 *    requêtes différentes ; les livrer comme deux variantes du même texte
 *    ferait deux quasi-doublons, ce qui vaut moins que rien en
 *    référencement. La spec compare les titres ET les `<h2>`.
 * 3. **Chacune reçoit ses liens entrants** (règle 2.4) et sort vers `/quiz`
 *    en lien dur — les deux vivent sous deux layouts racine différents, donc
 *    `next/link` préchargerait une route dynamique pour rien.
 */
const PAGES = ["/growth-audit-checklist", "/startup-growth-diagnostic"] as const;

test.describe("the two open-door pages", () => {
  for (const locale of ["en", "fr"] as const) {
    test(`both exist in ${locale}, with their own title and description`, async ({ page }) => {
      for (const path of PAGES) {
        const response = await page.goto(`/${locale}${path}`);
        expect(response?.status()).toBe(200);
        await expect(page.locator("h1")).toBeVisible();
        const description = await page.locator('meta[name="description"]').getAttribute("content");
        expect(description?.length ?? 0).toBeGreaterThan(70);
        // Sa propre langue, pas celle du cookie — c'est tout l'objet de R-13.
        await expect(page.locator("html")).toHaveAttribute("lang", locale);
      }
    });
  }

  test("the checklist renders the real fifteen questions, with their points", async ({ page }) => {
    await page.goto("/en/growth-audit-checklist");

    // Les cinq étapes, trois questions chacune, trois options par question.
    for (const pillar of ["acquisition", "activation", "retention", "referral", "revenue"]) {
      await expect(page.getByTestId(`checklist-${pillar}`)).toBeVisible();
    }
    const questions = page.getByTestId("checklist-acquisition").locator("ol > li");
    await expect(questions).toHaveCount(3);

    /**
     * Le texte vient bien de `copy-library.ts` — et la spec le LIT depuis la
     * bibliothèque plutôt que de le recopier. C'est la différence entre
     * « la page contient cette phrase-là » et « la page rend ce que la
     * bibliothèque contient » : la seconde suit une correction de copie, la
     * première casse dessus. (Écrit après avoir cité la question de
     * mémoire et m'être trompé.)
     */
    const { QUESTIONS } = await import("../src/content/copy-library");
    const acq = QUESTIONS.filter((q) => q.pillar === "acquisition");
    expect(acq).toHaveLength(3);
    for (const question of acq) {
      await expect(page.getByTestId("checklist-acquisition")).toContainText(question.question.en);
      for (const option of question.options) {
        await expect(page.getByTestId("checklist-acquisition")).toContainText(option.label.en);
      }
    }

    // Le barème est visible ICI (la page sert à se noter à la main), alors
    // que le questionnaire le cache — deux règles opposées, chacune pour une
    // bonne raison.
    const text = await page.getByTestId("checklist-acquisition").innerText();
    for (const points of ["20", "7", "0"]) expect(text).toContain(points);
  });

  test("the two pages say different things — they are not two variants of one text", async ({ page }) => {
    const headings: string[][] = [];
    for (const path of PAGES) {
      await page.goto(`/en${path}`);
      headings.push(await page.locator("h1, h2").allInnerTexts());
    }
    const [checklist, diagnostic] = headings as [string[], string[]];
    const shared = checklist.filter((h) => diagnostic.includes(h));
    expect(shared).toEqual([]);
  });

  test("each page links to the other, to the five stages and out to the quiz", async ({ page }) => {
    await page.goto("/en/startup-growth-diagnostic");
    await expect(page.getByTestId("stage-links").locator("a")).toHaveCount(5);
    await expect(page.getByTestId("checklist-link")).toHaveAttribute("href", "/en/growth-audit-checklist");

    await page.goto("/en/growth-audit-checklist");
    await expect(page.getByTestId("diagnostic-link")).toHaveAttribute("href", "/en/startup-growth-diagnostic");

    // Le CTA est un `<a>` nu, pas un `next/link` : cross-root.
    const cta = page.getByRole("link", { name: /Start your Tour/ });
    await expect(cta).toHaveAttribute("href", "/quiz");
  });

  test("both are reachable from pages that already exist — the 2.4 rule", async ({ page }) => {
    await page.goto("/en/how-it-works");
    await expect(page.getByTestId("checklist-link")).toBeVisible();
    await expect(page.getByTestId("diagnostic-link")).toBeVisible();

    // Et la checklist a son lien de pied de page, donc un chemin constant
    // depuis n'importe quelle page de contenu.
    await expect(page.locator('footer a[href="/en/growth-audit-checklist"]')).toBeVisible();
  });

  test("both declare an Article and a breadcrumb", async ({ page }) => {
    for (const path of PAGES) {
      await page.goto(`/en${path}`);
      const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
      const types = blocks.map((block) => JSON.parse(block)["@type"]);
      expect(types).toContain("Article");
      expect(types).toContain("BreadcrumbList");
    }
  });

  test("neither page scrolls sideways on a phone, and the H1 scales down", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const path of PAGES) {
      for (const locale of ["en", "fr"] as const) {
        await page.goto(`/${locale}${path}`);
        const box = await page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          client: document.documentElement.clientWidth,
        }));
        expect(box.scroll, `${locale}${path}`).toBe(box.client);

        /**
         * Le titre français prenait six lignes à 62 px. La règle qui le
         * réduit vient d'un autre module CSS que celle qu'elle doit battre,
         * donc elle est écrite en sélecteur élément + classe — mesuré ici
         * plutôt que supposé, parce qu'à égalité de spécificité le gagnant
         * dépendrait de l'ordre d'émission des feuilles.
         */
        const size = await page.locator("h1").evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
        expect(size, `${locale}${path}`).toBeLessThan(50);
      }
    }
  });
});
