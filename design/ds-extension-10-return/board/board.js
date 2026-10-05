// Extension 10 — the marketplace's states board. Hand-written source, no
// build step: board.html?screen=<id>&lang=en|fr&w=390|1280[&vocab=services]
// (index.html lists them all). It imports the components' own files and the
// system through the bare name "tour-de-growth" (board.html's import map →
// sys/). Every figure comes from board/market.js on board/fixture.js.
import React, { render } from "./react-lite.js";
import { translator, frTypo } from "./copy.js";
import { SCREENS } from "./screens.js";
import * as F from "./fixture.js";
import { demand, supply, total, leakDemand, leakSupply, compounding } from "./market.js";
import { eur, pair, months as fmtMonths, pct as fmtPct, ratio as fmtRatio, sig, count, cents, dec, monthLabel, NNBSP } from "./fmt.js";
import { PageChrome, Verdict, Diagnosis, PanelLever, SlideFrame, SlideLeakBody, SlideWhatIfBody, SlideUnitBody, Stub, rich } from "./app.js";
import { Button, Disclosure, GlossaryTerm } from "tour-de-growth";
// The live engine components (synced 2026-10-04), drawn by their board
// stand-ins (sys/engine/): unchanged by this brief, but MrrCurve and
// NumberList, whose deltas the stand-ins carry.
import { EngineBar } from "./sys/engine/EngineBar.js";
import { NextStep } from "./sys/engine/NextStep.js";
import { NumberList } from "./sys/engine/NumberList.js";
import { EngineProgress } from "./sys/engine/EngineProgress.js";
import { MoneyBlock } from "./sys/engine/MoneyBlock.js";
import { WorthBars } from "./sys/engine/WorthBars.js";
import { MrrCurve } from "./sys/engine/MrrCurve.js";
import { LeverCard } from "./sys/engine/LeverCard.js";
import { WhatIfFigures } from "./sys/engine/WhatIfFigures.js";
import { LeverSum } from "./sys/engine/LeverSum.js";
import { TotalBand } from "./sys/engine/TotalBand.js";
import { PaybackChart } from "./sys/engine/PaybackChart.js";
// Extension 10's components: new.
import { SideShown } from "../components/engine/SideShown/SideShown.js";
import { SideFunnel } from "../components/engine/SideFunnel/SideFunnel.js";
import { SideNote } from "../components/engine/SideNote/SideNote.js";
import { SlideStreams } from "../components/engine/SlideStreams/SlideStreams.js";

const h = React.createElement;

// ── URL ────────────────────────────────────────────────────────────────────
const q = new URLSearchParams(location.search);
const screen = SCREENS.find((s) => s.id === q.get("screen")) ?? SCREENS[0];
const screenId = screen.id;
const lang = q.get("lang") === "fr" ? "fr" : "en";
const vocab = q.get("vocab") === "services" || (screen.vocab === "services" && q.get("vocab") !== "products") ? "services" : "products";
const SV = vocab === "services";
// No `w` (the design system pane, a plain link): draw at the window's width.
const width = q.has("w") ? (q.get("w") === "390" ? 390 : 1280) : window.innerWidth <= 760 ? 390 : 1280;
const phone = width === 390;
document.documentElement.lang = lang;

// The system's media queries read the viewport. When the window is not the
// asked width, the board draws itself in a frame of exactly that width.
const framing = q.has("w") && !q.has("framed") && Math.abs(window.innerWidth - width) > 2;
if (framing) {
  const frame = document.createElement("iframe");
  const url = new URL(location.href);
  url.searchParams.set("framed", "1");
  frame.src = url.toString();
  frame.title = `${screenId} · ${lang} · ${width}`;
  frame.className = "Board_frame";
  frame.style.width = `${width}px`;
  document.body.classList.add("Board_framing");
  document.getElementById("root").replaceWith(frame);
  frame.addEventListener("load", () => {
    const fit = () => { frame.style.height = `${frame.contentDocument.documentElement.scrollHeight}px`; };
    fit();
    setTimeout(fit, 300);
  });
}

const T = translator(lang, vocab);
const L = (p) => (p ? p[lang] : "");
const month = L(F.MONTH);
const cohort = L(F.COHORT);

// The column the side is drawn in: the engine's measure (720px) on a
// desktop, the phone's width less its gutters. Charts are drawn at their
// real width, so their type never scales.
const GUTTER = 20;
const colW = phone ? Math.min(window.innerWidth, 390) - 2 * GUTTER : 720;

// ── Figures, the house's way (board/fmt.js) ───────────────────────────────
const isRange = (r) => Array.isArray(r) && Math.abs(r[0] - r[1]) > 1e-9;
const money = (r) => eur(r, lang); // a fact: to the unit
const approx = (r) => eur(r, lang, { approx: true }); // projected or estimated
const factOr = (r) => (isRange(r) ? approx(r) : money(r));
const mo = (r, a = false) => fmtMonths(r, lang, { approx: a });
const moN = (n) => String(Math.round(n));
const pc = (x, d) => fmtPct(x, lang, d ?? (Array.isArray(x) ? 0 : Math.abs(x * 100 - Math.round(x * 100)) > 1e-6 ? 1 : 0));
const MINUS = "−";
const mid = (r) => (r[0] + r[1]) / 2;
const gainText = (n) => eur([sig(n, 2), sig(n, 2)], lang, { approx: true });
const chMoney = (n) => {
  if (Math.abs(n) < 0.5) return T("row.stable");
  const v = sig(Math.abs(n), 2);
  const body = lang === "fr" ? `${v.toLocaleString("fr-FR").replace(/\s/g, NNBSP)}${NNBSP}€` : `€${v.toLocaleString("en-US")}`;
  return `${n < 0 ? MINUS : "+"}${body}`;
};
const chMonths = (a, b) => {
  const d = Math.round(b - a);
  return d === 0 ? T("row.stable") : `${d < 0 ? MINUS : "+"}${fmtMonths([Math.abs(d), Math.abs(d)], lang)}`;
};
const chRatio = (a, b) => (Math.abs(b - a) < 0.005 ? T("row.stable") : `${b < a ? MINUS : "+"}${fmtRatio([Math.abs(b - a), Math.abs(b - a)], lang)}`);
const kindWord = () => T(SV ? "funnel.kind.requests" : "funnel.kind.searches");

