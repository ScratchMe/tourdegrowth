import { COMPARISON_ORDER, COMPARISONS } from "@/content/comparisons";
import { QUESTIONS } from "@/content/copy-library";
import { GLOSSARY } from "@/content/glossary";
import { GLOSSARY_DEEP } from "@/content/glossary-deep";
import { HOW_IT_WORKS } from "@/content/how-it-works";
import { CHECKLIST, DIAGNOSTIC, type OpenDoorPage } from "@/content/open-door";
import { CONTENT_UPDATED_AT, termUpdatedAt } from "@/content/updated-at";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { formatLongDate } from "@/lib/i18n/format-date";
import type { Translatable } from "@/lib/i18n/translatable";
import { PILLARS } from "@/lib/scoring/pillars";
import { LLMS_SUMMARY, llmsUrl } from "./llms-shared";

/**
 * `/llms-full.txt` — CHANTIERS.md C27, decided by Antoine on 2026-09-30: the
 * full English text of the articles (How it works, the two open-door pages,
 * the five comparisons) and of the 24 glossary terms, in one Markdown file.
 *
 * **Built from the same fields the pages render, in the same order**, so it
 * says what the pages say and nothing else. Every heading inside a page is a
 * label the page already prints (`UI_STRINGS`); the only new copy is the
 * file's own header and the two language labels of each part's address line.
 *
 * Not in it: the landing, About, the legal pages, the game and the engine.
 * The first two are listed in `/llms.txt`; the last two are products to use,
 * not text to read.
 */

const en = (text: Translatable): string => tc(text, "en").replace(/\s+/g, " ").trim();
const ui = UI_STRINGS;

// TODO: à relire (convention 6) — copie neuve (C27, 2026-09-30) : le titre, la phrase d'en-tête et les deux libellés de langue du texte intégral.
const ADDRESS_LABELS = { en: "English", fr: "French" };
const FULL_TITLE = "Tour de Growth — full text";
const FULL_INTRO =
  "The English text of Tour de Growth's articles and glossary, as the pages print it. Each part gives the page's address in both languages and the day it was last updated.";

/** The address block every part opens with: both languages, and the day the page itself prints. */
function addressLine(path: string, isoDay: string): string {
  return `${ADDRESS_LABELS.en}: ${llmsUrl("en", path)} · ${ADDRESS_LABELS.fr}: ${llmsUrl("fr", path)} · ${en(ui.prosePage.updatedAt)} ${formatLongDate(isoDay, "en")}`;
}

const stageEyebrow = (index: number) => en(ui.howItWorksPage.stageEyebrowTemplate).replace("{n}", String(index + 1));
const questionsOf = (pillar: (typeof PILLARS)[number]) => QUESTIONS.filter((q) => q.pillar === pillar);
const points = (n: number) => en(ui.breakdown.pointsTemplate).replace("{n}", String(n));
/**
 * A Markdown table cell cannot hold a bare pipe (`en` already folds line
 * breaks). Backslashes are escaped first, so one already in the text cannot
 * turn our `\|` back into a column break (CodeQL, js/incomplete-sanitization).
 */
export const tableCell = (text: string): string => text.replace(/\\/g, "\\\\").replace(/\|/g, "\\|");
const cell = (text: Translatable) => tableCell(en(text));

function howItWorks(): string[] {
  const out = [`## ${en(HOW_IT_WORKS.title)}`, "", addressLine("/how-it-works", CONTENT_UPDATED_AT["/how-it-works"]!), "", en(HOW_IT_WORKS.intro), ""];
  HOW_IT_WORKS.pillars.forEach((block, index) => {
    const example = QUESTIONS.find((q) => q.id === block.exampleQuestionId);
    out.push(`### ${stageEyebrow(index)} — ${en(ui.pillars[block.pillar])}`, "", en(block.explanation), "");
    if (example) out.push(`${en(ui.howItWorksPage.exampleQuestionLabel)} ${en(example.question)}`, "");
  });
  const { scoringSection, tonesSection, limitationNotice } = HOW_IT_WORKS;
  out.push(`### ${en(scoringSection.title)}`, "", en(scoringSection.body), "");
  out.push(`### ${en(tonesSection.title)}`, "");
  out.push(`- **${en(tonesSection.straightUp.label)}** — ${en(tonesSection.straightUp.body)}`);
  out.push(`- **${en(tonesSection.roast.label)}** — ${en(tonesSection.roast.body)}`, "");
  out.push(en(limitationNotice.long), "");
  return out;
}

function openDoorSections(page: OpenDoorPage): string[] {
  return page.sections.flatMap((section) => [`### ${en(section.heading)}`, "", ...section.body.flatMap((p) => [en(p), ""])]);
}

/** The checklist prints the fifteen questions with what each answer is worth, stage by stage, then its prose. */
function checklist(): string[] {
  const path = "/growth-audit-checklist";
  const out = [`## ${en(CHECKLIST.title)}`, "", addressLine(path, CONTENT_UPDATED_AT[path]!), "", en(CHECKLIST.intro), ""];
  PILLARS.forEach((pillar, index) => {
    out.push(`### ${stageEyebrow(index)} — ${en(ui.pillars[pillar])}`, "");
    for (const question of questionsOf(pillar)) {
      out.push(`- ${en(question.question)}`);
      for (const option of question.options) out.push(`  - ${points(option.points)}: ${en(option.label)}`);
    }
    out.push("");
  });
  out.push(...openDoorSections(CHECKLIST));
  return out;
}

