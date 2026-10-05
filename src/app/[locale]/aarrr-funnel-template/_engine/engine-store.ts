import { clearEngine, deleteEngine, deviceCopy, listEngines, loadEngine, restoreDevice, saveEngine, saveOverUnreadable, setActiveEngine, storedEngineCount, type EngineListing, type LoadResult, type SaveResult } from "@/lib/engine/storage";
import type { EngineState } from "@/lib/engine/types";
import { loadStoredResults, type StoredResult } from "@/lib/quiz/storage";
import { dropAllDrafts } from "./sheet-drafts";

/**
 * The engine's one source of truth on this device, read through
 * `useSyncExternalStore` rather than a mount effect (spec R15, and the
 * P0 island's own `data-state` flip): the server snapshot is `null` — "not
 * read yet" — so the prerendered HTML and the first client render are
 * identical, and the stored engine arrives on the very next render.
 *
 * Every write goes through `commit`, which updates the snapshot BEFORE
 * trying the device: a failed write (quota, private mode) must never lose
 * what the person just typed from the screen — D15 wants the failure shown
 * and the work kept, so they can still save it to a file.
 *
 * Module state on purpose: the island can unmount and remount inside one
 * page session (the language switch is a full load, but a same-tree
 * navigation away and back is not), and a snapshot cached per mount would
 * resurrect an engine the person had just erased.
 *
 * Three things besides the engine are read ONCE, at the first client read,
 * and carried in the snapshot so every render stays pure:
 * - `openedAt`, the session's clock — "today" for the mature cohort, the
 *   stale requests and the resume band. A render that called `new Date()`
 *   would give two answers to "which cohort is mature?" in one session;
 * - `returningFrom`, the stored engine's `updatedAt` as found on arrival —
 *   what "since your last visit" measures (E6), and null for a first visit;
 * - `tourResults`, the Tour results on this device (the bridge READS them,
 *   D13 — it never copies them into the engine).
 */
export interface EngineSnapshot {
  result: LoadResult;
  openedAt: string;
  returningFrom: string | null;
  tourResults: StoredResult[];
  /**
   * The engines on this device, for the switcher (§19.1.5, A14 T5): names and
   * months, never numbers. Read again after every write, switch or delete;
   * null when the device's index cannot be read.
   */
  engines: EngineListing[] | null;
  /** The engine entries on the device, readable or not: what « Tout effacer » says it erases. */
  stored: number;
}

let snapshot: EngineSnapshot | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getClientSnapshot(): EngineSnapshot {
  if (!snapshot) {
    const result = loadEngine();
    snapshot = {
      result,
      openedAt: new Date().toISOString(),
      returningFrom: result.kind === "ok" ? result.state.updatedAt : null,
      tourResults: loadStoredResults(),
      engines: listEngines(),
      stored: storedEngineCount(),
    };
  }
  return snapshot;
}

export function getServerSnapshot(): null {
  return null;
}

/**
 * What a write says: done, or why not. `unreadable` is the storage module's
 * refusal to overwrite a store it cannot read (corrupt, or written by a newer
 * version) — the only copy of someone's engine must not be flattened by a
 * save nobody confirmed.
 */
export type CommitResult = SaveResult;

/**
 * Writes the state and keeps it on screen whatever the device says.
 * `fresh` for an engine that did not exist a moment ago (setup, import): it
 * has no "last visit", so the resume band must not greet it.
 * `overUnreadable` when the person has just chosen a file on the « illisible »
 * screen: the one way past `saveEngine`'s refusal, which — since a device
 * holds several engines (A14 T5) — keeps every engine it can still read
 * (`saveOverUnreadable`) rather than clearing the device.
 * `probation` for a state that comes from a file (A25.b): kept only once the
 * board has drawn it (`shown`), and undone by `fallBack` if the board throws.
 */
