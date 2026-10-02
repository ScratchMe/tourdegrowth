// Extension 05 — the states board. Hand-written source, no build step: open
// board.html?world=paper|night&lang=en|fr&w=390|1280 (index.html shows all
// eight). It imports the components' own files below, unchanged.
import React, { render } from "./react-lite.js";
import { StageScores } from "../components/result/StageScores/StageScores.js";
import { StageScore } from "../components/result/StageScore/StageScore.js";
import { StampedPillar } from "../components/result/StampedPillar/StampedPillar.js";

const h = React.createElement;

const q = new URLSearchParams(location.search);
const world = q.get("world") === "night" ? "night" : "paper";
const lang = q.get("lang") === "fr" ? "fr" : "en";
const width = q.get("w") === "390" ? 390 : 1280;
const phone = width === 390;
document.documentElement.lang = lang;

const NB = " ";
const T = {
  en: {
    title: "The stage scores",
    listLabel: "Score per stage, out of 20",
    profile: "Route profile",
    legend: "height = points missing out of 20",
    termLabel: (term) => `Definition: ${term}`,
    close: "Close",
    more: "Learn more →",
    linkLabel: (term) => `${term} — definition`,
    suffix: "dead last",
    share: "Share this result",
    sample: "See a sample result",
    primaryResult: "Take your own Tour →",
    primaryLanding: "Start the check-up →",
    definitions: {
      Acquisition: "How strangers find you and become visitors: channels, reach, what each one costs.",
      Activation: "The first moment a new sign-up gets the value they came for.",
      Retention: "The share of users who keep coming back after their first weeks. Without it, every other stage leaks.",
      Referral: "Customers who bring other customers, on purpose or not.",
      Revenue: "What people pay, how, and whether it covers what they cost.",
    },
  },
  fr: {
    title: "Les scores par étape",
    listLabel: "Score par étape, sur 20",
    profile: "Profil du parcours",
    legend: "hauteur = points manquants sur 20",
    termLabel: (term) => `Définition${NB}: ${term}`,
    close: "Fermer",
    more: "En savoir plus →",
    linkLabel: (term) => `${term} — définition`,
    suffix: "bon dernier",
    share: "Partager ce résultat",
    sample: "Voir un résultat d'exemple",
    primaryResult: "Faire mon propre Tour →",
    primaryLanding: "Commencer le diagnostic →",
    definitions: {
      Acquisition: "Comment des inconnus te trouvent et deviennent visiteurs : canaux, portée, coût de chacun.",
      Activation: "Le premier moment où un nouvel inscrit obtient ce pour quoi il est venu.",
      Retention: `La part des utilisateurs qui reviennent après leurs premières semaines. Sans elle, toutes les autres étapes fuient.`,
      Referral: "Les clients qui en amènent d'autres, exprès ou non.",
      Revenue: "Ce que les gens paient, comment, et si cela couvre ce qu'ils coûtent.",
    },
  },
}[lang];
// French: a no-break space before « : ».
if (lang === "fr") {
  for (const k of Object.keys(T.definitions)) T.definitions[k] = T.definitions[k].replace(" :", `${NB}:`);
}

const SAMPLE = [
  { stage: "Acquisition", short: "Acq.", score: 18 },
  { stage: "Activation", short: "Act.", score: 12 },
  { stage: "Retention", short: "Ret.", score: 8 },
  { stage: "Referral", short: "Ref.", score: 16 },
  { stage: "Revenue", short: "Rev.", score: 20 },
];
const LEVEL = [16, 20, 16, 20, 16].map((score, i) => ({ ...SAMPLE[i], score }));
const WEAK = "Retention";

/* ── State: one popover open per screen ─────────────────────────────────── */
let openKey = "open:Retention";
const toggle = (key) => {
  openKey = openKey === key ? null : key;
  draw();
};

