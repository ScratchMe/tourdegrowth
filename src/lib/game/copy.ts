/**
 * The game's copy contract — implementation plan §3.4.
 *
 * `LevelCopy` is every string a level shows, in ONE language: what the island
 * receives as a prop. `DeepTranslatable<LevelCopy>` is the same tree with a
 * `Translatable` at every leaf: what `content/game/<level>.ts` exports. The
 * page, a Server Component, turns the second into the first with
 * `resolveLevelCopy` in the language of its URL, so the island never imports
 * `content/game/**` — half the text shipped, and no copy module in the
 * client bundle for the C7 guard to chase.
 *
 * Numbers never live here. The engine journals structured events
 * (`GameEvent`, `VisibleEffect`, `BossLine`), and the island picks the
 * template for each one and fills it with already-formatted values; that is
 * what lets a year in progress switch language and re-render its whole
 * journal (plan R10).
 *
 * Templates carry named `{placeholders}`. Which names a template may use is
 * part of this contract, not a detail of the content file: the island has to
 * supply them, so `LEVEL_COPY_TEMPLATES` below lists them once, and the
 * content test checks every template against it in both languages.
 */
import type { Locale } from "../i18n/locale";
import type { Translatable } from "../i18n/translatable";
import { tc } from "../i18n/translatable";
import type { RetentionCardId, RetentionDarkId } from "./levels/retention";
import type { EndingId } from "./types";

/**
 * Replaces every string of `T` with a `Translatable`, recursively. Booleans
 * and numbers stay what they are (`endings.*.win`), arrays keep their order.
 */
export type DeepTranslatable<T> = T extends string
  ? Translatable
  : T extends boolean | number
    ? T
    : T extends readonly (infer U)[]
      ? readonly DeepTranslatable<U>[]
      : T extends object
        ? { readonly [K in keyof T]: DeepTranslatable<T[K]> }
        : T;

/** A card as the hand shows it: the meeting-room name and one mechanical sentence. */
export interface CardCopy {
  name: string;
  pitch: string;
}

/** What December's catalogue says about one trick. */
export interface PatternCopy {
  /** The name the literature gives it (deceptive.design, CNIL). */
  official: string;
  law: string;
  /** A public case, in the past tense, with a brand from the level's whitelist. */
  cas: string;
  /** One line a subscriber can remember and use to spot it elsewhere. */
  tell: string;
}

export interface EndingCopy {
  eyebrow: string;
  /** Stamped headline of December. */
  title: string;
  /** Template: any of {churn} {subs} {trust} {radar} {patience}. */
  text: string;
  /** Green eyebrow (a win) or alert eyebrow. Kept with the copy because it decides which words fit. */
  win: boolean;
}

/**
 * The level's paper intro and the five zones of the Tour are NOT part of a
 * level's copy: the page renders them on the server from `content/game/meta.ts`
 * (`RETENTION_INTRO`) and `content/game/hub.ts` (`GAME_HUB`). An earlier draft
 * kept a second copy of both here, which nothing rendered and which was
 * already drifting from the one on screen (review R8).
 */
