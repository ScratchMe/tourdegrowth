// Extension 07 — the states board. Hand-written source, no build step:
// board.html?screen=<id>&lang=en|fr&w=390|1280 (index.html lists them all).
// It imports the components' own files, unchanged, and the system through
// the bare name "tour-de-growth" (board.html's import map → sys/).
import React, { render } from "./react-lite.js";
import { CATALOGUE } from "./catalogue.js";
import { translator, frTypo } from "./copy.js";
import { SCREENS } from "./screens.js";
import { MEASURES } from "./measures.js";
import * as F from "./fixture.js";
import { PageChrome, Verdict, VerdictPending, Diagnosis, Peloton } from "./app.js";
import {
  Button, Card, Checkbox, Choices, Disclosure, Field, FieldRow, MetaLabel, NumberField, Segmented, Select,
  TextArea, TextField, GlossaryTerm,
} from "tour-de-growth";
import { EngineLanding } from "../components/engine/EngineLanding/EngineLanding.js";
import { EngineStart } from "../components/engine/EngineStart/EngineStart.js";
import { EngineBar } from "../components/engine/EngineBar/EngineBar.js";
import { NextStep } from "../components/engine/NextStep/NextStep.js";
import { EngineProgress } from "../components/engine/EngineProgress/EngineProgress.js";
import { NumberList } from "../components/engine/NumberList/NumberList.js";
import { NumberSheet } from "../components/engine/NumberSheet/NumberSheet.js";
import { AnswerSwitch } from "../components/engine/AnswerSwitch/AnswerSwitch.js";
import { TrapNote } from "../components/engine/TrapNote/TrapNote.js";
import { WhereToFind } from "../components/engine/WhereToFind/WhereToFind.js";
import { HowItCompares } from "../components/engine/HowItCompares/HowItCompares.js";
import { LeverCard } from "../components/engine/LeverCard/LeverCard.js";
import { TotalBand } from "../components/engine/TotalBand/TotalBand.js";
import { AskList } from "../components/engine/AskList/AskList.js";
import { Journey } from "./journey.js";

const h = React.createElement;

// ── URL ────────────────────────────────────────────────────────────────────
const q = new URLSearchParams(location.search);
const screenId = SCREENS.find((s) => s.id === q.get("screen"))?.id ?? "return";
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
const fr = (s) => (lang === "fr" ? frTypo(s) : s);
const L = (pair) => (pair ? pair[lang] : "");

// ── The catalogue, read as the page prints it ─────────────────────────────
const BY_ID = Object.fromEntries(CATALOGUE.map((e) => [e.id, e]));
const STAGES = ["Acquisition", "Activation", "Retention", "Referral", "Revenue"];
const SS_IDS = CATALOGUE.filter((e) => e.section === "ss" && e.stage !== "Computed").map((e) => e.id);
const COMPUTED_IDS = CATALOGUE.filter((e) => e.section === "ss" && e.stage === "Computed").map((e) => e.id);
const TARGETABLE = ["ss:sign-up-rate", "ss:activation-rate", "ss:day-30-retention", "ss:paid-conversion", "ss:referred-sign-up-share", "ss:monthly-logo-churn"];

const C = (id) => {
  const e = BY_ID[id];
  const t = e[lang];
  return {
    ...e,
    name: fr(t.name),
    def: t.def ? fr(t.def) : null,
    formula: t.formula ? fr(t.formula) : null,
    trap: t.trap ? fr(t.trap) : null,
    ref: t.ref ? fr(t.ref) : null,
    effort: t.effort ? fr(t.effort) : null,
    where: (t.where ?? []).map((w) => ({ tool: fr(w.tool), path: fr(w.path) })),
    effortKind: !e.en.effort ? null : e.en.effort.startsWith("Ask") ? "ask" : e.en.effort.includes("5 min") ? "quick" : "hour",
  };
};

// "2–5% · for context, never to name a stage: …" → range, numbers, caveat.
const parseRef = (id) => {
  const e = BY_ID[id];
  const en = e.en.ref;
  if (!en) return null;
  const ours = fr(e[lang].ref);
  const m = en.match(/^([\d.]+)–([\d.]+)%/);
  if (!m) return { none: true, text: ours };
  const [range, ...rest] = ours.split(" · ");
  const caveat = rest.join(" · ");
  return { low: Number(m[1]), high: Number(m[2]), range, caveat: caveat.charAt(0).toUpperCase() + caveat.slice(1) };
};

const STATUS_WORD = { found: "status.found", est: "status.est", asked: "status.asked", cant: "status.cant", todo: "status.todo" };

const countsOf = (statuses) => {
  const c = { found: 0, est: 0, asked: 0, cant: 0, todo: 0 };
  for (const id of SS_IDS) c[statuses[id]] += 1;
  return c;
};

const ROLE_LABEL = (role) => T(`asks.role.${role}`);

// ── Shared bits ───────────────────────────────────────────────────────────
const glossaryProps = {
  locale: lang,
  openId: "",
  onOpenChange: () => {},
  closeLabel: lang === "fr" ? "Fermer" : "Close",
  labelTemplate: lang === "fr" ? frTypo("Définition : {term}") : "Definition: {term}",
  moreLabel: lang === "fr" ? "En savoir plus →" : "Learn more →",
};
const Term = (id, open = false, children) => h(GlossaryTerm, { ...glossaryProps, id, openId: open ? id : "", children });

