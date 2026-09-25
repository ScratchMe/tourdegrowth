import { describe, expect, it } from "vitest";
import { CANDIDATE_IDS, METRIC_SHAPES, shapeOf } from "../catalog-shape";
import { buildDeck, chainLine, comparatorText, deckMarkdown, renderTitle, targetPhrase } from "../deck";
import { deriveEngine } from "../derive";
import { comparatorOf, impactTarget } from "../diagnose";
import { fillTemplate, formatInterval } from "../format";
import { whatIf } from "../impact";
import { behindSentence, blindSentence, catalogueValues, notEnoughBelowSentence, staticCatalogueValues, subjectOf, unpricedSentence } from "../phrases";
import { buildRequest } from "../request";
import { findingText, sanityText } from "../sentences";
import { SLIDE_ORDER } from "../types";
import type { EngineState, FindingKind, MetricEntry, SanityId, SlideTitleKey, SourceRef, ToolId } from "../types";
import { knownIn } from "../values";
import { CTX_EN, CTX_FR, EN, FR } from "./props";
import { emptyState, estimated, exampleState, measured, missing, ratio, tourResult, withEntry, withTarget } from "./fixtures";

/**
 * The guard: every sentence the engine can produce, read as a reader would.
 *
 * `phrases.ts` fixes the rules one at a time (its own tests); this file runs
 * the REAL functions — deck, request, findings, checks, the board's
 * diagnosis and "what if", the annex and the static catalogue — over a set
 * of states chosen so that every title template, every finding kind and
 * every check fires at least once, in both languages, and sweeps what comes
 * out for the defects that were actually found on the §6.0 deck:
 * « combien ont fait a créé un premier projet », « de août », « Sans chiffre
 * pour La rétention », « Il manque marge brute », a churn « sous le repère »,
 * « 1 nouveaux payants », « objectif : de  à  d'ici », « sources : » left
 * dangling, a slide that says « ta cible ».
 *
 * A rule here is a SHAPE of defect, not a sentence: a new template that
 * reintroduces one fails wherever it lands. Each rule's non-vacuity was
 * measured by breaking the code it protects, one break at a time, and each
 * break tripped exactly its rule: a misspelt `{caveat}`, a lone `**`, a
 * doubled space, a trailing space on the credit, `String(undefined)` for the
 * event, a candidate's id as its subject, a « → », `fillSegments` keeping
 * empty segments (empty clause AND dangling « sources : »), a capitalised
 * stage in `blindSentence`, « Inscrits de {cohort} », « au-dessus de le
 * repère », « sources: » without its no-break space, "sources :" in English,
 * « ni ta cible », `numbered` always plural, and "with a {n}-day" put back in
 * the catalogue (the static page prints "a n-day"). Two breaks first PASSED, and
 * both said something: `slide.leakAside` is copy no code prints (so a glyph
 * there reaches no slide), and the example's months are consonant-initial
 * (hence the vowel-month scenario).
 */

type Locale = "fr" | "en";
interface Sample {
  scenario: string;
  locale: Locale;
  where: string;
  text: string;
  /** On a slide or in its text export: read out in a room, so no « tu » and nothing dangling. */
  slide: boolean;
}

const NB = " ";
const tool = (t: ToolId): SourceRef => ({ kind: "tool", tool: t });
const props = { fr: { ...FR, ctx: CTX_FR }, en: { ...EN, ctx: CTX_EN } };

// --- The states --------------------------------------------------------------

const within = () => withEntry(exampleState(), "act.rate", measured(ratio(200, 800), tool("amplitude")));
const noArpa = () => withEntry(exampleState(), "rev.arpa", undefined);
const perHundred = () =>
  withEntry(
    withEntry(withEntry(exampleState(), "acq.cac", measured({ kind: "amount", amount: 500 }, tool("stripe"))), "acq.signup-rate", measured({ kind: "rate", percent: 3.2 })),
    "ret.logo-churn",
    measured(ratio(6, 400), tool("stripe")),
  );
