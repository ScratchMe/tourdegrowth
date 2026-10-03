// Extension 09 — the states board. Hand-written source, no build step:
// board.html?screen=<id>&lang=en|fr&w=390|1280 (index.html lists them all).
// It imports the components' own files, unchanged, and the system through
// the bare name "tour-de-growth" (board.html's import map → sys/). Every
// figure comes from board/money.js on the engines of board/engines.js.
import React, { render } from "./react-lite.js";
import { translator, frTypo } from "./copy.js";
import { SCREENS } from "./screens.js";
import * as F from "./fixture.js";
import * as E from "./engines.js";
import { selfServe, salesAssisted, hybrid, paybackWarning, compounding } from "./money.js";
import { eur, pair, months as fmtMonths, pct as fmtPct, ratio as fmtRatio, sig, monthLabel, NNBSP } from "./fmt.js";
import { PageChrome, Verdict, Diagnosis, Peloton, PanelLever, TileToday, SlideFrame, Stub } from "./app.js";
import { Button, Card, Disclosure, GlossaryTerm, MetaLabel, NumberField, Segmented, DataTable } from "tour-de-growth";
// Return 07's components, as ported (A18): unchanged by this brief.
import { EngineBar } from "./r07/EngineBar.js";
import { NextStep } from "./r07/NextStep.js";
import { NumberList } from "./r07/NumberList.js";
import { EngineProgress } from "./r07/EngineProgress.js";
import { EngineLanding } from "./r07/EngineLanding.js";
import { LeverCard as LeverCard07 } from "./r07/LeverCard07.js";
import { TotalBand as TotalBand07 } from "./r07/TotalBand07.js";
// Extension 09's components: new, or changed (LeverCard, TotalBand).
import { MoneyBlock } from "../components/engine/MoneyBlock/MoneyBlock.js";
import { WorthBars } from "../components/engine/WorthBars/WorthBars.js";
import { CashWarning } from "../components/engine/CashWarning/CashWarning.js";
import { MrrCurve } from "../components/engine/MrrCurve/MrrCurve.js";
import { LeverCard } from "../components/engine/LeverCard/LeverCard.js";
import { WhatIfFigures } from "../components/engine/WhatIfFigures/WhatIfFigures.js";
import { LeverSum } from "../components/engine/LeverSum/LeverSum.js";
import { TotalBand } from "../components/engine/TotalBand/TotalBand.js";
import { PaybackChart } from "../components/engine/PaybackChart/PaybackChart.js";
import { SlideUnitEconomics } from "../components/engine/SlideUnitEconomics/SlideUnitEconomics.js";
import { SlideWhatIf } from "../components/engine/SlideWhatIf/SlideWhatIf.js";

const h = React.createElement;

// ── URL ────────────────────────────────────────────────────────────────────
const q = new URLSearchParams(location.search);
const screenId = SCREENS.find((s) => s.id === q.get("screen"))?.id ?? "board-loss";
const lang = q.get("lang") === "fr" ? "fr" : "en";
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

const T = translator(lang);
const L = (pair2) => (pair2 ? pair2[lang] : "");
const fr = (s) => (lang === "fr" ? frTypo(s) : s);

// The column the money is drawn in: the engine's measure (720px) on a
// desktop, the phone's width less its gutters. Charts are drawn at their
// real width, so their type never scales.
const GUTTER = 20;
const colW = phone ? Math.min(window.innerWidth, 390) - 2 * GUTTER : 720;

// ── Board-only words (stand-ins for unchanged parts; not copy) ────────────
const BOARD = {
  start: { en: "The start card, unchanged (return 07, as ported).", fr: "La carte de départ, inchangée (retour 07, telle que portée)." },
  funnel: { en: "The month's funnel, with your what-ifs: unchanged (A18).", fr: "Le funnel du mois, avec tes « Et si » : inchangé (A18)." },
  saRest: { en: "The sales-assisted verdict, diagnosis, numbers and peloton: unchanged (A18).", fr: "Le verdict, le diagnostic, les chiffres et le peloton de l'assisté : inchangés (A18)." },
  settingsRest: { en: "The other groups (the month, shared counts, currency, your tools…): unchanged.", fr: "Les autres groupes (le mois, les nombres partagés, la devise, tes outils…) : inchangés." },
  slide1: { en: "The peloton, as today.", fr: "Le peloton, comme aujourd'hui." },
  assumeKept: { en: "…and today's assumptions, unchanged.", fr: "… et les hypothèses d'aujourd'hui, inchangées." },
  mediaOnly: { en: "Media only", fr: "Média seul" },
};
const B = (k) => fr(BOARD[k][lang]);

// ── Figures, the house's way (board/fmt.js) ───────────────────────────────
const isRange = (r) => Array.isArray(r) && Math.abs(r[0] - r[1]) > 1e-9;
const money = (r) => eur(r, lang); // a fact: to the unit
const approx = (r) => eur(r, lang, { approx: true }); // projected or estimated
const cacText = (r) => (isRange(r) ? approx(r) : money(r));
const abs = (r) => (r ? [Math.min(Math.abs(r[0]), Math.abs(r[1])), Math.max(Math.abs(r[0]), Math.abs(r[1]))] : null);
const mo = (r, a = false) => fmtMonths(r, lang, { approx: a });
const moN = (n) => String(Math.round(n));
const pc = (x, d = 0) => fmtPct(x, lang, d);
const MINUS = "−";
const signed = (n, fmt) => (Math.abs(n) < 1e-9 ? T("row.stable") : `${n < 0 ? MINUS : "+"}${fmt(Math.abs(n))}`);
const chMoney = (n) => {
  if (Math.abs(n) < 0.5) return T("row.stable");
  const v = sig(Math.abs(n), 2);
  const body = lang === "fr" ? `${v.toLocaleString("fr-FR").replace(/\s/g, NNBSP)}${NNBSP}€` : `€${v.toLocaleString("en-US")}`;
  return `${n < 0 ? MINUS : "+"}${body}`;
};
const chPoints = (a, b) => {
  const d = Math.round((b - a) * 100);
  return d === 0 ? T("row.stable") : T("fmt.points", { n: `${d < 0 ? MINUS : "+"}${Math.abs(d)}` });
};
const chMonths = (a, b) => {
  const d = Math.round(b - a);
  return d === 0 ? T("row.stable") : `${d < 0 ? MINUS : "+"}${fmtMonths([Math.abs(d), Math.abs(d)], lang)}`;
};
const chRatio = (a, b) => signed(b - a, (x) => fmtRatio([x, x], lang));
const mid = (r) => (r[0] + r[1]) / 2;
// A projected gain, at two significant digits: "~€13,000".
const gainText = (n) => eur([sig(n, 2), sig(n, 2)], lang, { approx: true });