const progressGroups = (statuses) =>
  STAGES.map((stage) => {
    const ids = SS_IDS.filter((id) => BY_ID[id].stage === stage);
    return { id: stage, label: `${stage}: ${ids.map((id) => T(STATUS_WORD[statuses[id]])).join(", ")}`, marks: ids.map((id) => statuses[id]) };
  });

const legend = () =>
  ["found", "est", "asked", "cant", "todo"].map((s) => ({ status: s, label: T(STATUS_WORD[s]) }));

const toGoText = (statuses) => {
  const n = countsOf(statuses).todo;
  return n === 0 ? T("progress.noneToGo") : n === 1 ? T("progress.lastOne") : T("progress.toGo", { n });
};

const countsText = (statuses) => {
  const c = countsOf(statuses);
  return T("progress.counts", { found: c.found, est: c.est, asked: c.asked, cant: c.cant });
};

// ── The engine bar ────────────────────────────────────────────────────────
const engineBar = ({ month = F.MONTHS.current, readOnly, neverSaved = true, menuOpen, motion = "ss" } = {}) =>
  h(EngineBar, {
    line: [T("bar.engine"), motion === "both" ? T("bar.motion.both") : T("bar.motion.ss"), L(month) + (readOnly ? ` · ${T("bar.readOnly")}` : "")].join(" · "),
    pending: neverSaved ? T("bar.neverSaved") : null,
    menuLabel: T("bar.menu"),
    menuOpen,
    settingsLabel: T("bar.settings"),
    groups: [
      { title: T("bar.group.engine"), items: [h(Button, { variant: "quiet" }, T("bar.switch")), h(Button, { variant: "quiet" }, T("bar.rename"))] },
      {
        title: T("bar.group.month"),
        items: [
          h(Select, {
            label: T("bar.monthField"), size: "sm", fit: "content", value: "2026-08", onChange: () => {},
            options: [{ value: "2026-08", label: L(F.MONTHS.current) }, { value: "2026-07", label: L(F.MONTHS.past) }],
          }),
          h(Button, { variant: "quiet" }, T("bar.compare")),
          h(Button, { variant: "quiet" }, T("bar.remind", { next: L(F.MONTHS.next) })),
        ],
      },
      {
        title: T("bar.group.file"),
        items: [
          h(Button, { variant: "quiet" }, T("bar.save")),
          h(Button, { variant: "quiet" }, T("bar.import")),
          h(Button, { variant: "quiet" }, T("bar.table")),
          h(Button, { variant: "quiet" }, T("bar.erase")),
        ],
      },
    ],
    note: neverSaved ? T("bar.backup") : null,
  });

// ── The numbers list ──────────────────────────────────────────────────────
const valueOf = (id, status) =>
  status === "found" ? L(F.FIGURES[id]) : status === "est" ? L(F.RANGES[id]) ?? "" : "";

const numberList = (statuses, { holds = "Activation", askedAgo = true } = {}) =>
    h(NumberList, {
      title: T("list.title"),
      progress: listProgress(statuses),
      stages: STAGES.map((stage) => {
        const ids = SS_IDS.filter((id) => BY_ID[id].stage === stage);
        const found = ids.filter((id) => statuses[id] === "found").length;
        return {
          id: stage,
          name: stage,
          holdsBack: holds === stage,
          holdsLabel: T("list.holds"),
          foundLabel: T("list.found", { found, n: ids.length }),
          marks: ids.map((id) => statuses[id]),
          rows: ids.map((id) => ({
            id,
            name: C(id).name,
            value: valueOf(id, statuses[id]),
            status: statuses[id],
            statusLabel: statuses[id] === "asked" && askedAgo ? T("status.askedAgo") : T(STATUS_WORD[statuses[id]]),
          })),
        };
      }),
      computed: {
        title: T("list.computed", { n: COMPUTED_IDS.length }),
        rows: COMPUTED_IDS.map((id) => {
          const ready = statuses["ss:cac"] === "found" && statuses["ss:gross-margin"] === "found" && statuses["ss:monthly-contraction"] === "found" && statuses["ss:monthly-expansion"] === "found";
          return { id, name: C(id).name, value: ready ? L(F.FIGURES[id]) : "", status: "computed", note: ready ? null : T("status.needs", { what: L(F.NEEDS[id]) }) };
        }),
      },
    });

const listProgress = (statuses) =>
  h(EngineProgress, {
    remaining: toGoText(statuses),
    counts: countsText(statuses),
    groups: progressGroups(statuses),
    legend: legend(),
    legendLabel: T("progress.legendLabel"),
    label: T("list.title"),
  });

// ── Diagnosis, peloton, lever ─────────────────────────────────────────────
const diagnosis = (scenario = "returning") =>
  h(Diagnosis, {
    eyebrow: T("diag.eyebrow"),
    stage: "Activation",
    value: T("diag.value", { number: C("ss:activation-rate").name, value: scenario === "past" ? (lang === "fr" ? frTypo("16 %") : "16%") : L(F.FIGURES["ss:activation-rate"]), target: L(F.TARGETS.returning["ss:activation-rate"]) }),
    hiding: scenario === "returning" ? T("diag.hiding") : null,
    top: T("diag.top"),
  });

const peloton = (scenario = "returning") => {
  const data = F.PELOTON[scenario];
  return h(Peloton, {
    title: T("peloton.title"),
    lead: T("peloton.lead"),
    data,
    holds: true,
    phone,
    labels: [T("peloton.c1"), T("peloton.c2"), T("peloton.c3"), T("peloton.c4")],
    sources: [T("peloton.s1"), T("peloton.s2"), data.active == null ? T("peloton.s3") : T("peloton.s3found"), data.paying[0] === data.paying[1] ? T("peloton.s4found") : T("peloton.s4")],
  });
};

