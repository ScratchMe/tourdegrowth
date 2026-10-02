// The journey, today and proposed, with the number of screens and decisions
// on each path. Today's figures are brief 07's own table (production build,
// 2026-10-02); the proposed ones are measured on this board (measures.js).
import React from "react";
import { MetaLabel } from "tour-de-growth";
import { frTypo } from "./copy.js";

const h = React.createElement;

const COPY = {
  en: {
    title: "The journey",
    today: "Today",
    proposed: "Proposed",
    first: "First visit, self-serve",
    ret: "Return",
    hybrid: "Hybrid (both ways)",
    screens: (n) => `${n} screens`,
    toFirst: "to the first number typed",
    toSlides: "to the slides",
    decisions: (n) => `${n} decisions`,
    controls: (n) => `${n} controls`,
    toolAt: (a, b) => `tool starts ${a}px down (${b}px on a phone)`,
    stepsToday: [
      ["Arrival", "the same page for everyone: intro, promise, “How long it takes”"],
      ["Before you start", "company type, how you sell, 2 windows, month, currency, name, tools, Tour link, way in"],
      ["Your current targets", "6 boxes, before any number"],
      ["Your base", "2 shared counts"],
      ["Number 1 of 17 … 17 of 17", "one screen each, the whole sheet: ~10 blocks"],
      ["What if?", "8 sliders, 7 figures, the funnel"],
      ["The end", "→ Prepare your slides"],
    ],
    stepsProposed: [
      ["Arrival", "intro, promise (raised), call to action; “How long it takes” moves under the tool"],
      ["Before you start", "one question, defaulted: how you sell; the rest said in a sentence"],
      ["5 quick numbers", "5 minutes each; value first, the trap above it; a target on the screens that can name a stage"],
      ["To ask for", "one screen: every request, by role, copied"],
      ["7 numbers of about an hour", "same screen; “← Your numbers” always one tap"],
      ["Your engine", "the board is the progress: verdict, next step → Prepare your slides"],
    ],
    returnToday: [
      ["Arrival", "pixel-identical to a first visit"],
      ["The board", "12 blocks, 75 controls, up to 3 dashed bands before the diagnosis"],
      ["Continue → a number", "the sheet opens in place"],
    ],
    returnProposed: [
      ["Arrival", "known before first paint: H1, the promise in one line, the tool"],
      ["Your engine", "verdict + one next step: the first screen"],
      ["The next step", "the number's own screen, or the slides"],
    ],
  },
  fr: {
    title: "Le parcours",
    today: "Aujourd'hui",
    proposed: "Proposé",
    first: "Première visite, libre-service",
    ret: "Retour",
    hybrid: "Hybride (les deux façons)",
    screens: (n) => `${n} écrans`,
    toFirst: "jusqu'au premier chiffre tapé",
    toSlides: "jusqu'aux slides",
    decisions: (n) => `${n} décisions`,
    controls: (n) => `${n} contrôles`,
    toolAt: (a, b) => `l'outil commence à ${a} px (${b} px sur téléphone)`,
    stepsToday: [
      ["Arrivée", "la même page pour tous : intro, promesse, « Combien de temps ça prend »"],
      ["Avant de commencer", "type d'entreprise, façon de vendre, 2 fenêtres, mois, devise, nom, outils, lien Tour, mode d'entrée"],
      ["Tes cibles actuelles", "6 cases, avant tout chiffre"],
      ["Ta base", "2 nombres partagés"],
      ["Chiffre 1 sur 17 … 17 sur 17", "un écran chacun, toute la fiche : ~10 blocs"],
      ["Et si ?", "8 curseurs, 7 chiffres, le funnel"],
      ["La fin", "→ Préparer tes slides"],
    ],
    stepsProposed: [
      ["Arrivée", "intro, promesse (en relief), appel à l'action ; « Combien de temps ça prend » passe sous l'outil"],
      ["Avant de commencer", "une question, préremplie : comment tu vends ; le reste dit en une phrase"],
      ["5 chiffres rapides", "5 minutes chacun ; la valeur d'abord, le piège au-dessus ; une cible sur les écrans qui peuvent désigner une étape"],
      ["À demander", "un écran : toutes les demandes, par rôle, copiées"],
      ["7 chiffres d'environ une heure", "le même écran ; « ← Tes chiffres » toujours à un geste"],
      ["Ton moteur", "le tableau est la progression : verdict, étape suivante → Préparer tes slides"],
    ],
    returnToday: [
      ["Arrivée", "identique au pixel près à une première visite"],
      ["Le tableau", "12 blocs, 75 contrôles, jusqu'à 3 bandes pointillées avant le diagnostic"],
      ["Reprendre → un chiffre", "la fiche s'ouvre sur place"],
    ],
    returnProposed: [
      ["Arrivée", "connue avant le premier affichage : H1, la promesse en une ligne, l'outil"],
      ["Ton moteur", "verdict + une seule étape suivante : le premier écran"],
      ["L'étape suivante", "l'écran du chiffre, ou les slides"],
    ],
  },
};

