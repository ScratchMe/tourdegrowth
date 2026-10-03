/**
 * Geometry of `engine/PaybackChart` (design system extension 09, Q12, A20.d
 * T4.c): one customer, month by month over 0–36 months — the margin it
 * brings back against what it cost — where the payback and the lifetime
 * meet. It replaces the unit-economics slide's 0–36 month bar, on the same
 * axis, with money on it.
 *
 * In CSS pixels of the slide's 1 920 canvas, y growing downwards. Pure, so
 * the rules are tested: the loss and its months are one picture — a customer
 * who leaves before paying back is a line that stops short of the cost line,
 * and the bracket that measures how short is the loss itself.
 */

/** [low, high]: a fact has low = high. */
export type Range = readonly [number, number];

export type PaybackStory = "unknown" | "loss" | "pays-back";

export interface PaybackChartInput {
  /**
   * What the picture tells, decided by the model's loss verdict (`deck-unit.ts`)
   * rather than re-read here from the middles: the drawing and its words come
   * from one decision. `unknown` needs no margin; the other two need both
   * the margin and the lifetime.
   */
  story: PaybackStory;
  /** What a customer brings back a month; null: no margin — the « ? » box. */
  monthlyMargin: Range | null;
  cac: Range;
  /** The counted lifetime, in months (capped at 36). */
  lifetime: Range | null;
  /** CAC ÷ monthly margin, in months. */
  payback: Range | null;
  width: number;
  height: number;
  /** The month a reference is drawn at, dotted (12, a commonly cited one): it situates, never judges. */
  reference: number | null;
}

/** The chart's months: 0 to the lifetime cap. */
export const PAYBACK_MONTHS = 36;

/** Margins and offsets, on the slide's canvas: its labels are 18px and more (design audit S-8). */
export const PAYBACK_CHART_PX = {
  left: 8,
  right: 16,
  top: 26,
  bottom: 44,
  tickBaseline: 30,
  /** The cost line's room above its label. */
  costLabel: 12,
} as const;

export interface PaybackChartGeometry {
  story: PaybackStory;
  axis: { x1: number; x2: number; y: number };
  ticks: { x0: number; x36: number; y: number; reference: number | null };
  /** The cost line, and its band when the CAC is a range. */
  cost: { y: number; band: { y: number; height: number } | null; labelX: number; labelY: number };
  /** The margin brought back until the customer leaves (`story` ≠ unknown). */
  margin: { x1: number; y1: number; x2: number; y2: number } | null;
  /** A lifetime range: the line's reach, thinner, to its high end. */
  marginRange: { x1: number; y1: number; x2: number; y2: number } | null;
  /** Where the customer leaves (the line's end), when it is on the plot. */
  leaves: { x: number; y: number } | null;
  /**
   * Loss: where it would have paid back, never reached — a dashed thread and a tick down to the axis. null when that
   * is past the 36 months the chart draws: the label alone says it, at the plot's right end.
   */
  thread: { x1: number; y1: number; x2: number; y2: number; tickX: number } | null;
  /** Loss: where the « would pay back » label hangs — the payback's tick, or the plot's right end past 36 months. */
  wouldPayBack: { x: number; beyond: boolean } | null;
  /** Loss: the bracket that measures how short, beside the line's end. */
  short: { path: string; labelX: number; labelY: number } | null;
  /** Pays back: the crossing, and the bracket of the months after it, under the cost line. */
  crossing: { x: number; y: number } | null;
  after: { path: string; x1: number; x2: number; width: number; labelX: number; labelY: number } | null;
  /** No margin: the « ? » box under the cost line. */
  unknown: { x: number; y: number; width: number; height: number; cx: number; cy: number } | null;
}

const mid = (r: Range) => (r[0] + r[1]) / 2;

