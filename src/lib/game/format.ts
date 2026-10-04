/**
 * Every number the game prints goes through here — one formatter per kind,
 * so the same number has the same form everywhere on the screen. The
 * prototype wrote the December cell with one rounding and the end of its
 * curve with another (« 4,0 % » next to « 3,99 % », plan R5); a shared
 * formatter is what makes that impossible rather than merely avoided.
 *
 * Deterministic and without `Intl`: the level page is prerendered on Node and
 * hydrated in a browser, and `toLocaleString` is free to differ between the
 * two (ICU data, the grouping character) — a mismatch on the first number of
 * the dashboard. French typography follows the repo's rule
 * (copy-typography.test.ts): U+00A0 in digit groups and before « % » and the
 * currency, never U+202F, which a font subset once drew as an empty box.
 * Signed numbers take U+2212, the minus sign, not the hyphen.
 *
 * Relative imports only, types from `@/` — see model.ts.
 */
import type { Locale } from "@/lib/i18n/locale";
import type { MetricDisplay } from "./types";

export const NBSP = "\u00A0";
export const MINUS = "\u2212";

// TODO: à relire — units the formatter prints. French abbreviations are
// invariable; English percentage points read « pts » on a dashboard.
const UNITS = {
  fr: { points: "pt", millions: "M€", euro: "€", customers: "clients" },
  en: { points: "pts", millions: "M", euro: "€", customers: "customers" },
} as const satisfies Record<Locale, Record<string, string>>;

interface Digits {
  negative: boolean;
  zero: boolean;
  body: string;
}

/**
 * `|x| × 10^scale`, rounded half up. A negative scale divides rather than
 * multiplying by a fraction: `n / 10 000` is exact where `n × 0,0001` is not,
 * and the revenue tile must round exactly as the prototype did.
 */
function magnitude(x: number, scale: number): number {
  const abs = Math.abs(x);
  return Math.round(scale >= 0 ? abs * 10 ** scale : abs / 10 ** -scale);
}

/**
 * The magnitude rendered with `decimals` decimals and
 * the locale's separators. Rounding happens once, on the magnitude, and the
 * sign is decided AFTER it: a delta of −0,0004 is « 0,0 pt », never
 * « −0,0 pt ».
 */
function digits(locale: Locale, x: number, scale: number, decimals: number): Digits {
  const scaled = magnitude(x, scale);
  const factor = 10 ** decimals;
  const whole = Math.floor(scaled / factor);
  const frac = decimals > 0 ? String(scaled % factor).padStart(decimals, "0") : "";
  const group = locale === "fr" ? NBSP : ",";
  const point = locale === "fr" ? "," : ".";
  const grouped = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, group);
  return { negative: x < 0 && scaled !== 0, zero: scaled === 0, body: decimals > 0 ? `${grouped}${point}${frac}` : grouped };
}

function sign(d: Digits, plus: boolean): string {
  if (d.negative) return MINUS;
  return plus && !d.zero ? "+" : "";
}

/** A rate given as a fraction: 0,06 → « 6,0 % » / « 6.0% ». */
export function formatPct(locale: Locale, x: number, decimals = 1): string {
  const d = digits(locale, x, decimals + 2, decimals);
  return locale === "fr" ? `${sign(d, false)}${d.body}${NBSP}%` : `${sign(d, false)}${d.body}%`;
}

/** A count: 100000 → « 100 000 » / « 100,000 ». */
export function formatInt(locale: Locale, n: number): string {
  const d = digits(locale, n, 0, 0);
  return `${sign(d, false)}${d.body}`;
}

/** Monthly revenue in millions, two decimals: 1 299 000 → « 1,30 M€ » / « €1.30M ». */
export function formatMillions(locale: Locale, n: number): string {
  // Rounded on n / 10 000 to a whole number of hundredths of a million, as
  // the prototype did — the cell and a delta built from it then agree.
  const d = digits(locale, n, -4, 2);
  const u = UNITS[locale];
  return locale === "fr" ? `${sign(d, false)}${d.body}${NBSP}${u.millions}` : `${sign(d, false)}${u.euro}${d.body}${u.millions}`;
}

/** Whole euros: 94500 → « 94 500 € » / « €94,500 ». */
export function formatEur(locale: Locale, n: number): string {
  const d = digits(locale, n, 0, 0);
  return locale === "fr" ? `${sign(d, false)}${d.body}${NBSP}€` : `${sign(d, false)}€${d.body}`;
}

