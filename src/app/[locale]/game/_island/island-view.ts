/**
 * The island's words and numbers, built from the engine's state — pure, and
 * the same for every level (CHANTIERS.md A12.d, 2026-10-01).
 *
 * Every string the level shows arrives in ONE language from the server (the
 * page resolves its level's content for its URL, plan §3.4); every number goes
 * through `lib/game/format.ts`, and the level's own number through the
 * format its display asks for (`metricFormat`: churn to the tenth of a
 * point, new customers to the ten). This module is where the two meet: it
 * picks the template for each structured event the engine journalled and
 * fills it with already-formatted values. Nothing here is React, so the whole
 * mapping is exercised by a unit test on every state of every reference year,
 * of both levels, in both languages — a template left with a raw « {metric} »
 * would be a bug a player reads, and `fill` throws where that test sees it.
 *
 * What only one level has — its phone and the pill under it — is not here:
 * each level brings its own (`sides.tsx`).
 *
 * It never imports `content/**` (C7): the copy is a parameter.
 */
import type { DashboardProps, DashboardSecretTile } from "@/components/game/Dashboard";
import type { CatalogueEntry } from "@/components/game/PatternCatalogue";
import type { PlaybookItem } from "@/components/game/Playbook";
import type { EndingChartCopy, EndingChartRow, EndingChartsProps } from "@/components/game/EndingCharts";
import type { DecemberFigures } from "@/components/game/RevealCells";
import type { EventClippingProps } from "@/components/game/EventClipping";
import type { HandCard } from "@/components/game/Hand";
import type { JournalEntry } from "@/components/game/GameJournal";
import type { QuarterNewsItem } from "@/components/game/QuarterNews";
import type { ReportFigure } from "@/components/game/QuarterReport";
import type { TimelineSegment } from "@/components/game/QuarterTimeline";
import type { StatTileDelta } from "@/components/viz/StatTile";
import type { LevelCopy } from "@/lib/game/copy";
import {
  fill,
  formatDelta,
  formatEur,
  formatInt,
  formatList,
  formatMillions,
  formatSigned,
  metricFormat,
  type DeltaKind,
  type MetricFormat,
} from "@/lib/game/format";
import { bossMessageSpec, handIds } from "@/lib/game/model";
import type { HandHint } from "@/lib/game/phases";
import type { EndingId, GameEvent, GameState, LevelDefinition, ModelSlug, QuarterLog, VisibleEffect } from "@/lib/game/types";
import {
  dashboardView,
  decemberView,
  patternCatalogue,
  playbookCards,
  driverRows,
  reportView,
  type Delta,
} from "@/lib/game/view";
import type { Locale } from "@/lib/i18n/locale";

/**
 * What the island reads of any level's copy: everything but the footer note,
 * which the page renders itself on the server with the intro and the zones —
 * the indexable part of the page, which never needs the browser. `extra` (a
 * month billed to every leaver) exists only on a level whose cards can bill
 * one, level 1's notice period.
 */
export type IslandCopy = Omit<LevelCopy, "footer"> & { effects: LevelCopy["effects"] & { extra?: string } };

/** A level the island can show — a playable one, or a modelled one in a unit test. */
export type IslandLevel = LevelDefinition<string, ModelSlug>;

type Id = string;
type State = GameState<Id>;

export interface IslandContext {
  copy: IslandCopy;
  locale: Locale;
  level: IslandLevel;
  /** How this level prints its own number — derived from `level.display`, once. */
  format: MetricFormat;
}

/** The context for a level, its copy and a language: the one place `format` is derived. */
export function islandContext(level: IslandLevel, copy: IslandCopy, locale: Locale): IslandContext {
  return { copy, locale, level, format: metricFormat(level.display) };
}

// ---------------------------------------------------------------- pieces ---

/** « Trimestre 2 · avril à juin » for a 0-based quarter — the report's heading and the ringing eyebrow share it. */
export function quarterPeriod({ copy, locale }: IslandContext, q: number): string {
  return fill(copy.quarterPeriod, {
    q: formatInt(locale, q + 1),
    from: copy.months[q * 3] ?? "",
    to: copy.months[q * 3 + 2] ?? "",
  });
}

