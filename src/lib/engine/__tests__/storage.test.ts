import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { clearEngine, deleteEngine, listEngines, loadEngine, requestPersistence, saveEngine, setActiveEngine } from "../storage";
import { ENGINE_ENTRY_PREFIX, ENGINE_INDEX_KEY, LEGACY_STORAGE_KEY_V1, LEGACY_STORAGE_KEY_V2, MAX_ENGINES, type EngineState } from "../types";
import { fullState, toV1 } from "./storage-fixtures";

/**
 * Three rules, all about never losing someone's numbers (spec §4.3, D15,
 * §19.1.4): a failed write is RETURNED, an unreadable store is never taken
 * for an empty one — so it is never overwritten by the setup screen's first
 * save — and an older copy stays until a file supersedes it.
 *
 * Same in-memory `window` fake as `audit/__tests__/storage.test.ts` — no jsdom.
 *
 * Non-vacuity, measured on 2026-10-01 (A14 T0) — see the journal's T0 entry
 * for each sabotage and the tests it failed.
 */

type FakeStore = {
  getItem: (k: string) => string | null;
  setItem: (k: string, v: string) => void;
  removeItem: (k: string) => void;
  key: (i: number) => string | null;
  readonly length: number;
  map: Map<string, string>;
};

function fakeStorage(onSet?: () => void): FakeStore {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => {
      onSet?.();
      map.set(k, v);
    },
    removeItem: (k) => void map.delete(k),
    key: (i) => [...map.keys()][i] ?? null,
    get length() {
      return map.size;
    },
  };
}

const g = globalThis as { window?: unknown; navigator?: unknown };
const entry = (id: string) => `${ENGINE_ENTRY_PREFIX}${id}`;
/** An engine of its own: the same numbers under another id. */
const another = (id: string): EngineState => ({ ...fullState(), id });
const index = (store: FakeStore) => JSON.parse(store.map.get(ENGINE_INDEX_KEY)!) as { schemaVersion: number; activeId: string; order: string[] };

