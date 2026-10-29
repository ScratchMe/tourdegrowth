import { readFile } from "node:fs/promises";
import type { Locator, Page } from "@playwright/test";
import { refusedIn, type Kind, type Offering } from "@/content/__tests__/mkt-words";
import { ENGINE_CATALOG } from "@/content/engine-catalog";
import { ENGINE_COPY } from "@/content/engine-copy";
import { fillTemplate, formatMoney, roundSignificant } from "@/lib/engine/format";
import { EXAMPLE_MKT_WHATIF } from "../src/lib/engine/example";
import { exampleState, marketplaceState } from "../src/lib/engine/__tests__/fixtures";
import type { EngineState, MetricId } from "../src/lib/engine/types";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, openFold, SKIP_ADMIN_REASON, test, trackedEvents } from "./helpers";
import { backToBoard, engineSeed, expectFound, expectLeft, openEngineMenu, openNumber, storedEngineEntry } from "./engine-helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the
// owner's signed preview, minted by /admin/preview (e2e/helpers.ts).
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/**
 * The marketplace, end to end (engine spec §22.11.3 and §22.11.4, A23 MKT-10): the start card's answer, its offering and its
 * sellers' subscriptions, the five targets of the two sides, the 19 numbers of the example typed through their own screens, the
 * board of each side and its total, the four levers of the example, the slides, « services », the subscriptions unticked and
 * ticked again, a window changed, a file exported, cleared, imported and refused by a SaaS engine — in French at 1 280px and
 * in English at 390px, read from the screen and the device, never from a component's state.
 *
 * **The words guard** (§22.11.3) reads what the screen PRINTS, by the lists the copy test reads (`mkt-words.ts`, one function,
 * `refusedIn`): a side's board holds no word of the SaaS, each side its own, and in « services » none of « produits ». It reads
 * the text a person sees (`innerText`) — the board's two sides with « Et si » folded open and every « ? » opened (their
 * definitions are mounted only when open) — and the whole island for « SaaS » alone. `main` itself carries the landing page's
 * and the catalogue's SaaS words: the island, `engine-workbench`, is the scope.
 *
 * Non-vacuity, measured on 2026-10-29 (each break alone, a build of the CI's environment, this spec run — 18 specs open, 2 closed): « MRR » put
 * in the net revenue's sentence of the demand's money (`mkt.money.perBuyerNote`, a leaf the copy test does not read, so only this spec sees
 * it) falls 8 — the typed board, the levers, the unticked subscriptions and the example, in both languages; the marketplace never open
 * (`openTypesWith` ignoring the list) falls 6 — the start card and the example in both languages, the FAQ's sentence twice — and always open,
 * on a build whose variable lacks it, falls both « type fermé » specs (18 skip); « SaaS » in the note under the total slide falls the
 * slides spec (1, in French — the French leaf only). The FAQ's sentence of the app, with both types open, is `engine-consumer.spec.ts`'s too:
 * the page naming the app's sentence for both falls 4 specs (two here, two there).
 *
 * CI builds with `ENGINE_TYPES=consumer-app,marketplace`: the type is open, and the last block (« type fermé ») skips. Run
 * locally on a build WITHOUT `marketplace` in the variable, it is the other way round: the open half skips, the closed half
 * runs — the motive of `engine-consumer.spec.ts`. CI never runs the closed half; its guards there are unit tests
 * (`openTypesWith`, `business-type.test.ts`).
 */
const TYPES = (process.env.ENGINE_TYPES ?? "").split(",").map((name) => name.trim());
const TYPE_OPEN = TYPES.includes("marketplace");
const APP_OPEN = TYPES.includes("consumer-app");

const CLOCK = new Date(2026, 8, 24, 12);

const VIEWS = [
  ["fr", 1280, 900],
  ["en", 390, 844],
] as const;
type Locale = (typeof VIEWS)[number][0];
type Side = "demand" | "supply";

/** An amount as the engine prints it: grouped, cents when there are some — « 32 853,60 € » / "€32,853.60". */
const money = (value: number, locale: Locale) => formatMoney(value, "EUR", locale);
/** A projection as the engine prints it: two significant digits and « ~ » (C97) — « ~46 000 € ». */
const approx = (value: number, locale: Locale) => fillTemplate(ENGINE_COPY.units.approx[locale], { n: money(roundSignificant(value, 2), locale) });
/** The same amount without the « ~ »: how the « Et si » panel prints what each lever brings. */
const rounded = (value: number, locale: Locale) => money(roundSignificant(value, 2), locale);
/** A count typed the way a person of that language writes it (« 32853,6 » / "32853.6"). */
const typed = (value: string, locale: Locale) => (locale === "fr" ? value.replace(".", ",") : value);

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