export interface LevelCopy<CardId extends string = string, DarkId extends CardId = CardId, OrderId extends DarkId = DarkId> {
  /** Twelve month names, January first, as they appear inside a sentence. */
  months: readonly string[];
  /** Twelve x-axis initials for the December charts. */
  monthInitials: readonly string[];
  /** "Trimestre {q} · {from} à {to}" — report header and the ringing eyebrow share it. */
  quarterPeriod: string;
  timeline: {
    label: string;
    /** "T{q}". */
    quarter: string;
    /** Four short month ranges, one per quarter. */
    ranges: readonly string[];
    december: string;
    hit: string;
    missed: string;
  };
  dashboard: {
    label: string;
    churn: string;
    churnUnit: string;
    quarterTarget: string;
    boardTarget: string;
    subs: string;
    /** "{month}, fin de mois" — from the first simulated month on; month 0 shows the month name alone. */
    monthEnd: string;
    mrr: string;
    mrrDelta: string;
    patience: string;
    /** Said in words under 35, never by colour alone. */
    patienceLow: string;
    trust: string;
    radar: string;
    notOnDashboard: string;
    /** Screen-reader text in place of a hidden value — the value itself is never in the DOM before December. */
    hiddenValue: string;
    revealed: string;
    /** "{delta} ce trimestre", under a tile after a quarter. */
    delta: string;
  };
  visio: {
    label: string;
    tag: string;
    listen: string;
    hangUp: string;
    hungUp: string;
    ended: string;
    ringing: string;
    pickUp: string;
    reread: string;
  };
  /** The CEO's messages, one per `BossMessageSpec`. `orderWrap` is appended when there is an order. */
  boss: {
    t1: string;
    t2Hit: string;
    t2Miss: string;
    t3Hit: string;
    t3Miss: string;
    t4Hit: string;
    t4Miss: string;
    orderWrap: string;
    yearEnd: string;
    fired: string;
  };
  /** What the CEO asks for, dropped into `boss.orderWrap` as {order}. */
  orders: Readonly<Record<OrderId, string>>;
  hand: {
    title: string;
    count: string;
    /** Badge on the card the CEO asked for. */
    order: string;
    /** Said in words on a picked card, never by colour alone. */
    chosen: string;
    production: string;
    productionEmpty: string;
    run: string;
    hintCallOpen: string;
    hintPick: string;
    hintReady: string;
    /** Where the hand stood, once the year is over: « Année interrompue » (fired) or « Année terminée » (brief §7.2 P9). */
    yearInterrupted: string;
    yearOver: string;
    /** Under that title: the year's review is December, further down (the prototype's `renderHand`). */
    yearClosedHint: string;
  };
  cards: Readonly<Record<CardId, CardCopy>>;
  patterns: Readonly<Record<DarkId, PatternCopy>>;
  /** Flixo's cancellation screen — a drawn app, fictional brand, fictional phone number. */
  phone: {
    caption: string;
    appName: string;
    time: string;
    streakPush: string;
    crumbs: string;
    crumbsBuried: string;
    /** The plan name, shown after `appName` (« Flixo Premium »), as the prototype composes it. */
    plan: string;
    planAnnual: string;
    price: string;
    priceAnnual: string;
    social: string;
    reminder: string;
    number: string;
    call: string;
    pauseButton: string;
    cancelLink: string;
    cancelLinkBuried: string;
    cancelButton: string;
    pauseOffer: string;
    pauseAccept: string;
    pauseDecline: string;
    cascadeOffers: readonly string[];
    stay: string;
    decline: string;
    declineShamed: string;
    confirm: string;
    survey: string;
    surveyAnswers: readonly string[];
    notice: string;
    threeClicks: string;
  };
  /** The pill under the phone. */
  clicks: {
    count: string;
    infinite: string;
    lawSuffix: string;
    phoneSuffix: string;
  };
  report: {
    churn: string;
    target: string;
    subs: string;
    mrr: string;
    patience: string;
    statusHit: string;
    /**
     * « manqué de {gap} ». `{gap}` is `formatPoints` output and carries its
     * own unit (« 0,1 pt », « 0.1 pts »): the template never repeats it, or
     * the report would read « 0,1 pt pt » — and in English « pt » beside the
     * formatter's « pts ».
     */
    statusMissed: string;
    effectsHeading: string;
    effectLine: string;
    mailHeader: string;
    bossLine: string;
    next: string;
    toDecember: string;
  };
  /** The year so far, under the desk — one disclosure per quarter played (plan §2.6). */
  journal: { title: string };
  /** One per `VisibleEffect` kind — `down` splits on `rising`. */
  effects: {
    insight: string;
    presentInsight: string;
    presentBlind: string;
    clean: string;
    extra: string;
    down: string;
    downRising: string;
    up: string;
    none: string;
  };
  /** One per `GameEvent` kind; `midMail` and `present` split on their flag. */
  events: {
    midMailMoving: string;
    midMailStalled: string;
    presentInsight: string;
    presentBlind: string;
    control: string;
    reports: string;
    viral: string;
    press: string;
    competitor: string;
  };
  /** Paper clippings for public events (plan §2.6). Media names are fictional (GAME-BRIEF §8.3). */
  clippings: {
    control: { masthead: string; headline: string };
    reports: { masthead: string; headline: string };
    viral: { handle: string };
    press: { masthead: string; headline: string };
    competitor: { masthead: string; headline: string };
  };
  /** One per `BossLine` value. */
  bossLines: {
    hit: string;
    cover: string;
    missed: string;
    obeyed: string;
    refused: string;
  };
  endings: Readonly<Record<EndingId, EndingCopy>>;
  december: {
    cells: { churn: string; trust: string; radar: string; outOf: string };
    /** Under the cells, and in the level's footer note too (plan §2.7, P19). */
    gameNumbers: string;
    churnChart: { title: string; caption: string; label: string; reference: string };
    trustChart: { title: string; caption: string; label: string; reference: string };
    /**
     * A curve's text equivalent — where it starts, where it ends, and its
     * range — filled with the chart's `label`. The Sparkline contract asks
     * for the TREND, not a description of the picture: « Résiliations
     * mensuelles sur l'année » alone told a screen reader there was a chart
     * and nothing of what it showed.
     */
    trend: string;
    dataToggle: string;
    table: { month: string; churn: string; trust: string };
  };
  playbook: {
    eyebrow: string;
    titleWin: string;
    titleLose: string;
    refused: string;
    trust: string;
    radar: string;
    closing: string;
  };
  catalogue: {
    eyebrow: string;
    title: string;
    lead: string;
    groupUsed: string;
    groupRefused: string;
    groupUnseen: string;
    statusActive: string;
    statusRemoved: string;
    hiddenEffectLabel: string;
    hiddenEffect: string;
    lawLabel: string;
    caseLabel: string;
    tellLabel: string;
  };
  share: {
    replay: string;
    copy: string;
    copied: string;
    text: string;
  };
  nextLevel: { eyebrow: string; title: string; status: string };
  /** Back to the Tour, for readers who arrive through the game (brief 13.3 D). */
  tourLoop: { question: string; cta: string };
  resume: {
    title: string;
    resume: string;
    restart: string;
    previously: string;
    quarterLine: string;
    finished: string;
    review: string;
  };
  footer: { note: string; codeLink: string };
  /** Text only a screen reader hears: one announcement per event, never a burst. */
  a11y: {
    handLabel: string;
    quarterEnd: string;
    resumed: string;
  };
}