export function commit(state: EngineState, options: { fresh?: boolean; overUnreadable?: boolean; add?: boolean; probation?: boolean } = {}): CommitResult {
  // An engine that arrives (setup, an import, over a store or not): no
  // half-typed sheet of the one before survives it (A15.12). A metric the new
  // engine has not filled keys its draft `id@new` too, and would come back
  // pre-filled with the other company's figures.
  if (options.fresh || options.overUnreadable) dropAllDrafts();
  const current = getClientSnapshot();
  if (options.probation) probation = { copy: deviceCopy(), before: current };
  snapshot = { ...current, result: { kind: "ok", state }, returningFrom: options.fresh ? null : current.returningFrom };
  notify();
  // `add`: beside the device's other engines (« Nouveau moteur », « Ajouter comme nouveau moteur », §19.1.5, §19.7).
  const saved = options.overUnreadable ? saveOverUnreadable(state) : saveEngine(state, { add: options.add });
  relist();
  return saved;
}

/** The switcher's list, read again once the device has been written. */
function relist(): void {
  const engines = listEngines();
  const stored = storedEngineCount();
  const current = getClientSnapshot();
  if (stored === current.stored && JSON.stringify(engines) === JSON.stringify(current.engines)) return;
  snapshot = { ...current, engines, stored };
  notify();
}

/**
 * Another engine of the device on screen (§19.1.5). No sheet half-typed for
 * the one before follows it (A15.12); it opens with no « since your last
 * visit », which was the other engine's.
 */
export function switchEngine(id: string): CommitResult {
  const result = setActiveEngine(id);
  if (!result.ok) return result;
  dropAllDrafts();
  reload();
  return result;
}

/**
 * One engine deleted, after its confirmation (§19.1.5): the others are never
 * touched, the next in order goes on screen, and the last one leaves the
 * device empty — the setup.
 */
export function removeEngine(id: string): CommitResult {
  const result = deleteEngine(id);
  if (!result.ok) return result;
  dropAllDrafts();
  reload();
  return result;
}

function reload(): void {
  const current = getClientSnapshot();
  snapshot = { ...current, result: loadEngine(), returningFrom: null, engines: listEngines(), stored: storedEngineCount() };
  notify();
}

/*
 * The island's net (A25.b, `EngineBoundary`). A file can carry what the
 * validator only reports — a number « conflicting » without its two
 * readings, a cohort month that isn't one — and the board throws on it.
 * Before A25.b that took the page to its « détour » at every visit, and a
 * merge could carry it into someone's own engine. Three module values, like
 * the snapshot above: the island remounts under its boundary, and must find
 * them again.
 */
let probation: { copy: Record<string, string> | null; before: EngineSnapshot } | null = null;
let strikes = 0;
let fileRefused = false;

/** The board has drawn the engine on screen: an import on probation is kept, and the failures are counted afresh. */
export function shown(): void {
  probation = null;
  strikes = 0;
}

/**
 * What the island does when a render under its boundary throws. True when
 * something drawable is on screen again; false when nothing is left to try,
 * and the error goes on to the page's own boundary, as before A25.b.
 *
 * 1. An import the board has not drawn yet: the device is put back as it
 *    was before the click (`restoreDevice`), the screen too, and the import
 *    screen says the file is refused (`refusedFilePending`).
 * 2. Otherwise, once more, from the board: the screen that threw may not be
 *    the board, and the board may draw.
 * 3. The board threw again: the engine on screen is shown as unreadable, on
 *    the « illisible » screen. Nothing is written: its numbers stay on the
 *    device, for « Importer », « Tout effacer », or a build that reads them.
 */
export function fallBack(): boolean {
  if (probation) {
    const { copy, before } = probation;
    probation = null;
    if (copy) restoreDevice(copy);
    snapshot = before;
    fileRefused = true;
    notify();
    return true;
  }
  if (strikes === 0) {
    strikes = 1;
    return true;
  }
  const current = getClientSnapshot();
  if (current.result.kind !== "ok") return false;
  snapshot = { ...current, result: { kind: "unreadable" } };
  notify();
  return true;
}

/** A file was just refused by the board (1. above): the island opens on the import screen, which says so. */
export function refusedFilePending(): boolean {
  return fileRefused;
}

export function clearRefusedFile(): void {
  fileRefused = false;
}

/** "Erase everything": the device and the screen, together. */
export function erase(): void {
  clearEngine();
  dropAllDrafts();
  const current = getClientSnapshot();
  snapshot = { ...current, result: { kind: "empty" }, returningFrom: null, engines: [], stored: 0 };
  notify();
}
