import type { EngineState } from "@/lib/engine/types";
import { loadStoredResults, type StoredResult } from "@/lib/quiz/storage";
import { clearEngine, loadEngine, saveEngine, type LoadResult } from "./engine-api";

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
    };
  }
  return snapshot;
}

export function getServerSnapshot(): null {
  return null;
}

export type CommitResult = { ok: true } | { ok: false; error: "quota" | "unavailable" };

/**
 * Writes the state and keeps it on screen whatever the device says.
 * `fresh` for an engine that did not exist a moment ago (setup, import): it
 * has no "last visit", so the resume band must not greet it.
 */
export function commit(state: EngineState, options: { fresh?: boolean } = {}): CommitResult {
  const current = getClientSnapshot();
  snapshot = { ...current, result: { kind: "ok", state }, returningFrom: options.fresh ? null : current.returningFrom };
  notify();
  return saveEngine(state);
}

/** "Erase everything": the device and the screen, together. */
export function erase(): void {
  clearEngine();
  const current = getClientSnapshot();
  snapshot = { ...current, result: { kind: "empty" }, returningFrom: null };
  notify();
}