/* ── Board-only stand-ins for the synced glossary pieces ────────────────── */
// DefinitionTrigger as extension 05 draws it (DefinitionTrigger.css): a real
// <button>, labelled, aria-expanded.
const Trigger = ({ term, tone, k, force }) => {
  const open = openKey === k;
  return h(
    "button",
    {
      type: "button",
      className: [
        "DefinitionTrigger_trigger",
        `DefinitionTrigger_${tone}`,
        open && "DefinitionTrigger_open",
        force && `force-${force}`,
      ]
        .filter(Boolean)
        .join(" "),
      "aria-label": T.termLabel(term),
      "aria-expanded": open ? "true" : "false",
      "data-open": open ? "" : null,
      onClick: () => toggle(k),
    },
    "?",
  );
};

// DefinitionPopover, anchored (desktop) or docked (phone), drawn in place.
const Popover = ({ term }) =>
  h(
    "div",
    {
      className: `DefinitionPopover_popover ${phone ? "DefinitionPopover_docked" : "DefinitionPopover_anchored"} B_popover`,
      role: "dialog",
      "aria-label": term,
    },
    h(
      "div",
      { className: "DefinitionPopover_topRow" },
      h("span", { className: "DefinitionPopover_term" }, term),
      phone
        ? h("button", { type: "button", className: "DefinitionPopover_closeButton", "aria-label": T.close, onClick: () => toggle(openKey) }, "✕")
        : null,
    ),
    h("p", { className: "DefinitionPopover_definition" }, T.definitions[term]),
    h("a", { className: "DefinitionPopover_more", href: `#/${lang}/glossary/${term.toLowerCase()}` }, T.more),
  );

// StageProfile, drawn statically from its own classes (the real one computes
// its geometry in lib/viz/stage-profile.ts). Context only: the sheet is its table.
const Profile = ({ rows }) => {
  const xs = [10, 30, 50, 70, 90];
  const hot = rows.findIndex((r) => r.stage === WEAK);
  const heights = rows.map((r) => ((20 - r.score) / 20) * 92);
  const yAt = (x, only) =>
    100 -
    rows.reduce((sum, _, i) => {
      if (only != null && i !== only) return sum;
      return sum + heights[i] * Math.exp(-((x - xs[i]) ** 2) / (2 * 4.2 ** 2));
    }, 0);
  const line = (only) => Array.from({ length: 101 }, (_, x) => `${x === 0 ? "M" : "L"}${x},${yAt(x, only).toFixed(2)}`).join(" ");
  const area = (only) => `${line(only)} L100,100 L0,100 Z`;
  return h(
    "div",
    { className: "StageProfile_card", "aria-hidden": "true" },
    h(
      "div",
      { className: "StageProfile_cap" },
      h("span", { className: "StageProfile_title" }, T.profile),
      h("span", null, T.legend),
    ),
    h(
      "div",
      { className: "StageProfile_plot" },
      h(
        "svg",
        { className: "StageProfile_svg", viewBox: "0 0 100 100", preserveAspectRatio: "none" },
        h("path", { className: "StageProfile_area", d: area() }),
        hot >= 0 ? h("path", { className: "StageProfile_hotArea", d: area(hot) }) : null,
        h("path", { className: "StageProfile_ridge", d: line(), "vector-effect": "non-scaling-stroke" }),
        h("path", { className: "StageProfile_road", d: "M0,100 L100,100", "vector-effect": "non-scaling-stroke" }),
      ),
      ...rows.map((r, i) =>
        i === hot
          ? h(
              "span",
              { className: "StageProfile_flag", style: { left: `${xs[i]}%`, top: `${100 - heights[i]}%` } },
              "HC",
              h("span", { className: "StageProfile_gapHot" }, `−${20 - r.score}`),
            )
          : h("span", { className: "StageProfile_gap", style: { left: `${xs[i]}%`, top: `${100 - heights[i]}%` } }, r.score === 20 ? "0" : `−${20 - r.score}`),
      ),
      ...xs.map((x) => h("span", { className: "StageProfile_tick", style: { left: `${x}%` } })),
    ),
    h(
      "div",
      { className: "StageProfile_labels" },
      ...rows.map((r, i) =>
        h("span", { className: `StageProfile_label ${i === hot ? "StageProfile_labelHot" : ""}`, style: { left: `${xs[i]}%` } }, r.short),
      ),
    ),
  );
};

