import { chromium } from "/home/user/tourdegrowth/node_modules/playwright/index.mjs";
import { openContext, show, SCREENS, VIEWPORTS } from "../harness.mjs";
const browser = await chromium.launch();
for (const vp of VIEWPORTS) {
  const context = await openContext(browser, vp);
  const page = await context.newPage();
  for (const screen of SCREENS) {
    await show(page, screen, process.env.ALT_ID ?? "b");
    const r = await page.evaluate(() => {
      const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
      const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
      const blend = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
      const bgOf = (el) => { const stack = []; let e = el; const night = document.documentElement.dataset.space === "jeu" && el.closest(".ProsePage--intro"); while (e && !(night && e === night.parentElement)) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c.a > 0) { stack.push(c); if (c.a >= 1) break; } e = e.parentElement; } let bg = night ? { r: 21, g: 17, b: 13, a: 1 } : { r: 235, g: 229, b: 215, a: 1 }; for (let i = stack.length - 1; i >= 0; i--) bg = blend(stack[i], bg); return bg; };
      const out = []; let checked = 0;
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const seen = new Set();
      while (walker.nextNode()) {
        const n = walker.currentNode; if (!n.textContent.trim()) continue;
        const el = n.parentElement; if (seen.has(el)) continue; seen.add(el);
        const cs = getComputedStyle(el); if (cs.visibility === "hidden" || cs.display === "none") continue;
        const rect = el.getBoundingClientRect(); if (!rect.width || !rect.height) continue;
        if (el.closest(".tdg-visually-hidden,[hidden],.tdg-skip")) continue;
        checked++; const isSvg = el instanceof SVGElement; let fg = parse(isSvg ? cs.fill : cs.color); let bg = bgOf(el); if (isSvg && el.previousElementSibling?.tagName === "rect") { const f = parse(getComputedStyle(el.previousElementSibling).fill); if (f) bg = f; } fg = blend(fg, bg);
        const L1 = lum(fg), L2 = lum(bg); const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
        const size = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700;
        const large = size >= 24 || (size >= 18.66 && bold);
        if (ratio < (large ? 3 : 4.5)) out.push(`${ratio.toFixed(2)} ${size}px ${cs.fontWeight} «${n.textContent.trim().slice(0, 40)}» ${el.className.toString().split(" ").filter(c=>!c.includes("module__")).join(".").slice(0,60)}`);
      }
      const sw = document.documentElement.scrollWidth;
      const over = [...document.querySelectorAll("body *")].filter((e) => { const r = e.getBoundingClientRect(); return r.right > innerWidth + 1 && r.width > 0 && getComputedStyle(e).position !== "fixed"; }).slice(0, 5).map((e) => e.tagName + "." + e.className.toString().split(" ").filter(c=>!c.includes("module__")).join(".").slice(0, 50) + " r=" + Math.round(e.getBoundingClientRect().right));
      return { out, sw, over, checked };
    });
    console.log(`== ${screen.id}-${vp.id} scrollWidth=${r.sw} textNodes=${r.checked} low=${r.out.length}`);
    for (const o of r.over) console.log("  OVERFLOW", o);
    for (const o of r.out) console.log("  LOW", o);
  }
  await context.close();
}
await browser.close();