function diagnostic(): string[] {
  const path = "/startup-growth-diagnostic";
  return [
    `## ${en(DIAGNOSTIC.title)}`,
    "",
    addressLine(path, CONTENT_UPDATED_AT[path]!),
    "",
    en(DIAGNOSTIC.intro),
    "",
    ...openDoorSections(DIAGNOSTIC),
    `### ${en(ui.openDoor.stagesHeading)}`,
    "",
    ...PILLARS.map((pillar) => `- [${en(ui.pillars[pillar])}](${llmsUrl("en", `/glossary/${pillar}`)})`),
    "",
  ];
}

function comparison(slug: (typeof COMPARISON_ORDER)[number]): string[] {
  const entry = COMPARISONS[slug];
  const path = `/${slug}`;
  const out = [`## ${en(entry.title)}`, "", addressLine(path, CONTENT_UPDATED_AT[path]!), "", en(entry.intro), ""];
  out.push(`### ${en(ui.comparisonPage.atAGlance)}`, "");
  out.push(`| | AARRR | ${cell(entry.other)} |`, "| --- | --- | --- |");
  for (const row of entry.rows) out.push(`| ${cell(row.aspect)} | ${cell(row.aarrr)} | ${cell(row.other)} |`);
  out.push("");
  for (const section of entry.sections) out.push(`### ${en(section.heading)}`, "", ...section.body.flatMap((p) => [en(p), ""]));
  out.push(`### ${en(ui.comparisonPage.verdictHeading)}`, "", en(entry.verdict), "");
  return out;
}

/** One glossary term, in the order `/glossary/[term]` prints it. */
function term(id: keyof typeof GLOSSARY): string[] {
  const entry = GLOSSARY[id];
  const deep = GLOSSARY_DEEP[id];
  const g = ui.glossaryPage;
  const path = `/glossary/${id}`;
  const out = [`## ${en(entry.term)}`, "", addressLine(path, termUpdatedAt(entry)), "", en(entry.definition), ""];
  out.push(`### ${en(g.inPracticeLabel)}`, "", en(entry.extended), "");

  out.push(`### ${en(g.formulaLabel)}`, "", `\`${en(deep.formula.expression)}\``, "");
  for (const t of deep.formula.terms) out.push(`- **${en(t.symbol)}**: ${en(t.meaning)}`);
  out.push("");
  if (deep.formula.note) out.push(en(deep.formula.note), "");

  out.push(`### ${en(g.exampleLabel)}`, "", `**${en(deep.example.title)}**`, "");
  deep.example.steps.forEach((step, i) => out.push(`${i + 1}. ${en(step)}`));
  out.push("", `**${en(deep.example.takeaway)}**`, "");

  out.push(`### ${en(g.benchmarkLabel)}`, "", ...deep.benchmark.map((b) => `- ${en(b)}`), "");
  out.push(`### ${en(g.improveLabel)}`, "", ...deep.howToImprove.map((h) => `- ${en(h)}`), "");

  out.push(`### ${en(g.inTheTourLabel)}`, "");
  const question = QUESTIONS.find((q) => q.id === deep.inTheTour.questionId);
  if (question) {
    out.push(`${en(g.inTheTourQuestionLabel)}: ${en(question.question)}`, "");
    for (const option of question.options) out.push(`- ${points(option.points)}: ${en(option.label)}`);
    out.push("");
  }
  out.push(en(deep.inTheTour.body), "");

  out.push(`### ${en(g.faqLabel)}`, "");
  for (const item of deep.faq) out.push(`**${en(item.question)}**`, "", en(item.answer), "");

  if (entry.related.length > 0) {
    out.push(`${en(g.relatedLabel)}: ${entry.related.map((r) => `[${en(GLOSSARY[r].term)}](${llmsUrl("en", `/glossary/${r}`)})`).join(", ")}`, "");
  }
  return out;
}

/** The paths `/llms-full.txt` covers, in its order — what `llms.test.ts` checks against the sitemap. */
export function llmsFullPaths(): string[] {
  return [
    "/how-it-works",
    "/growth-audit-checklist",
    "/startup-growth-diagnostic",
    ...COMPARISON_ORDER.map((slug) => `/${slug}`),
    ...Object.keys(GLOSSARY).map((id) => `/glossary/${id}`),
  ];
}

/** The whole of `/llms-full.txt`: the shared summary, then one H2 part per page, separated by rules. */
export function buildLlmsFullTxt(): string {
  const parts: string[][] = [
    howItWorks(),
    checklist(),
    diagnostic(),
    ...COMPARISON_ORDER.map(comparison),
    ...(Object.keys(GLOSSARY) as (keyof typeof GLOSSARY)[]).map(term),
  ];
  const head = [`# ${FULL_TITLE}`, "", `> ${LLMS_SUMMARY}`, "", FULL_INTRO, ""];
  return [...head, ...parts.flatMap((part) => ["---", "", ...part])].join("\n").replace(/\n{3,}/g, "\n\n");
}