const pct = (n) => (lang === "fr" ? `${n} %` : `${n}%`);

const leverCard = (moved = false) =>
  h(LeverCard, {
    eyebrow: T("whatif.title"),
    title: moved ? T("whatif.moved", { lever: C("ss:activation-rate").name.toLowerCase(), from: pct(F.LEVER.today), to: pct(F.LEVER.moved) }) : T("whatif.untouched"),
    lever: {
      id: "lever-activation",
      label: T("whatif.lever", { lever: C("ss:activation-rate").name, value: pct(F.LEVER.today) }),
      min: 0, max: 60, step: 1,
      value: moved ? F.LEVER.moved : F.LEVER.today,
      valueText: pct(moved ? F.LEVER.moved : F.LEVER.today),
    },
    figures: [
      { label: T("whatif.mrr12"), value: L(moved ? F.LEVER.mrr12.moved : F.LEVER.mrr12.today), today: moved ? T("whatif.today", { value: L(F.LEVER.mrr12.today) }) : null },
      { label: T("whatif.newPaying"), value: L(moved ? F.LEVER.newPaying.moved : F.LEVER.newPaying.today), today: moved ? T("whatif.today", { value: L(F.LEVER.newPaying.today) }) : null },
    ],
    allLabel: T("whatif.all"),
    resetLabel: T("whatif.reset"),
    moved,
  });

const tourMirror = () =>
  h(Disclosure, { summary: T("tour.title"), size: "md", rule: true, className: "Board_tour" },
    h("p", { className: "Board_p" }, T("tour.invite")),
    h(Button, { variant: "secondary" }, T("tour.go")));

// The page's own sections under the tool: kept, folded, still in the HTML.
const pageBelow = (withHowLong = false) =>
  h("div", { className: "Board_below" },
    withHowLong ? h(Disclosure, { summary: T("landing.belowTitle"), size: "md", rule: true }, h("p", { className: "Board_p" }, T("start.plan.ss"))) : null,
    h(Disclosure, { summary: T("page.catalogue"), size: "md", rule: true }, h("p", { className: "Board_p" }, "…")),
    h(Disclosure, { summary: T("page.faq"), size: "md", rule: true }, h("p", { className: "Board_p" }, "…")));

// ── The landing ───────────────────────────────────────────────────────────
const landing = ({ reserve } = {}) =>
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
    reserve: reserve ? T("landing.reserve") : null,
  });

// A returning page: the flag is set (here on the wrapper; in the app on <html>).
const returningPage = (...tool) =>
  h(PageChrome, { lang, phone },
    h("div", { "data-engine": "known", className: "Board_pageInner" },
      landing(),
      h("div", { className: "Board_tool", id: "engine", "data-measure": "tool" }, ...tool),
      pageBelow()));

// ── Next step, per state ──────────────────────────────────────────────────
const nextStep = (kind) => {
  const finance = ROLE_LABEL("finance");
  const data = ROLE_LABEL("data");
  const followUp = h(Button, { variant: "quiet", size: "sm" }, T("next.followUp"));
  const saveNow = h(Button, { variant: "quiet", size: "sm" }, T("next.saveNow"));
  switch (kind) {
    case "returning":
      return h(NextStep, {
        eyebrow: T("next.since", { ago: T("next.ago12") }),
        lead: T("next.toGo", { n: 4, own: 3, ask: 1, role: lang === "fr" ? "la finance" : finance }),
        lines: [
          { text: T("next.asked", { role: lang === "fr" ? "la data" : data, number: lang === "fr" ? "coefficient viral (K)" : "viral coefficient (K)", ago: T("next.ago12") }), tone: "pending", action: followUp },
          { text: T("next.backup"), tone: "advice", action: saveNow },
        ],
        primary: { label: T("next.go.ask", { role: lang === "fr" ? "la finance" : finance, number: "CAC" }) },
      });
    case "refused":
      return h(NextStep, {
        eyebrow: T("next.since", { ago: T("next.ago12") }),
        lead: T("next.refused"),
        leadTone: "advice",
        lines: [{ text: T("next.toGo", { n: 4, own: 3, ask: 1, role: lang === "fr" ? "la finance" : finance }) }],
        primary: { label: T("next.go.saveFile") },
      });
    case "found":
      return h(NextStep, {
        eyebrow: T("next.since", { ago: T("next.ago3") }),
        lead: T("next.allFound", { n: 17 }),
        lines: [{ text: T("next.verdictIsSlide") }],
        primary: { label: T("next.go.slides") },
      });
    case "month":
      return h(NextStep, {
        eyebrow: T("next.since", { ago: T("next.ago12") }),
        lead: T("next.monthEnded", { month: L(F.MONTHS.next).replace(/^./, (c) => c.toUpperCase()) }),
        lines: [
          { text: T("next.monthCarries", { prev: L(F.MONTHS.current) }) },
          { text: T("next.toGo", { n: 4, own: 3, ask: 1, role: lang === "fr" ? "la finance" : finance }), tone: "pending" },
        ],
        primary: { label: T("next.go.month", { month: L(F.MONTHS.next) }) },
        secondary: h(Button, { variant: "quiet" }, T("next.keepFilling", { prev: L(F.MONTHS.current) })),
      });
    case "past":
      return h(NextStep, {
        eyebrow: `${L(F.MONTHS.past).replace(/^./, (c) => c.toUpperCase())} · ${T("bar.readOnly")}`,
        lead: T("next.past", { month: L(F.MONTHS.past) }),
        primary: { label: T("next.go.back", { month: L(F.MONTHS.current) }) },
        secondary: h(Button, { variant: "quiet" }, T("next.correct")),
      });
    case "mid":
      return h(NextStep, {
        eyebrow: T("next.where"),
        lead: T("next.mid", { n: 5, ask: 5 }),
        primary: { label: T("next.go.requests", { n: 5 }) },
        secondary: h(Button, { variant: "quiet" }, T("next.skipRequests")),
      });
    case "end":
      return h(NextStep, {
        eyebrow: T("next.where"),
        lead: T("next.endAnswered", { found: 10, est: 2, cant: 1, asked: 4 }),
        lines: [
          { text: T("next.requestsOut", { n: 4, date: L(F.MONTHS.copiedOn) }), tone: "pending" },
          { text: T("next.verdictIsSlide") },
        ],
        primary: { label: T("next.go.slides") },
      });
    default:
      return null;
  }
};