// ── The marketplace (board/market.js on board/fixture.js) ─────────────────
const D0 = demand(F.DEMAND);
const D1 = demand(F.DEMAND, F.WHATIF.demand);
const DN = demand(F.DEMAND_NOMARGIN);
const S0 = supply(F.SUPPLY);
const S1 = supply(F.SUPPLY, F.WHATIF.supply);
const T0 = total(D0, S0);
const T1 = total(D1, S1);
const LEAK_D = leakDemand(F.DEMAND);
const LEAK_S = leakSupply(F.SUPPLY);
// What the take rate's re-pricing adds a month on today's buyers (the jump
// at month 1, said under the curve).
const REPRICE = F.DEMAND.activeBuyers * F.DEMAND.frequency * F.DEMAND.aov * (F.WHATIF.demand.takeRate - F.DEMAND.takeRate);

// ── Shared bits ───────────────────────────────────────────────────────────
const glossaryProps = {
  locale: lang,
  openId: "",
  onOpenChange: () => {},
  closeLabel: T("term.close"),
  labelTemplate: lang === "fr" ? frTypo("Définition : {term}") : "Definition: {term}",
  moreLabel: null,
};
// The engine's "?" (EngineTerm in the app): the term's "?" alone, after the
// words that say it, held to the last word by a no-break space.
const Term = (id, open = false) => {
  const key = SV ? `${id}@services` : id;
  return h(GlossaryTerm, { ...glossaryProps, id: key, openId: open ? key : "", children: "" });
};
const withTerm = (text, id, open) => [text, " ", Term(id, open)];
const OPEN = { "term-gmv": "gmv", "term-take": "takeRate", "term-liquidity": "liquidity", "term-net": "netRevenue" }[screenId] ?? null;
const isOpen = (id) => OPEN === id;

// ── Shared: the engine bar, the total, the next step ──────────────────────
const engineBar = () =>
  h(EngineBar, { line: T("bar.line", { month }), pending: T("bar.neverSaved"), menuLabel: T("bar.menu"), settingsLabel: T("bar.settings"), groups: [] });

const totalBand = ({ moved = false } = {}) =>
  h("div", { "data-measure": "total" },
    h(TotalBand, {
      eyebrow: T("total.eyebrow"),
      title: rich(T("total.title", { total: money(T0.thisMonth), demand: money(D0.thisMonth), supply: money(S0.thisMonth) })),
      engines: [
        { id: "demand", label: T("total.demand"), value: money(D0.thisMonth) },
        { id: "supply", label: T("total.supply"), value: money(S0.thisMonth) },
      ],
      total: { label: T("total.total"), value: money(T0.thisMonth) },
      totals: [
        { key: "annual", label: T("total.annual"), value: money(T0.annual) },
        { key: "fresh", label: T("total.fresh"), value: approx(T0.fresh) },
        moved
          ? { key: "in12", label: T("total.in12Moved"), value: approx(T1.in12) }
          : { key: "in12", label: T("total.in12"), value: approx(T0.in12) },
      ],
      link: moved ? T("total.todayLine", { today: approx(T0.in12) }) : null,
    }));

const nextStep = (subs = true) =>
  h(NextStep, {
    eyebrow: T("next.since"),
    lead: T("next.complete"),
    primary: { label: T("next.go.slides") },
    lines: [
      { text: T(subs ? "next.totalIsSlide" : "next.buyersIsSlide") },
      { text: T("next.backup"), tone: "advice", action: h(Button, { variant: "quiet", size: "sm" }, T("next.saveNow")) },
    ],
  });

const sideShown = (side) =>
  h("div", { "data-measure": "selector" },
    h(SideShown, {
      label: T("side.label"),
      sides: [{ id: "demand", label: T("side.demand") }, { id: "supply", label: T("side.supply") }],
      value: side,
      title: T(`side.title.${side}`),
      note: T("side.note"),
    }));

// ── A side's verdict and diagnosis ────────────────────────────────────────
const verdictDemand = () => h(Verdict, { text: T("verdict.demand", { first: "20", second: "5" }) });
const verdictSupply = (subs = true) =>
  h(Verdict, { text: subs ? T("verdict.supply", { first: "30", subs: "15" }) : T("verdict.supplyNoSubs", { first: "30" }) });

const diagDemand = () => {
  const [fill, first] = LEAK_D;
  return h(Diagnosis, {
    eyebrow: T("diag.eyebrow.demand"),
    stage: "Activation",
    number: T("num.mk:fill-rate"),
    value: T("diag.value.below", { value: pc(fill.value), target: pc(fill.target) }),
    worth: T("diag.worth.demand", { target: pc(fill.target), worth: gainText(fill.worth) }),
    aside: T("diag.aside.demand", { value: pc(first.value), target: pc(first.target), worth: gainText(first.worth) }),
    top: T("diag.top"),
  });
};

const diagSupply = () => {
  const [conv, churn, fs] = LEAK_S;
  return h(Diagnosis, {
    eyebrow: T("diag.eyebrow.supply"),
    stage: "Revenue",
    number: T("num.mk:subscription-conversion"),
    value: T("diag.value.below", { value: pc(conv.value), target: pc(conv.target) }),
    worth: T("diag.worth.supply", { target: pc(conv.target), worth: gainText(conv.worth) }),
    aside: T("diag.aside.supply", { value: pc(churn.value), target: pc(churn.target, 1), worth: gainText(churn.worth), fs: pc(fs.value), fsTarget: pc(fs.target) }),
    top: T("diag.top"),
  });
};

// ── A side's money (MoneyBlock) ───────────────────────────────────────────
const bars = (m, unknown) => {
  const cost = { label: T("worth.costs"), value: factOr(m.cost), amount: m.cost };
  if (!m.ltv) return h(WorthBars, { size: "screen", cost, brings: { label: T("worth.brings"), value: "?", amount: null, unknown } });
  return h(WorthBars, {
    size: "screen",
    cost,
    brings: { label: T("worth.brings"), value: approx(m.ltv), amount: m.ltv },
    gap: { kind: "more", label: T("worth.more", { gap: approx(m.gap) }) },
  });
};

const cashPart = (m, side) => ({
  title: T("cash.title"),
  facts: [
    { key: "spend", label: T("cash.spend"), value: money(m.spend) },
    { key: "tied", label: withTerm(T("cash.tied"), "cashTied"), value: m.cash ? approx(m.cash) : "?", missing: m.cash ? null : T("worth.missing.demand") },
  ],
  line: m.cash ? T(`cash.line.${side}`) : T("cash.lineNone.demand"),
  assumptions: m.cash ? T("cash.assumptions") : null,
});

