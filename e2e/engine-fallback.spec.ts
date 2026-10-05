import { readFile } from "node:fs/promises";
import type { Page } from "@playwright/test";
import { ENGINE_COPY } from "@/content/engine-copy";
import { exampleState } from "../src/lib/engine/__tests__/fixtures";
import type { EngineState, MetricEntry, Snapshot } from "../src/lib/engine/types";
import { engineSeed, openEngineMenu } from "./engine-helpers";
import { ADMIN_PASSWORD, expect, grantOwnerPreview, SKIP_ADMIN_REASON, test } from "./helpers";

// The page ships closed (engine-flag.spec.ts): every test opens it with the owner's signed preview.
test.skip(!ADMIN_PASSWORD, SKIP_ADMIN_REASON);
test.beforeEach(async ({ context }) => {
  await grantOwnerPreview(context.request, "engine");
});

/**
 * An engine the board cannot draw (CHANTIERS.md A25.b): it never takes the
 * page down, and never costs the device what it holds.
 *
 * - A file: refused as it is read, with the refusal that already exists,
 *   before anything is written — every one of its months computed as the
 *   board would, and the device's engine merged with it. A month the board's
 *   first drawing does not read (the security review's merged May) included.
 * - Stored on the device (written before A25.b): the « illisible » screen,
 *   the device left as it was, with the engine's file to save and the
 *   device's other engines to open — « Tout effacer » is never the only way on.
 *
 * The poison is the security review's (2026-10-05): a « conflicting » number
 * without its two readings, which the validator reports and the board's
 * first derivation throws on (`values.ts`, `entry.conflict.a`).
 *
 * What no spec here reaches, held by `engine-store.test.ts`: the probation
 * that undoes a written import, and the import panel's own boundary. Both
 * are nets under the check at the reading — no known file gets past it to
 * them. They stay for a throw the check does not compute: a component's own.
 *
 * Non-vacuity, measured on 2026-10-05, one sabotage per build: without the
 * check at the reading (`drawnWith` always true), the four file tests fall
 * and the two stored-engine tests pass; with the merge left unchecked, the
 * fourth falls alone — so that file does read alone; without the island's
 * boundary, the two stored-engine tests fall; without the « illisible »
 * screen's file and engines (`undrawn`), the last falls alone. Without the
 * probation, or without the panel's boundary, nothing here falls, as said.
 */
const POISON = { status: "conflicting", conflict: {}, updatedAt: "2026-09-30T10:00:00.000Z" } as unknown as MetricEntry;
const CLOCK = new Date(2026, 8, 24, 12);

function poisoned(): EngineState {
  const state = exampleState();
  state.snapshots[0]!.metrics["act.rate"] = POISON;
  return state;
}

