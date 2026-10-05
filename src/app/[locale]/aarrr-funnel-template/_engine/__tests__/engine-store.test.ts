import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fullState } from "@/lib/engine/__tests__/storage-fixtures";
import { deviceCopy, restoreDevice } from "@/lib/engine/storage";
import { ENGINE_ENTRY_PREFIX, ENGINE_INDEX_KEY, ENGINE_SCHEMA_VERSION, LEGACY_STORAGE_KEY_V2, type EngineState } from "@/lib/engine/types";

/**
 * The island's net (CHANTIERS.md A25.b), in the store: what `fallBack` does
 * after a render threw, and how an import on probation is undone. What a
 * browser draws on each of those — the « illisible » screen, the import's
 * refusal, the device put back — is `e2e/engine-fallback.spec.ts`; this file
 * holds what no e2e can provoke: the second chance from the board, and a
 * file the board has drawn no longer being undone.
 *
 * The store keeps module state on purpose (its header), so every test reads
 * a fresh module. Same in-memory `window` fake as `lib/engine/__tests__/storage.test.ts`.
 *
 * Non-vacuity, measured on 2026-10-05, one sabotage at a time, then
 * restored (failing tests in brackets): no second chance from the board (4:
 * the first, second, fourth and fifth of the first block); `shown()` leaving
 * the probation (1: « a file the board has drawn is kept »); the device copy
 * not put back (4: the undo tests); the screen not put back (5: those four
 * and « without storage »); the import screen not told (4: the undo tests);
 * the probation never taken (5: the undo tests and « without storage »); the
 * copy not limited to the engine's items (1: the last test).
 */

type FakeStore = Storage & { map: Map<string, string> };

function fakeStorage(): FakeStore {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    key: (i: number) => [...map.keys()][i] ?? null,
    get length() {
      return map.size;
    },
  };
}

const g = globalThis as { window?: unknown };
const originalWindow = g.window;
let store: FakeStore;
let island: typeof import("../engine-store");

/** The device holding these engines, the first on screen — as `storage.ts` writes them. */
function seed(...states: EngineState[]): void {
  store.map.set(ENGINE_INDEX_KEY, JSON.stringify({ schemaVersion: ENGINE_SCHEMA_VERSION, activeId: states[0]!.id, order: states.map((s) => s.id) }));
  for (const state of states) store.map.set(`${ENGINE_ENTRY_PREFIX}${state.id}`, JSON.stringify({ schemaVersion: ENGINE_SCHEMA_VERSION, state }));
}

const items = (): Record<string, string> => Object.fromEntries([...store.map.entries()].sort(([a], [b]) => (a < b ? -1 : 1)));
const other = (id: string): EngineState => ({ ...fullState(), id, setup: { ...fullState().setup, companyLabel: `Other ${id}` } });

beforeEach(async () => {
  store = fakeStorage();
  g.window = { localStorage: store };
  vi.resetModules();
  island = await import("../engine-store");
});

afterEach(() => {
  g.window = originalWindow;
});

describe("a render that throws on the engine on screen", () => {
  it("first draws the island again as it was: the screen that threw may not be the board", () => {
    seed(fullState());
    const before = island.getClientSnapshot();
    expect(island.fallBack()).toBe(true);
    expect(island.getClientSnapshot()).toBe(before);
    expect(island.refusedFilePending()).toBe(false);
  });

  it("then, with no board drawn between, shows the engine as unreadable — and writes nothing", () => {
    seed(fullState());
    const stored = items();
    island.getClientSnapshot();
    island.fallBack();
    expect(island.fallBack()).toBe(true);
    expect(island.getClientSnapshot().result).toEqual({ kind: "unreadable" });
    expect(items()).toEqual(stored);
  });

  it("then has nothing left: the error goes on to the page's own boundary", () => {
    seed(fullState());
    island.fallBack();
    island.fallBack();
    expect(island.fallBack()).toBe(false);
  });

  it("counts afresh once the board has been drawn", () => {
    seed(fullState());
    island.fallBack();
    island.shown();
    expect(island.fallBack()).toBe(true);
    expect(island.getClientSnapshot().result.kind).toBe("ok");
  });

  it("on an empty device has nothing to fall back on but the second chance", () => {
    expect(island.fallBack()).toBe(true);
    expect(island.fallBack()).toBe(false);
  });
});

