import { readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import type { Locator, Page } from "@playwright/test";
import { expect, test, trackedEvents } from "./helpers";

/**
 * The growth engine's collection UI (engine spec §7 E1-E4, E6, E7): setup,
 * the five-stage board, a metric sheet, the "I can't find it" triage, the
 * collect hub with its copyable request, the resume band, and the three ways
 * out of the device — save, import, erase.
 *
 * Behaviour, not attributes: what a person sees after typing, what the
 * device really keeps after a reload WITHOUT clearing storage, what the
 * clipboard really holds, and what a keyboard alone can reach.
 *
 * The page ships closed (engine-flag.spec.ts): every test opens it with
 * `?engine=preview`. The helpers below are local on purpose — e2e/helpers.ts
 * belongs to the integration step — and only the GoatCounter stub fixture is
 * imported from it.
 */
const STORAGE_KEY = "tdg.engine.v1";

async function openEngine(page: Page, locale: "en" | "fr" = "en"): Promise<Locator> {
  await page.goto(`/${locale}/aarrr-funnel-template?engine=preview`);
  const island = page.getByTestId("engine-workbench");
  await expect(island).toHaveAttribute("data-state", "ready");
  return island;
}

/** Setup with its defaults (self-serve, last closed month, EUR). */
async function startEngine(page: Page, locale: "en" | "fr" = "en"): Promise<void> {
  await openEngine(page, locale);
  await page.getByTestId("engine-setup-start").click();
  await expect(page.getByTestId("engine-board")).toBeVisible();
}

/** Opens a stage's drawer if it isn't already the one showing, then the metric's sheet. */
async function openSheet(page: Page, stage: string, metricDomId: string): Promise<Locator> {
  const row = page.getByTestId(`engine-row-${stage}`);
  if ((await row.getAttribute("aria-expanded")) !== "true") await row.click();
  const toggle = page.getByTestId(`engine-metric-${metricDomId}`);
  if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
  const sheet = page.getByTestId(`engine-sheet-${metricDomId}`);
  await expect(sheet).toBeVisible();
  return sheet;
}

async function storedEngine(page: Page): Promise<{ state: Record<string, unknown> & { snapshots: { metrics: Record<string, { status: string }> }[] } } | null> {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }, STORAGE_KEY);
}

async function noHorizontalScroll(page: Page): Promise<void> {
  const [scroll, client] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  expect(scroll).toBe(client);
}

/** Presses Tab until `target` has focus — the only way a keyboard user gets anywhere. */
async function tabTo(page: Page, target: Locator, max = 80): Promise<void> {
  for (let i = 0; i < max; i += 1) {
    if (await target.evaluate((el) => el === document.activeElement)) return;
    await page.keyboard.press("Tab");
  }
  throw new Error(`Never reached ${target} with ${max} Tab presses`);
}

