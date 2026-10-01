import { looksLikeEngine } from "./io";
import { migrateToV2 } from "./migrate";
import { ENGINE_SCHEMA_VERSION, ENGINE_STORAGE_KEY, LEGACY_STORAGE_KEY_V1, type EngineState, type EngineStore } from "./types";

/**
 * storage.ts — the engine on this device (engine spec §4.3, D14, D15).
 *
 * One versioned `localStorage` entry, `tdg.engine.v2`, holding an
 * `EngineStore` — and, on a device that ran the v1 engine, the v1 entry
 * `tdg.engine.v1`, read once and migrated (§18.3.4, A7.3.c S0). Browser only and SSR-safe: every access is guarded, because a
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
 * 3. **The v1 copy outlives the migration until a file supersedes it.** A
 *    device with only `tdg.engine.v1` loads it migrated (`migratedFrom: 1`);
 *    the first save writes `tdg.engine.v2` and LEAVES v1 in place (§4.3: we
 *    never destroy the only copy). v1 is removed by the first save that
 *    carries an export later than everything v1 holds — its last write and
 *    its last export — so a file now holds all of it. An export that never
 *    happened, or failed, keeps it.
 *
 * Read after mount only (hydration lesson of step 4); write when a field is
 * committed, not on every keystroke. Expected size well under 15 KB.
 */

export type LoadResult = { kind: "empty" } | { kind: "ok"; state: EngineState; migratedFrom?: 1 } | { kind: "unreadable" };
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

function readRaw(store: Storage, key: string = ENGINE_STORAGE_KEY): Raw {
  try {
    const value = store.getItem(key);
    return value === null ? { kind: "absent" } : { kind: "present", value };
  } catch {
    return { kind: "unavailable" };
  }
}

/** The stored text, judged: a v2 engine, or not something this version may read or overwrite. */
function decode(value: string): EngineState | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const store = parsed as Partial<EngineStore> & Record<string, unknown>;
  // A newer version's store lands here too: `.v2` is ours, but a v3 build that wrote into it
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

/**
 * The v1 store, judged: the v1 state as it was written (for the removal rule)
 * and the same state migrated (for the screen). `null` for anything that is
 * not a v1 engine this build understands — unreadable, never empty.
 */
function decodeV1(value: string): { original: EngineState; migrated: EngineState } | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const store = parsed as Record<string, unknown>;
  if (store.schemaVersion !== 1) return null;
  const state = store.state;
  if (typeof state !== "object" || state === null || (state as Record<string, unknown>).schemaVersion !== 1) return null;
  const migrated = migrateToV2(state);
  return migrated && migrated.from === 1 ? { original: state as EngineState, migrated: migrated.state } : null;
}

const timeOf = (iso: unknown): number => (typeof iso === "string" ? Date.parse(iso) : Number.NaN);

/**
 * A file now holds everything the v1 copy held: the state being saved was
 * exported after the v1 copy's last write AND after its last export. A v1
 * build cannot have exported it — only this one — so the file carries the
 * migrated numbers, and dropping v1 loses nothing.
 */
function supersedesV1(state: EngineState, v1: EngineState): boolean {
  const exported = timeOf(state.lastExportedAt);
  if (Number.isNaN(exported)) return false;
  return [v1.updatedAt, v1.lastExportedAt].every((mark) => mark === undefined || exported > timeOf(mark));
}

/** SSR, or storage refused: `empty` — nothing to protect, and a write will say `unavailable`. */
export function loadEngine(): LoadResult {
  const store = storage();
  if (!store) return { kind: "empty" };
  const raw = readRaw(store);
  if (raw.kind === "present") {
    const state = decode(raw.value);
    return state ? { kind: "ok", state } : { kind: "unreadable" };
  }
  if (raw.kind === "unavailable") return { kind: "empty" };
  // No v2 store: a device that ran the v1 engine still holds it under its own key.
  const legacy = readRaw(store, LEGACY_STORAGE_KEY_V1);
  if (legacy.kind !== "present") return { kind: "empty" };
  const v1 = decodeV1(legacy.value);
  return v1 ? { kind: "ok", state: v1.migrated, migratedFrom: 1 } : { kind: "unreadable" };
}

/** Writes the engine. Returns the failure; the caller shows it (see the header). */
export function saveEngine(state: EngineState): SaveResult {
  const store = storage();
  if (!store) return { ok: false, error: "unavailable" };
  const raw = readRaw(store);
  if (raw.kind === "unavailable") return { ok: false, error: "unavailable" };
  if (raw.kind === "present" && decode(raw.value) === null) return { ok: false, error: "unreadable" };
  const legacy = readRaw(store, LEGACY_STORAGE_KEY_V1);
  const v1 = legacy.kind === "present" ? decodeV1(legacy.value) : null;
  // No v2 yet and a v1 we cannot read: the screen said « unreadable », and nothing is written until
  // the person confirms (`clearEngine`) — the same rule as an unreadable v2.
  if (raw.kind === "absent" && legacy.kind === "present" && v1 === null) return { ok: false, error: "unreadable" };
  const value: EngineStore = { schemaVersion: ENGINE_SCHEMA_VERSION, state };
  try {
    store.setItem(ENGINE_STORAGE_KEY, JSON.stringify(value));
  } catch (err) {
    return { ok: false, error: isQuota(err) ? "quota" : "unavailable" };
  }
  // v2 is written: only now may v1 go, and only once a file holds all of it.
  if (v1 && supersedesV1(state, v1.original)) {
    try {
      store.removeItem(LEGACY_STORAGE_KEY_V1);
    } catch {
      // Kept: the next save tries again, and a kept copy is never the harmful outcome.
    }
  }
  return { ok: true };
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

/** "Erase everything" (E7), after the typed confirmation — also the only way past an unreadable store. Both versions. */
export function clearEngine(): void {
  const store = storage();
  if (!store) return;
  for (const key of [ENGINE_STORAGE_KEY, LEGACY_STORAGE_KEY_V1]) {
    try {
      store.removeItem(key);
    } catch {
      // Storage refused: there is nothing we could have erased either.
    }
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