const perBuyer = () => [
  T("worth.perBuyer", { per: cents(D0.perBuyer[0], lang), freq: dec(F.DEMAND.frequency, lang), aov: money(F.DEMAND.aov), take: pc(F.DEMAND.takeRate) }),
  " ", Term("takeRate", isOpen("takeRate")),
];

const moneyDemand = (m = D0, { subs = true } = {}) => {
  const figures = [
    ...(subs ? [] : [{ key: "net", label: T("money.net"), value: money(m.thisMonth) }]),
    { key: "annual", label: withTerm(T("money.netAnnual"), "netRevenue", isOpen("netRevenue")), value: money(m.annual) },
    { key: "gmv", label: withTerm(T("money.gmv"), "gmv", isOpen("gmv")), value: money(m.gmv) },
  ];
  const worth = !m.ltv
    ? { title: T("worth.title.demand"), finding: T("worth.none.demand"), bars: bars(m, T("worth.missing.demand")), months: T("worth.noneNote.demand"), note: perBuyer() }
    : {
        title: T("worth.title.demand"),
        finding: T("worth.healthy.demand", { cost: factOr(m.cost), ltv: approx(m.ltv), gap: approx(m.gap) }),
        bars: bars(m),
        months: [T("worth.months.demand", { payback: mo(m.payback), life: mo(m.lifetime, true), after: mo(m.after, true) }), " ", Term("after")],
        note: perBuyer(),
      };
  return h("div", { "data-measure": "money" },
    h(MoneyBlock, { eyebrow: T("money.eyebrow", { month }), figures, worth, cash: cashPart(m, "demand") }));
};

const moneySupply = (m = S0) =>
  h("div", { "data-measure": "money" },
    h(MoneyBlock, {
      eyebrow: T("money.eyebrow", { month }),
      figures: [{ key: "annual", label: T("money.subAnnual"), value: money(m.annual) }],
      worth: {
        title: T("worth.title.supply"),
        finding: T("worth.healthy.supply", { cost: factOr(m.cost), ltv: approx(m.ltv), gap: approx(m.gap) }),
        bars: bars(m),
        months: [T("worth.months.supply", { payback: mo(m.payback), life: mo(m.lifetime, true), after: mo(m.after, true) }), " ", Term("after")],
        note: T("worth.costExplained", {
          cpa: money(F.SUPPLY.costPerActive), fs: pc(F.SUPPLY.firstSale), conv: pc(F.SUPPLY.conversion),
          cost: money(m.cost), n: String(Math.round(F.SUPPLY.firstSale / F.SUPPLY.conversion)),
        }),
      },
      cash: cashPart(m, "supply"),
    }));

// Supply without the subscriptions: the money's place, said in words.
const supplyNoMoney = () =>
  h("div", { "data-measure": "money" },
    h(SideNote, {
      kind: "absent",
      eyebrow: T("money.eyebrow", { month }),
      title: T("note.money.title"),
      headingId: "supply-money",
      action: h(Button, { variant: "quiet" }, T("note.money.action")),
    },
      h("p", null, T("note.money.body")),
      h("p", null, T("note.money.whatif"))));

const supplyTargets = () =>
  h(SideNote, {
    kind: "pending",
    title: T("note.targets.title"),
    headingId: "supply-targets",
    action: h(Button, { variant: "quiet" }, T("note.targets.action")),
  },
    h("p", null, T("note.targets.body", { target: pc(F.SUPPLY_NOSUBS.targets.firstSale), value: pc(F.SUPPLY_NOSUBS.firstSale) })));

// ── "What if?" — the card and its curve ───────────────────────────────────
const xLabels = [monthLabel(0, lang), monthLabel(6, lang), monthLabel(12, lang)];
const isMoneyMove = (side, w) => Object.keys(w).some((k) => F.LEVERS[side].find((l) => l.key === k)?.money);

const curve = (side, m0, m1, w = {}, { slide = false, id = `${side}-curve`, cw = colW, height } = {}) => {
  const step = m1 && isMoneyMove(side, w);
  return h(MrrCurve, {
    today: m0.curve,
    whatif: m1 ? m1.curve : null,
    width: cw,
    height: height ?? (slide ? 380 : phone ? 170 : 200),
    medium: slide ? "slide" : "screen",
    keys: { today: T("curve.today"), whatif: T(slide ? "curve.whatifSlide" : "curve.whatif") },
    start: T("curve.start", { value: money(m0.thisMonth) }),
    xLabels,
    id,
    step,
    note: step ? T("curve.step.demand", { take: pc(w.takeRate), step: gainText(REPRICE) }) : null,
    summary: m1
      ? T("curve.summaryWhatif", { what: T(`curve.what.${side}`), start: money(m0.thisMonth), today: approx(m0.in12), whatif: approx(m1.in12) })
      : T("curve.summary", { what: T(`curve.what.${side}`), start: money(m0.thisMonth), today: approx(m0.in12) }),
  });
};

const leverName = (key) => T(`lever.${key}`);
const leverText = (side, key, value) => {
  const l = F.LEVERS[side].find((x) => x.key === key);
  if (l.unit === "eur") return money(value);
  if (l.unit === "times") return dec(value, lang);
  return pc(value, l.digits ?? 0);
};

const CARD_LEVER = { demand: "fillRate", supply: "conversion" };

const card = (side, w = {}, { base } = {}) => {
  const e = side === "demand" ? (base ?? F.DEMAND) : F.SUPPLY;
  const fn = side === "demand" ? demand : supply;
  const m0 = fn(e);
  const moved = Object.keys(w).length > 0;
  const m1 = moved ? fn(e, w) : null;
  const key = CARD_LEVER[side];
  const keys = Object.keys(w);
  const title = !moved ? T("whatif.untouched")
    : keys.length > 1 ? T("whatif.movedThree")
    : T("whatif.moved", { lever: leverName(keys[0]).toLowerCase(), to: leverText(side, keys[0], w[keys[0]]), from: leverText(side, keys[0], e[keys[0]]) });
  const value = w[key] ?? e[key];
  const [t12, w12] = moved ? pair(m0.in12, m1.in12, lang) : [approx(m0.in12), null];
  const [tA, wA] = moved ? pair(m0.annual12, m1.annual12, lang) : [approx(m0.annual12), null];
  return h("div", { "data-measure": "lever" },
    h(LeverCard, {
      eyebrow: T("whatif.title"),
      title,
      lever: {
        id: `lever-${key}`,
        label: T("whatif.lever", { lever: leverName(key), value: pc(e[key]) }),
        min: 0, max: 60, step: 1,
        value: value * 100,
        valueText: pc(value),
      },
      curve: curve(side, m0, m1, w),
      figures: [
        { key: "in12", label: T(side === "demand" ? "whatif.net12" : "whatif.sub12"), value: moved ? w12 : t12, today: moved ? T("whatif.today", { value: t12 }) : null },
        { key: "annual12", label: T("whatif.netAnnual12"), value: moved ? wA : tA, today: moved ? T("whatif.today", { value: tA }) : null },
      ],
      allLabel: T(`whatif.all.${side}`),
      resetLabel: T("whatif.reset"),
      moved,
    }));
};

