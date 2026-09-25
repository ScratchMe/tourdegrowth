/**
 * The game's model — GAME-BRIEF.md §5.6-5.11, ported from the prototype
 * (`design/game/prototype-s-ils-reviennent.html`) constant for constant and
 * in the same order of operations. The fixtures F1-F5 pin that port: the
 * prototype, played, produces exactly the four reference years of the brief
 * §6, and so must this.
 *
 * Every exported function is pure: `(level, state, …) → value`, never a
 * mutation of its argument (the tests deep-freeze their input). Internally,
 * each quarter works on one private draft — a clone mutated step by step,
 * which is what lets the code keep the prototype's shape line for line, and
 * so stay reviewable against it. Two departures from the prototype, both
 * required by React rather than by taste:
 *
 * - `handIds` is pure. The prototype recorded the patterns it showed
 *   (`seenDark`) while rendering the hand, which strict mode's double render
 *   would do twice and a server render would do on the wrong side. That
 *   bookkeeping moved to `dealHand`, called when a hand is dealt — at the
 *   start of the year and at the end of every quarter that isn't the last.
 * - The quarter's journal is structured (ids, numbers, event kinds), never
 *   sentences, so a game in progress can change language and re-render its
 *   whole history.
 *
 * No text, no `@/` value import: e2e specs import this module to build
 * seeded saves, and Playwright does not resolve the alias.
 */
import type {
  BossMessageSpec,
  CardDef,
  EndingId,
  GameEvent,
  GameState,
  LevelDefinition,
  ModelConstants,
  Mood,
  QuarterLog,
  VisibleEffect,
} from "./types";

// Rules of the model that are not per-level tunables (brief §5.7): the shape
// of the trust multiplier, the ages at which a card ramps up or wears off,
// and the decay rates. Named so the arithmetic below reads like the brief.
const TRUST_PIVOT = 60;
const TRUST_LOW_DIVISOR = 150;
const TRUST_HIGH_DIVISOR = 300;
const ACQ_TRUST_DIVISOR = 150;
const RAMP_AGE = 4;
const TEMP_AGE = 3;
const INSIGHT_BOOST = 1.2;
const DARK_WEAR_AGE = 3;
const DARK_WEAR = 0.7;
const SPIKE_DECAY = 0.005;
const RADAR_DECAY = 3;
const MONTHS_PER_QUARTER = 3;

type Level<Id extends string> = LevelDefinition<Id>;
type State<Id extends string> = GameState<Id>;

/** A deep copy the private helpers may mutate. States are plain JSON. */
function draft<Id extends string>(state: State<Id>): State<Id> {
  return structuredClone(state);
}

function card<Id extends string>(level: Level<Id>, id: Id): CardDef<Id> {
  return level.cards[id];
}

function activeDarkIds<Id extends string>(level: Level<Id>, state: State<Id>): Id[] {
  return state.active.filter((id) => card(level, id).kind === "d");
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}

/** The churn target of quarter `q` — the board's, past the end of the year. */
export function targetFor(c: ModelConstants, q: number): number {
  const target = c.targets[Math.min(q, c.targets.length - 1)];
  if (target === undefined) throw new Error("model: a level needs four quarter targets");
  return target;
}

// ---------------------------------------------------------------- state ---

/** The first of January: the CEO's first call is open, nothing is in production. */
export function fresh<Id extends string>(level: Level<Id>): State<Id> {
  const c = level.constants;
  const mrr = c.subs0 * c.price;
  const state: State<Id> = {
    v: 1,
    level: level.slug,
    q: 0,
    month: 0,
    subs: c.subs0,
    churn: c.churn0,
    mrr,
    trust: c.trust0,
    radar: c.radar0,
    patience: c.patience0,
    lagTrust: c.trust0,
    callOpen: true,
    order: null,
    orders: [],
    obeyed: [],
    refused: [],
    active: [],
    since: {},
    everDark: [],
    removedDark: [],
    seenDark: [],
    insight: false,
    presented: 0,
    picks: [],
    history: [{ m: 0, churn: c.churn0, trust: c.trust0, subs: c.subs0, mrr }],
    log: [],
    sanction: false,
    fired: false,
    over: false,
    ending: null,
    spike: 0,
    press: 0,
  };
  return dealHand(level, { ...state, order: pickOrder(level, state) });
}

