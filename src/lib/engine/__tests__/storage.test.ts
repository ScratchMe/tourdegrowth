import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { clearEngine, loadEngine, requestPersistence, saveEngine } from "../storage";
import { ENGINE_STORAGE_KEY } from "../types";
import { fullState } from "./fixtures";

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

  it("round-trips an engine under tdg.engine.v1, wrapped in its versioned store", () => {
    const state = fullState();
    expect(saveEngine(state)).toEqual({ ok: true });
    expect(JSON.parse(store.map.get(ENGINE_STORAGE_KEY)!)).toMatchObject({ schemaVersion: 1, state: { id: state.id } });
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
    store.map.set(ENGINE_STORAGE_KEY, JSON.stringify({ schemaVersion: 2, state: fullState() }));
    expect(loadEngine()).toEqual({ kind: "unreadable" });
    const innerFuture = { ...fullState(), schemaVersion: 2 };
    store.map.set(ENGINE_STORAGE_KEY, JSON.stringify({ schemaVersion: 1, state: innerFuture }));
    expect(loadEngine()).toEqual({ kind: "unreadable" });
  });

  it("something that isn't an engine under the key is `unreadable`", () => {
    store.map.set(ENGINE_STORAGE_KEY, JSON.stringify({ schemaVersion: 1, state: { hello: "world" } }));
    expect(loadEngine()).toEqual({ kind: "unreadable" });
  });

  it("a draft the validator objects to is still `ok`: shape, not validity, decides readability", () => {
    const state = fullState();
    delete (state.snapshots[0]!.metrics["acq.cac"]!.estimate as { basis?: string }).basis;
    saveEngine(state);
    expect(loadEngine()).toEqual({ kind: "ok", state });
  });

  it("an unreadable store is not overwritten by a save; only an explicit clear makes room", () => {
    const newer = JSON.stringify({ schemaVersion: 2, state: { id: "from-the-future" } });
    store.map.set(ENGINE_STORAGE_KEY, newer);
    expect(saveEngine(fullState())).toEqual({ ok: false, error: "unreadable" });
    expect(store.map.get(ENGINE_STORAGE_KEY)).toBe(newer);

    clearEngine();
    expect(loadEngine()).toEqual({ kind: "empty" });
    expect(saveEngine(fullState())).toEqual({ ok: true });
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