// ── "What if?" — the panel ────────────────────────────────────────────────
const gapText = (g) => (!g ? "?" : T("row.more", { gap: approx(g) }));

const figureGroups = (side, m0, m1) => {
  const moved = !!m1;
  const one = (today, whatif, change) => (moved ? { today, whatif, change } : { today });
  const b = m1 ?? m0;
  const miss = side === "demand" && !m0.ltv ? T("worth.missing.demand") : null;
  const rowMoney = (id, label, a, bb) => {
    if (!a) return { id, label, missing: miss, ...one("?", "?", "?") };
    const [ta, tb] = moved ? pair(a, bb, lang) : [approx(a), null];
    return { id, label, ...one(ta, tb, moved ? chMoney(mid(bb) - mid(a)) : null) };
  };
  const rowMonths = (id, label, a, bb) => {
    if (!a) return { id, label, missing: miss, ...one("?", "?", "?") };
    return { id, label, ...one(mo(a), moved ? mo(bb) : null, moved ? chMonths(mid(a), mid(bb)) : null) };
  };
  const rowCount = (id, label, a, bb) => ({ id, label, ...one(count(a, lang), moved ? count(bb, lang) : null, moved ? (Math.round(bb - a) === 0 ? T("row.stable") : `+${count(bb - a, lang)}`) : null) });
  const costRow = { id: "cost", label: T(`row.cost.${side}`), ...one(factOr(m0.cost), moved ? (Math.abs(mid(b.cost) - mid(m0.cost)) < 0.5 ? factOr(b.cost) : approx(b.cost)) : null, moved ? chMoney(mid(b.cost) - mid(m0.cost)) : null) };
  const ratioRow = { id: "ratio", label: T("row.ratio"), missing: m0.ratio ? null : miss, ...one(fmtRatio(m0.ratio, lang), moved ? fmtRatio(b.ratio, lang) : null, moved && m0.ratio ? chRatio(mid(m0.ratio), mid(b.ratio)) : moved ? "?" : null) };
  const gapRow = { id: "gap", label: T(`row.gap.${side}`), missing: m0.gap ? null : miss, ...one(gapText(m0.gap), moved ? gapText(b.gap) : null, moved && m0.gap ? chMoney(mid(b.gap) - mid(m0.gap)) : moved ? "?" : null) };
  const afterRow = { id: "after", label: T("row.after"), missing: m0.after ? null : miss, ...one(m0.after ? mo(m0.after, true) : "?", moved ? (b.after ? mo(b.after, true) : "?") : null, moved && m0.after ? chMonths(mid(m0.after), mid(b.after)) : moved ? "?" : null) };
  return [
    {
      id: "growth",
      title: T(`panel.group.growth.${side}`),
      rows: [
        rowMoney("fresh", T(`row.fresh.${side}`), m0.fresh, b.fresh),
        side === "demand" ? rowCount("new", T("row.new.demand"), m0.newBuyers, b.newBuyers) : rowCount("new", T("row.new.supply"), m0.newPaid, b.newPaid),
      ],
    },
    {
      id: "unit",
      title: T(`panel.group.unit.${side}`),
      rows: [costRow, rowMoney("ltv", T("row.ltv"), m0.ltv, b.ltv), ratioRow, gapRow, rowMonths("payback", T("row.payback"), m0.payback, b.payback), afterRow],
    },
    {
      id: "cash",
      title: T("panel.group.cash"),
      rows: [
        { id: "spend", label: T("row.spend"), ...one(money(m0.spend), moved ? money(m0.spend) : null, moved ? T("row.stable") : null) },
        rowMoney("cash", T("row.cash"), m0.cash, b.cash),
      ],
    },
  ];
};

const leverSum = (w, size = "screen", { withExtra = true } = {}) => {
  const levers = Object.entries(w).map(([key, to]) => ({ key, to }));
  levers.sort((a, b) => F.LEVERS.demand.findIndex((l) => l.key === a.key) - F.LEVERS.demand.findIndex((l) => l.key === b.key));
  const c = compounding(demand, F.DEMAND, levers);
  return h(LeverSum, {
    title: T("sum.title.demand"),
    rows: c.alone.map((l) => ({ id: l.key, label: T("sum.lever", { lever: leverName(l.key), from: leverText("demand", l.key, F.DEMAND[l.key]), to: leverText("demand", l.key, l.to) }), value: chMoney(l.gain), amount: l.gain })),
    sum: { label: T("sum.oneByOne"), value: chMoney(c.sum), amount: c.sum },
    together: { label: T("sum.together"), value: chMoney(c.together), amount: c.together },
    extra: withExtra ? T("sum.extra", { extra: gainText(c.extra) }) : null,
    size,
  });
};

const panel = (side, w = {}, { base } = {}) => {
  const e = side === "demand" ? (base ?? F.DEMAND) : F.SUPPLY;
  const fn = side === "demand" ? demand : supply;
  const m0 = fn(e);
  const moved = Object.keys(w).length > 0;
  const m1 = moved ? fn(e, w) : null;
  return h("section", { className: "Board_panel", "data-measure": "panel", "aria-label": T("whatif.title") },
    h("p", { className: "Board_p" }, T(side === "demand" ? "panel.intro" : "panel.intro.supply")),
    h("div", { className: "Board_panelGrid" },
      h("div", { className: "Board_panelLevers" },
        h("h3", { className: "Board_h3" }, T("panel.levers")),
        F.LEVERS[side].map((l) => {
          const val = w[l.key] ?? e[l.key];
          const scale = l.unit === "pct" ? 100 : 1;
          return h(PanelLever, {
            key: l.key,
            id: `panel-${l.key}`,
            label: leverName(l.key),
            valueText: leverText(side, l.key, val),
            value: val * scale, min: l.min * scale, max: l.max * scale, step: l.step * scale,
            today: T("whatif.today", { value: leverText(side, l.key, e[l.key]) }),
            moved: w[l.key] != null,
          });
        }),
        moved ? h(Button, { variant: "quiet", className: "Board_allBack" }, T("panel.allBack")) : null),
      h("div", { className: "Board_panelFigures" },
        h("h3", { className: "Board_h3" }, T("panel.figures")),
        h(WhatIfFigures, {
          moved,
          columns: { figure: T("panel.col.figure"), today: T("panel.col.today"), whatif: T("panel.col.whatif"), change: T("panel.col.change") },
          todayLine: (value) => T("whatif.today", { value }),
          groups: figureGroups(side, m0, m1),
        }),
        moved ? null : h("p", { className: "Board_meta" }, T("panel.untouchedNote")),
        side === "demand" && Object.keys(w).length > 1 ? leverSum(w) : null)),
    h(Disclosure, { summary: T("panel.assumptions"), size: "md", rule: true },
      h("p", { className: "Board_p" }, T(`panel.assume.${side}`))));
};

