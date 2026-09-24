"use client";

import { useEffect, useState } from "react";

/**
 * The CEO's subtitles typing themselves out (GAME-BRIEF §5.10: two
 * characters every 28 ms, 18 ms when he is angry). The speeds are the
 * caller's to pass — they live in lib/game/ui-timing.ts, and a component of
 * components/game/ imports nothing but types from lib/game — so this module
 * only knows how to slice.
 */
export interface TypingPace {
  /** Characters revealed per tick. */
  charsPerTick: number;
  /** Milliseconds between two ticks. */
  tickMs: number;
}

/**
 * The text as it stands after `ticks` ticks. By CODE POINT, not by UTF-16
 * unit: `"…".slice` is harmless, but a tick that cut an astral character in
 * half would paint a lone surrogate — a replacement box — for 28 ms, on the
 * one line the whole screen is reading.
 */
export function typedAt(text: string, ticks: number, charsPerTick: number): string {
  const chars = Array.from(text);
  const shown = Math.max(0, Math.min(chars.length, Math.floor(ticks) * Math.max(1, Math.floor(charsPerTick))));
  return chars.slice(0, shown).join("");
}

/** How many ticks it takes to show the whole text — the last one lands exactly on its end. */
export function ticksToType(text: string, charsPerTick: number): number {
  return Math.ceil(Array.from(text).length / Math.max(1, Math.floor(charsPerTick)));
}

export interface Typewriter {
  /** What the caption band paints right now. */
  shown: string;
  /** True while characters are still arriving — the mouth moves meanwhile. */
  typing: boolean;
}

/**
 * Types `text` out when `animate` is on and motion is allowed; shows it
 * whole otherwise. `restartKey` retypes a text that has not changed (the
 * same line, a new call).
 *
 * Progress is stored WITH the key it belongs to, and read as zero when the
 * key has moved on: a new line starts from nothing on its very first render,
 * instead of flashing the old line's length of the new one, and without
 * resetting state inside an effect.
 *
 * The first server render of an animated caption is therefore empty. The
 * island only animates calls it opens itself, client-side, after a pick-up;
 * the call present on page load is prerendered whole (plan §3.5, P11).
 */
export function useTypewriter(
  text: string,
  { animate, reduced, pace, restartKey = "" }: { animate: boolean; reduced: boolean; pace: TypingPace; restartKey?: string | number },
): Typewriter {
  const key = `${restartKey}\u0000${text}`;
  const [progress, setProgress] = useState({ key, ticks: 0 });
  const ticks = progress.key === key ? progress.ticks : 0;
  const total = ticksToType(text, pace.charsPerTick);
  const running = animate && !reduced && ticks < total;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setProgress((p) => ({ key, ticks: (p.key === key ? p.ticks : 0) + 1 }));
    }, pace.tickMs);
    return () => window.clearInterval(id);
  }, [running, key, pace.tickMs]);

  if (!animate || reduced) return { shown: text, typing: false };
  return { shown: typedAt(text, ticks, pace.charsPerTick), typing: running };
}