/**
 * Names in a sentence, each quoted the way the copy quotes a card:
 * « « A », « B » et « C » » / « "A", "B" and "C" ». Hand-rolled like the
 * numbers above rather than `Intl.ListFormat`, so the server and every
 * browser print the same sentence.
 */
export function formatList(locale: Locale, items: readonly string[]): string {
  const quoted = items.map((item) => (locale === "fr" ? `«${NBSP}${item}${NBSP}»` : `"${item}"`));
  if (quoted.length <= 1) return quoted.join("");
  const and = locale === "fr" ? " et " : " and ";
  return `${quoted.slice(0, -1).join(", ")}${and}${quoted.at(-1)}`;
}

/** A gap in percentage points, from a difference of fractions: 0,012 → « 1,2 pt » / « 1.2 pts ». */
export function formatPoints(locale: Locale, x: number, decimals = 1): string {
  const d = digits(locale, x, decimals + 2, decimals);
  return `${sign(d, false)}${d.body}${NBSP}${UNITS[locale].points}`;
}

/** A bare ratio to `decimals` places, the viral coefficient: 0,4 → « 0,40 » / « 0.40 ». */
export function formatRatio(locale: Locale, x: number, decimals = 2): string {
  const d = digits(locale, x, decimals, decimals);
  return `${sign(d, false)}${d.body}`;
}

/** Euros to `decimals` places, revenue per user: 4,3 → « 4,30 € » / « €4.30 ». */
export function formatEuros(locale: Locale, x: number, decimals = 2): string {
  const d = digits(locale, x, decimals, decimals);
  return locale === "fr" ? `${sign(d, false)}${d.body}${NBSP}€` : `${sign(d, false)}€${d.body}`;
}

/** A whole signed number, for hidden effects on the playbook: « +4 », « −2 », « 0 ». */
export function formatSigned(locale: Locale, n: number): string {
  const d = digits(locale, n, 0, 0);
  return `${sign(d, true)}${d.body}`;
}

/**
 * `rate`: a share in percentage points (churn) ; `int`: a count ; `tens`: a
 * count shown to the ten (level 2's new customers) ; `millions`: euros in M€ ;
 * `hundredths`: a bare ratio to the hundredth (the viral coefficient) ;
 * `cents`: euros to the cent (revenue per user).
 */
export type DeltaKind = "rate" | "int" | "tens" | "millions" | "hundredths" | "cents";

// The power of ten each delta is rounded at — shared by `formatDelta` and
// `deltaSign`, so the two cannot round differently.
const DELTA_SCALE: Record<DeltaKind, number> = { rate: 3, int: 0, tens: -1, millions: -4, hundredths: 2, cents: 2 };

/**
 * The change between two readings of a tile, with its sign: a rate in points,
 * subscribers and patience as integers, revenue in millions. A change that
 * rounds to nothing prints without a sign, and `deltaSign` agrees with it —
 * the arrow and the number can never disagree.
 */
export function formatDelta(locale: Locale, kind: DeltaKind, a: number, b: number): string {
  const diff = b - a;
  if (kind === "rate") {
    const d = digits(locale, diff, DELTA_SCALE.rate, 1);
    return `${sign(d, true)}${d.body}${NBSP}${UNITS[locale].points}`;
  }
  if (kind === "millions") {
    const d = digits(locale, diff, DELTA_SCALE.millions, 2);
    const u = UNITS[locale];
    return locale === "fr" ? `${sign(d, true)}${d.body}${NBSP}${u.millions}` : `${sign(d, true)}${u.euro}${d.body}${u.millions}`;
  }
  if (kind === "hundredths") {
    const d = digits(locale, diff, DELTA_SCALE.hundredths, 2);
    return `${sign(d, true)}${d.body}`;
  }
  if (kind === "cents") {
    const d = digits(locale, diff, DELTA_SCALE.cents, 2);
    return locale === "fr" ? `${sign(d, true)}${d.body}${NBSP}€` : `${sign(d, true)}€${d.body}`;
  }
  if (kind === "tens") {
    // Rounded to the ten, then printed as the whole number it stands for.
    const tens = magnitude(diff, DELTA_SCALE.tens) * 10;
    const d = digits(locale, diff < 0 ? -tens : tens, 0, 0);
    return `${sign(d, true)}${d.body}`;
  }
  const d = digits(locale, diff, DELTA_SCALE.int, 0);
  return `${sign(d, true)}${d.body}`;
}