// ── The funnels (SideFunnel) ──────────────────────────────────────────────
const dots = (n, { referred = 0 } = {}) => Array.from({ length: 100 }, (_, i) => (i < referred ? "referred" : i < n ? "filled" : "empty"));
const known = (n, o) => ({ kind: "known", dots: dots(n, o) });

const funnelDemand = (medium = "screen") => {
  const fillPct = Math.round(F.DEMAND.fillRate * 100);
  return h("div", { "data-measure": medium === "screen" ? "funnel" : undefined },
    h(SideFunnel, {
      medium,
      headingId: `funnel-demand-${medium}`,
      title: T("funnel.title.demand"),
      upstream: T("funnel.upstream.demand", { visitors: count(100 / F.DEMAND.signupRate, lang), month }),
      columns: [
        { id: "signups", n: "100", label: T("funnel.signups.demand"), grid: known(100, { referred: 8 }), source: T("funnel.src.signups", { n: count(F.DEMAND.signups, lang), cohort }) },
        { id: "first", n: "20", label: T("funnel.firstOrder", { n: F.WINDOWS.firstOrder }), grid: known(20), source: T("funnel.src.analytics", { cohort }) },
        { id: "second", n: "5", label: T("funnel.secondOrder", { n: F.WINDOWS.secondOrder }), grid: known(5), source: T("funnel.src.analytics", { cohort }) },
      ],
      base: {
        title: withTerm(T("funnel.liquidity", { kind: kindWord() }), "liquidity", isOpen("liquidity")),
        column: { id: "fill", n: String(fillPct), label: T("funnel.fill"), grid: known(fillPct), holds: { label: T("funnel.underTarget") }, source: T("funnel.src.backoffice", { cohort: month }) },
        line: T("funnel.fillLine", { fill: pc(F.DEMAND.fillRate), kind: kindWord() }),
      },
      note: medium === "screen" ? T("funnel.note.demand", { n: count(F.DEMAND.signups, lang), cohort, kind: kindWord() }) : null,
      legend: [
        { kind: "referred", label: T("legend.referred", { n: 8 }) },
        { kind: "filled", label: T("legend.measured") },
      ],
    }));
};

const funnelSupply = (medium = "screen", { subs = true } = {}) => {
  const e = subs ? F.SUPPLY : F.SUPPLY_NOSUBS;
  const columns = [
    { id: "signups", n: "100", label: T("funnel.signups.supply"), grid: known(100), source: T("funnel.src.signups", { n: count(e.sellerSignups, lang), cohort }) },
    { id: "first", n: "30", label: T("funnel.firstSale", { n: F.WINDOWS.firstSale }), grid: known(30), source: T("funnel.src.backoffice", { cohort }) },
  ];
  if (subs) columns.push({ id: "subs", n: "15", label: T("funnel.subscribed", { n: F.WINDOWS.subscribed }), grid: known(15), holds: { label: T("funnel.underTarget") }, source: "Stripe · " + cohort });
  const rates = [{ id: "seller", label: T("funnel.sellerChurn"), value: pc(e.sellerChurn) }];
  if (subs) rates.push({ id: "paid", label: T("funnel.paidChurn"), value: pc(e.paidChurn), note: T("funnel.rateTargetOnly", { target: pc(e.targets.paidChurn, 1) }) });
  return h("div", { "data-measure": medium === "screen" ? "funnel" : undefined },
    h(SideFunnel, {
      medium,
      headingId: `funnel-supply-${medium}`,
      title: T("funnel.title.supply"),
      upstream: T("funnel.upstream.supply", { visitors: count(100 / e.signupRate, lang), month }),
      columns,
      rates,
      ratesTitle: T("funnel.rates"),
      aside: subs ? null : T("funnel.liquidityAside", { fill: pc(F.DEMAND.fillRate), kind: kindWord() }),
      note: medium === "screen" ? T("funnel.note.supply", { n: count(e.sellerSignups, lang), cohort }) : null,
      legend: [{ kind: "filled", label: T("legend.measured") }],
    }));
};

// ── "Your numbers" (NumberList, with the side) ────────────────────────────
const STATUS_WORD = { found: "status.found", est: "status.est", asked: "status.asked", cant: "status.cant", todo: "status.todo" };
const valueText = ([, kind, x]) => (kind === "eur" ? money(x) : kind === "times" ? dec(x, lang) : pc(x));

const numberList = (side, { subs = true } = {}) => {
  const nums = F.NUMBERS.filter((n) => subs || !n.subs);
  const holdsStage = side === "demand" ? "Activation" : subs ? "Revenue" : null;
  const counts = { found: 0, est: 0, asked: 0, cant: 0 };
  for (const n of nums) counts[F.VALUES[n.id][0]] += 1;
  const marksOf = (list) => list.map((n) => F.VALUES[n.id][0]);
  return h("div", { "data-measure": "list" },
    h(NumberList, {
      title: T("list.title"),
      lead: T("list.lead"),
      progress: h(EngineProgress, {
        remaining: T("progress.noneToGo"),
        counts: T("progress.counts", counts),
        groups: F.STAGES.map((stage) => ({ id: stage, label: stage, marks: marksOf(nums.filter((n) => n.stage === stage)) })),
        legend: ["found", "est", "asked", "cant", "todo"].map((st) => ({ status: st, label: T(STATUS_WORD[st]) })),
        legendLabel: T("progress.legendLabel"),
        label: T("list.title"),
      }),
      stages: F.STAGES.map((stage) => {
        const rows = nums.filter((n) => n.stage === stage);
        const found = rows.filter((n) => F.VALUES[n.id][0] === "found").length;
        return {
          id: stage,
          name: stage,
          holdsBack: stage === holdsStage,
          holdsLabel: T("list.holds"),
          foundLabel: T("list.found", { found, n: rows.length }),
          marks: marksOf(rows),
          rows: rows.map((n) => {
            const val = F.VALUES[n.id];
            return {
              id: n.id,
              side: T(`list.side.${n.side}`),
              name: T(`num.${n.id}`),
              value: n.id === "mk:fill-rate" || n.id === "mk:take-rate" ? valueText(val) : valueText(val),
              status: val[0],
              statusLabel: T(STATUS_WORD[val[0]]),
            };
          }),
        };
      }),
    }));
};

