import { looksLikeEngine } from "./io";
import { migrateToV3 } from "./migrate";
import {
  ENGINE_ENTRY_PREFIX,
  ENGINE_INDEX_KEY,
  ENGINE_SCHEMA_VERSION,
  LEGACY_STORAGE_KEY_V1,
  LEGACY_STORAGE_KEY_V2,
  MAX_ENGINES,
  type EngineIndex,
  type EngineState,
  type EngineStore,
  type YearMonth,
} from "./types";

/**
 * storage.ts — the engines on this device (engine spec §4.3, D14, D15,
 * §19.1.4).
 *
 * Since A14 T0, several engines: an index under `tdg.engines.v3` (which
 * engines, in order, and the one on screen) and one entry per engine under
 * `tdg.engine.v3.<id>`. One engine that fails to write never takes the
 * others with it. A device that ran an older engine still holds it under
 * `tdg.engine.v2` — and, older still, `tdg.engine.v1` — read once, migrated,
 * and kept (rule 3). Browser only and SSR-safe: every access is guarded,
 * because a browser that refuses storage (locked private mode, blocked site
 * data) throws on reading the PROPERTY, not on calling it.
 *
 * Three rules, and all are about never losing someone's numbers:
 *
 * 1. **A failed write is RETURNED, never swallowed** (D15) — the rule of
 *    `lib/audit/storage.ts`, the opposite of `quiz/storage.ts`. Losing quiz
 *    answers costs three minutes; losing numbers pulled out of four tools
 *    costs half a day. The screen shows the failure and names the only way
 *    out: save the file.
 * 2. **Unreadable is not empty.** `loadEngine` tells a device that never held
 *    an engine (`empty`: offer the setup) from one whose store it cannot read
 *    (`unreadable`: corrupt JSON, an index pointing at nothing, or a store
 *    written by a NEWER version). Returning `null` for both would send the
 *    island to the setup screen, and its first save would overwrite the only
 *    copy. `saveEngine` refuses to write over an unreadable store for the
 *    same reason; `clearEngine` is the explicit, confirmed way to start again.
 * 3. **An older copy outlives the migration until a file supersedes it.** A
 *    device with only `tdg.engine.v2` (or only `tdg.engine.v1`) loads it
 *    migrated (`migratedFrom: 2`, or 1); the first save writes the v3 index
 *    and entry and LEAVES the old key in place (§4.3: we never destroy the
 *    only copy). The old key is removed by the first save that carries an
 *    export later than everything it holds — its last write and its last
 *    export — so a file now holds all of it.
 *
 * Read after mount only (hydration lesson of step 4); write when a field is
 * committed, not on every keystroke. An engine of 24 months weighs a few tens
 * of KB.
 */

export type LoadResult = { kind: "empty" } | { kind: "ok"; state: EngineState; migratedFrom?: 1 | 2 } | { kind: "unreadable" };
export type SaveResult = { ok: true } | { ok: false; error: "quota" | "unavailable" | "unreadable" | "full" };

/** What the engine switcher lists (§19.1.5): enough to name an engine, never its numbers. */
export interface EngineListing {
  id: string;
  companyLabel?: string;
  createdAt: string;
  updatedAt: string;
  /** The last month's flows, `YYYY-MM`. */
  lastMonth: YearMonth;
  months: number;
  active: boolean;
}

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

type Raw = { kind: "absent" } | { kind: "present"; value: string } | { kind: "unavailable" };

function readRaw(store: Storage, key: string): Raw {
  try {
    const value = store.getItem(key);
    return value === null ? { kind: "absent" } : { kind: "present", value };
  } catch {
    return { kind: "unavailable" };
  }
}