/** A card's name and pitch. A card with no copy is a level shipped half-written: it throws where the tests see it. */
function cardCopy({ copy }: IslandContext, id: Id): { name: string; pitch: string } {
  const card = copy.cards[id];
  if (!card) throw new Error(`island: no copy for card "${id}"`);
  return card;
}

function cardName(ctx: IslandContext, id: Id): string {
  return cardCopy(ctx, id).name;
}

/** « objectif atteint » / « manqué de 0,1 pt » — the verdict in words, never by colour alone. */
function statusText({ copy, locale, format }: IslandContext, log: Pick<QuarterLog, "gap">): { text: string; hit: boolean } {
  if (log.gap <= 0) return { text: copy.report.statusHit, hit: true };
  return { text: fill(copy.report.statusMissed, { gap: format.gap(locale, log.gap) }), hit: false };
}

/**
 * What the CEO says when the call opens (GAME-BRIEF §5.10), from the spec the
 * engine computed. The order, when there is one, is appended in his words.
 */
export function bossMessage(ctx: IslandContext, state: State): string {
  const { copy, locale, format } = ctx;
  const spec = bossMessageSpec(ctx.level, state);
  switch (spec.kind) {
    case "t1":
      return copy.boss.t1;
    case "yearEnd":
      return copy.boss.yearEnd;
    case "fired":
      return copy.boss.fired;
    case "quarter": {
      const vars = { metric: format.value(locale, spec.metricPrev), target: format.value(locale, spec.target) };
      const byQuarter = {
        1: spec.hit ? copy.boss.t2Hit : copy.boss.t2Miss,
        2: spec.hit ? copy.boss.t3Hit : copy.boss.t3Miss,
        3: spec.hit ? copy.boss.t4Hit : copy.boss.t4Miss,
      } as const;
      const line = fill(byQuarter[spec.q], vars);
      if (spec.order === null) return line;
      const order = copy.orders[spec.order];
      if (order === undefined) throw new Error(`bossMessage: no order text for "${spec.order}"`);
      return `${line} ${fill(copy.boss.orderWrap, { order })}`;
    }
  }
}

/** One card's visible effect, in the report's words (§5.12). */
export function effectText({ copy, locale }: IslandContext, effect: VisibleEffect): string {
  switch (effect.kind) {
    case "insight":
      return copy.effects.insight;
    case "present":
      return copy.effects.present;
    case "clean":
      return copy.effects.clean;
    case "extra":
      // Only a level with a card that bills an extra month emits it, and that
      // level's copy has the line (`RetentionCopy`).
      return copy.effects.extra ?? copy.effects.none;
    case "gain":
      return fill(effect.rising ? copy.effects.gainRising : copy.effects.gain, { pct: formatInt(locale, effect.pct) });
    case "loss":
      return fill(copy.effects.loss, { pct: formatInt(locale, effect.pct) });
    case "none":
      return copy.effects.none;
  }
}

/** Any journalled event, as one sentence — the journal lists them all, the report stages them. */
export function eventText({ copy, locale }: IslandContext, event: GameEvent): string {
  switch (event.kind) {
    case "midMail":
      return event.moving ? copy.events.midMailMoving : copy.events.midMailStalled;
    case "present":
      return copy.events.present;
    case "surveyAnswers":
      return copy.events.surveyAnswers;
    case "control":
      return fill(copy.events.control, { fine: formatEur(locale, event.fine), leavers: formatInt(locale, event.leavers) });
    case "reports":
      return copy.events.reports;
    case "viral":
      return copy.events.viral;
    case "press":
      return copy.events.press;
    case "competitor":
      return copy.events.competitor;
  }
}

function bossLine({ copy }: IslandContext, log: QuarterLog<Id>): string {
  const parts = [copy.bossLines[log.boss.verdict], log.boss.order ? copy.bossLines[log.boss.order] : null];
  return fill(copy.report.bossLine, { line: parts.filter(Boolean).join(" ") });
}

// ------------------------------------------------------------- the desk ---