/** The example with a month before its own, closed when the next began: the device of the merge tests. */
function withJuly(state: EngineState): EngineState {
  const august = state.snapshots[0]!;
  const july: Snapshot = { ...structuredClone(august), id: "july", referenceMonth: "2026-07", cohortMonth: "2026-06", closedAt: "2026-08-01T00:00:00.000Z" };
  return { ...state, snapshots: [july, august] };
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

async function importBeside(page: Page, file: unknown): Promise<void> {
  await openEngineMenu(page);
  await page.getByTestId("engine-import-open-screen").click();
  await page.getByTestId("engine-import-file").setInputFiles(asFile(file));
}

async function expectRefused(page: Page, locale: "en" | "fr"): Promise<void> {
  await expect(page.getByTestId("engine-import-refused")).toHaveText(ENGINE_COPY.io.notEngine[locale]);
  await expect(page.getByTestId("engine-import-open")).toHaveCount(0);
  await expect(page.getByTestId("engine-import-preview")).toHaveCount(0);
}

test("a file the board cannot draw is refused as it is read on an empty device, in French: nothing is stored", async ({ page }) => {
  await page.goto("/fr/aarrr-funnel-template");
  await page.getByTestId("engine-start-import").click();
  await page.getByTestId("engine-import-file").setInputFiles(asFile(poisoned()));
  await expectRefused(page, "fr");
  expect(await engineItems(page)).toEqual({});
  await page.reload();
  await expect(page.getByTestId("engine-start")).toBeVisible();
});

test("a file the board cannot draw is refused as it is read beside an engine: no choice is offered, the device is untouched", async ({ page }) => {
  await seedOnce(page, exampleState());
  await page.goto("/en/aarrr-funnel-template");
  await expect(page.getByTestId("engine-board")).toBeVisible();
  const before = await engineItems(page);
  await importBeside(page, poisoned());
  await expectRefused(page, "en");
  await expect(page.getByTestId("engine-import-choices")).toHaveCount(0);
  await page.getByTestId("engine-import-cancel").click();
  await expect(page.getByTestId("engine-board")).toBeVisible();
  expect(await engineItems(page)).toEqual(before);
});

test("a past month the board's first drawing would not read is judged too: the security review's merged May is refused", async ({ page }) => {
  await seedOnce(page, withJuly(exampleState()));
  await page.goto("/en/aarrr-funnel-template");
  await expect(page.getByTestId("engine-board")).toBeVisible();
  const before = await engineItems(page);

  // Same setup as the device, a May only in the file carrying the poison: merged, it would sit two months before the
  // one on screen, which the board draws without reading — kept, then thrown on the day someone opens May.
  const file = exampleState();
  const august = file.snapshots[0]!;
  const may: Snapshot = { ...structuredClone(august), id: "may", referenceMonth: "2026-05", cohortMonth: "2026-04", closedAt: "2026-06-01T00:00:00.000Z" };
  may.metrics["act.rate"] = POISON;
  await importBeside(page, { ...file, snapshots: [may, august] });
  await expectRefused(page, "en");
  expect(await engineItems(page)).toEqual(before);
});

test("a file whose merge into the device's engine throws is refused as it is read, though it reads alone", async ({ page }) => {
  await seedOnce(page, exampleState());
  await page.goto("/en/aarrr-funnel-template");
  await expect(page.getByTestId("engine-board")).toBeVisible();
  const before = await engineItems(page);

  // A month only in the file, with a number set to null: the merge counts its numbers (`merge.ts`, `hasReading`).
  const file = withJuly(exampleState());
  (file.snapshots[0]!.metrics as Record<string, unknown>)["act.rate"] = null;
  await importBeside(page, file);
  await expectRefused(page, "en");
  expect(await engineItems(page)).toEqual(before);
});

test("an engine stored with a number the board cannot draw opens on the « illisible » screen, in both languages, and the device keeps it", async ({ page }) => {
  await seedOnce(page, poisoned());
  await page.goto("/fr/aarrr-funnel-template");
  await expect(page.getByTestId("engine-unreadable")).toContainText(ENGINE_COPY.storage.unreadable.fr);
  const stored = await engineItems(page);
  expect(Object.keys(stored).length).toBeGreaterThan(0);

  await page.goto("/en/aarrr-funnel-template");
  await expect(page.getByTestId("engine-unreadable")).toContainText(ENGINE_COPY.storage.unreadable.en);
  // Shown twice, written never: the numbers stay on the device.
  expect(await engineItems(page)).toEqual(stored);

  // The way out the screen already offered: a saved file.
  await page.getByTestId("engine-unreadable").getByRole("button", { name: ENGINE_COPY.actions.import.en }).click();
  await page.getByTestId("engine-import-file").setInputFiles(asFile(exampleState()));
  await page.getByTestId("engine-import-open").click();
  await expect(page.getByTestId("engine-board")).toBeVisible();
});

test("the « illisible » screen saves that engine's file as it is, and opens the device's other engines", async ({ page }) => {
  const healthy: EngineState = { ...exampleState(), id: "9b2f4c1e-3a5d-4e6f-8a7b-1c2d3e4f5a6b", setup: { ...exampleState().setup, companyLabel: "Healthy Co" } };
  await seedOnce(page, poisoned(), healthy);
  await page.goto("/en/aarrr-funnel-template");
  await expect(page.getByTestId("engine-unreadable")).toBeVisible();

  const download = page.waitForEvent("download");
  await page.getByTestId("engine-unreadable-save").click();
  const saved = JSON.parse(await readFile((await (await download).path())!, "utf8"));
  // The engine as the device holds it, poison and all: nothing is lost, and a later build may read it.
  expect(saved).toEqual(JSON.parse(JSON.stringify(poisoned())));

  await expect(page.getByTestId("engine-unreadable-others")).toContainText("Healthy Co");
  await page.getByTestId(`engine-switch-${healthy.id}`).click();
  await expect(page.getByTestId("engine-board")).toBeVisible();
  await expect(page.getByTestId("engine-bar-line")).toContainText("Healthy Co");
});
