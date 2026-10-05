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
 * Non-vacuity, measured on 2026-10-05 on the final version, one sabotage at
 * a time in `engine-store.ts` or `storage.ts`, then restored (failing tests
 * in brackets): no second chance from the board (7); no cap on the
 * fall-backs (1: « gives up past three »); the budget kept spent past a
 * switch (1: « gives the budget back »); `drawn` not counting afresh (4);
 * `drawn(true)` leaving the probation (1: « a file the board has drawn is
 * kept »); any screen ending it (1: « a screen other than the board »); the
 * device copy not put back (6); its result ignored (1: « a device that
 * refuses »); a failed restore offering the file rather than the engine held
 * before (1: the same); the screen not put back (5); the import screen not
 * told (4); the probation never taken (7); the undrawn engine not kept (1),
 * or kept past a switch (1); the copy not limited to the engine's items (1);
 * a restore rewriting items already as they were (1: « no false failure »).
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

  it.each([
    ["the board", true],
    ["any other screen", false],
  ])("counts afresh once %s has been drawn", (_, board) => {
    seed(fullState());
    island.fallBack();
    island.drawn(board);
    expect(island.fallBack()).toBe(true);
    expect(island.getClientSnapshot().result.kind).toBe("ok");
  });

  it("gives up past three fall-backs in one page load: an error raised after each drawing must not loop", () => {
    seed(fullState());
    for (let i = 0; i < 3; i++) {
      expect(island.fallBack()).toBe(true);
      island.drawn(true);
    }
    expect(island.fallBack()).toBe(false);
  });

  it("gives the budget back once the person acts: opening a second engine that throws still ends on « illisible »", () => {
    seed(fullState(), other("b"));
    island.fallBack();
    island.fallBack();
    island.drawn(false);
    island.fallBack();
    island.drawn(false);
    // Spent; then « Ouvrir » on the other engine, a person's action, and it throws in its turn.
    island.switchEngine("b");
    expect(island.fallBack()).toBe(true);
    expect(island.fallBack()).toBe(true);
    expect(island.getClientSnapshot().result).toEqual({ kind: "unreadable" });
  });

  it("keeps the engine it could not draw, for the « illisible » screen's file and the device's other engines", () => {
    seed(fullState(), other("b"));
    island.fallBack();
    island.fallBack();
    expect(island.getClientSnapshot().undrawn).toEqual(fullState());
    expect(island.getClientSnapshot().engines?.map((e) => e.id)).toEqual([fullState().id, "b"]);
    // Switching to another engine, or any write, leaves that screen: nothing undrawn any more.
    island.switchEngine("b");
    expect(island.getClientSnapshot().undrawn).toBeNull();
    expect(island.getClientSnapshot().result).toMatchObject({ kind: "ok", state: { id: "b" } });
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
    island.drawn(true);
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

  it("a screen other than the board does not end the probation: the file is still undone", () => {
    seed(fullState());
    const stored = items();
    island.commit(other("c"), { fresh: true, add: true, probation: true });
    island.drawn(false);
    expect(island.fallBack()).toBe(true);
    expect(items()).toEqual(stored);
  });

  it("a device that refuses to be put back still holds the file: the screen says so, and offers the engine held before", () => {
    seed(fullState());
    island.commit({ ...other("x"), id: fullState().id }, { fresh: true, probation: true });
    const setItem = store.setItem;
    store.setItem = () => {
      throw new Error("storage refused");
    };
    try {
      expect(island.fallBack()).toBe(true);
    } finally {
      store.setItem = setItem;
    }
    expect(island.getClientSnapshot().result).toEqual({ kind: "unreadable" });
    // The engine « Remplacer » wrote over: no longer on the device, its one copy left is this one, to save.
    expect(island.getClientSnapshot().undrawn).toEqual(fullState());
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

  it("puts back a device that refuses writes when nothing it holds has changed: no false failure", () => {
    seed(fullState());
    const copy = deviceCopy()!;
    store.setItem = () => {
      throw new Error("storage refused");
    };
    expect(restoreDevice(copy)).toEqual({ ok: true });
  });
});