const complete = () => withEntry(exampleState(), "ret.d30", measured(ratio(80, 800), tool("amplitude")));
const allDocumented = () => {
  let s = complete();
  s = withEntry(s, "ret.churn-cause", measured({ kind: "text", text: "prix" }, { kind: "other" }, { evidence: "data" }));
  s = withEntry(s, "ref.k-factor", measured(ratio(40, 800), tool("product-db")));
  return withEntry(s, "rev.gross-margin", measured(ratio(80, 100), tool("stripe")));
};
const conflicting: MetricEntry = {
  status: "conflicting",
  conflict: { a: { value: ratio(144, 800), source: tool("amplitude") }, b: { value: ratio(160, 800), source: { kind: "other" } } },
  updatedAt: "2026-09-20T10:00:00.000Z",
};
const ttvMean: MetricEntry = { status: "estimated", estimate: { low: 1, high: 3, basis: "team-hunch" }, variant: "mean", updatedAt: "2026-09-20T10:00:00.000Z" };

/**
 * A cohort in août, flows in octobre. The example's months (juillet, août) put
 * a consonant after every « {cohort} » the footer and titles print, so a
 * template reading « de {cohort} » would pass the elision rule unseen — the
 * P7a sabotage run proved it. Only a vowel-initial month can catch « de août ».
 */
function vowelMonths(state: EngineState): EngineState {
  state.snapshots[0]!.cohortMonth = "2026-08";
  state.snapshots[0]!.referenceMonth = "2026-10";
  return state;
}

/** Every slide included — the mirror too, so its rows are swept. */
function includeAll(state: EngineState): EngineState {
  for (const id of SLIDE_ORDER) state.deck.include[id] = true;
  return state;
}

/** A state linked to a Tour result, with its answers (index 0 → 20 points, 2 → 0). */
function linked(state: EngineState, answers: Record<string, 0 | 1 | 2>, extra: Parameters<typeof tourResult>[1] = {}) {
  const result = tourResult(answers, extra);
  return { state: { ...state, tourLink: { resultId: result.id, linkedAt: "2026-09-20T10:00:00.000Z" } }, result };
}

const TOUR_ANSWERS = { "acq-1": 0, "acq-3": 2, "act-1": 0, "act-2": 1, "ret-1": 0, "ret-3": 2, "ref-3": 0, "rev-2": 0 } as const;

