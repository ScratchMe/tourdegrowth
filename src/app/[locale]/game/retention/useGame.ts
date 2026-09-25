"use client";

/**
 * The island's state: the engine, the screen it is on, and everything a
 * gesture sets off — persistence, analytics, focus, the one live region
 * (game plan §3.5, §3.7, §3.8).
 *
 * The engine decides every number (`gameReducer` over `lib/game/model`); the
 * phase machine (`lib/game/phases.ts`) decides which screen follows which.
 * This hook only wires the two to the browser. Each handler runs the pure
 * reducer on the state it was rendered with to learn what the gesture DID,
 * then dispatches the same action: the engine is deterministic, so the
 * committed state is the one the side effects were computed from, and the
 * reducer stays the only way a year changes.
 *
 * Nothing here reads storage or the URL during render. The first render is
 * the fresh year with the first call open, exactly what the page was
 * prerendered with (plan E16); the device is read after mount.
 */
import { useEffect, useEffectEvent, useReducer, useRef, useState, type RefObject } from "react";
import { useReducedMotion } from "@/components/game/useReducedMotion";
import { trackEvent } from "@/lib/analytics/goatcounter";
import {
  GAME_CATALOGUE_OPEN_EVENT,
  GAME_ENDING_EVENT,
  GAME_HANGUP_EVENT,
  GAME_ORDER_EVENT,
  GAME_QUARTER_EVENT,
  GAME_REPLAY_EVENT,
  GAME_RESUME_EVENT,
  GAME_SHARE_EVENT,
  GAME_STARTED_EVENT,
  GAME_TOUR_LOOP_EVENT,
  GAME_VOICE_EVENT,
  gameStartedDetail,
  parseGameStartFrom,
} from "@/lib/game/events";
import { RETENTION_LEVEL, type RetentionCardId } from "@/lib/game/levels/retention";
import { fresh, moodNow } from "@/lib/game/model";
import {
  INITIAL_PHASE,
  focusFor,
  lastQuarterStart,
  nextPhase,
  runFrame,
  settledPhase,
  yearFacts,
  type FocusTarget,
  type PhaseEvent,
  type UiPhase,
} from "@/lib/game/phases";
import { gameReducer } from "@/lib/game/reducer";
import { clearGame, loadGame, recordYearEnd, resumeMode, saveGame, type SavedGame } from "@/lib/game/storage";
import type { GameAction, GameState, MonthPoint } from "@/lib/game/types";
import { MONTH_STEP_MS } from "@/lib/game/ui-timing";
import { clicksFor, monthFrames, phoneIds } from "@/lib/game/view";
import { fill } from "@/lib/game/format";
import { bossMessage, clicksSentence, quarterEndAnnouncement, resumeContent, type IslandContext } from "./island-view";

type Id = RetentionCardId;
type State = GameState<Id>;

const L = RETENTION_LEVEL;
const reduce = gameReducer(L);

/** The query parameters the level page is opened with, read once and then removed (plan §3.7). */
const FROM_PARAM = "from";
const RESUME_PARAM = "resume";

/** A quarter being played on screen: the reading it started from, and the three months the engine computed. */
interface Run {
  from: State;
  frames: MonthPoint[];
}

interface FocusRequest {
  target: FocusTarget;
  /** Bumped on every request, so asking twice for the same target moves focus twice. */
  n: number;
  /** « Rejouer l'année » scrolls to the top itself; focusing the call must not scroll back down. */
  preventScroll?: boolean;
}

/**
 * The elements a gesture sends the focus to. They belong to the island, which
 * draws them; the hook only moves the focus, after the commit that drew the
 * target.
 */
export interface GameRefs {
  call: RefObject<HTMLElement | null>;
  hand: RefObject<HTMLHeadingElement | null>;
  dashboard: RefObject<HTMLDivElement | null>;
  report: RefObject<HTMLHeadingElement | null>;
  december: RefObject<HTMLHeadingElement | null>;
  resume: RefObject<HTMLHeadingElement | null>;
}

export interface Game {
  /** The committed year. */
  game: State;
  phase: UiPhase;
  /**
   * What the desk shows — the timeline, the phone, the hand, the call, the
   * journal. The year as it stood when « Lancer » was pressed while the
   * months scroll (the quarter is not over yet on screen), the committed
   * year otherwise.
   */
  desk: State;
  /** What the dashboard shows, and the reading its deltas compare against. */
  dash: { state: State; prev: State | undefined };
  /** A save found on arrival, while « Reprendre l'année en cours ? » is asked. */
  saved: SavedGame<Id> | null;
  /** Type the caption out: only calls the player opened with « Décrocher » (plan §3.5, P11). */
  typedCall: boolean;
  /** Changes whenever a new call opens, so the caption retypes and the clock restarts. */
  callKey: number;
  /** December was reached in this visit: stamp, reveal and curves play once. Off for a reopened year. */
  enteredDecember: boolean;
  reduced: boolean;
  /** The single live region's text (plan E5); a trailing zero-width space lets the same sentence be re-announced. */
  live: string;
  hangUp: () => void;
  toggle: (id: string) => void;
  run: () => void;
  next: () => void;
  pickUp: () => void;
  listen: () => void;
  acceptResume: () => void;
  restartFromPrompt: () => void;
  replay: () => void;
  openPattern: () => void;
  share: () => void;
  tourLoop: () => void;
}