// ----------------------------------------------------------------- hand ---

/**
 * The cards on the table this quarter (§5.6). Pure: same state, same hand,
 * however many times it is asked. The CEO's order leads when it is in the
 * hand; the rest alternates dark and honest in list order — never by effect,
 * or the good path would sort itself to the top.
 */
export function handIds<Id extends string>(level: Level<Id>, state: State<Id>): Id[] {
  const hasDark = activeDarkIds(level, state).length > 0;
  const honest = level.honestOrder.filter((id) => {
    const c = card(level, id);
    if (state.active.includes(id)) return false;
    if (c.insight && state.insight) return false;
    if (c.present && state.presented > state.q) return false;
    if (c.onlyIfDark && !hasDark) return false;
    return true;
  });
  // The way back out (`clean`) is always offered when it applies, on top of
  // the usual six — never crowded out by them.
  const always = honest.filter((id) => card(level, id).onlyIfDark);
  const others = honest.filter((id) => !card(level, id).onlyIfDark).slice(0, level.handSize.honest);
  const h = [...always, ...others];

  let d = level.darkOrder.filter((id) => !state.active.includes(id));
  if (state.q === 0) d = d.filter((id) => level.darkFirstQuarter.includes(id));
  d = d.slice(0, level.handSize.dark);

  const dd = d.filter((id) => id !== state.order);
  const hh = h.filter((id) => id !== state.order);
  const rest: Id[] = [];
  for (let i = 0; i < Math.max(dd.length, hh.length); i++) {
    const dark = dd[i];
    const honestCard = hh[i];
    if (dark !== undefined) rest.push(dark);
    if (honestCard !== undefined) rest.push(honestCard);
  }
  const lead = state.order !== null && d.includes(state.order) ? [state.order] : [];
  return [...lead, ...rest];
}

/**
 * Deals the hand: records every pattern it shows in `seenDark`, which is how
 * December tells "you turned it down" from "it never crossed your desk".
 * Nothing is dealt once the year is over.
 */
export function dealHand<Id extends string>(level: Level<Id>, state: State<Id>): State<Id> {
  if (state.over) return state;
  const shown = handIds(level, state).filter((id) => card(level, id).kind === "d");
  const seenDark = [...state.seenDark];
  for (const id of shown) if (!seenDark.includes(id)) seenDark.push(id);
  return { ...state, seenDark };
}

/**
 * Whether the picks are a set drawn from this quarter's hand. `toggle` can
 * only ever produce such picks; this is for every state that arrives another
 * way — a restored save, a stale one — which would otherwise put a card in
 * production that was never dealt, or the same card twice.
 */
export function picksInHand<Id extends string>(level: Level<Id>, state: State<Id>): boolean {
  const hand = handIds(level, state);
  return new Set(state.picks).size === state.picks.length && state.picks.every((id) => hand.includes(id));
}

// ----------------------------------------------------------- reductions ---

/**
 * How much one card cuts churn at a given month (§5.7.2). `ramp` takes over
 * at age 4, `temp` wears off at age 3, the exit survey's insight lifts every
 * honest cut by a fifth, and a pattern loses 30 % of its bite after three
 * months — the people it held back leave anyway.
 */
export function cardReduction<Id extends string>(
  level: Level<Id>,
  state: State<Id>,
  id: Id,
  month: number = state.month,
): number {
  const c = card(level, id);
  const age = month - (state.since[id] ?? month);
  let r = c.red ?? 0;
  if (c.ramp && age >= RAMP_AGE) r = c.ramp;
  if (c.temp && age >= TEMP_AGE) r = 0;
  if (state.insight && c.kind === "h" && r > 0) r *= INSIGHT_BOOST;
  if (c.kind === "d") r *= age >= DARK_WEAR_AGE ? DARK_WEAR : 1;
  return r;
}