function tileDelta({ copy, locale }: IslandContext, kind: DeltaKind, d: Delta): StatTileDelta {
  return {
    text: fill(copy.dashboard.delta, { delta: formatDelta(locale, kind, 0, d.value) }),
    // The arrow follows the rounded figure (`deltaSign` agrees with the
    // formatter), so a change that prints without a sign draws no arrow.
    direction: d.sentiment === "flat" ? "flat" : d.value > 0 ? "up" : "down",
    sentiment: d.sentiment === "flat" ? undefined : d.sentiment,
  };
}

/**
 * The month the year closed in, as a word: December for a year that ran its
 * course, the month of the firing for one cut short. The reveal and the
 * December cells name it, so a year that ended in June does not say
 * « décembre » (review, 2026-09-25).
 */
export function closingMonth({ copy }: IslandContext, state: State): string {
  const last = state.history.at(-1)?.m ?? 12;
  return copy.months[Math.max(0, Math.min(11, last - 1))] ?? "";
}

function secretTile(
  ctx: IslandContext,
  label: string,
  value: { hidden: true } | { hidden: false; value: number },
  reveal: DashboardReveal,
  month: string,
): DashboardSecretTile {
  const { copy, locale } = ctx;
  if (value.hidden || reveal === "hidden") {
    return { hidden: true, label, hiddenLabel: copy.dashboard.notOnDashboard, hiddenNote: copy.dashboard.hiddenValue };
  }
  return {
    hidden: false,
    label,
    value: formatInt(locale, value.value),
    sub: fill(copy.dashboard.revealed, { month }),
    bar: Math.max(0, Math.min(100, value.value)),
    revealing: reveal === "revealing",
  };
}

/**
 * Whether trust and radar may show, and how: `hidden` until December is on
 * screen, `revealing` the one time it is entered (the unblur plays), `shown`
 * for a finished year reopened. The engine's `over` is not enough on its own:
 * the year is over as soon as the last quarter runs, and its report comes
 * BEFORE December — a report that already printed both counters would spoil
 * the reveal and then unblur a figure the player had already read (brief
 * §5.11: the dashboard unblurs with the December cells).
 */
export type DashboardReveal = "hidden" | "revealing" | "shown";

/**
 * The six tiles. `prev` is the reading the deltas compare against (the start
 * of the last quarter, `lastQuarterStart`); absent while the months scroll
 * and before the first quarter.
 */
export function dashboardProps(ctx: IslandContext, state: State, prev: State | undefined, reveal: DashboardReveal): DashboardProps {
  const { copy, locale, level, format } = ctx;
  const v = dashboardView(level, state, prev);
  const metricValue = format.value(locale, v.metric);
  const target = fill(v.targetScope === "quarter" ? copy.dashboard.quarterTarget : copy.dashboard.boardTarget, {
    target: format.value(locale, v.target),
  });
  const metricLabel = `${copy.dashboard.metric} · ${copy.dashboard.metricUnit}`;
  const month = copy.months[v.monthIndex] ?? "";
  const { chart } = level.display;
  return {
    label: copy.dashboard.label,
    metric: {
      label: metricLabel,
      value: metricValue,
      sub: target,
      delta: v.deltas ? tileDelta(ctx, format.delta, v.deltas.metric) : undefined,
      bullet: {
        value: v.metric,
        target: v.target,
        domain: [chart.min / chart.factor, chart.max / chart.factor],
        // The value and the target, in words: nothing drawn is read.
        ariaLabel: `${copy.dashboard.metric} ${metricValue}, ${target}`,
      },
    },
    customers: {
      label: copy.dashboard.customers,
      value: formatInt(locale, v.customers),
      sub: v.monthEnd ? fill(copy.dashboard.monthEnd, { month }) : month,
      delta: v.deltas ? tileDelta(ctx, "int", v.deltas.customers) : undefined,
    },
    revenue: {
      label: copy.dashboard.revenue,
      value: formatMillions(locale, v.revenue),
      sub:
        v.revenueVsJanuary === null
          ? undefined
          : fill(copy.dashboard.revenueDelta, { delta: formatDelta(locale, "millions", 0, v.revenueVsJanuary) }),
      delta: v.deltas ? tileDelta(ctx, "millions", v.deltas.revenue) : undefined,
    },
    patience: {
      label: copy.dashboard.patience,
      value: formatInt(locale, v.patience),
      sub: v.patienceLow ? copy.dashboard.patienceLow : undefined,
      delta: v.deltas ? tileDelta(ctx, "int", v.deltas.patience) : undefined,
      bar: v.patienceBar,
      low: v.patienceLow,
    },
    trust: secretTile(ctx, copy.dashboard.trust, v.trust, reveal, closingMonth(ctx, state)),
    radar: secretTile(ctx, copy.dashboard.radar, v.radar, reveal, closingMonth(ctx, state)),
  };
}

