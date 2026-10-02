import { readFile } from "node:fs/promises";
import type { Locator, Page, Request } from "@playwright/test";
import { ENGINE_COPY } from "@/content/engine-copy";
import { engineEventPaths } from "@/lib/analytics/goatcounter";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test, trackedEvents } from "./helpers";
import { openWords, openEngineMenu } from "./engine-helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the
// owner's signed preview, minted by /admin/preview (e2e/helpers.ts).
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/**
 * Engine spec §13.3 and D16 — the canary. Modelled on `audit-canary.spec.ts`.
 *
 * The page promises in writing that no number and no text the person types
 * leaves the browser: the only ways out are files they download and what
 * they copy. `engine-boundary.test.ts` holds that statically, but a static
 * scan can only name the primitives it knows. This spec tests the promise
 * itself: nothing is seeded, the real UI is walked — setup, three sheets
 * with every free-text field the engine has, a triage, a request, the
 * slides, their text, a PNG and the `.json` — with a unique canary in each
 * field, and EVERY request the browser makes is recorded.
 *
 * It proves nothing unless the canaries really are in the engine — hence the
 * assertion that the downloaded `.json` carries every one of them. And it
 * looks at more than the bodies: no request of the whole session may be
 * anything but a GET, which catches a leak even encoded, hashed or split —
 * three ways a substring search would miss it.
 *
 * Non-vacuity, measured 2026-09-25: a `fetch("/api/engine-leak", { method:
 * "POST", body: JSON.stringify(next) })` added to the island's `persist`
 * makes this spec fail on the canary AND the non-GET assertions; with it
 * removed, green.
 */
