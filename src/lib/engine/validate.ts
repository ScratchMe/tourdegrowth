import { ALL_LEVER_IDS, ALL_METRIC_SHAPES, TEXT_LIMITS, shapeOf, type MetricShape } from "./catalog-shape";
import { SHARED_COUNT_IDS, WHOLE_SHARED_COUNTS } from "./shared-counts";
import { BASIS_KEY, CAUSE_KEY, REPAIR_KEY, ROLE_KEY, STATUS_KEY } from "./strings";
import {
  DECK_THEMES,
  ENGINE_SCHEMA_VERSION,
  MAX_MONTHS,
  SLIDE_ORDER,
  YEAR_MONTH_PATTERN,
  type Currency,
  type EngineDeck,
  type EngineSetup,
  type EngineState,
  type MetricEntry,
  type MetricId,
  type SlideId,
  type ToolId,
  type YearMonth,
} from "./types";

/**
 * validate.ts — the one place the engine's data RULES are applied (engine
 * spec §4.1, §4.3).
 *
 * Two jobs, the same two as `lib/audit/validate.ts`. A `.json` dropped on the
 * import screen is untrusted input, so everything here reads `unknown` and
 * never throws. And the rules a form can bypass live here and nowhere else:
 * an estimate carries its basis and `low ≤ high`, a missing number carries
 * its cause AND its repair cost, `not-applicable` carries a reason from the
 * metric's closed list, a bounded ratio never has more on top than below.
 * Each of those is what keeps an unknown from being read as a zero further
 * down the pipeline.
 *
 * **Lenient about leftovers, strict about what the status needs.** An entry
 * switched from `measured` to `missing` may still carry its old `value`; the
 * pure engine reads a field only under the status that owns it, so a leftover
 * is inert and refusing it would make a half-edited file unopenable for
 * nothing. What IS refused is a status without the fields that make it true.
 *
 * Errors are paths plus a short technical reason (`snapshots[0].metrics.acq.cac.estimate: low > high`),
 * the same form in both languages: they name the file's own keys, which the
 * user can find in the `.json`, and they are shown under the import screen's
 * localised `io.warnings` heading rather than as sentences.
 *
 * Text limits are counted in UTF-16 code units (`String#length`), the unit a
 * browser's `maxLength` counts in: anything an input with
 * `maxLength={TEXT_LIMITS.x}` accepts must pass here, or a user could type a
 * value the importer then flags.
 */

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === "string";
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const isBool = (v: unknown): v is boolean => typeof v === "boolean";
const oneOf = (list: readonly string[], v: unknown): v is string => isStr(v) && list.includes(v);
const isIso = (v: unknown): v is string => isStr(v) && v !== "" && !Number.isNaN(Date.parse(v));
const isYearMonth = (v: unknown): v is YearMonth => isStr(v) && YEAR_MONTH_PATTERN.test(v);

/*
 * The closed vocabularies, read off the key maps `strings.ts` already makes
 * exhaustive (`Record<MetricStatus, …>` and friends): a status added to the
 * types without a copy key is a compile error there, so reading the keys
 * here cannot fall behind.
 */
const STATUSES = Object.keys(STATUS_KEY);
const CAUSES = Object.keys(CAUSE_KEY);
const REPAIRS = Object.keys(REPAIR_KEY);
const BASES = Object.keys(BASIS_KEY);
const ROLES = Object.keys(ROLE_KEY);

/** `satisfies` makes a tool added to `ToolId` a compile error here, not a silently refused file. */
const TOOL_SET = {
  ga4: true,
  mixpanel: true,
  amplitude: true,
  posthog: true,
  stripe: true,
  chargebee: true,
  chartmogul: true,
  hubspot: true,
  salesforce: true,
  "google-ads": true,
  "meta-ads": true,
  "linkedin-ads": true,
  "app-store-connect": true,
  "play-console": true,
  "product-db": true,
  spreadsheet: true,
  pipedrive: true,
  "cs-platform": true,
} as const satisfies Record<ToolId, true>;
const TOOLS = Object.keys(TOOL_SET);

