"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * « Écouter le DG » — the Web Speech API, as an optional extra. The captions
 * are always on screen (GAME-BRIEF §9.7); the voice only adds to them, so
 * every failure here is silent and leaves the page exactly as it was.
 *
 * Settings arrive resolved from the island (lib/game/view.ts `voiceParams`,
 * `voiceLang`; the wait from ui-timing.ts): components/game/ imports nothing
 * but types from lib/game.
 */
export interface VoiceSettings {
  /** Always set, never left to the browser: without it Chrome may read French with an English voice (plan R17). */
  lang: string;
  rate: number;
  pitch: number;
  volume: number;
}

/** The slice of a SpeechSynthesisVoice this module reads. */
export interface VoiceLike {
  lang: string;
  name?: string;
}

/**
 * The voice to speak `lang` with: the exact tag first (`fr-FR`), then the
 * first voice of the same language (`fr-CA`, `fr-BE`), else none — and none
 * is a real answer: the utterance still carries `lang`, and the browser picks
 * its own voice for it. Android spells tags with an underscore (`fr_FR`),
 * and case varies between engines, hence the normalisation.
 */
export function pickVoice<V extends VoiceLike>(voices: readonly V[], lang: string): V | null {
  const norm = (tag: string) => tag.replace(/_/g, "-").toLowerCase();
  const wanted = norm(lang);
  const primary = wanted.split("-")[0];
  return (
    voices.find((v) => norm(v.lang) === wanted) ??
    voices.find((v) => norm(v.lang).split("-")[0] === primary) ??
    null
  );
}

/** The slice of `speechSynthesis` the voice wait needs — small enough to fake in a test. */
export interface VoiceSource<V extends VoiceLike = VoiceLike> {
  getVoices(): V[];
  addEventListener(type: "voiceschanged", listener: () => void): void;
  removeEventListener(type: "voiceschanged", listener: () => void): void;
}

/**
 * The voices, once there are any — or whatever there is after `waitMs`.
 *
 * Chrome returns an empty list from `getVoices()` until it has fired
 * `voiceschanged`, so the first click on « Écouter » used to pick no French
 * voice at all (plan R17). Waiting for the event fixes that; bounding the
 * wait keeps a browser that never fires it (some never do when the list is
 * already final) from swallowing the click. Resolves, never rejects.
 */
export function waitForVoices<V extends VoiceLike>(
  source: VoiceSource<V>,
  waitMs: number,
  timers: { set: (fn: () => void, ms: number) => unknown; clear: (id: unknown) => void } = {
    set: (fn, ms) => setTimeout(fn, ms),
    clear: (id) => clearTimeout(id as ReturnType<typeof setTimeout>),
  },
): Promise<V[]> {
  const now = source.getVoices();
  if (now.length > 0) return Promise.resolve(now);
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      source.removeEventListener("voiceschanged", onChange);
      timers.clear(timer);
      resolve(source.getVoices());
    };
    const onChange = () => {
      if (source.getVoices().length > 0) finish();
    };
    source.addEventListener("voiceschanged", onChange);
    const timer = timers.set(finish, waitMs);
  });
}

const hasSpeech = () => typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
const noSubscription = () => () => {};

export interface Speech {
  /** False on the server and during hydration, so the prerendered page never offers a button that may not work (P12). */
  supported: boolean;
  /** True from the utterance's start to its end — the mouth moves meanwhile. */
  speaking: boolean;
  speak: (text: string, settings: VoiceSettings) => void;
  /** Silences anything queued or speaking. Hanging up calls it (§5.10). */
  cancel: () => void;
}

/**
 * Detection is a `useSyncExternalStore` whose server snapshot is `false`:
 * hydration renders the same « no button » the server sent, then React
 * re-renders with the real answer — the button appears after mount without
 * a state set in an effect.
 *
 * Every `speak` takes a ticket; a later `speak` or a `cancel` makes the
 * earlier ticket stale, so a voice list that arrives after the reader has
 * already hung up does not start talking into an empty room.
 */
export function useSpeech(voiceWaitMs: number): Speech {
  const supported = useSyncExternalStore(noSubscription, hasSpeech, () => false);
  const [speaking, setSpeaking] = useState(false);
  const ticket = useRef(0);

  const cancel = useCallback(() => {
    ticket.current += 1;
    if (hasSpeech()) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, settings: VoiceSettings) => {
      if (!hasSpeech()) return;
      const synth = window.speechSynthesis;
      synth.cancel();
      const mine = ++ticket.current;
      void waitForVoices(synth, voiceWaitMs).then((voices) => {
        if (mine !== ticket.current) return;
        const u = new SpeechSynthesisUtterance(text);
        u.lang = settings.lang;
        u.rate = settings.rate;
        u.pitch = settings.pitch;
        u.volume = settings.volume;
        const voice = pickVoice(voices, settings.lang);
        if (voice) u.voice = voice;
        const stop = () => {
          if (mine === ticket.current) setSpeaking(false);
        };
        u.onstart = () => {
          if (mine === ticket.current) setSpeaking(true);
        };
        u.onend = stop;
        u.onerror = stop;
        synth.speak(u);
      });
    },
    [voiceWaitMs],
  );

  // Leaving the page (or unmounting the call) stops the voice: speech
  // outlives the DOM otherwise, and keeps talking over the next screen.
  useEffect(() => cancel, [cancel]);

  return { supported, speaking, speak, cancel };
}
