import { ADMIN_PASSWORD, SKIP_ADMIN_REASON, adminCredentials, answerAllQuestions, expect, stubSubmissions, test } from "./helpers";

/**
 * REVIEW.md R-19 — what axe structurally cannot see.
 *
 * The contrast and naming checks live in `accessibility.spec.ts`; these are
 * the behavioural ones: where focus goes when the screen changes. Answering
 * removes the button that had focus, so without this a keyboard user landed
 * back on `<body>` and had to tab from the top of the page — fifteen times
 * in a row.
 */
async function focusedRole(page: import("@playwright/test").Page): Promise<string> {
  return page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return "body";
    return el.getAttribute("role") ?? el.tagName.toLowerCase();
  });
}

test.describe("keyboard and screen-reader flow", () => {
  test("focus follows each new question instead of falling back to the page", async ({ page }) => {
    await page.goto("/quiz");
    await page.getByTestId("answer-option").first().click();

    expect(await focusedRole(page)).toBe("group");
    await expect(page.locator(":focus")).toHaveAttribute("aria-label", /Q 2 \/ 15/);

    // And it keeps up when going back, not only forward.
    await page.getByTestId("back-button").click();
    await expect(page.locator(":focus")).toHaveAttribute("aria-label", /Q 1 \/ 15/);
  });

  test("focus lands on the tone selector once the last question is answered", async ({ page }) => {
    await stubSubmissions(page);
    await page.goto("/quiz");
    await answerAllQuestions(page);

    await expect(page.locator(":focus")).toHaveText(/How do you want your results\?/i);
  });

  test("focus lands on the error screen when the calculation fails", async ({ page }) => {
    await stubSubmissions(page, 500);
    await page.goto("/quiz");
    await answerAllQuestions(page);
    await page.getByTestId("get-score-cta").click();

    await expect(page.getByTestId("retry-button")).toBeVisible();
    expect(await focusedRole(page)).toBe("alert");
  });

  test("the progress bar reports where you are, not just how it looks", async ({ page }) => {
    await page.goto("/quiz");
    const bar = page.getByRole("progressbar").first();

    await expect(bar).toHaveAttribute("aria-valuemin", "1");
    await expect(bar).toHaveAttribute("aria-valuemax", "5");
    await expect(bar).toHaveAttribute("aria-valuenow", "1");
    await expect(bar).toHaveAttribute("aria-label", /Stage 1 of 5/i);

    // Three answers complete the first pillar.
    for (let i = 0; i < 3; i += 1) await page.getByTestId("answer-option").first().click();
    await expect(bar).toHaveAttribute("aria-valuenow", "2");
  });

  test("the glossary definition takes focus, and gives it back on Escape", async ({ page }) => {
    await page.goto("/quiz");
    // act-1 carries the "aha moment" trigger; walk to it.
    for (let i = 0; i < 3; i += 1) await page.getByTestId("answer-option").first().click();

    const trigger = page.getByRole("button", { name: /Definition:/i }).first();
    await trigger.click();

    expect(await focusedRole(page)).toBe("dialog");

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    // Focus must come back to what opened it, not to <body>.
    await expect(page.locator(":focus")).toHaveAttribute("aria-label", /Definition:/i);
  });
});

/**
 * AUDIT-PLAN.md §3.1 — le parcours de l'instrument d'audit se fait au
 * clavier, même exigence que R-19 pour le questionnaire.
 *
 * Ce que ces specs affirment est un COMPORTEMENT, pas la présence d'un
 * attribut : une ligne se renseigne et s'enregistre sans toucher la souris.
 * Un `tabindex` correct sur chaque champ ne dit rien de ça — il suffit qu'un
 * conteneur intercale un piège, ou qu'un bouton soit rendu hors de l'ordre
 * du document, pour que le parcours casse alors que tous les attributs sont
 * justes.
 */
test.describe("the audit instrument at the keyboard", () => {
  test.skip(ADMIN_PASSWORD === "", SKIP_ADMIN_REASON);
  test.use({ httpCredentials: adminCredentials });

  type Page = import("@playwright/test").Page;

  /** L'ordre de tabulation à partir du focus courant, sur `count` pressions. */
  async function tabOrder(page: Page, count: number): Promise<string[]> {
    const order: string[] = [];
    for (let i = 0; i < count; i++) {
      await page.keyboard.press("Tab");
      order.push(
        await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          if (!el || el === document.body) return "body";
          return el.id || el.getAttribute("data-testid") || el.tagName.toLowerCase();
        }),
      );
    }
    return order;
  }

  test("a row is filled in and saved without touching the mouse", async ({ page }) => {
    await page.goto("/admin/audit");
    await page.getByTestId("new-mission").focus();
    await page.keyboard.press("Enter");
    await page.locator("#company").fill("Acme Analytics");
    await page.getByTestId("create-mission").focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("row-list")).toBeVisible();

    await page.getByTestId("open-row-m01").focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("entry-form")).toBeVisible();

    // Le sélecteur de statut est atteignable en tabulant depuis le haut du
    // formulaire, et c'est lui qui débloque tout le reste de la saisie.
    await page.getByTestId("close-row").focus();
    const order = await tabOrder(page, 12);
    expect(order).toContain("status");

    await page.locator("#status").focus();
    await page.locator("#status").selectOption("absent");
    await expect(page.getByTestId("absence-fields")).toBeVisible();

    // Les champs qu'un statut fait apparaître entrent dans l'ordre de
    // tabulation ; sinon un utilisateur clavier verrait un formulaire qu'il
    // ne peut pas remplir.
    const afterStatus = await tabOrder(page, 10);
    expect(afterStatus).toContain("absentCause");
    expect(afterStatus).toContain("repairScale");

    await page.locator("#absentCause").selectOption("not-instrumented");
    await page.locator("#repairScale").selectOption("quarter");
    await page.getByTestId("save-row").focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("status-m01")).toHaveText("L'entreprise ne l'a pas");
  });

  test("the optional block opens at the keyboard — a disclosure nobody can open hides its fields", async ({ page }) => {
    await page.goto("/admin/audit");
    await page.getByTestId("new-mission").click();
    await page.locator("#company").fill("Acme Analytics");
    await page.getByTestId("create-mission").click();
    await page.getByTestId("open-row-m01").click();
    await page.locator("#status").selectOption("measured");

    await expect(page.locator("#decisionAtStake")).toBeHidden();
    // Le `<summary>` natif, pas un rôle : `Disclosure` enveloppe son libellé
    // dans un `<span>` et ajoute un marqueur `::before`, donc le nom
    // accessible n'est pas le texte visible — piège déjà rencontré en 1.3b.
    await page.getByTestId("context-disclosure").locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#decisionAtStake")).toBeVisible();
  });
});