const tourMirror = () =>
  h(Disclosure, { summary: T("tour.title"), size: "md", rule: true, className: "Board_tour" }, h("p", { className: "Board_p" }, "…"));

// ── The board ─────────────────────────────────────────────────────────────
// Shared above the selector: the engine bar, the total, the next step.
// Under it, the shown side in self-serve's reading order (C54): its
// verdict, its diagnosis, its money, its "What if?", its funnel (the one
// raised card). Then the list, both sides, by stage.
const demandPart = ({ subs = true, base, w = {}, panelOpen = false } = {}) => {
  const m = base ? demand(base) : D0;
  return [
    verdictDemand(),
    diagDemand(),
    moneyDemand(m, { subs }),
    card("demand", w, { base }),
    panelOpen ? panel("demand", w, { base }) : null,
    funnelDemand(),
  ];
};

const supplyPart = ({ subs = true, w = {}, panelOpen = false } = {}) =>
  subs
    ? [verdictSupply(), diagSupply(), moneySupply(), card("supply", w), panelOpen ? panel("supply", w) : null, funnelSupply()]
    : [verdictSupply(false), supplyTargets(), supplyNoMoney(), funnelSupply("screen", { subs: false })];

const board = ({ side = "demand", subs = true, base, moved = false } = {}) => [
  engineBar(),
  subs ? totalBand({ moved }) : null,
  nextStep(subs),
  sideShown(side),
  ...(side === "demand" ? demandPart({ subs, base }) : supplyPart({ subs })),
  numberList(side, { subs }),
  tourMirror(),
];

// The counterfactual the selector avoids: both sides stacked.
const stacked = () => [
  engineBar(), totalBand(), nextStep(),
  h(Stub, null, T("side.title.demand")), ...demandPart(),
  h(Stub, null, T("side.title.supply")), ...supplyPart(),
  numberList("demand"), tourMirror(),
];

const returningPage = (...toolChildren) =>
  h(PageChrome, { lang, phone },
    h("div", { "data-engine": "known", className: "Board_pageInner" },
      h("div", { className: "Board_tool", id: "engine", "data-measure": "tool" }, ...toolChildren)));

const tool = (...children) => h("div", { className: "Board_toolOnly" }, h("div", { className: "Board_tool", "data-measure": "tool" }, ...children));

// ── The slides ────────────────────────────────────────────────────────────
const slideScale = phone ? colW / 1920 : 0.5;
const badge = (k = "subs") => T("slide.badge", { m: F.BADGE[k].measured, a: F.BADGE[k].approx, n: F.BADGE[k].cant });
const slide = ({ title, body, foot, page, side, scale = slideScale, badgeKey }) =>
  h("div", { className: "Board_slide", "data-measure": "slide" },
    h(SlideFrame, {
      header: T("slide.header", { month }),
      badge: badge(badgeKey),
      side: side ? T(`side.title.${side}`) : null,
      title,
      footLeft: foot ?? T(side === "supply" ? "slide.sources.supply" : side === "demand" ? "slide.sources.demand" : "slide.sources.total", { month, cohort }),
      page,
      scale,
    }, body));

const slideFunnelDemand = (o = {}) => slide({ title: T("verdict.demand", { first: "20", second: "5" }), side: "demand", page: "2/10", body: funnelDemand("slide"), ...o });
const slideFunnelSupply = (o = {}) => slide({ title: T("verdict.supply", { first: "30", subs: "15" }), side: "supply", page: "6/10", body: funnelSupply("slide"), ...o });
const slideFunnelSupplyNoSubs = (o = {}) => slide({ title: T("verdict.supplyNoSubs", { first: "30" }), side: "supply", page: "5/5", badgeKey: "nosubs", body: funnelSupply("slide", { subs: false }), ...o });

const slideLeakDemand = (o = {}) => {
  const [fill, first] = LEAK_D;
  const after = D0.newBuyersToday * fill.target / fill.value;
  return slide({
    title: T("slide.leak.titleDemand", { target: pc(fill.target), worth: gainText(fill.worth) }),
    side: "demand", page: "3/10",
    body: h(SlideLeakBody, {
      calcTitle: T("slide.leak.calc"),
      rows: [
        { k: T("slide.leak.today"), v: T("slide.leak.todayDemand", { fill: pc(fill.value), signups: count(F.DEMAND.signups, lang), first: pc(F.DEMAND.firstOrder), buyers: count(D0.newBuyersToday, lang) }) },
        { k: T("slide.leak.if"), v: T("slide.leak.ifDemand", { target: pc(fill.target) }) },
        { k: T("slide.leak.then"), v: T("slide.leak.thenDemand", { buyers: count(D0.newBuyersToday, lang), target: pc(fill.target), fill: pc(fill.value), after: count(after, lang) }) },
        { k: T("slide.leak.each"), v: T("slide.leak.eachDemand", { per: cents(D0.perBuyer[0], lang) }) },
      ],
      result: T("slide.leak.resultDemand", { worth: gainText(fill.worth) }),
      besideTitle: T("slide.leak.beside"),
      beside: [
        { name: T("slide.leak.besideFirst"), note: T("slide.leak.besideWorth", { value: pc(first.value), target: pc(first.target), worth: gainText(first.worth) }) },
        { name: T("num.mk:second-order"), note: T("slide.leak.noTarget") },
        { name: T("num.mk:buyer-churn"), note: T("slide.leak.noTarget") },
        { name: T("num.mk:referred-share"), note: T("slide.leak.noTarget") },
      ],
    }),
    ...o,
  });
};

