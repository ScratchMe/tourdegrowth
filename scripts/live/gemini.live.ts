import { beforeAll, describe, expect, it } from "vitest";
import { PILLARS } from "@/lib/scoring/pillars";
import type { PillarScore } from "@/lib/scoring/score";
import { buildDeepDivePrompt } from "@/lib/gemini/prompt";
import { callGeminiWithFallback } from "@/lib/gemini/client";
import { extractGeminiText } from "@/lib/gemini/response";
import { parseDeepDiveVerdict } from "@/lib/submissions/verdict";
import type { Locale } from "@/lib/i18n/locale";
import type { Tone } from "@/lib/quiz/tone";

/**
 * Exercises the app's OWN Gemini client against the real API — the thing no
 * sandbox in this project has ever been able to do, and the reason R-25
 * (`responseSchema`, and one call for both tones) has stayed unshipped:
 * both change the REQUEST on the only AI feature in the product, and a
 * malformed schema returns 400, which this client treats as non-retriable.
 * Every Deep dive would break until corrected.
 *
 * Deliberately imports `client.ts` / `prompt.ts` rather than calling the API
 * by hand: a probe that re-implements the request tests a copy, not the code
 * that ships.
 *
 * Costs real quota. Manual trigger only.
 */
const PILLAR_SCORES: PillarScore[] = [
  { pillar: "acquisition", rawPoints: 40, score: 13 },
  { pillar: "activation", rawPoints: 27, score: 9 },
  { pillar: "retention", rawPoints: 13, score: 4 },
  { pillar: "referral", rawPoints: 20, score: 7 },
  { pillar: "revenue", rawPoints: 45, score: 15 },
];

/** Read once, not per call, so a missing key fails in `beforeAll` with a clear message. */
function apiKey(): string {
  return process.env.GEMINI_API_KEY!;
}

/**
 * What the model actually spent, printed on every call.
 *
 * `thoughtsTokenCount` is the number that matters: these are thinking models
 * and reasoning tokens come out of the SAME `maxOutputTokens` budget as the
 * answer. That is what truncated a French roast mid-JSON on the first live
 * run, and it is invisible unless printed.
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
    pillars: PILLAR_SCORES,
    total: 48,
    weakestPillar: "retention",
    quickAnswers: [
      { pillar: "acquisition", question: "Primary acquisition channel?", answer: "One channel, roughly tracked" },
      { pillar: "retention", question: "Do you track churn?", answer: "Not really" },
    ],
    contextAnswers: [
      { pillar: "acquisition", question: "Main channel today?", answer: "SEO / content" },
      { pillar: "retention", question: "When do people leave?", answer: "In the first two weeks" },
    ],
    freeContext: "We sell a scheduling tool to independent physiotherapists.",
  });
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
    const started = Date.now();
    const { data, modelUsed } = await reportingUpstreamOutages("one English Deep dive prompt", () =>
      callGeminiWithFallback(samplePrompt("en", "neutral"), apiKey()),
    );
    const verdict = parseDeepDiveVerdict(extractGeminiText(data), modelUsed);

    console.log(`\n  ── model: ${modelUsed}, ${Math.round((Date.now() - started) / 1000)}s`);
    console.log(`  ── ${usage(data)}`);
    console.log(`  ── priority action\n     ${verdict.priorityAction}`);

    for (const pillar of PILLARS) {
      expect(verdict.pillarRecommendations[pillar], `missing recommendation for ${pillar}`).toBeTruthy();
    }
  });

  it("produces French that reads like French, in both tones", async () => {
    // Printed rather than asserted beyond the obvious: whether the roast voice
    // survives translation is a judgement call, and the point of this probe is
    // to put the real text in front of someone who can make it.
    const [neutral, roast] = await reportingUpstreamOutages("both French tones", () =>
      Promise.all([
        callGeminiWithFallback(samplePrompt("fr", "neutral"), apiKey()),
        callGeminiWithFallback(samplePrompt("fr", "roast"), apiKey()),
      ]),
    );

    // Printed BEFORE parsing: a truncated answer throws in `extractGeminiText`,
    // and the token counts are precisely the evidence needed to understand why.
    console.log(`\n  ── FR neutre  ${usage(neutral.data)}`);
    console.log(`  ── FR roast   ${usage(roast.data)}`);

    const neutre = parseDeepDiveVerdict(extractGeminiText(neutral.data), neutral.modelUsed);
    const cassant = parseDeepDiveVerdict(extractGeminiText(roast.data), roast.modelUsed);

    console.log(`\n  ── FR neutre\n     ${neutre.priorityAction}`);
    console.log(`  ── FR roast\n     ${cassant.priorityAction}`);
    console.log(`  ── FR roast, rétention\n     ${cassant.pillarRecommendations.retention}`);

    expect(neutre.priorityAction).toMatch(/[àâéèêîôùûç]/);
    expect(cassant.priorityAction).toMatch(/[àâéèêîôùûç]/);
  });
});