describe("engine storage", () => {
  const originalWindow = g.window;
  let store: FakeStore;

  beforeEach(() => {
    store = fakeStorage();
    g.window = { localStorage: store };
  });

  afterEach(() => {
    g.window = originalWindow;
  });

  it("a device that never held an engine is `empty`", () => {
    expect(loadEngine()).toEqual({ kind: "empty" });
    expect(listEngines()).toEqual([]);
  });

  it("round-trips an engine: an index under tdg.engines.v3, the engine under its own key, both versioned", () => {
    const state = fullState();
    expect(ENGINE_INDEX_KEY).toBe("tdg.engines.v3");
    expect(saveEngine(state)).toEqual({ ok: true });
    expect(index(store)).toEqual({ schemaVersion: 3, activeId: state.id, order: [state.id] });
    expect(JSON.parse(store.map.get(entry(state.id))!)).toMatchObject({ schemaVersion: 3, state: { id: state.id } });
    expect(loadEngine()).toEqual({ kind: "ok", state });
  });

  it("a full quota is returned as `quota`, never swallowed — the screen must tell the user to save the file", () => {
    g.window = {
      localStorage: fakeStorage(() => {
        throw Object.assign(new Error("full"), { name: "QuotaExceededError" });
      }),
    };
    expect(saveEngine(fullState())).toEqual({ ok: false, error: "quota" });
  });

  it("Firefox's quota code is recognised too, and any other refusal is `unavailable`", () => {
    g.window = { localStorage: fakeStorage(() => { throw Object.assign(new Error("full"), { code: 1014 }); }) };
    expect(saveEngine(fullState())).toEqual({ ok: false, error: "quota" });
    g.window = { localStorage: fakeStorage(() => { throw new Error("SecurityError"); }) };
    expect(saveEngine(fullState())).toEqual({ ok: false, error: "unavailable" });
  });

  it("a corrupt index, a corrupt entry, or an index naming an engine the device lost: `unreadable`, not `empty`", () => {
    store.map.set(ENGINE_INDEX_KEY, "{\"schemaVersion\":3,\"activeId\":");
    expect(loadEngine()).toEqual({ kind: "unreadable" });
    const state = fullState();
    store.map.set(ENGINE_INDEX_KEY, JSON.stringify({ schemaVersion: 3, activeId: state.id, order: [state.id] }));
    expect(loadEngine()).toEqual({ kind: "unreadable" });
    store.map.set(entry(state.id), "{\"schemaVersion\":3,\"state\":{");
    expect(loadEngine()).toEqual({ kind: "unreadable" });
  });

  it("an index or an entry written by a NEWER version is `unreadable`, not half-read", () => {
    const state = fullState();
    store.map.set(ENGINE_INDEX_KEY, JSON.stringify({ schemaVersion: 4, activeId: state.id, order: [state.id] }));
    store.map.set(entry(state.id), JSON.stringify({ schemaVersion: 3, state }));
    expect(loadEngine()).toEqual({ kind: "unreadable" });
    store.map.set(ENGINE_INDEX_KEY, JSON.stringify({ schemaVersion: 3, activeId: state.id, order: [state.id] }));
    store.map.set(entry(state.id), JSON.stringify({ schemaVersion: 3, state: { ...state, schemaVersion: 4 } }));
    expect(loadEngine()).toEqual({ kind: "unreadable" });
  });

  it("something that isn't an engine under an entry is `unreadable`", () => {
    store.map.set(ENGINE_INDEX_KEY, JSON.stringify({ schemaVersion: 3, activeId: "x", order: ["x"] }));
    store.map.set(entry("x"), JSON.stringify({ schemaVersion: 3, state: { hello: "world" } }));
    expect(loadEngine()).toEqual({ kind: "unreadable" });
  });

  it("a draft the validator objects to is still `ok`: shape, not validity, decides readability", () => {
    const state = fullState();
    delete (state.snapshots[0]!.metrics["acq.cac"]!.estimate as { basis?: string }).basis;
    saveEngine(state);
    expect(loadEngine()).toEqual({ kind: "ok", state });
  });

  it("an unreadable store is not overwritten by a save; only an explicit clear makes room", () => {
    const newer = JSON.stringify({ schemaVersion: 4, activeId: "from-the-future", order: ["from-the-future"] });
    store.map.set(ENGINE_INDEX_KEY, newer);
    expect(saveEngine(fullState())).toEqual({ ok: false, error: "unreadable" });
    expect(store.map.get(ENGINE_INDEX_KEY)).toBe(newer);

    clearEngine();
    expect(loadEngine()).toEqual({ kind: "empty" });
    expect(saveEngine(fullState())).toEqual({ ok: true });
  });

  describe("several engines (§19.1.4, C32 Q12)", () => {
    it("`add` puts a new engine beside the others and on screen; the list names each, in order", () => {
      const first = fullState();
      saveEngine(first);
      expect(saveEngine(another("second"), { add: true })).toEqual({ ok: true });
      expect(index(store)).toEqual({ schemaVersion: 3, activeId: "second", order: [first.id, "second"] });
      expect(loadEngine()).toEqual({ kind: "ok", state: another("second") });
      expect(listEngines()!.map((e) => [e.id, e.active, e.months, e.lastMonth])).toEqual([
        [first.id, false, 1, "2026-08"],
        ["second", true, 1, "2026-08"],
      ]);
      expect(listEngines()![0]!.companyLabel).toBe("Mon produit");
    });

    it("without `add`, another engine REPLACES the one on screen, in its place — what an import « Remplacer » does", () => {
      saveEngine(fullState());
      saveEngine(another("second"), { add: true });
      expect(saveEngine(another("third"))).toEqual({ ok: true });
      expect(index(store).order).toEqual([fullState().id, "third"]);
      expect(store.map.has(entry("second"))).toBe(false);
      expect(store.map.has(entry(fullState().id))).toBe(true);
    });

    it("an engine already on the device is written in place and put on screen", () => {
      saveEngine(fullState());
      saveEngine(another("second"), { add: true });
      const again = { ...fullState(), updatedAt: "2026-10-01T10:00:00.000Z" };
      expect(saveEngine(again)).toEqual({ ok: true });
      expect(index(store)).toEqual({ schemaVersion: 3, activeId: again.id, order: [again.id, "second"] });
      expect(store.map.has(entry("second"))).toBe(true);
    });

    it(`at most ${MAX_ENGINES}: the next one is refused as \`full\`, nothing written`, () => {
      saveEngine(another("e0"));
      for (let i = 1; i < MAX_ENGINES; i++) expect(saveEngine(another(`e${i}`), { add: true })).toEqual({ ok: true });
      expect(saveEngine(another("one-too-many"), { add: true })).toEqual({ ok: false, error: "full" });
      expect(store.map.has(entry("one-too-many"))).toBe(false);
      expect(index(store).order).toHaveLength(MAX_ENGINES);
    });

    it("switching puts another engine on screen; an unknown or unreadable one is refused", () => {
      saveEngine(fullState());
      saveEngine(another("second"), { add: true });
      expect(setActiveEngine(fullState().id)).toEqual({ ok: true });
      expect(loadEngine()).toEqual({ kind: "ok", state: fullState() });
      expect(setActiveEngine("nobody")).toEqual({ ok: false, error: "unreadable" });
      store.map.set(entry("second"), "{");
      expect(setActiveEngine("second")).toEqual({ ok: false, error: "unreadable" });
      expect(index(store).activeId).toBe(fullState().id);
    });

    it("deleting one engine never touches the others; the one before it goes on screen; the last leaves an empty device", () => {
      saveEngine(fullState());
      saveEngine(another("second"), { add: true });
      saveEngine(another("third"), { add: true });
      expect(deleteEngine("third")).toEqual({ ok: true });
      expect(index(store)).toEqual({ schemaVersion: 3, activeId: "second", order: [fullState().id, "second"] });
      expect(store.map.has(entry("third"))).toBe(false);
      expect(deleteEngine(fullState().id)).toEqual({ ok: true });
      expect(index(store)).toEqual({ schemaVersion: 3, activeId: "second", order: ["second"] });
      expect(deleteEngine("second")).toEqual({ ok: true });
      expect(loadEngine()).toEqual({ kind: "empty" });
      expect(store.map.size).toBe(0);
    });

    it("« Tout effacer » clears every engine, the index and the older copies", () => {
      saveEngine(fullState());
      saveEngine(another("second"), { add: true });
      store.map.set(LEGACY_STORAGE_KEY_V2, "{}");
      store.map.set(LEGACY_STORAGE_KEY_V1, "{}");
      store.map.set("tdg.results.v1", "[]");
      clearEngine();
      expect([...store.map.keys()]).toEqual(["tdg.results.v1"]);
    });
  });

  describe("the older copies (§18.3.4, §19.1.4) — read once, migrated, kept until a file supersedes them", () => {
    const v2Store = (state: EngineState) => JSON.stringify({ schemaVersion: 2, state: { ...structuredClone(state), schemaVersion: 2 } });
    const v1Store = (state: EngineState) => JSON.stringify({ schemaVersion: 1, state: toV1(state) });

    it("v2 alone: loaded migrated; the first save writes v3 and leaves v2 intact", () => {
      const state = fullState();
      store.map.set(LEGACY_STORAGE_KEY_V2, v2Store(state));
      expect(loadEngine()).toEqual({ kind: "ok", state, migratedFrom: 2 });
      expect(listEngines()!.map((e) => e.id)).toEqual([state.id]);
      expect(saveEngine(state)).toEqual({ ok: true });
      expect(index(store).activeId).toBe(state.id);
      expect(store.map.get(LEGACY_STORAGE_KEY_V2)).toBe(v2Store(state));
      // From now on the device reads v3, not v2.
      expect(loadEngine()).toEqual({ kind: "ok", state });
    });

    it("the first export after the migration removes v2 — the file now holds all of it", () => {
      const state = fullState();
      store.map.set(LEGACY_STORAGE_KEY_V2, v2Store(state));
      saveEngine(state);
      const exported = { ...state, lastExportedAt: "2026-10-01T12:00:00.000Z" };
      expect(saveEngine(exported)).toEqual({ ok: true });
      expect(store.map.has(LEGACY_STORAGE_KEY_V2)).toBe(false);
      expect(loadEngine()).toEqual({ kind: "ok", state: exported });
    });

    it("an export from before the migration, or no export at all, keeps v2", () => {
      const state = { ...fullState(), lastExportedAt: "2026-09-24T11:00:00.000Z" };
      store.map.set(LEGACY_STORAGE_KEY_V2, v2Store(state));
      expect(saveEngine(state)).toEqual({ ok: true });
      expect(saveEngine({ ...state, updatedAt: "2026-10-01T12:00:00.000Z" })).toEqual({ ok: true });
      expect(store.map.has(LEGACY_STORAGE_KEY_V2)).toBe(true);
    });

    it("v1 alone: loaded migrated through both steps, kept the same way", () => {
      const state = fullState();
      store.map.set(LEGACY_STORAGE_KEY_V1, v1Store(state));
      expect(loadEngine()).toEqual({ kind: "ok", state, migratedFrom: 1 });
      saveEngine(state);
      expect(store.map.get(LEGACY_STORAGE_KEY_V1)).toBe(v1Store(state));
      saveEngine({ ...state, lastExportedAt: "2026-10-01T12:00:00.000Z" });
      expect(store.map.has(LEGACY_STORAGE_KEY_V1)).toBe(false);
    });

    it("an older copy we cannot read is `unreadable`, never written over; « Tout effacer » clears it", () => {
      store.map.set(LEGACY_STORAGE_KEY_V2, "{\"schemaVersion\":2,\"state\":{");
      expect(loadEngine()).toEqual({ kind: "unreadable" });
      expect(saveEngine(fullState())).toEqual({ ok: false, error: "unreadable" });
      expect(store.map.has(ENGINE_INDEX_KEY)).toBe(false);
      clearEngine();
      expect(store.map.size).toBe(0);
      expect(loadEngine()).toEqual({ kind: "empty" });
    });

    it("v2 present: v1 is ignored; a v3 index present: both are", () => {
      const state = fullState();
      store.map.set(LEGACY_STORAGE_KEY_V2, v2Store(state));
      store.map.set(LEGACY_STORAGE_KEY_V1, v1Store(another("the-oldest")));
      expect(loadEngine()).toEqual({ kind: "ok", state, migratedFrom: 2 });
      saveEngine(another("the-newest"));
      expect(loadEngine()).toEqual({ kind: "ok", state: another("the-newest") });
    });
  });

  it("on the server, or with storage refused at the property, reads are `empty` and writes are `unavailable`", () => {
    g.window = undefined;
    expect(loadEngine()).toEqual({ kind: "empty" });
    expect(saveEngine(fullState())).toEqual({ ok: false, error: "unavailable" });
    expect(() => clearEngine()).not.toThrow();

    g.window = Object.defineProperty({}, "localStorage", {
      get() {
        throw new Error("blocked");
      },
    });
    expect(loadEngine()).toEqual({ kind: "empty" });
    expect(saveEngine(fullState())).toEqual({ ok: false, error: "unavailable" });
  });
});

describe("requestPersistence", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "navigator");

  afterEach(() => {
    if (original) Object.defineProperty(globalThis, "navigator", original);
  });

  function setNavigator(value: unknown) {
    Object.defineProperty(globalThis, "navigator", { value, configurable: true, writable: true });
  }

  it("asks once and reports the browser's answer; an already-persisted origin isn't asked again", async () => {
    let asked = 0;
    setNavigator({ storage: { persisted: async () => false, persist: async () => (asked++, true) } });
    await expect(requestPersistence()).resolves.toBe(true);
    expect(asked).toBe(1);

    setNavigator({ storage: { persisted: async () => true, persist: async () => (asked++, true) } });
    await expect(requestPersistence()).resolves.toBe(true);
    expect(asked).toBe(1);
  });

  it("is false, never a throw, without the API or when the browser rejects", async () => {
    setNavigator({});
    await expect(requestPersistence()).resolves.toBe(false);
    setNavigator({ storage: { persist: async () => { throw new Error("no"); } } });
    await expect(requestPersistence()).resolves.toBe(false);
  });
});
