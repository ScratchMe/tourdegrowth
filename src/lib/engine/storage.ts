import { looksLikeEngine } from "./io";
import { ENGINE_SCHEMA_VERSION, ENGINE_STORAGE_KEY, type EngineState, type EngineStore } from "./types";

/**
 * storage.ts — the engine on this device (engine spec §4.3, D14, D15).
 *
 * One versioned `localStorage` entry, `tdg.engine.v1`, holding an
 * `EngineStore`. Browser only and SSR-safe: every access is guarded, because a
 * browser that refuses storage (locked private mode, blocked site data) throws
 * on reading the PROPERTY, not on calling it.
 *
 * Two rules, and both are about never losing someone's numbers:
 *
 * 1. **A failed write is RETURNED, never swallowed** (D15) — the rule of
 *    `lib/audit/storage.ts`, the opposite of `quiz/storage.ts`. Losing quiz
 *    answers costs three minutes; losing numbers pulled out of four tools
 *    costs half a day. The screen shows the failure and names the only way
 *    out: save the file.
 * 2. **Unreadable is not empty.** `loadEngine` tells the island apart a device
 *    that never held an engine (`empty`: offer the setup) from one whose store
 *    it cannot read (`unreadable`: corrupt JSON, or a store written by a
 *    NEWER version of the engine). Returning `null` for both — the spec's
 *    first draft — would send the island to the setup screen, and its first
 *    save would overwrite the only copy. `saveEngine` refuses to write over an
 *    unreadable store for the same reason; `clearEngine` is the explicit,
 *    confirmed way to start again.
 *
 * Read after mount only (hydration lesson of step 4); write when a field is
 * committed, not on every keystroke. Expected size well under 15 KB.
 */

export type LoadResult = { kind: "empty" } | { kind: "ok"; state: EngineState } | { kind: "unreadable" };
export type SaveResult = { ok: true } | { ok: false; error: "quota" | "unavailable" | "unreadable" };

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

type Raw = { kind: "absent" } | { kind: "present"; value: string } | { kind: "unavailable" };

function readRaw(store: Storage): Raw {
  try {
    const value = store.getItem(ENGINE_STORAGE_KEY);
    return value === null ? { kind: "absent" } : { kind: "present", value };
  } catch {
    return { kind: "unavailable" };
  }
}

/** The stored text, judged: a v1 engine, or not something this version may read or overwrite. */
function decode(value: string): EngineState | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const store = parsed as Partial<EngineStore> & Record<string, unknown>;
  // A newer version's store lands here too: `.v1` is ours, but a v2 build that wrote into it
  // by mistake — or a downgrade — must not be half-read and then flattened on the next save.
  if (store.schemaVersion !== ENGINE_SCHEMA_VERSION) return null;
  const state = store.state as unknown;
  if (typeof state !== "object" || state === null) return null;
  const s = state as Record<string, unknown>;
  if (s.schemaVersion !== ENGINE_SCHEMA_VERSION || !looksLikeEngine(s)) return null;
  // Shape, not validity: a draft with an estimate still missing its basis is a normal state
  // between two edits, and treating it as unreadable would hide the user's own numbers from them.
  return state as EngineState;
}

/** SSR, or storage refused: `empty` — nothing to protect, and a write will say `unavailable`. */
export function loadEngine(): LoadResult {
  const store = storage();
  if (!store) return { kind: "empty" };
  const raw = readRaw(store);
  if (raw.kind !== "present") return { kind: "empty" };
  const state = decode(raw.value);
  return state ? { kind: "ok", state } : { kind: "unreadable" };
}

/** Writes the engine. Returns the failure; the caller shows it (see the header). */
export function saveEngine(state: EngineState): SaveResult {
  const store = storage();
  if (!store) return { ok: false, error: "unavailable" };
  const raw = readRaw(store);
  if (raw.kind === "unavailable") return { ok: false, error: "unavailable" };
  if (raw.kind === "present" && decode(raw.value) === null) return { ok: false, error: "unreadable" };
  const value: EngineStore = { schemaVersion: ENGINE_SCHEMA_VERSION, state };
  try {
    store.setItem(ENGINE_STORAGE_KEY, JSON.stringify(value));
    return { ok: true };
  } catch (err) {
    return { ok: false, error: isQuota(err) ? "quota" : "unavailable" };
  }
}

/**
 * Chromium and WebKit name it `QuotaExceededError` (code 22), Firefox
 * `NS_ERROR_DOM_QUOTA_REACHED` (code 1014). Read by name AND code: a
 * `DOMException` isn't guaranteed to be `instanceof DOMException` across realms.
 */
function isQuota(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const e = err as { name?: unknown; code?: unknown };
  return e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED" || e.code === 22 || e.code === 1014;
}

/** "Erase everything" (E7), after the typed confirmation — also the only way past an unreadable store. */
export function clearEngine(): void {
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(ENGINE_STORAGE_KEY);
  } catch {
    // Storage refused: there is nothing we could have erased either.
  }
}

/**
 * Asks the browser to exempt this origin from eviction, once, at the first
 * save (§4.3). Local only — no request leaves the page. Chromium and Firefox
 * may grant it; Safari keeps its seven-day rule regardless, which is why the
 * backup band stays up until a file has been saved.
 */
export async function requestPersistence(): Promise<boolean> {
  if (typeof navigator === "undefined") return false;
  try {
    const manager = navigator.storage;
    if (!manager || typeof manager.persist !== "function") return false;
    if (typeof manager.persisted === "function" && (await manager.persisted())) return true;
    return await manager.persist();
  } catch {
    return false;
  }
}
