import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TYPE_CHARS_PER_TICK, TYPE_TICK_MS, typingDurationMs, VOICES_WAIT_MS } from "@/lib/game/ui-timing";
import type { Mood } from "@/lib/game/types";
import { FACE_PATHS } from "@/components/game/DgFace";
import { readReducedMotion, REDUCED_MOTION_QUERY, subscribeReducedMotion, type MotionWindow } from "@/components/game/useReducedMotion";
import { pickVoice, waitForVoices, type VoiceLike, type VoiceSource } from "@/components/game/useSpeech";
import { ticksToType, typedAt } from "@/components/game/useTypewriter";
import { formatCallClock } from "@/components/game/VideoCall";

// Game plan §4.2, G7a: X23 (typing) and X24 (voice), plus the face table
// P10 reads and the call clock. The runner renders no component (node
// environment, no DOM): the hooks' logic is exported as plain functions and
// tested here; P10-P12 are played end to end by G8b.

const MOODS: Mood[] = ["calm", "firm", "angry", "cold"];

describe("X23 — the typewriter slices", () => {
  const text = "Bonjour. Je vais être direct : le board veut 4 %.";

  it("shows two characters more at every tick, from nothing to the whole line", () => {
    expect(typedAt(text, 0, TYPE_CHARS_PER_TICK)).toBe("");
    expect(typedAt(text, 1, TYPE_CHARS_PER_TICK)).toBe("Bo");
    expect(typedAt(text, 3, TYPE_CHARS_PER_TICK)).toBe("Bonjou");
    expect(typedAt(text, ticksToType(text, TYPE_CHARS_PER_TICK), TYPE_CHARS_PER_TICK)).toBe(text);
    expect(typedAt(text, 10_000, TYPE_CHARS_PER_TICK)).toBe(text);
  });

  it("every frame is a prefix of the next one — the line never jumps back", () => {
    let previous = "";
    for (let tick = 0; tick <= ticksToType(text, TYPE_CHARS_PER_TICK); tick += 1) {
      const frame = typedAt(text, tick, TYPE_CHARS_PER_TICK);
      expect(frame.startsWith(previous)).toBe(true);
      previous = frame;
    }
  });

  it("takes exactly as long as ui-timing says, at 28 ms a tick and 18 ms when angry", () => {
    expect(TYPE_CHARS_PER_TICK).toBe(2);
    expect(TYPE_TICK_MS.calm).toBe(28);
    expect(TYPE_TICK_MS.angry).toBe(18);
    // The island waits on typingDurationMs; the hook stops after ticksToType
    // ticks. If the two disagreed, a spec would wait for a line that is done,
    // or stop watching one that is still typing.
    for (const mood of MOODS) {
      expect(ticksToType(text, TYPE_CHARS_PER_TICK) * TYPE_TICK_MS[mood]).toBe(typingDurationMs(text, mood));
    }
  });

  it("never cuts a character in half", () => {
    // An astral character is two UTF-16 units: a slice through it paints a
    // replacement box for one tick.
    const astral = "a\u{1F525}bc";
    for (let tick = 0; tick <= 3; tick += 1) {
      const frame = typedAt(astral, tick, 1);
      expect(frame).not.toMatch(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/);
    }
    expect(typedAt(astral, 2, 1)).toBe("a\u{1F525}");
    expect(ticksToType(astral, 1)).toBe(4);
  });

  it("an empty line is typed in no ticks", () => {
    expect(ticksToType("", TYPE_CHARS_PER_TICK)).toBe(0);
    expect(typedAt("", 5, TYPE_CHARS_PER_TICK)).toBe("");
  });
});