const CURRENCY_SET = { EUR: true, USD: true, GBP: true, CHF: true } as const satisfies Record<Currency, true>;

/** The slides outside `SLIDE_ORDER` and the what-ifs: the self-serve « scenario », the hybrid's « total », the sales-assisted ones. */
const EXTRA_SLIDES = ["scenario", "total", "slg:peloton", "slg:leak", "slg:scenario"] as const satisfies readonly SlideId[];
const CURRENCIES = Object.keys(CURRENCY_SET);

/*
 * Every number of every catalogue, whichever motions are ticked (§18.3.3):
 * unticking a motion keeps its numbers on the device and in the file
 * (§18.1.2), so a file may carry them with the motion off.
 */
const METRIC_IDS: readonly string[] = ALL_METRIC_SHAPES.map((s) => s.id);
const SHAPE_BY_ID = new Map<string, MetricShape>(ALL_METRIC_SHAPES.map((s) => [s.id, s]));

/** The only numbers the company-wide margin may stand in for (C25 Q4). */
const MARGINS: readonly string[] = ["rev.gross-margin", "slg.rev.gross-margin"];

function tooLong(path: string, value: unknown, limit: number, errors: string[]): void {
  if (value === undefined) return;
  if (!isStr(value)) errors.push(`${path}: not a string`);
  else if (value.length > limit) errors.push(`${path}: longer than ${limit} characters`);
}

function checkSource(path: string, source: unknown, errors: string[]): void {
  if (!isObj(source)) return void errors.push(`${path}: missing`);
  if (source.kind === "tool") {
    if (!oneOf(TOOLS, source.tool)) errors.push(`${path}.tool: unknown tool`);
  } else if (source.kind === "person") {
    if (!oneOf(ROLES, source.role)) errors.push(`${path}.role: unknown role`);
  } else if (source.kind !== "other") {
    errors.push(`${path}.kind: unknown source kind`);
  }
}

/** A value of one of the kinds the metric accepts, and within the bounds its unit allows. */
function checkValue(path: string, value: unknown, shape: MetricShape, errors: string[]): void {
  if (!isObj(value)) return void errors.push(`${path}: missing`);
  if (!oneOf(shape.valueKinds, value.kind)) return void errors.push(`${path}.kind: not accepted by ${shape.id}`);
  switch (value.kind) {
    case "ratio": {
      const { numerator: n, denominator: d } = value;
      if (!isNum(n) || n < 0) errors.push(`${path}.numerator: not a number ≥ 0`);
      // A zero denominator is not a rate of zero, it is no rate at all: refused rather than divided.
      if (!isNum(d) || d <= 0) errors.push(`${path}.denominator: not a number > 0`);
      // The one check that BLOCKS (sanity `num-gt-den`, D11): 120 activated out of 100 sign-ups is a typo, not a finding.
      if (shape.bounded && isNum(n) && isNum(d) && n > d) errors.push(`${path}: numerator > denominator`);
      break;
    }
    case "rate":
      // Above 100 is refused for a BOUNDED number only (§18.3.3): a 106 % NRR or an expansion wave is real.
      if (!isNum(value.percent) || value.percent < 0) errors.push(`${path}.percent: not a number ≥ 0`);
      else if (shape.bounded && value.percent > 100) errors.push(`${path}.percent: not within 0-100`);
      break;
    case "amount":
      if (!isNum(value.amount) || value.amount < 0) errors.push(`${path}.amount: not a number ≥ 0`);
      break;
    case "duration":
      if (!isNum(value.value) || value.value < 0) errors.push(`${path}.value: not a number ≥ 0`);
      if (!oneOf(["hours", "days"], value.unit)) errors.push(`${path}.unit: not hours or days`);
      if (!oneOf(["median", "mean"], value.statistic)) errors.push(`${path}.statistic: not median or mean`);
      break;
    case "text":
      if (!isStr(value.text) || value.text.trim() === "") errors.push(`${path}.text: empty`);
      else tooLong(`${path}.text`, value.text, TEXT_LIMITS.value, errors);
      break;
    case "choice":
      if (!oneOf(shape.choices ?? [], value.choice)) errors.push(`${path}.choice: not in ${shape.id}'s list`);
      break;
  }
}