/* ── The sheets ─────────────────────────────────────────────────────────── */
const Sheet = ({ rows, weak = WEAK, keyPrefix, size, forceRow, forceState, linked, stampAt }) =>
  h(
    StageScores,
    { size, label: T.listLabel },
    ...rows.map((r) => {
      if (stampAt === r.stage) return h(StampedPillar, { pillar: r.stage, score: r.score, suffix: T.suffix });
      const tone = r.stage === weak ? "alert" : "neutral";
      const k = `${keyPrefix}:${r.stage}`;
      return h(
        StageScore,
        {
          stage: r.stage,
          score: r.score,
          tone,
          href: linked ? `#/${lang}/glossary/${r.stage.toLowerCase()}` : undefined,
          linkLabel: linked ? T.linkLabel(r.stage) : undefined,
        },
        linked
          ? null
          : h(Trigger, { term: r.stage, tone: tone === "alert" ? "alert" : "muted", k, force: forceRow === r.stage ? forceState : null }),
      );
    }),
  );

const WithPopover = ({ keyPrefix, rows, children }) => {
  const open = rows.find((r) => openKey === `${keyPrefix}:${r.stage}`);
  return h("div", { className: "B_anchorWrap" }, children, open ? h(Popover, { term: open.stage }) : null);
};

/* ── Board chrome ──────────────────────────────────────────────────────── */
const State = ({ name, wide, children }) =>
  h("div", { className: `B_state ${wide ? "B_wide" : ""}` }, h("p", { className: "B_stateName" }, name), children);
const Section = ({ title, note, children }) =>
  h(
    "section",
    { className: "B_section" },
    h("div", { className: "B_head" }, h("h2", { className: "B_title" }, title), note ? h("p", { className: "B_note" }, note) : null),
    h("div", { className: "B_grid" }, children),
  );
const Column = ({ children }) => h("div", { className: "B_column" }, children);
const btn = (variant, label) =>
  h("button", { type: "button", className: `Button_button Button_${variant} Button_md` }, label);

// The old chip, as production draws it today, for the before/after.
const OldChip = ({ stage, score, weak }) =>
  h(
    "span",
    { className: `PillarChip_chip PillarChip_md PillarChip_stretch ${weak ? "PillarChip_weak" : "PillarChip_normal"}` },
    h("span", { className: `PillarChip_score ${weak ? "PillarChip_scoreWeak" : "PillarChip_scoreNormal"}` }, String(score)),
    h("span", null, "/20"),
    h("span", { className: "PillarChip_label" }, stage),
    h("span", { className: `B_oldTrigger ${weak ? "B_oldTriggerAlert" : ""}`, "aria-hidden": "true" }, "?"),
    h("span", { className: "PillarChip_meter", "aria-hidden": "true" }, h("span", { className: "PillarChip_meterFill", style: { width: `${(score / 20) * 100}%` } })),
  );

