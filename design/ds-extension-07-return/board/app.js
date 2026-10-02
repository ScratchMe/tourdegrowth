// Board-only stand-ins for what brief 07 does not redesign but the screens
// need around the new pieces: the site header and the engine's space band,
// the verdict, the diagnosis block and the peloton. They draw today's parts
// at the measures they have in the production build (site header 72px, band
// 46px), with the system's classes where the system has them. Not ported:
// the app keeps its own.
import React from "react";
import { Card, DotGrid, MetaLabel, Segmented } from "tour-de-growth";

const h = React.createElement;

export const PageChrome = ({ lang, phone, children }) =>
  h("div", { className: "App_page" },
    h("div", { className: "App_header" },
      h("span", { className: "App_wordmark" }, "TOUR DE ", h("span", { className: "App_wordmarkRed" }, "GROWTH")),
      h(Segmented, { size: "sm", value: lang, label: lang === "fr" ? "Langue" : "Language", options: [{ id: "en", label: "EN" }, { id: "fr", label: "FR" }] })),
    h("div", { className: "App_band" },
      h("span", { className: "App_bandSpace" }, lang === "fr" ? "2/3 · CONTRE-LA-MONTRE" : "2/3 · TIME TRIAL"),
      phone ? null : h("span", { className: "App_bandTitle" }, lang === "fr" ? "Le moteur" : "The engine")),
    h("main", { className: "App_main" }, children));

export const Verdict = ({ parts, id = "verdict" }) =>
  h("h2", { className: "App_verdict", id },
    parts[0], " ", h("span", { className: "App_verdictRed" }, parts[1]));

export const VerdictPending = ({ text }) =>
  h("p", { className: "App_verdictPending" }, text);

export const Diagnosis = ({ eyebrow, stage, value, hiding, top }) =>
  h("section", { className: "App_diag", "aria-label": eyebrow },
    h(MetaLabel, { size: "sm", tone: "alert", wide: true }, eyebrow),
    h("p", { className: "App_diagStage" }, stage),
    h("p", { className: "App_diagValue" }, value),
    hiding ? h("p", { className: "App_diagHiding" }, hiding) : null,
    top ? h("p", { className: "App_diagTop" }, top) : null);

const column = (count, kind = "filled") => Array.from({ length: 100 }, (_, i) => (i < count ? kind : "empty"));
const rangeColumn = ([lo, hi]) => Array.from({ length: 100 }, (_, i) => (i < lo ? "filled" : i < hi ? "range" : "empty"));

export const Peloton = ({ title, lead, data, labels, sources, holds, phone }) =>
  h(Card, { elevation: "raised", tone: "paper", className: "App_peloton" },
    h("h2", { className: "App_pelotonTitle" }, title),
    h("p", { className: "App_pelotonLead" }, lead),
    h("div", { className: "App_pelotonCols" },
      [
        { n: "100", label: labels[0], grid: { kind: "known", dots: column(100) }, src: sources[0] },
        { n: String(data.activated), label: labels[1], grid: { kind: "known", dots: column(data.activated) }, src: sources[1], hl: holds },
        { n: data.active == null ? "?" : String(data.active), label: labels[2], grid: data.active == null ? { kind: "unknown", dots: [] } : { kind: "known", dots: column(data.active) }, src: sources[2] },
        { n: data.paying[0] === data.paying[1] ? String(data.paying[0]) : `${data.paying[0]}–${data.paying[1]}`, label: labels[3], grid: { kind: "known", dots: rangeColumn(data.paying) }, src: sources[3] },
      ].map((c) =>
        h("figure", { key: c.label, className: "App_pelotonCol" },
          h("p", { className: "App_pelotonN" }, c.n),
          h("p", { className: "App_pelotonLabel" }, c.label),
          h(DotGrid, { grid: c.grid, label: `${c.n} ${c.label}`, highlighted: c.hl, medium: "screen" }),
          h("figcaption", { className: "App_pelotonSrc" }, c.src)))));