const SCENARIOS: { name: string; build: () => { state: EngineState; result?: ReturnType<typeof tourResult> } }[] = [
  { name: "§6.0 example", build: () => ({ state: exampleState() }) },
  { name: "months that start with a vowel", build: () => ({ state: vowelMonths(exampleState()) }) },
  { name: "ARPA unknown", build: () => ({ state: noArpa() }) },
  { name: "everything unknown", build: () => ({ state: emptyState() }) },
  { name: "everything measured", build: () => ({ state: allDocumented() }) },
  { name: "one number missing", build: () => ({ state: withEntry(allDocumented(), "rev.gross-margin", missing("no-access", "meeting")) }) },
  { name: "no monthly volume", build: () => ({ state: perHundred() }) },
  { name: "no monthly volume, team target 40 %", build: () => ({ state: withTarget(perHundred(), "act.rate", 40) }) },
  { name: "ten new payers a month, no ARPA", build: () => ({ state: withEntry(noArpa(), "acq.cac", measured(ratio(5_000, 10), tool("stripe"))) }) },
  { name: "three new payers a month (gain under one)", build: () => ({ state: withEntry(noArpa(), "acq.cac", measured(ratio(1_500, 3), tool("stripe"))) }) },
  { name: "churn named, no ARPA", build: () => ({ state: withEntry(within(), "rev.arpa", undefined) }) },
  { name: "churn named, no ARPA, one customer kept", build: () => ({ state: withEntry(withEntry(within(), "rev.arpa", undefined), "ret.logo-churn", measured(ratio(9, 400), tool("stripe"))) }) },
  { name: "churn named, priced", build: () => ({ state: within() }) },
  { name: "churn behind a team target", build: () => ({ state: withTarget(within(), "ret.logo-churn", 2) }) },
  { name: "two stages behind together", build: () => ({ state: withEntry(exampleState(), "ret.logo-churn", measured(ratio(12, 400), tool("stripe"))) }) },
  { name: "nothing behind", build: () => ({ state: withEntry(within(), "ret.logo-churn", measured(ratio(6, 400), tool("stripe"))) }) },
  { name: "activation above its reference", build: () => ({ state: withEntry(exampleState(), "act.rate", measured(ratio(400, 800), tool("amplitude"))) }) },
  { name: "activation maybe below (estimate straddles)", build: () => ({ state: withEntry(exampleState(), "act.rate", estimated(15, 25)) }) },
  { name: "not enough references", build: () => ({ state: withEntry(exampleState(), "ret.logo-churn", undefined) }) },
  { name: "not enough references, behind a target", build: () => ({ state: withTarget(withEntry(exampleState(), "ret.logo-churn", undefined), "act.rate", 25) }) },
  { name: "referred share behind a target (unpriced)", build: () => ({ state: withTarget(within(), "ref.referred-share", 10) }) },
  { name: "event unnamed", build: () => ({ state: withEntry(exampleState(), "act.event", undefined) }) },
  {
    name: "event missing, rate unknown",
    build: () => ({ state: withEntry(withEntry(exampleState(), "act.event", missing("not-tracked", "meeting")), "act.rate", undefined) }),
  },
  { name: "event typed in quotes", build: () => ({ state: withEntry(exampleState(), "act.event", measured({ kind: "text", text: " « Invited a teammate » " }, { kind: "other" })) }) },
  { name: "peloton complete", build: () => ({ state: complete() }) },
  { name: "peloton broken at the tail", build: () => ({ state: withEntry(complete(), "rev.paid-conversion", missing("not-computed", "sprint")) }) },
  { name: "peloton broken twice at the tail", build: () => ({ state: withEntry(exampleState(), "rev.paid-conversion", missing("not-computed", "sprint")) }) },
  { name: "peloton gap of two", build: () => ({ state: withEntry(withEntry(exampleState(), "act.rate", missing("not-tracked", "sprint")), "ret.d30", undefined) }) },
  { name: "two conflicting numbers", build: () => ({ state: withEntry(exampleState(), "act.rate", conflicting) }) },
  { name: "billing counts far fewer", build: () => ({ state: withEntry(exampleState(), "acq.cac", measured(ratio(21_000, 10), { kind: "person", role: "finance" })) }) },
  { name: "the chain predicts one payer", build: () => ({ state: withEntry(exampleState(), "acq.signup-rate", measured(ratio(15, 26_000))) }) },
  { name: "a small cohort", build: () => ({ state: withEntry(exampleState(), "act.rate", measured(ratio(14, 80), tool("amplitude"))) }) },
  { name: "numerator above denominator", build: () => ({ state: withEntry(exampleState(), "act.rate", measured(ratio(900, 800), tool("amplitude"))) }) },
  { name: "more active at day 30 than activated", build: () => ({ state: withEntry(exampleState(), "ret.d30", measured(ratio(200, 800))) }) },
  {
    name: "more paying than active",
    build: () => ({ state: withEntry(withEntry(exampleState(), "ret.d30", measured(ratio(40, 800))), "rev.paid-conversion", measured(ratio(80, 800))) }),
  },
  { name: "churn looks annual", build: () => ({ state: withEntry(exampleState(), "ret.logo-churn", measured(ratio(140, 400), tool("stripe"))) }) },
  { name: "margin looks odd", build: () => ({ state: withEntry(exampleState(), "rev.gross-margin", measured(ratio(99, 100), tool("stripe"))) }) },
  { name: "time to value as a mean", build: () => ({ state: withEntry(exampleState(), "act.ttv", ttvMean) }) },
  {
    name: "columns from two cohorts",
    build: () => ({ state: withEntry(exampleState(), "act.rate", measured(ratio(144, 800), tool("amplitude"), { cohortMonth: "2026-06" })) }),
  },
  { name: "Tour linked", build: () => linked(exampleState(), TOUR_ANSWERS) },
  { name: "Tour linked, no score", build: () => linked(allDocumented(), TOUR_ANSWERS, { total: undefined }) },
  {
    name: "the team's ask, whole",
    build: () => {
      const s = withTarget(exampleState(), "act.rate", 25);
      s.deck.ask = {
        what: "deux sprints produit",
        bullets: ["refaire l'onboarding"],
        cost: { kind: "money", amount: 80_000 },
        measureFirst: ["ret.d30"],
        successMetric: "act.rate",
        successTarget: 25,
        horizon: { year: 2027, quarter: 1 },
      };
      return { state: s };
    },
  },
  {
    name: "the team's ask, no current value, no horizon",
    build: () => {
      const s = withEntry(exampleState(), "act.rate", undefined);
      s.deck.ask = { what: "un sprint", bullets: [], cost: { kind: "team", weeks: 2, people: 1 }, measureFirst: [], successMetric: "act.rate", successTarget: 25 };
      return { state: s };
    },
  },
  {
    name: "the team's ask, words only",
    build: () => {
      const s = exampleState();
      s.deck.ask = { what: "un trimestre d'expérimentations", bullets: [], measureFirst: ["rev.gross-margin", "ret.d30"] };
      return { state: s };
    },
  },
  {
    name: "company named, credit off",
    build: () => {
      const s = exampleState();
      s.setup.companyLabel = "Acme";
      s.deck.showCompany = true;
      s.deck.showSiteCredit = false;
      return { state: s };
    },
  },
];