/** Rules of one entry against its catalogue shape. */
export function validateEntry(entry: MetricEntry, shape: MetricShape): string[] {
  return entryErrors(shape.id, entry, shape);
}

function entryErrors(path: string, entry: unknown, shape: MetricShape): string[] {
  const errors: string[] = [];
  if (!isObj(entry)) return [`${path}: not an object`];
  if (!oneOf(STATUSES, entry.status)) errors.push(`${path}.status: unknown status`);
  if (!isIso(entry.updatedAt)) errors.push(`${path}.updatedAt: not a date`);

  switch (entry.status) {
    case "measured":
      checkValue(`${path}.value`, entry.value, shape, errors);
      checkSource(`${path}.source`, entry.source, errors);
      // §19.5.3: a rate in counts whose denominator comes from another tool. Absent = the same source.
      if (entry.denominatorSource !== undefined) checkSource(`${path}.denominatorSource`, entry.denominatorSource, errors);
      break;
    case "estimated": {
      const e = entry.estimate;
      if (!isObj(e)) {
        errors.push(`${path}.estimate: missing`);
        break;
      }
      if (!isNum(e.low) || !isNum(e.high)) errors.push(`${path}.estimate: bounds not numbers`);
      else if (e.low > e.high) errors.push(`${path}.estimate: low > high`);
      else if (e.low < 0) errors.push(`${path}.estimate: below 0`);
      else if (shape.unit === "percent" && shape.bounded && e.high > 100) errors.push(`${path}.estimate: above 100`);
      // A range without its basis is an opinion that reads as a measure: the basis is what the slide prints next to it.
      if (!oneOf(BASES, e.basis)) errors.push(`${path}.estimate.basis: missing or unknown`);
      // The company-wide margin stands in for a MOTION's margin, and for nothing else (C25 Q4).
      else if (e.basis === "company-wide" && !MARGINS.includes(shape.id)) errors.push(`${path}.estimate.basis: company-wide is for a gross margin only`);
      break;
    }
    case "conflicting": {
      const c = entry.conflict;
      if (!isObj(c)) {
        errors.push(`${path}.conflict: missing`);
        break;
      }
      for (const side of ["a", "b"] as const) {
        const reading = c[side];
        if (!isObj(reading)) {
          errors.push(`${path}.conflict.${side}: missing`);
          continue;
        }
        checkValue(`${path}.conflict.${side}.value`, reading.value, shape, errors);
        checkSource(`${path}.conflict.${side}.source`, reading.source, errors);
      }
      break;
    }
    case "requested":
      if (!isObj(entry.request)) errors.push(`${path}.request: missing`);
      break;
    case "missing": {
      const m = entry.missing;
      if (!isObj(m)) {
        errors.push(`${path}.missing: missing`);
        break;
      }
      // Cause AND repair cost: an absence without them is a blank, not a finding.
      if (!oneOf(CAUSES, m.cause)) errors.push(`${path}.missing.cause: missing or unknown`);
      if (!oneOf(REPAIRS, m.repair)) errors.push(`${path}.missing.repair: missing or unknown`);
      tooLong(`${path}.missing.repairComment`, m.repairComment, TEXT_LIMITS.repairComment, errors);
      if (m.ownerRole !== undefined && !oneOf(ROLES, m.ownerRole)) errors.push(`${path}.missing.ownerRole: unknown role`);
      break;
    }
    case "not-applicable":
      // The only status that moves the coverage denominator, so its reason is a closed list, never free text.
      if (!oneOf(shape.naReasons ?? [], entry.naReason)) errors.push(`${path}.naReason: not in ${shape.id}'s list`);
      break;
  }

  if (entry.request !== undefined) {
    const r = entry.request;
    if (!isObj(r)) errors.push(`${path}.request: not an object`);
    else {
      if (!oneOf(ROLES, r.role)) errors.push(`${path}.request.role: unknown role`);
      if (!isIso(r.requestedAt)) errors.push(`${path}.request.requestedAt: not a date`);
      if (r.remindedAt !== undefined && !isIso(r.remindedAt)) errors.push(`${path}.request.remindedAt: not a date`);
    }
  }
  if (entry.variant !== undefined && !oneOf(shape.variants ?? [], entry.variant)) errors.push(`${path}.variant: not in ${shape.id}'s list`);
  if (entry.evidence !== undefined && !oneOf(["data", "interviews", "hunch"], entry.evidence)) errors.push(`${path}.evidence: unknown`);
  if (entry.cohortMonth !== undefined && !isYearMonth(entry.cohortMonth)) errors.push(`${path}.cohortMonth: not YYYY-MM`);
  tooLong(`${path}.label`, entry.label, TEXT_LIMITS.label, errors);
  tooLong(`${path}.definitionNote`, entry.definitionNote, TEXT_LIMITS.definitionNote, errors);
  tooLong(`${path}.note`, entry.note, TEXT_LIMITS.note, errors);
  return errors;
}

