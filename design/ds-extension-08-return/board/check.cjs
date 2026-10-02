// The board's own check (Playwright): every page × language × window × state,
// then the keyboard, the sticky figures, reduced motion and no script.
//   npm i -D playwright   (or use the repo's)
//   python3 -m http.server 8000      # from the project root
//   BASE=http://localhost:8000/design/ds-extension-08-return/board node design/ds-extension-08-return/board/check.cjs
// CHROMIUM=/path/to/chromium to use a given browser.
const { chromium } = require("playwright");
const base = (process.env.BASE || "http://localhost:8000/design/ds-extension-08-return/board") + "/board.html";
const PAGES = ["landing", "result", "quiz", "deepdive", "engine", "game", "reading"];
const WINDOWS = [[1280, 720], [1366, 768], [1440, 900], [1920, 1080], [1024, 768], [844, 390], [568, 320], [390, 844], [320, 568]];
const LANGS = ["fr", "en"];

const probe = () => {
  const hd = document.querySelector(".SiteHeader_header");
  const land = matchMedia("(orientation: landscape)").matches;
  const vis = (el) => el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
  const controls = [...hd.querySelectorAll("a, button, input")].filter((el) => {
    const r = el.getBoundingClientRect();
    return vis(el) && r.width > 0 && r.bottom > 0 && r.top < innerHeight && getComputedStyle(el).pointerEvents !== "none";
  });
  const own = (x, y) => {
    const e = document.elementFromPoint(x, y);
    return e ? controls.find((c) => c === e || c.contains(e)) : undefined;
  };
  const issues = [];
  const name = (c) => (c.textContent.trim() || c.getAttribute("aria-label") || c.className).slice(0, 24);
  for (const c of controls) {
    const r = c.getBoundingClientRect();
    const cx = Math.round(r.left + r.width / 2), cy = Math.round(r.top + r.height / 2);
    if (own(cx, cy) !== c) { issues.push(`covered: ${name(c)}`); continue; }
    let up = 0, dn = 0, lf = 0, rt = 0;
    while (own(cx, cy - up - 1) === c && up < 60) up++;
    while (own(cx, cy + dn + 1) === c && dn < 60) dn++;
    while (own(cx - lf - 1, cy) === c && lf < 400) lf++;
    while (own(cx + rt + 1, cy) === c && rt < 400) rt++;
    const H = up + dn + 1, W = lf + rt + 1;
    if (H < 44 || W < 44) issues.push(`target ${W}×${H}: ${name(c)}`);
  }
  // drawn overlaps between visible controls / race and the end group
  const boxes = controls.map((c) => [name(c), c.getBoundingClientRect()]);
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const [a, A] = boxes[i], [b, B] = boxes[j];
    if (A.left < B.right - 0.5 && B.left < A.right - 0.5 && A.top < B.bottom - 0.5 && B.top < A.bottom - 0.5 && !boxes[i][1].contains) issues.push(`overlap: ${a} / ${b}`);
  }
  const race = hd.querySelector(".SpaceBand_raceCompact");
  const end = hd.querySelector(".SiteHeader_end");
  if (race && vis(race)) {
    const R = race.getBoundingClientRect();
    for (const k of end.children) {
      if (!vis(k)) continue;
      const K = k.getBoundingClientRect();
      if (K.width && R.right + 16 > K.left && K.right > R.left) issues.push(`race too close to ${(k.textContent || k.className).slice(0, 20)}: ${Math.round(K.left - R.right)}px`);
    }
  }
  // what is painted: the lowest painted point of the header
  const line = hd.querySelector(".SiteHeader_glass").getBoundingClientRect();
  const edge = hd.querySelector(".SiteHeader_edge").getBoundingClientRect();
  const exposedRaces = [...hd.querySelectorAll("nav")].filter((n) => vis(n)).length;
  const was = document.activeElement;
  const focusables = [...hd.querySelectorAll("a[href], button, input")].filter((e) => {
    if (e.tabIndex < 0 || vis(e)) return false;
    e.focus(); const got = document.activeElement === e; e.blur(); return got;
  });
  was?.focus?.();
  return {
    land, compact: hd.dataset.compact, box: Math.round(hd.getBoundingClientRect().height),
    painted: Math.round(Math.max(line.bottom, edge.bottom)), sw: document.documentElement.scrollWidth,
    offset: getComputedStyle(document.documentElement).getPropertyValue("--sticky-offset").trim(),
    navs: exposedRaces, hiddenFocusable: focusables.map(name), issues,
  };
};