test.describe("the growth engine keeps everything in the browser (D16)", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("no request of a whole session carries a byte of what was typed, and none sends anything", async ({ page }) => {
    const stamp = Date.now().toString(36);
    const COMPANY = `TDG-CANARY-CO-${stamp}`;
    const EVENT = `TDG-CANARY-EVENT-${stamp}`;
    const NOTE = `TDG-CANARY-NOTE-${stamp}`;
    const DEFINITION = `TDG-CANARY-DEF-${stamp}`;
    const CHANNEL = `TDG-CANARY-CHAN-${stamp}`;
    const REPAIR = `TDG-CANARY-REPAIR-${stamp}`;
    const ASKED = `TDG-CANARY-ASKED-${stamp}`;
    const ASK = `TDG-CANARY-ASK-${stamp}`;
    // Seven digits, not four: a short number would end up in a chunk hash by
    // chance and fail the spec for the wrong reason. Numerator of a count, so
    // it is stored exactly as typed.
    const NUMBER = `9${Date.now().toString().slice(-6)}`;
    // A14 T5: a count pasted through « Saisie en tableau », the other way a number comes in.
    const PASTED = `8${Date.now().toString().slice(-6)}`;
    const canaries = [COMPANY, EVENT, NOTE, DEFINITION, CHANNEL, REPAIR, ASKED, ASK, NUMBER, PASTED];

    const seen: Request[] = [];
    page.on("request", (request) => seen.push(request));

    // --- Setup ---------------------------------------------------------------
    await page.goto("/en/aarrr-funnel-template");
    await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
    await page.getByLabel(ENGINE_COPY.setup.companyLabel.en).fill(COMPANY);
    await page.getByTestId("engine-setup-board").click();
    await expect(page.getByTestId("engine-board")).toBeVisible();

    // --- The activation event: the one number that IS a text ---------------
    const event = await openSheet(page, "activation", "act-event");
    await event.locator("#engine-act-event-text").fill(EVENT);
    await saveSheet(event, "act-event");

    // --- A counted rate, its note and its definition -----------------------
    const rate = await openSheet(page, "activation", "act-rate");
    await rate.locator("#engine-act-rate-num").fill(NUMBER);
    await rate.locator("#engine-act-rate-den").fill("99999999");
    await rate.locator("#engine-act-rate-source").selectOption({ label: "Amplitude" });
    await openWords(rate);
    await rate.locator("#engine-act-rate-definition").fill(DEFINITION);
    await rate.locator("#engine-act-rate-note").fill(NOTE);
    await saveSheet(rate, "act-rate");

    // --- The top channel's name ----------------------------------------------
    const channel = await openSheet(page, "acquisition", "acq-top-channel-share");
    await channel.locator("#engine-acq-top-channel-share-num").fill("300");
    await channel.locator("#engine-acq-top-channel-share-den").fill("1000");
    await channel.locator("#engine-acq-top-channel-share-label").fill(CHANNEL);
    await channel.locator("#engine-acq-top-channel-share-source").selectOption({ index: 1 });
    await saveSheet(channel, "acq-top-channel-share");

    // --- "I can't find it": the triage and its free comment ---------------
    const triage = await openSheet(page, "retention", "ret-d30");
    await triage.getByRole("button", { name: ENGINE_COPY.sheet.cantFind.en }).click();
    await triage.getByTestId("engine-triage").getByRole("radio", { name: ENGINE_COPY.cause.notTracked.en }).check();
    await triage.getByTestId("engine-triage").getByRole("radio", { name: ENGINE_COPY.repair.sprint.en }).check();
    await triage.locator("#engine-ret-d30-repair-comment").fill(REPAIR);
    await saveSheet(triage, "ret-d30");

    // --- "I'll ask for it": a definition that travels in the copied request --
    const asked = await openSheet(page, "revenue", "rev-gross-margin");
    await asked.getByRole("button", { name: ENGINE_COPY.sheet.willAsk.en }).click();
    await openWords(asked);
    await asked.locator("#engine-rev-gross-margin-definition").fill(ASKED);
    await asked.getByTestId("engine-request-copy").click();
    await expect(asked.getByText(ENGINE_COPY.request.copied.en)).toBeVisible();
    // The copy is a way out the person chose: the definition IS in it.
    expect(await clipboard(page)).toContain(ASKED);
    // A14 T6: the request's reminder is another way out — a calendar file, synced, shown on a lock screen. Nothing typed goes in it.
    const requestIcs = page.waitForEvent("download");
    await asked.getByTestId("engine-request-remind").click();
    const reminders = [await readFile((await (await requestIcs).path())!, "utf8")];

    // --- « Me rappeler de démarrer {mois} » (A14 T6): the next month's reminder ---
    const monthIcs = page.waitForEvent("download");
    await openEngineMenu(page);
    await page.getByTestId("engine-month-remind").click();
    reminders.push(await readFile((await (await monthIcs).path())!, "utf8"));
    for (const ics of reminders) {
      expect(ics).toMatch(/^BEGIN:VCALENDAR\r\n/);
      for (const canary of canaries) expect(ics, `a reminder carries ${canary}`).not.toContain(canary);
    }

    // --- « Saisie en tableau » (A14 T5): the template downloaded, a table pasted and applied --
    await page.getByTestId("engine-table").locator("summary").click();
    const template = page.waitForEvent("download");
    await page.getByTestId("engine-table-template").click();
    expect(await readFile((await (await template).path())!, "utf8")).toContain(NUMBER);
    await page.getByTestId("engine-table-paste").fill(`ref.k-factor,,,${PASTED},99999999,,,\n`);
    await page.getByTestId("engine-table-read").click();
    await page.getByTestId("engine-table-apply").click();
    await expect(page.getByTestId("engine-table-applied")).toBeVisible();

    // --- The slides: the ask, their text, a PNG, the .json ------------------
    await page.getByTestId("engine-open-deck").click();
    await expect(page.getByTestId("engine-deck")).toBeVisible();
    const what = page.getByTestId("deck-ask-what");
    await what.fill(ASK);
    await what.blur();
    await expect(page.getByTestId("deck-ask-preview")).toContainText(ASK);

    await page.getByTestId("deck-copy-text").click();
    await expect.poll(() => clipboard(page)).toContain(ASK);

    const png = page.waitForEvent("download");
    await page.getByTestId("deck-png-ask").click();
    expect((await png).suggestedFilename()).toMatch(/\.png$/);

    const json = page.waitForEvent("download");
    await page.getByTestId("deck-save-json").click();
    const jsonPath = (await (await json).path())!;
    const exported = await readFile(jsonPath, "utf8");

    // --- The merge (A14 T5): the same file merged back, through its preview --
    await page.getByTestId("engine-deck-back").click();
    await openEngineMenu(page);
    await page.getByTestId("engine-import-open-screen").click();
    await page.getByTestId("engine-import-file").setInputFiles(jsonPath);
    await page.getByRole("radio", { name: /Merge into/ }).check();
    await expect(page.getByTestId("engine-import-merge")).toBeVisible();
    await page.getByTestId("engine-import-open").click();
    await expect(page.getByTestId("engine-board")).toBeVisible();

    // --- What the spec proves -------------------------------------------------

    // First that the canaries ARE in the engine. Without this, a spec that had
    // stopped typing anything would pass while proving nothing.
    for (const canary of canaries) expect(exported, canary).toContain(canary);

    // No request carries a canary — not in its URL, not in its body, not in a header.
    const leaks: string[] = [];
    for (const request of seen) {
      const carried = `${request.url()}\n${request.postData() ?? ""}\n${JSON.stringify(await request.allHeaders())}`;
      for (const canary of canaries) if (carried.includes(canary)) leaks.push(`${request.method()} ${request.url()} ← ${canary}`);
    }
    expect(leaks).toEqual([]);

    // No request of the whole session is anything but a GET: the widest net.
    expect(seen.filter((r) => r.method() !== "GET").map((r) => `${r.method()} ${r.url()}`)).toEqual([]);

    // Analytics are paths from the closed vocabulary, and they did fire: the
    // stub is really injected (otherwise this would pass on an empty list).
    const events = await trackedEvents(page);
    const vocabulary = engineEventPaths();
    expect(events.filter((e) => !vocabulary.includes(e))).toEqual([]);
    for (const expected of [
      "engine_opened",
      // Which boxes were ticked (C25 Q14): a choice, never a word or a number.
      "engine_setup/plg",
      "engine_stage_saved/activation",
      "engine_stage_saved/acquisition",
      "engine_stage_saved/retention",
      "engine_request_copied",
      "engine_deck_opened",
      "engine_exported/text",
      "engine_exported/png",
      "engine_exported/json",
      // The table's template and the two reminders (§19.12): files that left, never what they hold.
      "engine_exported/csv",
      "engine_exported/ics",
    ]) {
      expect(events).toContain(expected);
    }

    // And the spec looked at something: a check that finds nothing must first
    // prove it looked somewhere (run nº8).
    expect(seen.length).toBeGreaterThan(5);
  });
});