/** « Côté affiché »: the side's board, its verdict first. */
async function showSide(page: Page, locale: Locale, side: Side): Promise<void> {
  const label = ENGINE_COPY.mkt.side[side][locale];
  await page.getByTestId("engine-side-selector").getByRole("button", { name: label, exact: true }).click();
  await expect(page.getByTestId("mkt-side")).toHaveAttribute("data-side", side);
}

// ------------------------------------------------------------------------------------------------ the words guard (§22.11.3)

/** The lines of a text, each held to the kind's rule; what a line holds is reported with the line. */
function violationsIn(where: string, text: string, locale: Locale, kind: Kind, offering: Offering, exempt: readonly string[] = []): string[] {
  let rest = text;
  for (const phrase of exempt) rest = rest.split(phrase).join("");
  return rest
    .split("\n")
    .flatMap((line) => {
      const words = refusedIn(line, locale, kind, offering);
      return words.length > 0 ? [`${where} (${kind}, ${offering}, ${locale}): ${JSON.stringify(words)} in « ${line.trim().slice(0, 160)} »`] : [];
    });
}

/**
 * The two definitions of §22.8.5 k that §22.11.3 contradicts, word for word, and that a « ? » shows only when opened
 * (`EngineTerm.tsx`): the take rate says « SaaS » (it plays the part MRR plays in a SaaS), the net revenue says « MRR ». Named
 * exceptions until the bon à tirer A23.d rewrites them (`docs/engine/a23d-a-regarder.md`); each holds EXACTLY these words, so a
 * rewritten definition makes this test say the exception is dead.
 */
const TERM_EXCEPTIONS: Readonly<Record<string, readonly string[]>> = {
  takeRate: ["SaaS", "MRR"],
  netRevenue: ["MRR"],
};

/** Every « ? » of the board, opened one by one: the definition each one shows, held to the side's rule (or its named exception). */
async function termProblems(page: Page, scope: Locator, locale: Locale, side: Side, offering: Offering): Promise<string[]> {
  const ids = await scope.locator('[data-testid^="engine-term-"]').evaluateAll((els) => els.map((el) => el.getAttribute("data-testid")!.slice("engine-term-".length)));
  const problems: string[] = [];
  expect(ids.length, "the board teaches at least its money's words").toBeGreaterThan(2);
  for (const id of [...new Set(ids)]) {
    await scope.getByTestId(`engine-term-${id}`).first().click();
    const text = await page.getByRole("dialog").innerText();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    const found = refusedIn(text, locale, side, offering);
    const allowed = TERM_EXCEPTIONS[id] ?? [];
    if ([...found].sort().join("|") !== [...allowed].sort().join("|")) {
      problems.push(`« ? » ${id} (${side}, ${offering}, ${locale}): holds ${JSON.stringify(found)}, the named exception allows ${JSON.stringify(allowed)}: « ${text.replace(/\s+/g, " ").slice(0, 160)} »`);
    }
  }
  return problems;
}

/**
 * The words guard on the board of a marketplace: each side with its « Et si » panel open and every « ? » opened, then the whole
 * island for « SaaS » alone (and, in « services », for the words of « produits »).
 */
async function expectBoardWords(page: Page, locale: Locale, offering: Offering, label: string): Promise<void> {
  const problems: string[] = [];
  for (const side of ["demand", "supply"] as const) {
    await showSide(page, locale, side);
    const fold = page.getByTestId("engine-board-whatif");
    if (await fold.count()) await openFold(fold);
    const scope = page.getByTestId("mkt-side");
    const text = await scope.innerText();
    expect(text.length, `${label}: the ${side} side printed something`).toBeGreaterThan(400);
    problems.push(...violationsIn(`${label} ${side}`, text, locale, side, offering));
    problems.push(...(await termProblems(page, scope, locale, side, offering)));
  }
  const island = await page.getByTestId("engine-workbench").innerText();
  expect(island.length, `${label}: the island printed something`).toBeGreaterThan(1500);
  problems.push(...violationsIn(`${label} island`, island, locale, "anywhere", offering));
  expect(problems).toEqual([]);
}

// ------------------------------------------------------------------------------------------------ the example, typed

/**
 * The 19 numbers of §22.10.1 as a person types them: two counts, the tool they come from, the first variant when the number
 * asks which it counts. The margin of the commissions is an estimate (55 to 65 %), typed as one.
 */