/** Four quarters and December: done with the number it ended on, current, or to come. */
export function timelineSegments(ctx: IslandContext, state: State): TimelineSegment[] {
  const { copy, locale, format } = ctx;
  const quarters = [0, 1, 2, 3].map((i): TimelineSegment => {
    const log = state.log[i];
    const status = log ? "done" : i === state.q && !state.over ? "current" : "upcoming";
    const verdict = log ? statusText(ctx, log) : null;
    return {
      key: `q${i + 1}`,
      title: fill(copy.timeline.quarter, { q: formatInt(locale, i + 1) }),
      range: copy.timeline.ranges[i],
      status,
      result:
        log && verdict
          ? { value: format.value(locale, log.metricEnd), word: verdict.hit ? copy.timeline.hit : copy.timeline.missed, hit: verdict.hit }
          : undefined,
    };
  });
  return [...quarters, { key: "december", title: copy.timeline.december, status: state.over ? "current" : "upcoming" }];
}

export interface HandView {
  title: string;
  count: string;
  hint: string;
  cards: HandCard[];
  production: string;
  /** Whether « Lancer » does anything: the call hung up, the year running, exactly two cards picked. */
  canRun: boolean;
}

export function handView(ctx: IslandContext, state: State, hint: HandHint): HandView {
  const { copy, locale, level } = ctx;
  const max = level.constants.picksPerQuarter;
  const full = state.picks.length >= max;
  // The quarter the exit survey's answers came in, the data review is new in the hand.
  const unlockedNow = state.log.at(-1)?.events.some((e) => e.kind === "surveyAnswers") ?? false;
  const cards = handIds(level, state).map((id): HandCard => {
    const pressed = state.picks.includes(id);
    const { name, pitch } = cardCopy(ctx, id);
    return {
      id,
      name,
      pitch,
      pressed,
      state: state.callOpen || state.over ? "locked" : full && !pressed ? "unavailable" : "available",
      ordered: id === state.order,
      unlocked: unlockedNow && level.cards[id]!.present === true,
    };
  });
  const active = state.active.map((id) => cardName(ctx, id));
  const hints: Record<HandHint, string> = {
    pick: copy.hand.hintPick,
    ready: copy.hand.hintReady,
  };
  return {
    title: fill(copy.hand.title, { q: formatInt(locale, state.q + 1) }),
    count: fill(copy.hand.count, { picked: formatInt(locale, state.picks.length), max: formatInt(locale, max) }),
    hint: hints[hint],
    cards,
    production: active.length ? fill(copy.hand.production, { cards: active.join(", ") }) : copy.hand.productionEmpty,
    canRun: !state.callOpen && !state.over && state.picks.length === max,
  };
}

// ------------------------------------------------------------ the report ---

export interface ReportContent {
  q: number;
  period: string;
  picked: string[];
  figures: ReportFigure[];
  effectsHeading: string;
  effects: string[];
  notes: string[];
  drivers: { heading: string; lines: string[] };
  mail?: { header: string; body: string };
  clippings: EventClippingProps[];
  bossLine: string;
  mood: QuarterLog["moodAfter"];
  nextLabel: string;
}

/**
 * What an inspection, or the complaints that announce one, mean for the
 * player — said on the clipping itself (Antoine, 2026-09-26: « on ne comprend
 * pas pourquoi ça arrive »). An inspection names the tricks it took down,
 * which are exactly the ones still in production when it fell.
 */
