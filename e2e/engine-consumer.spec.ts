import type { Page } from "@playwright/test";
import { ENGINE_COPY } from "@/content/engine-copy";
import { ENGINE_CATALOG } from "@/content/engine-catalog";
import { ENGINE_CATALOG_CONSUMER } from "@/content/engine-catalog-consumer";
import { fillTemplate } from "@/lib/engine/format";
import { consumerState, consumerUsageOnlyState, exampleState } from "../src/lib/engine/__tests__/fixtures";
import type { EngineState } from "../src/lib/engine/types";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test, trackedEvents } from "./helpers";
import { backToBoard, engineSeed, openEngineMenu, openNumber, storedEngineEntry } from "./engine-helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the
// owner's signed preview, minted by /admin/preview (e2e/helpers.ts).
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/**
 * The consumer app, end to end (engine spec §21.10.3, A22 APP-11): the start
 * card's fourth answer and its three ways of earning, the app's numbers and
 * their sources and references, the example and the board's money, the
 * settings, a target on the active retention, a file imported and one refused
 * by the merge, and the public page's sentence — in French at 1 280px and in
 * English at 390px, read from the screen and the device, never from a
 * component's state.
 *
 * CI builds with `ENGINE_TYPES=consumer-app`: the type is open, and the last
 * block (« type fermé ») skips. Run locally on a build WITHOUT the variable,
 * it is the other way round: the open half skips, the closed half runs — the
 * motive of `game-flag.spec.ts`, inverted. CI never runs the closed half; its
 * guards there are unit tests (`startCopy` in `start.test.ts`,
 * `openTypesWith("")` in `business-type.test.ts`).
 */
const TYPE_OPEN = (process.env.ENGINE_TYPES ?? "").split(",").some((name) => name.trim() === "consumer-app");

const CLOCK = new Date(2026, 8, 24, 12);
const NB = " ";

const VIEWS = [
  ["fr", 1280, 900],
  ["en", 390, 844],
] as const;
type Locale = (typeof VIEWS)[number][0];

/** The app's catalogue entries by id: the fifteen the app keeps rewrite theirs, the `app.*` are the base's. */
const nameOf = (id: string, locale: Locale): string =>
  (ENGINE_CATALOG_CONSUMER as Record<string, { name: Record<Locale, string> }>)[id]?.name[locale] ?? (ENGINE_CATALOG as Record<string, { name: Record<Locale, string> }>)[id]!.name[locale];

async function openPage(page: Page, locale: Locale, width: number, height: number): Promise<void> {
  await page.setViewportSize({ width, height });
  await page.clock.setFixedTime(CLOCK);
  await page.goto(`/${locale}/aarrr-funnel-template`);
  await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
}

/** The board of an engine seeded on the device. */
async function openBoard(page: Page, locale: Locale, width: number, height: number, state: EngineState): Promise<void> {
  await page.addInitScript(
    (items) => {
      if (sessionStorage.getItem("e2e-engine-seeded")) return;
      for (const [key, value] of items) localStorage.setItem(key, value);
      sessionStorage.setItem("e2e-engine-seeded", "1");
    },
    engineSeed(state),
  );
  await openPage(page, locale, width, height);
  await expect(page.getByTestId("engine-board")).toBeVisible();
}

