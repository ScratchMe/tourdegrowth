import { beforeAll, describe, expect, it } from "vitest";
import { QUESTIONS } from "@/content/copy-library";
import { DEEP_MODE_QUESTIONS } from "@/content/deep-mode-questions";
import { PILLARS } from "@/lib/scoring/pillars";
import { computeScore, type AnswerIndex, type Answers } from "@/lib/scoring/score";
import { buildDeepDivePrompt } from "@/lib/gemini/prompt";
import { REQUEST_TIMEOUT_MS } from "@/lib/gemini/client";
import { callDeepDiveGemini } from "@/lib/gemini/deep-dive";
import { extractGeminiText } from "@/lib/gemini/response";
import {
  resolveContextPromptAnswers,
  resolveQuickPromptAnswers,
  type DeepDiveAnswers,
} from "@/lib/submissions/create-submission";
import { parseDeepDiveVerdict } from "@/lib/submissions/verdict";
import type { Locale } from "@/lib/i18n/locale";
import type { Tone } from "@/lib/quiz/tone";

/**
 * Exercises the app's OWN Gemini client against the real API — the thing no
 * sandbox in this project has ever been able to do. It is what let R-25
 * (`responseSchema`) ship: that changes the REQUEST on the only AI feature in
 * the product, and a malformed schema returns 400, which this client treats
 * as non-retriable — every Deep dive would break until corrected. Run this
 * on the branch BEFORE merging any change to `deep-dive.ts` or `client.ts`.
 *
 * Deliberately imports `client.ts` / `prompt.ts` rather than calling the API
 * by hand: a probe that re-implements the request tests a copy, not the code
 * that ships.
 *
 * Costs real quota. Manual trigger only.
 */

/**
 * A FULL set of answers — all 15 Quick questions, all 10 context questions —
 * resolved through the same functions the Deep dive route uses, so the prompt
 * this probe sends is the size and shape of a real one.
 *
 * The fifth live run is why. This probe used to send 2 Quick + 2 context
 * answers (a sixth of a real prompt) and passed in 18s, while production —
 * same API, same key, same minute — failed after 47s. A probe that is
 * lighter than the thing it stands in for cannot fail the way that thing
 * fails, and its green means nothing when production is red.
 *
 * Option index 2 is the 0-point answer; retention gets it on every question
 * so the sample has an unambiguous weakest pillar to write about.
 */
const QUICK_ANSWERS: Answers = Object.fromEntries(
  QUESTIONS.map((q) => {
    const index: AnswerIndex = q.pillar === "retention" ? 2 : q.pillar === "revenue" ? 0 : 1;
    return [q.id, index];
  }),
);

/** Spread across each question's options rather than always the first, so the prompt reads like a real founder's. */
const CONTEXT_ANSWERS: DeepDiveAnswers = Object.fromEntries(
  DEEP_MODE_QUESTIONS.map((q, i) => [q.id, i % q.options.length]),
);

const SCORING = computeScore(QUICK_ANSWERS);

/** Read once, not per call, so a missing key fails in `beforeAll` with a clear message. */
function apiKey(): string {
  return process.env.GEMINI_API_KEY!;
}

/**
 * What the model actually spent, printed on every call.
 *
 * `thoughtsTokenCount` is worth watching: these are thinking models and
 * reasoning tokens come out of the SAME `maxOutputTokens` budget as the
 * answer. It was suspected of truncating a French roast mid-JSON on the
 * second live run — and the very next run measured `thoughts=765` against a
 * 4096 ceiling, which cleared it. Printed precisely so the next theory gets
 * the same treatment before it lands in a comment.
 */
function usage(data: unknown): string {
  const d = data as {
    candidates?: { finishReason?: string }[];
    usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; thoughtsTokenCount?: number };
  };
  const u = d.usageMetadata ?? {};
  return `finishReason=${d.candidates?.[0]?.finishReason ?? "?"} prompt=${u.promptTokenCount ?? "?"} thoughts=${u.thoughtsTokenCount ?? 0} answer=${u.candidatesTokenCount ?? "?"}`;
}

