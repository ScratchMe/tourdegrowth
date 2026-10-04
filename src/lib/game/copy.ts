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
import type { AcquisitionCardId, AcquisitionDarkId } from "./levels/acquisition";
import type { ActivationCardId, ActivationDarkId } from "./levels/activation";
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
  /** Template: any of {metric} {customers} {trust} {radar} {patience}. */
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
/**
 * What every level says. A level's phone and the pill under it are its own
 * (Flixo's cancellation screen, Pédalix's path to the basket): each level's
 * copy type adds them to this one, with whatever else only it has.
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
    /** The level's number: « Résiliations » on level 1. */
    metric: string;
    metricUnit: string;
    quarterTarget: string;
    boardTarget: string;
    customers: string;
    /** "{month}, fin de mois" — from the first simulated month on; month 0 shows the month name alone. */
    monthEnd: string;
    revenue: string;
    revenueDelta: string;
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
    /** Badge on the data review the quarter the exit survey's answers unlock it. */
    unlocked: string;
    production: string;
    productionEmpty: string;
    run: string;
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
  report: {
    metric: string;
    target: string;
    customers: string;
    revenue: string;
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
    /**
     * « Pourquoi le churn a bougé » (Antoine, 2026-09-25). `{delta}` is the
     * quarter's whole move, signed, with its unit (`formatDelta`).
     */
    driversHeading: string;
    /** One label per `MetricDrivers` key, in the order the report lists them. */
    drivers: { picks: string; production: string; inspection: string; word: string; market: string };
    /** The line template: « {label} : {delta} ». */
    driverLine: string;
    mailHeader: string;
    bossLine: string;
    next: string;
    toDecember: string;
  };
  /** The year so far, under the desk — one disclosure per quarter played (plan §2.6). */
  journal: { title: string };
  /**
   * One per `VisibleEffect` kind — `gain` splits on `rising`. `extra` (a month
   * billed to every leaver) belongs to the level whose cards can have it:
   * `RetentionCopy` adds it.
   */
  effects: {
    insight: string;
    present: string;
    clean: string;
    gain: string;
    gainRising: string;
    loss: string;
    none: string;
  };
  /** One per `GameEvent` kind; `midMail` splits on its flag. */
  events: {
    midMailMoving: string;
    midMailStalled: string;
    present: string;
    surveyAnswers: string;
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
    /**
     * Why an inspection fell, said where it falls — on the news screen and in
     * the report (Antoine, 2026-09-26: « on ne comprend pas pourquoi ça
     * arrive »). The radar is the dashboard's hidden tile: naming it links
     * the event to a counter the player has been looking at all year without
     * seeing it, and says nothing of its value, which only December reveals.
     */
    why: {
      controlHeading: string;
      controlRadar: string;
      /** `{list}`: the tricks the inspection took down, already quoted and joined (`formatList`). */
      controlRemoved: string;
      /** An inspection with nothing left in production: the radar had not come back down yet. */
      controlNone: string;
      reportsHeading: string;
      reports: string;
    };
  };
  /**
   * The quarter's news, one at a time, over the whole screen (Antoine,
   * 2026-09-26, after La Bataille du budget) — the way a quarter is LEARNED;
   * the report underneath is the way it is re-read.
   */
  news: {
    eyebrow: string;
    /** « {n} sur {total} ». */
    progress: string;
    next: string;
    finish: string;
    skip: string;
    /** The eyebrow over each kind of news. */
    labels: { result: string; mail: string; team: string; outside: string; boss: string };
    /** Stamps: `fine` takes `{fine}`, already formatted. */
    stamps: { fine: string; reports: string; viral: string; press: string };
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
    cells: { metric: string; trust: string; radar: string; outOf: string };
    /** Under the cells, and in the level's footer note too (plan §2.7, P19). */
    gameNumbers: string;
    metricChart: { title: string; caption: string; label: string; reference: string };
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
    table: { month: string; metric: string; trust: string };
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
  /**
   * The block that closes December. Its title is the TARGET level's teaser
   * (`LEVEL_TEASERS`, content/game/hub.ts), not this level's: the level it
   * announces is chosen in the browser (C75), so only the eyebrow and the
   * status are level copy.
   */
  nextLevel: { eyebrow: string; status: string };
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

/** Flixo's cancellation screen — a drawn app, fictional brand, fictional phone number. */
export interface RetentionPhoneCopy {
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
}

/** The pill under Flixo's phone: how many clicks it takes to cancel. */
export interface ClicksCopy {
  count: string;
  infinite: string;
  lawSuffix: string;
  phoneSuffix: string;
}

export type RetentionCopy = LevelCopy<RetentionCardId, RetentionDarkId, RetentionOrderId> & {
  phone: RetentionPhoneCopy;
  clicks: ClicksCopy;
  /** The notice period's month billed to every leaver: only level 1 has a card that does it. */
  effects: { extra: string };
};

/** The CEO only ever asks for these five on level 2 (GAME-BRIEF §17.5). */
export type AcquisitionOrderId = Extract<AcquisitionDarkId, "stock" | "anchor" | "reviews" | "countdown" | "teaser">;

/**
 * Pédalix's app, from the search to the basket (GAME-BRIEF §17.7) — a drawn
 * app, fictional brand, fictional bike, fictional creator and partner brand.
 * Each string is one line the phone shows when the card it belongs to is in
 * production or picked; the phone composes them, the copy never does.
 */
export interface AcquisitionPhoneCopy {
  caption: string;
  appName: string;
  time: string;
  /** `native`: a creator's video, shown with no mention that it is paid. */
  video: string;
  videoBy: string;
  search: string;
  /** The top result: the best-rated model, or — `sponsored` — a partner brand's, unlabelled. */
  resultTop: string;
  resultSponsored: string;
  resultMeta: string;
  /** `compare`. */
  compared: string;
  product: string;
  productKind: string;
  /** `specs`. */
  photos: string;
  price: string;
  /** `anchor`: the struck-through reference price and the discount it implies. */
  priceStruck: string;
  discount: string;
  /** `allin`. */
  priceAllIn: string;
  rating: string;
  /** `reviews`. */
  ratingSorted: string;
  /** `verified`, after whichever rating shows. */
  verified: string;
  /** `countdown`, `stock`, `watchers`: one line each. */
  countdown: string;
  stock: string;
  watchers: string;
  /** `delivery`. */
  delivery: string;
  /** `guides`. */
  guide: string;
  basketTitle: string;
  basketDelivery: string;
  /** `allin`: delivery already in the price. */
  basketDeliveryIncluded: string;
  /** `teaser`. */
  basketFees: string;
  total: string;
  totalWithFees: string;
  /** `origin`, after the order. */
  origin: string;
  originAnswers: readonly string[];
}

/**
 * The pill under Pédalix's phone: what the basket adds to the product page's
 * price (GAME-BRIEF §17.7). A measurable fact the law frames, never a
 * judgement — level 2's « N clics pour résilier ».
 */
export interface BasketPillCopy {
  /** « +{amount} au panier ». `{amount}` arrives formatted, currency included. */
  extra: string;
  /** Nothing more than the page announced. */
  none: string;
  /** `teaser`: mandatory fees outside the displayed price. */
  feesSuffix: string;
}

export type AcquisitionCopy = LevelCopy<AcquisitionCardId, AcquisitionDarkId, AcquisitionOrderId> & {
  phone: AcquisitionPhoneCopy;
  basket: BasketPillCopy;
};

/** The CEO only ever asks for these five on the activation level (GAME-BRIEF §18.5). */
export type ActivationOrderId = Extract<ActivationDarkId, "bundle" | "banner" | "phone" | "prechecked" | "partners">;

/**
 * Quandi's app, from the cookie banner to the first screen (GAME-BRIEF §18.7) —
 * a drawn app, fictional brand. Each string is one line the phone shows when
 * the card it belongs to is in production or picked; the phone composes them,
 * the copy never does. The doc-comment of a field says what shows it.
 */
export interface ActivationPhoneCopy {
  /** Always: the line over the phone. */
  caption: string;
  /** `appBar`. */
  appName: string;
  time: string;
  /** `permissions`: the one sheet that asks for everything, and its single button. */
  permissions: string;
  permissionsAllow: string;
  /** `banner`, plain and equal. */
  bannerText: string;
  /** `banner`, nudged. */
  bannerTextNudged: string;
  /** `banner`, plain: two buttons of the same size. */
  bannerAccept: string;
  bannerContinue: string;
  /** `banner`, nudged and equal. */
  bannerAcceptAll: string;
  /** `banner`, equal. */
  bannerRejectAll: string;
  /** `banner`, nudged and equal. */
  bannerCustomise: string;
  /** `demo`. */
  demo: string;
  /** `signup`: the screen's title, and its button (the same words, on purpose). */
  signupTitle: string;
  /** `signup`, without `minimal`. */
  fields: string;
  /** `signup`, with `minimal`. */
  fieldsMinimal: string;
  /** `signup`, `phone: "required"`. */
  phoneRequired: string;
  /** `signup`, `phone: "optional"`. */
  phoneOptional: string;
  /** `signup`, `prechecked`. */
  prechecked: string;
  /** `signup`, `partners`: small, under the button. */
  partners: string;
  /** `signup`. */
  submit: string;
  /** `analysis`: the line, with its progress bar. */
  analysis: string;
  /** `home`: the empty schedule and its button. */
  homeEmpty: string;
  homeCreate: string;
  /** `home.checklist`, and its close button. */
  checklist: string;
  checklistClose: string;
  /** `home.importer`. */
  importer: string;
  /** `home.tour`: the tooltip that points at `homeCreate`, with no "Skip" and no cross. */
  tour: string;
  /** `push`. */
  push: string;
  /** `welcome`. */
  welcome: string;
  /** `calls`: the offer, then three answers as bullets. */
  calls: string;
  callsAnswers: readonly string[];
}

/**
 * The pill under Quandi's phone: how many clicks it takes to refuse the cookies
 * (GAME-BRIEF §18.7). A measurable fact the CNIL frames, never a judgement —
 * level 1's « N clics pour résilier ».
 */
export interface CookiePillCopy {
  /** « Refuser les cookies : 1 clic ». */
  easy: string;
  /** `banner` without `refuse`: « Refuser les cookies : 3 clics ». */
  hidden: string;
  /** What the law says about it, after `hidden`. */
  lawSuffix: string;
}

export type ActivationCopy = LevelCopy<ActivationCardId, ActivationDarkId, ActivationOrderId> & {
  phone: ActivationPhoneCopy;
  cookies: CookiePillCopy;
};

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
  "dashboard.revenueDelta": ["delta"],
  "dashboard.delta": ["delta"],
  "boss.t2Hit": ["metric", "target"],
  "boss.t2Miss": ["metric", "target"],
  "boss.t3Hit": ["target"],
  "boss.t3Miss": ["target"],
  "boss.orderWrap": ["order"],
  "hand.title": ["q"],
  "hand.count": ["picked", "max"],
  "hand.production": ["cards"],
  "report.target": ["target"],
  "report.statusMissed": ["gap"],
  "report.effectLine": ["card", "effect"],
  "report.driversHeading": ["delta"],
  "report.driverLine": ["label", "delta"],
  "report.bossLine": ["line"],
  "clippings.why.controlRemoved": ["list"],
  "news.progress": ["n", "total"],
  "news.stamps.fine": ["fine"],
  "effects.gain": ["pct"],
  "effects.gainRising": ["pct"],
  "effects.loss": ["pct"],
  "events.control": ["fine", "leavers"],
  "endings.*.text": ["metric", "customers", "trust", "radar", "patience"],
  "december.cells.metric": ["month"],
  "december.cells.outOf": ["value"],
  "december.metricChart.reference": ["target"],
  "december.trend": ["label", "from", "to", "month", "min", "max"],
  "playbook.refused": ["refused", "total"],
  "playbook.trust": ["trust"],
  "playbook.radar": ["radar"],
  "catalogue.hiddenEffect": ["trust", "radar"],
  "share.text": ["title", "metric", "trust", "url"],
  "resume.quarterLine": ["q", "cards", "metric"],
  "resume.finished": ["title"],
  "a11y.quarterEnd": ["q", "metric", "target", "status", "patience"],
  "a11y.resumed": ["q"],
};

/** Level 1's own templates: the phone's number, the clicks pill. */
export const RETENTION_COPY_TEMPLATES: Readonly<Record<string, readonly string[]>> = {
  ...LEVEL_COPY_TEMPLATES,
  "phone.call": ["number"],
  "clicks.count": ["n"],
};

/** Level 2's own templates: the basket pill. */
export const ACQUISITION_COPY_TEMPLATES: Readonly<Record<string, readonly string[]>> = {
  ...LEVEL_COPY_TEMPLATES,
  "basket.extra": ["amount"],
};

/**
 * The activation level has none of its own: its phone and its cookie pill carry
 * no placeholder (the clicks are a sentence of their own, `cookies.easy` and
 * `cookies.hidden`). Declared all the same, so the content test checks the
 * templates every level shares.
 */
export const ACTIVATION_COPY_TEMPLATES: Readonly<Record<string, readonly string[]>> = {
  ...LEVEL_COPY_TEMPLATES,
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