// ── The board (the tool on return) ────────────────────────────────────────
const board = ({ scenario = "returning", next = "returning", month, readOnly, neverSaved = true, menuOpen, verdict = scenario, holds = "Activation", lever = true } = {}) => {
  const statuses = F.STATUSES[scenario];
  return [
    engineBar({ month, readOnly, neverSaved, menuOpen }),
    verdict ? h(Verdict, { parts: F.VERDICTS[verdict][lang].map(fr) }) : h(VerdictPending, { text: T("verdict.pending") }),
    nextStep(next),
    holds ? diagnosis(verdict === "past" ? "past" : scenario === "returning" ? "returning" : "found") : h("p", { className: "Board_p Board_noStage" }, T("diag.none"), " ", h(Button, { variant: "quiet", size: "sm" }, T("diag.addTargets"))),
    verdict ? peloton(verdict === "past" ? "past" : scenario === "found" ? "found" : "returning") : null,
    numberList(statuses, { holds }),
    lever ? leverCard(false) : null,
    tourMirror(),
    next === "found" || next === "end" ? null : h(Button, { variant: "quiet", className: "Board_slidesQuiet" }, T("slides.quiet")),
  ];
};

// ── One number's screen ───────────────────────────────────────────────────
const sheetHeader = (id, statuses, override) => {
  const e = C(id);
  const ids = SS_IDS.filter((x) => BY_ID[x].stage === e.stage);
  return {
    position: T("sheet.position", { stage: e.stage, i: ids.indexOf(id) + 1, n: ids.length }),
    progress: h(EngineProgress, { size: "sm", remaining: override ?? toGoText(statuses) }),
  };
};

const trapFor = (id, { action = true } = {}) => {
  const e = C(id);
  if (!e.trap) return null;
  const mentionsDefinition = /definition/i.test(BY_ID[id].en.trap ?? "");
  return h(TrapNote, {
    label: T("trap.label"),
    action: action && mentionsDefinition ? h(Button, { variant: "quiet", size: "sm" }, T("trap.writeDefinition")) : null,
  }, e.trap);
};

const SAME_TOOL = {
  "ss:sign-up-rate": [
    { tool: "GA4", items: ["ss:top-channel-share", "ss:activation-rate", "ss:median-time-to-value", "ss:day-30-retention"] },
    { tool: "Mixpanel", items: ["ss:activation-rate", "ss:day-30-retention", "ss:viral-coefficient-k"] },
  ],
};

const whereFor = (id, open = false, yours = null) => {
  const e = C(id);
  if (!e.where.length) return null;
  return h(WhereToFind, {
    label: T("where.label"),
    tools: e.where.map((w) => ({ ...w, yours: yours && w.tool.startsWith(yours) })),
    yoursLabel: T("where.yours"),
    open,
    also: (SAME_TOOL[id] ?? []).map((a) => ({ tool: a.tool, label: T("where.also", { tool: a.tool }), items: a.items.map((x) => ({ id: x, label: C(x).name.toLowerCase() })) })),
  });
};

const compareFor = (id, { value = null, target = null, typedTarget = "", estimate = null } = {}) => {
  const e = C(id);
  const ref = parseRef(id);
  const targetable = TARGETABLE.includes(id);
  if (!ref && !targetable) return null;
  const band = ref && !ref.none ? [ref.low, ref.high] : undefined;
  const top = band ? band[1] * 2 : Math.max(target ?? 0, value ?? 0) * 2 || 10;
  const legendItems = [];
  if (value != null) legendItems.push({ kind: "value", label: `${T("compare.yours")} ${pct(String(value).replace(".", lang === "fr" ? "," : "."))}` });
  if (estimate) legendItems.push({ kind: "value", label: `${T("compare.yours")} ${estimate}` });
  if (band) legendItems.push({ kind: "band", label: T("compare.reference", { range: ref.range }) });
  if (target != null) legendItems.push({ kind: "target", label: `${T("compare.target")} ${pct(target)}` });
  const verdict = target != null && value != null ? (value < target ? { tone: "below", label: T("compare.below") } : { tone: "ok", label: T("compare.atOrAbove") }) : null;
  return h(HowItCompares, {
    title: T("compare.title"),
    value,
    domain: [0, top],
    band,
    target: target ?? undefined,
    chartLabel: T("compare.chart", { name: e.name, value: value != null ? pct(value) : "—", range: band ? ref.range : "—", target: target != null ? T("compare.chartTarget", { value: pct(target) }) : T("compare.chartNoTarget") }),
    legend: legendItems,
    caveat: ref ? (ref.none ? ref.text : ref.caveat) : null,
    verdict,
    note: !targetable ? T("compare.noTargetHere") : null,
    targetField: targetable
      ? h(NumberField, {
          label: T("compare.target"),
          optional: T("compare.optional"),
          value: typedTarget,
          onChange: () => {},
          locale: lang,
          suffix: "%",
          digits: 4,
          fit: "content",
          size: "sm",
          hint: h("span", null, T("compare.targetHint"), " ", Term("target")),
        })
      : null,
  });
};