const NUMBERS: readonly { dom: string; num: string; den: string; source: string; variant?: string }[] = [
  { dom: "mkt-buy-signup-rate", num: "3000", den: "60000", source: "ga4" },
  { dom: "mkt-buy-cac", num: "18000", den: "600", source: "google-ads", variant: "media-only" },
  { dom: "mkt-sell-cac", num: "12000", den: "120", source: "spreadsheet", variant: "media-only" },
  { dom: "mkt-sell-signup-rate", num: "400", den: "8000", source: "ga4" },
  { dom: "mkt-buy-first-order", num: "580", den: "2900", source: "product-db" },
  { dom: "mkt-sell-first-sale", num: "126", den: "420", source: "product-db" },
  { dom: "mkt-liq-fill-rate", num: "2340", den: "26000", source: "amplitude", variant: "searches" },
  { dom: "mkt-buy-repeat", num: "145", den: "2900", source: "product-db" },
  { dom: "mkt-buy-churn", num: "560", den: "14000", source: "product-db" },
  { dom: "mkt-sell-churn", num: "96", den: "3200", source: "product-db" },
  { dom: "mkt-sell-paid-churn", num: "27", den: "900", source: "stripe" },
  { dom: "mkt-buy-referred-share", num: "232", den: "2900", source: "product-db" },
  { dom: "mkt-rev-take-rate", num: "32853.6", den: "273780", source: "stripe" },
  { dom: "mkt-rev-aov", num: "273780", den: "4212", source: "product-db" },
  { dom: "mkt-rev-frequency", num: "4212", den: "14040", source: "product-db" },
  { dom: "mkt-sell-paid-conversion", num: "63", den: "420", source: "stripe" },
  { dom: "mkt-sell-arpa", num: "26100", den: "900", source: "stripe" },
  { dom: "mkt-sell-gross-margin", num: "22185", den: "26100", source: "spreadsheet" },
];

/**
 * Back to the board after a save. Saving the last number the person can read alone leads to the requests' screen (A18 T3.c), whose
 * way back is its own button: `backToBoard` knows the number's only.
 */
async function toBoard(page: Page): Promise<void> {
  const asks = page.getByTestId("engine-asks-back");
  if (await asks.count()) await asks.click();
  await backToBoard(page);
}

async function typeCounts(page: Page, locale: Locale, entry: (typeof NUMBERS)[number]): Promise<void> {
  const { dom } = entry;
  const sheet = await openNumber(page, dom);
  await sheet.locator(`#engine-${dom}-num`).fill(typed(entry.num, locale));
  await sheet.locator(`#engine-${dom}-den`).fill(typed(entry.den, locale));
  await sheet.locator(`#engine-${dom}-source`).selectOption(`tool:${entry.source}`);
  if (entry.variant) await sheet.locator(`#engine-${dom}-variant-${entry.variant}`).check();
  await sheet.getByTestId(`engine-save-${dom}`).click();
  await expectLeft(page, dom);
  await toBoard(page);
}

/** The margin on the commissions: « I can estimate it », 55 to 65 %, on an old number (§22.10.1). */
async function typeMargin(page: Page, locale: Locale): Promise<void> {
  const dom = "mkt-rev-gross-margin";
  const sheet = await openNumber(page, dom);
  await sheet.getByRole("button", { name: ENGINE_COPY.sheet.canEstimate[locale] }).click();
  await sheet.locator(`#engine-${dom}-low`).fill("55");
  await sheet.locator(`#engine-${dom}-high`).fill("65");
  await sheet.locator(`#engine-${dom}-basis-old-number`).check();
  await sheet.getByTestId(`engine-save-${dom}`).click();
  await expectLeft(page, dom);
  await toBoard(page);
}

// ------------------------------------------------------------------------------------------------ type open

