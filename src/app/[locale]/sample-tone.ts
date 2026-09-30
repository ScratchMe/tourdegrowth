"use client";

import { useSyncExternalStore } from "react";
import type { ToneToggleValue } from "@/components/result/ToneToggle";

/**
 * The tone the landing's preview is showing, shared with the hero's « Voir
 * un résultat d'exemple » (C24, Antoine, 2026-09-30): the preview card and
 * the button sit in two columns, two islands, and the button has to lead to
 * the sample the preview just showed — `/r/sample?tone=roast` in roast
 * (CHANTIERS.md A3.3), the plain sample otherwise.
 *
 * A module-level value with `useSyncExternalStore`: no context provider to
 * wrap the landing in, and the server snapshot is the preview's own default
 * (« Direct »), so the first paint and the hydrated page agree.
 */
let current: ToneToggleValue = "straight";
const listeners = new Set<() => void>();

export function setSampleTone(tone: ToneToggleValue): void {
  if (tone === current) return;
  current = tone;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSampleTone(): ToneToggleValue {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => "straight",
  );
}

/** Where « Voir un résultat d'exemple » leads for a tone — the roast sample has its own address and its own share card. */
export function sampleHref(tone: ToneToggleValue): string {
  return tone === "roast" ? "/r/sample?tone=roast" : "/r/sample";
}