describe("a file on probation", () => {
  const cases: [string, () => EngineState[], (device: EngineState[]) => [EngineState, Parameters<typeof island.commit>[1]]][] = [
    ["opened on an empty device", () => [], () => [fullState(), { fresh: true, probation: true }]],
    ["added beside an engine", () => [fullState(), other("b")], () => [other("c"), { fresh: true, add: true, probation: true }]],
    ["replacing the engine on screen", () => [fullState()], ([on]) => [{ ...other("x"), id: on!.id }, { fresh: true, probation: true }]],
    ["merged into it", () => [fullState()], ([on]) => [{ ...on!, whatIf: { "act.rate": 40 } }, { probation: true }]],
  ];

  it.each(cases)("%s, then never drawn, is undone to the byte, the screen too, and the import screen is told", (_, device, file) => {
    const engines = device();
    if (engines.length > 0) seed(...engines);
    const before = island.getClientSnapshot();
    const stored = items();
    const [state, options] = file(engines);
    island.commit(state, options);
    expect(items()).not.toEqual(stored);

    expect(island.fallBack()).toBe(true);
    expect(items()).toEqual(stored);
    expect(island.getClientSnapshot()).toBe(before);
    expect(island.refusedFilePending()).toBe(true);
    island.clearRefusedFile();
    expect(island.refusedFilePending()).toBe(false);
  });

  it("a file the board has drawn is kept: a later failure is the engine's, not the file's", () => {
    seed(fullState());
    island.commit(other("c"), { fresh: true, add: true, probation: true });
    island.shown();
    const kept = items();
    expect(island.fallBack()).toBe(true);
    expect(items()).toEqual(kept);
    expect(island.refusedFilePending()).toBe(false);
  });

  it("an ordinary save is never on probation: a failure after it draws the island again", () => {
    seed(fullState());
    island.commit({ ...fullState(), whatIf: { "act.rate": 40 } });
    const saved = items();
    expect(island.fallBack()).toBe(true);
    expect(items()).toEqual(saved);
    expect(island.refusedFilePending()).toBe(false);
  });

  it("without storage, the screen alone is put back", () => {
    g.window = undefined;
    const before = island.getClientSnapshot();
    island.commit(fullState(), { fresh: true, probation: true });
    expect(island.getClientSnapshot().result.kind).toBe("ok");
    expect(island.fallBack()).toBe(true);
    expect(island.getClientSnapshot()).toBe(before);
  });
});

describe("the device copy", () => {
  it("holds the engine's items only, and puts back exactly those", () => {
    seed(fullState());
    store.map.set(LEGACY_STORAGE_KEY_V2, "older copy");
    store.map.set("tdg.results.v1", "the Tour's results");
    const copy = deviceCopy()!;
    expect(Object.keys(copy).sort()).toEqual([`${ENGINE_ENTRY_PREFIX}${fullState().id}`, LEGACY_STORAGE_KEY_V2, ENGINE_INDEX_KEY].sort());

    store.map.set(`${ENGINE_ENTRY_PREFIX}new`, "an engine added since");
    store.map.set(ENGINE_INDEX_KEY, "rewritten");
    store.map.delete(LEGACY_STORAGE_KEY_V2);
    store.map.set("tdg.results.v1", "the Tour, written since");
    expect(restoreDevice(copy)).toEqual({ ok: true });

    expect(items()).toEqual({ ...copy, "tdg.results.v1": "the Tour, written since" });
  });
});