const Board = () =>
  h(
    "main",
    { className: "B_main" },
    h(
      "header",
      { className: "B_header" },
      h("p", { className: "B_kicker" }, `Tour de Growth · extension 05 · ${world} · ${lang.toUpperCase()} · ${width}px`),
      h("h1", { className: "B_h1" }, T.title),
    ),

    h(
      Section,
      { title: "On the result", note: "The route profile, and right under it its table: five rows of one sheet. The weak stage is the one with a wash and a solid red rule — the same stage the profile flags." },
      h(State, { name: "the sample result · one stage stalls" }, h(Column, null, h(Profile, { rows: SAMPLE }), h(WithPopover, { keyPrefix: "result", rows: SAMPLE }, h(Sheet, { rows: SAMPLE, keyPrefix: "result" })))),
      h(State, { name: "a level board · no red" }, h(Column, null, h(Sheet, { rows: LEVEL, weak: null, keyPrefix: "level" }))),
      h(
        State,
        { name: "roast · the stamp in the weakest stage's place, the second-lowest red" },
        h(Column, null, h(Sheet, { rows: SAMPLE, weak: "Activation", keyPrefix: "roast", stampAt: "Retention" })),
      ),
    ),

    h(
      Section,
      { title: "The ?", note: "The one thing to touch on a row. A solid ring at rest (a real edge), ink on hover, the ring on focus, the inverse fill while its definition is open." },
      h(State, { name: "closed" }, h(Column, null, h(Sheet, { rows: [SAMPLE[0], SAMPLE[2]], keyPrefix: "closed" }))),
      h(State, { name: "hover (pointer only)" }, h(Column, null, h(Sheet, { rows: [SAMPLE[0], SAMPLE[2]], keyPrefix: "hover", forceRow: "Acquisition", forceState: "hover" }))),
      h(State, { name: "focus-visible" }, h(Column, null, h(Sheet, { rows: [SAMPLE[0], SAMPLE[2]], keyPrefix: "focus", forceRow: "Retention", forceState: "focus" }))),
      h(
        State,
        { name: phone ? "open · the sheet docks at the bottom of the screen" : "open · the panel hangs under its ?" },
        h(Column, null, h(WithPopover, { keyPrefix: "open", rows: SAMPLE }, h(Sheet, { rows: SAMPLE, keyPrefix: "open" }))),
      ),
    ),

    h(
      Section,
      { title: "On the landing", note: "The preview's five are values too. The stage name is the link to its glossary page: underlined, in the row's ink, a 44px strip each; no ? here." },
      h(State, { name: "rest" }, h("div", { className: "Card_card Card_paper Card_hero B_card" }, h(Sheet, { rows: SAMPLE, size: "sm", keyPrefix: "land", linked: true }))),
      h(State, { name: "hover · Acquisition" }, h("div", { className: "Card_card Card_paper Card_flat B_card force-link-hover-1" }, h(Sheet, { rows: SAMPLE, size: "sm", keyPrefix: "land2", linked: true }))),
      h(State, { name: "focus-visible · Activation" }, h("div", { className: "Card_card Card_paper Card_flat B_card force-link-focus-2" }, h(Sheet, { rows: SAMPLE, size: "sm", keyPrefix: "land3", linked: true }))),
    ),

    h(
      Section,
      { title: "Beside the buttons", note: "Seen, not argued: a row of the sheet next to a secondary and a primary Button, then the same with today's chip." },
      h(
        State,
        { name: "after · extension 05", wide: true },
        h("div", { className: "B_compare" }, h(Column, null, h(Sheet, { rows: [SAMPLE[0], SAMPLE[2]], keyPrefix: "cmp" })), h("div", { className: "B_buttons" }, btn("secondary", T.share), btn("primary", T.primaryResult))),
      ),
      h(
        State,
        { name: "before · PillarChip in production", wide: true },
        h(
          "div",
          { className: "B_compare" },
          h("div", { className: "B_oldStack" }, h(OldChip, { stage: "Acquisition", score: 18 }), h(OldChip, { stage: "Retention", score: 8, weak: true })),
          h("div", { className: "B_buttons" }, btn("secondary", T.share), btn("primary", T.primaryResult)),
        ),
      ),
      h(
        State,
        { name: "the landing's line · the hero's secondary button and the preview", wide: true },
        h("div", { className: "B_compare" }, h("div", { className: "B_buttons" }, btn("primary", T.primaryLanding), btn("secondary", T.sample)), h("div", { className: "Card_card Card_paper Card_flat B_card" }, h(Sheet, { rows: SAMPLE.slice(0, 2), size: "sm", keyPrefix: "line", linked: true }))),
      ),
    ),
  );

const root = document.getElementById("root");
document.body.setAttribute("data-world", world);
document.body.style.setProperty("--board-width", `${width}px`);
document.body.classList.add(phone ? "B_phone" : "B_desk");
const draw = () => render(h(Board), root);
draw();
