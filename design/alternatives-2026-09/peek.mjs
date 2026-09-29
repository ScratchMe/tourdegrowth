import { createRequire } from "node:module";
const require = createRequire("/home/user/tourdegrowth/package.json");
const { chromium } = require("playwright");
import { openContext, show, VIEWPORTS, SCREENS } from "./harness.mjs";
const [screenId, selector, depth = "3"] = process.argv.slice(2);
const browser = await chromium.launch();
const ctx = await openContext(browser, VIEWPORTS[0]);
const page = await ctx.newPage();
await show(page, SCREENS.find((s) => s.id === screenId), null);
console.log(await page.evaluate(({ selector, depth }) => {
  const root = document.querySelector(selector);
  const out = [];
  const walk = (el, d) => {
    if (d > depth) return;
    const cls = [...el.classList].filter((c) => c.includes("--")).join(" ");
    const txt = el.children.length ? "" : (el.textContent || "").trim().slice(0, 40);
    out.push(`${"  ".repeat(d)}<${el.tagName.toLowerCase()}${cls ? " ." + cls : ""}${el.dataset.testid ? " #" + el.dataset.testid : ""}> ${txt}`);
    for (const c of el.children) walk(c, d + 1);
  };
  if (root) walk(root, 0);
  return out.join("\n");
}, { selector, depth: Number(depth) }));
await browser.close();
