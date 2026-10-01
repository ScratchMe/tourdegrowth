// The preview: both images at 1200 × 630, the 320px feed check of each, the
// strings drawn and the alt text — all from og/, the files the port reads.
import { h, toDom } from "./dom-h.mjs";
import { engineShareImage, OG_SIZE } from "../og/EngineShareImage.og.mjs";
import { OG_STRINGS } from "../og/strings.og.mjs";

const FEED = 320;
const scale = FEED / OG_SIZE.width;
const root = document.getElementById("root");

const block = (tag, cls, text) => {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text != null) el.textContent = text;
  return el;
};

for (const locale of ["fr", "en"]) {
  const t = OG_STRINGS[locale];
  const section = block("section", "P_section");
  section.append(block("h2", "P_title", locale === "fr" ? "Français" : "English"));

  const full = block("div", "P_full");
  full.append(toDom(engineShareImage(h, locale)));
  section.append(block("p", "P_caption", `${OG_SIZE.width} × ${OG_SIZE.height}`), full);

  const feed = block("div", "P_feed");
  feed.style.width = `${FEED}px`;
  feed.style.height = `${Math.round(OG_SIZE.height * scale)}px`;
  const inner = toDom(engineShareImage(h, locale));
  inner.style.transform = `scale(${scale})`;
  inner.style.transformOrigin = "0 0";
  feed.append(inner);
  section.append(block("p", "P_caption", `${FEED}px — the feed check: the title, the wordmark and the stopwatch must read`), feed);

  const strings = block("dl", "P_strings");
  const rows = [
    ["Wordmark", t.wordmark.join(" ")],
    ["Space pill (drawn in capitals)", t.space],
    ["Domain badge", t.domain],
    ["Eyebrow (drawn in capitals)", t.eyebrow],
    ["Title (two set lines)", t.title.map((l) => l.join("")).join(" / ")],
    ["Line — NEW", t.line],
    ["Promise (drawn in capitals) — NEW", t.promise],
    ["Alt text", t.alt],
  ];
  for (const [k, v] of rows) strings.append(block("dt", null, k), block("dd", null, v));
  section.append(strings);
  root.append(section);
}