describe("X24 — choosing the voice", () => {
  const voices: VoiceLike[] = [
    { lang: "en-US", name: "Samantha" },
    { lang: "fr-CA", name: "Amélie" },
    { lang: "fr-FR", name: "Thomas" },
  ];

  it("takes the exact tag first", () => {
    expect(pickVoice(voices, "fr-FR")?.name).toBe("Thomas");
    expect(pickVoice(voices, "en-US")?.name).toBe("Samantha");
  });

  it("falls back to the first voice of the same language", () => {
    expect(pickVoice([voices[0]!, voices[1]!], "fr-FR")?.name).toBe("Amélie");
  });

  it("reads Android's underscore tags and ignores case", () => {
    expect(pickVoice([{ lang: "FR_fr", name: "Android" }], "fr-FR")?.name).toBe("Android");
  });

  it("returns nothing rather than a voice of another language", () => {
    // Without a match the utterance keeps its lang and the browser picks —
    // never an English voice handed a French line (plan R17).
    expect(pickVoice([voices[0]!], "fr-FR")).toBeNull();
    expect(pickVoice([], "fr-FR")).toBeNull();
  });

  function fakeSource(initial: VoiceLike[] = []) {
    let list = initial;
    const listeners = new Set<() => void>();
    const source: VoiceSource = {
      getVoices: () => list,
      addEventListener: (_type, fn) => listeners.add(fn),
      removeEventListener: (_type, fn) => listeners.delete(fn),
    };
    return {
      source,
      listeners,
      load(next: VoiceLike[]) {
        list = next;
        for (const fn of [...listeners]) fn();
      },
    };
  }

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not wait when the voices are already there", async () => {
    const { source, listeners } = fakeSource(voices);
    await expect(waitForVoices(source, VOICES_WAIT_MS)).resolves.toBe(voices);
    expect(listeners.size).toBe(0);
  });

  it("waits for voiceschanged — Chrome's list is empty until it fires", async () => {
    vi.useFakeTimers();
    const fake = fakeSource();
    const pending = waitForVoices(fake.source, VOICES_WAIT_MS);
    vi.advanceTimersByTime(100);
    fake.load(voices);
    await expect(pending).resolves.toEqual(voices);
    expect(fake.listeners.size).toBe(0);
  });

  it("an event that still brings no voice keeps waiting", async () => {
    vi.useFakeTimers();
    const fake = fakeSource();
    const pending = waitForVoices(fake.source, VOICES_WAIT_MS);
    fake.load([]);
    let settled = false;
    void pending.then(() => (settled = true));
    await Promise.resolve();
    expect(settled).toBe(false);
    fake.load(voices);
    await expect(pending).resolves.toEqual(voices);
  });

  it("gives up after the bound, with whatever there is — the click is never swallowed", async () => {
    vi.useFakeTimers();
    const fake = fakeSource();
    const pending = waitForVoices(fake.source, VOICES_WAIT_MS);
    vi.advanceTimersByTime(VOICES_WAIT_MS - 1);
    let settled = false;
    void pending.then(() => (settled = true));
    await Promise.resolve();
    expect(settled).toBe(false);
    vi.advanceTimersByTime(1);
    await expect(pending).resolves.toEqual([]);
    expect(fake.listeners.size).toBe(0);
  });
});

describe("reduced motion, read safely", () => {
  const windowWith = (matches: boolean): MotionWindow => ({
    matchMedia: (query: string) => ({
      matches: query === REDUCED_MOTION_QUERY && matches,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  });

  it("reads the media query", () => {
    expect(readReducedMotion(windowWith(true))).toBe(true);
    expect(readReducedMotion(windowWith(false))).toBe(false);
  });

  it("is false where it cannot be read: the server, an engine without matchMedia, one that throws", () => {
    expect(readReducedMotion(undefined)).toBe(false);
    expect(readReducedMotion({})).toBe(false);
    expect(
      readReducedMotion({
        matchMedia: () => {
          throw new Error("no");
        },
      }),
    ).toBe(false);
  });

  it("subscribes to changes and unsubscribes the same listener", () => {
    const added: unknown[] = [];
    const removed: unknown[] = [];
    const win: MotionWindow = {
      matchMedia: () => ({
        matches: false,
        addEventListener: (_t: string, fn: unknown) => added.push(fn),
        removeEventListener: (_t: string, fn: unknown) => removed.push(fn),
      }),
    };
    const onChange = () => {};
    const unsubscribe = subscribeReducedMotion(win, onChange);
    expect(added).toEqual([onChange]);
    unsubscribe();
    expect(removed).toEqual([onChange]);
    expect(() => subscribeReducedMotion(undefined, onChange)()).not.toThrow();
  });
});

describe("the face table is the brief's (P10)", () => {
  // P10 compares the `d` of #browL, #browR and #mouthShape to GAME-BRIEF
  // §5.10 at each call. Reading the table from the brief itself keeps this
  // component from drifting away from the document the e2e spec quotes.
  const brief = readFileSync(join(process.cwd(), "GAME-BRIEF.md"), "utf8");
  const rows = new Map(
    [...brief.matchAll(/^\| (calm|firm|angry|cold) \| (M[^/|]+?) \/ (M[^|]+?) \| (M[^|]+?) \|/gm)].map((m) => [
      m[1] as Mood,
      { browL: m[2]!.trim(), browR: m[3]!.trim(), mouth: m[4]!.trim() },
    ]),
  );

  it("finds the four rows in the brief", () => {
    expect([...rows.keys()].sort()).toEqual([...MOODS].sort());
  });

  it.each(MOODS)("%s", (mood) => {
    expect(FACE_PATHS[mood]).toEqual(rows.get(mood));
  });
});

describe("the call clock", () => {
  it("counts in mm:ss", () => {
    expect(formatCallClock(0)).toBe("00:00");
    expect(formatCallClock(42)).toBe("00:42");
    expect(formatCallClock(61.9)).toBe("01:01");
    expect(formatCallClock(600)).toBe("10:00");
  });

  it("stays two digits wide at both ends", () => {
    expect(formatCallClock(-5)).toBe("00:00");
    expect(formatCallClock(100 * 60)).toBe("99:59");
  });
});
