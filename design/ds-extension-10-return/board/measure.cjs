// Measures the proposal the way returns 07 and 09 measured (CSS pixels,
// viewports 1280 × 900 and 390 × 844; a control is visible and focusable,
// not inside a closed <details>; a block is a direct child of the tool), on
// the board's own screens — the marketplace (demand shown, supply shown,
// without the subscriptions) and the counterfactual it avoids, both sides
// stacked ("measure-stacked") — and checks 44px targets, overlaps and
// horizontal scroll at 1280, 390 and 320, in both vocabularies. Writes
// board/measures.js. Needs Playwright and the project served over http:
//   BOARD=http://localhost:8000/design/ds-extension-10-return/board/board.html node board/measure.cjs
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const BASE = process.env.BOARD ?? "http://localhost:8000/design/ds-extension-10-return/board/board.html";

const CONTROL = "button, a[href], input:not([type=hidden]), select, textarea, summary";

const probe = () => {
  const CONTROL = "button, a[href], input:not([type=hidden]), select, textarea, summary";
  const visible = (el) => {
    if (el.closest("details:not([open])") && el.tagName !== "SUMMARY") return false;
    if (el.closest("details:not([open]) details")) return false;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") return false;
    // a visually hidden native radio/checkbox counts through its label
    return r.width > 0 && r.height > 0 || el.matches("input[type=radio], input[type=checkbox]");
  };
  const target = (el) => {
    let t = el;
    if (el.matches("input[type=radio], input[type=checkbox]")) t = el.closest("label") ?? el;
    else if (el.closest(".Field_box")) t = el.closest(".Field_box");
    const r = t.getBoundingClientRect();
    let { left, top, width, height } = r;
    // the system's quiet/small buttons and the "?" extend their hit area to 44px with ::before
    const extended = t.matches(".Button_quiet, .Button_sm, .DefinitionTrigger_trigger, .Segmented_sm .Segmented_option");
    if (extended) {
      if (height < 44) { top -= (44 - height) / 2; height = 44; }
      if (width < 44) { left -= (44 - width) / 2; width = 44; }
    }
    return { el: t, left, top: top + scrollY, width, height, label: (t.getAttribute("aria-label") || t.textContent || t.tagName).trim().slice(0, 40) };
  };
  const tool = document.querySelector("[data-measure=tool]");
  const all = [...document.querySelectorAll(CONTROL)].filter(visible);
  const inTool = tool ? all.filter((el) => tool.contains(el)) : all;
  // Targets are checked inside the page's main area: the site header and its
  // language switch are the app's, unchanged, and drawn here as stand-ins.
  const main = document.querySelector(".App_main") ?? document.body;
  const checked = all.filter((el) => main.contains(el));
  const targets = [...new Map(checked.map((el) => { const t = target(el); return [t.el, t]; })).values()];
  const small = targets.filter((t) => t.height < 43.5 || t.width < 24).map((t) => `${t.label} ${Math.round(t.width)}×${Math.round(t.height)}`);
  const overlaps = [];
  for (let i = 0; i < targets.length; i++) for (let j = i + 1; j < targets.length; j++) {
    const a = targets[i], b = targets[j];
    if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
    // An open definition covers what is under it, by design (the "?" open).
    if (a.el.closest("[role=dialog]") || b.el.closest("[role=dialog]")) continue;
    const ox = Math.min(a.left + a.width, b.left + b.width) - Math.max(a.left, b.left);
    const oy = Math.min(a.top + a.height, b.top + b.height) - Math.max(a.top, b.top);
    if (ox > 1 && oy > 1) overlaps.push(`${a.label} ⟷ ${b.label}`);
  }
  const vh = innerHeight;
  const firstScreen = inTool.filter((el) => { const r = el.getBoundingClientRect(); return r.top < vh && r.bottom > 0; });
  const box = (sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), height: Math.round(r.height), controls: all.filter((c) => e.contains(c)).length }; };
  return {
    toolTop: tool ? Math.round(tool.getBoundingClientRect().top + scrollY) : null,
    toolHeight: tool ? Math.round(tool.getBoundingClientRect().height) : null,
    controlsInTool: inTool.length,
    controlsFirstScreen: firstScreen.length,
    firstScreenLabels: firstScreen.map((el) => (el.textContent || el.getAttribute("aria-label") || el.tagName).trim().slice(0, 30)),
    money: box("[data-measure=money]"),
    total: box("[data-measure=total]"),
    selector: box("[data-measure=selector]"),
    funnel: box("[data-measure=funnel]"),
    list: box("[data-measure=list]"),
    blocks: tool ? [...tool.children].filter((c) => c.getBoundingClientRect().height > 0).length : null,
    reds: [...document.querySelectorAll(".Tag_alert, .DotGrid_highlighted, .NumberList_holds, .SlideLeak_calc, .App_diagStage")].filter((e) => e.getBoundingClientRect().height > 0).length,
    lever: box("[data-measure=lever]"),
    panel: box("[data-measure=panel]"),
    primaries: [...document.querySelectorAll(".Button_primary")].filter(visible).length,
    primaryTop: (() => { const p = [...document.querySelectorAll(".Button_primary")].filter(visible)[0]; return p ? Math.round(p.getBoundingClientRect().bottom + scrollY) : null; })(),
    raised: [...document.querySelectorAll(".Card_raised, .EngineLanding_promise")].filter((e) => getComputedStyle(e).display !== "none" && e.getBoundingClientRect().height > 0).length,
    scrollWidth: document.documentElement.scrollWidth,
    pageHeight: document.documentElement.scrollHeight,
    small, overlaps,
  };
};

