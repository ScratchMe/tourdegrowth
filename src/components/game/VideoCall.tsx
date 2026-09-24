"use client";

import { useEffect, useState, type Ref } from "react";
import { Button } from "@/components/core/Button";
import { Disclosure } from "@/components/core/Disclosure";
import type { LevelCopy } from "@/lib/game/copy";
import type { Mood } from "@/lib/game/types";
import { DgFace } from "./DgFace";
import { useReducedMotion } from "./useReducedMotion";
import { useSpeech, type VoiceSettings } from "./useSpeech";
import { useTypewriter, type TypingPace } from "./useTypewriter";
import styles from "./VideoCall.module.css";

/**
 * The four states of the call (plan §2.6, §3.5):
 * - `ringing` — between two quarters, before the reader picks up;
 * - `open` — he talks, the cards wait;
 * - `hungUp` — the image stays, the message can be reread, the cards are live;
 * - `ended` — the year is over: grey, and his last word.
 */
export type CallState = "ringing" | "open" | "hungUp" | "ended";

/** A running call's clock, `mm:ss`. Capped at 99:59: nobody stays that long, and the chip keeps its width. */
export function formatCallClock(seconds: number): string {
  const s = Math.max(0, Math.min(99 * 60 + 59, Math.floor(seconds)));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export interface VideoCallProps {
  state: CallState;
  mood: Mood;
  /** What he says — resolved and filled by the island, in the page's language. */
  message: string;
  /** `quarterPeriod` filled for the quarter that is ringing (« Trimestre 2 · avril à juin »). */
  ringingEyebrow?: string;
  labels: LevelCopy["visio"];
  /**
   * Type the caption out (true) or show it whole (false). The island types
   * only calls it opens itself, after a pick-up; the call present on page
   * load is prerendered whole (plan §3.5, P11). Reduced motion always shows
   * it whole.
   */
  animateCaption: boolean;
  /** From lib/game/ui-timing.ts: `TYPE_CHARS_PER_TICK`, `TYPE_TICK_MS[mood]`. */
  typingPace: TypingPace;
  /**
   * From lib/game/view.ts (`voiceLang`, `voiceParams(mood)`). Null: no
   * « Listen » button at all, whatever the browser can do.
   */
  voice: VoiceSettings | null;
  /** From ui-timing.ts `VOICES_WAIT_MS`: how long to wait for the voice list (plan R17). */
  voiceWaitMs: number;
  /** Changes when a new call opens, so the same line is retyped and the clock restarts. */
  callKey?: string | number;
  onHangUp?: () => void;
  onPickUp?: () => void;
  /**
   * The island moves focus here on `call` (plan §3.5), hence `tabIndex=-1`:
   * the region is a target for focus, never a stop in the tab order.
   */
  ref?: Ref<HTMLElement>;
  /** Only the SVG CEO exists. A recorded video is the planned second renderer (GAME-BRIEF §9.4). */
  renderer?: "svg";
}

/**
 * The call with the CEO. Presentation only: every word arrives resolved,
 * every number (typing pace, voice) arrives computed — components/game/
 * imports nothing but types from lib/game.
 *
 * The subtitles live in a BAND UNDER the picture, never over it (plan R2):
 * on a 390px phone the prototype's overlay started 25px above the frame and
 * cut its own first lines. Under the picture it has all the height it needs,
 * and the face is never covered.
 *
 * The typed band is `aria-hidden`: a screen reader would otherwise hear the
 * sentence arrive two characters at a time. The whole message sits beside it
 * in visually hidden text, and the island announces it once in its single
 * live region (plan §3.5).
 */
export function VideoCall({
  state,
  mood,
  message,
  ringingEyebrow,
  labels,
  animateCaption,
  typingPace,
  voice,
  voiceWaitMs,
  callKey = "",
  onHangUp,
  onPickUp,
  ref,
}: VideoCallProps) {
  const reduced = useReducedMotion();
  const open = state === "open";
  const caption = useTypewriter(message, {
    animate: animateCaption && open,
    reduced,
    pace: typingPace,
    restartKey: callKey,
  });
  const speech = useSpeech(voiceWaitMs);
  const { cancel } = speech;

  // Hanging up — or anything else that closes the call — silences him
  // (§5.10). Keyed on `open` alone: the voice must survive re-renders.
  useEffect(() => {
    if (!open) cancel();
  }, [open, cancel]);

  // The clock is derived from the state: « raccroché » and « terminé » are
  // words of the state, and a new call shows 00:00 on its first render — the
  // prototype showed « raccroché » on a reopened call until its first tick
  // (plan R12). Only the seconds of an open call count, and they belong to
  // the call they started with.
  const clockKey = `${callKey}\u0000${state}`;
  const [clock, setClock] = useState({ key: clockKey, s: 0 });
  const seconds = clock.key === clockKey ? clock.s : 0;
  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => {
      setClock((c) => ({ key: clockKey, s: (c.key === clockKey ? c.s : 0) + 1 }));
    }, 1000);
    return () => window.clearInterval(id);
  }, [open, clockKey]);

  const timer = open ? formatCallClock(seconds) : state === "hungUp" ? labels.hungUp : state === "ended" ? labels.ended : null;
  const speaking = open && (caption.typing || speech.speaking);
  const canListen = open && speech.supported && voice !== null;

  const hangUp = () => {
    cancel();
    onHangUp?.();
  };

  return (
    <section
      ref={ref}
      tabIndex={-1}
      aria-label={labels.label}
      className={styles.call}
      data-testid="game-call"
      data-state={state}
      data-mood={mood}
      data-speaking={speaking ? "true" : "false"}
    >
      <div className={styles.frame}>
        <DgFace mood={mood} speaking={speaking} />
        <span className={styles.chip}>
          <span className={styles.live} aria-hidden="true" />
          {labels.tag}
        </span>
        {timer !== null && (
          <span className={styles.timer} data-testid="game-timer">
            {timer}
          </span>
        )}
      </div>

      {state === "ringing" ? (
        <div className={styles.band} data-testid="game-ringing">
          {ringingEyebrow ? <span className={styles.eyebrow}>{ringingEyebrow}</span> : null}
          <p className={styles.ringingTitle}>{labels.ringing}</p>
        </div>
      ) : state !== "hungUp" ? (
        <div className={styles.band}>
          <p className={styles.caption} data-testid="game-caption" aria-hidden="true">
            {caption.shown}
            {/* Holds the band at the height of the whole message while it types, so nothing below jumps. */}
            <span className={styles.ghost}>{message.slice(caption.shown.length)}</span>
          </p>
          <p className="tdg-visually-hidden">{message}</p>
        </div>
      ) : null}

      {state === "ringing" && (
        <div className={styles.bar}>
          <Button variant="primary" onClick={onPickUp} data-testid="game-pickup" className={styles.push}>
            {labels.pickUp}
          </Button>
        </div>
      )}
      {open && (
        <div className={styles.bar}>
          {canListen ? (
            <Button
              variant="secondary"
              onClick={() => voice && speech.speak(message, voice)}
              data-testid="game-listen"
            >
              {labels.listen}
            </Button>
          ) : null}
          <Button variant="primary" onClick={hangUp} data-testid="game-hangup" className={styles.push}>
            {labels.hangUp}
          </Button>
        </div>
      )}
      {state === "hungUp" && (
        <div className={styles.reread}>
          <Disclosure summary={labels.reread} size="sm" rule={false} data-testid="game-reread">
            <p className={styles.rereadText}>{message}</p>
          </Disclosure>
        </div>
      )}
    </section>
  );
}