function samplePrompt(locale: Locale, tone: Tone): string {
  return buildDeepDivePrompt({
    locale,
    tone,
    pillars: SCORING.pillars,
    total: SCORING.total,
    weakestPillar: SCORING.weakestPillar,
    quickAnswers: resolveQuickPromptAnswers(QUICK_ANSWERS, locale),
    contextAnswers: resolveContextPromptAnswers(CONTEXT_ANSWERS, locale),
    freeContext: "We sell a scheduling tool to independent physiotherapists.",
  });
}

/**
 * One generation, timed. The seconds are the point: the per-attempt timeout
 * in `client.ts` is a bet about how long a real-length generation takes on a
 * slow day, and this is the only place that bet gets measured against the
 * real API with a real-length prompt.
 */
async function timed(what: string, prompt: string) {
  const started = Date.now();
  // The production call, schema included — never a hand-assembled request (REVIEW.md R-25).
  const result = await callDeepDiveGemini(prompt, apiKey());
  const seconds = (Date.now() - started) / 1000;
  console.log(
    `  ── ${what}: ${result.modelUsed}, ${seconds.toFixed(1)}s (per-attempt ceiling ${REQUEST_TIMEOUT_MS / 1000}s), ${usage(result.data)}`,
  );
  return result;
}

/**
 * Turns "the dependency is down" into something nobody has to decode.
 *
 * A red run is only useful if it says WHICH kind of red it is. Exhausting the
 * fallback chain on retriable statuses is not a regression in this codebase —
 * the same request succeeds when the API is healthy — and treating it like
 * one is how a verification job stops being read.
 *
 * It still FAILS rather than skipping: a skip would quietly hide a sustained
 * outage, and knowing the Deep dive is unavailable right now is worth
 * knowing. It just says so in words.
 */
async function reportingUpstreamOutages<T>(what: string, run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/All Gemini model candidates failed/.test(message)) {
      throw new Error(
        `UPSTREAM UNAVAILABLE — ${what}\n` +
          `  ${message}\n` +
          `  Every model in the fallback chain refused. This is the Gemini API being unavailable,\n` +
          `  not a regression here: the same request succeeds when it is healthy. Re-run later.\n` +
          `  Investigate only if it persists across runs hours apart.`,
      );
    }
    throw err;
  }
}

describe("live Gemini", () => {
  beforeAll(() => {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set — add it to the repository secrets.");
    }
  });

  it("answers a real Deep dive prompt through the fallback chain", async () => {
    const prompt = samplePrompt("en", "neutral");
    console.log(`\n  ── prompt: ${prompt.length} chars, ${QUESTIONS.length} Quick + ${DEEP_MODE_QUESTIONS.length} context answers`);
    const { data, modelUsed } = await reportingUpstreamOutages("one English Deep dive prompt", () =>
      timed("EN neutral", prompt),
    );
    const verdict = parseDeepDiveVerdict(extractGeminiText(data), modelUsed);

    console.log(`  ── priority action\n     ${verdict.priorityAction}`);

    for (const pillar of PILLARS) {
      expect(verdict.pillarRecommendations[pillar], `missing recommendation for ${pillar}`).toBeTruthy();
    }
  });

  it("produces French that reads like French, in both tones", async () => {
    // Printed rather than asserted beyond the obvious: whether the roast voice
    // survives translation is a judgement call, and the point of this probe is
    // to put the real text in front of someone who can make it.
    // Both at once, like the route does (it fires 2 tones x 2 languages in
    // parallel): the usage line each prints is the evidence to read if a
    // truncated answer then throws in `extractGeminiText`.
    console.log("");
    const [neutral, roast] = await reportingUpstreamOutages("both French tones", () =>
      Promise.all([timed("FR neutre", samplePrompt("fr", "neutral")), timed("FR roast ", samplePrompt("fr", "roast"))]),
    );

    const neutre = parseDeepDiveVerdict(extractGeminiText(neutral.data), neutral.modelUsed);
    const cassant = parseDeepDiveVerdict(extractGeminiText(roast.data), roast.modelUsed);

    console.log(`\n  ── FR neutre\n     ${neutre.priorityAction}`);
    console.log(`  ── FR roast\n     ${cassant.priorityAction}`);
    console.log(`  ── FR roast, rétention\n     ${cassant.pillarRecommendations.retention}`);

    expect(neutre.priorityAction).toMatch(/[àâéèêîôùûç]/);
    expect(cassant.priorityAction).toMatch(/[àâéèêîôùûç]/);
  });
});
