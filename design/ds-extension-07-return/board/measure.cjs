// Measures the proposal the way brief 07's table measures today, on the
// board's own screens, and checks 44px targets, overlaps and horizontal
// scroll at 1280, 390 and 320. Writes board/measures.js (read by the
// journey screen). Needs Playwright and the project served over http:
//   BOARD=http://localhost:8000/design/ds-extension-07-return/board/board.html node board/measure.cjs
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const BASE = process.env.BOARD ?? "http://localhost:8000/design/ds-extension-07-return/board/board.html";

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
  const checked = document.body.dataset.screen === "compare" ? [] : all.filter((el) => main.contains(el));
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
  const sheet = document.querySelector(".NumberSheet_root");
  return {
    toolTop: tool ? Math.round(tool.getBoundingClientRect().top + scrollY) : null,
    toolHeight: tool ? Math.round(tool.getBoundingClientRect().height) : null,
    controlsInTool: inTool.length,
    controlsFirstScreen: firstScreen.length,
    firstScreenLabels: firstScreen.map((el) => (el.textContent || el.getAttribute("aria-label") || el.tagName).trim().slice(0, 30)),
    sheetHeight: sheet ? Math.round(sheet.getBoundingClientRect().height) : null,
    primaryBottom: (() => { const p = [...document.querySelectorAll(".Button_primary")].filter(visible)[0]; return p ? Math.round(p.getBoundingClientRect().bottom + scrollY) : null; })(),
    primaries: [...document.querySelectorAll(".Button_primary")].filter(visible).map((p) => Math.round(p.getBoundingClientRect().top + scrollY)),
    raised: [...document.querySelectorAll(".Card_raised, .EngineLanding_promise")].filter((e) => getComputedStyle(e).display !== "none").length,
    scrollWidth: document.documentElement.scrollWidth,
    pageHeight: document.documentElement.scrollHeight,
    small, overlaps,
  };
};

(async () => {
  const { SCREENS } = await import(path.join(__dirname, "screens.js"));
  const screens = SCREENS.map((s) => s.id);
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
  const M = {
    firstToolAt1280: g("arrival|en|1280").toolTop, firstToolAt390: g("arrival|en|390").toolTop,
    firstToolAt1280fr: g("arrival|fr|1280").toolTop, firstToolAt390fr: g("arrival|fr|390").toolTop,
    startControls: g("setup|en|1280").controlsInTool, startHeight1280: g("setup|en|1280").toolHeight, startHeight390: g("setup|en|390").toolHeight,
    returnToolAt1280: g("return|en|1280").toolTop, returnToolAt390: g("return|en|390").toolTop,
    returnToolAt1280fr: g("return|fr|1280").toolTop, returnToolAt390fr: g("return|fr|390").toolTop,
    returnFirstControls1280: g("return|en|1280").controlsFirstScreen, returnFirstControls390: g("return|en|390").controlsFirstScreen,
    returnPrimaryBottom1280: g("return|en|1280").primaryBottom, returnPrimaryBottom390: g("return|en|390").primaryBottom,
    returnPrimaryBottom390fr: g("return|fr|390").primaryBottom,
    boardControls: g("return|en|1280").controlsInTool, boardHeight1280: g("return|en|1280").toolHeight, boardHeight390: g("return|en|390").toolHeight,
    sheetUntouched1280: g("number-untouched|en|1280").sheetHeight, sheetUntouched390: g("number-untouched|en|390").sheetHeight,
    sheetHave1280: g("number-have|en|1280").sheetHeight, sheetHave390: g("number-have|en|390").sheetHeight,
    sheetOpen1280: g("number-open|en|1280").sheetHeight, sheetOpen390: g("number-open|en|390").sheetHeight,
    sheetOpen1280fr: g("number-open|fr|1280").sheetHeight, sheetOpen390fr: g("number-open|fr|390").sheetHeight,
    sheetControls: g("number-untouched|en|1280").controlsInTool,
  };
  fs.writeFileSync(path.join(__dirname, "measures.js"),
`// Generated by the return's measuring script (README, "How the measures were
// taken"): Playwright on these very screens, CSS pixels, viewports 1280 × 900
// and 390 × 844, English unless the key ends in "fr". Do not edit by hand.
export const MEASURES = ${JSON.stringify(M, null, 2)};
`);
  console.log(JSON.stringify(M, null, 1));
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