// --- The sweep ---------------------------------------------------------------

/** Keys a slide maps to its own words — never printed as they are. */
const MACHINE_KEYS = new Set(["row", "key", "id", "questionId", "tone", "found", "verdict", "points"]);

interface Sweep {
  samples: Sample[];
  titleKeys: Set<SlideTitleKey>;
  findingKinds: Set<FindingKind>;
  sanityIds: Set<SanityId>;
}

function sweep(): Sweep {
  const out: Sweep = { samples: [], titleKeys: new Set(), findingKinds: new Set(), sanityIds: new Set() };
  for (const scenario of SCENARIOS) {
    for (const locale of ["fr", "en"] as const) {
      const p = props[locale];
      const { state: raw, result } = scenario.build();
      const state = includeAll(raw);
      const add = (where: string, text: string | null | undefined, slide: boolean) => {
        if (text !== null && text !== undefined) out.samples.push({ scenario: scenario.name, locale, where, text, slide });
      };
      const derived = deriveEngine(state, p.ctx, result ?? null, p.bridges, p.strings.units);

      // The deck: every title, every printed field of every line, every note, the footer, and the text export.
      const deck = buildDeck(state, derived, p.strings, p.metrics, p.ctx, { derived: p.derived, bridges: p.bridges });
      for (const slide of deck.slides) {
        if (!slide.present) continue;
        out.titleKeys.add(slide.title.key);
        add(`${slide.id} title`, renderTitle(slide.title, p.strings), true);
        slide.lines.forEach((line, i) => {
          for (const [key, value] of Object.entries(line)) if (!MACHINE_KEYS.has(key) && value !== "") add(`${slide.id} line ${i} ${line.row}.${key}`, value, true);
        });
        slide.notes.forEach((note, i) => add(`${slide.id} note ${i}`, note, true));
      }
      add("footer", deck.footer.text, true);
      add("markdown", deckMarkdown(deck, p.strings), true);

      // What the board and the "to check" list print.
      for (const f of derived.findings) {
        out.findingKinds.add(f.kind);
        add(`finding ${f.kind}`, findingText(f, state, p.strings, p.metrics, p.derived, locale), false);
      }
      for (const c of derived.sanity) {
        out.sanityIds.add(c.id);
        add(`check ${c.id}`, sanityText(c, p.strings, locale), false);
      }

      // The board's diagnosis block.
      const d = derived.diagnosis;
      add("diagnosis blind", blindSentence(d.blind, p.strings, p.metrics), false);
      add("diagnosis not-enough", notEnoughBelowSentence(d, p.strings, p.metrics), false);
      add("diagnosis unpriced", unpricedSentence(d, p.strings, p.metrics), false);
      for (const id of d.state === "clear" || d.state === "shared" ? d.named : []) {
        const comparator = d.positions[id].comparator;
        const known = knownIn(state, id, p.ctx);
        if (!comparator || known.kind !== "known") continue;
        const value = formatInterval(known.value, shapeOf(id).unit, p.ctx, p.strings.units);
        add(`diagnosis named ${id}`, behindSentence(comparator, value, comparatorText(state, id, p.strings, p.ctx), p.strings), false);
      }

      // The "what if" drawer, for every stage that has a comparator — the leak slide only shows the named one.
      for (const id of CANDIDATE_IDS) {
        const comparator = comparatorOf(state, id);
        if (!comparator) continue;
        const impact = whatIf(state, id, impactTarget(comparator), p.ctx, p.strings.units);
        if (!impact) continue;
        const target = targetPhrase(comparator, id, state, p.strings, p.ctx);
        for (const line of impact.lines) add(`what-if ${id} ${line.key}`, chainLine(line, impact, subjectOf(id, p.strings, p.metrics), target, p.strings, locale).text, false);
      }

      // The request a reader copies to a colleague: every number at once.
      add("request", buildRequest("data", METRIC_SHAPES.map((s) => s.id), p.strings, p.metrics, state, p.ctx), false);

      // The sheet: each number's recipe filled with THIS state's month, cohort, window and event.
      for (const m of p.metrics) {
        const fills = catalogueValues(state, m.id, p.strings, p.metrics, p.ctx);
        for (const [key, value] of Object.entries({ formula: m.formula, request: m.request })) add(`sheet ${m.id}.${key}`, fillTemplate(value, fills), false);
        for (const w of m.where) add(`sheet ${m.id}.where`, fillTemplate(w.path, fills), false);
      }

      // The static catalogue page (once per language: it has no state).
      if (scenario === SCENARIOS[0]) {
        const fills = staticCatalogueValues(p.strings);
        for (const m of p.metrics) {
          for (const [key, value] of Object.entries({ formula: m.formula, trap: m.trap, oneLiner: m.oneLiner, request: m.request })) add(`catalogue ${m.id}.${key}`, fillTemplate(value, fills), false);
          for (const w of m.where) add(`catalogue ${m.id}.where`, fillTemplate(w.path, fills), false);
        }
        for (const x of p.derived) add(`catalogue ${x.id}.formula`, fillTemplate(x.formula, fills), false);
      }
    }
  }
  return out;
}