// ── The engines ───────────────────────────────────────────────────────────
const M = {
  film: selfServe(E.FILM),
  healthy: selfServe(E.HEALTHY),
  nomargin: selfServe(E.NO_MARGIN),
  maybe: selfServe(E.MAYBE),
  healthyRange: selfServe(E.HEALTHY_CAC_RANGE),
  sa: salesAssisted(E.SA),
};
const ENGINE = { film: E.FILM, healthy: E.HEALTHY, nomargin: E.NO_MARGIN, maybe: E.MAYBE, healthyRange: E.HEALTHY_CAC_RANGE };

// ── Shared bits ───────────────────────────────────────────────────────────
const glossaryProps = {
  locale: lang,
  openId: "",
  onOpenChange: () => {},
  closeLabel: lang === "fr" ? "Fermer" : "Close",
  labelTemplate: lang === "fr" ? frTypo("Définition : {term}") : "Definition: {term}",
  moreLabel: null,
};
// The engine's "?" (EngineTerm in the app): the term's "?" alone, after the
// words that say it.
const Term = (id, open = false) => h(GlossaryTerm, { ...glossaryProps, id, openId: open ? id : "", children: "" });

const month = L(F.MONTH);

// ── The board around the money (A18, as ported) ───────────────────────────
const engineBar = ({ motion = "ss" } = {}) =>
  h(EngineBar, {
    line: T(motion === "both" ? "bar.lineBoth" : "bar.line", { month }),
    pending: T("bar.neverSaved"),
    menuLabel: T("bar.menu"),
    settingsLabel: T("bar.settings"),
    groups: [],
  });

const nextStep = (kind = "slides") =>
  kind === "hybrid"
    ? h(NextStep, {
        eyebrow: T("next.since"),
        lead: T("next.hybrid"),
        primary: { label: T("next.go.hybrid") },
      })
    : h(NextStep, {
        eyebrow: T("next.since"),
        lead: T("next.waiting"),
        primary: { label: T("next.go.slides") },
        lines: [
          { text: T("next.verdictIsSlide") },
          { text: T("next.backup"), tone: "advice", action: h(Button, { variant: "quiet", size: "sm" }, T("next.saveNow")) },
        ],
      });

const verdict = () => h(Verdict, { parts: F.VERDICT[lang].map(fr) });

const diagnosis = (variant = "film") =>
  h(Diagnosis, {
    eyebrow: T("diag.eyebrow"),
    stage: "Retention",
    number: T("diag.number"),
    value: T("diag.value", { value: L(F.CHURN_SHOWN[variant]), target: L(F.CHURN_TARGET) }),
    hiding: T("diag.hiding"),
    top: T("diag.top"),
  });

const peloton = () =>
  h(Peloton, {
    title: T("peloton.title"),
    lead: T("peloton.lead"),
    data: F.PELOTON,
    labels: [T("peloton.c1"), T("peloton.c2"), T("peloton.c3"), T("peloton.c4")],
    sources: [T("peloton.s1"), T("peloton.s2"), T("peloton.s3"), T("peloton.s4")],
  });

const STATUS_WORD = { found: "status.found", est: "status.est", asked: "status.asked", cant: "status.cant", todo: "status.todo" };

const numberList = (variant = "film") => {
  const list = F.LISTS[variant];
  const marksOf = (ids) => ids.map((id) => list[id][0]);
  const counts = { found: 0, est: 0, asked: 0, cant: 0 };
  for (const n of F.NUMBERS) counts[list[n.id][0]] += 1;
  return h(NumberList, {
    title: T("list.title"),
    progress: h(EngineProgress, {
      remaining: T("progress.noneToGo"),
      counts: T("progress.counts", counts),
      groups: F.STAGES.map((stage) => {
        const ids = F.NUMBERS.filter((n) => n.stage === stage).map((n) => n.id);
        return { id: stage, label: stage, marks: marksOf(ids) };
      }),
      legend: ["found", "est", "asked", "cant", "todo"].map((st) => ({ status: st, label: T(STATUS_WORD[st]) })),
      legendLabel: T("progress.legendLabel"),
      label: T("list.title"),
    }),
    stages: F.STAGES.map((stage) => {
      const nums = F.NUMBERS.filter((n) => n.stage === stage);
      const found = nums.filter((n) => list[n.id][0] === "found").length;
      return {
        id: stage,
        name: stage,
        holdsBack: stage === "Retention",
        holdsLabel: T("list.holds"),
        foundLabel: T("list.found", { found, n: nums.length }),
        marks: marksOf(nums.map((n) => n.id)),
        rows: nums.map((n) => {
          const [status, value, note] = list[n.id];
          return {
            id: n.id,
            name: fr(n[lang]),
            value: value ? fr(value[lang]) : "",
            status,
            statusLabel: T(STATUS_WORD[status]),
            note: note ? fr(note[lang]) : null,
          };
        }),
      };
    }),
    // The computed numbers that are not money stay here, folded; LTV, the
    // CAC payback and LTV:CAC are in "The money" (each figure once).
    computed: {
      title: T("list.computed", { n: F.COMPUTED.length }),
      rows: F.COMPUTED.map((c) => ({ id: c.id, name: fr(c[lang]), value: fr(F.COMPUTED_VALUES[variant][c.id][lang]), status: "computed" })),
    },
  });
};

const tourMirror = () =>
  h(Disclosure, { summary: T("tour.title"), size: "md", rule: true, className: "Board_tour" }, h("p", { className: "Board_p" }, "…"));

// ── The money (MoneyBlock) ────────────────────────────────────────────────
const worthBars = (m, size = "screen") => {
  const cost = { label: T("worth.costs"), value: cacText(m.cac), amount: m.cac };
  if (!m.ltv) return h(WorthBars, { size, cost, brings: { label: T("worth.brings"), value: "?", amount: null, unknown: T("worth.missing") } });
  const brings = { label: T("worth.brings"), value: approx(m.ltv), amount: m.ltv };
  const gap =
    m.finding === "loss" ? { kind: "short", label: T("worth.short", { gap: approx(abs(m.gap)) }) }
    : m.finding === "maybe" ? { kind: "maybe", label: T("worth.overlap") }
    : { kind: "more", label: T("worth.more", { gap: approx(m.gap) }) };
  return h(WorthBars, { size, cost, brings, gap });
};

