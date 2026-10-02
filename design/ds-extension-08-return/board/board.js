// Extension 08 — the scrolling board. Hand-written source, no build step:
// board.html?page=<page>&lang=en|fr&w=<width>&h=<height>[&at=scrolled]
//   [&focus=1][&hover=pill|primary][&motion=reduce][&slow=10][&play=1]
//   [&enhance=off]
// It renders the return's own SiteHeader (components/brand/) over a stand-in
// page that really scrolls, and attaches the compact behaviour exactly as the
// app's client piece does.
import React, { render } from "./react-lite.js";
import { SiteHeader } from "../components/brand/SiteHeader/SiteHeader.js";
import { attachCompactHeader } from "../components/brand/SiteHeader/compactHeader.js";
import { WordmarkLink, Wordmark, LocaleSwitcher, Button, ModeTag, Tag, MetaLabel } from "tour-de-growth";
import { PAGES, WINDOWS } from "./pages.js";

const h = React.createElement;

// ── URL ────────────────────────────────────────────────────────────────────
const q = new URLSearchParams(location.search);
const pageId = PAGES.some((p) => p.id === q.get("page")) ? q.get("page") : "landing";
const lang = q.get("lang") === "en" ? "en" : "fr";
const width = Number(q.get("w")) || 1280;
const height = Number(q.get("h")) || 720;
const at = q.get("at") ?? "top";
const play = q.has("play");
const slow = Number(q.get("slow")) || 1;
document.documentElement.lang = lang;

// The header's media query reads the window. When this window is not the
// asked size, the board draws the page in a frame of exactly that size —
// the frame scrolls on its own — and keeps a small control bar outside it.
const framing = !q.has("framed") && (Math.abs(window.innerWidth - width) > 2 || Math.abs(window.innerHeight - height) > 2);

const T = (en, fr) => (lang === "fr" ? fr : en);

// ── The page's own right-hand side, as each page puts it today ────────────
function rightSide() {
  const lang_ = h(LocaleSwitcher, { locale: lang, path: PAGES.find((p) => p.id === pageId).path, key: "lang" });
  switch (pageId) {
    case "landing":
      // Today's order. The two quiet links leave the compact line; the switch
      // closes up on the primary (SiteHeader.prompt.md, "What leaves").
      return [
        lang_,
        h("a", { key: "g", href: "#", className: "Board_quietLink hit_strip Board_wideOnly", "data-header-compact": "leave" }, T("Glossary", "Glossaire")),
        h("a", { key: "c", href: "#", className: "Board_quietLink hit_strip Board_wideOnly", "data-header-compact": "leave" }, T("How it works", "Comment ça marche")),
        h(Button, { key: "p", variant: "primary", size: "sm", href: "#", className: "Board_wideOnly Board_primary" }, T("Start your Tour →", "Démarre ton Tour →")),
      ];
    case "result":
      return [
        lang_,
        h(ModeTag, { key: "d", mode: "deep", className: "Board_wideOnly" }, "Deep dive"),
        h(Tag, { key: "r", tone: "alert", className: "Board_wideOnly" }, "🔥 Roast Mode"),
      ];
    case "quiz":
      return [h(MetaLabel, { key: "q", size: "sm", tone: "muted", className: "Board_progress" }, T("Q 1 / 15 — 3 min left", "Q 1 / 15 — 3 min restantes"))];
    case "deepdive":
      return [h(ModeTag, { key: "d", mode: "deep" }, "Deep dive")];
    default:
      return [lang_];
  }
}

// ── Stand-in pages: enough to scroll, and the grounds the glass must hold
// over (paper, a card's hard shadow, solid ink). Board only. ──────────────
const para = (n = 3) =>
  Array.from({ length: n }, (_, i) =>
    h("p", { key: i, className: "Page_p" },
      T(
        "Stand-in text for the page under the header: the board only needs it to scroll, and to show what runs under the glass — paper, a card, its hard shadow, a block of solid ink.",
        "Texte de remplissage sous l'en-tête : le tableau n'en a besoin que pour défiler, et pour montrer ce qui passe sous le verre — le papier, une carte, son ombre dure, un aplat d'encre.",
      )));

const card = (title, body, key) =>
  h("section", { key, className: "Card_card Card_raised Card_paper Card_padDefault Page_card" },
    h("h2", { className: "Page_h2" }, title), body,
    // A link in the page, so Tab can leave the header and come back to it.
    h("a", { href: "#", className: "Page_link" }, T("A link in the page →", "Un lien dans la page →")));

const inkBlock = (key) =>
  h("section", { key, className: "Page_ink" },
    h("p", { className: "Page_inkText" }, T("A block of solid ink: the glass's worst ground.", "Un aplat d'encre : le pire fond pour le verre.")));