export function useGame(ctx: IslandContext, refs: GameRefs): Game {
  const [game, dispatch] = useReducer(reduce, L, fresh);
  const [phase, setPhase] = useState<UiPhase>(INITIAL_PHASE);
  const [run, setRun] = useState<Run | null>(null);
  const [frame, setFrame] = useState(0);
  const [saved, setSaved] = useState<SavedGame<Id> | null>(null);
  const [typedCall, setTypedCall] = useState(false);
  const [callKey, setCallKey] = useState(0);
  const [enteredDecember, setEnteredDecember] = useState(false);
  const [live, setLive] = useState({ text: "", n: 0 });
  const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null);
  const catalogueOpened = useRef(false);
  const reduced = useReducedMotion();


  // ---------------------------------------------------------------- helpers

  /** The phase a gesture leads to, from the phase this render was drawn in. */
  const go = (event: PhaseEvent): UiPhase => {
    const next = nextPhase(phase, event);
    if (next !== phase) setPhase(next);
    return next;
  };

  /** Runs the engine on the rendered state; `null` when it refused (the SAME object came back). */
  const apply = (action: GameAction<Id>): State | null => {
    const next = reduce(game, action);
    if (next === game) return null;
    dispatch(action);
    // Written after each action that changes the year, never mid-animation:
    // the save already holds the quarter's end while its months scroll by.
    saveGame(L, next);
    return next;
  };

  const focus = (target: FocusTarget, preventScroll = false) =>
    setFocusRequest((r) => ({ target, n: (r?.n ?? 0) + 1, preventScroll }));

  const announce = (text: string) => setLive((l) => ({ text, n: l.n + 1 }));

  /** Puts a year back — a language switch, a reload, « Reprendre ». Never animated, never typed. */
  const restore = (state: State) => {
    dispatch({ type: "restore", state });
    setPhase((p) => nextPhase(p, { type: "restore", year: yearFacts(state) }));
    setRun(null);
    setSaved(null);
    setTypedCall(false);
    setCallKey((k) => k + 1);
    setEnteredDecember(false);
  };

  /** A fresh year opening on the first call: « Recommencer », « Rejouer l'année ». */
  const restartYear = () => {
    clearGame(L);
    dispatch({ type: "reset" });
    setPhase((p) => nextPhase(p, { type: "restart" }));
    setRun(null);
    setFrame(0);
    setSaved(null);
    setTypedCall(false);
    setCallKey((k) => k + 1);
    setEnteredDecember(false);
    catalogueOpened.current = false;
  };

  // ------------------------------------------------------------- arrival

  const onArrival = useEffectEvent(() => {
    let from: string | null = null;
    let resumeAsked = false;
    try {
      const url = new URL(window.location.href);
      from = url.searchParams.get(FROM_PARAM);
      resumeAsked = url.searchParams.get(RESUME_PARAM) === "1";
      if (url.searchParams.has(FROM_PARAM) || url.searchParams.has(RESUME_PARAM)) {
        // Read once, then gone: a reload must not count a second arrival from
        // the result page, and a bookmarked `resume=1` must not skip the prompt.
        url.searchParams.delete(FROM_PARAM);
        url.searchParams.delete(RESUME_PARAM);
        window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
      }
    } catch {
      // An unparsable URL is a direct arrival with nothing to resume.
    }

    const found = loadGame(L);
    const mode = resumeMode(found);
    if (found && (resumeAsked || mode === "silent")) {
      // A language switch mid-year (P18) or a save with nothing played yet:
      // nothing to decide, so nothing is asked.
      restore(found.state);
      if (resumeAsked && !found.state.over) {
        const settled = settledPhase(yearFacts(found.state));
        const q = settled.kind === "report" ? settled.q + 1 : found.state.q + 1;
        announce(fill(ctx.copy.a11y.resumed, { q: String(q) }));
      }
      return;
    }
    if (found && mode === "prompt") {
      setSaved(found);
      setPhase((p) => nextPhase(p, { type: "prompt" }));
      // No focus on arrival (R-19): the prompt is announced, and read in place.
      announce(resumeContent(ctx, found.state).title);
      return;
    }
    // A switch of language before the first gesture reloads a year nobody
    // has touched yet: the first page already counted it.
    if (!resumeAsked) trackEvent(GAME_STARTED_EVENT, gameStartedDetail(L.slug, parseGameStartFrom(from)));
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage and the URL are only readable after mount; seeding the initial state from them would break hydration (step 4, plan E16).
    onArrival();
  }, []);

  // --------------------------------------------------------- the months

  const onRunTick = useEffectEvent(() => {
    if (!run) return;
    if (frame < run.frames.length - 1) {
      setFrame(frame + 1);
      return;
    }
    const q = phase.kind === "running" ? phase.q : game.log.length - 1;
    setRun(null);
    setPhase((p) => nextPhase(p, { type: "runEnd" }));
    focus("report");
    announce(quarterEndAnnouncement(ctx, game, q));
  });

  const running = phase.kind === "running";
  useEffect(() => {
    if (!running) return;
    // Reduced motion switched on mid-run (it can be, from the system
    // settings) ends the scroll at once: the numbers are already decided.
    const id = window.setTimeout(onRunTick, reduced ? 0 : MONTH_STEP_MS);
    return () => window.clearTimeout(id);
  }, [running, frame, reduced]);

  // ---------------------------------------------------------------- focus

  // After the commit that drew the target: the element a gesture removed (the
  // « Lancer » button, the pick-up button) has taken the focus down with it.
  const moveFocus = useEffectEvent((request: FocusRequest) => {
    refs[request.target].current?.focus({ preventScroll: request.preventScroll });
  });
  useEffect(() => {
    if (focusRequest) moveFocus(focusRequest);
  }, [focusRequest]);

  // ------------------------------------------------------------- gestures

  const hangUp = () => {
    const before = game;
    if (!apply({ type: "hangup" })) return;
    trackEvent(GAME_HANGUP_EVENT, String(before.q + 1));
    focus(focusFor(go({ type: "hangUp" })));
  };

  const toggle = (id: string) => {
    // The card's own `aria-pressed` says what happened; focus stays on it.
    const next = apply({ type: "toggle", card: id as Id });
    if (!next) return;
    // What it did to the cancellation path, in the one region (plan E5) —
    // and only when it did something: most honest cards leave the count
    // where it was, and a sentence repeated at every tick stops being heard.
    const before = clicksFor(L, phoneIds(game));
    const after = clicksFor(L, phoneIds(next));
    if (after !== before) announce(clicksSentence(ctx, after));
  };

  const runQuarter = () => {
    const before = game;
    const next = apply({ type: "run" });
    if (!next) return;
    if (before.order !== null) {
      trackEvent(GAME_ORDER_EVENT, before.picks.includes(before.order) ? "obeyed" : "refused");
    }
    trackEvent(GAME_QUARTER_EVENT, String(before.q + 1));
    const q = next.log.length - 1;
    const p = go({ type: "run", year: yearFacts(next), animate: !reduced });
    if (p.kind === "running") {
      setRun({ from: before, frames: monthFrames(before, next) });
      setFrame(0);
      // The dashboard is where the quarter happens; on a phone it is two
      // screens above the « Lancer » button that was just pressed.
      focus("dashboard");
    } else {
      focus("report");
      announce(quarterEndAnnouncement(ctx, next, q));
    }
  };

  const nextStep = () => {
    const p = go({ type: "next", year: yearFacts(game) });
    if (p.kind === "december" && game.ending) {
      setEnteredDecember(true);
      trackEvent(GAME_ENDING_EVENT, game.ending);
      recordYearEnd(L, { seen: game.seenDark, used: game.everDark, ending: game.ending });
      focus("december");
    } else if (p.kind === "ringing") {
      focus("call");
    }
  };

  const pickUp = () => {
    const p = go({ type: "pickUp" });
    if (p.kind !== "call") return;
    setTypedCall(true);
    setCallKey((k) => k + 1);
    focus("call");
    // Once, whole: the caption types for sighted readers, this is the message.
    announce(bossMessage(ctx, game));
  };

  const listen = () => trackEvent(GAME_VOICE_EVENT, moodNow(L, game));

  const acceptResume = () => {
    if (!saved) return;
    trackEvent(GAME_RESUME_EVENT, "resume");
    restore(saved.state);
    focus(focusFor(settledPhase(yearFacts(saved.state))));
  };

  const restartFromPrompt = () => {
    trackEvent(GAME_RESUME_EVENT, "restart");
    restartYear();
    focus("call");
  };

  const replay = () => {
    trackEvent(GAME_REPLAY_EVENT);
    restartYear();
    // Back to the top of the page — the intro, then the first call — the way
    // a first visit reads it (P13). Instant: an animated scroll is exactly the
    // motion reduced-motion readers asked not to get, and it is never needed.
    window.scrollTo(0, 0);
    focus("call", true);
  };

  const openPattern = () => {
    if (catalogueOpened.current) return;
    catalogueOpened.current = true;
    trackEvent(GAME_CATALOGUE_OPEN_EVENT);
  };

  // ----------------------------------------------------------- the views

  const desk = running && run ? run.from : game;
  const point = running && run ? run.frames[frame] : undefined;
  const dash = point && run ? { state: runFrame(run.from, point), prev: undefined } : { state: game, prev: lastQuarterStart(L, game) };

  return {
    game,
    phase,
    desk,
    dash,
    saved,
    typedCall,
    callKey,
    enteredDecember,
    reduced,
    live: live.text + (live.n % 2 ? "​" : ""),
    hangUp,
    toggle,
    run: runQuarter,
    next: nextStep,
    pickUp,
    listen,
    acceptResume,
    restartFromPrompt,
    replay,
    openPattern,
    share: () => trackEvent(GAME_SHARE_EVENT),
    tourLoop: () => trackEvent(GAME_TOUR_LOOP_EVENT),
  };
}