const worthPart = (m, { motion = "ss", openAfter = false } = {}) => {
  const title = T("worth.title");
  if (!m.ltv) {
    return { title, finding: T("worth.none"), bars: worthBars(m), note: T("worth.noneNote") };
  }
  const vars = { cac: cacText(m.cac), ltv: approx(m.ltv), gap: approx(abs(m.gap)) };
  if (m.finding === "loss") {
    return {
      title,
      tag: { label: T("worth.tag.loss") },
      finding: T("worth.loss", vars),
      bars: worthBars(m),
      months: T("worth.monthsLoss", { life: mo(m.lifetime, true), payback: mo(m.payback) }),
    };
  }
  if (m.finding === "maybe") {
    return {
      title,
      tag: { label: T("worth.tag.maybe"), maybe: true },
      finding: T("worth.maybe", vars),
      bars: worthBars(m),
      months: T("worth.monthsMaybe", { life: mo(m.lifetime), payback: mo(m.payback) }),
      note: T("worth.maybeWhy", { range: pc(E.MAYBE.churn) }),
    };
  }
  return {
    title,
    finding: T("worth.healthy", vars),
    bars: worthBars(m),
    // The "?" holds to the sentence's last word (a no-break space).
    months: [T("worth.monthsHealthy", { payback: mo(m.payback, isRange(m.payback)), life: mo(m.lifetime, true), after: mo(m.after, true) }), "\u00a0", Term("after", openAfter)],
    note: motion === "sa" ? T("sa.months", { life: mo(m.lifetime) }) : null,
  };
};

const cashPart = (m, { limit = null, limitKind = "runway", annual = false, openTied = false } = {}) => {
  const warn = paybackWarning(m, limit);
  return {
    title: T("cash.title"),
    facts: [
      { key: "spend", label: T("cash.spend"), value: cacText(m.spend) },
      { key: "tied", label: [T("cash.tied"), "\u00a0", Term("cashTied", openTied)], value: m.cash ? approx(m.cash) : "?", missing: m.cash ? null : T("worth.missing") },
    ],
    line: !m.cash ? T("cash.lineNone")
      : m.finding === "loss" ? T("cash.lineLoss")
      : m.finding === "maybe" ? T("cash.lineMaybe")
      : T("cash.lineHealthy"),
    warning: warn
      ? h(CashWarning, { maybe: warn === "maybe" },
          T(warn === "maybe" ? "cash.warnMaybe" : "cash.warn", {
            payback: mo(m.payback),
            limit: T(limitKind === "target" ? "cash.limit.target" : "cash.limit.runway", { n: limit }),
          }))
      : null,
    assumptions: m.cash ? T(annual ? "cash.assumptionsAnnual" : "cash.assumptions") : null,
  };
};

const moneyBlock = (m, { figures = true, motion = "ss", limit, limitKind, openAfter, openTied, headingId } = {}) =>
  h("div", { "data-measure": "money" },
    h(MoneyBlock, {
      eyebrow: T("money.eyebrow", { month }),
      headingId,
      figures: figures ? [
        { key: "mrr", label: T("money.mrr"), value: money(m.mrr) },
        { key: "arr", label: T("money.arr"), value: money(m.arr) },
      ] : null,
      worth: worthPart(m, { motion, openAfter }),
      cash: cashPart(m, { limit, limitKind, annual: motion === "sa", openTied }),
    }));

// ── What if? — the card (LeverCard) and its curve (MrrCurve) ─────────────
const xLabels = [monthLabel(0, lang), monthLabel(6, lang), monthLabel(12, lang)];

const curve = (m0, m1, { slide = false, keyWhatif = "curve.whatif", id = "mrr-curve", w = colW, height } = {}) =>
  h(MrrCurve, {
    today: m0.curve,
    whatif: m1 ? m1.curve : null,
    width: w,
    height: height ?? (slide ? 220 : phone ? 170 : 200),
    compact: phone && !slide,
    size: slide ? "slide" : "screen",
    keys: { today: T("curve.today"), whatif: T(keyWhatif) },
    start: T("curve.start", { mrr: money(m0.mrr) }),
    xLabels,
    id,
    summary: m1
      ? T("curve.summaryWhatif", { start: money(m0.mrr), today: approx(m0.mrr12), whatif: approx(m1.mrr12) })
      : T("curve.summary", { start: money(m0.mrr), today: approx(m0.mrr12) }),
  });

const LEVER_NAME = (key) => {
  const l = F.LEVERS.find((x) => x.key === key);
  return fr(l[lang]);
};
const leverText = (key, value) => {
  const l = F.LEVERS.find((x) => x.key === key);
  return l.money ? money(value) : pc(value, l.digits ?? 0);
};

// The card: the lever of the stage a target names (churn: Retention), the
// curve, the MRR and the ARR in 12 months, the one-customer line.
const ssCard = (eKey, w = {}, { total } = {}) => {
  const e = ENGINE[eKey];
  const m0 = M[eKey];
  const moved = Object.keys(w).length > 0;
  const m1 = moved ? selfServe(e, w) : null;
  const keys = Object.keys(w);
  const churn = w.churn ?? e.churn;
  const title = !moved ? T("whatif.untouched")
    : keys.length > 1 ? T("whatif.movedThree")
    : T("whatif.moved", { lever: LEVER_NAME(keys[0]).toLowerCase(), to: leverText(keys[0], w[keys[0]]), from: leverText(keys[0], e[keys[0]]) });
  const [t12, w12] = moved ? pair(m0.mrr12, m1.mrr12, lang) : [approx(m0.mrr12), null];
  const [tA, wA] = moved ? pair(m0.arr12, m1.arr12, lang) : [approx(m0.arr12), null];
  let worth = null;
  if (moved && m1.ltv) {
    // The CAC with the what-ifs is projected (the same spend for more payers).
    const cac1 = Math.abs(mid(m1.cac) - mid(m0.cac)) < 0.5 ? cacText(m1.cac) : approx(m1.cac);
    if (m0.finding === "loss" && m1.finding !== "loss") worth = T("whatif.worthOut", { ltv: approx(m1.ltv), cac: cac1, gap: approx(m1.gap) });
    else if (m0.finding === "loss" && m1.finding === "loss") worth = T("whatif.worthStill", { gap: approx(abs(m1.gap)), lever: LEVER_NAME(keys[0]) });
  }
  return h("div", { "data-measure": "lever" },
    h(LeverCard, {
      eyebrow: T("whatif.title"),
      title,
      lever: {
        id: "lever-churn",
        label: T("whatif.lever", { lever: LEVER_NAME("churn"), value: pc(e.churn) }),
        min: 0, max: 15, step: 0.5,
        value: (Array.isArray(churn) ? mid(churn) : churn) * 100,
        valueText: pc(churn),
      },
      curve: m0.curve ? curve(m0, m1) : null,
      figures: [
        { key: "mrr12", label: T("whatif.mrr12"), value: moved ? w12 : t12, today: moved ? T("whatif.today", { value: t12 }) : null },
        { key: "arr12", label: T("whatif.arr12"), value: moved ? wA : tA, today: moved ? T("whatif.today", { value: tA }) : null },
      ],
      worth,
      total,
      allLabel: T("whatif.all"),
      resetLabel: T("whatif.reset"),
      moved,
    }));
};