(async () => {
  const { SCREENS } = await import(path.join(__dirname, "screens.js"));
  // ONLY=a,b: re-check those screens (targets, overlaps, scroll) without
  // rewriting measures.js.
  const only = process.env.ONLY ? process.env.ONLY.split(",") : null;
  const screens = SCREENS.map((s) => s.id).filter((id) => !only || only.includes(id));
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const results = {};
  const vocabs = process.env.VOCAB ? process.env.VOCAB.split(",") : ["products", "services"];
  for (const s of screens) for (const vocab of vocabs) for (const lang of ["en", "fr"]) for (const width of [1280, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: width === 1280 ? 900 : 844 } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => { if (m.type() === "error" && !m.text().includes("404")) errors.push(m.text()); });
    await page.goto(`${BASE}?screen=${s}&lang=${lang}&w=${width === 320 ? 390 : width}&framed=1&vocab=${vocab}`);
    await page.waitForTimeout(250);
    const r = await page.evaluate(probe);
    results[`${s}|${lang}|${width}|${vocab}`] = { ...r, errors };
    await page.close();
  }
  await browser.close();
  const g = (k) => results[k];
  const M = {};
  if (!only) {
  for (const lang of ["en", "fr"]) for (const w of [1280, 390]) for (const vocab of vocabs) {
    const k = `${lang}${w}${vocab === "services" ? "-services" : ""}`;
    const pick = (id) => {
      const r = g(`${id}|${lang}|${w}|${vocab}`);
      return { board: r.toolHeight, blocks: r.blocks, controls: r.controlsInTool, firstScreen: r.controlsFirstScreen, firstScreenLabels: r.firstScreenLabels, primaryTop: r.primaryTop, selectorTop: r.selector ? r.selector.top : null, total: r.total ? r.total.height : null, money: r.money ? r.money.height : null, funnel: r.funnel ? r.funnel.height : null, raised: r.raised, primaries: r.primaries, reds: r.reds };
    };
    M[k] = {
      demand: pick("board-demand"),
      supply: pick("board-supply"),
      supplyNoSubs: pick("board-supply-nosubs"),
      demandNoSubs: pick("board-demand-nosubs"),
      stacked: pick("measure-stacked"),
    };
  }
  fs.writeFileSync(path.join(__dirname, "measures.js"),
`// Generated by the return's measuring script (README, "The density"):
// Playwright on these very screens, CSS pixels, viewports 1280 × 900 and
// 390 × 844. "stacked" is the counterfactual the side selector avoids:
// both sides on one board. Do not edit by hand.
export const MEASURES = ${JSON.stringify(M, null, 2)};
`);
  console.log(JSON.stringify(Object.fromEntries(Object.entries(M).map(([k, v]) => [k, Object.fromEntries(Object.entries(v).map(([a, b]) => [a, { board: b.board, blocks: b.blocks, controls: b.controls, firstScreen: b.firstScreen, primaryTop: b.primaryTop, selectorTop: b.selectorTop, raised: b.raised, primaries: b.primaries }]))])), null, 0));
  }
  let bad = 0;
  for (const [k, r] of Object.entries(results)) {
    const w = Number(k.split("|")[2]);
    const issues = [];
    if (r.errors.length) issues.push("ERR " + r.errors.join(";"));
    if (r.scrollWidth > w) issues.push(`HSCROLL ${r.scrollWidth}`);
    if (r.small.length) issues.push(`SMALL ${r.small.join(", ")}`);
    if (r.overlaps.length) issues.push(`OVERLAP ${r.overlaps.slice(0, 6).join(", ")}`);
    if (issues.length) { bad++; console.log(k, issues.join(" || ").slice(0, 600)); }
  }
  console.log("screens with issues:", bad, "of", Object.keys(results).length);
})();