/** −1, 0 or 1 — the direction `formatDelta` prints, after its rounding. */
export function deltaSign(kind: DeltaKind, a: number, b: number): -1 | 0 | 1 {
  const diff = b - a;
  if (magnitude(diff, DELTA_SCALE[kind]) === 0) return 0;
  return diff > 0 ? 1 : -1;
}

/** A count of customers with its unit: 50 → « 50 clients » / « 50 customers ». */
export function formatCustomers(locale: Locale, n: number): string {
  return `${formatInt(locale, n)}${NBSP}${UNITS[locale].customers}`;
}

/**
 * How a level prints its own number — the one thing the island cannot know
 * without asking the level: churn is a rate read to the tenth of a point,
 * new customers a count read to the ten (`MetricDisplay`). Every place the
 * number appears goes through these, so the tile, the report, the timeline,
 * December's cell and the end of its curve print the same figure.
 */
export interface MetricFormat {
  /** The number as the tile shows it: « 5,6 % », « 2 150 ». */
  value(locale: Locale, x: number): string;
  /**
   * A missed target, with its unit: « 0,1 pt », « 10 clients ». Never less
   * than one step: the model compares raw values, so a quarter can miss by
   * less than the tile can show (2 146 against 2 150 reads « 2 150 »), and
   * « manqué de 0 client » would contradict the verdict it explains.
   */
  gap(locale: Locale, x: number): string;
  /** The kind a change of the number is printed as, on a tile and in the report's « why ». */
  delta: DeltaKind;
  /** A December axis tick, in the chart's own unit (the model's value × `chart.factor`). */
  tick(locale: Locale, v: number): string;
}

/** The kind a change of a level's number is printed as: points of a rate, a count to its step, hundredths, cents. */
export function metricDeltaKind(display: Pick<MetricDisplay, "kind" | "step">): DeltaKind {
  if (display.kind === "rate") return "rate";
  if (display.kind === "ratio") return "hundredths";
  if (display.kind === "money") return "cents";
  return display.step === 10 ? "tens" : "int";
}

export function metricFormat(display: MetricDisplay): MetricFormat {
  const { step } = display;
  if (display.kind === "rate") {
    return {
      value: (locale, x) => formatPct(locale, x),
      gap: (locale, x) => formatPoints(locale, Math.max(step, x)),
      delta: metricDeltaKind(display),
      tick: (locale, v) => formatPct(locale, v / display.chart.factor, 0),
    };
  }
  if (display.kind === "ratio") {
    return {
      value: (locale, x) => formatRatio(locale, x),
      gap: (locale, x) => formatRatio(locale, Math.max(step, x)),
      delta: metricDeltaKind(display),
      tick: (locale, v) => formatRatio(locale, v / display.chart.factor, 1),
    };
  }
  if (display.kind === "money") {
    return {
      value: (locale, x) => formatEuros(locale, x),
      gap: (locale, x) => formatEuros(locale, Math.max(step, x)),
      delta: metricDeltaKind(display),
      tick: (locale, v) => formatEuros(locale, v / display.chart.factor, 0),
    };
  }
  const toStep = (x: number) => Math.round(x / step) * step;
  return {
    value: (locale, x) => formatInt(locale, toStep(x)),
    gap: (locale, x) => formatCustomers(locale, Math.max(step, toStep(x))),
    delta: metricDeltaKind(display),
    tick: (locale, v) => formatInt(locale, v / display.chart.factor),
  };
}

const PLACEHOLDER = /\{([A-Za-z0-9_]+)\}/g;

/** The distinct `{names}` of a template, in order of appearance. */
export function placeholders(template: string): string[] {
  const names: string[] = [];
  for (const [, name] of template.matchAll(PLACEHOLDER)) if (name && !names.includes(name)) names.push(name);
  return names;
}

/**
 * Fills `{name}` placeholders with already-formatted values. Throws on a
 * placeholder without a value: a template printed with a raw « {churn} » in
 * it is a bug a player would read, and it must fail where the tests see it.
 */
export function fill(template: string, vars: Readonly<Record<string, string>>): string {
  return template.replace(PLACEHOLDER, (_, name: string) => {
    const value = Object.hasOwn(vars, name) ? vars[name] : undefined;
    if (value === undefined) throw new Error(`fill: no value for {${name}} in "${template}"`);
    return value;
  });
}