// The sales-assisted card: its own lever (renewal), its own straight line.
const saCard = () => {
  const m0 = M.sa;
  return h("div", { "data-measure": "lever" },
    h(LeverCard, {
      eyebrow: T("whatif.title"),
      title: T("sa.untouched"),
      lever: {
        id: "lever-renewal",
        label: T("whatif.lever", { lever: T("sa.lever"), value: pc(E.SA.renewal) }),
        min: 50, max: 100, step: 1,
        value: E.SA.renewal * 100,
        valueText: pc(E.SA.renewal),
      },
      curve: curve(m0, null, { id: "sa-curve" }),
      figures: [
        { key: "mrr12", label: T("whatif.mrr12"), value: approx(m0.mrr12) },
        { key: "arr12", label: T("whatif.arr12"), value: approx(m0.arr12) },
      ],
      worth: T("sa.curve"),
      allLabel: T("whatif.all"),
      moved: false,
    }));
};

// ── What if? — the full panel ─────────────────────────────────────────────
// What one new customer leaves, in words: "~€400 short", "~€830 more".
const gapText = (g) => {
  if (!g) return "?";
  if (g[0] < 0 && g[1] > 0) return T("worth.overlap");
  return mid(g) < 0 ? T("worth.short", { gap: approx(abs(g)) }) : T("worth.more", { gap: approx(g) });
};

const figureGroups = (m0, m1) => {
  const moved = !!m1;
  const one = (today, whatif, change) => (moved ? { today, whatif, change } : { today });
  const rowMoney = (id, label, a, b, { exact = false } = {}) => {
    if (!a) return { id, label, ...one("?", "?", "?") };
    const [ta, tb] = moved ? pair(a, b, lang) : [exact ? money(a) : approx(a), null];
    return { id, label, ...one(exact ? money(a) : ta, exact ? money(b ?? a) : tb, moved ? chMoney(mid(b) - mid(a)) : null) };
  };
  const rowPct = (id, label, a, b) => ({ id, label, ...one(pc(a), moved ? pc(b) : null, moved ? chPoints(mid(a), mid(b)) : null) });
  const rowMonths = (id, label, a, b) => {
    if (!a) return { id, label, ...one("?", "?", "?") };
    return { id, label, ...one(mo(a), moved ? mo(b) : null, moved ? chMonths(mid(a), mid(b)) : null) };
  };
  const afterText = (r) => (!r ? "?" : r[1] < 0 ? T("row.leavesFirst") : mo(r, true));
  const b = m1 ?? m0;
  return [
    {
      id: "growth",
      title: T("panel.group.growth"),
      rows: [
        rowMoney("mrr12", T("row.mrr12"), m0.mrr12, b.mrr12),
        rowMoney("arr12", T("row.arr12"), m0.arr12, b.arr12),
        rowMoney("newMrr", T("row.newMrr"), m0.newMrr, b.newMrr),
        rowPct("nrr", T("row.nrr"), m0.nrr, b.nrr),
        rowPct("grr", T("row.grr"), m0.grr, b.grr),
      ],
    },
    {
      id: "customer",
      title: T("panel.group.customer"),
      rows: [
        moved ? { id: "cac", label: T("row.cac"), ...one(cacText(m0.cac), Math.abs(mid(b.cac) - mid(m0.cac)) < 0.5 ? cacText(b.cac) : approx(b.cac), chMoney(mid(b.cac) - mid(m0.cac))) } : { id: "cac", label: T("row.cac"), today: cacText(m0.cac) },
        rowMoney("ltv", T("row.ltv"), m0.ltv, b.ltv),
        { id: "ratio", label: T("row.ratio"), ...one(fmtRatio(m0.ratio, lang), moved ? fmtRatio(b.ratio, lang) : null, moved && m0.ratio ? chRatio(mid(m0.ratio), mid(b.ratio)) : moved ? "?" : null) },
        { id: "gap", label: T("row.gap"), ...one(gapText(m0.gap), moved ? gapText(b.gap) : null, moved && m0.gap ? chMoney(mid(b.gap) - mid(m0.gap)) : moved ? "?" : null) },
        rowMonths("payback", T("row.payback"), m0.payback, b.payback),
        { id: "after", label: T("row.after"), ...one(afterText(m0.after), moved ? afterText(b.after) : null, moved && m0.after ? chMonths(mid(m0.after), mid(b.after)) : moved ? "?" : null) },
      ],
    },
    {
      id: "cash",
      title: T("panel.group.cash"),
      rows: [
        { id: "spend", label: T("row.spend"), ...one(cacText(m0.spend), moved ? cacText(m0.spend) : null, moved ? T("row.stable") : null) },
        rowMoney("cash", T("row.cash"), m0.cash, b.cash),
      ],
    },
  ];
};

const leverSum = (eKey, w, size = "screen", { withExtra = true } = {}) => {
  const e = ENGINE[eKey];
  const levers = Object.entries(w).map(([key, to]) => ({ key, to }));
  // Funnel order, as the panel lists them.
  levers.sort((a, b) => F.LEVERS.findIndex((l) => l.key === a.key) - F.LEVERS.findIndex((l) => l.key === b.key));
  const c = compounding(selfServe, e, levers);
  return h(LeverSum, {
    title: T("sum.title"),
    rows: c.alone.map((l) => ({ id: l.key, label: T("sum.lever", { lever: LEVER_NAME(l.key), from: leverText(l.key, e[l.key]), to: leverText(l.key, l.to) }), value: chMoney(l.gain), amount: l.gain })),
    sum: { label: T("sum.oneByOne"), value: chMoney(c.sum), amount: c.sum },
    together: { label: T("sum.together"), value: chMoney(c.together), amount: c.together },
    extra: withExtra ? T("sum.extra", { extra: gainText(c.extra) }) : null,
    size,
  });
};

