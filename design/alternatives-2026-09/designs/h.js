/* Direction H « Heure bleue » — decorative DOM only.
   Adds: the hour-of-day sign in each header, the route drawn from the five
   real stage scores, the kilometre post on the next move, a full-night tag on
   the game entry, and the wordmark across the road in the footer.
   Never removes or rewrites the product's copy; every added string exists in
   FR and EN, and every added node is aria-hidden. */
(() => {
  if (window.__hInit) return;
  window.__hInit = true;
  const root = document.documentElement;
  const fr = (root.lang || "fr").toLowerCase().startsWith("fr");
  const space = root.dataset.space || "tour";
  const NB = " ";
  const T = {
    tour: fr ? ["Crépuscule", "le Tour"] : ["Dusk", "the Tour"],
    moteur: fr ? ["Heure bleue", "le moteur"] : ["Blue hour", "the engine"],
    jeu: fr ? ["Pleine nuit", "le jeu"] : ["Full night", "the game"],
  };
  const CLOCK = { tour: "21:12", moteur: "21:47", jeu: "23:58" };
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    n.setAttribute("aria-hidden", "true");
    return n;
  };

  /* 1. The sign of the space, on the horizon of every header */
  const header = document.querySelector(".page--header, .ResultView--header, .ContentHeader--header");
  if (header && !header.querySelector(".h-space")) {
    const [hour, where] = T[space] || T.tour;
    const sign = el(
      "div",
      "h-space",
      `<span class="h-space__icon"></span><span class="h-space__name">${hour}</span><span class="h-space__where">·${NB}${where}</span><span class="h-space__time">${CLOCK[space] || CLOCK.tour}</span>`,
    );
    header.appendChild(sign);
    const place = () => {
      const mark = header.querySelector(".WordmarkLink--link, .Wordmark--wordmark");
      const left = mark ? mark.getBoundingClientRect().left - header.getBoundingClientRect().left : 24;
      sign.style.left = `${Math.max(16, Math.round(left))}px`;
    };
    place();
    window.addEventListener("resize", place);
  }

  /* 2. The route: five waypoints on one line, drawn from the real scores */
  let uid = 0;
  const monotone = (xs, ys) => {
    const n = xs.length;
    const d = [];
    const m = new Array(n).fill(0);
    for (let i = 0; i < n - 1; i++) d[i] = (ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]);
    m[0] = d[0];
    m[n - 1] = d[n - 2];
    for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    for (let i = 0; i < n - 1; i++) {
      if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
      const a = m[i] / d[i];
      const b = m[i + 1] / d[i];
      const s = a * a + b * b;
      if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
    }
    return (x) => {
      let i = 0;
      while (i < n - 2 && x > xs[i + 1]) i++;
      const h = xs[i + 1] - xs[i];
      const t = Math.min(1, Math.max(0, (x - xs[i]) / h));
      const t2 = t * t;
      const t3 = t2 * t;
      return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1];
    };
  };
  const f1 = (n) => n.toFixed(1);

  const buildRoute = (grid) => {
    const chips = [...grid.querySelectorAll(".PillarChip--chip")];
    if (chips.length !== 5 || grid.querySelector(".h-route")) return;
    const scores = chips.map((c) => parseInt(c.querySelector(".PillarChip--score")?.textContent ?? "0", 10) || 0);
    const stall = chips.findIndex((c) => c.classList.contains("PillarChip--weak"));
    const wrap = el("div", "h-route");
    grid.prepend(wrap);
    const id = `hr${uid++}`;

    const draw = () => {
      const W = Math.round(wrap.clientWidth);
      const H = Math.round(wrap.clientHeight);
      if (!W || !H) return;
      const compact = H < 140;
      const tp = compact ? 28 : 38;
      const bp = compact ? 10 : 14;
      const y = (s) => tp + (1 - s / 20) * (H - tp - bp);
      const wx = scores.map((_, i) => (W * (i + 0.5)) / 5);
      const wy = scores.map(y);
      const xs = [0, ...wx, W];
      const ys = [y(Math.max(0, scores[0] - 6)), ...wy, y(Math.max(0, scores[4] - 4))];
      const f = monotone(xs, ys);
      const pts = [];
      for (let x = 0; x <= W; x += 2) pts.push([x, f(x)]);
      if (pts[pts.length - 1][0] !== W) pts.push([W, f(W)]);
      const poly = (arr, dy = 0) => arr.map(([x, yy], i) => `${i ? "L" : "M"}${f1(x)} ${f1(yy + dy)}`).join("");
      const relief = `${poly(pts)}L${W} ${H}L0 ${H}Z`;

      // far ridges: deterministic, decorative
      const ridge = (base, amp, k1, k2, p) => {
        let d = `M0 ${H}`;
        for (let x = 0; x <= W; x += 6) {
          const yy = base - amp * (0.55 * Math.sin((x / W) * Math.PI * k1 + p) + 0.3 * Math.sin((x / W) * Math.PI * k2 + p * 2.1) + 0.15 * Math.sin((x / W) * Math.PI * 9 + p));
          d += `L${x} ${f1(yy)}`;
        }
        return `${d}L${W} ${H}Z`;
      };

      const bounds = [0, ...wx.slice(0, -1).map((x, i) => (x + wx[i + 1]) / 2), W];
      const seg = (i) => pts.filter(([x]) => x >= bounds[i] - 1 && x <= bounds[i + 1] + 1);

      let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">`;
      s += `<defs>
        <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style="stop-color:rgba(var(--h-line-rgb),.13)"/>
          <stop offset=".45" style="stop-color:rgba(var(--h-line-rgb),.03)"/>
          <stop offset="1" style="stop-color:rgba(0,0,0,0)"/>
        </linearGradient>
        <radialGradient id="${id}o" gradientUnits="userSpaceOnUse" cx="${f1(stall >= 0 ? wx[stall] : 0)}" cy="${f1(stall >= 0 ? wy[stall] : 0)}" r="${f1(W / 6)}" gradientTransform="translate(0 ${f1(stall >= 0 ? wy[stall] : 0)}) scale(1 1.4) translate(0 ${f1(stall >= 0 ? -wy[stall] : 0)})">
          <stop offset="0" style="stop-color:rgba(240,163,58,.26)"/>
          <stop offset=".55" style="stop-color:rgba(240,163,58,.08)"/>
          <stop offset="1" style="stop-color:rgba(240,163,58,0)"/>
        </radialGradient>
        <clipPath id="${id}c"><path d="${relief}"/></clipPath>
      </defs>`;
      s += `<path class="r-far1" d="${ridge(H * 0.5, H * 0.16, 2.2, 5.3, 0.7)}"/>`;
      s += `<path class="r-far2" d="${ridge(H * 0.66, H * 0.12, 3.1, 7.7, 2.1)}"/>`;
      if (!compact) {
        s += `<line class="r-tick" x1="0" x2="${W}" y1="${f1(y(20))}" y2="${f1(y(20))}"/>`;
        s += `<line class="r-tick" x1="0" x2="${W}" y1="${f1(y(10))}" y2="${f1(y(10))}"/>`;
      }
      s += `<path d="${relief}" style="fill:var(--h-page);opacity:.88"/>`;
      s += `<path d="${relief}" fill="url(#${id}g)"/>`;
      s += `<g clip-path="url(#${id}c)">`;
      for (let k = 1; k <= 7; k++) s += `<path class="r-contour" d="${poly(pts, k * (compact ? 11 : 15))}" style="opacity:${f1(1 - k * 0.11)}"/>`;
      if (stall >= 0) s += `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#${id}o)"/>`;
      s += `</g>`;
      s += `<line class="r-base" x1="0" x2="${W}" y1="${H - 0.5}" y2="${H - 0.5}"/>`;
      if (!compact && W >= 500) {
        s += `<text class="r-scale" x="${W}" y="${f1(y(20) - 6)}" text-anchor="end">20</text>`;
        s += `<text class="r-scale" x="${W}" y="${f1(y(10) - 6)}" text-anchor="end">10</text>`;
      }
      // On a narrow route the flag goes under the stalled waypoint, where the relief is empty.
      const below = W < 560;
      const flagY = below ? wy[stall] + (compact ? 25 : 31) : wy[stall] - (compact ? 22 : 30);
      wx.forEach((x, i) => {
        const y1 = i === stall && below ? flagY + 7 : wy[i] + 9;
        if (y1 < H - 2) s += `<line class="r-drop" x1="${f1(x)}" x2="${f1(x)}" y1="${f1(y1)}" y2="${H}"/>`;
      });
      s += `<path class="r-glow" d="${poly(pts)}"/>`;
      for (let i = 0; i < 5; i++) s += `<path class="${i === stall ? "r-stall" : "r-line"}" d="${poly(seg(i))}"/>`;
      wx.forEach((x, i) => {
        if (i === stall) {
          s += `<circle class="r-halo" cx="${f1(x)}" cy="${f1(wy[i])}" r="${compact ? 11 : 14}"/>`;
          s += `<circle class="r-sdot" cx="${f1(x)}" cy="${f1(wy[i])}" r="${compact ? 5 : 6.5}"/>`;
        } else {
          s += `<circle class="r-dot" cx="${f1(x)}" cy="${f1(wy[i])}" r="${compact ? 4.2 : 5.2}"/>`;
          s += `<circle class="r-dotcore" cx="${f1(x)}" cy="${f1(wy[i])}" r="${compact ? 1.6 : 2}"/>`;
        }
      });
      if (stall >= 0) {
        const x = wx[stall];
        const yy = wy[stall];
        const label = fr ? "ça cale ici" : "it stalls here";
        const anchor = x < 70 ? "start" : x > W - 70 ? "end" : "middle";
        if (below) {
          s += `<line class="r-flagline" x1="${f1(x)}" x2="${f1(x)}" y1="${f1(yy + (compact ? 12 : 15))}" y2="${f1(flagY - 10)}"/>`;
        } else {
          s += `<line class="r-flagline" x1="${f1(x)}" x2="${f1(x)}" y1="${f1(flagY + 4)}" y2="${f1(yy - (compact ? 12 : 15))}"/>`;
        }
        s += `<text class="r-flag" x="${f1(x)}" y="${f1(flagY)}" text-anchor="${anchor}">${label}</text>`;
      }
      s += `</svg>`;
      wrap.innerHTML = s;
    };
    draw();
    if ("ResizeObserver" in window) new ResizeObserver(draw).observe(wrap);
  };
  document.querySelectorAll(".ResultView--pillarGrid, .page--previewTags").forEach(buildRoute);

  /* 3. The next move becomes the next kilometre */
  document.querySelectorAll(".PriorityMove--card").forEach((card) => {
    if (card.querySelector(".h-km")) return;
    const post = el(
      "div",
      "h-km",
      `<svg viewBox="0 0 46 64" xmlns="http://www.w3.org/2000/svg"><path class="k-body" d="M4.5 63.5V23a18.5 18.5 0 0 1 37 0v40.5z"/><path class="k-cap" d="M5.1 22.5a17.9 17.9 0 0 1 35.8 0z"/><text class="k-text" x="23" y="44" text-anchor="middle">km</text><path d="M16 52h14" style="stroke:var(--h-line);stroke-width:1.4"/></svg>`,
    );
    const title = el("span", "h-km__title", fr ? "Le prochain kilomètre" : "The next kilometre");
    card.prepend(title);
    card.prepend(post);
  });

  /* 4. The game entry already belongs to the next hour */
  document.querySelectorAll(".GameEntry--body").forEach((body) => {
    if (body.querySelector(".h-mini")) return;
    body.prepend(el("span", "h-mini", `<i></i>${T.jeu[0]}${NB}·${NB}${T.jeu[1]}`));
  });

  /* 5. On the landing: the three hours, one Tour in three stages */
  const heroLeft = document.querySelector(".page--heroLeft");
  if (heroLeft && !heroLeft.querySelector(".h-hours")) {
    const row = (k, cls) => `<li class="${cls}"><b>${CLOCK[k]}</b><span>${T[k][0]}</span><em>${T[k][1]}</em></li>`;
    heroLeft.appendChild(
      el(
        "div",
        "h-hours",
        `<p class="h-hours__title">${fr ? "Un Tour, trois étapes" : "One Tour, three stages"}</p><ol>${row("tour", "is-tour")}${row("moteur", "is-moteur")}${row("jeu", "is-jeu")}</ol>`,
      ),
    );
  }

  /* 6. The wordmark across the road */
  document.querySelectorAll(".SiteFooter--inner").forEach((inner) => {
    if (inner.querySelector(".h-foot")) return;
    inner.appendChild(el("div", "h-foot", `<span>Tour</span><span class="h-foot__road"></span><span>de <em>Growth</em></span>`));
  });
})();