// A text area is a Field (label, hint) around the bare TextArea control.
const textArea = ({ label, hint, optional, value = "", rows = 3 }) =>
  h(Field, { label, hint, optional },
    ({ id, describedBy }) => h(TextArea, { id, "aria-describedby": describedBy, value, onChange: () => {}, maxLength: 200, rows }));

const words = (open = false) =>
  h(Disclosure, { summary: T("words.summary"), size: "md", rule: true, defaultOpen: open },
    h("div", { className: "Board_words" },
      textArea({ label: T("words.definition"), optional: T("compare.optional"), hint: T("words.definitionHint"), rows: 3 }),
      textArea({ label: T("words.note"), optional: T("compare.optional"), hint: T("words.noteHint"), rows: 2 })));

const answerOptions = () => [
  { value: "estimate", label: T("answer.estimate") },
  { value: "ask", label: T("answer.ask") },
  { value: "cant", label: T("answer.cant") },
];

const actions = (last = false) => [
  h(Button, { variant: "primary", size: "lg", type: "submit", key: "save" }, last ? T("sheet.saveLast") : T("sheet.save")),
  h(Button, { variant: "quiet", key: "list" }, T("sheet.toList")),
  h(Button, { variant: "quiet", key: "skip" }, T("sheet.skip")),
];

// The value boxes of a ratio number.
const ratioFields = ({ num, den, numLabel, denLabel, error, sharedHint, cohortHint, result }) =>
  h("div", { className: "Board_ratio" },
    h(FieldRow, { joiner: T("value.joiner"), error },
      h(NumberField, { label: numLabel, value: num, onChange: () => {}, locale: lang, group: true, digits: 7, fit: "content", error: error ? " " : undefined }),
      h(NumberField, { label: denLabel, value: den, onChange: () => {}, locale: lang, group: true, digits: 7, fit: "content", hint: cohortHint })),
    sharedHint ? h("p", { className: "Field_hint Board_sharedHint" }, sharedHint) : null,
    result ? h("p", { className: "Board_result" }, result) : null,
    h(Button, { variant: "quiet", size: "sm", className: "Board_onlyRate" }, T("value.onlyRate")));

const sourceFields = (value = "GA4") =>
  h("div", { className: "Board_source" },
    h(Select, {
      label: T("value.source"), value, placeholder: T("value.choose"), onChange: () => {}, fit: "content",
      options: C("ss:sign-up-rate").where.map((w) => ({ value: w.tool, label: w.tool })),
    }),
    h(Checkbox, { label: T("value.otherTool"), checked: false, onChange: () => {}, size: "sm" }));

const signupSheet = ({ statuses = F.STATUSES.start, filled = false, open = false, invalid = false, progress } = {}) => {
  const id = "ss:sign-up-rate";
  const e = C(id);
  const hdr = sheetHeader(id, statuses, progress);
  const num = invalid ? (lang === "fr" ? "26 200" : "26,200") : filled ? "820" : "";
  const den = invalid ? "820" : filled ? (lang === "fr" ? "26 200" : "26,200") : "";
  return h(NumberSheet, {
    ...hdr,
    name: e.name,
    effort: e.effort,
    definitionLabel: T("sheet.definition"),
    definitionHref: "#glossary",
    definition: e.def,
    formulaLabel: T("sheet.formula"),
    formula: e.formula,
    tour: open ? T("sheet.tour", { answer: T("sheet.tourAnswer") }) : null,
    trap: trapFor(id),
    where: whereFor(id, open, open ? "GA4" : null),
    answer: h(AnswerSwitch, {
      legend: T("answer.legend"),
      options: answerOptions(),
      answer: null,
      backLabel: T("answer.back"),
      value: ratioFields({
        num, den,
        numLabel: T("value.signupsMonth"),
        denLabel: T("value.visitorsMonth"),
        error: invalid ? T("value.invalid") : undefined,
        sharedHint: filled || invalid ? T("value.shared") : null,
        result: filled && !invalid ? T("value.result", { name: e.name, value: L(F.FIGURES[id]) }) : null,
      }),
      source: filled && !invalid ? sourceFields() : null,
    }),
    compare: compareFor(id, { value: filled && !invalid ? 3.1 : null }),
    words: words(false),
    actions: actions(false),
  });
};

const activationSheet = () => {
  const id = "ss:activation-rate";
  const e = C(id);
  return h(NumberSheet, {
    ...sheetHeader(id, F.STATUSES.last, T("progress.toGo", { n: 6 })),
    name: e.name, effort: e.effort, definitionLabel: T("sheet.definition"), definitionHref: "#glossary",
    definition: e.def, formulaLabel: T("sheet.formula"), formula: e.formula,
    trap: trapFor(id),
    where: whereFor(id),
    answer: h(AnswerSwitch, {
      legend: T("answer.legend"), options: answerOptions(), answer: null, backLabel: T("answer.back"),
      value: ratioFields({
        num: "144", den: "800",
        numLabel: T("value.activatedCohort"),
        denLabel: T("value.cohortSignups"),
        cohortHint: h("span", null, T("value.cohortHint"), " ", Term("cohort")),
        sharedHint: T("value.sharedTarget"),
        result: T("value.result", { name: e.name, value: L(F.FIGURES[id]) }),
      }),
      source: h(Select, { label: T("value.source"), value: "Amplitude", onChange: () => {}, fit: "content", options: e.where.map((w) => ({ value: w.tool, label: w.tool })) }),
    }),
    compare: compareFor(id, { value: 18, target: 20, typedTarget: "20" }),
    words: words(false),
    actions: actions(false),
  });
};