const slideLeakSupply = (o = {}) => {
  const [conv, churn, fs] = LEAK_S;
  return slide({
    title: T("slide.leak.titleSupply", { target: pc(conv.target), worth: gainText(conv.worth) }),
    side: "supply", page: "7/10",
    body: h(SlideLeakBody, {
      calcTitle: T("slide.leak.calc"),
      rows: [
        { k: T("slide.leak.today"), v: T("slide.leak.todaySupply", { conv: pc(conv.value), signups: count(F.SUPPLY.sellerSignups, lang), paid: count(S0.newPaidToday, lang) }) },
        { k: T("slide.leak.if"), v: T("slide.leak.ifSupply", { target: pc(conv.target) }) },
        { k: T("slide.leak.then"), v: T("slide.leak.thenSupply", { signups: count(F.SUPPLY.sellerSignups, lang), target: pc(conv.target), after: count(F.SUPPLY.sellerSignups * conv.target, lang) }) },
        { k: T("slide.leak.each"), v: T("slide.leak.eachSupply", { price: money(F.SUPPLY.price) }) },
      ],
      result: T("slide.leak.resultSupply", { worth: gainText(conv.worth) }),
      besideTitle: T("slide.leak.beside"),
      beside: [
        { name: T("num.mk:paid-seller-churn"), note: T("slide.leak.besideKept", { value: pc(churn.value), target: pc(churn.target, 1), worth: gainText(churn.worth) }) },
        { name: T("num.mk:first-sale"), note: T("slide.leak.besideNamed", { value: pc(fs.value), target: pc(fs.target) }) },
        { name: T("num.mk:seller-churn"), note: T("slide.leak.noTarget") },
      ],
    }),
    ...o,
  });
};

const whatifTable = (side, m0, m1, ids) => {
  const head = side === "demand"
    ? { id: "in12", label: T("row.net12") }
    : { id: "in12", label: T("row.sub12") };
  const [ta, tb] = pair(m0.in12, m1.in12, lang);
  const rows = [{ id: head.id, label: head.label, today: ta, whatif: tb, change: chMoney(mid(m1.in12) - mid(m0.in12)) },
    ...figureGroups(side, m0, m1).flatMap((g) => g.rows).filter((r) => ids.includes(r.id))];
  return {
    caption: T("slide.whatif.figures"),
    columns: [
      { key: "figure", header: "" },
      { key: "today", header: T("panel.col.today"), numeric: true },
      { key: "whatif", header: T("slide.whatif.with"), numeric: true },
      { key: "change", header: T("panel.col.change"), numeric: true },
    ],
    rows: rows.map((r) => ({ id: r.id, cells: { figure: r.label, today: r.today, whatif: r.whatif, change: r.change } })),
  };
};

const slideWhatIfDemand = (o = {}) =>
  slide({
    title: T("slide.whatif.titleDemand", { gain: gainText(mid(D1.in12) - mid(D0.in12)) }),
    side: "demand", page: "4/10",
    foot: T("slide.whatif.assumeDemand"),
    body: h(SlideWhatIfBody, {
      curve: curve("demand", D0, D1, F.WHATIF.demand, { slide: true, id: "slide-demand-curve", cw: 820, height: 330 }),
      figures: whatifTable("demand", D0, D1, ["fresh", "cost", "ltv", "payback", "cash"]),
      sum: leverSum(F.WHATIF.demand, "slide", { withExtra: false }),
    }),
    ...o,
  });

const slideWhatIfSupply = (o = {}) =>
  slide({
    title: T("slide.whatif.titleSupply", { to: pc(F.WHATIF.supply.conversion), from: pc(F.SUPPLY.conversion), gain: gainText(mid(S1.in12) - mid(S0.in12)) }),
    side: "supply", page: "8/10",
    foot: T("slide.whatif.assumeSupply"),
    body: h(SlideWhatIfBody, {
      curve: curve("supply", S0, S1, F.WHATIF.supply, { slide: true, id: "slide-supply-curve", cw: 820, height: 400 }),
      figures: whatifTable("supply", S0, S1, ["fresh", "new", "cost", "ltv", "ratio", "payback", "cash"]),
    }),
    ...o,
  });

const paybackChart = (side, m, { width = 1720, height = 300, id } = {}) =>
  h(PaybackChart, {
    story: "pays-back",
    monthlyMargin: m.monthlyMargin, cac: m.cost, lifetime: m.lifetime, payback: m.payback,
    reference: null, // C73: no reference at all.
    width, height, id: id ?? `payback-${side}`,
    labels: {
      months: T("slide.chart.months").split("|"),
      cost: T(`slide.chart.cost.${side}`),
      leaves: T("slide.chart.leaves", { life: moN(m.lifetime[0]) }),
      paysBack: T("slide.chart.paysBack", { payback: moN(mid(m.payback)) }),
      after: T("slide.chart.after", { after: moN(m.after[0]) }),
      unknown: T("worth.missing.demand"),
    },
    summary: T("slide.chart.summary", { unit: T(side === "demand" ? "list.side.buyers" : "list.side.sellers").toLowerCase(), mm: approx(m.monthlyMargin), cost: factOr(m.cost), payback: moN(mid(m.payback)), life: mo(m.lifetime, true) }),
  });

const unitTiles = (side, m) => [
  { key: "cost", label: T(`row.cost.${side}`), value: factOr(m.cost), note: side === "supply" ? T("slide.tile.derived", { cpa: money(F.SUPPLY.costPerActive), fs: pc(F.SUPPLY.firstSale), conv: pc(F.SUPPLY.conversion) }) : null },
  { key: "ltv", label: T("row.ltv"), value: approx(m.ltv), note: side === "demand" ? T("slide.tile.marginRange", { range: pc(F.DEMAND.margin) }) : null },
  { key: "ratio", label: T("row.ratio"), value: fmtRatio(m.ratio, lang) },
  { key: "payback", label: T("row.payback"), value: mo(m.payback) },
  { key: "after", label: T("row.after"), value: mo(m.after, true) },
  { key: "cash", label: T("row.cash"), value: approx(m.cash), note: T("slide.tile.floor") },
];

const slideUnit = (side, o = {}) => {
  const m = side === "demand" ? D0 : S0;
  return slide({
    title: T(side === "demand" ? "slide.unit.titleDemand" : "slide.unit.titleSupply", { payback: mo(m.payback), ratio: fmtRatio(m.ratio, lang) }),
    side, page: side === "demand" ? "5/10" : "9/10",
    body: h(SlideUnitBody, {
      tiles: unitTiles(side, m),
      chart: paybackChart(side, m),
      assume: T(`slide.unit.assume.${side}`, { margin: pc(side === "demand" ? F.DEMAND.margin : F.SUPPLY.subMargin) }),
    }),
    ...o,
  });
};