const SWEEP = sweep();

// --- The rules ---------------------------------------------------------------

/** User words and quoted survey questions are not ours to check: « … » and "…" come out before the language rules. */
const unquoted = (text: string) => text.replace(/«[^»]*»/g, "«»").replace(/"[^"]*"/g, '""').replace(/“[^”]*”/g, "“”");

const EN_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/** Words that are capitalised mid-sentence by nature: tools, roles, stages, English months, the product. */
const PROPER = new Set(
  [
    ...EN_MONTHS,
    "Tour",
    "Growth",
    ...Object.values(FR.strings.tools),
    ...Object.values(EN.strings.tools),
    ...Object.values(FR.strings.role),
    ...Object.values(EN.strings.role),
    ...Object.values(FR.strings.stages),
  ].flatMap((w) => w.split(/[\s-]+/)),
);

/** §10.4: the three slide fonts cover printable Latin-1 (U+00A0 included) plus these. */
const ALLOWED = /^[\n -~ -ÿ–—’…€]*$/u;

type Rule = { name: string; applies?: (s: Sample) => boolean; check: (s: Sample) => string | null };

function numberOf(s: string, locale: Locale): number {
  const cleaned = s.replace(/[  ]/g, "");
  return Number(locale === "fr" ? cleaned.replace(",", ".") : cleaned.replace(/,/g, ""));
}

const FR_NOUNS = "nouveaux payants|nouveau payant|clients payants|client payant|clients gardés|client gardé|payants|payant|chiffres|chiffre|clients|client|jours|jour";
const EN_NOUNS = "new paying customers|new paying customer|paying customers|paying customer|customers kept|customer kept|customers|customer|days|day";
const FR_COUNT = new RegExp(`(?<![\\d,])(\\d[\\d\\u00a0]*(?:,\\d+)?)(?: à (\\d[\\d\\u00a0]*(?:,\\d+)?))?[ \\u00a0](${FR_NOUNS})(?![\\p{L}])`, "gu");
const EN_COUNT = new RegExp(`(?<![\\d.,])(\\d[\\d,]*(?:\\.\\d+)?)(?:–(\\d[\\d,]*(?:\\.\\d+)?))?\\s(?:more\\s)?(${EN_NOUNS})(?![\\p{L}])`, "gu");

