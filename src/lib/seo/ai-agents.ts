/**
 * The robots that feed a model's training. Allowed on purpose: CHANTIERS.md
 * C26, decided by Antoine on 2026-09-30. The Tour lives on search alone
 * (C20), the glossary and the comparisons are written to be quoted, and what
 * carries the value — the Tour, the engine, the game — runs in the browser,
 * so a model trained on these pages takes none of it away. Blocking them
 * would also cost Gemini's grounding: `Google-Extended` covers it, on top of
 * training (it never touches Google Search).
 *
 * `Google-Extended` and `Applebot-Extended` are tokens, not crawlers: they
 * never fetch anything, and are read by Google's and Apple's own crawlers.
 */
export const AI_TRAINING_AGENTS = ["GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended", "CCBot"] as const;

/**
 * The robots that fetch a page to answer someone, or index it for an AI
 * search: what gets the site quoted in ChatGPT, Claude and Perplexity.
 */
export const AI_ANSWER_AGENTS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
] as const;