function setupErrors(setup: unknown): string[] {
  if (!isObj(setup)) return ["setup: missing"];
  const errors: string[] = [];
  // Decision 3 (§18.1): the type, then how it sells — at least one motion, the hybrid being both.
  if (setup.type !== "b2b-saas") errors.push("setup.type: unknown type");
  const motions = setup.motions;
  if (!isObj(motions) || !isBool(motions.plg) || !isBool(motions.slg)) errors.push("setup.motions: not two booleans (plg, slg)");
  else if (!motions.plg && !motions.slg) errors.push("setup.motions: none ticked");
  if (!oneOf(CURRENCIES, setup.currency)) errors.push("setup.currency: unknown currency");
  if (![7, 14, 30].includes(setup.activationWindowDays as number)) errors.push("setup.activationWindowDays: not 7, 14 or 30");
  if (![30, 60, 90].includes(setup.paidWindowDays as number)) errors.push("setup.paidWindowDays: not 30, 60 or 90");
  if (![30, 60, 90].includes(setup.qualificationWindowDays as number)) errors.push("setup.qualificationWindowDays: not 30, 60 or 90");
  if (![30, 60, 90].includes(setup.goLiveWindowDays as number)) errors.push("setup.goLiveWindowDays: not 30, 60 or 90");
  tooLong("setup.companyLabel", setup.companyLabel, TEXT_LIMITS.companyLabel, errors);
  // §19.5, C32 Q9: optional, and empty means « not said ».
  if (setup.tools !== undefined) {
    if (!Array.isArray(setup.tools)) errors.push("setup.tools: not a list");
    else {
      setup.tools.forEach((t, i) => {
        if (!oneOf(TOOLS, t)) errors.push(`setup.tools[${i}]: unknown tool`);
      });
      if (new Set(setup.tools).size !== setup.tools.length) errors.push("setup.tools: a tool listed twice");
    }
  }
  // §19.4, C32 Q8: optional, both numbers optional, and both positive when present.
  if (setup.pipeline !== undefined) {
    const p = setup.pipeline;
    if (!isObj(p)) errors.push("setup.pipeline: not an object");
    else {
      if (p.quarterTarget !== undefined && (!isNum(p.quarterTarget) || p.quarterTarget <= 0)) errors.push("setup.pipeline.quarterTarget: not a number > 0");
      if (p.threshold !== undefined && (!isNum(p.threshold) || p.threshold <= 0)) errors.push("setup.pipeline.threshold: not a number > 0");
    }
  }
  return errors;
}