const panel = (eKey, w = {}) => {
  const e = ENGINE[eKey];
  const m0 = M[eKey];
  const moved = Object.keys(w).length > 0;
  const m1 = moved ? selfServe(e, w) : null;
  return h("section", { className: "Board_panel", "data-measure": "panel", "aria-label": T("whatif.title") },
    h("p", { className: "Board_p" }, T("panel.intro")),
    h("div", { className: "Board_panelGrid" },
      h("div", { className: "Board_panelLevers" },
        h("h3", { className: "Board_h3" }, T("panel.levers")),
        F.LEVERS.map((l) => {
          const v = w[l.key] ?? l.today;
          const scale = l.money ? 1 : 100;
          return h(PanelLever, {
            key: l.key,
            id: `panel-${l.key}`,
            label: fr(l[lang]),
            valueText: leverText(l.key, v),
            value: v * scale, min: l.min * scale, max: l.max * scale, step: l.step * scale,
            today: T("whatif.today", { value: leverText(l.key, l.today) }),
            moved: w[l.key] != null,
          });
        }),
        moved ? h(Button, { variant: "quiet", className: "Board_allBack" }, T("panel.allBack")) : null),
      h("div", { className: "Board_panelFigures" },
        h(WhatIfFigures, {
          title: T("panel.figures"),
          label: moved ? null : T("panel.col.today"),
          moved,
          columns: { figure: T("panel.col.figure"), today: T("panel.col.today"), whatif: T("panel.col.whatif"), change: T("panel.col.change") },
          todayLine: (value) => T("whatif.today", { value }),
          // The MRR and ARR in 12 months are the card's, right above the
          // opened panel: once per surface (INVENTORY.md).
          groups: figureGroups(m0, m1).map((g) => (g.id === "growth" ? { ...g, rows: g.rows.filter((r) => r.id !== "mrr12" && r.id !== "arr12") } : g)),
        }),
        moved ? null : h("p", { className: "Board_meta" }, T("panel.untouchedNote")),
        Object.keys(w).length > 1 ? leverSum(eKey, w) : null)),
    h(Stub, null, B("funnel")),
    h(Disclosure, { summary: T("panel.assumptions"), size: "md", rule: true },
      h("p", { className: "Board_p" }, T("panel.assumeCash")),
      h("p", { className: "Board_p" }, T("panel.assumeLtv")),
      h("p", { className: "Board_meta" }, B("assumeKept"))));
};

// Today's panel (A18, `03`/`05`): seven tiles, for the "before" measures.
const panelBefore = (eKey, w = {}) => {
  const e = ENGINE[eKey];
  const m0 = M[eKey];
  const moved = Object.keys(w).length > 0;
  const m1 = moved ? selfServe(e, w) : m0;
  const tile = (label, a, b, f) => h(TileToday, { key: label, label, value: f(b), change: moved ? "·" : null, today: moved ? T("whatif.today", { value: f(a) }) : null });
  return h("section", { className: "Board_panel", "data-measure": "panel" },
    h("p", { className: "Board_p" }, T("panel.intro")),
    h("div", { className: "Board_panelGrid" },
      h("div", { className: "Board_panelLevers" },
        h("h3", { className: "Board_h3" }, T("panel.levers")),
        F.LEVERS.map((l) => {
          const v = w[l.key] ?? l.today;
          const scale = l.money ? 1 : 100;
          return h(PanelLever, { key: l.key, id: `before-${l.key}`, label: fr(l[lang]), valueText: leverText(l.key, v), value: v * scale, min: l.min * scale, max: l.max * scale, step: l.step * scale, today: T("whatif.today", { value: leverText(l.key, l.today) }) });
        })),
      h("div", { className: "Board_panelFigures" },
        h("h3", { className: "Board_h3" }, T("panel.figures")),
        h("div", { className: "App_tiles" },
          tile(T("row.mrr12"), m0.mrr12, m1.mrr12, approx),
          tile(T("row.newMrr"), m0.newMrr, m1.newMrr, approx),
          tile(T("row.nrr"), m0.nrr, m1.nrr, pc),
          tile(T("row.grr"), m0.grr, m1.grr, pc),
          tile(T("row.cac"), m0.cac, m1.cac, approx),
          tile(T("row.ltv"), m0.ltv, m1.ltv, approx),
          tile(T("row.payback"), m0.payback, m1.payback, (r) => mo(r))),
        moved ? null : h("p", { className: "Board_meta" }, T("panel.untouchedNote")))),
    h(Stub, null, B("funnel")),
    h(Disclosure, { summary: T("panel.assumptions"), size: "md", rule: true }, h("p", { className: "Board_p" }, "…")));
};

// ── The board ─────────────────────────────────────────────────────────────
// A18's order, with the money: the first screen (engine bar, verdict, next
// step) is untouched; the money comes after the diagnosis, and "What if?"
// right under it, before the peloton.
const board = (variant = "film", { limit, w = {}, panelOpen = false } = {}) => [
  engineBar(),
  verdict(),
  nextStep(),
  diagnosis(variant),
  moneyBlock(M[variant], { limit }),
  ssCard(variant, w),
  panelOpen ? panel(variant, w) : null,
  peloton(),
  numberList(variant),
  tourMirror(),
];

// Today's board on the film's SaaS (A18, `01`), for the "before" measures.
const boardBefore = ({ panelOpen = false } = {}) => {
  const m0 = M.film;
  return [
    engineBar(),
    verdict(),
    nextStep(),
    diagnosis("film"),
    peloton(),
    numberList("film"),
    h("div", { "data-measure": "lever" },
      h(LeverCard07, {
        eyebrow: T("whatif.title"),
        title: T("whatif.untouched"),
        lever: { id: "lever-before", label: T("whatif.lever", { lever: LEVER_NAME("churn"), value: pc(0.06) }), min: 0, max: 15, step: 0.5, value: 6, valueText: pc(0.06) },
        figures: [
          { label: T("whatif.mrr12"), value: approx(m0.mrr12) },
          { label: lang === "fr" ? "Nouveaux payants par mois" : "New paying customers a month", value: String(Math.round(m0.payers[0])) },
        ],
        allLabel: T("whatif.all"),
        resetLabel: T("whatif.reset"),
        moved: false,
      })),
    panelOpen ? panelBefore("film") : null,
    tourMirror(),
  ];
};

// The returning page around the tool (as ported: the compact landing).
const landing = () =>
  h(EngineLanding, {
    eyebrow: T("landing.eyebrow"),
    title: T("landing.h1"),
    lede: T("landing.lede"),
    positioning: T("landing.positioning"),
    promiseTitle: T("landing.promiseTitle"),
    promiseBody: T("landing.promiseBody"),
    promiseLine: T("landing.promiseLine"),
    cta: T("landing.cta"),
    ctaNote: T("landing.ctaNote"),
  });

const returningPage = (...tool) =>
  h(PageChrome, { lang, phone },
    h("div", { "data-engine": "known", className: "Board_pageInner" },
      landing(),
      h("div", { className: "Board_tool", id: "engine", "data-measure": "tool" }, ...tool)));

