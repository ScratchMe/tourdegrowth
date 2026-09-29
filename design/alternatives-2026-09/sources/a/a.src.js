// Direction A — « Jour de course ». Decorative DOM only: the jersey bug in the
// header, the live-standings furniture (rank, dot, bar, gap), the earpiece
// label. No product copy is removed or rewritten; every added node is
// aria-hidden and exists in both languages.
(() => {
  const root = document.documentElement;
  const en = (root.lang || "fr").toLowerCase().startsWith("en");
  const space = root.dataset.space || "tour";
  const NB = " ";
  const T = en
    ? { tour: "The Tour", moteur: "The engine", jeu: "The game", standings: "Stage standings", gap: "Gap", ear: "Earpiece",
        stages: "One Tour, three stages", points: "17 numbers", perStage: "per stage", tourDesc: "The check-up · 3 min", moteurDesc: "Your seventeen numbers", jeuDesc: "The dark side" }
    : { tour: "Le Tour", moteur: "Le moteur", jeu: "Le jeu", standings: "Classement des étapes", gap: "Écart", ear: "Oreillette",
        stages: "Un Tour, trois étapes", points: "17 chiffres", perStage: "par étape", tourDesc: "Le diagnostic · 3" + NB + "min", moteurDesc: "Tes dix-sept chiffres", jeuDesc: "Le côté obscur" };
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  // 1. The jersey bug: three classification jerseys, the current space lit.
  for (const link of document.querySelectorAll("header .WordmarkLink--link")) {
    if (link.nextElementSibling?.classList.contains("a-space")) continue;
    const bug = el("span", "a-space");
    bug.setAttribute("aria-hidden", "true");
    const jerseys = el("span", "a-jerseys");
    for (const j of ["tour", "moteur", "jeu"]) {
      const i = el("i");
      i.dataset.j = j;
      if (j === space) i.className = "on";
      jerseys.append(i);
    }
    bug.append(jerseys, el("span", "a-space-name", T[space]));
    link.after(bug);
  }

  // 2. Live standings: rank by score, gap to the leader, a bar on a rail.
  for (const box of document.querySelectorAll(".ResultView--pillarGrid, .page--previewTags")) {
    if (box.querySelector(".a-standings-head")) continue;
    const chips = [...box.querySelectorAll(".PillarChip--chip")];
    const scores = chips.map((c) => parseInt(c.querySelector(".PillarChip--score")?.textContent ?? "0", 10));
    const max = Math.max(...scores);
    const order = chips.map((_, i) => i).sort((a, b) => scores[b] - scores[a] || a - b);
    chips.forEach((chip, i) => {
      const s = scores[i];
      const rank = 1 + scores.filter((x) => x > s).length;
      const wrap = chip.parentElement;
      wrap.style.setProperty("--a-rank", String(order.indexOf(i) + 1));
      const r = el("span", "a-rank", String(rank));
      const d = el("span", "a-dot");
      const bar = el("span", "a-bar");
      const fill = el("i");
      bar.style.setProperty("--a-pct", String((s / 20) * 100));
      bar.append(fill);
      const g = el("span", "a-gap", s === max ? "—" : "−" + (max - s));
      for (const n of [r, d, bar, g]) n.setAttribute("aria-hidden", "true");
      chip.append(r, d, bar, g);
    });
    const head = el("div", "a-standings-head");
    head.setAttribute("aria-hidden", "true");
    head.append(el("span", null, T.standings), el("span", null, T.gap));
    box.prepend(head);
  }

  // 3. The earpiece: the next move is the call from the team car.
  for (const eyebrow of document.querySelectorAll(".PriorityMove--eyebrow")) {
    if (eyebrow.querySelector(".a-ear")) continue;
    const ear = el("span", "a-ear");
    ear.setAttribute("aria-hidden", "true");
    ear.append(el("span", "a-ear-text", T.ear));
    eyebrow.append(ear);
  }

  // 4. A jersey chip on the links that lead to another space.
  const chip = (j) => {
    const c = el("span", "a-jersey-chip");
    c.dataset.j = j;
    c.setAttribute("aria-hidden", "true");
    c.append(el("i"));
    return c;
  };
  const loop = document.querySelector('[data-testid="game-tour-loop"] > h2');
  if (loop && !loop.querySelector(".a-jersey-chip")) loop.prepend(chip("tour"));

  // 5. The landing shows the colour code once: one Tour, three stages.
  const ctaRow = document.querySelector(".page--ctaRow");
  if (ctaRow && !document.querySelector(".a-stages")) {
    const box = el("div", "a-stages");
    box.setAttribute("aria-hidden", "true");
    box.append(el("div", "a-stages-head", T.stages));
    const rows = [["tour", T.tour, T.tourDesc], ["moteur", T.moteur, T.moteurDesc], ["jeu", T.jeu, T.jeuDesc]];
    rows.forEach(([j, name, desc], i) => {
      const row = el("div", "a-stage" + (j === space ? " on" : ""));
      row.append(el("span", "a-stage-n", String(i + 1)), chip(j), el("span", "a-stage-name", name), el("span", "a-stage-desc", desc));
      box.append(row);
    });
    ctaRow.after(box);
  }

  // 6. The moteur's points board: the copy's own count, per stage (3 × 4 + 5).
  const intro = space === "moteur" && document.querySelector(".page--intro");
  if (intro && !document.querySelector(".a-points")) {
    const board = el("div", "a-points");
    board.setAttribute("aria-hidden", "true");
    const head = el("div", "a-points-head");
    head.append(el("span", null, T.points), el("span", null, T.perStage));
    board.append(head);
    for (const [name, n] of [["Acquisition", 3], ["Activation", 3], ["Retention", 3], ["Referral", 3], ["Revenue", 5]]) {
      const row = el("div", "a-points-row");
      const pips = el("span", "a-pips");
      for (let k = 0; k < n; k++) pips.append(el("i"));
      row.append(el("span", "a-points-name", name), pips, el("span", "a-points-n", String(n)));
      board.append(row);
    }
    intro.parentElement.style.position = "relative";
    intro.after(board);
  }

  // 7. The share frame shows this direction's lower third.
  const SHARE = { fr: "__SHARE_FR__", en: "__SHARE_EN__" };
  const img = document.querySelector(".ShareCard--image");
  const src = SHARE[en ? "en" : "fr"];
  if (img && src.startsWith("data:")) {
    img.removeAttribute("srcset");
    img.src = src;
  }
  void NB;
})();
