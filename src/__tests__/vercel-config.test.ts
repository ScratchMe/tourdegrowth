import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * `vercel.json` skips every non-production build (2026-09-06: a day of
 * twenty merges and thirty branch pushes hit the Hobby plan's daily
 * deployment limit, and production was frozen for 24 hours). Two things
 * this test protects: the file must stay valid JSON — an invalid
 * `vercel.json` fails EVERY deployment, production included — and the
 * ignore rule must keep building production, or a typo would silently
 * turn every merge into a no-op deploy.
 *
 * Vercel's contract for the ignored build step: exit code 1 = build,
 * exit code 0 = skip.
 */
describe("vercel.json", () => {
  const raw = readFileSync(join(process.cwd(), "vercel.json"), "utf8");

  it("is valid JSON with an ignoreCommand and nothing else operational", () => {
    const config = JSON.parse(raw) as Record<string, unknown>;
    expect(typeof config.ignoreCommand).toBe("string");
    expect(Object.keys(config).sort()).toEqual(["$schema", "ignoreCommand"]);
  });

  it("builds production (exit 1) and skips everything else (exit 0)", () => {
    const { ignoreCommand } = JSON.parse(raw) as { ignoreCommand: string };
    expect(ignoreCommand).toMatch(/"\$VERCEL_ENV" = "production"/);
    // The production branch must come out on the `exit 1` side.
    expect(ignoreCommand).toMatch(/then exit 1; else exit 0/);
  });
});