const slideTotal = (o = {}) => {
  const moved = true;
  const columns = [
    { key: "month", label: T("slide.total.col.month") },
    { key: "fresh", label: T("slide.total.col.fresh") },
    { key: "in12", label: T("slide.total.col.in12") },
    ...(moved ? [{ key: "in12w", label: T("slide.total.col.in12Moved") }] : []),
  ];
  const vals = (a, b) => ({ month: money(a.thisMonth), fresh: approx(a.fresh), in12: approx(a.in12), in12w: approx(b.in12) });
  return slide({
    title: T("total.title", { total: money(T0.thisMonth), demand: money(D0.thisMonth), supply: money(S0.thisMonth) }),
    page: "1/10",
    body: h(SlideStreams, {
      caption: T("total.eyebrow"),
      columns,
      streams: [
        { id: "demand", label: T("total.demand"), side: T("slide.total.side.demand"), values: vals(D0, D1) },
        { id: "supply", label: T("total.supply"), side: T("slide.total.side.supply"), values: vals(S0, S1) },
      ],
      total: { label: T("total.total"), values: { month: money(T0.thisMonth), fresh: approx(T0.fresh), in12: approx(T0.in12), in12w: approx(T1.in12) } },
      note: T("slide.total.note"),
    }),
    ...o,
  });
};

// The deck's order, as a strip: each slide drawn small, by group.
const deckOrder = () => {
  const thumb = phone ? colW / 1920 : 0.112;
  const group = (title, items) =>
    h("section", { className: "Board_deckGroup", key: title },
      h("h3", { className: "Board_deckGroupTitle" }, title),
      h("ol", { className: "Board_deckRow" },
        items.map(([n, label, s]) =>
          h("li", { key: n, className: "Board_deckItem" },
            h("div", { className: "Board_thumb" }, s({ scale: thumb })),
            h("p", { className: "Board_deckLabel" }, h("span", { className: "Board_deckN" }, `№ ${n}`), " ", label)))));
  return h("div", { className: "Board_deck" },
    h("h2", { className: "Board_h2" }, T("deck.title")),
    h("p", { className: "Board_p" }, T("deck.lead")),
    group(T("deck.group.total"), [[1, T("deck.total"), slideTotal]]),
    group(T("deck.group.demand"), [[2, T("deck.funnel"), slideFunnelDemand], [3, T("deck.leak"), slideLeakDemand], [4, T("deck.whatif"), slideWhatIfDemand], [5, T("deck.unit"), (x) => slideUnit("demand", x)]]),
    group(T("deck.group.supply"), [[6, T("deck.funnel"), slideFunnelSupply], [7, T("deck.leak"), slideLeakSupply], [8, T("deck.whatif"), slideWhatIfSupply], [9, T("deck.unit"), (x) => slideUnit("supply", x)]]),
    h("p", { className: "Board_meta" }, T("deck.rest")),
    h("p", { className: "Board_p Board_deckNosubs" }, T("deck.nosubs")));
};

const slidePage = (...children) => h("div", { className: "Board_wide Board_slides" }, ...children);

// ── Screens ───────────────────────────────────────────────────────────────
const RENDER = {
  "board-demand": () => returningPage(...board({ side: "demand" })),
  "board-supply": () => returningPage(...board({ side: "supply" })),
  "board-supply-nosubs": () => returningPage(...board({ side: "supply", subs: false })),
  "board-demand-nosubs": () => returningPage(...board({ side: "demand", subs: false })),
  "board-services": () => returningPage(...board({ side: "demand" })),
  "board-services-supply": () => returningPage(...board({ side: "supply" })),
  "board-demand-nomargin": () => returningPage(...board({ side: "demand", base: F.DEMAND_NOMARGIN })),
  "whatif-demand-nomargin": () => tool(card("demand", {}, { base: F.DEMAND_NOMARGIN }), panel("demand", {}, { base: F.DEMAND_NOMARGIN })),

  "whatif-demand": () => tool(card("demand"), panel("demand")),
  "whatif-demand-moved": () => tool(card("demand", F.WHATIF.demand), panel("demand", F.WHATIF.demand)),
  "whatif-supply": () => tool(card("supply"), panel("supply")),
  "whatif-supply-moved": () => tool(card("supply", F.WHATIF.supply), panel("supply", F.WHATIF.supply)),

  "total-moved": () => returningPage(engineBar(), totalBand({ moved: true }), nextStep(), sideShown("demand"), verdictDemand(), h(Stub, null, "…"), card("demand", F.WHATIF.demand)),
  "total-nosubs": () => returningPage(engineBar(), nextStep(false), sideShown("demand"), verdictDemand(), diagDemand(), moneyDemand(D0, { subs: false })),

  "slide-total": () => slidePage(slideTotal()),
  "slide-demand-funnel": () => slidePage(slideFunnelDemand()),
  "slide-demand-leak": () => slidePage(slideLeakDemand()),
  "slide-demand-whatif": () => slidePage(slideWhatIfDemand()),
  "slide-demand-unit": () => slidePage(slideUnit("demand")),
  "slide-supply-funnel": () => slidePage(slideFunnelSupply()),
  "slide-supply-leak": () => slidePage(slideLeakSupply()),
  "slide-supply-whatif": () => slidePage(slideWhatIfSupply()),
  "slide-supply-unit": () => slidePage(slideUnit("supply")),
  "slide-supply-nosubs": () => slidePage(slideFunnelSupplyNoSubs()),
  "slide-services-funnel": () => slidePage(slideFunnelDemand()),
  "deck-order": () => slidePage(deckOrder()),

  "term-gmv": () => tool(moneyDemand()),
  "term-take": () => tool(moneyDemand()),
  "term-liquidity": () => tool(funnelDemand()),
  "term-net": () => tool(moneyDemand()),

  "measure-stacked": () => returningPage(...stacked()),
};

// ── Draw ──────────────────────────────────────────────────────────────────
// (When framing, the frame draws the board: nothing to render here.)
if (!framing) {
  const root = document.getElementById("root");
  document.body.dataset.screen = screenId;
  document.body.dataset.w = String(width);
  render(RENDER[screenId](), root);
  document.title = `${screenId} · ${lang} · ${width}${SV ? " · services" : ""} — engine 10`;
}