function snapshotErrors(path: string, snapshot: unknown): string[] {
  if (!isObj(snapshot)) return [`${path}: not an object`];
  const errors: string[] = [];
  if (!isStr(snapshot.id) || snapshot.id === "") errors.push(`${path}.id: missing`);
  if (!isYearMonth(snapshot.referenceMonth)) errors.push(`${path}.referenceMonth: not YYYY-MM`);
  if (!isYearMonth(snapshot.cohortMonth)) errors.push(`${path}.cohortMonth: not YYYY-MM`);
  if (!isIso(snapshot.createdAt)) errors.push(`${path}.createdAt: not a date`);
  // §19.2.3: set on a month when the next one starts.
  if (snapshot.closedAt !== undefined && !isIso(snapshot.closedAt)) errors.push(`${path}.closedAt: not a date`);
  if (snapshot.windows !== undefined) {
    const w = snapshot.windows;
    if (
      !isObj(w) ||
      ![7, 14, 30].includes(w.activationWindowDays as number) ||
      ![30, 60, 90].includes(w.paidWindowDays as number) ||
      ![30, 60, 90].includes(w.qualificationWindowDays as number) ||
      ![30, 60, 90].includes(w.goLiveWindowDays as number)
    )
      errors.push(`${path}.windows: not the four windows of a setup`);
  }
  if (snapshot.pipelineOpen !== undefined && (!isNum(snapshot.pipelineOpen) || snapshot.pipelineOpen < 0)) errors.push(`${path}.pipelineOpen: not a number >= 0`);

  if (!isObj(snapshot.metrics)) errors.push(`${path}.metrics: missing`);
  else
    for (const [id, entry] of Object.entries(snapshot.metrics)) {
      const shape = SHAPE_BY_ID.get(id);
      if (!shape) errors.push(`${path}.metrics.${id}: unknown metric`);
      else errors.push(...entryErrors(`${path}.metrics.${id}`, entry, shape));
    }

  if (!isObj(snapshot.targets)) errors.push(`${path}.targets: missing`);
  else
    for (const [id, target] of Object.entries(snapshot.targets)) {
      if (!METRIC_IDS.includes(id)) errors.push(`${path}.targets.${id}: unknown metric`);
      else if (!isNum(target)) errors.push(`${path}.targets.${id}: not a number`);
    }

  // Optional (2026-09-25): absent in every file written before the shared base existed.
  if (snapshot.base !== undefined) {
    if (!isObj(snapshot.base)) errors.push(`${path}.base: not an object`);
    else
      for (const [key, n] of Object.entries(snapshot.base)) {
        if (!(SHARED_COUNT_IDS as readonly string[]).includes(key)) errors.push(`${path}.base.${key}: unknown count`);
        // People, deals and opportunities are whole; an MRR (2026-09-26) is an amount and may carry cents.
        else if (!isNum(n) || n <= 0) errors.push(`${path}.base.${key}: not a number > 0`);
        else if ((WHOLE_SHARED_COUNTS as readonly string[]).includes(key) && !Number.isInteger(n)) errors.push(`${path}.base.${key}: not a whole number > 0`);
      }
  }
  return errors;
}