const tool = (...children) => h("div", { className: "Board_toolOnly" }, h("div", { className: "Board_tool", "data-measure": "tool" }, ...children));

// ── Settings: the runway (C49, if Antoine picks it) ───────────────────────
const TARGETABLE = [
  ["ss:sign-up-rate", ""], ["ss:activation-rate", "20"], ["ss:day-30-retention", ""],
  ["ss:paid-conversion", ""], ["ss:referred-sign-up-share", ""], ["ss:monthly-logo-churn", "2"],
];
const settings = (runway = "") =>
  h(Card, { elevation: "flat", tone: "paper", className: "Board_settings" },
    h("h2", { className: "Board_h2" }, T("settings.title")),
    h("section", { className: "Board_settingsGroup" },
      h("h3", { className: "Board_h3" }, T("settings.targets")),
      h("p", { className: "Board_p" }, T("settings.targetsLead")),
      h("div", { className: "Board_targets" },
        TARGETABLE.map(([id, value]) =>
          h(NumberField, { key: id, label: fr(F.NUMBERS.find((n) => n.id === id)[lang]), value, onChange: () => {}, locale: lang, suffix: "%", digits: 4, fit: "content", size: "sm" })))),
    h("section", { className: "Board_settingsGroup", "data-measure": "runway" },
      h("h3", { className: "Board_h3" }, T("settings.cash")),
      h(NumberField, {
        label: T("settings.runway"),
        optional: lang === "fr" ? "facultatif" : "optional",
        value: runway,
        onChange: () => {},
        locale: lang,
        suffix: T("settings.months"),
        digits: 3,
        fit: "content",
        size: "sm",
        hint: h("span", null, T("settings.runwayHint"), " ", h(GlossaryTerm, { ...glossaryProps, id: "runway", openId: "", children: T("term.runway.title") })),
      })),
    h(Stub, null, B("settingsRest")),
    h("div", { className: "Board_settingsActions" },
      h(Button, { variant: "primary", size: "lg" }, T("settings.save")),
      h(Button, { variant: "quiet" }, T("settings.cancel"))));

// ── The hybrid ────────────────────────────────────────────────────────────
const hy = hybrid(M.film, M.sa);
const totalBand = () =>
  h("div", { "data-measure": "total" },
    h(TotalBand, {
      eyebrow: T("total.eyebrow"),
      title: T("total.title", { total: money(hy.mrr), ss: money(M.film.mrr), sa: money(M.sa.mrr) }),
      engines: [{ label: T("total.ss"), value: money(M.film.mrr) }, { label: T("total.sa"), value: money(M.sa.mrr) }],
      total: { label: T("total.total"), value: money(hy.mrr) },
      totals: [
        { key: "arr", label: T("total.arr"), value: money(hy.arr) },
        { key: "mrr12", label: T("total.mrr12"), value: approx(hy.mrr12) },
        { key: "cash", label: T("total.cash"), value: approx(hy.cash) },
      ],
      link: T("total.link"),
    }));

const engineSwitch = (shown) =>
  h("div", { className: "Board_motion" },
    h("span", { id: "motion-label", className: "Field_label" }, T("hybrid.shown")),
    h(Segmented, { labelledBy: "motion-label", value: shown, options: [{ id: "ss", label: T("hybrid.ss") }, { id: "sa", label: T("hybrid.sa") }] }));

const hybridBoard = (shown = "ss", w = {}) => {
  const moved = Object.keys(w).length > 0;
  const m1 = moved ? selfServe(E.FILM, w) : null;
  const total = moved
    ? T("whatif.totalBoth", { whatif: approx([hy.mrr12[0] - M.film.mrr12[0] + m1.mrr12[0], hy.mrr12[1] - M.film.mrr12[1] + m1.mrr12[1]]), today: approx(hy.mrr12) })
    : null;
  return [
    engineBar({ motion: "both" }),
    totalBand(),
    nextStep("hybrid"),
    engineSwitch(shown),
    ...(shown === "ss"
      ? [verdict(), diagnosis("film"), moneyBlock(M.film, { figures: false }), ssCard("film", w, { total }), peloton(), numberList("film")]
      : [moneyBlock(M.sa, { figures: false, motion: "sa" }), saCard(), h(Stub, null, B("saRest"))]),
    tourMirror(),
  ];
};

// Today's hybrid board (A18, `11`), for the "before" measures.
const hybridBefore = () => [
  engineBar({ motion: "both" }),
  h(TotalBand07, {
    eyebrow: T("total.eyebrow"),
    title: T("total.title", { total: money(hy.mrr), ss: money(M.film.mrr), sa: money(M.sa.mrr) }),
    engines: [{ label: T("total.ss"), value: money(M.film.mrr) }, { label: T("total.sa"), value: money(M.sa.mrr) }],
    total: { label: T("total.total"), value: money(hy.mrr) },
    link: T("total.link"),
  }),
  nextStep("hybrid"),
  engineSwitch("ss"),
  ...[1, 3, 4, 5, 6].map((i) => boardBefore()[i]),
  tourMirror(),
];

// ── The slides ────────────────────────────────────────────────────────────
const slideScale = phone ? colW / 960 : 1;
const slide = ({ title, body, foot, page, badge = F.BADGE.film, assumptions = false }) =>
  h("div", { className: "Board_slide", "data-measure": "slide" },
    h(SlideFrame, {
      header: T("slide.header"),
      badge: T("slide.badge", badge),
      title,
      footLeft: foot ?? T("slide.sources"),
      page,
      scale: slideScale,
      assumptions,
    }, body));

const paybackChart = (m, { width = 450, height = 164, id = "payback", compact = false } = {}) => {
  const labels = {
    months: T("slide.chart.months").split("|"),
    reference: T("slide.chart.reference"),
    cost: compact ? null : T("slide.chart.cost"),
    unknown: T("worth.missing"),
    leaves: m.lifetime ? T("slide.chart.leaves", { life: moN(m.lifetime[0]) }) : "",
    paysBack: m.payback ? T(m.finding === "loss" ? "slide.chart.wouldPayBack" : "slide.chart.paysBack", { payback: moN(mid(m.payback)) }) : "",
    short: m.gap ? T("slide.chart.short", { gap: approx(abs(m.gap)) }) : "",
    after: m.after ? T("slide.chart.after", { after: moN(m.after[0]) }) : "",
    time: !m.after ? "" : m.finding === "loss"
      ? T("slide.chart.timeLoss", { life: moN(m.lifetime[0]), payback: moN(mid(m.payback)) })
      : T("slide.chart.timeHealthy", { payback: moN(mid(m.payback)), after: moN(m.after[0]) }),
  };
  const summary = !m.ltv
    ? T("slide.chart.summaryNone", { cac: cacText(m.cac) })
    : m.finding === "loss"
      ? T("slide.chart.summaryLoss", { mm: money(m.monthlyMargin), life: moN(m.lifetime[0]), gap: approx(abs(m.gap)), cac: cacText(m.cac), payback: moN(mid(m.payback)) })
      : T("slide.chart.summaryHealthy", { mm: money(m.monthlyMargin), cac: cacText(m.cac), payback: moN(mid(m.payback)), life: mo(m.lifetime, true) });
  return h(PaybackChart, { monthlyMargin: m.monthlyMargin, cac: m.cac, lifetime: m.lifetime, payback: m.payback, width, height, labels, summary, id, compact });
};

