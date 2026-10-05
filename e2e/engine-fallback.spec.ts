import type { Page } from "@playwright/test";
import { ENGINE_COPY } from "@/content/engine-copy";
import { exampleState } from "../src/lib/engine/__tests__/fixtures";
import type { EngineState, MetricEntry } from "../src/lib/engine/types";
import { engineSeed, openEngineMenu } from "./engine-helpers";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test } from "./helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the owner's signed preview.
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/**
 * The island's net (CHANTIERS.md A25.b): an engine the board cannot draw
 * never takes the page down, and never costs the device what it holds.
 *
 * - Stored on the device (written before A25, or by anything the import does
 *   not judge): the « illisible » screen, the device left as it was.
 * - Opened, added, replacing or merged from a file: the file is refused on the
 *   import screen, with the refusal that already exists, and the device is
 *   put back exactly as it was before the click.
 * - A file whose own preview throws: the same refusal, the device untouched.
 *
 * The poison is the security review's (2026-10-05): a « conflicting » number
 * without its two readings, which the validator reports and the board's first
 * derivation throws on (`values.ts`, `entry.conflict.a`).
 *
 * Non-vacuity, measured on 2026-10-05, one sabotage per build: without the
 * island's boundary, the five tests where the board throws fall (the stored
 * engine, the empty device, add, replace, the merge of a month only in the
 * file) and the two where the import's preview throws pass, held by the
 * panel's own; without the panel's boundary, those two fall alone; with the
 * probation never taken, the four imports the board throws on fall.
 */
const POISON = { status: "conflicting", conflict: {}, updatedAt: "2026-09-30T10:00:00.000Z" } as unknown as MetricEntry;
const CLOCK = new Date(2026, 8, 24, 12);

function poisoned(): EngineState {
  const state = exampleState();
  state.snapshots[0]!.metrics["act.rate"] = POISON;
  return state;
}