const fmt = (n, lang) => (n == null ? "—" : lang === "fr" ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ") : Number(n).toLocaleString("en-US"));

const Path = ({ title, steps, tone, facts }) =>
  h("section", { className: `Journey_path Journey_${tone}` },
    h(MetaLabel, { as: "h3", size: "sm", tone: tone === "proposed" ? "ink" : "muted", wide: true }, title),
    h("ol", { className: "Journey_steps" },
      steps.map(([name, what], i) =>
        h("li", { key: i, className: "Journey_step" },
          h("span", { className: "Journey_num", "aria-hidden": "true" }, i + 1),
          h("span", { className: "Journey_stepText" }, h("strong", null, name), h("span", null, what))))),
    h("ul", { className: "Journey_facts" }, facts.map((f, i) => h("li", { key: i }, f))));

const typo = (v) => (typeof v === "string" ? frTypo(v) : Array.isArray(v) ? v.map(typo) : v);

export const Journey = ({ lang, T, measures }) => {
  const c = lang === "fr" ? Object.fromEntries(Object.entries(COPY.fr).map(([k, v]) => [k, typo(v)])) : COPY.en;
  const m = measures ?? {};
  const d = (k) => fmt(m[k], lang);
  return h("div", { className: "Journey_root" },
    h("h2", { className: "Journey_title" }, c.title),
    h("h3", { className: "Journey_section" }, c.first),
    h("div", { className: "Journey_pair" },
      h(Path, {
        title: c.today, tone: "today", steps: c.stepsToday,
        facts: [
          c.toolAt(fmt(1267, lang), fmt(1849, lang)),
          `${c.screens(4)} ${c.toFirst} · ${c.decisions("~18")} · ${c.controls(44)}`,
          `${c.screens(22)} ${c.toSlides}`,
        ],
      }),
      h(Path, {
        title: c.proposed, tone: "proposed", steps: c.stepsProposed,
        facts: [
          c.toolAt(d("firstToolAt1280"), d("firstToolAt390")),
          `${c.screens(2)} ${c.toFirst} · ${lang === "fr" ? "0 décision obligatoire (1 préremplie)" : "0 required decisions (1 defaulted)"} · ${c.controls(d("startControls"))}`,
          `${c.screens(15)} ${c.toSlides}`,
        ],
      })),
    h("h3", { className: "Journey_section" }, c.ret),
    h("div", { className: "Journey_pair" },
      h(Path, {
        title: c.today, tone: "today", steps: c.returnToday,
        facts: [c.toolAt(fmt(1267, lang), fmt(1849, lang)), c.controls(75), lang === "fr" ? "fiche ouverte : 1 667 px" : "one number open: 1,667px"],
      }),
      h(Path, {
        title: c.proposed, tone: "proposed", steps: c.returnProposed,
        facts: [
          c.toolAt(d("returnToolAt1280"), d("returnToolAt390")),
          lang === "fr" ? `premier écran : ${d("returnFirstControls1280")} contrôles (${d("returnFirstControls390")} sur téléphone)` : `first screen: ${d("returnFirstControls1280")} controls (${d("returnFirstControls390")} on a phone)`,
          lang === "fr" ? `écran d'un chiffre : ${d("sheetUntouched1280")} px (ouvert : ${d("sheetOpen1280")} px)` : `a number's screen: ${d("sheetUntouched1280")}px (open: ${d("sheetOpen1280")}px)`,
        ],
      })),
    h("h3", { className: "Journey_section" }, c.hybrid),
    h("div", { className: "Journey_pair" },
      h(Path, { title: c.today, tone: "today", steps: [], facts: [`${c.screens(39)} ${c.toSlides}`, lang === "fr" ? "deux colonnes face à face sur le tableau" : "two columns face to face on the board"] }),
      h(Path, { title: c.proposed, tone: "proposed", steps: [], facts: [`${c.screens(25)} ${c.toSlides}`, lang === "fr" ? "un moteur à la fois, le total au-dessus" : "one engine at a time, the total above"] })));
};