const RULES: Rule[] = [
  { name: "no placeholder left", check: (s) => (/[{}]/.test(s.text) ? s.text.match(/.{0,20}[{}].{0,20}/)![0] : null) },
  { name: "the red accent is balanced", check: (s) => ((s.text.match(/\*\*/g)?.length ?? 0) % 2 ? s.text : null) },
  { name: "no double space, no space next to a no-break one", check: (s) => s.text.match(/.{0,20}(?: {2}|  |  ).{0,20}/)?.[0] ?? null },
  { name: "no trailing space on a line", check: (s) => s.text.match(/.{0,30}[  ]$/m)?.[0] ?? null },
  { name: "no undefined, NaN, null or object", check: (s) => s.text.match(/.{0,20}\b(undefined|NaN|null|\[object)\b.{0,20}/)?.[0] ?? null },
  { name: "no raw number id", check: (s) => s.text.match(/.{0,20}\b(?:acq|act|ret|ref|rev)\.[a-z][\w-]*.{0,10}/)?.[0] ?? null },
  { name: "only the slides' glyphs (§10.4)", check: (s) => (ALLOWED.test(s.text) ? null : [...s.text].filter((c) => !ALLOWED.test(c)).join(" ")) },
  {
    name: "no empty clause",
    check: (s) =>
      s.text.match(/.{0,20}(?:—\s*[.,;:]|[  ][.,]|;\s*[.;]|·\s*·|^\s*·|[  ]·[  ]*$|\(\s*\)|«\s*»(?!»)|""|,\s*[,.]).{0,20}/m)?.[0] ?? null,
  },
  {
    name: "nothing dangling at the end of a slide's line (« sources : »)",
    applies: (s) => s.slide,
    check: (s) => s.text.match(/.{0,30}[:;·—][  ]*$/m)?.[0] ?? null,
  },
  {
    name: "no capital after a lower-case word mid-sentence (« pour La rétention »)",
    // A catalogue « where » path names the tool's own screens (« la colonne Utilisateurs »,
    // « Billing overview ») exactly as the tool spells them: that capital is the point.
    // Every other rule still reads those paths.
    applies: (s) => !s.where.endsWith(".where"),
    check: (s) => {
      for (const m of unquoted(s.text).matchAll(/(?<=\p{Ll}[  ])(\p{Lu}\p{L}+)/gu)) {
        const word = m[1]!;
        // All capitals (CAC, ARPA) or an inner capital (SaaS) is a term, not a slip of the case.
        if (!/\p{Ll}/u.test(word) || /.\p{Lu}/u.test(word) || PROPER.has(word)) continue;
        return `${word} in: ${s.text.slice(Math.max(0, m.index! - 30), m.index! + 20)}`;
      }
      return null;
    },
  },
  {
    name: "French: an elision a template cannot make (« de août », « le ARPA »)",
    applies: (s) => s.locale === "fr",
    // « si » elides only before « il(s) » (« si un commercial » is right), and a pronoun
    // after a hyphen belongs to an imperative (« recompte-le au mois »), never elided.
    check: (s) =>
      unquoted(s.text).match(
        /.{0,20}(?<![\p{L}-])(?:(?:de|le|la|que|ne|se|je|me|te)[  ](?:[aeiouyàâäéèêëîïôöûüùœ]|il\b)|si[  ]ils?\b).{0,20}/iu,
      )?.[0] ?? null,
  },
  {
    name: "French: « au/aux/du/des », never « à le », « de les », « en le »",
    applies: (s) => s.locale === "fr",
    check: (s) => unquoted(s.text).match(/.{0,20}(?<!\p{L})(?:à le|à les|de le|de les|en le|en les)(?!\p{L}).{0,20}/iu)?.[0] ?? null,
  },
  {
    name: "French typography: a no-break space before ; : ! ? » and after «, in number groups, before % and €",
    applies: (s) => s.locale === "fr",
    check: (s) => {
      const t = s.text.replace(/LTV:CAC/g, "LTV/CAC");
      return (
        t.match(/.{0,20}(?:[^\s ][;:!?»]|[ ][;:!?»%€]|«[^ »]|\d[%€]|\d \d{3}(?!\d)).{0,20}/)?.[0] ?? null
      );
    },
  },
  {
    name: "English typography: no space before ; : ! ? %, no guillemets",
    applies: (s) => s.locale === "en",
    check: (s) => s.text.match(/.{0,20}(?:[  ][;:!?%]|[«»]).{0,20}/)?.[0] ?? null,
  },
  {
    // Only what a template can see: a vowel letter, 8, 11, 18, or the static page's "n-" (its window is the
    // letter n). The windows a state can hold (7/14/30, 30/60/90) all take "a"; "a one-off" is right too.
    name: "English: « an » before a vowel sound (\"an 8-day\", \"an n-day\")",
    applies: (s) => s.locale === "en",
    check: (s) => unquoted(s.text).match(/.{0,20}(?<![\p{L}\d'’-])[Aa] (?:[aei]|o(?!ne|nce)|8|1[18](?![\d.,])|n-).{0,20}/u)?.[0] ?? null,
  },
  {
    name: "a slide never addresses the reader (« ta cible », \"your\")",
    applies: (s) => s.slide,
    check: (s) => {
      const t = unquoted(s.text);
      const m = s.locale === "fr" ? t.match(/.{0,20}(?<!\p{L})(?:tu|te|toi|ton|ta|tes)(?!\p{L}).{0,20}/iu) : t.match(/.{0,20}\b(?:you|your)\b.{0,20}/i);
      return m?.[0] ?? null;
    },
  },
  {
    name: "a noun agrees with the number printed before it (« 1 nouveau payant », « 0,7 à 1 payant »)",
    check: (s) => {
      const t = unquoted(s.text);
      for (const m of t.matchAll(s.locale === "fr" ? FR_COUNT : EN_COUNT)) {
        const lo = numberOf(m[1]!, s.locale);
        const hi = m[2] ? numberOf(m[2], s.locale) : lo;
        const singular = s.locale === "fr" ? hi < 2 : lo === 1 && hi === 1;
        const plural = /^\S+[sx](?:\s|$)/.test(m[3]!) || /s$/.test(m[3]!);
        if (singular === plural) return m[0];
      }
      return null;
    },
  },
];

// --- The tests -----------------------------------------------------------------

describe("the sweep reaches every sentence it claims to", () => {
  it("has a corpus big enough to mean something", () => {
    expect(SWEEP.samples.length).toBeGreaterThan(2_000);
    expect(SWEEP.samples.filter((s) => s.slide).length).toBeGreaterThan(1_000);
    for (const locale of ["fr", "en"] as const) expect(SWEEP.samples.filter((s) => s.locale === locale).length).toBeGreaterThan(1_000);
  });

  it("fires every slide title template", () => {
    const all = Object.keys(FR.strings.slideTitles) as SlideTitleKey[];
    expect(all.filter((k) => !SWEEP.titleKeys.has(k))).toEqual([]);
  });

  it("fires every finding kind and every sanity check", () => {
    const kinds: FindingKind[] = ["chain-break", "no-definition", "blind-spot", "below-comparator", "conflict", "unit-econ-uncomputable", "reconcile-gap", "small-cohort", "hidden-knowledge"];
    expect(kinds.filter((k) => !SWEEP.findingKinds.has(k))).toEqual([]);
    const ids: SanityId[] = ["num-gt-den", "retained-gt-activated", "paid-gt-retained", "churn-high", "margin-odd", "ttv-mean", "cohort-mismatch", "reconcile-gap"];
    expect(ids.filter((k) => !SWEEP.sanityIds.has(k))).toEqual([]);
  });

  it("and reaches the forms the rules are about", () => {
    const all = SWEEP.samples.map((s) => s.text).join("\n");
    // Churn behind, in both directions of words; a singular count; the event quoted; a dropped segment.
    for (const needle of ["au-dessus du repère", "above the reference", `1 nouveau payant`, "1 client gardé", `l'événement «${NB}Invited a teammate${NB}»`, "l'événement d'activation", "Il manque la marge brute"])
      expect(all, needle).toContain(needle);
  });
});

describe("every sentence reads right", () => {
  for (const rule of RULES) {
    it(rule.name, () => {
      const offenders = SWEEP.samples
        .filter((s) => !rule.applies || rule.applies(s))
        .flatMap((s) => {
          const found = rule.check(s);
          return found ? [`[${s.locale}] ${s.scenario} — ${s.where}: ${found}`] : [];
        });
      // Deduplicated: one defect in a template shows up once per state that uses it.
      expect([...new Set(offenders)].slice(0, 20)).toEqual([]);
    });
  }
});