function clippingWhy(ctx: IslandContext, event: GameEvent): EventClippingProps["why"] {
  const { copy, locale } = ctx;
  const why = copy.clippings.why;
  if (event.kind === "reports") return { heading: why.reportsHeading, lines: [why.reports] };
  if (event.kind !== "control") return undefined;
  const names = event.removed.map((id) => cardName(ctx, id));
  return {
    heading: why.controlHeading,
    lines: [why.controlRadar, names.length > 0 ? fill(why.controlRemoved, { list: formatList(locale, names) }) : why.controlNone],
  };
}

function clipping(ctx: IslandContext, event: GameEvent): EventClippingProps | null {
  const { copy } = ctx;
  const text = eventText(ctx, event);
  switch (event.kind) {
    case "viral":
      return { kind: "viral", handle: copy.clippings.viral.handle, text };
    case "control":
    case "reports":
      return { kind: event.kind, ...copy.clippings[event.kind], text, why: clippingWhy(ctx, event) };
    case "press":
    case "competitor":
      return { kind: event.kind, ...copy.clippings[event.kind], text };
    case "midMail":
    case "present":
    case "surveyAnswers":
      return null;
  }
}

/**
 * « Pourquoi le churn a bougé » — the quarter's move split five ways, each
 * line in the tile's own step (a tenth of a point, ten customers), and the
 * lines adding up to the total in the heading (`driverRows`). A save from
 * before model v2 has no drivers: its report says nothing rather than
 * something made up.
 */
function driversContent(ctx: IslandContext, log: QuarterLog<Id>): { heading: string; lines: string[] } {
  const { copy, locale, level, format } = ctx;
  if (!log.drivers) return { heading: "", lines: [] };
  const { total, rows } = driverRows(log, level.display.step);
  return {
    heading: fill(copy.report.driversHeading, { delta: formatDelta(locale, format.delta, 0, total) }),
    lines: rows.map(({ key, value }) =>
      fill(copy.report.driverLine, { label: copy.report.drivers[key], delta: formatDelta(locale, format.delta, 0, value) }),
    ),
  };
}

/** The report of quarter `q` (0-based index into the journal). */
export function reportContent(ctx: IslandContext, state: State, q: number): ReportContent {
  const { copy, locale, level, format } = ctx;
  const log = state.log[q]!;
  const r = reportView(level, log);
  const verdict = statusText(ctx, log);
  const mail = r.events.find((e) => e.kind === "midMail");
  const isLast = state.over && q === state.log.length - 1;
  return {
    q: q + 1,
    period: quarterPeriod(ctx, q),
    picked: r.picked.map((id) => cardName(ctx, id)),
    figures: [
      {
        key: "metric",
        label: copy.report.metric,
        value: format.value(locale, r.metricEnd),
        note: fill(copy.report.target, { target: format.value(locale, r.target) }),
        status: { text: verdict.text, tone: verdict.hit ? "good" : "bad" },
      },
      { key: "customers", label: copy.report.customers, value: formatInt(locale, r.customers) },
      { key: "revenue", label: copy.report.revenue, value: formatMillions(locale, r.revenue) },
      { key: "patience", label: copy.report.patience, value: formatInt(locale, r.patience) },
    ],
    effectsHeading: copy.report.effectsHeading,
    effects: r.fx.map(({ card, effect }) =>
      fill(copy.report.effectLine, { card: cardName(ctx, card), effect: effectText(ctx, effect) }),
    ),
    notes: r.events.filter((e) => e.kind === "present" || e.kind === "surveyAnswers").map((e) => eventText(ctx, e)),
    drivers: driversContent(ctx, log),
    mail: mail ? { header: copy.report.mailHeader, body: eventText(ctx, mail) } : undefined,
    clippings: r.events.map((e) => clipping(ctx, e)).filter((c): c is EventClippingProps => c !== null),
    bossLine: bossLine(ctx, log),
    mood: r.moodAfter,
    nextLabel: isLast ? copy.report.toDecember : copy.report.next,
  };
}

// ------------------------------------------------------------- the news ---

