// Measures the proposal the way brief 09's tables measure today (return
// 07's way: CSS pixels, viewports 1280 × 900 and 390 × 844, a control is
// visible and focusable, not inside a closed <details>), on the board's own
// screens — today's board redrawn ("board-before") against the board with
// the money ("board-loss") — and checks 44px targets, overlaps and
// horizontal scroll at 1280, 390 and 320. Writes board/measures.js.
// Needs Playwright and the project served over http:
//   BOARD=http://localhost:8000/design/ds-extension-09-return/board/board.html node board/measure.cjs
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const BASE = process.env.BOARD ?? "http://localhost:8000/design/ds-extension-09-return/board/board.html";

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
  for (const s of screens) for (const lang of ["en", "fr"]) for (const width of [1280, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: width === 1280 ? 900 : 844 } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => { if (m.type() === "error" && !m.text().includes("404")) errors.push(m.text()); });
    await page.goto(`${BASE}?screen=${s}&lang=${lang}&w=${width === 320 ? 390 : width}&framed=1`);
    await page.waitForTimeout(250);
    const r = await page.evaluate(probe);
    results[`${s}|${lang}|${width}`] = { ...r, errors };
    await page.close();
  }
  await browser.close();
  const g = (k) => results[k];
  const M = {};
  if (!only) {
  for (const lang of ["en", "fr"]) for (const w of [1280, 390]) {
    const k = `${lang}${w}`;
    const before = g(`board-before|${lang}|${w}`);
    const after = g(`board-loss|${lang}|${w}`);
    const pb = g(`board-panel-before|${lang}|${w}`);
    const pa = g(`board-panel|${lang}|${w}`);
    M[k] = {
      before: { toolTop: before.toolTop, firstScreen: before.controlsFirstScreen, board: before.toolHeight, controls: before.controlsInTool, leverTop: before.lever.top, lever: before.lever.height, leverControls: before.lever.controls, panel: pb.panel.height, panelControls: pb.panel.controls, boardPanel: pb.toolHeight, boardPanelControls: pb.controlsInTool },
      after: { toolTop: after.toolTop, firstScreen: after.controlsFirstScreen, board: after.toolHeight, controls: after.controlsInTool, moneyTop: after.money.top, money: after.money.height, moneyControls: after.money.controls, leverTop: after.lever.top, lever: after.lever.height, leverControls: after.lever.controls, panel: pa.panel.height, panelControls: pa.panel.controls, boardPanel: pa.toolHeight, boardPanelControls: pa.controlsInTool },
      healthy: g(`board-healthy|${lang}|${w}`).toolHeight,
      nomargin: g(`board-nomargin|${lang}|${w}`).toolHeight,
      maybe: g(`board-maybe|${lang}|${w}`).toolHeight,
      hybridFirstScreen: g(`hybrid-ss|${lang}|${w}`).controlsFirstScreen,
      hybridFirstScreenBefore: g(`hybrid-before|${lang}|${w}`).controlsFirstScreen,
      hybridBoardBefore: g(`hybrid-before|${lang}|${w}`).toolHeight,
      hybridControlsBefore: g(`hybrid-before|${lang}|${w}`).controlsInTool,
      hybridPrimaryTop: g(`hybrid-ss|${lang}|${w}`).primaryTop,
      hybridPrimaryTopBefore: g(`hybrid-before|${lang}|${w}`).primaryTop,
      primaryTop: after.primaryTop, primaryTopBefore: before.primaryTop,
      hybridBoard: g(`hybrid-ss|${lang}|${w}`).toolHeight,
      hybridControls: g(`hybrid-ss|${lang}|${w}`).controlsInTool,
      raised: after.raised, primaries: after.primaries,
      firstScreenLabels: after.firstScreenLabels,
    };
  }
  fs.writeFileSync(path.join(__dirname, "measures.js"),
`// Generated by the return's measuring script (README, "The density"):
// Playwright on these very screens, CSS pixels, viewports 1280 × 900 and
// 390 × 844. "before" is today's board (A18) redrawn on the film's SaaS
// (screen board-before), "after" the board with the money (board-loss).
// Do not edit by hand.
export const MEASURES = ${JSON.stringify(M, null, 2)};
`);
  console.log(JSON.stringify(M, null, 1));
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