const altSheet = (id, answer, editor, statuses = F.STATUSES.returning, override) => {
  const e = C(id);
  return h(NumberSheet, {
    ...sheetHeader(id, statuses, override),
    name: e.name, effort: e.effort, definitionLabel: T("sheet.definition"), definitionHref: "#glossary",
    definition: e.def, formulaLabel: T("sheet.formula"), formula: e.formula,
    trap: trapFor(id),
    where: whereFor(id),
    answer: h(AnswerSwitch, { legend: T("answer.legend"), options: answerOptions(), answer, backLabel: T("answer.back"), editor }),
    compare: answer === "estimate" ? compareFor(id, { estimate: L(F.RANGES[id]) }) : compareFor(id),
    words: words(false),
    actions: actions(false),
  });
};

const estimateEditor = () =>
  h("div", { className: "Board_editor" },
    h(FieldRow, { joiner: T("estimate.joiner") },
      h(NumberField, { label: T("estimate.low"), value: "2", onChange: () => {}, locale: lang, digits: 3, fit: "content", suffix: T("estimate.unit") }),
      h(NumberField, { label: T("estimate.high"), value: "4", onChange: () => {}, locale: lang, digits: 3, fit: "content", suffix: T("estimate.unit") })),
    textArea({ label: T("estimate.basis"), value: T("estimate.basisValue"), rows: 2 }));

const askEditor = () =>
  h("div", { className: "Board_editor" },
    h(Select, {
      label: T("ask.role"), value: "finance", onChange: () => {}, fit: "content",
      options: ["finance", "data", "product", "sales"].map((r) => ({ value: r, label: r === "product" || r === "sales" ? T(`ask.role.${r}`) : ROLE_LABEL(r) })),
    }),
    h("div", { className: "Board_request" },
      h(MetaLabel, { size: "xs", tone: "muted" }, T("ask.preview")),
      h("blockquote", { className: "AskList_request" }, T("ask.text.cac"))),
    h("p", { className: "AskList_copied" }, T("ask.copied", { date: L(F.MONTHS.copiedOn) })));

const cantEditor = () =>
  h("div", { className: "Board_editor" },
    h(Choices, {
      legend: T("cant.legend"), size: "sm", value: "notTracked", onChange: () => {},
      options: [
        { value: "notTracked", label: T("cant.notTracked") },
        { value: "noAccess", label: T("cant.noAccess") },
        { value: "undefined", label: T("cant.undefined") },
      ],
    }),
    h(TrapNote, { label: T("cant.repairLabel") }, T("cant.repair")));

// ── Settings ──────────────────────────────────────────────────────────────
const settings = () =>
  h(Card, { elevation: "flat", tone: "paper", className: "Board_settings" },
    h("h2", { className: "Board_h2" }, T("settings.title")),
    h("p", { className: "Board_p" }, T("settings.lead")),
    h(Choices, {
      legend: T("start.legend"), value: "ss", onChange: () => {}, size: "sm",
      options: [
        { value: "ss", label: T("start.ss"), note: T("start.ssNote") },
        { value: "sa", label: T("start.sa"), note: T("start.saNote") },
        { value: "both", label: T("start.both"), note: T("start.bothNote") },
      ],
    }),
    h("section", { className: "Board_settingsGroup" },
      h("h3", { className: "Board_h3" }, T("settings.month")),
      h(Select, {
        label: T("settings.flows"), value: "2026-08", onChange: () => {}, fit: "content", hint: T("settings.flowsHint"),
        options: [{ value: "2026-08", label: L(F.MONTHS.current) }, { value: "2026-07", label: L(F.MONTHS.past) }],
      }),
      h(Choices, {
        legend: T("settings.activation"), value: "14", onChange: () => {}, size: "sm", columns: 2,
        hint: h("span", null, T("settings.windowHint"), " ", Term("window")),
        options: ["7", "14", "30"].map((n) => ({ value: n, label: T("settings.days", { n }) })),
      }),
      h(Card, { elevation: "flat", tone: "outlineAlert", padding: "var(--space-6) var(--space-7)", className: "Board_warn" },
        h("p", { className: "Board_p" }, T("settings.windowWarn"))),
      h(Choices, {
        legend: T("settings.payment"), value: "30", onChange: () => {}, size: "sm", columns: 2,
        options: ["30", "60", "90"].map((n) => ({ value: n, label: T("settings.days", { n }) })),
      })),
    h("section", { className: "Board_settingsGroup" },
      h("h3", { className: "Board_h3" }, T("settings.targets"), " ", Term("target")),
      h("p", { className: "Board_p" }, T("settings.targetsLead")),
      h("div", { className: "Board_targets" },
        TARGETABLE.map((id) =>
          h(NumberField, { key: id, label: C(id).name, value: id === "ss:activation-rate" ? "20" : "", onChange: () => {}, locale: lang, suffix: "%", digits: 4, fit: "content", size: "sm", hint: C(id).def })))),
    h("section", { className: "Board_settingsGroup" },
      h("h3", { className: "Board_h3" }, T("settings.shared"), " ", Term("sharedCount")),
      h(NumberField, { label: T("value.signupsMonth"), value: "820", onChange: () => {}, locale: lang, group: true, digits: 7, fit: "content", size: "sm", hint: T("settings.sharedHint", { list: [C("ss:sign-up-rate").name, C("ss:top-channel-share").name].join(", ") }) }),
      h(NumberField, { label: T("value.cohortSignups"), value: "800", onChange: () => {}, locale: lang, group: true, digits: 7, fit: "content", size: "sm", hint: T("settings.sharedHint", { list: [C("ss:activation-rate").name, C("ss:day-30-retention").name, C("ss:paid-conversion").name, C("ss:referred-sign-up-share").name].join(", ") }) })),
    h("section", { className: "Board_settingsGroup" },
      h(Select, { label: T("settings.currency"), value: "EUR", onChange: () => {}, fit: "content", options: [{ value: "EUR", label: "EUR (€)" }, { value: "USD", label: "USD ($)" }, { value: "GBP", label: "GBP (£)" }] }),
      h(TextField, { label: T("settings.name"), optional: T("compare.optional"), value: "", onChange: () => {}, maxLength: 60 }),
      h("fieldset", { className: "Board_tools" },
        h("legend", { className: "Field_label" }, T("settings.tools")),
        h("p", { className: "Field_hint" }, T("settings.toolsHint")),
        h("div", { className: "Board_toolsGrid" },
          ["GA4", "Mixpanel", "Amplitude", "PostHog", "HubSpot", "Salesforce", "Stripe", "Chargebee"].map((tool) =>
            h(Checkbox, { key: tool, label: tool, checked: tool === "GA4" || tool === "Stripe", onChange: () => {}, size: "sm" })))),
      h(Choices, {
        legend: T("settings.company"), value: "b2b", onChange: () => {}, size: "sm",
        options: [
          { value: "b2b", label: "B2B SaaS" },
          { value: "consumer", label: T("settings.consumer"), disabled: true, disabledNote: T("settings.later") },
          { value: "marketplace", label: "Marketplace", disabled: true, disabledNote: T("settings.later") },
        ],
      }),
      h(Checkbox, { label: T("settings.tourLink"), checked: false, onChange: () => {} })),
    h("div", { className: "Board_settingsActions" },
      h(Button, { variant: "primary", size: "lg" }, T("settings.save")),
      h(Button, { variant: "quiet" }, T("settings.cancel"))));

