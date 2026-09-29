// Direction E « Le Journal du growth » — decorative DOM only.
// Adds: the folio line and the section strip of the masthead, the « À la une »
// and « Notre conseil » rubrics, the stock-table header and bar values, the
// « Le Feuilleton » flag on the game teaser, a cross-reference chip on the game
// hub, and swaps the share preview for this direction's front page (une).
// It never removes or rewrites the product's copy. Every added string exists
// in both languages; French uses NBSP where typography requires it.
(() => {
  const root = document.documentElement;
  const lang = root.lang === "en" ? "en" : "fr";
  const T = {
    fr: {
      edition: "Édition française",
      motto: "Un Tour, trois étapes",
      sections: ["Le Diagnostic", "Les Chiffres", "Le Feuilleton"],
      une: "À la une",
      conseil: "Notre conseil",
      thead: ["Les cinq étapes", "Note sur 20"],
      index: "Dans ce numéro",
      blurbs: [
        "Quinze questions, trois minutes, l'étape qui te freine.",
        "Dix-sept chiffres et des slides pour ton CODIR.",
        "Cinq étapes, cinq entreprises, un DG qui veut le chiffre.",
      ],
    },
    en: {
      edition: "English edition",
      motto: "One Tour, three stages",
      sections: ["Diagnosis", "The Numbers", "The Serial"],
      une: "Front page",
      conseil: "Our advice",
      thead: ["The five stages", "Score out of 20"],
      index: "In this issue",
      blurbs: [
        "Fifteen questions, three minutes, the stage holding you back.",
        "Seventeen numbers and slides for your leadership meeting.",
        "Five stages, five companies, one CEO who wants the number.",
      ],
    },
  }[lang];
  const KEYS = ["tour", "moteur", "jeu"];
  const path = location.pathname;
  const page = /aarrr-funnel-template/.test(path)
    ? "engine"
    : /\/game/.test(path)
      ? "game"
      : /^\/quiz/.test(path)
        ? "quiz"
        : /^\/r\//.test(path)
          ? "result"
          : "landing";
  root.dataset.ePage = page;
  const current = Math.max(0, KEYS.indexOf(root.dataset.space || "tour"));

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };

  // 1. Masthead: folio line + section strip around the existing nameplate.
  const header = document.querySelector("header");
  const inner = header && header.firstElementChild;
  if (inner && !inner.querySelector(".e-folio")) {
    header.classList.add("e-header");
    inner.classList.add("e-mast");
    const folio = el("div", "e-folio");
    folio.setAttribute("aria-hidden", "true");
    folio.append(el("span", "e-folio__ed", T.edition), el("span", "e-folio__motto", T.motto));
    inner.prepend(folio);

    const strip = el("div", "e-strip");
    strip.setAttribute("aria-hidden", "true");
    T.sections.forEach((name, i) => {
      const s = el("span", i === current ? "e-sec e-sec--on" : "e-sec");
      s.dataset.sec = KEYS[i];
      s.append(el("span", "e-sec__n", String(i + 1)), el("span", "e-sec__name", name));
      strip.append(s);
    });
    const wordmark = inner.querySelector(".WordmarkLink--link");
    if (wordmark) wordmark.after(strip);
    else inner.append(strip);
  }

  // 2. « À la une » on the stalled stage, « Notre conseil » on the action.
  for (const box of document.querySelectorAll(".Bottleneck--wrap")) {
    if (!box.querySelector(".e-une")) box.prepend(el("span", "e-une", T.une));
  }
  for (const box of document.querySelectorAll(".PriorityMove--card")) {
    if (!box.querySelector(".e-conseil")) box.prepend(el("span", "e-conseil", T.conseil));
  }

  // 3. Stock table: header row, and each row's value for its mini-bar.
  for (const chip of document.querySelectorAll(".PillarChip--chip")) {
    const v = parseInt((chip.querySelector(".PillarChip--score") || {}).textContent, 10);
    if (!Number.isNaN(v)) chip.style.setProperty("--e-v", String(Math.max(0, Math.min(20, v))));
  }
  for (const table of document.querySelectorAll(".ResultView--pillarGrid, .page--previewTags")) {
    if (table.querySelector(".e-thead")) continue;
    const head = el("div", "e-thead");
    head.setAttribute("aria-hidden", "true");
    head.append(el("span", null, T.thead[0]), el("span", null, T.thead[1]));
    table.prepend(head);
  }

  // 4. The game's teaser on the result carries the Serial's flag.
  for (const band of document.querySelectorAll(".GameEntry--band")) {
    if (!band.querySelector(".e-bandflag")) {
      const f = el("span", "e-bandflag", T.sections[2]);
      f.setAttribute("aria-hidden", "true");
      band.prepend(f);
    }
  }

  // 5. The game hub's way back to the Tour names the Tour's section.
  const loop = document.querySelector('[data-testid="game-tour-loop"]');
  if (loop && !loop.querySelector(".e-xref")) {
    const x = el("span", "e-xref", T.sections[0]);
    x.dataset.sec = "tour";
    x.setAttribute("aria-hidden", "true");
    loop.prepend(x);
  }

  // 6. The front page's index: the three sections of the same race.
  const main = document.querySelector("main");
  if (page === "landing" && main && !main.querySelector(".e-index")) {
    const box = el("aside", "e-index");
    box.setAttribute("aria-hidden", "true");
    box.append(el("div", "e-index__head", T.index));
    T.sections.forEach((name, i) => {
      const row = el("div", "e-index__row");
      row.dataset.sec = KEYS[i];
      row.append(el("span", "e-index__n", String(i + 1)), el("span", "e-index__name", name), el("span", "e-index__blurb", T.blurbs[i]));
      box.append(row);
    });
    main.append(box);
  }

  // 7. The share preview shows this direction's front page (une).
  const UNE = { fr: "__SHARE_FR__", en: "__SHARE_EN__" };
  const img = document.querySelector(".ShareCard--image");
  if (img && UNE[lang].startsWith("data:")) {
    img.loading = "eager";
    img.src = UNE[lang];
  }
})();
