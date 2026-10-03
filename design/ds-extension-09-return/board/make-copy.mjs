// Writes ../COPY.md from copy.js and glossary.js, so the review sheet and the
// board cannot drift. Run: node board/make-copy.mjs (from the return's root).
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { COPY, frTypo } from "./copy.js";
import { GLOSSARY } from "./glossary.js";

const here = dirname(fileURLToPath(import.meta.url));
const cell = (t) => String(t ?? "").replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/\n/g, " ");

const SECTIONS = [
  ["landing.", "The page's first screen (C52)"],
  ["money.", "The money on the board (MoneyBlock)"],
  ["worth.", "The money on the board (MoneyBlock)"],
  ["cash.", "The cash and its warning (MoneyBlock, CashWarning)"],
  ["settings.", "Settings: the runway (C49)"],
  ["whatif.", "What if? — the card (LeverCard, MrrCurve)"],
  ["curve.", "What if? — the card (LeverCard, MrrCurve)"],
  ["panel.", "What if? — the panel (WhatIfFigures, LeverSum)"],
  ["row.", "What if? — the panel (WhatIfFigures, LeverSum)"],
  ["fmt.", "What if? — the panel (WhatIfFigures, LeverSum)"],
  ["sum.", "What if? — the panel (WhatIfFigures, LeverSum)"],
  ["total.", "The hybrid (TotalBand)"],
  ["hybrid.", "The hybrid (TotalBand)"],
  ["sa.", "The hybrid (TotalBand)"],
  ["slide.", "The slides (SlideUnitEconomics, PaybackChart, SlideWhatIf)"],
];
const sectionOf = (k) => (SECTIONS.find(([p]) => k.startsWith(p)) ?? ["", "The board around the money"])[1];

const entries = Object.entries(COPY).filter(([k, v]) => v.status !== "board" && !k.startsWith("term."));
const review = entries.filter(([, v]) => v.status === "new" || v.status === "changed");
const kept = entries.filter(([, v]) => v.status === "kept");
const examples = entries.filter(([, v]) => v.status === "example");
const board = Object.entries(COPY).filter(([, v]) => v.status === "board");

let md = `# COPY — brief 09, the engine's money

*Every new or changed string of design system extension 09, French and
English side by side, with the screen it sits on. Generated from
\`board/copy.js\` by \`board/make-copy.mjs\`: the board draws these very
strings. For Antoine's review (the bon à tirer) before anything ships.*

- **Screens** are the board's ids (\`board.html?screen=…\`); \`board-*\`
  means every board state, \`slide-unit-*\` every unit-economics slide.
- **French typography**: the strings carry U+202F (narrow no-break space)
  before « : ; ? ! » and inside « », and in grouped figures (« 48 000 € »).
  \`tu\` on screens, « on » / « nous » on slides. Stage names stay in English.
- \`{…}\` are slots the engine fills, already formatted (board/fmt.js): the
  euro after the figure in French, before it in English; two significant
  digits and "~" for anything projected or estimated; facts to the unit;
  a range "€1,500–2,300" / « 1 500 à 2 300 € »; an unknown "?".
- French uses the engine's own word for contraction, « rétrogradation ».

`;

const groups = [...new Set(review.map(([k]) => sectionOf(k)))];
md += `## To review: ${review.length} strings (${review.filter(([, v]) => v.status === "new").length} new, ${review.filter(([, v]) => v.status === "changed").length} changed)\n\n`;
for (const g of groups) {
  md += `### ${g}\n\n| Key | Screen | English | Français | Today |\n|---|---|---|---|---|\n`;
  for (const [k, v] of review.filter(([k]) => sectionOf(k) === g)) {
    md += `| \`${k}\` | ${v.on.join(", ")} | ${cell(v.en)} | ${cell(frTypo(v.fr))} | ${v.status === "changed" ? "*was* " + cell(v.was ?? "") : "**new**"} |\n`;
  }
  md += "\n";
}

md += `## The three words the money teaches: ${Object.keys(GLOSSARY).length} new definitions

For the engine's "?" (EngineTerm, return 07's five words as ported: one
definition open at a time), where each word is first needed (README, Q14).
ARR is already in the glossary: its label says it ("ARR, the MRR × 12") and
it gets no new "?".

| Term | Where its "?" sits | English | Français |
|---|---|---|---|
`;
const WHERE = {
  cashTied: "board-*, cash-* (the cash part: “Tied up at this pace ?”)",
  after: "board-healthy, cash-* (the line “…of margin after payback ?”), shown only when the customer pays back",
  runway: "settings-runway (the runway field's hint)",
};
for (const [id, v] of Object.entries(GLOSSARY)) {
  md += `| ${v.en.term} / ${v.fr.term} | ${WHERE[id]} | ${cell(v.en.definition)} | ${cell(v.fr.definition)} |\n`;
}

md += `
## Outputs of functions that stay (not new copy)

The slides' titles that today's functions already write, drawn with the
screens' data, and the healthy title's figures. Listed so nobody mistakes
them for new copy.

| Key | Screen | English | Français |
|---|---|---|---|
`;
for (const [k, v] of examples) md += `| \`${k}\` | ${v.on.join(", ")} | ${cell(v.en)} | ${cell(frTypo(v.fr))} |\n`;

md += `
## The board's own labels (the deck-order screen; not product copy)

| Key | English | Français |
|---|---|---|
`;
for (const [k, v] of board) md += `| \`${k}\` | ${cell(v.en)} | ${cell(frTypo(v.fr))} |\n`;

md += `
## Kept as they are today: ${kept.length} strings

Drawn on the board for context, unchanged (A18, as on brief 09's
screenshots). Where a screenshot did not show today's exact wording, the
board writes the closest it could and the app keeps its own.

| Key | English | Français |
|---|---|---|
`;
for (const [k, v] of kept) md += `| \`${k}\` | ${cell(v.en)} | ${cell(frTypo(v.fr))} |\n`;

writeFileSync(join(here, "..", "COPY.md"), md);
console.log(`COPY.md: ${review.length} to review, ${kept.length} kept, ${examples.length} examples, ${board.length} board, ${Object.keys(GLOSSARY).length} glossary`);