function deckErrors(deck: unknown): string[] {
  if (!isObj(deck)) return ["deck: missing"];
  const errors: string[] = [];
  if (!isObj(deck.include)) errors.push("deck.include: missing");
  else
    for (const [id, on] of Object.entries(deck.include)) {
      // The fixed slides, the what-if ones (2026-09-26: « scenario » and one « whatif:<lever> » per lever),
      // the hybrid's « total » and the sales-assisted slides (§18.8.1).
      const known =
        (SLIDE_ORDER as readonly string[]).includes(id) ||
        (EXTRA_SLIDES as readonly string[]).includes(id) ||
        (id.startsWith("whatif:") && (ALL_LEVER_IDS as readonly string[]).includes(id.slice("whatif:".length)));
      if (!known) errors.push(`deck.include.${id}: unknown slide`);
      else if (!isBool(on)) errors.push(`deck.include.${id}: not a boolean`);
    }
  if (!isBool(deck.showCompany)) errors.push("deck.showCompany: not a boolean");
  if (!isBool(deck.showSiteCredit)) errors.push("deck.showSiteCredit: not a boolean");
  // §19.8, C32 Q14: optional, "paper" when absent.
  if (deck.theme !== undefined && !oneOf(DECK_THEMES, deck.theme)) errors.push("deck.theme: not paper or white");

  const ask = deck.ask;
  if (!isObj(ask)) return [...errors, "deck.ask: missing"];
  if (!isStr(ask.what)) errors.push("deck.ask.what: not a string");
  else tooLong("deck.ask.what", ask.what, TEXT_LIMITS.askWhat, errors);
  if (!Array.isArray(ask.bullets)) errors.push("deck.ask.bullets: not a list");
  else {
    if (ask.bullets.length > TEXT_LIMITS.askBullets) errors.push(`deck.ask.bullets: more than ${TEXT_LIMITS.askBullets}`);
    ask.bullets.forEach((b, i) => tooLong(`deck.ask.bullets[${i}]`, b, TEXT_LIMITS.askBullet, errors));
  }
  if (!Array.isArray(ask.measureFirst)) errors.push("deck.ask.measureFirst: not a list");
  else {
    if (ask.measureFirst.length > TEXT_LIMITS.askMeasureFirst) errors.push(`deck.ask.measureFirst: more than ${TEXT_LIMITS.askMeasureFirst}`);
    ask.measureFirst.forEach((id, i) => {
      if (!oneOf(METRIC_IDS, id)) errors.push(`deck.ask.measureFirst[${i}]: unknown metric`);
    });
  }
  if (ask.cost !== undefined) {
    const c = ask.cost;
    const ok =
      isObj(c) &&
      ((c.kind === "money" && isNum(c.amount) && c.amount >= 0) ||
        (c.kind === "team" && isNum(c.weeks) && c.weeks > 0 && isNum(c.people) && c.people > 0));
    if (!ok) errors.push("deck.ask.cost: not a money amount or a team size");
  }
  if (ask.horizon !== undefined) {
    const h = ask.horizon;
    if (!isObj(h) || !Number.isInteger(h.year) || ![1, 2, 3, 4].includes(h.quarter as number)) errors.push("deck.ask.horizon: not a year and quarter");
  }
  if (ask.successMetric !== undefined && !oneOf(METRIC_IDS, ask.successMetric)) errors.push("deck.ask.successMetric: unknown metric");
  if (ask.successTarget !== undefined && !isNum(ask.successTarget)) errors.push("deck.ask.successTarget: not a number");
  return errors;
}

/**
 * Every rule of a whole state. Typed `EngineState` for the island, but read as
 * `unknown` inside: `parseEngineFile` hands it whatever a file contained.
 */
export function validateEngine(state: EngineState): string[] {
  const s: unknown = state;
  if (!isObj(s)) return ["state: not an object"];
  const errors: string[] = [];
  if (s.schemaVersion !== ENGINE_SCHEMA_VERSION) errors.push(`schemaVersion: not ${ENGINE_SCHEMA_VERSION}`);
  if (!isStr(s.id) || s.id === "") errors.push("id: missing");
  if (!isIso(s.createdAt)) errors.push("createdAt: not a date");
  if (!isIso(s.updatedAt)) errors.push("updatedAt: not a date");
  if (s.lastExportedAt !== undefined && !isIso(s.lastExportedAt)) errors.push("lastExportedAt: not a date");
  errors.push(...setupErrors(s.setup));

  // One month per snapshot, oldest first (§19.2, §19.1.6): an EMPTY list is wrong — there would be nothing to read —
  // and so are two snapshots of the same month, months out of order, more than MAX_MONTHS, or a month before
  // the last that was never closed.
  if (!Array.isArray(s.snapshots) || s.snapshots.length === 0) errors.push("snapshots: empty");
  else {
    s.snapshots.forEach((snap, i) => errors.push(...snapshotErrors(`snapshots[${i}]`, snap)));
    if (s.snapshots.length > MAX_MONTHS) errors.push(`snapshots: more than ${MAX_MONTHS} months`);
    const months: unknown[] = s.snapshots;
    months.forEach((snap, i) => {
      if (i === 0 || !isObj(snap)) return;
      const before = months[i - 1];
      if (isObj(before) && isYearMonth(before.referenceMonth) && isYearMonth(snap.referenceMonth) && snap.referenceMonth <= before.referenceMonth)
        errors.push(`snapshots[${i}].referenceMonth: not after the month before`);
      if (isObj(before) && before.closedAt === undefined) errors.push(`snapshots[${i - 1}].closedAt: missing on a month that is not the last`);
    });
  }

  if (s.tourLink !== null) {
    const t = s.tourLink;
    if (!isObj(t) || !isStr(t.resultId) || t.resultId === "" || !isIso(t.linkedAt)) errors.push("tourLink: not a result id and a date");
  }
  errors.push(...deckErrors(s.deck));

  // Optional (2026-09-26): absent in every file written before « Et si ? » kept its levers.
  if (s.whatIf !== undefined) {
    if (!isObj(s.whatIf)) errors.push("whatIf: not an object");
    else
      for (const [id, target] of Object.entries(s.whatIf)) {
        if (!(ALL_LEVER_IDS as readonly string[]).includes(id)) errors.push(`whatIf.${id}: unknown lever`);
        else if (!isNum(target) || target < 0) errors.push(`whatIf.${id}: not a number >= 0`);
        // The link's lever is a count of opportunities per quarter, never a percent (C25 Q7).
        else if (id === "link.pql-handoff" && !Number.isInteger(target)) errors.push(`whatIf.${id}: not a whole number`);
        else if (id !== "link.pql-handoff" && shapeOf(id as MetricId).unit === "percent" && target > 100 && shapeOf(id as MetricId).bounded)
          errors.push(`whatIf.${id}: above 100`);
      }
  }
  return errors;
}