const unitTiles = (m, { cacNote } = {}) => {
  const miss = T("slide.tile.missing");
  const after = !m.after ? { value: "?", note: miss }
    : m.after[1] < 0 ? { value: `${MINUS}${fmtMonths([Math.abs(m.after[1]), Math.abs(m.after[1])], lang)}`, note: T("slide.tile.leavesBefore", { n: moN(Math.abs(m.after[1])) }) }
    : { value: mo(m.after, true) };
  return [
    { key: "cac", label: T("row.cac"), value: cacText(m.cac), note: cacNote },
    { key: "ltv", label: T("row.ltv"), value: m.ltv ? approx(m.ltv) : "?", note: m.ltv ? null : miss },
    { key: "ratio", label: T("row.ratio"), value: m.ratio ? fmtRatio(m.ratio, lang) : "?", note: m.ratio ? T("slide.tile.reference") : miss },
    { key: "payback", label: T("row.payback"), value: m.payback ? mo(m.payback) : "?", note: m.payback ? null : miss },
    { key: "after", label: T("row.after"), ...after },
    { key: "cash", label: T("row.cash"), value: m.cash ? approx(m.cash) : "?", note: !m.cash ? miss : m.comesBack === false ? T("slide.tile.notAllBack") : T("slide.tile.floor") },
  ];
};

const unitSlide = (key, { limit, page = "8/11", badge = F.BADGE.film, cacNote } = {}) => {
  const m = M[key];
  const title = !m.ltv ? T("slide.unit.titleNone")
    : m.finding === "loss" ? T("slide.unit.titleLoss", { cac: cacText(m.cac), ltv: approx(m.ltv), gap: approx(abs(m.gap)) })
    : T("slide.unit.titleHealthy", { payback: mo(m.payback), ratio: fmtRatio(m.ratio, lang) });
  const warn = paybackWarning(m, limit);
  return slide({
    title,
    page,
    badge,
    body: h(SlideUnitEconomics, {
      chart: paybackChart(m, { id: `payback-${key}` }),
      tiles: unitTiles(m, { cacNote }),
      retention: T("slide.retention", { grr: pc(m.grr), nrr: pc(m.nrr) }),
      warning: warn ? h(CashWarning, { maybe: warn === "maybe" }, T("cash.warn", { payback: mo(m.payback), limit: T("cash.limit.runway", { n: limit }) })) : null,
      assume: m.cash ? T("slide.unit.assume") : null,
    }),
  });
};

const unitBoth = () => {
  const ss = M.film;
  const sa = M.sa;
  // Two columns: the notes that read without the chart stay (the cash's);
  // the reference and the "leaves before" go, the chart under says them.
  // Five tiles a column: the months after payback are the chart's (its
  // bracket, or where it leaves and would have paid back).
  const compactTiles = (m) => unitTiles(m).filter((t) => t.key !== "after").map((t) => ({ ...t, note: t.key === "cash" && m.comesBack === false ? t.note : null, wide: t.key === "cash" }));
  return slide({
    title: T("slide.unit.titleBoth", { gapSs: approx(abs(ss.gap)), paybackSa: mo(sa.payback) }),
    page: "2/12",
    body: h(SlideUnitEconomics, {
      engines: [
        { name: T("hybrid.ss"), chart: paybackChart(ss, { width: 420, height: 88, id: "payback-ss", compact: true }), tiles: compactTiles(ss) },
        { name: T("hybrid.sa"), chart: paybackChart(sa, { width: 420, height: 88, id: "payback-sa", compact: true }), tiles: compactTiles(sa) },
      ],
      assume: T("slide.bothNote", { grr: pc(ss.grr), nrr: pc(ss.nrr), renewal: pc(E.SA.renewal) }),
    }),
  });
};

const whatifTable = (m0, m1, withKey, ids = ["mrr12", "arr12", "nrr", "cac", "ltv", "ratio", "payback", "cash"]) => {
  const rows = figureGroups(m0, m1).flatMap((g) => g.rows).filter((r) => ids.includes(r.id));
  return {
    caption: T("slide.whatif.figures"),
    columns: [
      { key: "figure", header: "" },
      { key: "today", header: T("panel.col.today"), numeric: true },
      { key: "whatif", header: T(withKey), numeric: true },
      { key: "change", header: T("panel.col.change"), numeric: true },
    ],
    rows: rows.map((r) => ({ id: r.id, cells: { figure: r.label, today: r.today, whatif: r.whatif, change: r.change } })),
  };
};

const whatifSlideOne = () => {
  const m0 = M.film;
  const m1 = selfServe(E.FILM, E.CHURN_ONLY);
  return slide({
    title: T("slide.whatif.titleOne", { to: pc(E.CHURN_ONLY.churn), from: pc(E.FILM.churn), gain: gainText(m1.mrr12[0] - m0.mrr12[0]) }),
    page: "5/11",
    foot: T("slide.whatif.assume"),
    assumptions: true,
    body: h(SlideWhatIf, {
      curve: curve(m0, m1, { slide: true, keyWhatif: "curve.whatifSlide", id: "slide-one", w: 380, height: 210 }),
      figures: whatifTable(m0, m1, "slide.whatif.with"),
      funnelNote: T("slide.whatif.funnelStill"),
    }),
  });
};

const whatifSlideTogether = () => {
  const m0 = M.film;
  const m1 = selfServe(E.FILM, E.THREE);
  return slide({
    title: T("slide.whatif.titleTogether", { gain: gainText(m1.mrr12[0] - m0.mrr12[0]) }),
    page: "7/11",
    foot: T("slide.whatif.assume"),
    assumptions: true,
    body: h(SlideWhatIf, {
      curve: curve(m0, m1, { slide: true, keyWhatif: "curve.togetherSlide", id: "slide-together", w: 380, height: 96 }),
      sum: leverSum("film", E.THREE, "slide", { withExtra: false }),
      figures: whatifTable(m0, m1, "slide.whatif.withAll", ["mrr12", "arr12", "cac", "ltv", "ratio", "payback", "cash"]),
      note: T("sum.extra", { extra: gainText(compounding(selfServe, E.FILM, Object.entries(E.THREE).map(([key, to]) => ({ key, to }))).extra) }),
    }),
  });
};

