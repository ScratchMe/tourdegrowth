/**
 * The game's clock: typing speeds, the months scrolling by, how long each
 * flourish lasts (GAME-BRIEF.md §5.10, implementation plan §2.5).
 *
 * In one module so the e2e specs and the island read the same numbers instead
 * of copying them — a spec that waits « a bit more than the typing takes »
 * computes it from here. None of this decides a number of the game: the
 * engine has already computed the quarter when the months start to scroll,
 * and every animation here only reveals what is already there. Under
 * `prefers-reduced-motion` the island skips straight to the end state.
 *
 * No CSS duration is copied here. The eight copies that used to sit here
 * (the mouth, the blink, the live dot, the ring, the report, the phone
 * flash, the reveal, the curves) were imported by nothing — a third source
 * of the same numbers, checked by nothing (design audit S-12). Where script
 * has to wait for a CSS motion, it reads the length from the element
 * (`getComputedStyle`), as QuarterNews does for its fade out.
 */
import type { Mood } from "./types";

/** Captions type two characters per tick… */
export const TYPE_CHARS_PER_TICK = 2;
/** …every 28 ms, and faster when the CEO is angry (he talks over you). */
export const TYPE_TICK_MS: Readonly<Record<Mood, number>> = { calm: 28, firm: 28, angry: 18, cold: 28 };

/** How long a caption takes to type out entirely, in milliseconds. */
export function typingDurationMs(text: string, mood: Mood): number {
  return Math.ceil(text.length / TYPE_CHARS_PER_TICK) * TYPE_TICK_MS[mood];
}

/** Each simulated month holds the dashboard this long while the quarter runs. */
export const MONTH_STEP_MS = 600;
/** The whole quarter's scroll: three months. */
export const QUARTER_RUN_MS = 3 * MONTH_STEP_MS;


/**
 * Chrome fills `speechSynthesis.getVoices()` only after `voiceschanged`; the
 * island waits at most this long for a voice in the page's language before
 * speaking with the default one (plan R17).
 */
export const VOICES_WAIT_MS = 500;