function parse(value: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

const entryKey = (id: string): string => `${ENGINE_ENTRY_PREFIX}${id}`;

/** The index, judged: this version's, with an active engine it lists, and no engine twice. */
function decodeIndex(value: string): EngineIndex | null {
  const o = parse(value);
  if (!o || o.schemaVersion !== ENGINE_SCHEMA_VERSION) return null;
  const order = o.order;
  if (!Array.isArray(order) || order.length === 0 || !order.every((id) => typeof id === "string" && id !== "")) return null;
  if (new Set(order).size !== order.length) return null;
  if (typeof o.activeId !== "string" || !order.includes(o.activeId)) return null;
  return { schemaVersion: ENGINE_SCHEMA_VERSION, activeId: o.activeId, order: [...(order as string[])] };
}

/** One engine's entry, judged: a v3 engine, or not something this version may read or overwrite. */
function decodeEntry(value: string): EngineState | null {
  const store = parse(value);
  // A newer version's entry lands here too: it must not be half-read and then flattened on the next save.
  if (!store || store.schemaVersion !== ENGINE_SCHEMA_VERSION) return null;
  const state = store.state;
  if (typeof state !== "object" || state === null) return null;
  const s = state as Record<string, unknown>;
  if (s.schemaVersion !== ENGINE_SCHEMA_VERSION || !looksLikeEngine(s)) return null;
  // Shape, not validity: a draft with an estimate still missing its basis is a normal state
  // between two edits, and treating it as unreadable would hide the user's own numbers from them.
  return state as EngineState;
}

/**
 * An older store, judged: the state as it was written (for the removal rule)
 * and the same state migrated (for the screen). `null` for anything that is
 * not an engine of that version this build understands — unreadable, never
 * empty.
 */
function decodeLegacy(value: string, version: 1 | 2): { original: Record<string, unknown>; migrated: EngineState } | null {
  const store = parse(value);
  if (!store || store.schemaVersion !== version) return null;
  const state = store.state;
  if (typeof state !== "object" || state === null || (state as Record<string, unknown>).schemaVersion !== version) return null;
  const migrated = migrateToV3(state);
  return migrated && migrated.from === version ? { original: state as Record<string, unknown>, migrated: migrated.state } : null;
}

const timeOf = (iso: unknown): number => (typeof iso === "string" ? Date.parse(iso) : Number.NaN);

/**
 * A file now holds everything the older copy held: the state being saved was
 * exported after the old copy's last write AND after its last export. An
 * older build cannot have exported it — only this one — so the file carries
 * the migrated numbers, and dropping the old copy loses nothing.
 */
function supersedes(state: EngineState, old: Record<string, unknown>): boolean {
  const exported = timeOf(state.lastExportedAt);
  if (Number.isNaN(exported)) return false;
  return [old.updatedAt, old.lastExportedAt].every((mark) => mark === undefined || exported > timeOf(mark));
}

type IndexRead = { kind: "absent" } | { kind: "ok"; index: EngineIndex } | { kind: "unreadable" } | { kind: "unavailable" };

function readIndex(store: Storage): IndexRead {
  const raw = readRaw(store, ENGINE_INDEX_KEY);
  if (raw.kind !== "present") return raw;
  const index = decodeIndex(raw.value);
  return index ? { kind: "ok", index } : { kind: "unreadable" };
}

/** An older store a device still holds, read only when no v3 index exists. */
function readLegacy(store: Storage): LoadResult {
  for (const [key, version] of [[LEGACY_STORAGE_KEY_V2, 2], [LEGACY_STORAGE_KEY_V1, 1]] as const) {
    const raw = readRaw(store, key);
    if (raw.kind === "unavailable") return { kind: "empty" };
    if (raw.kind !== "present") continue;
    const decoded = decodeLegacy(raw.value, version);
    return decoded ? { kind: "ok", state: decoded.migrated, migratedFrom: version } : { kind: "unreadable" };
  }
  return { kind: "empty" };
}

/** The engine on screen. SSR, or storage refused: `empty` — nothing to protect, and a write will say `unavailable`. */
export function loadEngine(): LoadResult {
  const store = storage();
  if (!store) return { kind: "empty" };
  const index = readIndex(store);
  if (index.kind === "unavailable") return { kind: "empty" };
  if (index.kind === "unreadable") return { kind: "unreadable" };
  if (index.kind === "absent") return readLegacy(store);
  const raw = readRaw(store, entryKey(index.index.activeId));
  if (raw.kind === "unavailable") return { kind: "empty" };
  // An index that names an engine the device no longer holds is not an empty device: someone's numbers were there.
  if (raw.kind === "absent") return { kind: "unreadable" };
  const state = decodeEntry(raw.value);
  return state ? { kind: "ok", state } : { kind: "unreadable" };
}

/**
 * Writes an engine. Returns the failure; the caller shows it (see the header).
 *
 * - The engine on screen (same id) is written in place.
 * - Another engine REPLACES the one on screen — an import « Remplacer », a
 *   setup after « Tout effacer » — and the replaced entry goes, as it did
 *   with one engine per device.
 * - `add: true` adds it beside the others and puts it on screen (« Nouveau
 *   moteur », « Ajouter comme nouveau moteur », §19.1.5, §19.7), refused as
 *   `full` beyond `MAX_ENGINES`.
 */
export function saveEngine(state: EngineState, options: { add?: boolean } = {}): SaveResult {
  const store = storage();
  if (!store) return { ok: false, error: "unavailable" };
  const read = readIndex(store);
  if (read.kind === "unavailable") return { ok: false, error: "unavailable" };
  if (read.kind === "unreadable") return { ok: false, error: "unreadable" };

  let next: EngineIndex;
  let replaced: string | null = null;
  if (read.kind === "ok") {
    const { index } = read;
    const active = readRaw(store, entryKey(index.activeId));
    if (active.kind === "unavailable") return { ok: false, error: "unavailable" };
    // The engine on screen cannot be read (or is gone): nothing is written until the person confirms (`clearEngine`).
    if (active.kind === "absent" || decodeEntry(active.value) === null) return { ok: false, error: "unreadable" };
    if (state.id === index.activeId || index.order.includes(state.id)) {
      next = { ...index, activeId: state.id };
    } else if (options.add) {
      if (index.order.length >= MAX_ENGINES) return { ok: false, error: "full" };
      next = { ...index, activeId: state.id, order: [...index.order, state.id] };
    } else {
      replaced = index.activeId;
      next = { ...index, activeId: state.id, order: index.order.map((id) => (id === index.activeId ? state.id : id)) };
    }
  } else {
    // No v3 index yet: an older store we cannot read keeps the screen on « unreadable », and nothing is written
    // until the person confirms (`clearEngine`) — the same rule as an unreadable v3 entry.
    if (readLegacy(store).kind === "unreadable") return { ok: false, error: "unreadable" };
    next = { schemaVersion: ENGINE_SCHEMA_VERSION, activeId: state.id, order: [state.id] };
  }

  const value: EngineStore = { schemaVersion: ENGINE_SCHEMA_VERSION, state };
  try {
    store.setItem(entryKey(state.id), JSON.stringify(value));
    store.setItem(ENGINE_INDEX_KEY, JSON.stringify(next));
  } catch (err) {
    return { ok: false, error: isQuota(err) ? "quota" : "unavailable" };
  }
  if (replaced !== null) removeQuietly(store, entryKey(replaced));
  dropSupersededLegacy(store, state);
  return { ok: true };
}

/** The v3 entry is written: only now may an older copy go, and only once a file holds all of it. */
function dropSupersededLegacy(store: Storage, state: EngineState): void {
  for (const [key, version] of [[LEGACY_STORAGE_KEY_V2, 2], [LEGACY_STORAGE_KEY_V1, 1]] as const) {
    const raw = readRaw(store, key);
    if (raw.kind !== "present") continue;
    const old = decodeLegacy(raw.value, version);
    if (old && supersedes(state, old.original)) removeQuietly(store, key);
  }
}

function removeQuietly(store: Storage, key: string): void {
  try {
    store.removeItem(key);
  } catch {
    // Kept: the next save tries again, and a kept copy is never the harmful outcome.
  }
}

/** Every engine on the device, in order, for the switcher (§19.1.5). `null` when the index cannot be read. */
export function listEngines(): EngineListing[] | null {
  const store = storage();
  if (!store) return [];
  const read = readIndex(store);
  if (read.kind === "unreadable") return null;
  if (read.kind !== "ok") {
    const legacy = readLegacy(store);
    return legacy.kind === "ok" ? [listingOf(legacy.state, true)] : legacy.kind === "empty" ? [] : null;
  }
  const out: EngineListing[] = [];
  for (const id of read.index.order) {
    const raw = readRaw(store, entryKey(id));
    const state = raw.kind === "present" ? decodeEntry(raw.value) : null;
    if (state) out.push(listingOf(state, id === read.index.activeId));
  }
  return out;
}

function listingOf(state: EngineState, active: boolean): EngineListing {
  const last = state.snapshots[state.snapshots.length - 1];
  return {
    id: state.id,
    ...(state.setup.companyLabel ? { companyLabel: state.setup.companyLabel } : {}),
    createdAt: state.createdAt,
    updatedAt: state.updatedAt,
    lastMonth: last?.referenceMonth ?? state.createdAt.slice(0, 7),
    months: state.snapshots.length,
    active,
  };
}

/** Puts another engine of the device on screen. Refused when it cannot be read: switching to it would show nothing. */
export function setActiveEngine(id: string): SaveResult {
  const store = storage();
  if (!store) return { ok: false, error: "unavailable" };
  const read = readIndex(store);
  if (read.kind !== "ok") return { ok: false, error: read.kind === "unavailable" ? "unavailable" : "unreadable" };
  if (!read.index.order.includes(id)) return { ok: false, error: "unreadable" };
  const raw = readRaw(store, entryKey(id));
  if (raw.kind !== "present" || decodeEntry(raw.value) === null) return { ok: false, error: "unreadable" };
  try {
    store.setItem(ENGINE_INDEX_KEY, JSON.stringify({ ...read.index, activeId: id } satisfies EngineIndex));
  } catch (err) {
    return { ok: false, error: isQuota(err) ? "quota" : "unavailable" };
  }
  return { ok: true };
}

/**
 * Deletes one engine, after the confirmation that offers its file first
 * (§19.1.5). The others are never touched; the next in order goes on screen,
 * and the last one deleted leaves an empty device.
 */
export function deleteEngine(id: string): SaveResult {
  const store = storage();
  if (!store) return { ok: false, error: "unavailable" };
  const read = readIndex(store);
  if (read.kind !== "ok") return { ok: false, error: read.kind === "unavailable" ? "unavailable" : "unreadable" };
  const order = read.index.order.filter((other) => other !== id);
  try {
    if (order.length === 0) store.removeItem(ENGINE_INDEX_KEY);
    else {
      const activeId = read.index.activeId === id ? order[Math.max(0, read.index.order.indexOf(id) - 1)]! : read.index.activeId;
      store.setItem(ENGINE_INDEX_KEY, JSON.stringify({ schemaVersion: ENGINE_SCHEMA_VERSION, activeId, order } satisfies EngineIndex));
    }
    store.removeItem(entryKey(id));
  } catch (err) {
    return { ok: false, error: isQuota(err) ? "quota" : "unavailable" };
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

/**
 * "Erase everything" (E7), after the typed confirmation — also the only way
 * past an unreadable store. Every engine of the device, its index, and the
 * older copies.
 */
export function clearEngine(): void {
  const store = storage();
  if (!store) return;
  const keys: string[] = [ENGINE_INDEX_KEY, LEGACY_STORAGE_KEY_V2, LEGACY_STORAGE_KEY_V1];
  try {
    for (let i = 0; i < store.length; i++) {
      const key = store.key(i);
      if (key?.startsWith(ENGINE_ENTRY_PREFIX)) keys.push(key);
    }
  } catch {
    // Storage refused: there is nothing we could have erased either.
  }
  for (const key of keys) removeQuietly(store, key);
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
