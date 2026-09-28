// Direction F — « L'arcade du côté obscur ». Decorative DOM only: the world
// badge, the health bar, the XP bars, the boss and quest tags, the world map.
// No product copy is removed or rewritten; every added node is aria-hidden and
// exists in both languages. Built by work-f/build.mjs (the share image is inlined).
(() => {
  const root = document.documentElement;
  const en = (root.lang || "fr").toLowerCase().startsWith("en");
  const space = root.dataset.space || "tour";
  const SHARE = /*SHARE*/{};
  const NB = " ";
  const T = en
    ? { world: "World", names: { 1: "The Tour", 2: "The engine", 3: "The game" }, pv: "HP", quest: "Quest", demo: "Demo", diff: "Difficulty",
        map: "One Tour, three worlds", course: "The course · 5 levels",
        w: [
          ["You are here", "The Tour", "15 questions, 3 minutes. Your score, the stage that stalls, one action."],
          ["Next", "The engine", "Your 17 real numbers, where your funnel leaks, and slides for your leadership meeting."],
          ["Last", "The dark side", "Five levels, five companies, one CEO who wants the number. Learn to spot the tricks."],
        ] }
    : { world: "Monde", names: { 1: "Le Tour", 2: "Le moteur", 3: "Le jeu" }, pv: "PV", quest: "Quête", demo: "Démo", diff: "Difficulté",
        map: "Un Tour, trois mondes", course: "Le parcours · 5" + NB + "niveaux",
        w: [
          ["Tu es ici", "Le Tour", "15 questions, 3" + NB + "minutes. Ton score, l'étape qui freine, une action."],
          ["Ensuite", "Le moteur", "Tes 17 vrais chiffres, là où ton funnel perd du monde, et des slides pour ton CODIR."],
          ["Pour finir", "Le côté obscur", "Cinq niveaux, cinq entreprises, un DG qui veut le chiffre. Apprends à reconnaître les astuces."],
        ] };
  const WORLD = { tour: 1, moteur: 2, jeu: 3 };
  const ICON_OF = { 1: "flag", 2: "bars", 3: "moon" };
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const icon = (name) => { const i = el("i", "f-ic"); i.dataset.ic = name; return i; };
  const hide = (n) => { n.setAttribute("aria-hidden", "true"); return n; };
  const badge = (w, cls = "f-world") => {
    const b = hide(el("span", cls));
    b.dataset.w = String(w);
    const ic = el("span", "f-world-ic"); ic.append(icon(ICON_OF[w]));
    const t = el("span", "f-world-t");
    t.append(el("span", "f-world-n", `${T.world} ${w}`), el("span", "f-world-sep"), el("span", "f-world-l", T.names[w]));
    b.append(ic, t);
    return b;
  };

  // 1. The world badge, next to the wordmark in every header.
  for (const link of document.querySelectorAll("header .WordmarkLink--link")) {
    if (link.parentElement.classList.contains("f-markrow")) continue;
    const row = el("span", "f-markrow");
    link.parentElement.insertBefore(row, link);
    row.append(link, badge(WORLD[space] ?? 1));
  }

  // 2. Levels: each pillar chip gets its XP bar (ten cells, two points each).
  const cells = (v, max, n, cls) => {
    const wrap = hide(el("span", cls));
    const per = max / n;
    for (let k = 0; k < n; k++) {
      const i = el("i");
      const lit = v - k * per;
      if (lit >= per) i.className = "on"; else if (lit > 0) i.className = "half";
      wrap.append(i);
    }
    return wrap;
  };
  const readChips = (scope) => [...scope.querySelectorAll(".PillarChip--chip")].map((chip) => {
    const m = chip.textContent.match(/(\d+)\s*\/\s*20/);
    return { chip, v: m ? Number(m[1]) : 0, boss: chip.classList.contains("PillarChip--weak") };
  });
  for (const { chip, v } of readChips(document)) {
    if (chip.querySelector(".f-xp")) continue;
    chip.append(cells(v, 20, 10, "f-xp"));
  }

  // 3. The health bar: five groups of ten cells, one per level; their sum is the score.
  for (const row of document.querySelectorAll(".ScoreDisplay--numeralRow")) {
    const host = row.parentElement;
    if (host.classList.contains("f-score")) continue;
    host.classList.add("f-score");
    const pv = hide(el("span", "f-pv"));
    pv.append(icon("heart"), el("span", null, T.pv));
    host.insertBefore(pv, row);
    const scope = row.closest(".page--previewCard, .ResultView--main") || document;
    const chips = readChips(scope);
    if (chips.length !== 5) continue;
    const hp = hide(el("div", "f-hp"));
    const bar = el("div", "f-hp-bar");
    const lv = el("div", "f-hp-lv");
    chips.forEach(({ v, boss }, k) => {
      const g = cells(v, 20, 10, "f-hp-grp" + (boss ? " boss" : ""));
      g.removeAttribute("aria-hidden");
      bar.append(g);
      const s = el("span", boss ? "boss" : null);
      if (boss) s.append(icon("skull"));
      s.append(document.createTextNode(`1-${k + 1}`));
      lv.append(s);
    });
    hp.append(bar, lv);
    host.append(hp);
  }

  // 4. The boss tag on the stage that stalls, with its level number.
  for (const label of document.querySelectorAll(".Bottleneck--label")) {
    if (label.querySelector(".f-boss")) continue;
    const scope = label.closest(".page--previewCard, .ResultView--main") || document;
    const k = readChips(scope).findIndex((c) => c.boss);
    const tag = hide(el("span", "f-boss"));
    tag.append(icon("skull"), document.createTextNode(k >= 0 ? `Boss 1-${k + 1}` : "Boss"));
    label.prepend(tag);
  }

  // 5. The quest tag on the next move.
  for (const eb of document.querySelectorAll(".PriorityMove--eyebrow > span:first-child")) {
    if (eb.querySelector(".f-quest")) continue;
    const tag = hide(el("span", "f-quest"));
    tag.append(icon("quest"), document.createTextNode(T.quest));
    eb.prepend(tag);
  }

  // 6. The sample result is the machine's demo loop.
  const sample = document.querySelector(".ResultView--sampleBadge");
  if (sample && !sample.querySelector(".f-demo")) sample.prepend(hide(el("span", "f-demo", T.demo)));

  // 7. The Roast is the hard mode: the tone switch reads as a difficulty setting.
  const top = document.querySelector(".page--previewTopRow");
  if (top && !top.querySelector(".f-diff")) {
    const seg = top.querySelector(".Segmented--group");
    if (seg) seg.before(hide(el("span", "f-diff", T.diff)));
  }

  // 8. Warps: a link to another space carries that world's badge.
  const game = document.querySelector(".GameEntry--card");
  if (game && !game.querySelector(".f-warp")) game.prepend(badge(3, "f-warp"));
  const loop = document.querySelector('[data-testid="game-tour-loop"]');
  if (loop && !loop.querySelector(".f-warp")) loop.prepend(badge(1, "f-warp"));

  // 9. The share preview shows the game screen.
  const img = document.querySelector("img.ShareCard--image");
  const src = SHARE[en ? "en" : "fr"];
  if (img && src) { img.removeAttribute("srcset"); img.src = src; }

  // 10. Landing: the course. The five stages are five levels on a stage profile.
  const cta = document.querySelector(".page--heroLeft .page--ctaRow");
  if (space === "tour" && cta && !document.querySelector(".f-course")) {
    // A stage profile with a plateau at each checkpoint, stairs in 8px steps between them: a summit finish at 1-5.
    const W = 480, H = 236, step = 8, names = ["Acquisition", "Activation", "Retention", "Referral", "Revenue"];
    const xs = [48, 144, 240, 336, 432], hs = [48, 80, 120, 104, 160];
    const hAt = (x) => {
      for (let k = 0; k < xs.length; k++) if (Math.abs(x + step / 2 - xs[k]) <= 36) return hs[k];
      const k = xs.findIndex((c) => c > x);
      if (k <= 0) return k === 0 ? hs[0] : hs[hs.length - 1] - 8;
      const a = xs[k - 1] + 36, b = xs[k] - 36, t = Math.min(1, Math.max(0, (x - a) / (b - a)));
      return Math.round((hs[k - 1] + (hs[k] - hs[k - 1]) * t) / 8) * 8;
    };
    let ground = "", edge = "";
    for (let x = 0; x < W; x += step) { const h = hAt(x); ground += `M${x} ${H - h}h${step}V${H}h-${step}z`; edge += `M${x} ${H - h}h${step}v3h-${step}z`; }
    let flags = "";
    names.forEach((n, k) => {
      const x = xs[k], top = H - hs[k];
      flags += `<rect x="${x - 1}" y="${top - 40}" width="3" height="40" fill="#f5f3ee"/>`
        + `<path d="M${x + 2} ${top - 40}h18v3h3v6h-3v3h-18z" fill="#3fd0ff"/>`
        + `<text x="${x}" y="${top - 50}" class="lv" text-anchor="middle">1-${k + 1}</text>`
        + `<text x="${x}" y="${top + 24}" class="nm" text-anchor="middle">${n}</text>`;
    });
    const box = hide(el("div", "f-course"));
    box.append(el("p", "f-kicker", T.course));
    box.insertAdjacentHTML("beforeend", `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" shape-rendering="crispEdges"><path d="${ground}" fill="#241641"/><path d="${edge}" fill="#6b5a9e"/>${flags}</svg>`);
    cta.after(box);
  }

  // 11. Landing: the world map, three worlds of one Tour.
  const hero = document.querySelector(".page--hero");
  if (space === "tour" && hero && !document.querySelector(".f-map")) {
    const sec = hide(el("section", "f-map"));
    sec.append(el("p", "f-kicker", T.map));
    const grid = el("div", "f-map-grid");
    T.w.forEach(([when, name, text], k) => {
      const w = k + 1;
      const card = el("article", "f-w");
      card.dataset.w = String(w);
      const head = el("div", "f-w-head");
      const ic = el("span", "f-w-ic"); ic.append(icon(ICON_OF[w]));
      head.append(ic, el("span", "f-w-n", `${T.world} ${w}`), el("span", "f-w-when", when));
      const lv = el("div", "f-w-lv");
      for (let j = 1; j <= 5; j++) {
        const i = el("i", null, `${w}-${j}`);
        if (w === 3 && j !== 3) i.className = "off";
        lv.append(i);
      }
      card.append(head, el("h3", null, name), el("p", null, text), lv);
      grid.append(card);
    });
    sec.append(grid);
    hero.after(sec);
  }
})();