export interface NewsContent {
  q: number;
  eyebrow: string;
  period: string;
  items: QuarterNewsItem[];
  progress: string[];
}

/** The rubber stamp a public event takes on the news screen — none for the competitor's offer, which is weather. */
function newsStamp({ copy, locale }: IslandContext, event: GameEvent): EventClippingProps["stamp"] {
  const stamps = copy.news.stamps;
  switch (event.kind) {
    case "control":
      return { text: fill(stamps.fine, { fine: formatEur(locale, event.fine) }), tone: "bad" };
    case "reports":
      return { text: stamps.reports, tone: "bad" };
    case "viral":
      return { text: stamps.viral, tone: "bad" };
    case "press":
      return { text: stamps.press, tone: "good" };
    default:
      return undefined;
  }
}

/**
 * The quarter's news, in the order it happened (Antoine, 2026-09-26): the
 * CEO's mail from the middle of the quarter, then the verdict at its end,
 * what came back inside the company, what the outside world printed, and the CEO's
 * last word. Built from the SAME pieces as the report (`reportContent`), so
 * the two can never tell the quarter two different ways — the news screen
 * stages it, the report keeps it.
 */
export function newsContent(ctx: IslandContext, state: State, q: number): NewsContent {
  const { copy } = ctx;
  const report = reportContent(ctx, state, q);
  const log = state.log[q]!;
  const labels = copy.news.labels;
  const [metric, ...others] = report.figures;
  const items: QuarterNewsItem[] = [];
  if (report.mail) items.push({ kind: "mail", label: labels.mail, mail: report.mail });
  if (metric) {
    items.push({
      kind: "result",
      label: labels.result,
      metric: metric.label,
      value: metric.value,
      note: metric.note ?? "",
      status: metric.status ?? { text: "", tone: "good" },
      figures: others.map(({ key, label, value }) => ({ key, label, value })),
    });
  }
  for (const text of report.notes) items.push({ kind: "note", label: labels.team, text });
  for (const event of log.events) {
    const c = clipping(ctx, event);
    if (c) items.push({ kind: "clipping", label: labels.outside, clipping: { ...c, stamp: newsStamp(ctx, event) } });
  }
  items.push({ kind: "boss", label: labels.boss, line: report.bossLine, mood: report.mood });
  return {
    q: report.q,
    eyebrow: copy.news.eyebrow,
    period: report.period,
    items,
    progress: items.map((_, i) =>
      fill(copy.news.progress, { n: formatInt(ctx.locale, i + 1), total: formatInt(ctx.locale, items.length) }),
    ),
  };
}

/**
 * What takes the hand's place once the year is over (brief §7.2 P9, the
 * prototype's `renderHand`): the hand does not just vanish — its heading says
 * the year is closed, and whether it ran its course or was cut short, and
 * points down the page to December. There is nothing to run: no card, no
 * « Lancer le trimestre ».
 */
export function yearClosedView({ copy }: IslandContext, state: State): { title: string; hint: string; fired: boolean } {
  return {
    title: state.fired ? copy.hand.yearInterrupted : copy.hand.yearOver,
    hint: copy.hand.yearClosedHint,
    fired: state.fired,
  };
}

/**
 * Every quarter played, in the page's language — the journal is structured,
 * so a language switch re-renders it whole (R10).
 *
 * It is also the only place the LAST quarter's report survives a reload: a
 * year saved after its fourth quarter (or after the firing) reopens straight
 * on December (`settledPhase`), and the report is not shown again. So an
 * entry carries everything that report said except what December's own tiles
 * already show — the picks, the effects, the events, the CEO's line, and the
 * quarter's target next to the verdict, which a « target hit » alone does
 * not give back. `island-view.test.ts` checks the last report against the
 * last entry, field by field.
 */
