// Writes ../COPY.md from copy.js, so the review sheet and the board cannot
// drift. Run: node board/make-copy.mjs (from the return's root).
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { COPY, frTypo } from "./copy.js";

const here = dirname(fileURLToPath(import.meta.url));
const cell = (t) => String(t ?? "").replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/\n/g, " ");
const fr = (t) => (t == null ? "" : frTypo(t));

const SECTIONS = [
  ["bar.", "Shared: the engine bar and the next step"],
  ["next.", "Shared: the engine bar and the next step"],
  ["total.", "Shared: the total (TotalBand)"],
  ["side.", "The side selector (SideShown)"],
  ["verdict.", "A side's verdict"],
  ["diag.", "A side's diagnosis"],
  ["note.", "Supply without the subscriptions (SideNote)"],
  ["money.", "A side's money (MoneyBlock)"],
  ["worth.", "A side's money (MoneyBlock)"],
  ["cash.", "A side's money (MoneyBlock)"],
  ["whatif.", "“What if?” — the card (LeverCard, MrrCurve)"],
  ["curve.", "“What if?” — the card (LeverCard, MrrCurve)"],
  ["panel.", "“What if?” — the panel (WhatIfFigures, LeverSum)"],
  ["row.", "“What if?” — the panel (WhatIfFigures, LeverSum)"],
  ["fmt.", "“What if?” — the panel (WhatIfFigures, LeverSum)"],
  ["sum.", "“What if?” — the panel (WhatIfFigures, LeverSum)"],
  ["lever.", "The levers' names (card, panel, slides)"],
  ["unit.", "The levers' names (card, panel, slides)"],
  ["funnel.", "The funnels (SideFunnel)"],
  ["legend.", "The funnels (SideFunnel)"],
  ["list.", "“Your numbers” (NumberList, side delta)"],
  ["status.", "“Your numbers” (NumberList, side delta)"],
  ["progress.", "“Your numbers” (NumberList, side delta)"],
  ["tour.", "“Your numbers” (NumberList, side delta)"],
  ["num.", "The numbers' names (19, 14 without the subscriptions)"],
  ["term.", "The words taught: the glossary's “?” (C72)"],
  ["slide.", "The slides"],
  ["deck.", "The deck's order (board only)"],
];
const sectionOf = (k) => (SECTIONS.find(([p]) => k.startsWith(p)) ?? ["", "Other"])[1];

const all = Object.entries(COPY);
const review = all.filter(([, v]) => ["new", "changed", "given"].includes(v.status));
const kept = all.filter(([, v]) => v.status === "kept");
const board = all.filter(([, v]) => v.status === "board");
const differs = (v) => (v.enS != null && v.enS !== v.en) || (v.frS != null && v.frS !== v.fr);

let md = `# COPY — brief 10, the marketplace

*Every new, changed or given string of design system extension 10, in
English and French and in both vocabularies — "products" (buyers, sellers,
orders, listings) and "services" (clients, providers, bookings, profiles),
C65 — with the screen it sits on. Generated from \`board/copy.js\` by
\`board/make-copy.mjs\`: the board draws these very strings (add
\`&vocab=services\` to any screen). For Antoine's review (the bon à tirer)
before anything ships.*

- **Status**: *given* — brief 10's words (§22.8.5), used as written;
  *new* — does not exist today; *changed* — replaces today's string (in
  "Today"); *kept* — today's string, listed at the end for context.
- **Services**: "=" when the services string is the products one, word for
  word. Where it differs, it is written out in full: French changes the verb
  with the noun (« passer une commande », « faire une réservation »), so no
  string is built by swapping words.
- **Screens** are the board's ids (\`board.html?screen=…\`); \`board-*\` means
  every board state, \`slide-demand-*\` every demand slide.
- **French typography**: the strings carry U+202F (narrow no-break space)
  before « : ; ? ! » and inside « », and in grouped figures (« 32 854 € »).
  \`tu\` on screens, « on » / « nous » on slides. Stage names stay in English.
- \`{…}\` are slots the engine fills, already formatted (board/fmt.js): the
  euro after the figure in French, before it in English; two significant
  digits and "~" for anything projected; facts to the unit; an unknown "?".
- **Stressed words**: the words between double asterisks in a string are the
  ones a sentence stresses, as the brief's given copy marks them: bold ink
  on the board and the slides, never red (red is the leak's, one per side).

`;

const groups = [...new Set(review.map(([k]) => sectionOf(k)))];
const n = (st) => review.filter(([, v]) => v.status === st).length;
md += `## To review: ${review.length} strings (${n("given")} given, ${n("new")} new, ${n("changed")} changed) — ${review.filter(([, v]) => differs(v)).length} with their own services words\n\n`;
for (const g of groups) {
  md += `### ${g}\n\n| Key | Status | Screen | English (products) | English (services) | Français (produits) | Français (services) | Today / why |\n|---|---|---|---|---|---|---|---|\n`;
  for (const [k, v] of review.filter(([key]) => sectionOf(key) === g)) {
    const enS = v.enS != null && v.enS !== v.en ? v.enS : "=";
    const frS = v.frS != null && v.frS !== v.fr ? fr(v.frS) : "=";
    const notes = [v.was ? `was: ${v.was}` : "", v.why ?? ""].filter(Boolean).join(" — ");
    md += `| \`${k}\` | ${v.status} | ${v.on.join(", ")} | ${cell(v.en)} | ${cell(enS)} | ${cell(fr(v.fr))} | ${cell(frS)} | ${cell(notes)} |\n`;
  }
  md += "\n";
}

md += `## Board only — not copy\n\nThe deck's order is drawn on the board as a strip; these strings are the strip's, never the app's.\n\n| Key | English | Français |\n|---|---|---|\n`;
for (const [k, v] of board) md += `| \`${k}\` | ${cell(v.en)}${v.enS && v.enS !== v.en ? ` (services: ${cell(v.enS)})` : ""} | ${cell(fr(v.fr))}${v.frS && v.frS !== v.fr ? ` (services : ${cell(fr(v.frS))})` : ""} |\n`;

md += `\n## Kept — today's strings, drawn for context (${kept.length})\n\nUnchanged, listed so the screens can be read in full. In both vocabularies unless written out.\n\n| Key | English | Français |\n|---|---|---|\n`;
for (const [k, v] of kept) md += `| \`${k}\` | ${cell(v.en)}${v.enS && v.enS !== v.en ? ` (services: ${cell(v.enS)})` : ""} | ${cell(fr(v.fr))}${v.frS && v.frS !== v.fr ? ` (services : ${cell(fr(v.frS))})` : ""} |\n`;

writeFileSync(join(here, "..", "COPY.md"), md);
console.log(`COPY.md: ${review.length} to review, ${board.length} board, ${kept.length} kept`);