const content = () => {
  const common = [para(2), card(T("A card", "Une carte"), para(2), "c1"), inkBlock("ink"), para(3), card(T("Another card", "Une autre carte"), para(3), "c2"), para(4)];
  switch (pageId) {
    case "landing":
      return [
        h("p", { key: "e", className: "Page_eyebrow" }, T("The growth check-up", "Le diagnostic de growth")),
        h("h1", { key: "h", className: "Page_h1" }, T("Where does your funnel lose people?", "Où ton funnel perd-il du monde ?")),
        ...common,
      ];
    case "result":
      return [
        h("h1", { key: "h", className: "Page_h1" }, "74 / 100"),
        card(T("Retention holds you back", "La rétention freine"), para(1), "s"),
        ...common,
      ];
    case "quiz":
    case "deepdive":
      return [
        card(T("Question 1 · Acquisition", "Question 1 · Acquisition"), para(2), "q"),
        ...common,
      ];
    case "engine":
      return [
        h("h1", { key: "h", className: "Page_h1" }, T("Your growth engine", "Ton moteur de growth")),
        para(2),
        h("h2", { key: "w", className: "Page_h2 Page_whatifTitle" }, T("What if?", "Et si ?")),
        // The engine's « Et si » figures: sticky under the header, at
        // --sticky-offset + 16px, gliding when the offset changes.
        h("div", { key: "f", className: "Page_figures", "data-testid": "whatif-figures" },
          h("span", { className: "Page_figure" }, h("small", null, T("today", "aujourd'hui")), " 6–9 %"),
          h("span", { className: "Page_figureTitle" }, T("Your growth figures", "Tes chiffres de croissance")),
          h("span", { className: "Page_figure" }, h("small", null, T("MRR in 12 months", "MRR dans 12 mois")), " 61 400 €")),
        ...common,
        ...common.slice(0, 3),
      ];
    default:
      return [h("h1", { key: "h", className: "Page_h1" }, T("CAC", "CAC")), ...common];
  }
};

function draw() {
  const page = PAGES.find((p) => p.id === pageId);
  const root = document.getElementById("root");
  root.className = `Page Page_${pageId}`;
  if (q.get("motion") === "reduce") document.documentElement.classList.add("Board_reduce");
  if (slow !== 1) document.documentElement.style.setProperty("--board-slow", String(slow));
  if (slow !== 1) document.documentElement.classList.add("Board_slow");

  const brand = page.linkedBrand === false ? h(Wordmark, { key: "w" }) : h(WordmarkLink, { key: "w", locale: lang });
  render(
    [
      h("a", { key: "skip", href: "#main", className: "tdg-skip" }, T("Skip to content", "Aller au contenu")),
      h(SiteHeader, { key: "header", locale: lang, width: page.width, space: page.space, bandLinked: page.bandLinked },
        brand, ...rightSide()),
      h("main", { key: "main", id: "main", className: `Page_main Page_${page.width}` }, content()),
      h("footer", { key: "f", className: "Page_footer" }, T("Footer — Glossary · How it works · About", "Pied de page — Glossaire · Comment ça marche · À propos")),
    ],
    root,
  );

  const header = root.querySelector(".SiteHeader_header");
  // ?enhance=off: the header as a page gets it with no script, or before the
  // script runs (mechanic 2) — today's header, whatever the scroll.
  if (q.get("enhance") !== "off") attachCompactHeader(header);
  document.body.dataset.page = pageId;

  if (at === "scrolled") window.scrollTo({ top: Number(q.get("y")) || 640, behavior: "instant" });

  const hover = q.get("hover");
  if (hover === "pill") header.querySelector(".SpaceBand_raceCompact a.SpaceBand_pill")?.classList.add("Board_forceHover");
  if (hover === "primary") header.querySelector(".Board_primary")?.classList.add("Board_forceHover");
  if (q.has("focus")) {
    const target = header.querySelector(".WordmarkLink_link") ?? header.querySelector("a, button");
    target?.focus({ focusVisible: true });
  }
}

// ── Start (at the end, once everything above is defined) ────────────────
if (framing) {
  const url = new URL(location.href);
  url.searchParams.set("framed", "1");
  url.searchParams.delete("play");
  const shell = document.getElementById("root");
  shell.className = "Board_shell";
  const bar = document.createElement("div");
  bar.className = "Board_bar";
  const frame = document.createElement("iframe");
  frame.className = "Board_frame";
  frame.src = url.toString();
  frame.width = String(width);
  frame.height = String(height);
  frame.title = `${pageId} · ${lang} · ${width} × ${height}`;
  const scrollFrame = (top) => frame.contentWindow?.scrollTo({ top, behavior: "instant" });
  const button = (label, onClick) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "Board_button";
    b.textContent = label;
    b.addEventListener("click", onClick);
    return b;
  };
  const title = document.createElement("p");
  title.className = "Board_title";
  title.textContent = `${PAGES.find((p) => p.id === pageId).title} · ${lang.toUpperCase()} · ${width} × ${height}`;
  let timer = 0;
  const playLoop = () => {
    clearInterval(timer);
    let down = true;
    scrollFrame(0);
    timer = setInterval(() => { scrollFrame(down ? 640 : 0); down = !down; }, 1600 * slow);
  };
  bar.append(
    title,
    button("Scroll down 640px", () => scrollFrame(640)),
    button("Back to the top", () => scrollFrame(0)),
    button("Play: down, up, down…", playLoop),
    button("Stop", () => clearInterval(timer)),
  );
  shell.append(bar, frame);
  if (play) frame.addEventListener("load", playLoop, { once: true });
} else {
  draw();
  // ?play without a frame (the window is already the asked size): the page
  // scrolls itself, down and up, so the motion can be watched both ways.
  if (play) {
    let down = true;
    setInterval(() => { window.scrollTo({ top: down ? 640 : 0, behavior: "instant" }); down = !down; }, 1600 * slow);
  }
}