export function journalEntries(ctx: IslandContext, state: State): JournalEntry[] {
  const { copy, locale, format } = ctx;
  return state.log.map((log, i) => {
    const verdict = statusText(ctx, log);
    const target = fill(copy.report.target, { target: format.value(locale, log.target) });
    return {
      q: i + 1,
      period: quarterPeriod(ctx, i),
      result: { text: `${format.value(locale, log.metricEnd)} · ${target} · ${verdict.text}`, tone: verdict.hit ? "good" : "bad" },
      picked: log.picked.map((id) => cardName(ctx, id)),
      lines: [
        ...log.fx.map(({ card, effect }) =>
          fill(ctx.copy.report.effectLine, { card: cardName(ctx, card), effect: effectText(ctx, effect) }),
        ),
        ...log.events.map((e) => eventText(ctx, e)),
        bossLine(ctx, log),
      ],
    };
  });
}

/** What the single live region says when a report opens (plan §3.5): one sentence, not six tiles. */
export function quarterEndAnnouncement(ctx: IslandContext, state: State, q: number): string {
  const { copy, locale, format } = ctx;
  const log = state.log[q]!;
  return fill(copy.a11y.quarterEnd, {
    q: formatInt(locale, q + 1),
    metric: format.value(locale, log.metricEnd),
    target: format.value(locale, log.target),
    status: statusText(ctx, log).text,
    patience: formatInt(locale, log.patience),
  });
}

// ------------------------------------------------------- resume prompt ---

export interface ResumeContent {
  title: string;
  previously?: { heading: string; lines: string[] };
  accept: string;
  restart: string;
}

/** « Reprendre l'année en cours ? » — or, for a finished year, the sentence that closed it. */
export function resumeContent(ctx: IslandContext, saved: State): ResumeContent {
  const { copy, locale, format } = ctx;
  if (saved.over && saved.ending) {
    return {
      title: fill(copy.resume.finished, { title: copy.endings[saved.ending].title }),
      accept: copy.resume.review,
      restart: copy.share.replay,
    };
  }
  return {
    title: copy.resume.title,
    previously: {
      heading: copy.resume.previously,
      lines: saved.log.map((log) =>
        fill(copy.resume.quarterLine, {
          q: formatInt(locale, log.q + 1),
          cards: log.picked.map((id) => cardName(ctx, id)).join(", "),
          metric: format.value(locale, log.metricEnd),
        }),
      ),
    },
    accept: copy.resume.resume,
    restart: copy.resume.restart,
  };
}

// ------------------------------------------------------------- December ---

export interface DecemberContent {
  ending: EndingId;
  hero: { eyebrow: string; title: string; text: string; win: boolean };
  /** ONE object for the cells and the ends of the curves — the cell's string is the curve's label (R5, X34). */
  figures: DecemberFigures;
  cellLabels: { metric: string; trust: string; radar: string };
  note: string;
  /** The two curves, in EndingCharts' slots. */
  view: EndingChartsProps["view"];
  metricChart: EndingChartCopy;
  trustChart: EndingChartCopy;
  rows: EndingChartRow[];
  playbook: { eyebrow: string; title: string; refused: string; items: PlaybookItem[]; closing: string };
  catalogue: CatalogueEntry[];
}

/** « {label} : 6,0 % le 1er janvier, 4,1 % fin décembre ; au plus bas 4,0 %, au plus haut 6,0 %. » */
function trend(
  { copy }: IslandContext,
  label: string,
  points: readonly { m: number; value: number }[],
  format: (v: number) => string,
): string {
  const values = points.map((p) => p.value);
  const last = points.at(-1)!;
  return fill(copy.december.trend, {
    label,
    from: format(values[0]!),
    to: format(last.value),
    month: copy.months[Math.max(0, last.m - 1)] ?? "",
    min: format(Math.min(...values)),
    max: format(Math.max(...values)),
  });
}