/** The CEO only ever asks for these five (GAME-BRIEF §5.10). */
export type RetentionOrderId = Extract<RetentionDarkId, "pdef" | "call" | "bury" | "cascade" | "notice">;

export type RetentionCopy = LevelCopy<RetentionCardId, RetentionDarkId, RetentionOrderId>;

/**
 * Every template, and the placeholders the island supplies for it. A dotted
 * path; `*` stands for any key of a record. A template may use a subset of
 * its names (an ending mentions only what its story needs) but never a name
 * outside the list — the content test fills each template with exactly these
 * names and fails on anything left over.
 */
export const LEVEL_COPY_TEMPLATES: Readonly<Record<string, readonly string[]>> = {
  quarterPeriod: ["q", "from", "to"],
  "timeline.quarter": ["q"],
  "dashboard.quarterTarget": ["target"],
  "dashboard.boardTarget": ["target"],
  "dashboard.monthEnd": ["month"],
  "dashboard.revealed": ["month"],
  "dashboard.mrrDelta": ["delta"],
  "dashboard.delta": ["delta"],
  "boss.t2Hit": ["churn", "target"],
  "boss.t2Miss": ["churn", "target"],
  "boss.t3Hit": ["target"],
  "boss.t3Miss": ["target"],
  "boss.orderWrap": ["order"],
  "hand.title": ["q"],
  "hand.count": ["picked", "max"],
  "hand.production": ["cards"],
  "phone.call": ["number"],
  "clicks.count": ["n"],
  "report.target": ["target"],
  "report.statusMissed": ["gap"],
  "report.effectLine": ["card", "effect"],
  "report.bossLine": ["line"],
  "effects.down": ["pct"],
  "effects.downRising": ["pct"],
  "effects.up": ["pct"],
  "events.control": ["fine", "leavers"],
  "endings.*.text": ["churn", "subs", "trust", "radar", "patience"],
  "december.cells.churn": ["month"],
  "december.cells.outOf": ["value"],
  "december.churnChart.reference": ["target"],
  "december.trend": ["label", "from", "to", "month", "min", "max"],
  "playbook.refused": ["refused", "total"],
  "playbook.trust": ["trust"],
  "playbook.radar": ["radar"],
  "catalogue.hiddenEffect": ["trust", "radar"],
  "share.text": ["title", "churn", "trust", "url"],
  "resume.quarterLine": ["q", "cards", "churn"],
  "resume.finished": ["title"],
  "a11y.quarterEnd": ["q", "churn", "target", "status", "patience"],
  "a11y.resumed": ["q"],
};

function isTranslatable(value: object): value is Translatable {
  const keys = Object.keys(value);
  return (
    keys.length === 2 &&
    typeof (value as Record<string, unknown>).en === "string" &&
    typeof (value as Record<string, unknown>).fr === "string"
  );
}

function resolve(value: unknown, locale: Locale): unknown {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((item) => resolve(item, locale));
  if (isTranslatable(value)) return tc(value, locale);
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, resolve(child, locale)]));
}

/**
 * The bilingual tree, resolved to one language. Server-side and pure: the
 * page calls it with the locale of its URL and hands the result to the
 * island. The type argument is explicit at the call site
 * (`resolveLevelCopy<RetentionCopy>(RETENTION_CONTENT, locale)`) because a
 * conditional type cannot be inferred backwards.
 */
export function resolveLevelCopy<C extends LevelCopy<string, string, string>>(
  content: DeepTranslatable<C>,
  locale: Locale,
): C {
  return resolve(content, locale) as C;
}
