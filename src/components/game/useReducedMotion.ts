"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether the reader asked the system for less motion — for the motion the
 * game drives in JavaScript (the typewriter, the months rolling by). CSS
 * motion needs none of this: motion.css already switches every animation
 * and transition off under `prefers-reduced-motion: reduce`. A `setInterval`
 * is out of its reach, which is why this hook exists (plan §2.5).
 */
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** The slice of `window` this module reads, so a test can hand it a fake one. */
export interface MotionWindow {
  matchMedia?: (query: string) => Pick<MediaQueryList, "matches" | "addEventListener" | "removeEventListener">;
}

/**
 * The current preference, and `false` wherever it cannot be read: no
 * window (the server), or no `matchMedia` (old engines, some test DOMs).
 * Nothing the game animates in JavaScript hides information — the worst a
 * wrong `false` costs is a caption that takes two seconds to finish typing —
 * so an unreadable preference falls back to the default motion.
 */
export function readReducedMotion(win: MotionWindow | undefined): boolean {
  try {
    return win?.matchMedia?.(REDUCED_MOTION_QUERY).matches ?? false;
  } catch {
    return false;
  }
}

/** Listens for the preference changing while the page is open — it can, from the system settings. */
export function subscribeReducedMotion(win: MotionWindow | undefined, onChange: () => void): () => void {
  const list = win?.matchMedia?.(REDUCED_MOTION_QUERY);
  if (!list) return () => {};
  list.addEventListener("change", onChange);
  return () => list.removeEventListener("change", onChange);
}

const browserWindow = (): MotionWindow | undefined => (typeof window === "undefined" ? undefined : window);

/**
 * `useSyncExternalStore` rather than state set in an effect: the server
 * snapshot is `false` (it cannot know), hydration renders with that same
 * value — so no mismatch — and React re-renders with the real one right
 * after, without a render that shows motion to someone who asked for none
 * on a screen the island mounts later.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => subscribeReducedMotion(browserWindow(), onChange),
    () => readReducedMotion(browserWindow()),
    () => false,
  );
}