/**
 * The same promise with sales-assisted ticked (engine spec §18.10.3): its
 * free texts — what « live » means, the reason contracts aren't renewed, the
 * link's definition, a note — and a nine-digit count, typed through the real
 * sheets; then the motions changed in the settings, untick and tick again.
 * Every canary is in the `.json`, the link's definition in the copied text,
 * none in any request, and not one request of the session is anything but a
 * GET — the motions' setting included.
 */
test.describe("sales-assisted keeps everything in the browser too (D16, §18.10.3)", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("its texts and its counts never leave, and changing the motions sends nothing", async ({ page }) => {
    const stamp = Date.now().toString(36);
    const LIVE = `TDG-CANARY-LIVE-${stamp}`;
    const LOSS = `TDG-CANARY-LOSS-${stamp}`;
    const PQL = `TDG-CANARY-PQL-${stamp}`;
    const SLG_NOTE = `TDG-CANARY-SLGNOTE-${stamp}`;
    // Nine digits, the numerator of a count: stored exactly as typed.
    const COUNT = `8${Date.now().toString().slice(-8)}`;
    const canaries = [LIVE, LOSS, PQL, SLG_NOTE, COUNT];

    const seen: Request[] = [];
    page.on("request", (request) => seen.push(request));

    await page.goto("/en/aarrr-funnel-template");
    await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
    await page.getByTestId("engine-motion-slg").check();
    await page.getByTestId("engine-setup-board").click();
    await expect(page.getByTestId("engine-board")).toHaveAttribute("data-motions", "hybrid");
    await page.getByTestId("engine-motion-selector").getByRole("button", { name: ENGINE_COPY.hybrid.motionName.slg.en }).click();

    // What « live » means: sales-assisted's one definition typed as a text.
    const live = await openSheet(page, "activation", "slg-act-live-event");
    await live.locator("#engine-slg-act-live-event-text").fill(LIVE);
    await saveSheet(live, "slg-act-live-event");

    // Why contracts aren't renewed.
    const loss = await openSheet(page, "retention", "slg-ret-loss-cause");
    await loss.locator("#engine-slg-ret-loss-cause-text").fill(LOSS);
    // A cause is said with how it is known (data, an interview, a hunch): the first answer will do.
    await loss.getByRole("group", { name: ENGINE_COPY.sheet.evidence.en }).getByRole("radio").first().check();
    await saveSheet(loss, "slg-ret-loss-cause");

    // A nine-digit count and a note, on the win rate.
    const win = await openSheet(page, "revenue", "slg-rev-win-rate");
    await win.locator("#engine-slg-rev-win-rate-num").fill(COUNT);
    await win.locator("#engine-slg-rev-win-rate-den").fill("999999999");
    await win.locator("#engine-slg-rev-win-rate-source").selectOption({ index: 1 });
    await openWords(win);
    await win.locator("#engine-slg-rev-win-rate-note").fill(SLG_NOTE);
    await saveSheet(win, "slg-rev-win-rate");

    // The link's own definition (its PQL threshold), under sales-assisted's acquisition.
    const link = await openSheet(page, "acquisition", "link-pql-handoff");
    await link.locator("#engine-link-pql-handoff-num").fill("31");
    await link.locator("#engine-link-pql-handoff-den").fill("130");
    await link.locator("#engine-link-pql-handoff-source").selectOption({ index: 1 });
    await openWords(link);
    await link.locator("#engine-link-pql-handoff-definition").fill(PQL);
    await saveSheet(link, "link-pql-handoff");

    // The motions changed after the fact: unticked, saved, ticked again — on the device only.
    await page.getByTestId("engine-bar-settings").click();
    await page.getByTestId("engine-settings").getByTestId("engine-motion-slg").uncheck();
    await page.getByTestId("engine-settings-save").click();
    await expect(page.getByTestId("engine-board")).toHaveAttribute("data-motions", "plg");
    await page.getByTestId("engine-bar-settings").click();
    await page.getByTestId("engine-settings").getByTestId("engine-motion-slg").check();
    await page.getByTestId("engine-settings-save").click();
    await expect(page.getByTestId("engine-board")).toHaveAttribute("data-motions", "hybrid");

    // The slides' text, then the file.
    await page.getByTestId("engine-open-deck").click();
    await expect(page.getByTestId("engine-deck")).toBeVisible();
    await page.getByTestId("deck-copy-text").click();
    await expect.poll(() => clipboard(page)).toContain(PQL);
    const json = page.waitForEvent("download");
    await page.getByTestId("deck-save-json").click();
    const exported = await readFile((await (await json).path())!, "utf8");
    for (const canary of canaries) expect(exported, canary).toContain(canary);

    const leaks: string[] = [];
    for (const request of seen) {
      const carried = `${request.url()}\n${request.postData() ?? ""}\n${JSON.stringify(await request.allHeaders())}`;
      for (const canary of canaries) if (carried.includes(canary)) leaks.push(`${request.method()} ${request.url()} ← ${canary}`);
    }
    expect(leaks).toEqual([]);
    expect(seen.filter((r) => r.method() !== "GET").map((r) => `${r.method()} ${r.url()}`)).toEqual([]);

    // The motions, counted as a choice (Q14) — and sales-assisted's stages apart, prefixed.
    const events = await trackedEvents(page);
    expect(events.filter((e) => !engineEventPaths().includes(e))).toEqual([]);
    for (const expected of ["engine_setup/hybrid", "engine_setup/plg", "engine_stage_saved/slg-activation", "engine_stage_saved/slg-revenue", "engine_stage_saved/slg-acquisition"]) {
      expect(events).toContain(expected);
    }
    expect(seen.length).toBeGreaterThan(5);
  });
});

/** Selects a stage's tab if it isn't already the one showing, then unfolds the metric's sheet. */
async function openSheet(page: Page, stage: string, metricDomId: string): Promise<Locator> {
  const tab = page.getByTestId(`engine-tab-${stage}`);
  if ((await tab.getAttribute("aria-selected")) !== "true") await tab.click();
  const toggle = page.getByTestId(`engine-metric-${metricDomId}`);
  if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
  const sheet = page.getByTestId(`engine-sheet-${metricDomId}`);
  await expect(sheet).toBeVisible();
  return sheet;
}

/** Saves a sheet and waits for its "saved" line: a save that silently failed would leave a canary untyped. */
async function saveSheet(sheet: Locator, metricDomId: string): Promise<void> {
  await sheet.getByTestId(`engine-save-${metricDomId}`).click();
  await expect(sheet.getByTestId(`engine-saved-${metricDomId}`)).not.toBeEmpty();
}

async function clipboard(page: Page): Promise<string> {
  return page.evaluate(() => navigator.clipboard.readText());
}