export interface MonthlyReduction {
  /** Honest cuts, summed then capped at `honestCap`. */
  hr: number;
  /** Pattern cuts, summed then capped at `darkCap`. */
  dr: number;
  mrrMult: number;
  /** One more month billed to every leaver (the notice period). */
  extra: boolean;
}

export function monthlyReduction<Id extends string>(level: Level<Id>, state: State<Id>): MonthlyReduction {
  let hr = 0;
  let dr = 0;
  let mrrMult = 1;
  let extra = false;
  for (const id of state.active) {
    const c = card(level, id);
    const r = cardReduction(level, state, id);
    if (c.kind === "h") hr += r;
    else dr += r;
    if (c.mrr) mrrMult *= c.mrr;
    if (c.extra) extra = true;
  }
  return {
    hr: Math.min(level.constants.honestCap, hr),
    dr: Math.min(level.constants.darkCap, dr),
    mrrMult,
    extra,
  };
}

/**
 * Churn multiplier from trust (§5.7.4). Read on `lagTrust` — trust frozen at
 * the start of the quarter — because people don't leave the week a pattern
 * ships; they leave the quarter after, having told someone.
 */
export function trustMult(lagTrust: number): number {
  return lagTrust < TRUST_PIVOT
    ? 1 + (TRUST_PIVOT - lagTrust) / TRUST_LOW_DIVISOR
    : 1 - (lagTrust - TRUST_PIVOT) / TRUST_HIGH_DIVISOR;
}

// ---------------------------------------------------------------- month ---

function mutStepMonth<Id extends string>(level: Level<Id>, s: State<Id>): void {
  const c = level.constants;
  s.month += 1;
  const { hr, dr, mrrMult, extra } = monthlyReduction(level, s);
  let churn = c.churn0 * (1 - hr) * (1 - dr) * trustMult(s.lagTrust) + s.spike;
  if (c.season.months.includes(s.month)) churn += c.season.add;
  s.spike = Math.max(0, s.spike - SPIKE_DECAY);
  churn = Math.max(c.churnFloor, churn);
  const cancels = s.subs * churn;
  const acq = c.acq0 * (1 + (s.trust - TRUST_PIVOT) / ACQ_TRUST_DIVISOR) * (s.press > 0 ? c.press.acqBoost : 1);
  s.press = Math.max(0, s.press - 1);
  s.subs = s.subs - cancels + acq;
  s.churn = churn;
  s.mrr = s.subs * c.price * mrrMult + (extra ? cancels * c.price : 0);
  if (activeDarkIds(level, s).length === 0) s.radar = Math.max(0, s.radar - RADAR_DECAY);
  s.history.push({ m: s.month, churn, trust: s.trust, subs: s.subs, mrr: s.mrr });
}

/** One simulated month (§5.7). */
export function stepMonth<Id extends string>(level: Level<Id>, state: State<Id>): State<Id> {
  const s = draft(state);
  mutStepMonth(level, s);
  return s;
}

// -------------------------------------------------------------- choices ---

function mutApplyPicks<Id extends string>(level: Level<Id>, s: State<Id>): void {
  const p = level.constants.patience;
  // In the order they were picked, as the prototype does: « Point données »
  // picked before the exit survey is a meeting without data.
  for (const id of s.picks) {
    const c = card(level, id);
    if (c.clean) {
      for (const d of activeDarkIds(level, s)) if (!s.removedDark.includes(d)) s.removedDark.push(d);
      s.active = s.active.filter((x) => card(level, x).kind !== "d");
    }
    if (c.insight) s.insight = true;
    if (c.present) {
      s.presented = s.q + 1;
      s.patience += s.insight ? p.presentInsight : p.presentBlind;
    }
    if (c.trust) s.trust += c.trust;
    if (c.radar) s.radar += c.radar;
    if (c.perm) {
      s.active.push(id);
      s.since[id] = s.month;
    }
    if (c.kind === "d" && !s.everDark.includes(id)) s.everDark.push(id);
  }
  s.trust = clamp(s.trust, 0, 100);
  s.radar = clamp(s.radar, 0, 100);
}

