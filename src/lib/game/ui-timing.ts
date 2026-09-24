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
 * CSS durations that live in tokens (`--dur-stamp`, the mouth's 220 ms) are
 * mirrored here only where JavaScript has to wait for them.
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

/** The mouth's open/close cycle while speaking (`scaleY` 1 → 3,2, alternating). */
export const MOUTH_CYCLE_MS = 220;
/** The calm CEO blinks every 4,5 s; the angry one stops blinking. */
export const BLINK_PERIOD_MS = 4_500;
/** The « live » dot pulses — faster when he is angry. */
export const LIVE_DOT_MS: Readonly<Record<Mood, number>> = { calm: 1_600, firm: 1_600, angry: 700, cold: 1_600 };
/** The incoming call rings (the frame pulses) at this period. */
export const RING_PULSE_MS = 1_200;

/** Each simulated month holds the dashboard this long while the quarter runs. */
export const MONTH_STEP_MS = 600;
/** The whole quarter's scroll: three months. */
export const QUARTER_RUN_MS = 3 * MONTH_STEP_MS;

/** The quarter report fades and rises in. */
export const REPORT_ENTER_MS = 200;
/** A phone element that changed when a card was ticked is outlined this long. */
export const PHONE_FLASH_MS = 600;
/** December unblurs the two hidden tiles. */
export const REVEAL_MS = 600;
/** The December curves draw themselves. */
export const CHART_DRAW_MS = 800;

/**
 * Chrome fills `speechSynthesis.getVoices()` only after `voiceschanged`; the
 * island waits at most this long for a voice in the page's language before
 * speaking with the default one (plan R17).
 */
export const VOICES_WAIT_MS = 500;
