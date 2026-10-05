// Board-only stand-ins for what brief 10 does not redesign but the screens
// need around the marketplace: the site header and the engine's band, a
// side's verdict and diagnosis, the panel's sliders, and the deck's slide
// frame with the bodies of the slides a side reuses (the leak, "What if?",
// the unit economics) — drawn on the live deck's 1 920 × 1 080 canvas with
// the system's slide type tokens. Not ported: the app keeps its own, and
// changes only their words per side (COPY.md).
import React from "react";
import { MetaLabel, Segmented } from "tour-de-growth";

const h = React.createElement;

/** "**…**" → bold ink (never red: red is the leak's). */
export const rich = (text) => {
  if (typeof text !== "string" || !text.includes("**")) return text;
  return text.split("**").map((part, i) => (i % 2 ? h("strong", { key: i, className: "Board_em" }, part) : part));
};

export const PageChrome = ({ lang, phone, children }) =>
  h("div", { className: "App_page" },
    h("div", { className: "App_header" },
      h("span", { className: "App_wordmark" }, "TOUR DE ", h("span", { className: "App_wordmarkRed" }, "GROWTH")),
      h(Segmented, { size: "sm", value: lang, label: lang === "fr" ? "Langue" : "Language", options: [{ id: "en", label: "EN" }, { id: "fr", label: "FR" }] })),
    h("div", { className: "App_band" },
      h("span", { className: "App_bandSpace" }, lang === "fr" ? "2/3 · CONTRE-LA-MONTRE" : "2/3 · TIME TRIAL"),
      phone ? null : h("span", { className: "App_bandTitle" }, lang === "fr" ? "Le moteur" : "The engine")),
    h("main", { className: "App_main" }, children));

// A side's verdict: the funnel's sentence, the side's first line under the
// selector (as the hybrid draws an engine's). In ink, its stressed words
// bold: red stays the leak's.
export const Verdict = ({ text, id = "verdict" }) => h("p", { className: "App_verdict App_verdictSide", id }, rich(text));

export const Diagnosis = ({ eyebrow, stage, number, value, worth, aside, top }) =>
  h("section", { className: "App_diag", "aria-label": eyebrow },
    h(MetaLabel, { size: "sm", tone: "alert", wide: true }, eyebrow),
    h("p", { className: "App_diagStage" }, stage),
    number ? h("p", { className: "App_diagNumber" }, number) : null,
    h("p", { className: "App_diagValue" }, value),
    worth ? h("p", { className: "App_diagWorth" }, rich(worth)) : null,
    aside ? h("p", { className: "App_diagAside" }, aside) : null,
    top ? h("p", { className: "App_diagTop" }, top) : null);

// The panel's lever, as ported: name and value, the slider, "today …".
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

// The deck's slide frame, as the live deck draws it: a 1 920 × 1 080 canvas,
// scaled whole to the column (`scale`); the header line, the data badge,
// the title (its size by its length), the body, the footer.
const titleSize = (t) => {
  const n = typeof t === "string" ? t.replace(/\*\*/g, "").length : 80;
  return n > 112 ? "Slide_titleXlong" : n > 70 ? "Slide_titleLong" : "";
};
// `side`: the side a slide is about, named in ink above its title — every
// side's slide says its side before anything else (question 10).
export const SlideFrame = ({ header, badge, side, title, children, footLeft, page, scale = 0.5 }) =>
  h("div", { className: "Slide_viewport", style: { "--slide-scale": scale } },
    h("article", { className: "Slide_root", "aria-label": typeof title === "string" ? title.replace(/\*\*/g, "") : undefined },
      h("div", { className: "Slide_top" },
        h("p", { className: "Slide_header" }, header),
        badge ? h("p", { className: "Slide_badge" }, badge) : null),
      side ? h("p", { className: "Slide_side" }, side) : null,
      h("h2", { className: ["Slide_title", titleSize(title)].filter(Boolean).join(" ") }, rich(title)),
      h("div", { className: "Slide_body" }, children),
      h("footer", { className: "Slide_foot" },
        h("p", { className: "Slide_sources" }, footLeft),
        h("p", { className: "Slide_brand" },
          h("span", { className: "Slide_wordmark" }, "TOUR DE ", h("span", { className: "App_wordmarkRed" }, "GROWTH")),
          h("span", { className: "Slide_url" }, "tourdegrowth.com"),
          h("span", { className: "Slide_page" }, page)))));

// The leak slide's body, as today (`12`): the calculation, the stages
// beside it. The calculation's card keeps the diagnosis edge (the side's
// one red); beside it, every stage in ink — on a marketplace, red is the
// leak only, one per side (constraint 2).
export const SlideLeakBody = ({ calcTitle, rows, result, besideTitle, beside }) =>
  h("div", { className: "SlideLeak_root" },
    h("section", { className: "SlideLeak_calc" },
      h("h3", { className: "SlideLeak_kicker" }, calcTitle),
      h("dl", { className: "SlideLeak_rows" },
        rows.map((r) => h("div", { key: r.k, className: "SlideLeak_row" }, h("dt", null, r.k), h("dd", null, r.v)))),
      h("p", { className: "SlideLeak_result" }, rich(result))),
    h("section", { className: "SlideLeak_beside" },
      h("h3", { className: "SlideLeak_kicker" }, besideTitle),
      h("dl", { className: "SlideLeak_list" },
        beside.map((b) => h("div", { key: b.name, className: "SlideLeak_item" }, h("dt", null, b.name), h("dd", null, b.note))))));

// "What if?" on a slide: the curve (and the jump's line), the figures, and
// — several levers — what each brings alone and together.
export const SlideWhatIfBody = ({ curve, figures, sum, note }) =>
  h("div", { className: "SlideWhatIf_root" },
    h("div", { className: "SlideWhatIf_curve" }, curve),
    h("div", { className: "SlideWhatIf_side" },
      figures ? h("table", { className: "SlideWhatIf_table" },
        h("caption", null, figures.caption),
        h("thead", null, h("tr", null, figures.columns.map((c) => h("th", { key: c.key, scope: "col", className: c.numeric ? "SlideWhatIf_num" : "" }, c.header)))),
        h("tbody", null, figures.rows.map((r) =>
          h("tr", { key: r.id }, figures.columns.map((c, i) => (i === 0
            ? h("th", { key: c.key, scope: "row" }, r.cells[c.key])
            : h("td", { key: c.key, className: c.numeric ? "SlideWhatIf_num" : "" }, r.cells[c.key]))))))) : null,
      sum ?? null,
      note ? h("p", { className: "SlideWhatIf_note" }, note) : null));

// Unit economics on a slide: one row of tiles, the payback chart, the
// assumptions. No reference anywhere (C73): no tile note situating a ratio.
export const SlideUnitBody = ({ tiles, chart, assume }) =>
  h("div", { className: "SlideUnit_root" },
    h("dl", { className: "SlideUnit_tiles" },
      tiles.map((t) =>
        h("div", { key: t.key, className: "SlideUnit_tile" },
          h("dt", { className: "SlideUnit_label" }, t.label),
          h("dd", { className: "SlideUnit_value" }, t.value),
          t.note ? h("dd", { className: "SlideUnit_note" }, t.note) : null))),
    h("div", { className: "SlideUnit_chart" }, chart),
    assume ? h("p", { className: "SlideUnit_assume" }, assume) : null);

// A part of the page drawn as it is, unchanged by this brief: one line.
export const Stub = ({ children }) => h("p", { className: "Board_stub" }, children);