/**
 * The effects that land the moment two cards are picked, before any month
 * runs (§5.8, last paragraph): trust and radar deltas, insight, the data
 * meeting's patience, cleaning, and putting permanent cards in production.
 */
export function applyPicks<Id extends string>(level: Level<Id>, state: State<Id>): State<Id> {
  const s = draft(state);
  mutApplyPicks(level, s);
  return s;
}

// -------------------------------------------------------------- quarter ---

/**
 * What a card visibly did this quarter (§5.12) — the only numbers the player
 * gets before December. Computed at the quarter's last month.
 */
export function visibleEffect<Id extends string>(level: Level<Id>, state: State<Id>, id: Id): VisibleEffect {
  const c = card(level, id);
  if (c.insight) return { kind: "insight" };
  if (c.present) return { kind: "present", insight: state.insight };
  if (c.clean) return { kind: "clean" };
  if (c.extra) return { kind: "extra" };
  const r = cardReduction(level, state, id);
  if (r > 0) return { kind: "down", pct: Math.round(r * 100), rising: !!c.ramp && r < c.ramp };
  if (r < 0) return { kind: "up", pct: Math.round(-r * 100) };
  return { kind: "none" };
}

/**
 * The card the CEO asks for as a quarter opens (§5.10). None in the first
 * quarter; then the schedule's card, or the first of the pool not already in
 * production — and after a DGCCRF control he stops asking for the two that
 * got him fined. He may ask for the same card twice: refusing it doesn't
 * make him forget it (X4 pins that, so it stays a decision).
 */
export function pickOrder<Id extends string>(level: Level<Id>, state: State<Id>): Id | null {
  const wanted = level.orderSchedule[state.q];
  if (wanted === null || wanted === undefined) return null;
  const cands = [wanted, ...level.orderPool].filter(
    (id) => !state.active.includes(id) && !(state.sanction && level.bannedAfterSanction.includes(id)),
  );
  return cands[0] ?? null;
}

/** The CEO's face and voice at the moment (§5.10). */
export function moodNow<Id extends string>(level: Level<Id>, state: State<Id>): Mood {
  if (state.over) return state.fired ? "cold" : "firm";
  if (state.q === 0) return "firm";
  const last = state.log.at(-1);
  if (last && last.gap > 0) return "angry";
  return state.q >= 2 ? "firm" : "calm";
}

/** Which message the CEO opens the call with — the copy layer writes it. */
export function bossMessageSpec<Id extends string>(level: Level<Id>, state: State<Id>): BossMessageSpec {
  if (state.over) return state.fired ? { kind: "fired" } : { kind: "yearEnd" };
  const last = state.log.at(-1);
  if (state.q === 0 || !last) return { kind: "t1" };
  return {
    kind: "quarter",
    q: state.q as 1 | 2 | 3,
    hit: last.gap <= 0,
    churnPrev: last.churnEnd,
    target: targetFor(level.constants, state.q),
    order: state.order,
  };
}

/** How the year ended (§5.11), checked in the brief's order. */
export function computeEnding<Id extends string>(level: Level<Id>, state: State<Id>): EndingId {
  const usedDark = state.everDark.length > 0;
  const stillDark = activeDarkIds(level, state).length > 0;
  const win = state.churn <= level.constants.winChurn;
  if (state.fired) return usedDark ? "firedDark" : "firedClean";
  if (!usedDark) return win ? "applause" : "cleanMiss";
  if (state.sanction) return "fine";
  if (!stillDark && state.removedDark.length > 0) return "repentant";
  return "labyrinth";
}

/**
 * Plays the quarter (§5.7-5.8): the picks land, three months run, then the
 * end-of-quarter reckoning in the brief's order — target, order, the CEO's
 * mid-quarter mail, the data meeting, a control or reports, the viral thread
 * or the press, the competitor, clamps, the CEO's line, firing, and the next
 * quarter's order and hand. Refuses (returns the state unchanged) unless
 * exactly two cards are picked and the year is still running; the reducer
 * checks the same, this is the engine not trusting its caller. Whether the
 * picks are in the hand is the reducer's rule (`picksInHand`), not this
 * function's: the engine's own tests play arbitrary pairs to isolate one
 * mechanic at a time.
 */
