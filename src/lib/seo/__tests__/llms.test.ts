import { afterEach, describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { COMPARISON_ORDER, COMPARISONS } from "@/content/comparisons";
import { QUESTIONS } from "@/content/copy-library";
import { GLOSSARY } from "@/content/glossary";
import { GLOSSARY_DEEP } from "@/content/glossary-deep";
import { HOW_IT_WORKS } from "@/content/how-it-works";
import { CONTENT_PUBLISHED_AT } from "@/content/updated-at";
import { SITE_URL } from "@/lib/site";
import { buildLlmsTxt } from "../llms";
import { buildLlmsFullTxt, llmsFullPaths } from "../llms-full";

/** Every Markdown link target in a text. */
const linkTargets = (text: string): string[] => [...text.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => m[1]!);

const sitemapUrls = () => new Set(sitemap().map((entry) => entry.url));
const FULL_TEXT_URL = `${SITE_URL}/llms-full.txt`;

/**
 * CHANTIERS.md C27 (2026-09-30): `/llms.txt` lists exactly what the sitemap
 * lists, both languages, flags included — a page added to one and not the
 * other is a failing test, not a silent gap. Both read the game's and the
 * engine's flags when they run, so the variables are flipped here rather
 * than mocked (as `sitemap.test.ts` does).
 */
describe("/llms.txt covers the sitemap, and only it (C27)", () => {
  const saved = { game: process.env.GAME_ENABLED, engine: process.env.ENGINE_ENABLED };
  afterEach(() => {
    for (const [key, value] of [
      ["GAME_ENABLED", saved.game],
      ["ENGINE_ENABLED", saved.engine],
    ] as const) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  const cases = [
    { name: "game and engine closed", game: undefined, engine: undefined },
    { name: "game and engine open", game: "true", engine: "true" },
  ];

  for (const { name, game, engine } of cases) {
    it(`lists every sitemap URL once, and nothing else — ${name}`, () => {
      if (game === undefined) delete process.env.GAME_ENABLED;
      else process.env.GAME_ENABLED = game;
      if (engine === undefined) delete process.env.ENGINE_ENABLED;
      else process.env.ENGINE_ENABLED = engine;

      const links = linkTargets(buildLlmsTxt()).filter((url) => url !== FULL_TEXT_URL);
      expect(new Set(links).size, "a page is listed twice").toBe(links.length);
      expect(new Set(links)).toEqual(sitemapUrls());
    });
  }

  it("is llmstxt.org's shape: an H1, a quoted summary, then H2 sections of links", () => {
    const text = buildLlmsTxt();
    expect(text.startsWith("# Tour de Growth\n\n> ")).toBe(true);
    expect(text.match(/^## /gm)?.length).toBeGreaterThanOrEqual(4);
    // Every link line carries both languages.
    for (const line of text.split("\n").filter((l) => l.startsWith("- [") && !l.includes(FULL_TEXT_URL))) {
      expect(line, line).toMatch(/\/en(\/|\)).*\/fr(\/|\))/);
      expect(line, line).toMatch(/\): \S/);
    }
    expect(text).toContain(FULL_TEXT_URL);
    expect(text).not.toMatch(/\[object |: undefined\b|^undefined$/m);
  });

  // The full text's other links (a term's related terms, the diagnostic's
  // stages) must not reach past the sitemap either — checked against the
  // smallest sitemap, game and engine closed (relecteur-securite, 2026-09-30).
  it("/llms-full.txt links only to sitemap pages, even with the game and the engine closed", () => {
    delete process.env.GAME_ENABLED;
    delete process.env.ENGINE_ENABLED;
    const urls = [...buildLlmsFullTxt().matchAll(/https?:\/\/[^\s)|]+/g)].map((m) => m[0]);
    expect(urls.length).toBeGreaterThan(llmsFullPaths().length * 2);
    const allowed = sitemapUrls();
    for (const url of urls) expect(allowed.has(url), url).toBe(true);
  });
});

describe("/llms-full.txt carries the full text of the articles and the terms (C27)", () => {
  const text = buildLlmsFullTxt();

  it("covers every Article page and every glossary term, each once, with both addresses", () => {
    const expected = [...Object.keys(CONTENT_PUBLISHED_AT), ...Object.keys(GLOSSARY).map((id) => `/glossary/${id}`)];
    expect([...llmsFullPaths()].sort()).toEqual([...expected].sort());
    const urls = sitemapUrls();
    for (const path of llmsFullPaths()) {
      const en = `${SITE_URL}/en${path}`;
      expect(urls.has(en), `${path} is not in the sitemap`).toBe(true);
      expect(text.split(`English: ${en} · French: ${SITE_URL}/fr${path} · `).length - 1, path).toBe(1);
    }
  });

  it("says what the pages say: definitions, verdicts, questions, FAQ answers", () => {
    for (const [id, entry] of Object.entries(GLOSSARY)) {
      expect(text, id).toContain(entry.definition.en);
      expect(text, id).toContain(GLOSSARY_DEEP[id as keyof typeof GLOSSARY_DEEP].faq[0]!.answer.en);
    }
    for (const slug of COMPARISON_ORDER) expect(text, slug).toContain(COMPARISONS[slug].verdict.en);
    for (const question of QUESTIONS) expect(text, question.id).toContain(question.question.en);
    expect(text).toContain(HOW_IT_WORKS.scoringSection.body.en);
  });

  it("is English only, and has nothing unrendered", () => {
    expect(text).not.toContain(HOW_IT_WORKS.intro.fr);
    expect(text).not.toContain(GLOSSARY.churn.definition.fr);
    // Not a bare /undefined/: the glossary itself says "an undefined moment".
    expect(text).not.toMatch(/\[object |\{n\}|: undefined\b|^undefined$|\bNaN\b/m);
    expect(text.startsWith("# Tour de Growth — full text\n\n> ")).toBe(true);
  });
});
