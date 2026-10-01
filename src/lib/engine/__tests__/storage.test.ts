import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { clearEngine, loadEngine, requestPersistence, saveEngine } from "../storage";
import { ENGINE_STORAGE_KEY, LEGACY_STORAGE_KEY_V1, type EngineState } from "../types";
import { fullState, toV1 } from "./storage-fixtures";

/**
 * Two rules, both about never losing someone's numbers (spec §4.3, D15):
 * a failed write is RETURNED, and an unreadable store is never taken for an
 * empty one — so it is never overwritten by the setup screen's first save.
 *
 * Same in-memory `window` fake as `audit/__tests__/storage.test.ts` — no jsdom.
 *
 * Non-vacuity, measured: making `saveEngine` swallow its catch (`return { ok: true }`)
 * fails the two quota/refusal tests and nothing else; reading an undecodable
 * store as `empty` fails exactly the three "unreadable" cases; removing the
 * unreadable guard in `saveEngine` fails exactly "an unreadable store is not
 * overwritten…".
 *
 * The v1 copy (§18.3.5, test 5, A7.3.c S0), measured on 2026-09-30: removing v1
 * on every save fails « v1 alone » and « an export from before the migration »;
 * never removing it fails « the first export after the migration »; reading a
 * v1 store as `empty` fails « v1 alone » and « an unreadable v1 ».
 */

type FakeStore = {
  getItem: (k: string) => string | null;
  setItem: (k: string, v: string) => void;
  removeItem: (k: string) => void;
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
  };
}

const g = globalThis as { window?: unknown; navigator?: unknown };

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
  });

  it("round-trips an engine under tdg.engine.v2, wrapped in its versioned store", () => {
    const state = fullState();
    expect(ENGINE_STORAGE_KEY).toBe("tdg.engine.v2");
    expect(saveEngine(state)).toEqual({ ok: true });
    expect(JSON.parse(store.map.get(ENGINE_STORAGE_KEY)!)).toMatchObject({ schemaVersion: 2, state: { id: state.id } });
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

  it("corrupt JSON is `unreadable`, not `empty`", () => {
    store.map.set(ENGINE_STORAGE_KEY, "{\"schemaVersion\":1,\"state\":{");
    expect(loadEngine()).toEqual({ kind: "unreadable" });
  });

  it("a store written by a NEWER version is `unreadable`, not half-read", () => {
    store.map.set(ENGINE_STORAGE_KEY, JSON.stringify({ schemaVersion: 3, state: fullState() }));
    expect(loadEngine()).toEqual({ kind: "unreadable" });
    const innerFuture = { ...fullState(), schemaVersion: 3 };
    store.map.set(ENGINE_STORAGE_KEY, JSON.stringify({ schemaVersion: 2, state: innerFuture }));
    expect(loadEngine()).toEqual({ kind: "unreadable" });
  });

  it("something that isn't an engine under the key is `unreadable`", () => {
    store.map.set(ENGINE_STORAGE_KEY, JSON.stringify({ schemaVersion: 2, state: { hello: "world" } }));
    expect(loadEngine()).toEqual({ kind: "unreadable" });
  });

  it("a draft the validator objects to is still `ok`: shape, not validity, decides readability", () => {
    const state = fullState();
    delete (state.snapshots[0]!.metrics["acq.cac"]!.estimate as { basis?: string }).basis;
    saveEngine(state);
    expect(loadEngine()).toEqual({ kind: "ok", state });
  });

  it("an unreadable store is not overwritten by a save; only an explicit clear makes room", () => {
    const newer = JSON.stringify({ schemaVersion: 3, state: { id: "from-the-future" } });
    store.map.set(ENGINE_STORAGE_KEY, newer);
    expect(saveEngine(fullState())).toEqual({ ok: false, error: "unreadable" });
    expect(store.map.get(ENGINE_STORAGE_KEY)).toBe(newer);

    clearEngine();
    expect(loadEngine()).toEqual({ kind: "empty" });
    expect(saveEngine(fullState())).toEqual({ ok: true });
  });

  describe("the v1 copy (§18.3.4) — read once, migrated, kept until a file supersedes it", () => {
    const v1Store = (state: EngineState) => JSON.stringify({ schemaVersion: 1, state: toV1(state) });

    it("v1 alone: loaded migrated; the first save writes v2 and leaves v1 intact", () => {
      const state = fullState();
      store.map.set(LEGACY_STORAGE_KEY_V1, v1Store(state));
      expect(loadEngine()).toEqual({ kind: "ok", state, migratedFrom: 1 });
      expect(saveEngine(state)).toEqual({ ok: true });
      expect(JSON.parse(store.map.get(ENGINE_STORAGE_KEY)!)).toMatchObject({ schemaVersion: 2 });
      expect(store.map.get(LEGACY_STORAGE_KEY_V1)).toBe(v1Store(state));
      // From now on the device reads v2, not v1.
      expect(loadEngine()).toEqual({ kind: "ok", state });
    });

    it("the first export after the migration removes v1 — the file now holds all of it", () => {
      const state = fullState();
      store.map.set(LEGACY_STORAGE_KEY_V1, v1Store(state));
      saveEngine(state);
      const exported = { ...state, lastExportedAt: "2026-09-30T12:00:00.000Z" };
      expect(saveEngine(exported)).toEqual({ ok: true });
      expect(store.map.has(LEGACY_STORAGE_KEY_V1)).toBe(false);
      expect(loadEngine()).toEqual({ kind: "ok", state: exported });
    });

    it("an export from before the migration, or no export at all, keeps v1", () => {
      const state = { ...fullState(), lastExportedAt: "2026-09-24T11:00:00.000Z" };
      store.map.set(LEGACY_STORAGE_KEY_V1, v1Store(state));
      // The v1 state was exported once, by the v1 build: the file it gave is not the migrated engine's.
      expect(saveEngine(state)).toEqual({ ok: true });
      expect(saveEngine({ ...state, updatedAt: "2026-09-30T12:00:00.000Z" })).toEqual({ ok: true });
      expect(store.map.has(LEGACY_STORAGE_KEY_V1)).toBe(true);
    });

    it("a v1 we cannot read is `unreadable`, never written over; « Tout effacer » clears both versions", () => {
      store.map.set(LEGACY_STORAGE_KEY_V1, "{\"schemaVersion\":1,\"state\":{");
      expect(loadEngine()).toEqual({ kind: "unreadable" });
      expect(saveEngine(fullState())).toEqual({ ok: false, error: "unreadable" });
      expect(store.map.has(ENGINE_STORAGE_KEY)).toBe(false);
      clearEngine();
      expect(store.map.size).toBe(0);
      expect(loadEngine()).toEqual({ kind: "empty" });
    });

    it("v2 present: v1 is ignored — the v2 store is the engine", () => {
      const state = fullState();
      store.map.set(ENGINE_STORAGE_KEY, JSON.stringify({ schemaVersion: 2, state }));
      store.map.set(LEGACY_STORAGE_KEY_V1, v1Store({ ...state, id: "the-old-one" }));
      expect(loadEngine()).toEqual({ kind: "ok", state });
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