export function runQuarter<Id extends string>(level: Level<Id>, state: State<Id>): State<Id> {
  const c = level.constants;
  if (state.over || state.picks.length !== c.picksPerQuarter) return state;
  const s = draft(state);
  const picked = [...s.picks];
  const churnStart = s.churn;
  s.lagTrust = s.trust;
  const orderId = s.order;
  const obeyed = orderId !== null && picked.includes(orderId);
  if (orderId !== null) {
    s.orders.push(orderId);
    (obeyed ? s.obeyed : s.refused).push(orderId);
  }
  mutApplyPicks(level, s);
  const presentedNow = picked.some((id) => card(level, id).present);
  for (let i = 0; i < MONTHS_PER_QUARTER; i++) mutStepMonth(level, s);
  // The CEO's mid-quarter mail reads the quarter's second month.
  const midChurn = s.history.at(-2)?.churn ?? s.churn;

  const target = targetFor(c, s.q);
  const gap = s.churn - target;
  const p = c.patience;
  const events: GameEvent[] = [];
  if (gap <= 0) s.patience += p.hit;
  else s.patience -= Math.min(p.missCap, Math.round(p.missPerPoint * gap));
  if (orderId !== null) s.patience += obeyed ? p.obeyed : p.refused;
  events.push({ kind: "midMail", moving: !(midChurn > target) });
  if (presentedNow) events.push({ kind: "present", insight: s.insight });
  if (s.radar >= c.control.radar) {
    s.sanction = true;
    const fine = c.control.fineBase + Math.round(s.radar) * c.control.finePerPoint;
    events.push({ kind: "control", fine, leavers: Math.round(s.subs * c.control.leaversRate) });
    for (const d of activeDarkIds(level, s)) if (!s.removedDark.includes(d)) s.removedDark.push(d);
    s.active = s.active.filter((x) => card(level, x).kind !== "d");
    s.radar = c.control.radarAfter;
    s.trust += c.control.trustHit;
    s.patience += c.control.patienceHit;
    s.spike += c.control.spike;
  } else if (s.radar >= c.reports.radar) {
    events.push({ kind: "reports" });
    s.patience += c.reports.patienceHit;
    s.trust += c.reports.trustHit;
  }
  if (s.trust <= c.viral.trust) {
    events.push({ kind: "viral" });
    s.spike += c.viral.spike;
    s.patience += c.viral.patienceHit;
  }
  if (s.trust >= c.press.trust) {
    events.push({ kind: "press" });
    s.press = c.press.months;
    s.patience += c.press.patienceBoost;
  }
  if (s.q === c.competitorQuarter) events.push({ kind: "competitor" });
  s.trust = clamp(s.trust, 0, 100);
  s.radar = clamp(s.radar, 0, 100);
  s.patience = clamp(s.patience, 0, 100);

  const entry: QuarterLog<Id> = {
    q: s.q,
    picked,
    order: orderId,
    fx: picked.map((id) => ({ card: id, effect: visibleEffect(level, s, id) })),
    churnStart,
    churnEnd: s.churn,
    target,
    gap,
    subs: s.subs,
    mrr: s.mrr,
    patience: s.patience,
    events,
    boss: {
      verdict: gap <= 0 ? "hit" : s.patience < p.lowLine ? "cover" : "missed",
      order: orderId === null ? null : obeyed ? "obeyed" : "refused",
    },
    moodAfter: "firm", // set below, once the next quarter's state is known
  };
  s.log.push(entry);
  s.picks = [];
  if (s.patience < p.fireBelow && s.q < c.targets.length - 1) {
    s.fired = true;
    s.over = true;
  }
  s.q += 1;
  if (s.q >= c.targets.length) s.over = true;
  s.order = s.over ? null : pickOrder(level, s);
  s.callOpen = !s.over;
  if (s.over) s.ending = computeEnding(level, s);
  entry.moodAfter = moodNow(level, s);
  return dealHand(level, s);
}