test.describe("the marketplace, type open", () => {
  test.skip(!TYPE_OPEN, 'ENGINE_TYPES does not hold "marketplace" for this build — the type is closed; the closed half below runs instead.');

  for (const [locale, width, height] of VIEWS) {
    test.describe(`${locale} at ${width}`, () => {
      // 1 and 2 — the start card to the board, the 19 numbers typed, and what the board then says.
      test("the start card, the five targets and the 19 numbers: each side's board, the total, what holds each side back", async ({ page }) => {
        test.setTimeout(240_000);
        await openPage(page, locale, width, height);
        const start = page.getByTestId("engine-start");
        await expect(start).toContainText(ENGINE_COPY.start.mkt[locale]);
        await expect(page.getByTestId("engine-start-mkt")).toHaveCount(0);

        // The answer shows the offering (« products » by default) and the sellers' subscriptions (unticked).
        await page.locator("#engine-start-motion-mkt").check();
        const choice = page.getByTestId("engine-start-mkt");
        await expect(choice).toBeVisible();
        await expect(choice.getByRole("radio", { name: ENGINE_COPY.start.mktOfferingProducts[locale] })).toBeChecked();
        await expect(choice.getByRole("radio", { name: ENGINE_COPY.start.mktOfferingServices[locale] })).not.toBeChecked();
        const subscriptions = page.getByTestId("engine-start-mkt-subscriptions");
        await expect(subscriptions).not.toBeChecked();
        await expect(page.getByTestId("engine-start-plan")).toHaveText(fillTemplate(ENGINE_COPY.start.plan[locale], { n: 14, quick: 3, hour: 5, ask: 6 }));
        // Ticking the box brings the five numbers of the subscriptions: 19.
        await subscriptions.check();
        await expect(page.getByTestId("engine-start-plan")).toHaveText(fillTemplate(ENGINE_COPY.start.plan[locale], { n: 19, quick: 6, hour: 6, ask: 7 }));
        await page.getByTestId("engine-start-go").click();

        // « Cibles »: two groups, one per side; the example's five.
        await expect(page.getByTestId("engine-targets-start")).toBeVisible();
        const demand = page.getByTestId("engine-targets-start-demand");
        const supply = page.getByTestId("engine-targets-start-supply");
        await expect(demand).toContainText(ENGINE_COPY.mkt.side.demandTitle[locale]);
        await expect(supply).toContainText(ENGINE_COPY.mkt.side.supplyTitle[locale]);
        await expect(demand.locator("input")).toHaveCount(6);
        await expect(supply.locator("input")).toHaveCount(5);
        for (const [group, id, value] of [
          [demand, "mkt-buy-first-order", "25"],
          [demand, "mkt-liq-fill-rate", "12"],
          [supply, "mkt-sell-first-sale", "40"],
          [supply, "mkt-sell-paid-conversion", "20"],
          [supply, "mkt-sell-paid-churn", "2.5"],
        ] as const) {
          await group.locator(`#engine-step-target-${id}`).fill(typed(value, locale));
        }
        await page.getByTestId("engine-targets-next").click();
        await page.getByTestId("engine-number").waitFor();
        await backToBoard(page);
        await expect(page.getByTestId("engine-bar")).toContainText(new RegExp(ENGINE_COPY.workbench.modelShort.marketplace[locale], "i"));
        // The type counted as a choice (Q14), never a word or a number.
        await expect.poll(() => trackedEvents(page)).toContain("engine_setup/mkt");

        // The 19 numbers, each through its own screen.
        for (const entry of NUMBERS) await typeCounts(page, locale, entry);
        await typeMargin(page, locale);
        await expectFound(page, 18);
        await expect(page.getByTestId("engine-progress-counts")).toContainText(ENGINE_COPY.list.countEstOne[locale]);
        const stored = (await storedEngineEntry<{ state: EngineState }>(page))!.state;
        expect(stored.setup).toMatchObject({ type: "marketplace", offering: "products", sellerSubscriptions: true });
        expect(Object.keys(stored.snapshots[0]!.metrics)).toHaveLength(19);

        // The total: the two streams, the sum — the example's, to the cent.
        await expect(page.getByTestId("engine-total-mrr-demand")).toHaveText(money(32_853.6, locale));
        await expect(page.getByTestId("engine-total-mrr-supply")).toHaveText(money(26_100, locale));
        await expect(page.getByTestId("engine-total-sum")).toContainText(money(58_953.6, locale));

        // The demand: the fill rate holds the buyers back (9 % under a 12 % target), and the buyer's payback is said.
        const name = (id: MetricId) => ENGINE_CATALOG[id].name[locale];
        await showSide(page, locale, "demand");
        await expect(page.getByTestId("diagnosis-named-mkt.liq.fill-rate")).toContainText(name("mkt.liq.fill-rate"));
        await expect(page.getByTestId("diagnosis-named-mkt.liq.fill-rate")).toContainText(/9\s?%/);
        await expect(page.getByTestId("engine-numbers-activation")).toContainText(ENGINE_COPY.list.holds[locale]);
        await expect(page.getByTestId("engine-money-demand-figure-arr")).toContainText(money(394_243.2, locale));
        await expect(page.getByTestId("engine-money-demand-months")).toContainText(/20\D{1,4}23/);

        // The supply: the conversion to a paid seller holds the sellers back; the subscriptions' MRR is the example's.
        await showSide(page, locale, "supply");
        await expect(page.getByTestId("diagnosis-named-mkt.sell.paid-conversion")).toContainText(name("mkt.sell.paid-conversion"));
        await expect(page.getByTestId("diagnosis-named-mkt.sell.paid-conversion")).toContainText(/15\s?%/);
        await expect(page.getByTestId("engine-numbers-revenue")).toContainText(ENGINE_COPY.list.holds[locale]);
        await expect(page.getByTestId("engine-money-supply-figure-arr")).toContainText(money(313_200, locale));
        await expect(page.getByTestId("engine-total-mrr-supply")).toHaveText(money(26_100, locale));

        // The words guard (§22.11.3), on the board these 19 numbers drew, in « products ».
        await expectBoardWords(page, locale, "products", "typed board");
        // The page never scrolls sideways.
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      });

      // 3 — the four levers of the example, moved on the screen: each side's gain, as the engine prints it.
      test("the four levers of the example: the demand's three and the supply's one, each side's gain, nothing added across the sides", async ({ page }) => {
        await openBoard(page, locale, width, height, marketplaceState());
        // The demand: today's pace first, then the panel's three levers at the example's values.
        await expect(page.getByTestId("engine-lever-figure-mrr12")).toContainText(approx(33_723.61, locale));
        await openFold(page.getByTestId("engine-board-whatif"));
        for (const [id, value] of [
          ["mkt.liq.fill-rate", "12"],
          ["mkt.buy.first-order", "25"],
          ["mkt.rev.take-rate", "13"],
        ] as const) {
          await page.getByTestId(`whatif-slider-${id}`).fill(value);
        }
        const lever = page.getByTestId("engine-lever");
        await expect(lever.getByTestId("engine-lever-figure-mrr12")).toContainText(approx(46_351.72, locale));
        await expect(lever.getByTestId("engine-lever-figure-arr12")).toContainText(approx(556_220.61, locale));
        // What each lever brings alone, added up, together and the compounding (§22.10.2): the engine's rounding.
        const panel = page.getByTestId("engine-whatif-mkt-panel");
        for (const gain of [4_531.3, 3_398.47, 2_810.3, 10_740.07, 12_628.11, 1_888.04]) await expect(panel).toContainText(rounded(gain, locale));
        // The money levers play from month 1: the jump, said on the curve.
        await expect(page.getByTestId("engine-lever-curve")).toContainText(approx(2_628.29, locale));

        // The supply's lever, on its own side: 15 % to 20 %.
        await showSide(page, locale, "supply");
        await openFold(page.getByTestId("engine-board-whatif"));
        await page.getByTestId("whatif-slider-mkt.sell.paid-conversion").fill("20");
        await expect(page.getByTestId("engine-lever-figure-mrr12")).toContainText(approx(41_785.48, locale));
        await expect(page.getByTestId("engine-lever-figure-mrr12")).toContainText(approx(36_000, locale));
        await expect(page.getByTestId("engine-whatif-mkt-panel")).toContainText(rounded(580, locale));
        // The four levers are the example's, and kept on the device.
        const kept = (await storedEngineEntry<{ state: EngineState }>(page))!.state.whatIf;
        expect(kept).toEqual(EXAMPLE_MKT_WHATIF);
        // The total is where both sides add up — and only there (C103): the 12 months, with both sides' what-ifs.
        await expect(page.getByTestId("mkt-total")).toContainText(approx(88_137.19, locale));
        await expect(page.getByTestId("mkt-total")).toContainText(approx(69_590.04, locale));
        // The words guard, with the panel and the lever moved on both sides.
        await expectBoardWords(page, locale, "products", "levers moved");
      });

      // 4 — the slides: each side's funnel and leak, the total's slide, and no slide that puts the two sides face to face.
      test("the slides: the total, then each side's funnel and leak, and no slide with both sides", async ({ page }) => {
        test.setTimeout(120_000);
        await openBoard(page, locale, width, height, { ...marketplaceState(), whatIf: { ...EXAMPLE_MKT_WHATIF } });
        await page.getByTestId("engine-open-deck").click();
        await expect(page.getByTestId("engine-deck")).toBeVisible();
        // A slide is laid out when it comes into view (the deck draws on demand): each one is scrolled to, and read once it has text.
        const nodes = page.locator("[data-slide]");
        const slides: { id: string; side: string | null; text: string }[] = [];
        for (let i = 0; i < (await nodes.count()); i += 1) {
          const node = nodes.nth(i);
          await node.scrollIntoViewIfNeeded();
          let read: { id: string; side: string | null; text: string } = { id: "", side: null, text: "" };
          await expect
            .poll(async () => {
              read = await node.evaluate((el) => ({ id: el.getAttribute("data-slide")!, side: el.getAttribute("data-side"), text: (el as HTMLElement).innerText }));
              return read.text.length;
            })
            .toBeGreaterThan(40);
          slides.push(read);
        }
        const ids = slides.map((s) => s.id);
        // The total first, then the demand's four-plus, then the supply's, then the common slides — never interleaved.
        expect(ids[0]).toBe("mktTotal");
        const sides = slides.map((s) => s.side ?? "common");
        expect(sides.join(" ").replace(/\b(\w+)( \1)+\b/g, "$1")).toBe("common demand supply common");
        for (const id of ["mktFunnelDemand", "mktLeakDemand", "mktUnitDemand", "mktFunnelSupply", "mktLeakSupply", "mktUnitSupply"]) expect(ids).toContain(id);
        // The leak of each side names its own amount (C97) in the slide's title.
        const title = (id: string) => page.locator(`[data-slide="${id}"]`).first().locator("h3, h2, h1").first();
        await expect(title("mktLeakDemand")).toContainText(approx(468, locale));
        await expect(title("mktLeakSupply")).toContainText(approx(580, locale));
        await expect(title("whatif:mkt.sell.paid-conversion")).toContainText(approx(5_919.05, locale));
        // The total's slide holds the sum, and no ratio between the sides: the two streams, in a register.
        const total = slides.find((s) => s.id === "mktTotal")!;
        expect(total.text).toContain(money(58_953.6, locale));
        // No slide carries both sides' titles (the side title above a slide's own): a side slide shows its side only.
        const demandTitle = ENGINE_COPY.mkt.side.demandTitle[locale].toLowerCase();
        const supplyTitle = ENGINE_COPY.mkt.side.supplyTitle[locale].toLowerCase();
        for (const s of slides) {
          const text = s.text.toLowerCase();
          expect(text.includes(demandTitle) && text.includes(supplyTitle), `${s.id} names both sides`).toBe(false);
        }
        // The words on the slides as they print: each slide by its side, « SaaS » nowhere.
        const problems = slides.flatMap((s) => violationsIn(`slide ${s.id}`, s.text, locale, s.side === "demand" || s.side === "supply" ? (s.side as Side) : "common", "products"));
        expect(problems).toEqual([]);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      });

      // 5 — « services »: the same engine in the services' words, set in the settings.
      test("« services » in the settings: clients, providers and bookings on every screen, not one buyer, seller or order", async ({ page }) => {
        test.setTimeout(180_000);
        await openBoard(page, locale, width, height, marketplaceState());
        await page.getByTestId("engine-bar-settings").click();
        const settings = page.getByTestId("engine-settings");
        await expect(settings).toBeVisible();
        // The settings in « products », then in « services » once the choice is saved: only the two labels of the choice name both.
        const both = [ENGINE_COPY.start.mktOfferingProducts[locale], ENGINE_COPY.start.mktOfferingServices[locale]];
        expect(violationsIn("settings", await settings.innerText(), locale, "anywhere", "products", both)).toEqual([]);
        // The card's own words follow the choice at once; the targets' names and the shared counts below it are the saved engine's,
        // so they change when the choice is saved: the guard reads the settings again after that.
        await settings.getByRole("radio", { name: ENGINE_COPY.start.mktOfferingServices[locale] }).check();
        await page.getByTestId("engine-settings-save").click();
        await expect(page.getByTestId("engine-board")).toBeVisible();
        expect((await storedEngineEntry<{ state: EngineState }>(page))!.state.setup.offering).toBe("services");

        // The words of « services » are on the screen (clients, providers, bookings)…
        const board = page.getByTestId("engine-board");
        const words = locale === "fr" ? [/client/i, /prestataire/i, /réservation/i] : [/client/i, /provider/i, /booking/i];
        const read = [await board.innerText()];
        await showSide(page, locale, "supply");
        read.push(await board.innerText());
        for (const word of words) expect(read.join("\n"), `${word}`).toMatch(word);
        // …and none of « products »: no buyer, no seller, no order, no listing, no sale, and no word of the SaaS.
        await expectBoardWords(page, locale, "services", "services board");
        // A number's screen of each side, in the same words.
        for (const dom of ["mkt-buy-first-order", "mkt-sell-first-sale"]) {
          const sheet = await openNumber(page, dom);
          expect(violationsIn(`sheet ${dom}`, await sheet.innerText(), locale, "anywhere", "services")).toEqual([]);
          await backToBoard(page);
        }
        // The settings again, saved and reopened: the choice is kept and the screen is the same.
        await page.getByTestId("engine-bar-settings").click();
        await expect(page.getByTestId("engine-settings").getByRole("radio", { name: ENGINE_COPY.start.mktOfferingServices[locale] })).toBeChecked();
        expect(violationsIn("settings, saved", await page.getByTestId("engine-settings").innerText(), locale, "anywhere", "services", both)).toEqual([]);
      });

      // 6 — the sellers' subscriptions, unticked and ticked again.
      test("the sellers' subscriptions unticked: their five numbers leave the list, the supply says it has no money, the total is the net revenue; ticked again, the values come back", async ({ page }) => {
        await openBoard(page, locale, width, height, marketplaceState());
        const subscriptionIds = ["mkt-sell-signup-rate", "mkt-sell-paid-churn", "mkt-sell-paid-conversion", "mkt-sell-arpa", "mkt-sell-gross-margin"];
        for (const dom of subscriptionIds) await expect(page.getByTestId(`engine-metric-${dom}`)).toHaveCount(1);
        await expect(page.getByTestId("mkt-total")).toBeVisible();

        await page.getByTestId("engine-bar-settings").click();
        await page.getByTestId("engine-setup-mkt-subscriptions").uncheck();
        // The change is said before it is saved.
        await expect(page.getByTestId("engine-settings-resets")).not.toBeEmpty();
        await page.getByTestId("engine-settings-save").click();
        await expect(page.getByTestId("engine-board")).toBeVisible();
        for (const dom of subscriptionIds) await expect(page.getByTestId(`engine-metric-${dom}`)).toHaveCount(0);
        // Nothing erased: the five numbers are still on the device.
        const stored = (await storedEngineEntry<{ state: EngineState }>(page))!.state;
        expect(stored.setup.sellerSubscriptions).toBe(false);
        for (const id of ["mkt.sell.signup-rate", "mkt.sell.paid-churn", "mkt.sell.paid-conversion", "mkt.sell.arpa", "mkt.sell.gross-margin"] as const) {
          expect(stored.snapshots[0]!.metrics[id], id).toBeDefined();
        }
        // One stream is not a sum: no band — the net revenue leads the demand's money.
        await expect(page.getByTestId("mkt-total")).toHaveCount(0);
        await showSide(page, locale, "demand");
        await expect(page.getByTestId("engine-money-demand")).toContainText(money(32_853.6, locale));
        // The supply has no money, and says so once; no « Et si » either.
        await showSide(page, locale, "supply");
        await expect(page.getByTestId("engine-money-supply")).toContainText(ENGINE_COPY.mkt.money.supplyNone[locale]);
        await expect(page.getByTestId("engine-lever")).toHaveCount(0);
        await expectBoardWordsWithoutSubscriptions(page, locale);

        await page.getByTestId("engine-bar-settings").click();
        await page.getByTestId("engine-setup-mkt-subscriptions").check();
        await page.getByTestId("engine-settings-save").click();
        await expect(page.getByTestId("engine-board")).toBeVisible();
        for (const dom of subscriptionIds) await expect(page.getByTestId(`engine-metric-${dom}`)).toHaveCount(1);
        await expect(page.getByTestId("engine-metric-mkt-sell-arpa-value")).toContainText("29");
        await expect(page.getByTestId("engine-total-sum")).toContainText(money(58_953.6, locale));
      });

      // 7 — a window changed: the number it defines is « to do » again.
      test("the second order's window changed: the number goes back to « to do », and the others stay", async ({ page }) => {
        await openBoard(page, locale, width, height, marketplaceState());
        await expect(page.getByTestId("engine-metric-mkt-buy-repeat-value")).toContainText(/5\s?%/);
        await page.getByTestId("engine-bar-settings").click();
        const windows = page.getByTestId("engine-setup-window-repeat");
        // 90 days is the window the example uses; 180 days is another definition of the same number.
        await windows.getByRole("button", { name: fillTemplate(ENGINE_COPY.setup.windowDays[locale], { n: 180 }) }).click();
        await expect(page.getByTestId("engine-settings-resets")).not.toBeEmpty();
        await page.getByTestId("engine-settings-save").click();
        await expect(page.getByTestId("engine-board")).toBeVisible();
        const stored = (await storedEngineEntry<{ state: EngineState }>(page))!.state;
        expect(stored.setup.repeatWindowDays).toBe(180);
        expect(stored.snapshots[0]!.metrics["mkt.buy.repeat"]).toBeUndefined();
        // The row says « to do », and the first order — another window — keeps its value.
        await expect(page.getByTestId("engine-metric-mkt-buy-repeat")).not.toContainText(/5\s?%/);
        await expect(page.getByTestId("engine-metric-mkt-buy-first-order-value")).toContainText(/20\s?%/);
        await expect(page.getByTestId("engine-progress-counts")).toContainText(/17\D/);
      });

      // 8 — the file: exported, the device cleared, imported; and a marketplace file refused by a SaaS engine.
      test("the file: exported, the device cleared, imported — everything back; merged into a SaaS engine, refused", async ({ page }) => {
        await openBoard(page, locale, width, height, marketplaceState());
        const download = page.waitForEvent("download");
        await openEngineMenu(page);
        await page.getByTestId("engine-save-json").click();
        const path = (await (await download).path())!;
        const file = JSON.parse(await readFile(path, "utf8")) as { setup: EngineState["setup"] };
        expect(file.setup).toMatchObject({ type: "marketplace", offering: "products", sellerSubscriptions: true });

        await page.evaluate(() => {
          window.localStorage.clear();
          window.sessionStorage.setItem("e2e-engine-seeded", "1");
        });
        await page.reload();
        await expect(page.getByTestId("engine-start")).toBeVisible();
        await page.getByTestId("engine-start-import").click();
        await page.getByTestId("engine-import-file").setInputFiles(path);
        await page.getByTestId("engine-import-open").click();
        await expect(page.getByTestId("engine-board")).toBeVisible();
        await expectFound(page, 18);
        await expect(page.getByTestId("engine-total-sum")).toContainText(money(58_953.6, locale));
        await expect(page.getByTestId("engine-bar")).toContainText(new RegExp(ENGINE_COPY.workbench.modelShort.marketplace[locale], "i"));

        // A SaaS engine alone on a device: the marketplace's file can be added, never merged.
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
        await page.getByTestId("engine-import-file").setInputFiles(path);
        await expect(page.getByRole("radio", { name: /Merge into|Fusionner dans/ })).toBeDisabled();
        await expect(page.getByTestId("engine-import-choices")).toContainText(ENGINE_COPY.io.mergeRefused.type[locale]);
      });

      // The example: « see a filled example » from the start card, in the products' words (the example is always that).
      test("the example: opened from the start card, both sides, the example's total, and the words held", async ({ page }) => {
        await openPage(page, locale, width, height);
        await page.locator("#engine-start-motion-mkt").check();
        await page.getByTestId("engine-start-example").click();
        const example = page.getByTestId("engine-example");
        await expect(example).toBeVisible();
        await expect(example).toContainText(ENGINE_COPY.example.bannerTitleMkt[locale]);
        await expect(example.getByTestId("engine-total-sum")).toContainText(money(58_953.6, locale));
        const problems: string[] = [];
        for (const side of ["demand", "supply"] as const) {
          await showSide(page, locale, side);
          problems.push(...violationsIn(`example ${side}`, await page.getByTestId("mkt-side").innerText(), locale, side, "products"));
        }
        problems.push(...violationsIn("example", await example.innerText(), locale, "anywhere", "products"));
        expect(problems).toEqual([]);
      });
    });
  }

  // The FAQ's sentence, read without JavaScript (D15, §22.8.5 h): the fifth answer, and only that one.
  test.describe("the FAQ's sentence, without JavaScript", () => {
    test.use({ javaScriptEnabled: false });

    for (const locale of ["fr", "en"] as const) {
      test(`${locale}: the fifth answer carries the sentence for the types the build opens, the other five do not, the count stays six`, async ({ page }) => {
        await page.goto(`/${locale}/aarrr-funnel-template`);
        const items = page.getByTestId("engine-faq-item");
        await expect(items).toHaveCount(6);
        const note = ENGINE_COPY.faqTypeNote;
        // Both types open (CI): the sentence for both. The marketplace alone: its own. No other combination is open here.
        const sentence = APP_OPEN ? note.both[locale] : note.marketplace[locale];
        await expect(items.nth(4)).toContainText(sentence);
        if (locale === "fr") await expect(items.nth(4)).toContainText(APP_OPEN ? "Il sert aussi les apps grand public et les places de marché" : "Il sert aussi les places de marché");
        for (const index of [0, 1, 2, 3, 5]) {
          for (const other of [note.consumerApp, note.marketplace, note.both]) await expect(items.nth(index)).not.toContainText(other[locale]);
        }
        // A paragraph, not a page: the answer with its sentence stays under the 400 characters the copy contract holds.
        const answer = (await items.nth(4).locator("p").textContent())!;
        expect(answer.length).toBeLessThanOrEqual(400);
      });
    }
  });
});