/** Serious and critical only, like accessibility.spec.ts. */
async function expectNoSeriousA11y(page: Page, label: string): Promise<void> {
  const results = await new AxeBuilder({ page }).include('[data-testid="engine-workbench"]').analyze();
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(serious.map((v) => `${label}: ${v.id} — ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
}

// The closed vocabulary of engine spec §11.6: never a number, never a label typed by someone.
const ENGINE_EVENT = /^engine_(opened|request_copied|deck_opened|tour_linked|stage_saved\/(acquisition|activation|retention|referral|revenue)|exported\/json)$/;

test.describe("setup and first save", () => {
  test("first visit shows the setup; Start opens the board with nothing found yet", async ({ page }) => {
    await openEngine(page);
    await expect(page.getByTestId("engine-setup")).toBeVisible();
    await expect(page.getByRole("radio", { name: /self-serve/ })).toBeChecked();
    await page.getByTestId("engine-setup-start").click();
    await expect(page.getByTestId("engine-coverage")).toContainText("0 of 15 numbers found");
    // Focus follows the screen change to the verdict, never left on <body>.
    await expect(page.locator("#engine-verdict")).toBeFocused();
    await expect.poll(() => trackedEvents(page)).toContain("engine_opened");
  });

  test("counts give the live rate; Save keeps them on the device through a reload that clears nothing", async ({ page }) => {
    await startEngine(page);
    const sheet = await openSheet(page, "activation", "act-rate");
    await sheet.getByRole("radio", { name: "I have it" }).check();
    await sheet.locator("#engine-act-rate-num").fill("144");
    await sheet.locator("#engine-act-rate-den").fill("800");
    await expect(sheet.getByTestId("engine-live")).toContainText("18%");
    await sheet.locator("#engine-act-rate-source").selectOption({ label: "Amplitude" });
    await sheet.getByTestId("engine-save-act-rate").click();
    await expect(sheet.getByTestId("engine-saved-act-rate")).toBeVisible();
    await expect(page.getByTestId("engine-coverage")).toContainText("1 of 15 numbers found");

    const stored = await storedEngine(page);
    expect(stored?.state.snapshots[0]?.metrics["act.rate"]?.status).toBe("measured");

    await page.reload();
    await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
    await expect(page.getByTestId("engine-coverage")).toContainText("1 of 15 numbers found");
    const again = await openSheet(page, "activation", "act-rate");
    await expect(again.locator("#engine-act-rate-num")).toHaveValue("144");
    await expect(again.locator("#engine-act-rate-den")).toHaveValue("800");

    await expect.poll(() => trackedEvents(page)).toContain("engine_stage_saved/activation");
  });

  test("a share with more of the part than of the whole is refused, and nothing is stored", async ({ page }) => {
    await startEngine(page);
    const sheet = await openSheet(page, "activation", "act-rate");
    await sheet.getByRole("radio", { name: "I have it" }).check();
    await sheet.locator("#engine-act-rate-num").fill("900");
    await sheet.locator("#engine-act-rate-den").fill("800");
    await sheet.locator("#engine-act-rate-source").selectOption({ label: "Amplitude" });
    await sheet.getByTestId("engine-save-act-rate").click();
    await expect(sheet.getByTestId("engine-saved-act-rate")).toHaveCount(0);
    await expect(sheet.getByRole("alert").first()).toBeVisible();
    await expect(page.getByTestId("engine-coverage")).toContainText("0 of 15 numbers found");
    expect((await storedEngine(page))?.state.snapshots[0]?.metrics["act.rate"]).toBeUndefined();
  });

  test("a missing piece is named rather than silently blocking", async ({ page }) => {
    await startEngine(page);
    const sheet = await openSheet(page, "activation", "act-rate");
    await sheet.getByRole("radio", { name: "I have it" }).check();
    await sheet.locator("#engine-act-rate-num").fill("144");
    await sheet.getByTestId("engine-save-act-rate").click();
    await expect(sheet.getByTestId("engine-save-needs")).toBeVisible();
  });

  test("a wide estimate is said to be wide, and still saved", async ({ page }) => {
    await startEngine(page);
    const sheet = await openSheet(page, "activation", "act-rate");
    await sheet.getByRole("radio", { name: "I can estimate it" }).check();
    await sheet.locator("#engine-act-rate-low").fill("5");
    await sheet.locator("#engine-act-rate-high").fill("40");
    await expect(sheet.getByTestId("engine-wide-range")).toBeVisible();
    await sheet.getByRole("radio", { name: "Team hunch" }).check();
    await sheet.getByTestId("engine-save-act-rate").click();
    await expect(sheet.getByTestId("engine-saved-act-rate")).toBeVisible();
    expect((await storedEngine(page))?.state.snapshots[0]?.metrics["act.rate"]?.status).toBe("estimated");
  });

  test("\"I can't find it\" asks why and what fixing it would cost, and the answer is a status", async ({ page }) => {
    await startEngine(page);
    const sheet = await openSheet(page, "retention", "ret-d30");
    await sheet.getByRole("radio", { name: "I can't find it" }).check();
    const triage = sheet.getByTestId("engine-triage");
    await triage.getByRole("radio", { name: "We don't measure it" }).check();
    await triage.getByRole("radio", { name: "a sprint" }).check();
    await sheet.getByTestId("engine-save-ret-d30").click();
    await expect(sheet.getByTestId("engine-saved-ret-d30")).toBeVisible();
    const entry = (await storedEngine(page))?.state.snapshots[0]?.metrics["ret.d30"] as { status: string; missing?: { cause: string; repair: string } };
    expect(entry.status).toBe("missing");
    expect(entry.missing).toMatchObject({ cause: "not-tracked", repair: "sprint" });
    await expect(page.getByTestId("engine-row-retention")).toContainText("Day-30 retention");
  });
});

test.describe("asking and collecting", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("\"I'll ask for it\" copies the request, records who was asked, and the event carries no text", async ({ page }) => {
    await startEngine(page);
    const sheet = await openSheet(page, "revenue", "rev-margin");
    await sheet.getByRole("radio", { name: "I'll ask for it" }).check();
    await sheet.getByTestId("engine-request-copy").click();
    await expect(sheet.getByText("Request copied")).toBeVisible();
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip.length).toBeGreaterThan(40);
    expect(clip.toLowerCase()).toContain("gross margin");
    const entry = (await storedEngine(page))?.state.snapshots[0]?.metrics["rev.margin"] as { status: string; request?: { role: string } };
    expect(entry.status).toBe("requested");
    expect(entry.request?.role).toBeTruthy();
    await expect.poll(() => trackedEvents(page)).toContain("engine_request_copied");
  });

  test("the collect tab counts what's left, groups by person, and Fill in opens the sheet", async ({ page }) => {
    await startEngine(page);
    await page.getByRole("button", { name: "To go and get (15)" }).click();
    const collect = page.getByTestId("engine-collect");
    await expect(collect).toBeVisible();
    await expect(collect.getByTestId("engine-collect-ask")).toBeVisible();
    await expect(collect.getByTestId("engine-collect-self")).toBeVisible();
    // One copy button per person, not one per number.
    const groups = collect.locator('[data-testid^="engine-collect-role-"]');
    expect(await groups.count()).toBeGreaterThan(0);
    await collect.getByTestId("engine-fill-acq-signup-rate").click();
    await expect(page.getByTestId("engine-sheet-acq-signup-rate")).toBeVisible();
  });

  test("a returning visit shows how far you got and what is waiting on someone", async ({ page }) => {
    await startEngine(page);
    const day = 86_400_000;
    await page.evaluate(
      ({ key, day }) => {
        const store = JSON.parse(window.localStorage.getItem(key)!);
        const now = Date.now();
        const iso = (ago: number) => new Date(now - ago * day).toISOString();
        store.state.updatedAt = iso(3);
        store.state.snapshots[0].metrics["ref.k-factor"] = {
          status: "requested",
          request: { role: "support", requestedAt: iso(10) },
          updatedAt: iso(10),
        };
        window.localStorage.setItem(key, JSON.stringify(store));
      },
      { key: STORAGE_KEY, day },
    );
    await page.reload();
    const band = page.getByTestId("engine-resume");
    await expect(band).toBeVisible();
    await expect(band).toContainText("last visit 3 days ago");
    await expect(band).toContainText("to follow up");
    await band.getByTestId("engine-resume-continue").click();
    // "Continue" opens the cheapest number still to fill: a five-minute one.
    await expect(page.locator('[data-testid^="engine-sheet-"]')).toBeVisible();
  });
});

test.describe("leaving the device and coming back", () => {
  test("save → clear the site's data → import gives back the same engine", async ({ page }) => {
    await startEngine(page);
    const sheet = await openSheet(page, "activation", "act-rate");
    await sheet.getByRole("radio", { name: "I have it" }).check();
    await sheet.locator("#engine-act-rate-num").fill("144");
    await sheet.locator("#engine-act-rate-den").fill("800");
    await sheet.locator("#engine-act-rate-source").selectOption({ label: "Amplitude" });
    await sheet.getByTestId("engine-save-act-rate").click();
    await expect(page.getByTestId("engine-coverage")).toContainText("1 of 15 numbers found");

    const downloadP = page.waitForEvent("download");
    await page.getByTestId("engine-save-json").click();
    const download = await downloadP;
    const path = await download.path();
    const text = await readFile(path, "utf8");
    expect(JSON.parse(text).state.snapshots[0].metrics["act.rate"].value).toEqual({ kind: "ratio", numerator: 144, denominator: 800 });
    await expect.poll(() => trackedEvents(page)).toContain("engine_exported/json");
    await expect(page.getByTestId("engine-backup")).toHaveCount(0);

    // Really clear it: without this the test proves React state survived a click, not that the file carries the work.
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
    await expect(page.getByTestId("engine-setup")).toBeVisible();
    await page.getByTestId("engine-setup-import").click();
    await page.getByTestId("engine-import-file").setInputFiles(path);
    await expect(page.getByTestId("engine-import-preview")).toContainText("1 of 15");
    await page.getByTestId("engine-import-open").click();
    await expect(page.getByTestId("engine-coverage")).toContainText("1 of 15 numbers found");
    expect((await storedEngine(page))?.state.snapshots[0]?.metrics["act.rate"]?.status).toBe("measured");
  });

  test("a file that isn't an engine is refused, and nothing changes", async ({ page }) => {
    await openEngine(page);
    await page.getByTestId("engine-setup-import").click();
    await page.getByTestId("engine-import-file").setInputFiles({ name: "x.json", mimeType: "application/json", buffer: Buffer.from('{"hello":1}') });
    await expect(page.getByTestId("engine-import-refused")).toBeVisible();
    await expect(page.getByTestId("engine-import-open")).toHaveCount(0);
    expect(await storedEngine(page)).toBeNull();
  });

  test("erasing asks for the word first, then leaves nothing on the device", async ({ page }) => {
    await startEngine(page);
    await page.getByTestId("engine-erase-open").click();
    const confirm = page.getByTestId("engine-erase-confirm");
    await expect(confirm).toBeDisabled();
    await page.getByLabel('Type "ERASE" to confirm').fill("ERASE");
    await expect(confirm).toBeEnabled();
    await confirm.click();
    await expect(page.getByTestId("engine-setup")).toBeVisible();
    expect(await storedEngine(page)).toBeNull();
  });
});

test.describe("keyboard, languages, widths", () => {
  test("keyboard only: setup, a stage, one sheet, saved", async ({ page }) => {
    await openEngine(page);
    await tabTo(page, page.getByTestId("engine-setup-start"));
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("engine-board")).toBeVisible();

    await tabTo(page, page.getByTestId("engine-row-activation"));
    await page.keyboard.press("Enter");
    const toggle = page.getByTestId("engine-metric-act-rate");
    await tabTo(page, toggle);
    if ((await toggle.getAttribute("aria-expanded")) !== "true") await page.keyboard.press("Enter");
    const sheet = page.getByTestId("engine-sheet-act-rate");
    await tabTo(page, sheet.getByRole("radio", { name: "I have it" }));
    await page.keyboard.press("Space");
    await tabTo(page, sheet.locator("#engine-act-rate-num"));
    await page.keyboard.type("144");
    await tabTo(page, sheet.locator("#engine-act-rate-den"));
    await page.keyboard.type("800");
    const source = sheet.locator("#engine-act-rate-source");
    await tabTo(page, source);
    await source.selectOption({ label: "Amplitude" }); // a native select's options are the browser's, not ours
    await tabTo(page, sheet.getByTestId("engine-save-act-rate"));
    await page.keyboard.press("Enter");
    await expect(sheet.getByTestId("engine-saved-act-rate")).toBeVisible();
  });

  for (const locale of ["en", "fr"] as const) {
    test(`${locale}: every sheet's labels are resolved — no raw {placeholder} anywhere`, async ({ page }) => {
      await startEngine(page, locale);
      for (const stage of ["acquisition", "activation", "retention", "referral", "revenue"]) {
        const row = page.getByTestId(`engine-row-${stage}`);
        if ((await row.getAttribute("aria-expanded")) !== "true") await row.click();
        const drawer = page.getByTestId("engine-drawer");
        await expect(drawer).toHaveAttribute("data-stage", stage);
        const toggles = drawer.locator('[data-testid^="engine-metric-"]');
        for (let i = 0; i < (await toggles.count()); i += 1) {
          const t = toggles.nth(i);
          if ((await t.getAttribute("aria-expanded")) !== "true") await t.click();
        }
        // "I have it" is the first mode in every sheet: it reveals the count labels.
        const haves = drawer.locator('[data-testid^="engine-sheet-"]').getByRole("radio").first();
        await haves.check();
        await expect(page.getByTestId("engine-workbench")).not.toContainText(/\{[a-zA-Z]+\}/);
      }
    });

    for (const width of [390, 1280]) {
      test(`${locale} at ${width}px: no sideways scroll with a sheet open, and the drawer sits where it should`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await startEngine(page, locale);
        const sheet = await openSheet(page, "activation", "act-rate");
        await sheet.getByRole("radio").first().check();
        await noHorizontalScroll(page);
        const row = await page.getByTestId("engine-row-activation").boundingBox();
        const drawer = await page.getByTestId("engine-drawer").boundingBox();
        if (!row || !drawer) throw new Error("row or drawer not rendered");
        if (width < 960) {
          // Inline on a phone: right under its row, same column.
          expect(drawer.y).toBeGreaterThanOrEqual(row.y + row.height - 1);
          expect(Math.abs(drawer.x - row.x)).toBeLessThan(2);
        } else {
          // Beside the rows on a desk, and the rows stay a compact list.
          expect(drawer.x).toBeGreaterThan(row.x + row.width);
          const first = await page.getByTestId("engine-row-acquisition").boundingBox();
          const last = await page.getByTestId("engine-row-revenue").boundingBox();
          expect(last!.y - (first!.y + first!.height)).toBeLessThan(5 * (first!.height + 24));
        }
      });
    }
  }

  test("every analytics event is from the closed vocabulary — never a number or a typed word", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await startEngine(page);
    const sheet = await openSheet(page, "activation", "act-rate");
    await sheet.getByRole("radio", { name: "I have it" }).check();
    await sheet.locator("#engine-act-rate-num").fill("144");
    await sheet.locator("#engine-act-rate-den").fill("800");
    await sheet.locator("#engine-act-rate-source").selectOption({ label: "Amplitude" });
    await sheet.locator("#engine-act-rate-note").fill("canary-note-4242");
    await sheet.getByTestId("engine-save-act-rate").click();
    const ask = await openSheet(page, "revenue", "rev-margin");
    await ask.getByRole("radio", { name: "I'll ask for it" }).check();
    await ask.getByTestId("engine-request-copy").click();
    await expect.poll(async () => (await trackedEvents(page)).length).toBeGreaterThanOrEqual(3);
    const events = await trackedEvents(page);
    for (const e of events) expect(e).toMatch(ENGINE_EVENT);
    expect(events.join(" ")).not.toMatch(/144|800|canary/);
  });
});

test.describe("accessibility of each screen", () => {
  test("setup, board with a sheet, triage, collect, import, erase — no serious or critical issue", async ({ page }) => {
    await openEngine(page);
    await expectNoSeriousA11y(page, "setup");
    await page.getByTestId("engine-setup-start").click();
    const sheet = await openSheet(page, "activation", "act-rate");
    await sheet.getByRole("radio", { name: "I have it" }).check();
    await expectNoSeriousA11y(page, "sheet");
    await sheet.getByRole("radio", { name: "I can't find it" }).check();
    await sheet.getByTestId("engine-triage").getByRole("radio").first().check();
    await expectNoSeriousA11y(page, "triage");
    await page.getByRole("button", { name: /To go and get/ }).click();
    await expectNoSeriousA11y(page, "collect");
    await page.getByRole("button", { name: "The engine" }).click();
    await page.getByTestId("engine-import-open-screen").click();
    await expectNoSeriousA11y(page, "import");
    await page.getByTestId("engine-import-cancel").click();
    await page.getByTestId("engine-erase-open").click();
    await expectNoSeriousA11y(page, "erase");
  });
});