// ── Screens ───────────────────────────────────────────────────────────────
const tool = (...children) => h("div", { className: "Board_toolOnly" }, h("div", { className: "Board_tool", "data-measure": "tool" }, ...children));

const startCard = () =>
  h(EngineStart, {
    title: T("start.title"),
    legend: T("start.legend"),
    options: [
      { value: "ss", label: T("start.ss"), note: T("start.ssNote") },
      { value: "sa", label: T("start.sa"), note: T("start.saNote") },
      { value: "both", label: T("start.both"), note: T("start.bothNote") },
    ],
    motion: "ss",
    plan: T("start.plan.ss"),
    defaults: T("start.defaults"),
    changeLabel: T("start.change"),
    startLabel: T("start.go"),
    exampleLabel: T("start.example"),
    importLabel: T("start.import"),
  });

const asks = () =>
  h(AskList, {
    title: T("asks.title", { n: 5 }),
    lead: T("asks.lead"),
    groups: [
      { role: ROLE_LABEL("finance"), numbers: [C("ss:cac").name, C("ss:gross-margin").name].join(" · "), request: T("asks.text.finance"), copied: T("ask.copied", { date: L(F.MONTHS.copiedOn) }) },
      { role: ROLE_LABEL("data"), numbers: [C("ss:paid-conversion").name, C("ss:viral-coefficient-k").name].join(" · "), request: T("asks.text.data"), copyLabel: T("ask.copy") },
      { role: ROLE_LABEL("cs"), numbers: C("ss:main-churn-cause").name, request: T("asks.text.cs"), copyLabel: T("ask.copy") },
    ],
    done: { label: T("asks.done") },
  });

