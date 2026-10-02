// Writes ../COPY.md from copy.js and glossary.js, so the review sheet and the
// board cannot drift. Run: node board/make-copy.mjs (from the return's root).
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { COPY, frTypo } from "./copy.js";
import { GLOSSARY } from "./glossary.js";

const here = dirname(fileURLToPath(import.meta.url));
const cell = (t) => String(t ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
const show = (t) => cell(t).replace(/ /g, " "); // kept as is: U+202F is in the file

const SECTIONS = [
  ["landing.", "The page around the tool"],
  ["start.", "First visit: the start card"],
  ["bar.", "The engine bar and its menu"],
  ["next.", "Next step (“since last time”)"],
  ["verdict.", "Next step (“since last time”)"],
  ["progress.", "Progress"],
  ["status.", "Progress"],
  ["sheet.", "One number"],
  ["trap.", "One number"],
  ["value.", "One number"],
  ["answer.", "One number"],
  ["estimate.", "One number"],
  ["ask.", "One number"],
  ["cant.", "One number"],
  ["where.", "One number"],
  ["compare.", "One number"],
  ["words.", "One number"],
  ["diag.", "The board"],
  ["peloton.", "The board"],
  ["list.", "The board"],
  ["whatif.", "The board"],
  ["tour.", "The board"],
  ["slides.", "The board"],
  ["asks.", "To ask for"],
  ["total.", "The hybrid"],
  ["settings.", "Settings"],
];
const sectionOf = (k) => (SECTIONS.find(([p]) => k.startsWith(p)) ?? ["", "Other"])[1];

const entries = Object.entries(COPY).filter(([, v]) => v.status !== "board");
const review = entries.filter(([, v]) => v.status === "new" || v.status === "changed");
const kept = entries.filter(([, v]) => v.status === "kept");
const examples = entries.filter(([, v]) => v.status === "example");

let md = `# COPY — brief 07, the engine simpler

*Every new or changed string of design system extension 07, French and
English side by side, with the screen it sits on. Generated from
\`board/copy.js\` by \`board/make-copy.mjs\`: the board draws these very
strings. For Antoine's review before anything ships.*

- **Screens** are the board's ids (\`board.html?screen=…\`); \`return-*\`
  means every return state, \`number-*\` every number screen.
- **French typography**: the strings below carry U+202F (narrow no-break
  space) before « : ; ? ! » and inside « », and in grouped figures
  (« 1 400 »), as the house rule asks. \`tu\` throughout. Stage names stay
  in English on French screens.
- \`{…}\` are slots the engine fills (a month, a count, a role, a number's
  name). \`{n:one|other}\` is the word that agrees with the count \`n\` (0 and 1
  take the first, as in French); the app's i18n may write it its own way.
- **Not here**: the catalogue's text (CATALOGUE.md — kept word for word, see
  INVENTORY.md), and the deck (out of scope).

`;

const groups = [...new Set(review.map(([k]) => sectionOf(k)))];
md += `## To review: ${review.length} strings (${review.filter(([, v]) => v.status === "new").length} new, ${review.filter(([, v]) => v.status === "changed").length} changed)\n\n`;
for (const g of groups) {
  md += `### ${g}\n\n| Key | Screen | English | Français | Today |\n|---|---|---|---|---|\n`;
  for (const [k, v] of review.filter(([k]) => sectionOf(k) === g)) {
    md += `| \`${k}\` | ${v.on.join(", ")} | ${show(v.en)} | ${show(frTypo(v.fr))} | ${v.status === "changed" ? "*was* " + cell(v.was ?? "") : "**new**"} |\n`;
  }
  md += "\n";
}

md += `## Glossary entries: ${Object.keys(GLOSSARY).length} new

For the \`?\` (GlossaryTerm) where each word is first needed (README, Q19).
If the glossary already holds one of these terms, keep its text and drop
this one.

| Term | Where its \`?\` sits | English | Français |
|---|---|---|---|
`;
const WHERE = {
  cohort: "number-target (the denominator's hint of every cohort number)",
  target: "number-* (the target box's hint), settings (Targets)",
  reference: "number-* (How it compares) — offered, not drawn on the board",
  window: "settings (the activation window's hint)",
  sharedCount: "settings (Shared counts)",
};
for (const [id, v] of Object.entries(GLOSSARY)) {
  md += `| ${v.en.term} / ${v.fr.term} | ${WHERE[id]} | ${cell(v.en.definition)} | ${cell(frTypo(v.fr.definition))} |\n`;
}

md += `
## The example's data, drawn on the board (not copy)

Outputs of functions that stay (the verdict, a generated request, the
triage's repair) and the example's answers, drawn with the brief's
"returning" data. Listed so nobody mistakes them for new copy.

| Key | Screen | English | Français |
|---|---|---|---|
`;
for (const [k, v] of examples) md += `| \`${k}\` | ${v.on.join(", ")} | ${show(v.en)} | ${show(frTypo(v.fr))} |\n`;

md += `
## Kept as they are today: ${kept.length} strings

Drawn on the board for context, unchanged. Where the board could not read
today's exact wording from the screenshots, it writes the closest it could
and the app keeps its own.

| Key | English | Français |
|---|---|---|
`;
for (const [k, v] of kept) md += `| \`${k}\` | ${show(v.en)} | ${show(frTypo(v.fr))} |\n`;

writeFileSync(join(here, "..", "COPY.md"), md);
console.log(`COPY.md: ${review.length} to review, ${kept.length} kept, ${examples.length} examples, ${Object.keys(GLOSSARY).length} glossary`);