export function decemberContent(ctx: IslandContext, state: State): DecemberContent {
  const { copy, locale, level, format } = ctx;
  const ending = state.ending!;
  const endingCopy = copy.endings[ending];
  const dv = decemberView(level, state);
  const view = { metric: dv.metric, trust: dv.trust };
  const figures: DecemberFigures = {
    metric: format.value(locale, state.metric),
    trust: fill(copy.december.cells.outOf, { value: formatInt(locale, state.trust) }),
    radar: fill(copy.december.cells.outOf, { value: formatInt(locale, state.radar) }),
  };
  const metricPoints = state.history.map((h) => ({ m: h.m, value: h.metric }));
  const trustPoints = state.history.map((h) => ({ m: h.m, value: h.trust }));
  const value = (v: number) => format.value(locale, v);
  const int = (v: number) => formatInt(locale, v);
  const card = (id: Id) => level.cards[id]!;
  const { factor } = level.display.chart;

  return {
    ending,
    hero: {
      eyebrow: endingCopy.eyebrow,
      title: endingCopy.title,
      text: fill(endingCopy.text, {
        metric: figures.metric,
        customers: formatInt(locale, state.customers),
        trust: formatInt(locale, state.trust),
        radar: formatInt(locale, state.radar),
        patience: formatInt(locale, state.patience),
      }),
      win: endingCopy.win,
    },
    figures,
    // The three labels, not the whole `cells` block: its `outOf` is a template
    // the figures above already went through, never something to print.
    cellLabels: {
      metric: fill(copy.december.cells.metric, { month: closingMonth(ctx, state) }),
      trust: copy.december.cells.trust,
      radar: copy.december.cells.radar,
    },
    note: copy.december.gameNumbers,
    view,
    metricChart: {
      title: copy.december.metricChart.title,
      caption: copy.december.metricChart.caption,
      ariaLabel: trend(ctx, copy.december.metricChart.label, metricPoints, value),
      reference: fill(copy.december.metricChart.reference, { target: format.value(locale, view.metric.reference / factor) }),
      ticks: view.metric.scale.ticks.map((t) => format.tick(locale, t)),
    },
    trustChart: {
      title: copy.december.trustChart.title,
      caption: copy.december.trustChart.caption,
      ariaLabel: trend(ctx, copy.december.trustChart.label, trustPoints, int),
      reference: copy.december.trustChart.reference,
      ticks: view.trust.scale.ticks.map((t) => formatInt(locale, t)),
    },
    rows: state.history
      .filter((h) => h.m >= 1)
      .map((h) => ({ id: String(h.m), month: copy.months[h.m - 1] ?? "", metric: value(h.metric), trust: int(h.trust) })),
    playbook: {
      eyebrow: copy.playbook.eyebrow,
      title: endingCopy.win ? copy.playbook.titleWin : copy.playbook.titleLose,
      refused: fill(copy.playbook.refused, {
        refused: formatInt(locale, state.refused.length),
        total: formatInt(locale, state.orders.length),
      }),
      items: playbookCards(level, state).map((id) => ({
        id,
        name: cardName(ctx, id),
        effects: [
          card(id).trust ? fill(copy.playbook.trust, { trust: formatSigned(locale, card(id).trust!) }) : null,
          card(id).radar ? fill(copy.playbook.radar, { radar: formatSigned(locale, card(id).radar!) }) : null,
        ].filter((x): x is string => x !== null),
      })),
      closing: copy.playbook.closing,
    },
    catalogue: patternCatalogue(level, state).map(({ id, group, status }) => {
      const pattern = copy.patterns[id];
      if (!pattern) throw new Error(`decemberContent: no catalogue entry for "${id}"`);
      return {
        id,
        group,
        official: pattern.official,
        meeting: cardName(ctx, id),
        status: status
          ? { label: status === "removed" ? copy.catalogue.statusRemoved : copy.catalogue.statusActive, removed: status === "removed" }
          : null,
        hiddenEffect: fill(copy.catalogue.hiddenEffect, {
          trust: formatSigned(locale, card(id).trust ?? 0),
          radar: formatSigned(locale, card(id).radar ?? 0),
        }),
        law: pattern.law,
        cas: pattern.cas,
        tell: pattern.tell,
      };
    }),
  };
}

/** The copied sentence: the ending's title, the two figures, and the page in the reader's language (P18). */
export function shareText(ctx: IslandContext, state: State, url: string): string {
  const { copy, locale, format } = ctx;
  return fill(copy.share.text, {
    title: copy.endings[state.ending!].title,
    metric: format.value(locale, state.metric),
    trust: fill(copy.december.cells.outOf, { value: formatInt(locale, state.trust) }),
    url,
  });
}