/**
 * The deck settings a new engine starts with — §9.2's "include" column. Every
 * slide on except `mirror`: the Tour is a self-assessment, shown only when the
 * gap IS the argument (D13, decision 4 of 2026-09-24). The site credit is on
 * and removable (decision 2). `showCompany` is on: it only prints when a
 * company label exists, which is exactly the spec's "true when set".
 */
export function defaultDeck(): EngineDeck {
  return {
    include: { peloton: true, leak: true, visibility: true, "unit-economics": true, mirror: false, ask: true, annex: true },
    showCompany: true,
    showSiteCredit: true,
    ask: { what: "", bullets: [], measureFirst: [] },
  };
}

/**
 * A fresh engine: one empty snapshot (every metric absent = "todo" — nobody
 * has looked yet, which is never the same as missing), no targets, no Tour.
 *
 * `months` is what the setup screen (E1) chose. Its fallback is §E1's own
 * defaults — the flows' last closed month, and the latest cohort that has had
 * its 30 days — computed here so this module stays usable before P1's
 * `cohort.ts#defaultMonths` exists; the island should pass the months it showed.
 */
export function newEngineState(
  setup: EngineSetup,
  nowIso: string,
  months?: { referenceMonth: YearMonth; cohortMonth: YearMonth },
  id: () => string = () => globalThis.crypto.randomUUID(),
): EngineState {
  const chosen = months ?? fallbackMonths(new Date(nowIso));
  return {
    schemaVersion: ENGINE_SCHEMA_VERSION,
    id: id(),
    createdAt: nowIso,
    updatedAt: nowIso,
    // A copy: the setup screen keeps editing its own object, and the state must not change under it.
    setup: { ...setup },
    snapshots: [{ id: id(), referenceMonth: chosen.referenceMonth, cohortMonth: chosen.cohortMonth, createdAt: nowIso, metrics: {}, targets: {} }],
    tourLink: null,
    deck: defaultDeck(),
  };
}

function yearMonth(year: number, monthIndex: number): YearMonth {
  const d = new Date(Date.UTC(year, monthIndex, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Last closed month; latest month that closed at least 30 days before `today` (UTC, like every ISO the engine stores). */
function fallbackMonths(today: Date): { referenceMonth: YearMonth; cohortMonth: YearMonth } {
  const y = today.getUTCFullYear();
  const m = today.getUTCMonth();
  let back = 1;
  // A cohort month closes at the first instant of the next one: its last sign-up needs 30 days from there.
  while (today.getTime() - Date.UTC(y, m - back + 1, 1) < 30 * 86_400_000) back += 1;
  return { referenceMonth: yearMonth(y, m - 1), cohortMonth: yearMonth(y, m - back) };
}
