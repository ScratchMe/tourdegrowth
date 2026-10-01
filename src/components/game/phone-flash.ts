"use client";

import { useState } from "react";

/** The keys of `next` that `prev` did not show — the elements a tick just changed. */
export function changedKeys<T>(prev: readonly T[], next: readonly T[], keyOf: (item: T) => string): Set<string> {
  const before = new Set(prev.map(keyOf));
  return new Set(next.map(keyOf).filter((key) => !before.has(key)));
}

/**
 * Which elements of a drawn phone a tick just changed — both levels' phones
 * outline them for a moment (`PhoneFrame.module.css`, `.flash`). The previous
 * screen is kept in state and compared during render — React's pattern for
 * state derived from a prop change, with no effect and no ref read. Compared
 * by content, not by reference: the island rebuilds the array on every
 * render, and an unrelated re-render must not cut a flash short by clearing
 * its class mid-animation. The first render never flashes.
 */
export function usePhoneFlash<T>(items: readonly T[], keyOf: (item: T) => string): (item: T) => boolean {
  const signature = items.map(keyOf).join("|");
  const [previous, setPrevious] = useState({ signature, items });
  const [changed, setChanged] = useState<ReadonlySet<string>>(() => new Set());
  if (previous.signature !== signature) {
    setChanged(changedKeys(previous.items, items, keyOf));
    setPrevious({ signature, items });
  }
  return (item) => changed.has(keyOf(item));
}
