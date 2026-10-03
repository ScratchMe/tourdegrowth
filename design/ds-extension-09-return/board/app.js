// Board-only stand-ins for what brief 09 does not redesign but the screens
// need around the money: the site header and the engine's band, the
// verdict, the diagnosis, the peloton, the panel's sliders and its funnel,
// today's tiles (for the "before" measures), and the deck's slide frame.
// They draw A18's parts at the measures they have on brief 09's
// screenshots, with the system's classes where the system has them. Not
// ported: the app keeps its own.
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

export const Diagnosis = ({ eyebrow, stage, number, value, hiding, top }) =>
  h("section", { className: "App_diag", "aria-label": eyebrow },
    h(MetaLabel, { size: "sm", tone: "alert", wide: true }, eyebrow),
    h("p", { className: "App_diagStage" }, stage),
    number ? h("p", { className: "App_diagNumber" }, number) : null,
    h("p", { className: "App_diagValue" }, value),
    hiding ? h("p", { className: "App_diagHiding" }, hiding) : null,
    top ? h("p", { className: "App_diagTop" }, top) : null);

const column = (count) => Array.from({ length: 100 }, (_, i) => (i < count ? "filled" : "empty"));

export const Peloton = ({ title, lead, data, labels, sources }) =>
  h(Card, { elevation: "raised", tone: "paper", className: "App_peloton" },
    h("h2", { className: "App_pelotonTitle" }, title),
    h("p", { className: "App_pelotonLead" }, lead),
    h("div", { className: "App_pelotonCols" },
      [
        { n: "100", label: labels[0], grid: { kind: "known", dots: column(100) }, src: sources[0] },
        { n: String(data.activated), label: labels[1], grid: { kind: "known", dots: column(data.activated) }, src: sources[1] },
        { n: "?", label: labels[2], grid: { kind: "unknown", dots: [] }, src: sources[2] },
        { n: String(data.paying[0]), label: labels[3], grid: { kind: "known", dots: column(data.paying[0]) }, src: sources[3] },
      ].map((c) =>
        h("figure", { key: c.label, className: "App_pelotonCol" },
          h(DotGrid, { grid: c.grid, label: `${c.n} ${c.label}`, medium: "screen" }),
          h("div", { className: "App_pelotonText" },
            h("p", { className: "App_pelotonN" }, c.n),
            h("p", { className: "App_pelotonLabel" }, c.label),
            h("figcaption", { className: "App_pelotonSrc" }, c.src))))));

// The panel's lever, as ported (`03`): name and value, the slider, "today …".
export const PanelLever = ({ id, label, valueText, value, min, max, step, today, moved }) =>
  h("div", { className: ["App_lever", moved ? "App_leverMoved" : ""].filter(Boolean).join(" ") },
    h("div", { className: "App_leverHead" },
      h("label", { htmlFor: id, className: "LeverCard_label" }, label),
      h("output", { htmlFor: id, className: "LeverCard_output" }, valueText)),
    h("input", {
      id, type: "range", className: "LeverCard_slider", min, max, step, value,
      "aria-valuetext": valueText,
      style: { "--lever-fill": `${((value - min) / (max - min)) * 100}%` },
    }),
    h("p", { className: "App_leverToday" }, today));

// The panel's funnel card (`05`), kept: drawn compactly, not redesigned.
export const FunnelCard = ({ title, rows, legend }) =>
  h(Card, { elevation: "flat", tone: "paper", className: "App_funnel" },
    h("h3", { className: "App_funnelTitle" }, title),
    h("dl", { className: "App_funnelRows" },
      rows.map((r) =>
        h("div", { key: r.label, className: "App_funnelRow" },
          h("dt", { className: "App_funnelLabel" }, r.label),
          h("dd", { className: "App_funnelN" }, r.n),
          r.note ? h("dd", { className: "App_funnelNote" }, r.note) : null))),
    legend ? h("p", { className: "App_funnelLegend" }, legend) : null);

// Today's StatTile, for the "before" panel only (`03`, `05`).
export const TileToday = ({ label, value, change, today }) =>
  h("div", { className: "App_tile" },
    h("p", { className: "App_tileLabel" }, label),
    h("p", { className: "App_tileValue" }, value),
    change ? h("p", { className: "App_tileChange" }, change) : null,
    today ? h("p", { className: "App_tileToday" }, today) : null);

// The deck's slide frame, as ported (`06`–`10`): header, data badge, title,
// body, footer. Drawn at 960 × 540 and scaled to the column (`scale`), the
// way the deck shows a slide on a phone; exported at 2×.
export const SlideFrame = ({ header, badge, title, children, footLeft, page, scale = 1, assumptions }) =>
  h("div", { className: "Slide_viewport", style: { "--slide-scale": scale } },
    h("article", { className: "Slide_root", "aria-label": typeof title === "string" ? title : undefined },
      h("div", { className: "Slide_top" },
        h("p", { className: "Slide_header" }, header),
        h("p", { className: "Slide_badge" }, badge)),
      h("h2", { className: "Slide_title" }, title),
      h("div", { className: "Slide_body" }, children),
      h("footer", { className: "Slide_foot" },
        h("p", { className: assumptions ? "Slide_assume" : "Slide_sources" }, footLeft),
        h("p", { className: "Slide_brand" },
          h("span", { className: "Slide_wordmark" }, "TOUR DE ", h("span", { className: "App_wordmarkRed" }, "GROWTH")),
          h("span", { className: "Slide_url" }, "tourdegrowth.com"),
          h("span", { className: "Slide_page" }, page)))));

// A part of the page drawn as it is, unchanged by this brief: one line.
export const Stub = ({ children }) => h("p", { className: "Board_stub" }, children);