const RENDER = {
  journey: () => h("div", { className: "Board_wide" }, h(Journey, { lang, phone, T, measures: MEASURES })),

  arrival: () =>
    h(PageChrome, { lang, phone },
      h("div", { className: "Board_pageInner" },
        landing(),
        h("div", { className: "Board_tool", id: "engine", "data-measure": "tool" }, startCard()),
        h("p", { className: "Board_note" }, T("landing.belowNote")),
        pageBelow(true))),

  setup: () => tool(startCard()),

  "number-untouched": () => tool(signupSheet({ statuses: F.STATUSES.start })),
  "number-have": () => tool(signupSheet({ statuses: F.STATUSES.start, filled: true, progress: T("progress.toGo", { n: 17 }) })),
  "number-open": () => tool(signupSheet({ statuses: F.STATUSES.start, filled: true, open: true, progress: T("progress.toGo", { n: 17 }) })),
  "number-invalid": () => tool(signupSheet({ statuses: F.STATUSES.start, invalid: true })),
  "number-estimate": () => tool(altSheet("ss:median-time-to-value", "estimate", estimateEditor(), F.STATUSES.mid, T("progress.toGo", { n: 8 }))),
  "number-ask": () => tool(altSheet("ss:cac", "ask", askEditor(), F.STATUSES.returning, T("progress.toGo", { n: 4 }))),
  "number-cant": () => tool(altSheet("ss:day-30-retention", "cant", cantEditor(), F.STATUSES.mid, T("progress.toGo", { n: 6 }))),
  "number-target": () => tool(activationSheet()),

  "progress-middle": () =>
    tool(
      engineBar(),
      h(VerdictPending, { text: T("verdict.pending") }),
      nextStep("mid"),
      h("p", { className: "Board_p Board_noStage" }, T("diag.none"), " ", h(Button, { variant: "quiet", size: "sm" }, T("diag.addTargets"))),
      numberList(F.STATUSES.mid, { holds: null }),
    ),
  asks: () => tool(asks()),
  "progress-last": () => {
    const id = "ss:monthly-contraction";
    const e = C(id);
    return tool(h(NumberSheet, {
      ...sheetHeader(id, F.STATUSES.last),
      name: e.name, effort: e.effort, definitionLabel: T("sheet.definition"), definitionHref: "#glossary",
      definition: e.def, formulaLabel: T("sheet.formula"), formula: e.formula,
      trap: trapFor(id), where: whereFor(id),
      answer: h(AnswerSwitch, {
        legend: T("answer.legend"), options: answerOptions(), answer: null, backLabel: T("answer.back"),
        value: h(FieldRow, { joiner: T("value.joiner") },
          h(NumberField, { label: T("value.downgrades"), value: "", onChange: () => {}, locale: lang, group: true, digits: 7, fit: "content", prefix: lang === "fr" ? undefined : "€", suffix: lang === "fr" ? "€" : undefined }),
          h(NumberField, { label: T("value.mrrStart"), value: lang === "fr" ? "47 600" : "47,600", onChange: () => {}, locale: lang, group: true, digits: 7, fit: "content", prefix: lang === "fr" ? undefined : "€", suffix: lang === "fr" ? "€" : undefined, hint: T("value.sharedExpansion") })),
      }),
      compare: compareFor(id),
      words: words(false),
      actions: actions(true),
    }));
  },
  "progress-end": () => tool(...board({ scenario: "end", next: "end", verdict: "returning" })),

  whatif: () => tool(diagnosis("returning"), leverCard(false)),
  "whatif-moved": () => tool(diagnosis("returning"), leverCard(true)),

  "return-instant": () =>
    h(PageChrome, { lang, phone },
      h("div", { "data-engine": "known", className: "Board_pageInner" }, landing({ reserve: true }), pageBelow())),
  return: () => returningPage(...board({ scenario: "returning", next: "returning" })),
  "return-menu": () => returningPage(...board({ scenario: "returning", next: "returning", menuOpen: true })),
  "return-found": () => returningPage(...board({ scenario: "found", next: "found", verdict: "found", neverSaved: false })),
  "return-month": () => returningPage(...board({ scenario: "returning", next: "month" })),
  "return-past": () => returningPage(...board({ scenario: "found", next: "past", verdict: "past", month: F.MONTHS.past, readOnly: true, neverSaved: false, lever: false })),
  "return-refused": () => returningPage(...board({ scenario: "returning", next: "refused" })),
  "return-hybrid": () =>
    returningPage(
      engineBar({ motion: "both", neverSaved: false }),
      h(TotalBand, {
        eyebrow: T("total.eyebrow"),
        title: T("total.title"),
        engines: [{ label: T("total.ss"), value: L(F.HYBRID.ss) }, { label: T("total.sa"), value: L(F.HYBRID.sa) }],
        total: { label: T("total.sum"), value: L(F.HYBRID.total) },
        link: T("total.link", { n: F.HYBRID.link }),
      }),
      nextStep("found"),
      h("div", { className: "Board_motion" },
        h("span", { id: "motion-label", className: "Field_label" }, T("total.shown")),
        h(Segmented, { labelledBy: "motion-label", value: "ss", options: [{ id: "ss", label: T("start.ss") }, { id: "sa", label: T("start.sa") }] })),
      h(Verdict, { parts: F.VERDICTS.found[lang].map(fr) }),
      diagnosis("found"),
      peloton("found"),
      numberList(F.STATUSES.found),
      leverCard(false),
    ),

  settings: () => tool(settings()),

  compare: () => {
    const img = lang === "fr" ? "../../ds-extension-07/06-steps-number-have-open-fr-desktop.png" : "../../ds-extension-07/06-steps-number-have-open-en-mobile.png";
    const natural = lang === "fr" ? 960 : 390; // the capture's CSS width
    // Both at the capture's own width, scaled alike to sit side by side.
    const scale = phone ? (natural === 390 ? 0.7 : 0.3) : natural === 390 ? 1 : 0.6;
    return h("div", { className: "Board_compare", style: { "--compare-natural": `${natural}px`, "--compare-scale": scale } },
      h("figure", { className: "Board_compareCol" },
        h("figcaption", { className: "Board_compareCap" }, T("board.today")),
        h("div", { className: "Board_compareFrame" }, h("img", { src: img, alt: "", className: "Board_compareImg", width: natural }))),
      h("figure", { className: "Board_compareCol" },
        h("figcaption", { className: "Board_compareCap" }, T("board.proposed")),
        h("div", { className: "Board_compareFrame" },
          h("div", { className: "Board_compareLive", "data-measure": "compare-live" }, signupSheet({ statuses: F.STATUSES.start, filled: true, open: true, progress: T("progress.toGo", { n: 17 }) })))));
  },
};

// ── Draw ──────────────────────────────────────────────────────────────────
// (When framing, the frame draws the board: nothing to render here.)
if (!framing) {
  const root = document.getElementById("root");
  document.body.dataset.screen = screenId;
  document.body.dataset.w = String(width);
  render(RENDER[screenId](), root);
  document.title = `${screenId} · ${lang} · ${width} — engine 07`;
}
