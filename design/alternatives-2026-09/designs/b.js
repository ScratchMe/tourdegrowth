/*
 * Direction B « Affiche et carnet de route » — decorative DOM only.
 * Adds: the space band (road-book stage type + poster colour), the stage
 * profile under the five pillars, the road-book margin of the quiz, the
 * landing vignette, the moteur's chronometer, the game hub's mountain profile, and the share poster
 * inside the result's share frame. Never removes or rewrites product copy.
 */
(() => {
  const root = document.documentElement;
  if (root.dataset.bDone) return;
  root.dataset.bDone = "1";
  const fr = (root.lang || "fr").toLowerCase().startsWith("fr");
  const space = root.dataset.space || "tour";
  const NB = " ";

  const T = fr
    ? {
        stage: "Étape",
        types: { tour: "Plaine", moteur: "Contre-la-montre", jeu: "Montagne" },
        names: { tour: "Le diagnostic", moteur: "Le moteur", jeu: "Le côté obscur" },
        race: { tour: "Diagnostic", moteur: "Moteur", jeu: "Côté obscur" },
        profile: "Profil de l'étape",
        profileKey: "hauteur = points manquants sur 20",
        hub: "Profil de la montagne",
        hubKey: "cinq cols, cinq entreprises",
      }
    : {
        stage: "Stage",
        types: { tour: "Flat", moteur: "Time trial", jeu: "Mountain" },
        names: { tour: "The check-up", moteur: "The engine", jeu: "The dark side" },
        race: { tour: "Check-up", moteur: "Engine", jeu: "Dark side" },
        profile: "Stage profile",
        profileKey: "height = points missing out of 20",
        hub: "Mountain profile",
        hubKey: "five climbs, five companies",
      };

  /* ---------- Pictograms: the three stage types of a road book ---------- */
  const PICTO = {
    tour: '<svg viewBox="0 0 34 22" aria-hidden="true"><path d="M1 20.5H33" stroke="currentColor" stroke-width="2.2" fill="none"/><path d="M1 19V15.2C5 14.2 8 15.6 12 14.8S20 13.9 24 14.6 30 14.2 33 14.4V19Z" fill="currentColor"/><path d="M28.6 14V4.2" stroke="currentColor" stroke-width="1.8"/><path d="M28.6 4.4H33V8.6H28.6Z" fill="currentColor"/></svg>',
    moteur: '<svg viewBox="0 0 34 22" aria-hidden="true"><circle cx="17" cy="12.6" r="7.6" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M17 12.6V7.8M14.2 2.2H19.8M17 2.2V5" stroke="currentColor" stroke-width="2.2" fill="none"/><path d="M23.2 6.4L25 4.6" stroke="currentColor" stroke-width="2.2"/><path d="M1 9.5H7M3 13H7.5M1 16.5H7" stroke="currentColor" stroke-width="1.8"/></svg>',
    jeu: '<svg viewBox="0 0 34 22" aria-hidden="true"><path d="M1 20.5H33" stroke="currentColor" stroke-width="2.2" fill="none"/><path d="M1 19.4L10.4 9.2L14 12.6L20.6 3.2L33 19.4Z" fill="currentColor"/></svg>',
  };
  const ORDER = ["tour", "moteur", "jeu"];

  const h = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };

  /* ---------- 1. The space band, under every header ---------- */
  const header = document.querySelector("body > header");
  if (header) {
    const n = ORDER.indexOf(space) + 1;
    const band = h("div", "bAlt-band");
    band.setAttribute("aria-hidden", "true");
    band.dataset.bSpace = space;
    const race = ORDER.map(
      (s, i) =>
        `<li class="bAlt-band__stop${s === space ? " is-on" : ""}"><span class="bAlt-band__mini">${PICTO[s]}</span><span>${i + 1}${NB}·${NB}${T.race[s]}</span></li>`,
    ).join("");
    band.innerHTML =
      `<div class="bAlt-band__in">` +
      `<span class="bAlt-band__picto">${PICTO[space]}</span>` +
      `<span class="bAlt-band__kicker">${T.stage} ${n}/3 · ${T.types[space]}</span>` +
      `<span class="bAlt-band__name">${T.names[space]}</span>` +
      `<ol class="bAlt-band__race">${race}</ol>` +
      `</div>`;
    const inner = header.firstElementChild;
    if (inner) {
      const cs = getComputedStyle(inner);
      band.style.setProperty("--b-band-w", cs.maxWidth === "none" ? "1040px" : cs.maxWidth);
      band.style.setProperty("--b-band-pad", cs.paddingLeft);
    }
    header.after(band);
  }

  /* ---------- 2. The stage profile under the five pillars ---------- */
  const SVGNS = "http://www.w3.org/2000/svg";
  const rnd = (i) => {
    const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  const smooth = (t) => t * t * (3 - 2 * t);

  function drawProfile(cols, W, H, opts = {}) {
    const top = opts.top ?? 30;
    const base = H - (opts.bottom ?? 18);
    const hMax = base - top;
    const cw = W / cols.length;
    const floor = opts.floor ?? 3;
    const peaks = cols.map((c) => floor + (c.missing / 20) * (hMax - floor));
    const valley = (i) => {
      if (i <= 0 || i >= cols.length) return floor;
      return floor + Math.min(peaks[i - 1], peaks[i]) * 0.12;
    };
    const alt = (x) => {
      const i = Math.min(cols.length - 1, Math.floor(x / cw));
      const x0 = i * cw;
      const xp = x0 + cw * (0.5 + (rnd(i + 3) - 0.5) * 0.18);
      const p = peaks[i];
      let a;
      if (x <= xp) a = valley(i) + (p - valley(i)) * smooth((x - x0) / (xp - x0));
      else a = valley(i + 1) + (p - valley(i + 1)) * smooth(1 - (x - xp) / (x0 + cw - xp));
      // road texture: small, deterministic, never above the labelled summit
      const wob = (Math.sin(x * 0.35 + i) + Math.sin(x * 0.11 + i * 2)) * 0.9;
      return Math.max(1.5, Math.min(p, a + (Math.abs(x - xp) > 6 ? wob : 0)));
    };
    const step = 3;
    let top_ = "";
    for (let x = 0; x <= W + 0.01; x += step) top_ += `${x === 0 ? "M" : "L"}${x.toFixed(1)} ${(base - alt(Math.min(x, W - 0.01))).toFixed(1)} `;
    const area = `${top_}L${W} ${base} L0 ${base} Z`;
    const id = "bp" + Math.round(Math.random() * 1e6);
    let s = `<svg xmlns="${SVGNS}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true" class="bAlt-profile__svg">`;
    s += `<defs><clipPath id="${id}c"><path d="${area}"/></clipPath>`;
    s += `<pattern id="${id}h" width="10" height="5" patternUnits="userSpaceOnUse"><path d="M0 0.6H10" stroke="var(--b-contour, #1E1912)" stroke-width="1" opacity="0.55"/></pattern>`;
    s += `<pattern id="${id}d" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1.55" fill="var(--b-hot, #B8321C)"/></pattern></defs>`;
    s += `<path d="${area}" fill="var(--b-profile-fill, #FAF4E4)"/>`;
    s += `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#${id}h)" clip-path="url(#${id}c)"/>`;
    cols.forEach((c, i) => {
      if (c.hot) s += `<rect x="${i * cw}" y="0" width="${cw}" height="${H}" fill="url(#${id}d)" clip-path="url(#${id}c)"/>`;
      if (c.open) s += `<rect x="${i * cw}" y="0" width="${cw}" height="${H}" fill="var(--b-open, #D99A2B)" clip-path="url(#${id}c)"/>`;
    });
    s += `<path d="${top_}" fill="none" stroke="var(--b-ink, #1E1912)" stroke-width="2" stroke-linejoin="round"/>`;
    // hot segment traced in red on top
    cols.forEach((c, i) => {
      if (!c.hot) return;
      let seg = "";
      for (let x = i * cw; x <= (i + 1) * cw + 0.01; x += step) seg += `${seg ? "L" : "M"}${x.toFixed(1)} ${(base - alt(Math.min(x, W - 0.01))).toFixed(1)} `;
      s += `<path d="${seg}" fill="none" stroke="var(--b-hot, #B8321C)" stroke-width="3" stroke-linejoin="round"/>`;
    });
    // base road + km ticks
    s += `<path d="M0 ${base}H${W}" stroke="var(--b-ink, #1E1912)" stroke-width="2.5"/>`;
    for (let i = 0; i <= cols.length; i++) {
      const x = Math.min(W - 1, Math.max(1, i * cw));
      s += `<path d="M${x} ${base}V${base + 5}" stroke="var(--b-ink, #1E1912)" stroke-width="1.5"/>`;
      if (opts.km) {
        const anchor = i === 0 ? "start" : i === cols.length ? "end" : "middle";
        const label = i === cols.length ? `${i * 3}${NB}km` : `${i * 3}`;
        s += `<text x="${x}" y="${base + 15}" text-anchor="${anchor}" class="bAlt-profile__km">${label}</text>`;
      }
    }
    // summit labels: the gradient box of a stage profile
    cols.forEach((c, i) => {
      const xp = i * cw + cw * (0.5 + (rnd(i + 3) - 0.5) * 0.18);
      const y = base - peaks[i];
      if (c.flag) {
        const fw = c.flagW ?? 30;
        s += `<path d="M${xp} ${y - 3}V${y - 17}" stroke="var(--b-hot, #B8321C)" stroke-width="1.5"/>`;
        s += `<rect x="${xp - fw / 2}" y="${y - 32}" width="${fw}" height="16" fill="var(--b-hot, #B8321C)"/>`;
        s += `<text x="${xp}" y="${y - 20.5}" text-anchor="middle" class="bAlt-profile__flag">${c.flag}</text>`;
      } else if (c.tag) {
        s += `<text x="${xp}" y="${y - 7}" text-anchor="middle" class="bAlt-profile__tag">${c.tag}</text>`;
      }
    });
    s += `</svg>`;
    return s;
  }

  function pillarProfile(container, chips, opts) {
    if (!container || chips.length !== 5 || container.querySelector(".bAlt-profile")) return;
    const cols = chips.map((ch) => {
      const score = parseInt(ch.querySelector("b")?.textContent ?? "0", 10);
      const hot = ch.classList.contains("PillarChip--weak");
      const missing = Math.max(0, 20 - score);
      return { missing, hot, flag: hot ? "HC" : null, tag: missing ? `−${missing}` : "0" };
    });
    container.classList.add("bAlt-profiled");
    const wrap = h("div", "bAlt-profile");
    wrap.setAttribute("aria-hidden", "true");
    const cap = h("div", "bAlt-profile__cap", `<span>${T.profile}</span><span>${T.profileKey}</span>`);
    wrap.append(cap);
    container.prepend(wrap);
    const W = Math.round(container.clientWidth - (opts.inset ?? 0));
    wrap.insertAdjacentHTML("beforeend", drawProfile(cols, W, opts.h, { km: true, top: 34 }));
  }

  document.querySelectorAll(".ResultView--pillarGrid").forEach((g) =>
    pillarProfile(g, [...g.querySelectorAll(".PillarChip--chip")], { h: 128, inset: 36 }),
  );
  document.querySelectorAll(".page--previewTags").forEach((g) =>
    pillarProfile(g, [...g.querySelectorAll(".PillarChip--chip")], { h: 116, inset: 0 }),
  );

  /* ---------- 3. The quiz as a road book: « km 3 — Q3 » ---------- */
  const qCard = document.querySelector(".QuestionCard--card");
  if (qCard && !qCard.querySelector(".bAlt-rb")) {
    const counter = document.querySelector(".page--headerRight .MetaLabel--label")?.textContent ?? "";
    const q = parseInt((counter.match(/\d+/) || ["1"])[0], 10);
    const rb = h(
      "div",
      "bAlt-rb",
      `<span class="bAlt-rb__km">km</span><span class="bAlt-rb__n">${q}</span>` +
        `<svg class="bAlt-rb__tulip" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="40" r="4" fill="currentColor"/><path d="M24 36V10" stroke="currentColor" stroke-width="3.5" fill="none"/><path d="M16 17L24 7L32 17" stroke="currentColor" stroke-width="3.5" fill="none" stroke-linejoin="round"/><path d="M24 26L39 21" stroke="currentColor" stroke-width="2" fill="none" opacity=".55"/><path d="M24 30L9 33" stroke="currentColor" stroke-width="2" fill="none" opacity=".55"/></svg>` +
        "",
    );
    rb.setAttribute("aria-hidden", "true");
    qCard.prepend(rb);
    const stageLabel = [...document.querySelectorAll(".page--main > .MetaLabel--label")][0];
    if (stageLabel) stageLabel.dataset.bRb = `km${NB}${q} — Q${q}`;
    document.querySelectorAll(".AnswerOption--option").forEach((o, i) => (o.dataset.bIdx = String.fromCharCode(65 + i)));
    const segs = document.querySelector(".StageProgress--segments");
    if (segs && !document.querySelector(".bAlt-ruler")) {
      const r = h("div", "bAlt-ruler");
      r.setAttribute("aria-hidden", "true");
      let marks = "";
      for (let k = 0; k <= 15; k++) marks += `<i class="bAlt-ruler__t${k % 3 ? "" : " is-major"}" style="left:${(k / 15) * 100}%"></i>`;
      for (let k = 0; k <= 15; k += 3) marks += `<span class="bAlt-ruler__n" style="left:${(k / 15) * 100}%">${k === 15 ? `15${NB}km` : k}</span>`;
      marks += `<b class="bAlt-ruler__here" style="left:${((q - 0.5) / 15) * 100}%"></b>`;
      r.innerHTML = marks;
      segs.after(r);
    }
  }

  /* ---------- 4. Landing: a poster vignette under the call to action ---------- */
  function ridge(pts, W, base, jit) {
    const P = pts.map(([fx, hh]) => [fx * W, base - hh]);
    let d = `M${P[0][0].toFixed(1)} ${P[0][1].toFixed(1)}`;
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
      const steps = 10;
      for (let k = 1; k <= steps; k++) {
        const t = k / steps, t2 = t * t, t3 = t2 * t;
        const x = 0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
        let y = 0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
        if (k < steps) y += Math.sin(x * 0.7 + i) * jit;
        d += ` L${x.toFixed(1)} ${Math.min(base, y).toFixed(1)}`;
      }
    }
    return d;
  }
  const heroLeft = document.querySelector(".page--heroLeft");
  if (heroLeft && !document.querySelector(".bAlt-vista")) {
    const v = h("div", "bAlt-vista");
    v.setAttribute("aria-hidden", "true");
    heroLeft.append(v);
    const W = Math.round(v.clientWidth);
    const room = Math.round(heroLeft.getBoundingClientRect().bottom - (v.previousElementSibling ?? heroLeft).getBoundingClientRect().bottom - parseFloat(getComputedStyle(v).paddingTop));
    const H = room > 190 ? Math.min(room, 330) : 190;
    const base = H - 22;
    const K = Math.min(1.3, H / 200);
    const back = ridge([[0, 34], [0.09, 72], [0.2, 50], [0.33, 116], [0.43, 74], [0.56, 138], [0.67, 90], [0.8, 128], [0.9, 84], [1, 58]].map(([x, y]) => [x, y * K]), W, base, 1.2);
    const front = ridge([[0, 16], [0.12, 40], [0.26, 20], [0.4, 60], [0.52, 28], [0.63, 44], [0.74, 22], [0.87, 50], [1, 18]].map(([x, y]) => [x, y * K]), W, base, 1);
    const sr = 52 * K, sx = W * 0.62, sy = Math.max(sr + 8, base - 115 * K - sr * 0.35);
    const RR = W < 500 ? Math.min(sr * 3.2, sy + 30) : sr * 3.2;
    let rays = "";
    for (let k = 0; k < 24; k++) {
      const a0 = (k / 24) * Math.PI * 2, a1 = a0 + Math.PI / 40, R = RR;
      rays += `M${sx} ${sy}L${(sx + Math.cos(a0) * R).toFixed(1)} ${(sy + Math.sin(a0) * R).toFixed(1)}L${(sx + Math.cos(a1) * R).toFixed(1)} ${(sy + Math.sin(a1) * R).toFixed(1)}Z`;
    }
    const bx = W * 0.14;
    v.innerHTML =
      `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true">` +
      `<defs><pattern id="bvD" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.9" fill="var(--b-red)"/></pattern>` +
      `<pattern id="bvH" width="10" height="5" patternUnits="userSpaceOnUse"><path d="M0 .6H10" stroke="var(--b-ink)" stroke-width="1"/></pattern>` +
      `<radialGradient id="bvG"><stop offset=".55" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>` +
      `<mask id="bvM"><circle cx="${sx}" cy="${sy}" r="${sr * 1.75}" fill="url(#bvG)"/></mask>` +
      `<mask id="bvR"><circle cx="${sx}" cy="${sy}" r="${RR}" fill="url(#bvG)"/></mask>` +
      `<clipPath id="bvC"><rect y="-240" width="${W}" height="${base + 236}"/></clipPath></defs>` +
      `<g clip-path="url(#bvC)"><path d="${rays}" fill="url(#bvD)" mask="url(#bvR)"/>` +
      `<circle cx="${sx}" cy="${sy}" r="${sr * 1.75}" fill="url(#bvD)" mask="url(#bvM)"/></g>` +
      `<circle cx="${sx}" cy="${sy}" r="${sr}" fill="var(--b-red)"/>` +
      `<path d="${back} L${W} ${base} L0 ${base}Z" fill="var(--b-paper)"/>` +
      `<path d="${back} L${W} ${base} L0 ${base}Z" fill="url(#bvH)" opacity=".28"/>` +
      `<path d="${back}" fill="none" stroke="var(--b-sepia)" stroke-width="1.6"/>` +
      `<path d="${front} L${W} ${base} L0 ${base}Z" fill="var(--b-paper)"/>` +
      `<path d="${front} L${W} ${base} L0 ${base}Z" fill="url(#bvH)" opacity=".6"/>` +
      `<path d="${front}" fill="none" stroke="var(--b-ink)" stroke-width="2"/>` +
      `<path d="M0 ${base}H${W}" stroke="var(--b-ink)" stroke-width="3"/>` +
      `<path d="M0 ${base + 9}H${W}" stroke="var(--b-ink)" stroke-width="2" stroke-dasharray="14 10"/>` +
      `<g transform="translate(${bx} ${base})"><path d="M-11 0V-22A11 11 0 0 1 11 -22V0Z" fill="var(--b-stone)" stroke="var(--b-ink)" stroke-width="2"/><path d="M-10 -21A10 10 0 0 1 10 -21Z" fill="var(--b-red)"/><path d="M-10 -21H10" stroke="var(--b-ink)" stroke-width="1.5"/><path d="M-15 0H15" stroke="var(--b-ink)" stroke-width="4"/></g>` +
      `</svg>`;
  }

  /* ---------- 5. Game hub: five climbs, one open ---------- */
  const zones = document.querySelector(".page--zones");
  if (zones && !document.querySelector(".bAlt-mount")) {
    const items = [...zones.querySelectorAll(".page--zone")];
    const mt = h("div", "bAlt-mount");
    mt.setAttribute("aria-hidden", "true");
    mt.innerHTML = `<div class="bAlt-profile__cap"><span>${T.hub}</span><span>${T.hubKey}</span></div>`;
    zones.before(mt);
    const W = Math.round(mt.clientWidth);
    const heights = [9, 12, 17, 11, 14];
    const cols = items.map((z, i) => {
      const open = z.classList.contains("page--zoneOpen");
      return { missing: heights[i] ?? 10, open, tag: String(i + 1), flag: open ? `${i + 1}` : null, flagW: 22 };
    });
    mt.insertAdjacentHTML("beforeend", drawProfile(cols, W, W < 600 ? 112 : 150, { top: 42, bottom: 12, floor: 4 }));
  }

  /* ---------- 5b. Moteur: the time-trial chronometer, a poster illustration ---------- */
  const intro = space === "moteur" && document.querySelector(".page--intro");
  if (intro && !document.querySelector(".bAlt-chrono")) {
    const c = h("div", "bAlt-chrono");
    c.setAttribute("aria-hidden", "true");
    const cx = 150, cy = 172, R = 118;
    let ticks = "";
    for (let k = 0; k < 60; k++) {
      const a = (k / 60) * Math.PI * 2, major = k % 5 === 0;
      const r1 = R - 16, r0 = major ? R - 34 : R - 24;
      ticks += `<path d="M${(cx + Math.sin(a) * r0).toFixed(1)} ${(cy - Math.cos(a) * r0).toFixed(1)}L${(cx + Math.sin(a) * r1).toFixed(1)} ${(cy - Math.cos(a) * r1).toFixed(1)}" stroke="var(--b-ink)" stroke-width="${major ? 4 : 1.6}"/>`;
    }
    const ang = (-0.3) * Math.PI * 2 + Math.PI * 2; // sweep to "48"
    const hx = cx + Math.sin(ang) * (R - 30), hy = cy - Math.cos(ang) * (R - 30);
    const large = ang > Math.PI ? 1 : 0;
    c.innerHTML =
      `<svg viewBox="0 0 300 310" width="300" height="310" aria-hidden="true">` +
      `<defs><pattern id="bcD" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.7" fill="var(--b-blue)"/></pattern></defs>` +
      `<g transform="translate(9 6)" opacity="1">` +
      `<circle cx="${cx}" cy="${cy}" r="${R + 6}" fill="none" stroke="var(--b-ink)" stroke-width="3" stroke-dasharray="3 5" transform="translate(12 8)"/>` +
      `</g>` +
      `<rect x="${cx - 18}" y="14" width="36" height="20" fill="var(--b-blue)" stroke="var(--b-ink)" stroke-width="3"/>` +
      `<rect x="${cx - 7}" y="32" width="14" height="16" fill="var(--b-ink)"/>` +
      `<g transform="rotate(40 ${cx} ${cy})"><rect x="${cx - 9}" y="${cy - R - 22}" width="18" height="16" fill="var(--b-blue)" stroke="var(--b-ink)" stroke-width="3"/></g>` +
      `<circle cx="${cx}" cy="${cy}" r="${R}" fill="var(--b-stone)" stroke="var(--b-ink)" stroke-width="4"/>` +
      `<circle cx="${cx}" cy="${cy}" r="${R - 8}" fill="none" stroke="var(--b-blue)" stroke-width="9"/>` +
      `<path d="M${cx} ${cy}L${cx} ${cy - (R - 30)}A${R - 30} ${R - 30} 0 ${large} 1 ${hx.toFixed(1)} ${hy.toFixed(1)}Z" fill="url(#bcD)"/>` +
      ticks +
      `<path d="M${cx} ${cy}L${hx.toFixed(1)} ${hy.toFixed(1)}" stroke="var(--b-ink)" stroke-width="5" stroke-linecap="round"/>` +
      `<path d="M${cx} ${cy}L${cx} ${cy - (R - 30)}" stroke="var(--b-blue)" stroke-width="3"/>` +
      `<circle cx="${cx}" cy="${cy}" r="9" fill="var(--b-blue)" stroke="var(--b-ink)" stroke-width="3"/>` +
      `</svg>`;
    intro.parentElement.prepend(c);
  }

  /* ---------- 6. Result: the share frame shows this direction's poster ---------- */
  /*POSTER-START*/
  function posterHTML(lang) {
    const F = lang === "fr";
    const N = " ";
    const t = F
      ? {
          tag: "Diagnostic AARRR — 3 min",
          cap: "Score growth global",
          eyebrow: "Prochaine action",
          stage: "Retention · 8/20",
          move: "Prends la cohorte de nouveaux utilisateurs d'un mois et compte combien sont encore actifs trente jours plus tard.",
          line1: "Retention est là où cette croissance cale.",
          line2: `Et la tienne${N}?`,
          stages: ["Acquisition", "Activation", "Retention", "Referral", "Revenue"],
        }
      : {
          tag: "AARRR check-up — 3 min",
          cap: "Overall growth score",
          eyebrow: "Next move",
          stage: "Retention · 8/20",
          move: "Take one month's cohort of new users and count how many are still active thirty days later.",
          line1: "Retention is where this growth stalls.",
          line2: "Where does yours?",
          stages: ["Acquisition", "Activation", "Retention", "Referral", "Revenue"],
        };
    // the sample result: 18 · 12 · 8 · 16 · 20
    const missing = [2, 8, 12, 4, 0];
    const W = 740, H = 210, base = 192, top = 20, cw = W / 5;
    const pk = missing.map((m) => 3 + (m / 20) * (base - top - 3));
    const alt = (x) => {
      const i = Math.min(4, Math.floor(x / cw));
      const x0 = i * cw, xp = x0 + cw / 2;
      const v0 = i === 0 ? 3 : 3 + Math.min(pk[i - 1], pk[i]) * 0.12;
      const v1 = i === 4 ? 3 : 3 + Math.min(pk[i], pk[i + 1]) * 0.12;
      const s = (u) => u * u * (3 - 2 * u);
      const a = x <= xp ? v0 + (pk[i] - v0) * s((x - x0) / (xp - x0)) : v1 + (pk[i] - v1) * s(1 - (x - xp) / (x0 + cw - xp));
      const wob = (Math.sin(x * 0.3 + i) + Math.sin(x * 0.09 + i * 2)) * 1.1;
      return Math.max(2, Math.min(pk[i], a + (Math.abs(x - xp) > 8 ? wob : 0)));
    };
    let line = "";
    for (let x = 0; x <= W; x += 4) line += `${x ? "L" : "M"}${x} ${(base - alt(Math.min(x, W - 0.1))).toFixed(1)} `;
    let hot = "";
    for (let x = 2 * cw; x <= 3 * cw; x += 4) hot += `${hot ? "L" : "M"}${x} ${(base - alt(x)).toFixed(1)} `;
    const area = `${line}L${W} ${base} L0 ${base} Z`;
    const labels = t.stages
      .map((s, i) => `<text x="${i * cw + cw / 2}" y="${base + 16}" text-anchor="middle" class="${i === 2 ? "bP-hot" : ""}">${s.toUpperCase()}</text>`)
      .join("");
    const ticks = [0, 1, 2, 3, 4, 5].map((i) => `<path d="M${Math.min(W - 1.5, Math.max(1.5, i * cw))} ${base}V${base + 6}" stroke="#1E1912" stroke-width="2"/>`).join("");
    const xp = 2 * cw + cw / 2, yp = base - pk[2];
    const profile =
      `<svg class="bP-profile" viewBox="0 0 ${W} ${H + 8}" width="${W}" height="${H + 8}" aria-hidden="true">` +
      `<defs><clipPath id="bPc"><path d="${area}"/></clipPath>` +
      `<pattern id="bPh" width="10" height="6" patternUnits="userSpaceOnUse"><path d="M0 .75H10" stroke="#1E1912" stroke-width="1.5"/></pattern>` +
      `<pattern id="bPd" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="2.3" fill="#B8321C"/></pattern></defs>` +
      `<rect width="${W}" height="${H}" fill="url(#bPh)" clip-path="url(#bPc)" opacity=".7"/>` +
      `<rect x="${2 * cw}" width="${cw}" height="${H}" fill="#F3EAD3" clip-path="url(#bPc)"/>` +
      `<rect x="${2 * cw}" width="${cw}" height="${H}" fill="url(#bPd)" clip-path="url(#bPc)"/>` +
      `<path d="${line}" fill="none" stroke="#1E1912" stroke-width="3" stroke-linejoin="round"/>` +
      `<path d="${hot}" fill="none" stroke="#B8321C" stroke-width="5" stroke-linejoin="round"/>` +
      `<path d="M0 ${base}H${W}" stroke="#1E1912" stroke-width="3.5"/>${ticks}` +
      `<path d="M${xp} ${yp - 4}V${yp - 26}" stroke="#B8321C" stroke-width="2.5"/>` +
      `<rect x="${xp - 26}" y="${yp - 50}" width="52" height="25" fill="#B8321C"/>` +
      `<text x="${xp}" y="${yp - 31.5}" text-anchor="middle" class="bP-flag">HC</text>` +
      `<g class="bP-stages">${labels}</g></svg>`;
    return (
      `<div class="bP" lang="${lang}">` +
      `<div class="bP-rays" aria-hidden="true"></div>` +
      `<header class="bP-head"><div class="bP-mark">TOUR DE <span>GROWTH</span></div><div class="bP-tag">${t.tag}</div></header>` +
      `<div class="bP-borne"><div class="bP-cap">${t.cap}</div><div class="bP-num">74</div><div class="bP-of">/100</div></div>` +
      `<div class="bP-plinth" aria-hidden="true"></div>` +
      `<div class="bP-move"><div class="bP-eyebrow"><span class="bP-eyebrowRed">${t.eyebrow}</span><span>·${N}${t.stage}</span></div><p class="bP-text">${t.move}</p></div>` +
      profile +
      `<footer class="bP-foot"><p class="bP-hook">${t.line1} <em>${t.line2}</em></p><div class="bP-url">tourdegrowth.com</div></footer>` +
      `</div>`
    );
  }
  /*POSTER-END*/

  const frame = document.querySelector(".ShareCard--frame");
  const img = frame?.querySelector(".ShareCard--image");
  if (frame && img && !frame.querySelector(".bAlt-poster")) {
    const holder = h("div", "bAlt-poster");
    holder.setAttribute("aria-hidden", "true");
    holder.innerHTML = `<div class="bAlt-poster__scale">${posterHTML(fr ? "fr" : "en")}</div>`;
    img.after(holder);
    const k = holder.clientWidth / 1200;
    holder.style.setProperty("--k", String(k));
  }
})();