export function paybackChartGeometry({ story, monthlyMargin, cac, lifetime, payback, width, height, reference }: PaybackChartInput): PaybackChartGeometry {
  const P = PAYBACK_CHART_PX;
  const L = P.left;
  const R = width - P.right;
  const T = P.top;
  const B = height - P.bottom;
  const known = story !== "unknown" && monthlyMargin !== null && lifetime !== null;
  const lifeHi = lifetime ? Math.min(lifetime[1], PAYBACK_MONTHS) : PAYBACK_MONTHS;
  // The scale: the margin a customer brings back over its life, or the cost, whichever is higher — never more
  // than 3.4 times the cost, so the cost line keeps room under it for its labels.
  const top = Math.min(Math.max(cac[1], known ? monthlyMargin[1] * lifeHi : cac[1] * 1.6) * 1.12, cac[1] * 3.4) || 1;
  const x = (m: number) => L + (Math.min(Math.max(m, 0), PAYBACK_MONTHS) / PAYBACK_MONTHS) * (R - L);
  const y = (v: number) => B - (v / top) * (B - T);
  const costY = y(mid(cac));
  const base = {
    axis: { x1: L, x2: R, y: B },
    ticks: { x0: x(0), x36: x(PAYBACK_MONTHS), y: B + P.tickBaseline, reference: reference === null ? null : x(reference) },
    cost: {
      y: costY,
      band: cac[1] > cac[0] ? { y: y(cac[1]), height: y(cac[0]) - y(cac[1]) } : null,
      // At its left end: the margin line starts at the axis there, under it, in both stories — the right end is where
      // the margin line meets or misses it, and carries its own words.
      labelX: L,
      labelY: costY - P.costLabel,
    },
  };

  if (!known) {
    const bx = x(0) + 1;
    const bw = x(PAYBACK_MONTHS) - bx;
    const by = costY + 18;
    const bh = Math.max(24, B - costY - 28);
    return {
      ...base,
      story: "unknown",
      margin: null,
      marginRange: null,
      leaves: null,
      thread: null,
      wouldPayBack: null,
      short: null,
      crossing: null,
      after: null,
      unknown: { x: bx, y: by, width: bw, height: bh, cx: bx + bw / 2, cy: by + bh / 2 },
    };
  }

  const mm = mid(monthlyMargin);
  const lifeLo = Math.min(lifetime[0], PAYBACK_MONTHS);
  const endLo = mm * lifeLo;
  const pb = payback ? mid(payback) : null;
  const leavesFirst = story === "loss" && pb !== null;
  const margin = { x1: x(0), y1: y(0), x2: x(lifeLo), y2: y(endLo) };
  const marginRange = lifetime[1] > lifetime[0] ? { x1: x(lifeLo), y1: y(endLo), x2: x(lifeHi), y2: y(mm * lifeHi) } : null;
  const leaves = y(endLo) >= T ? { x: x(lifeLo), y: y(endLo) } : null;

  if (leavesFirst) {
    const bx = x(lifeLo) - 12;
    const beyond = pb > PAYBACK_MONTHS;
    return {
      ...base,
      story: "loss",
      margin,
      marginRange,
      leaves,
      thread: beyond ? null : { x1: x(lifeLo), y1: y(endLo), x2: x(pb), y2: costY, tickX: x(pb) },
      wouldPayBack: { x: x(pb), beyond },
      short: { path: `M ${bx + 8} ${costY} H ${bx} V ${y(endLo)} H ${bx + 8}`, labelX: bx - 8, labelY: (costY + y(endLo)) / 2 + 6 },
      crossing: null,
      after: null,
      unknown: null,
    };
  }

  const crossX = pb === null ? x(lifeLo) : x(pb);
  const byAfter = costY + 14;
  // The months after payback, when there are some on the plot: a possible loss drawn as paying back may have none.
  const hasAfter = pb !== null && x(lifeLo) - crossX >= 1;
  return {
    ...base,
    story: "pays-back",
    margin,
    marginRange,
    leaves,
    thread: null,
    wouldPayBack: null,
    short: null,
    crossing: pb === null ? null : { x: crossX, y: costY },
    after: !hasAfter
      ? null
      : {
          path: `M ${crossX} ${byAfter - 8} V ${byAfter} H ${x(lifeLo)} V ${byAfter - 8}`,
          x1: crossX,
          x2: x(lifeLo),
          width: x(lifeLo) - crossX,
          labelX: (crossX + x(lifeLo)) / 2,
          labelY: byAfter + 24,
        },
    unknown: null,
  };
}

/** A label's width on the slide's canvas, from its characters: 0.6em each, the widest of the slide's faces (its mono). */
export function estimateLabelWidth(chars: number, px = 18): number {
  return chars * px * 0.6;
}

/** The months-after bracket's width, in px, from which its label is centred under it: shorter, it ends at its right end. */
export const AFTER_CENTRED_FROM = 320;

export interface PaysBackLabels {
  /** The crossing's own label, ending left of it on the cost line's row — or null: the bracket's label says it. */
  crossing: { x: number; y: number } | null;
  /** The bracket's label: `after` (« ~4 mois de marge après ») or `time` (« remboursé à 5 à 6 mois, puis ~30 à 31 mois de marge »). */
  after: { text: "after" | "time"; x: number; y: number; anchor: "middle" | "end" } | null;
}

/**
 * Where the pays-back story's words go, at full size (A20.d T6, C50 — the
 * example's payback of 5 to 6 months): the crossing's label ends left of the
 * crossing, on the row of « ce que coûte un nouveau client », which starts at
 * the plot's left end. An early crossing leaves it no room there — it ran off
 * the slide and over the cost's words — so the crossing goes unlabelled and
 * the bracket says both, as the compact chart's line does (`time`), right of
 * the crossing, where the plot is empty under the cost line. In characters,
 * since a label's width is only known once drawn: `estimateLabelWidth` errs
 * wide.
 */
export function paysBackLabels(g: PaybackChartGeometry, chars: { paysBack: number; cost: number; time: number | null }, px = 18): PaysBackLabels {
  if (g.story !== "pays-back") return { crossing: null, after: null };
  const bracket = (text: "after" | "time", width: number) => {
    const a = g.after!;
    if (text === "after") return a.width < AFTER_CENTRED_FROM ? { text, x: a.x2, y: a.labelY + 6, anchor: "end" as const } : { text, x: a.labelX, y: a.labelY + 6, anchor: "middle" as const };
    // Centred under the bracket, kept right of the crossing and inside the plot; wider than that room, it ends at the plot's end.
    if (width > g.axis.x2 - a.x1) return { text, x: g.axis.x2, y: a.labelY + 6, anchor: "end" as const };
    return { text, x: Math.min(Math.max(a.labelX, a.x1 + width / 2), g.axis.x2 - width / 2), y: a.labelY + 6, anchor: "middle" as const };
  };
  const crossingFits =
    g.crossing !== null && g.crossing.x - 12 - estimateLabelWidth(chars.paysBack, px) >= g.cost.labelX + estimateLabelWidth(chars.cost, px) + 16;
  if (g.crossing && !crossingFits && g.after && chars.time !== null) {
    return { crossing: null, after: bracket("time", estimateLabelWidth(chars.time, px)) };
  }
  return {
    crossing: g.crossing ? { x: g.crossing.x - 12, y: g.crossing.y - 14 } : null,
    after: g.after ? bracket("after", 0) : null,
  };
}