/** The unsubscribed board's words: the demand side and the supply's note, each by its rule (no « Et si » on the supply). */
async function expectBoardWordsWithoutSubscriptions(page: Page, locale: Locale): Promise<void> {
  const problems: string[] = [];
  for (const side of ["demand", "supply"] as const) {
    await showSide(page, locale, side);
    const fold = page.getByTestId("engine-board-whatif");
    if (await fold.count()) await openFold(fold);
    problems.push(...violationsIn(`no subscriptions ${side}`, await page.getByTestId("mkt-side").innerText(), locale, side, "products"));
  }
  problems.push(...violationsIn("no subscriptions island", await page.getByTestId("engine-workbench").innerText(), locale, "anywhere", "products"));
  expect(problems).toEqual([]);
}

// ------------------------------------------------------------------------------------------------ type closed

/**
 * 9 — « type fermé »: a build WITHOUT `marketplace` in `ENGINE_TYPES`. The start card has no marketplace answer and the full
 * card greys it out. Skips when the type is open (CI always builds it open): it runs locally, on a build whose variable lacks
 * the type (`ENGINE_TYPES=consumer-app`, or empty), and the report of the unit that touches it says that it ran.
 */
test.describe("the marketplace, type closed", () => {
  test.skip(TYPE_OPEN, 'ENGINE_TYPES holds "marketplace" for this run — the closed state needs a build without it.');

  for (const [locale, width, height] of VIEWS) {
    test(`${locale} at ${width}: no marketplace on the start card, greyed in the full card, nothing about it on the page`, async ({ page }) => {
      await openPage(page, locale, width, height);
      const start = page.getByTestId("engine-start");
      await expect(page.locator("#engine-start-motion-mkt")).toHaveCount(0);
      await expect(start).not.toContainText(ENGINE_COPY.start.mkt[locale]);
      await expect(page.getByTestId("engine-start-mkt")).toHaveCount(0);

      await page.getByTestId("engine-start-change").click();
      const option = page.getByRole("radio", { name: ENGINE_COPY.setup.types.marketplace[locale] });
      await expect(option).toBeDisabled();
      await expect(page.getByTestId("engine-setup")).toContainText(ENGINE_COPY.setup.typeLater[locale]);

      // The page's sentence names the types the build opens, and never this one.
      const answer = await page.getByTestId("engine-faq-item").nth(4).textContent();
      expect(answer).not.toContain(ENGINE_COPY.faqTypeNote.marketplace[locale]);
      expect(answer).not.toContain(ENGINE_COPY.faqTypeNote.both[locale]);
    });
  }
});
