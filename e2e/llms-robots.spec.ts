import { expect, test } from "@playwright/test";

/**
 * CHANTIERS.md C26 and C27 (decided 2026-09-30), on the production build.
 * The unit tests (`robots.test.ts`, `llms.test.ts`) prove what the builders
 * return; these prove what the server actually sends — the proxy sits in
 * front of every path, and a `.txt` route handler is one convention Next
 * could route differently from what the code assumes.
 */

const pathOf = (url: string) => new URL(url).pathname;

test("robots.txt names the AI robots and lets every group in (C26)", async ({ request }) => {
  const response = await request.get("/robots.txt");
  expect(response.status()).toBe(200);
  const text = await response.text();
  for (const agent of ["GPTBot", "ClaudeBot", "Google-Extended", "OAI-SearchBot", "Claude-SearchBot", "PerplexityBot"]) {
    expect(text, agent).toContain(`User-Agent: ${agent}`);
  }
  expect(text).toMatch(/User-Agent: \*\nAllow: \//);
  expect(text).not.toMatch(/Disallow/i);
});

test("llms.txt is served as text, and every page it links to answers 200 (C27)", async ({ request }) => {
  const response = await request.get("/llms.txt");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("text/plain");
  const text = await response.text();
  expect(text.startsWith("# Tour de Growth\n\n> ")).toBe(true);

  const targets = [...text.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => pathOf(m[1]!));
  // Both languages of the landing, How it works, the glossary… and the full text.
  expect(targets).toEqual(expect.arrayContaining(["/en", "/fr", "/en/how-it-works", "/fr/glossary/churn", "/llms-full.txt"]));
  for (const path of targets) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
});

test("llms-full.txt carries the full English text (C27)", async ({ request }) => {
  const response = await request.get("/llms-full.txt");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("text/plain");
  const text = await response.text();
  expect(text.startsWith("# Tour de Growth — full text\n\n> ")).toBe(true);
  expect(text).toContain("## How Tour de Growth works");
  expect(text).toContain("## Churn");
  expect(text).toContain("### Questions people ask");
});