test.describe("the consumer app, type open", () => {
  test.skip(!TYPE_OPEN, 'ENGINE_TYPES does not hold "consumer-app" for this build — the type is closed; the closed half below runs instead.');

  for (const [locale, width, height] of VIEWS) {
    test.describe(`${locale} at ${width}`, () => {
      // 1 — the start card offers the app; three ways of earning; none ticked creates nothing.
      test("the start card: the app's answer, its three ways of earning, nothing created without one", async ({ page }) => {
        await openPage(page, locale, width, height);
        const radio = page.locator("#engine-start-motion-app");
        await expect(page.getByTestId("engine-start")).toContainText(ENGINE_COPY.start.app[locale]);
        await expect(page.getByTestId("engine-start-earns")).toHaveCount(0);
        await radio.check();
        const earns = page.getByTestId("engine-start-earns");
        await expect(earns).toBeVisible();
        await expect(earns).toContainText(ENGINE_COPY.start.appEarns.subscriptions[locale]);
        await expect(earns).toContainText(ENGINE_COPY.start.appEarns.purchases[locale]);
        await expect(earns).toContainText(ENGINE_COPY.start.appEarns.ads[locale]);
        // Subscriptions ticked at the start, the other two not.
        await expect(page.getByTestId("engine-start-earns-subscriptions")).toBeChecked();
        await expect(page.getByTestId("engine-start-earns-purchases")).not.toBeChecked();
        await expect(page.getByTestId("engine-start-earns-ads")).not.toBeChecked();
        await expect(page.getByTestId("engine-start-plan")).toHaveText(fillTemplate(ENGINE_COPY.start.plan[locale], { n: 18, quick: 5, hour: 8, ask: 5 }));

        // None ticked: « Commencer » stays active, says why under the group, and creates nothing.
        await page.getByTestId("engine-start-earns-subscriptions").uncheck();
        await page.getByTestId("engine-start-go").click();
        await expect(page.getByTestId("engine-start-earns-error")).toHaveText(ENGINE_COPY.start.appEarnsNone[locale]);
        await expect(page.getByTestId("engine-start")).toBeVisible();
        expect(await page.evaluate(() => Object.keys(window.localStorage).filter((key) => key.startsWith("tdg.engine")))).toEqual([]);
        // Ticking a box takes the message away.
        await page.getByTestId("engine-start-earns-ads").check();
        await expect(page.getByTestId("engine-start-earns-error")).toHaveCount(0);
      });

      // 2 — the three ways ticked, started: the bar and the list of numbers speak the app's words.
      test("three ways ticked and started: the bar says « app », the list holds the app's numbers", async ({ page }) => {
        await openPage(page, locale, width, height);
        await page.locator("#engine-start-motion-app").check();
        for (const way of ["subscriptions", "purchases", "ads"] as const) await page.getByTestId(`engine-start-earns-${way}`).check();
        await expect(page.getByTestId("engine-start-plan")).toHaveText(fillTemplate(ENGINE_COPY.start.plan[locale], { n: 21, quick: 5, hour: 10, ask: 6 }));
        await page.getByTestId("engine-start-go").click();
        await page.getByTestId("engine-targets-next").click();
        await page.getByTestId("engine-number").waitFor();
        await backToBoard(page);
        // The bar's line is set in capitals by its style: the words are compared without the case.
        await expect(page.getByTestId("engine-bar")).toContainText(new RegExp(ENGINE_COPY.workbench.modelShort.app[locale], "i"));
        const rows = page.locator('[data-testid^="engine-metric-"]');
        await expect(rows).toHaveCount(21);
        for (const id of ["acq.signup-rate", "app.acq.cpi", "app.rev.purchases-per-active", "app.rev.commission"]) {
          await expect(page.getByTestId(`engine-metric-${id.replace(/\./g, "-")}`)).toContainText(nameOf(id, locale));
        }
        // The SaaS's cost of a new payer and its margin are replaced, never listed beside the app's.
        await expect(page.getByTestId("engine-metric-acq-cac")).toHaveCount(0);
        await expect(page.getByTestId("engine-metric-rev-gross-margin")).toHaveCount(0);
        // The choice of the type is counted, as a choice (Q14) — never a word or a number.
        await expect.poll(() => trackedEvents(page)).toContain("engine_setup/app");
      });

      // 3 — the sources first, the one reference, none where the SaaS's does not carry.
      test("an install rate is found in the stores first; day-30 retention is placed by its reference; subscriber churn has none", async ({ page }) => {
        await openBoard(page, locale, width, height, consumerState());
        const rate = await openNumber(page, "acq-signup-rate");
        // « Où le trouver »: the stores first, then the attribution tools — not the SaaS's analytics.
        await expect(rate.getByTestId("engine-where")).toContainText("App Store Connect · Google Play Console");
        await expect(rate.getByTestId("engine-where")).not.toContainText("GA4");

        const d30 = await openNumber(page, "ret-d30");
        const reference = d30.getByTestId("engine-reference");
        await expect(reference).toContainText(ENGINE_COPY.sheet.compareReference[locale].split("{range}")[0]!);
        await expect(reference).toContainText(/20\D{1,3}30/);
        // « Pour situer, sans désigner d'étape »: a reference that situates, never one that names a stage.
        await expect(reference).toContainText(ENGINE_COPY.sheet.compareCaveat[locale].split("{caveat}")[0]!);

        const churn = await openNumber(page, "ret-logo-churn");
        await expect(churn.getByTestId("engine-reference")).not.toContainText(ENGINE_COPY.sheet.compareReference[locale].split("{range}")[0]!);
        await expect(churn.getByTestId("engine-reference")).toContainText(ENGINE_COPY.sheet.noReference[locale].split("{reason}")[0]!);
      });

      // 4 — the example, then the money of the same app on the board.
      test("the example: out of 100 installs; the money, the two streams and the payback of an install, without cash tied up", async ({ page }) => {
        await openPage(page, locale, width, height);
        await page.locator("#engine-start-motion-app").check();
        await page.getByTestId("engine-start-example").click();
        const example = page.getByTestId("engine-example");
        await expect(example).toBeVisible();
        await expect(example).toContainText(ENGINE_COPY.example.bannerTitleApp[locale]);
        // The peloton's titles say the base is 100 installs: the verdict above it (set in capitals by its style), and its table.
        const hundred = locale === "fr" ? "Sur 100 installations" : "Out of 100 installs";
        await expect(example.getByTestId("engine-verdict")).toContainText(hundred, { ignoreCase: true });
        await expect(example.getByTestId("engine-peloton")).toContainText(hundred);
        await page.getByTestId("engine-example-back").click();

        await openBoard(page, locale, width, height, consumerState());
        const money = page.getByTestId("engine-money-plg");
        await expect(money.getByTestId("engine-money-plg-figure-mrr")).toContainText(locale === "fr" ? `39${NB}300${NB}€` : "€39,300");
        const streams = page.getByTestId("engine-app-streams");
        await expect(streams.getByTestId("engine-app-streams-subscriptions")).toContainText(locale === "fr" ? `28${NB}800${NB}€` : "€28,800");
        await expect(streams.getByTestId("engine-app-streams-usage")).toContainText(locale === "fr" ? `10${NB}500${NB}€` : "€10,500");
        await expect(money.getByTestId("engine-money-plg-months")).toContainText(locale === "fr" ? "13 mois" : "13 months");
        // No cash tied up for an app (D11): no fact, and the line that says why.
        await expect(money.getByTestId("engine-money-plg-fact-tied")).toHaveCount(0);
        await expect(money.getByTestId("engine-money-plg-cash")).toContainText(ENGINE_COPY.money.lineApp[locale]);
        // The page never scrolls sideways.
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      });

      // 5 — the settings: the type is fixed, a way of earning unticked and ticked again.
      test("the settings: the type is fixed, an unticked way of earning is said before saving, hides its number and gives it back", async ({ page }) => {
        await openBoard(page, locale, width, height, consumerState());
        const adsRow = page.getByTestId("engine-metric-app-rev-ads-per-active");
        await expect(adsRow).toContainText(locale === "fr" ? "0,40" : "0.40");
        await page.getByTestId("engine-bar-settings").click();
        const type = page.getByTestId("engine-setup-type-fixed");
        await expect(type).toContainText(ENGINE_COPY.setup.types.consumerApp[locale]);
        await expect(page.getByTestId("engine-settings")).toContainText(ENGINE_COPY.setup.typeFixed[locale]);
        await expect(page.getByTestId("engine-setup-earns-ads")).toBeChecked();

        await page.getByTestId("engine-setup-earns-ads").uncheck();
        await expect(page.getByTestId("engine-settings-resets")).toHaveText(
          fillTemplate(ENGINE_COPY.settings.streamOffOne[locale], { stream: ENGINE_COPY.settings.streamSubject.ads[locale] }),
        );
        await page.getByTestId("engine-settings-save").click();
        await expect(page.getByTestId("engine-board")).toBeVisible();
        await expect(adsRow).toHaveCount(0);
        // Nothing erased: the number is still on the device.
        const stored = (await storedEngineEntry<{ state: EngineState }>(page))!.state;
        expect(stored.setup.monetization).toEqual({ subscriptions: true, purchases: true, ads: false });
        expect(stored.snapshots[0]!.metrics["app.rev.ads-per-active"]?.value).toBeDefined();

        await page.getByTestId("engine-bar-settings").click();
        await page.getByTestId("engine-setup-earns-ads").check();
        await page.getByTestId("engine-settings-save").click();
        await expect(page.getByTestId("engine-board")).toBeVisible();
        await expect(adsRow).toContainText(locale === "fr" ? "0,40" : "0.40");
      });

      // 5 bis — a target on the active retention, which names the stage when it is the one that falls short.
      test("an app earning from purchases and ads: a target on active retention, posed at 95%, is on the board and names the stage", async ({ page }) => {
        const state = consumerUsageOnlyState();
        // The example's team already aims at 92%: take it away, so the screen proposes one.
        delete state.snapshots.at(-1)!.targets["app.ret.active-retention"];
        await openBoard(page, locale, width, height, state);
        const sheet = await openNumber(page, "app-ret-active-retention");
        const target = sheet.locator("#engine-app-ret-active-retention-target");
        await expect(target).toBeVisible();
        await expect(target).toHaveValue("");
        await target.fill("95");
        await sheet.getByTestId("engine-save-app-ret-active-retention").click();
        await expect(sheet).toHaveCount(0);
        await backToBoard(page);
        // The target is written on the device…
        const snapshots = (await storedEngineEntry<{ state: EngineState }>(page))!.state.snapshots;
        expect(snapshots[snapshots.length - 1]!.targets["app.ret.active-retention"]).toBe(95);
        // …and the diagnosis names the active retention, with its value and « sous ta cible ».
        const diagnosis = page.getByTestId("engine-diagnosis");
        await expect(diagnosis).toContainText(nameOf("app.ret.active-retention", locale));
        await expect(diagnosis).toContainText(locale === "fr" ? /90\s%, sous ta cible \(95\s%\)/ : /90%, below your target \(95%\)/);
      });

      // 6 — a file of an app opens; the merge of an app into a SaaS is refused, with the existing sentence.
      test("an app's file opens as an app; merged into a SaaS engine, it is refused with the type's reason", async ({ page }) => {
        await openPage(page, locale, width, height);
        const file = { name: "app.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(consumerState())) };
        await page.getByTestId("engine-start-import").click();
        await page.getByTestId("engine-import-file").setInputFiles(file);
        await page.getByTestId("engine-import-open").click();
        await expect(page.getByTestId("engine-board")).toBeVisible();
        await expect(page.getByTestId("engine-bar")).toContainText(new RegExp(ENGINE_COPY.workbench.modelShort.app[locale], "i"));
        await expect(page.getByTestId("engine-money-plg-figure-mrr")).toBeVisible();

        // A SaaS engine alone on a device: the file can be added, never merged.
        await page.evaluate(() => window.localStorage.clear());
        await page.addInitScript(
          (items) => {
            for (const [key, value] of items) localStorage.setItem(key, value);
          },
          engineSeed(exampleState()),
        );
        await page.reload();
        await expect(page.getByTestId("engine-board")).toBeVisible();
        await openEngineMenu(page);
        await page.getByTestId("engine-import-open-screen").click();
        await page.getByTestId("engine-import-file").setInputFiles(file);
        await expect(page.getByRole("radio", { name: /Merge into|Fusionner dans/ })).toBeDisabled();
        await expect(page.getByTestId("engine-import-choices")).toContainText(ENGINE_COPY.io.mergeRefused.type[locale]);
      });
    });
  }
});

/**
 * 7 — the public page's sentence (D15, C63), read without JavaScript: the
 * fifth answer of the FAQ, and only that one, says the engine also serves the
 * consumer apps — when the build opens the type.
 */
test.describe("the FAQ's sentence, without JavaScript", () => {
  test.skip(!TYPE_OPEN, 'ENGINE_TYPES does not hold "consumer-app" for this build — the sentence is absent by design; see the closed half below.');
  test.use({ javaScriptEnabled: false });

  for (const locale of ["fr", "en"] as const) {
    test(`${locale}: the fifth answer carries the sentence, the other five do not, the count stays six`, async ({ page }) => {
      await page.goto(`/${locale}/aarrr-funnel-template`);
      const items = page.getByTestId("engine-faq-item");
      await expect(items).toHaveCount(6);
      await expect(items.nth(4)).toContainText(ENGINE_COPY.faqTypeNote.consumerApp[locale]);
      if (locale === "fr") await expect(items.nth(4)).toContainText("Il sert aussi les apps grand public");
      for (const index of [0, 1, 2, 3, 5]) await expect(items.nth(index)).not.toContainText(ENGINE_COPY.faqTypeNote.consumerApp[locale]);
      // A paragraph, not a page: the answer with its sentence stays under the 400 characters the copy contract holds.
      const answer = (await items.nth(4).locator("p").textContent())!;
      expect(answer.length).toBeLessThanOrEqual(400);
    });
  }
});

/**
 * 8 — « type fermé »: a build WITHOUT `ENGINE_TYPES`. The start card is the
 * SaaS's alone, « App grand public » is greyed in the full card, and the
 * FAQ's sentence is absent. Skips when the type is open (CI always builds it
 * open): it runs locally, on a build without the variable, and the report of
 * the unit that touches it says that it ran.
 */
test.describe("the consumer app, type closed", () => {
  test.skip(TYPE_OPEN, 'ENGINE_TYPES holds "consumer-app" for this run — the closed state needs a build without the variable.');

  for (const [locale, width, height] of VIEWS) {
    test(`${locale} at ${width}: the start card is today's, the app is greyed in the full card, the FAQ says nothing of it`, async ({ page }) => {
      await openPage(page, locale, width, height);
      const start = page.getByTestId("engine-start");
      // Today's card: its own legend, three answers, no app, no way of earning.
      await expect(start).toContainText(ENGINE_COPY.start.legend[locale]);
      await expect(start).not.toContainText(ENGINE_COPY.start.legendTypes[locale]);
      await expect(page.locator("#engine-start-motion-app")).toHaveCount(0);
      await expect(page.locator('[name="engine-motion"]')).toHaveCount(3);

      await page.getByTestId("engine-start-change").click();
      const app = page.getByRole("radio", { name: ENGINE_COPY.setup.types.consumerApp[locale] });
      await expect(app).toBeDisabled();
      await expect(page.getByTestId("engine-setup")).toContainText(ENGINE_COPY.setup.typeLater[locale]);

      const answer = await page.getByTestId("engine-faq-item").nth(4).textContent();
      expect(answer).not.toContain(ENGINE_COPY.faqTypeNote.consumerApp[locale]);
    });
  }
});
