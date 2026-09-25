import { readFile } from "node:fs/promises";
import type { Locator, Page, Request } from "@playwright/test";
import { ENGINE_COPY } from "@/content/engine-copy";
import { engineEventPaths } from "@/lib/analytics/goatcounter";
import { expect, test, trackedEvents } from "./helpers";

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
    const canaries = [COMPANY, EVENT, NOTE, DEFINITION, CHANNEL, REPAIR, ASKED, ASK, NUMBER];

    const seen: Request[] = [];
    page.on("request", (request) => seen.push(request));

    // --- Setup ---------------------------------------------------------------
    await page.goto("/en/aarrr-funnel-template?engine=preview");
    await expect(page.getByTestId("engine-workbench")).toHaveAttribute("data-state", "ready");
    await page.getByLabel(ENGINE_COPY.setup.companyLabel.en).fill(COMPANY);
    await page.getByTestId("engine-setup-start").click();
    await expect(page.getByTestId("engine-board")).toBeVisible();

    // --- The activation event: the one number that IS a text ---------------
    const event = await openSheet(page, "activation", "act-event");
    await event.getByRole("radio", { name: ENGINE_COPY.sheet.haveIt.en }).check();
    await event.locator("#engine-act-event-text").fill(EVENT);
    await saveSheet(event, "act-event");

    // --- A counted rate, its note and its definition -----------------------
    const rate = await openSheet(page, "activation", "act-rate");
    await rate.getByRole("radio", { name: ENGINE_COPY.sheet.haveIt.en }).check();
    await rate.locator("#engine-act-rate-num").fill(NUMBER);
    await rate.locator("#engine-act-rate-den").fill("99999999");
    await rate.locator("#engine-act-rate-source").selectOption({ label: "Amplitude" });
    await rate.locator("#engine-act-rate-definition").fill(DEFINITION);
    await rate.locator("#engine-act-rate-note").fill(NOTE);
    await saveSheet(rate, "act-rate");

    // --- The top channel's name ----------------------------------------------
    const channel = await openSheet(page, "acquisition", "acq-top-channel-share");
    await channel.getByRole("radio", { name: ENGINE_COPY.sheet.haveIt.en }).check();
    await channel.locator("#engine-acq-top-channel-share-num").fill("300");
    await channel.locator("#engine-acq-top-channel-share-den").fill("1000");
    await channel.locator("#engine-acq-top-channel-share-label").fill(CHANNEL);
    await channel.locator("#engine-acq-top-channel-share-source").selectOption({ index: 1 });
    await saveSheet(channel, "acq-top-channel-share");

    // --- "I can't find it": the triage and its free comment ---------------
    const triage = await openSheet(page, "retention", "ret-d30");
    await triage.getByRole("radio", { name: ENGINE_COPY.sheet.cantFind.en }).check();
    await triage.getByTestId("engine-triage").getByRole("radio", { name: ENGINE_COPY.cause.notTracked.en }).check();
    await triage.getByTestId("engine-triage").getByRole("radio", { name: ENGINE_COPY.repair.sprint.en }).check();
    await triage.locator("#engine-ret-d30-repair-comment").fill(REPAIR);
    await saveSheet(triage, "ret-d30");

    // --- "I'll ask for it": a definition that travels in the copied request --
    const asked = await openSheet(page, "revenue", "rev-gross-margin");
    await asked.getByRole("radio", { name: ENGINE_COPY.sheet.willAsk.en }).check();
    await asked.locator("#engine-rev-gross-margin-definition").fill(ASKED);
    await asked.getByTestId("engine-request-copy").click();
    await expect(asked.getByText(ENGINE_COPY.request.copied.en)).toBeVisible();
    // The copy is a way out the person chose: the definition IS in it.
    expect(await clipboard(page)).toContain(ASKED);

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
    const exported = await readFile((await (await json).path())!, "utf8");

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
      "engine_stage_saved/activation",
      "engine_stage_saved/acquisition",
      "engine_stage_saved/retention",
      "engine_request_copied",
      "engine_deck_opened",
      "engine_exported/text",
      "engine_exported/png",
      "engine_exported/json",
    ]) {
      expect(events).toContain(expected);
    }

    // And the spec looked at something: a check that finds nothing must first
    // prove it looked somewhere (run nº8).
    expect(seen.length).toBeGreaterThan(5);
  });
});

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

/** Saves a sheet and waits for its "saved" line: a save that silently failed would leave a canary untyped. */
async function saveSheet(sheet: Locator, metricDomId: string): Promise<void> {
  await sheet.getByTestId(`engine-save-${metricDomId}`).click();
  await expect(sheet.getByTestId(`engine-saved-${metricDomId}`)).not.toBeEmpty();
}

async function clipboard(page: Page): Promise<string> {
  return page.evaluate(() => navigator.clipboard.readText());
}
