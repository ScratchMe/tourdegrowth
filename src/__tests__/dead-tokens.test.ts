import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Design audit A1.6 (2026-09-29): --width-mobile and --texture-spray-strong
 * were declared, transcribed from the bundle, and read by nothing. A token
 * nothing reads is worse than none: the contrast tests measure it, Claude
 * Design receives it as part of the system, and the next person reaches for
 * it believing it is in use. Every token a stylesheet declares is now read
 * somewhere under src/ — or listed below, with the reason it waits.
 *
 * Non-vacuity (2026-09-29): putting --width-mobile back fails the second
 * test on that name alone. A listed token that gains a reader fails the
 * third, so the allowance cannot outlive its reason.
 */

const SRC = join(process.cwd(), "src");
const TOKENS = join(SRC, "styles", "tokens");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.(css|tsx?)$/.test(name) ? [full] : [];
  });
}

const WAITING: Record<string, string> = {
  "--surface-desk":
    "kept out of use on purpose (L-10): --text-muted clears AA on it by 0.005, and token-contrast.test.ts forbids a reader until one re-measures",
  "--state-warn-text":
    "the middle of the status triplet (good · warn · bad), measured in both worlds by the contrast tests; no screen says « warn » yet",
};
// The fifteen --viz-cat-* and --viz-seq-* waited here until A2.2 (2026-09-29), which removed them: nothing read them.

/**
 * The simpler engine (A18, 2026-10-02) ports tokens/engine.css whole in T0,
 * and its screens a step at a time: each token waits for the step whose
 * component reads it first (the return's own CSS says which). A step that
 * ports its component and forgets to take its tokens off this list fails the
 * third test; a step that is dropped leaves its tokens here, in plain sight.
 */
const A18_STEP = {
  T2: "A18 T2, the board (EngineBar, NextStep, EngineProgress, NumberList, LeverCard, the verdict)",
  T4: "A18 T4, the page (EngineLanding)",
  T5: "A18 T5, the hybrid (TotalBand)",
} as const;
const WAITING_FOR_A18: Record<string, string> = {
  "--engine-row-height": A18_STEP.T2,
  "--engine-mark-size": A18_STEP.T2,
  "--engine-mark-gap": A18_STEP.T2,
  "--engine-mark-group-gap": A18_STEP.T2,
  "--engine-mark-ink": A18_STEP.T2,
  "--engine-mark-ring": A18_STEP.T2,
  "--engine-mark-hatch": A18_STEP.T2,
  "--engine-slider-thumb": A18_STEP.T2,
  "--engine-slider-track": A18_STEP.T2,
  "--engine-slider-track-bg": A18_STEP.T2,
  "--engine-slider-fill": A18_STEP.T2,
  "--engine-slider-thumb-bg": A18_STEP.T2,
  "--engine-slider-thumb-edge": A18_STEP.T2,
  "--engine-verdict": A18_STEP.T2,
  "--engine-verdict-mobile": A18_STEP.T2,
  "--engine-stage-title": A18_STEP.T2,
  "--engine-figure-lg": A18_STEP.T2,
  "--engine-diagnosis-edge": A18_STEP.T2,
  "--engine-pending-edge": A18_STEP.T2,
  "--engine-accent": A18_STEP.T2,
  "--engine-reserve": A18_STEP.T4,
  "--engine-reserve-mobile": A18_STEP.T4,
  "--engine-landing-title": A18_STEP.T4,
  "--engine-landing-title-mobile": A18_STEP.T4,
  "--engine-figure": A18_STEP.T5,
};
Object.assign(WAITING, WAITING_FOR_A18);

const sheets = readdirSync(TOKENS).filter((f) => f.endsWith(".css"));
const declared = new Map<string, string>();
for (const sheet of sheets) {
  const css = readFileSync(join(TOKENS, sheet), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  for (const m of css.matchAll(/(?:^|[;{\s])(--[a-z0-9-]+)\s*:/g)) declared.set(m[1]!, sheet);
}

const corpus = walk(SRC)
  .filter((f) => !f.includes("__tests__"))
  .map((f) => readFileSync(f, "utf8"))
  .join("\n");
/** Every regex metacharacter escaped: a token name is data, never a pattern. */
const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&");
const isRead = (name: string) => new RegExp(`var\\(\\s*${escapeRegExp(name)}(?![\\w-])`).test(corpus);

describe("every token has a reader (design audit A1.6)", () => {
  it("reads the real token sheets", () => {
    expect(sheets.map((s) => basename(s))).toEqual(expect.arrayContaining(["colors.css", "shape.css", "spacing.css", "typography.css"]));
    expect(declared.size).toBeGreaterThan(200);
  });

  it("declares no token that nothing reads", () => {
    const dead = [...declared.keys()].filter((name) => !isRead(name) && !(name in WAITING));
    expect(dead).toEqual([]);
  });

  it("the waiting list holds only tokens that are still unread", () => {
    expect(Object.keys(WAITING).filter((name) => !declared.has(name) || isRead(name))).toEqual([]);
  });
});