// Today's, kept as they are (README, Q8): the band's three number pills under
// a 560px band have overlapping hit strips (32px each), and --sticky-offset
// stays 118/74 below 760px where the header is 114/70.
const TODAY = (issue) => /^target 3\d×4\d: \d/.test(issue);

(async () => {
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const rows = [];
  for (const [w, h] of WINDOWS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const p = await ctx.newPage();
    let errors = [];
    p.on("pageerror", (e) => errors.push(String(e)));
    for (const page of PAGES) for (const lang of LANGS) for (const at of ["top", "scrolled"]) {
      errors = [];
      await p.goto(`${base}?page=${page}&lang=${lang}&w=${w}&h=${h}&at=${at}`);
      await p.waitForTimeout(150);
      rows.push({ w, h, page, lang, at, ...(await p.evaluate(probe)), errors });
    }
    await ctx.close();
  }
  let bad = 0, today = 0;
  for (const r of rows) {
    const exp = [];
    if (r.errors.length) exp.push("errors " + r.errors.join("|"));
    if (r.sw > r.w) exp.push(`horizontal scroll: ${r.sw}px`);
    const compact = r.at === "scrolled" && r.land;
    const off = parseFloat(r.offset);
    const want = compact ? (r.page === "reading" ? 50 : 54) : r.page === "reading" ? 74 : 118;
    if (off !== want) exp.push(`--sticky-offset ${r.offset}, expected ${want}px`);
    if (compact && r.painted !== off) exp.push(`painted ${r.painted}px, offset ${off}px`);
    if (r.navs !== (r.page === "reading" ? 0 : 1)) exp.push(`${r.navs} races exposed`);
    if (r.hiddenFocusable.length) exp.push("focusable but hidden: " + r.hiddenFocusable.join(", "));
    const issues = r.issues.filter((i) => !TODAY(i));
    today += r.issues.length - issues.length;
    exp.push(...issues);
    if (exp.length) { bad++; console.log(`✗ ${r.w}×${r.h} ${r.page} ${r.lang} ${r.at}\n    ` + exp.join("\n    ")); }
  }
  console.log(`${rows.length} states, ${bad} with an issue; ${today} target(s) of today's band under 560px set aside (README, Q8)`);

  // Keyboard: from the compact state, Tab into the header and out again.
  const p = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await p.goto(`${base}?page=landing&lang=fr&w=1280&h=720`);
  await p.waitForTimeout(300);
  await p.mouse.wheel(0, 800); await p.waitForTimeout(500);
  await p.evaluate(() => document.activeElement?.blur());
  const st = () => p.evaluate(() => ({ el: document.activeElement.textContent.trim().slice(0, 24), y: scrollY, compact: document.querySelector(".SiteHeader_header").dataset.compact }));
  const seq = [];
  for (let i = 0; i < 11; i++) { await p.keyboard.press("Tab"); await p.waitForTimeout(350); seq.push(await st()); }
  console.log("Tab from 800px down:");
  for (const s of seq) console.log(`  ${s.compact === "true" ? "compact" : "full   "} y=${s.y}  ${s.el}`);
  // The engine's figures follow the header.
  await p.goto(`${base}?page=engine&lang=fr&w=1280&h=720`);
  await p.waitForTimeout(300);
  await p.mouse.wheel(0, 900); await p.waitForTimeout(600);
  const fig = () => p.evaluate(() => Math.round(document.querySelector(".Page_figures").getBoundingClientRect().top));
  const compactTop = await fig();
  await p.evaluate(() => document.querySelector("header a").focus({ focusVisible: true }));
  await p.waitForTimeout(600);
  console.log(`Engine figures: ${compactTop}px under the compact header, ${await fig()}px under the full one`);
  await p.close();
  // Reduced motion and no script.
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, reducedMotion: "reduce" });
  const r = await ctx.newPage();
  await r.goto(`${base}?page=landing&lang=fr&w=1280&h=720`);
  await r.waitForTimeout(300);
  await r.mouse.wheel(0, 800); await r.waitForTimeout(50);
  console.log("Reduced motion:", JSON.stringify(await r.evaluate(() => ({ compact: document.querySelector(".SiteHeader_header").dataset.compact, glassTransition: getComputedStyle(document.querySelector(".SiteHeader_glass")).transitionDuration }))));
  await r.goto(`${base}?page=landing&lang=fr&w=1280&h=720&at=scrolled&enhance=off`);
  await r.waitForTimeout(300);
  console.log("No script, scrolled:", JSON.stringify(await r.evaluate(() => ({ compact: document.querySelector(".SiteHeader_header").dataset.compact, offset: getComputedStyle(document.documentElement).getPropertyValue("--sticky-offset").trim() }))));
  await browser.close();
})();