const deckOrder = () => {
  const items = [
    { n: 1, label: T("deck.s1") },
    { n: 2, label: T("deck.s2"), note: T("deck.moved") },
    { n: 3, label: T("deck.s3") },
    { n: "4–11", label: T("deck.s4"), note: T("deck.rest") },
  ];
  const thumb = (s) => h("div", { className: "Board_thumb" }, s);
  const s1 = h(SlideFrame, {
    header: T("slide.header"), badge: T("slide.badge", F.BADGE.film),
    title: h("span", null, fr(F.VERDICT[lang][0]), " ", h("span", { className: "App_wordmarkRed" }, fr(F.VERDICT[lang][1]))),
    footLeft: T("slide.sources"), page: "1/11", scale: phone ? slideScale : 0.5,
  }, h(Stub, null, B("slide1")));
  return h("div", { className: "Board_deck" },
    h("h2", { className: "Board_h2" }, T("deck.title")),
    h("ol", { className: "Board_deckList" },
      items.map((it) =>
        h("li", { key: it.n, className: "Board_deckItem" },
          h("span", { className: "Board_deckN" }, `№ ${it.n}`),
          h("span", { className: "Board_deckLabel" }, it.label),
          it.note ? h("span", { className: "Board_deckNote" }, it.note) : null))),
    h("div", { className: "Board_thumbs" },
      thumb(s1),
      thumb(h(SlideFrame, {
        header: T("slide.header"), badge: T("slide.badge", F.BADGE.film),
        title: T("slide.unit.titleLoss", { cac: cacText(M.film.cac), ltv: approx(M.film.ltv), gap: approx(abs(M.film.gap)) }),
        footLeft: T("slide.sources"), page: "2/11", scale: phone ? slideScale : 0.5,
      }, h(SlideUnitEconomics, {
        chart: paybackChart(M.film, { id: "payback-thumb" }),
        tiles: unitTiles(M.film),
        retention: T("slide.retention", { grr: pc(M.film.grr), nrr: pc(M.film.nrr) }),
        assume: T("slide.unit.assume"),
      })))));
};

const slidePage = (...children) => h("div", { className: "Board_wide Board_slides" }, ...children);

// ── Screens ───────────────────────────────────────────────────────────────
const RENDER = {
  // The board, self-serve
  "board-loss": () => returningPage(...board("film")),
  "board-healthy": () => returningPage(...board("healthy")),
  "board-nomargin": () => returningPage(...board("nomargin")),
  "board-maybe": () => returningPage(...board("maybe")),
  "board-before": () => returningPage(...boardBefore()),

  // The cash warning
  "cash-none": () => tool(moneyBlock(M.healthy, { limit: null })),
  "cash-runway": () => tool(moneyBlock(M.healthy, { limit: E.RUNWAY.typed })),
  "cash-maybe": () => tool(moneyBlock(M.healthyRange, { limit: E.RUNWAY.maybe })),
  "cash-runway-ok": () => tool(moneyBlock(M.healthy, { limit: 18 })),
  "cash-loss": () => tool(moneyBlock(M.film, { limit: E.RUNWAY.typed })),
  "cash-term": () => tool(moneyBlock(M.healthy, { openTied: true })),
  "settings-runway": () => tool(settings("")),
  "settings-runway-typed": () => tool(settings(String(E.RUNWAY.typed))),

  // What if?
  "whatif-untouched": () => tool(ssCard("film")),
  "whatif-churn": () => tool(ssCard("film", E.CHURN_ONLY)),
  "whatif-expansion": () => tool(ssCard("film", E.EXPANSION_ONLY), panel("film", E.EXPANSION_ONLY)),
  "whatif-three": () => tool(ssCard("film", E.THREE), panel("film", E.THREE)),
  "whatif-panel": () => tool(ssCard("film"), panel("film")),
  "whatif-maybe": () => tool(ssCard("maybe")),
  "board-panel": () => returningPage(...board("film", { panelOpen: true })),
  "board-panel-before": () => returningPage(...boardBefore({ panelOpen: true })),
  "whatif-before-three": () => tool(panelBefore("film", E.THREE)),

  // The hybrid
  "hybrid-ss": () => returningPage(...hybridBoard("ss")),
  "hybrid-sa": () => returningPage(...hybridBoard("sa")),
  "hybrid-before": () => returningPage(...hybridBefore()),
  "hybrid-whatif": () => tool(totalBand(), engineSwitch("ss"), ssCard("film", E.CHURN_ONLY, {
    total: T("whatif.totalBoth", { whatif: approx([hy.mrr12[0] - M.film.mrr12[0] + selfServe(E.FILM, E.CHURN_ONLY).mrr12[0], hy.mrr12[1] - M.film.mrr12[1] + selfServe(E.FILM, E.CHURN_ONLY).mrr12[1]]), today: approx(hy.mrr12) }),
  })),

  // The slides
  "slide-unit-loss": () => slidePage(unitSlide("film", { page: "2/11" })),
  "slide-unit-healthy": () => slidePage(unitSlide("healthy", { badge: F.BADGE.healthy, cacNote: B("mediaOnly") })),
  "slide-unit-warning": () => slidePage(unitSlide("healthy", { badge: F.BADGE.healthy, cacNote: B("mediaOnly"), limit: E.RUNWAY.typed })),
  "slide-unit-nomargin": () => slidePage(unitSlide("nomargin", { page: "4/7", badge: F.BADGE.nomargin, cacNote: B("mediaOnly") })),
  "slide-whatif-one": () => slidePage(whatifSlideOne()),
  "slide-together": () => slidePage(whatifSlideTogether()),
  "slide-unit-both": () => slidePage(unitBoth()),
  "deck-order": () => slidePage(deckOrder()),

  // The page
  arrival: () =>
    h(PageChrome, { lang, phone },
      h("div", { className: "Board_pageInner" },
        landing(),
        h("div", { className: "Board_tool", id: "engine", "data-measure": "tool" }, h(Stub, null, B("start"))))),
};

// ── Draw ──────────────────────────────────────────────────────────────────
// (When framing, the frame draws the board: nothing to render here.)
if (!framing) {
  const root = document.getElementById("root");
  document.body.dataset.screen = screenId;
  document.body.dataset.w = String(width);
  render(RENDER[screenId](), root);
  document.title = `${screenId} · ${lang} · ${width} — engine 09`;
}