function asFile(state: unknown) {
  return { name: "x.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(state)) };
}

/** Everything the engine keeps on the device, as text: equal before and after means nothing was written. */
function engineItems(page: Page): Promise<Record<string, string | null>> {
  return page.evaluate(() =>
    Object.fromEntries(
      Object.keys(window.localStorage)
        .filter((key) => key.startsWith("tdg.engine"))
        .sort()
        .map((key) => [key, window.localStorage.getItem(key)]),
    ),
  );
}

async function seedOnce(page: Page, ...states: EngineState[]): Promise<void> {
  await page.clock.setFixedTime(CLOCK);
  await page.addInitScript((items) => {
    if (sessionStorage.getItem("e2e-engine-seeded")) return;
    for (const [key, value] of items) localStorage.setItem(key, value);
    sessionStorage.setItem("e2e-engine-seeded", "1");
  }, engineSeed(...states));
}

test("an engine stored with a number the board cannot draw opens on the « illisible » screen, in both languages, and the device keeps it", async ({ page }) => {
  await seedOnce(page, poisoned());
  await page.goto("/fr/aarrr-funnel-template");
  await expect(page.getByTestId("engine-unreadable")).toContainText(ENGINE_COPY.storage.unreadable.fr);
  const stored = await engineItems(page);
  expect(Object.keys(stored).length).toBeGreaterThan(0);

  await page.goto("/en/aarrr-funnel-template");
  await expect(page.getByTestId("engine-unreadable")).toContainText(ENGINE_COPY.storage.unreadable.en);
  // Shown twice, written never: the numbers stay on the device for a build that can read them.
  expect(await engineItems(page)).toEqual(stored);

  // The way out the screen already offered: a saved file.
  await page.getByTestId("engine-unreadable").getByRole("button", { name: ENGINE_COPY.actions.import.en }).click();
  await page.getByTestId("engine-import-file").setInputFiles(asFile(exampleState()));
  await page.getByTestId("engine-import-open").click();
  await expect(page.getByTestId("engine-board")).toBeVisible();
});

test("a file the board cannot draw is refused on an empty device: nothing is stored, and the next visit opens on the start", async ({ page }) => {
  await page.goto("/fr/aarrr-funnel-template");
  await page.getByTestId("engine-start-import").click();
  await page.getByTestId("engine-import-file").setInputFiles(asFile(poisoned()));
  // Its preview reads: the file is only refused once the board has tried to draw it.
  await page.getByTestId("engine-import-open").click();
  await expect(page.getByTestId("engine-import-refused")).toHaveText(ENGINE_COPY.io.notEngine.fr);
  await expect(page.getByTestId("engine-import-open")).toHaveCount(0);
  expect(await engineItems(page)).toEqual({});
  await page.reload();
  await expect(page.getByTestId("engine-start")).toBeVisible();
});

for (const choice of ["add", "replace", "merge"] as const) {
  test(`a file the board cannot draw is refused beside an engine (${choice}), and the device is put back as it was`, async ({ page }) => {
    await seedOnce(page, exampleState());
    await page.goto("/en/aarrr-funnel-template");
    await expect(page.getByTestId("engine-board")).toBeVisible();
    const before = await engineItems(page);

    await openEngineMenu(page);
    await page.getByTestId("engine-import-open-screen").click();
    await page.getByTestId("engine-import-file").setInputFiles(asFile(poisoned()));
    if (choice === "replace") await page.getByRole("radio", { name: /^Replace/ }).check();
    // A click, not `check()`: a merge's preview already throws on the poisoned number (its « replaced » line), and the
    // panel is drawn again on its refusal, without the choice to check.
    if (choice === "merge") await page.getByRole("radio", { name: /^Merge into/ }).click();
    if (choice !== "merge") await page.getByTestId("engine-import-open").click();

    await expect(page.getByTestId("engine-import-refused")).toHaveText(ENGINE_COPY.io.notEngine.en);
    expect(await engineItems(page)).toEqual(before);
    await page.getByTestId("engine-import-cancel").click();
    await expect(page.getByTestId("engine-board")).toBeVisible();
    await page.reload();
    await expect(page.getByTestId("engine-board")).toBeVisible();
    expect(await engineItems(page)).toEqual(before);
  });
}

test("a merge whose preview reads, of a month only in the file, is undone once the board throws on it", async ({ page }) => {
  await seedOnce(page, exampleState());
  await page.goto("/en/aarrr-funnel-template");
  await expect(page.getByTestId("engine-board")).toBeVisible();
  const before = await engineItems(page);

  // The security review's case: a later month, only in the file, carrying the poison. The merge's preview only counts
  // its numbers, so it reads, and the merge would write the poison into the device's own engine.
  const file = exampleState();
  const august = { ...file.snapshots[0]!, closedAt: "2026-09-01T00:00:00.000Z" };
  const september = { ...structuredClone(file.snapshots[0]!), id: "september", referenceMonth: "2026-09", cohortMonth: "2026-08" };
  september.metrics["act.rate"] = POISON;
  await openEngineMenu(page);
  await page.getByTestId("engine-import-open-screen").click();
  await page.getByTestId("engine-import-file").setInputFiles(asFile({ ...file, snapshots: [august, september] }));
  await page.getByRole("radio", { name: /^Merge into/ }).check();
  await expect(page.getByTestId("engine-import-merge")).toBeVisible();
  await page.getByTestId("engine-import-open").click();

  await expect(page.getByTestId("engine-import-refused")).toHaveText(ENGINE_COPY.io.notEngine.en);
  await expect(page.locator("#engine-import-title")).toBeFocused();
  expect(await engineItems(page)).toEqual(before);
  await page.getByTestId("engine-import-cancel").click();
  await expect(page.getByTestId("engine-board")).toBeVisible();
});

test("a file whose own preview throws is refused, and the device is untouched", async ({ page }) => {
  await seedOnce(page, exampleState());
  await page.goto("/en/aarrr-funnel-template");
  await expect(page.getByTestId("engine-board")).toBeVisible();
  const before = await engineItems(page);

  // A month only in the file, with a number set to null: the merge's preview counts its numbers (`merge.ts`, `hasReading`).
  const file = exampleState();
  const august = file.snapshots[0]!;
  const july = { ...structuredClone(august), id: "july", referenceMonth: "2026-07", cohortMonth: "2026-06", closedAt: "2026-08-01T00:00:00.000Z", metrics: { ...august.metrics, "act.rate": null } };
  await openEngineMenu(page);
  await page.getByTestId("engine-import-open-screen").click();
  await page.getByTestId("engine-import-file").setInputFiles(asFile({ ...file, snapshots: [july, august] }));
  // A click, not `check()`: the panel is drawn again on its refusal, without the choice to check.
  await page.getByRole("radio", { name: /^Merge into/ }).click();

  await expect(page.getByTestId("engine-import-refused")).toHaveText(ENGINE_COPY.io.notEngine.en);
  await expect(page.getByTestId("engine-import-open")).toHaveCount(0);
  expect(await engineItems(page)).toEqual(before);
});
