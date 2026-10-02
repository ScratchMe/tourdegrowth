import type { Locale } from "@/lib/i18n/locale";
import type { Tone } from "@/lib/quiz/tone";
import type { Pillar } from "@/lib/scoring/pillars";
import { QUESTIONS } from "@/lib/scoring/questions";
import type { AnswerIndex, Answers } from "@/lib/scoring/score";
import type { DeepDiveResult, DeepDiveVerdict } from "@/lib/submissions/types";

/**
 * The results the Firestore emulator holds for the e2e — CHANTIERS.md A7.11,
 * decided 2026-09-29 (C17): no test door in the production code, a real
 * `/r/<id>` read from the emulator instead. `firebase-admin` reads
 * `FIRESTORE_EMULATOR_HOST` on its own, so the Firestore read and the
 * serialisation to the client — where `rawPoints` leaked twice — run exactly
 * as in production, with not one branch added to the public route.
 *
 * Written by `global-setup.ts` through `createSubmissionFlow` and the real
 * `saveSubmission`, the path `/api/submissions` takes: a hand-built document
 * would drift from the stored shape, and the payload spec exists to catch
 * exactly the fields that shape adds.
 *
 * Without the emulator, nothing is written and the specs that need it skip
 * with `SKIP_EMULATOR_REASON`, like the admin specs without a password.
 * TESTING.md says how to run it locally.
 */
export const EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST ?? "";
export const SKIP_EMULATOR_REASON =
  "FIRESTORE_EMULATOR_HOST is not set: a real /r/<id> needs the Firestore emulator (TESTING.md, « L'émulateur Firestore »)";

/** The token `seedOwnedResult` writes in the browser: the same one is hashed into every seeded result. */
export const REAL_OWNER_TOKEN = "e2e-owner-token";

/** A fixed instant, so a re-run overwrites the same documents with the same content. */
export const REAL_CREATED_AT = "2026-09-30T08:00:00.000Z";

/** One answer per stage, given to its three questions. Index 0 is the best answer. */
function answersFor(perStage: Record<Pillar, AnswerIndex>): Answers {
  return Object.fromEntries(QUESTIONS.map((q) => [q.id, perStage[q.pillar]]));
}

export interface RealResult {
  id: string;
  tone: Tone;
  locale: Locale;
  answers: Answers;
  total: number;
}

/**
 * One board per state of the bottleneck block (`resolveBottleneck`), and two
 * for the game's card (a Deep dive, two levels on one card).
 * The totals are what `computeScore` gives for these answers; the spec checks
 * the page shows them, so a scoring change announces itself here.
 */
export const REAL_RESULTS = {
  /** Retention alone at 0/20, the rest 7 or 20: a `clear` bottleneck, and the game's own stage. */
  clear: {
    id: "7d3c9e2a-0b1f-4c5d-8e6f-1a2b3c4d5e01",
    tone: "neutral",
    locale: "en",
    answers: answersFor({ acquisition: 1, activation: 0, retention: 2, referral: 1, revenue: 0 }),
    total: 54,
  },
  /** Activation and retention tied at 0/20: a `shared` bottleneck naming both, in roast. */
  shared: {
    id: "7d3c9e2a-0b1f-4c5d-8e6f-1a2b3c4d5e02",
    tone: "roast",
    locale: "fr",
    answers: answersFor({ acquisition: 0, activation: 2, retention: 2, referral: 1, revenue: 0 }),
    total: 47,
  },
  /** Every stage at 20/20: `level`, no stage named, no game card. */
  level: {
    id: "7d3c9e2a-0b1f-4c5d-8e6f-1a2b3c4d5e03",
    tone: "neutral",
    locale: "fr",
    answers: answersFor({ acquisition: 0, activation: 0, retention: 0, referral: 0, revenue: 0 }),
    total: 100,
  },
  /** Acquisition alone at the bottom, then a Deep dive written by the real `saveDeepDive` (`REAL_DEEP_DIVE`). */
  deep: {
    id: "7d3c9e2a-0b1f-4c5d-8e6f-1a2b3c4d5e04",
    tone: "neutral",
    locale: "en",
    answers: answersFor({ acquisition: 2, activation: 0, retention: 1, referral: 0, revenue: 1 }),
    total: 54,
  },
  /**
   * Acquisition and retention tied at 0/20: a `shared` bottleneck whose two
   * stages each have a level of the game — the one card that offers both,
   * stage by stage (C30 Q5, A12.f.2).
   */
  twoLevels: {
    id: "7d3c9e2a-0b1f-4c5d-8e6f-1a2b3c4d5e05",
    tone: "neutral",
    locale: "en",
    answers: answersFor({ acquisition: 2, activation: 0, retention: 2, referral: 1, revenue: 0 }),
    total: 47,
  },
  /**
   * Every stage at its weakest (A15.14, 2026-10-01): « Strengths » lists the
   * two highest stages, and here both are weak — the case its title turns
   * relative for.
   */
  low: {
    id: "7d3c9e2a-0b1f-4c5d-8e6f-1a2b3c4d5e06",
    tone: "neutral",
    locale: "fr",
    answers: answersFor({ acquisition: 2, activation: 2, retention: 2, referral: 2, revenue: 2 }),
    total: 0,
  },
  /**
   * A roast WITH a Deep dive (2026-10-02): the result header at its widest —
   * the language switch, the Deep dive tag and the roast badge on one row
   * beside the wordmark. Measured from 320px by e2e/result-header.spec.ts.
   */
  roastDeep: {
    id: "7d3c9e2a-0b1f-4c5d-8e6f-1a2b3c4d5e07",
    tone: "roast",
    locale: "fr",
    answers: answersFor({ acquisition: 1, activation: 0, retention: 2, referral: 0, revenue: 1 }),
    total: 54,
  },
} as const satisfies Record<string, RealResult>;

/**
 * A marker no page copy can contain, so finding it in a payload can only mean
 * a stored-only value crossed.
 */
export const SENTINEL = "e2e-stored-only-7d3c";

function verdict(tone: "neutral" | "roast"): DeepDiveVerdict {
  const line = (stage: string) => `The ${tone} Deep dive line for ${stage}.`;
  return {
    pillarRecommendations: {
      acquisition: line("acquisition"),
      activation: line("activation"),
      retention: line("retention"),
      referral: line("referral"),
      revenue: line("revenue"),
    },
    priorityAction: `The ${tone} Deep dive's one priority action.`,
    modelUsed: `${SENTINEL}-model`,
  };
}

/**
 * The Deep dive of `REAL_RESULTS.deep`, with the fields a document can hold
 * and the page must never carry: `modelUsed` on each verdict, and the two
 * legacy fields documents written before R2-20 still have — the context
 * answers and the founder's free text. The security review of A7.11 found
 * the payload guard blind to all three while every fixture had
 * `deepDive: null`.
 */
export const REAL_DEEP_DIVE: DeepDiveResult = {
  completed: true,
  freeContextProvided: true,
  contextAnswers: { "dd-channel": `${SENTINEL} context answer` },
  freeContext: `${SENTINEL} free text, a founder's own words`,
  locale: "en",
  verdicts: { neutral: verdict("neutral"), roast: verdict("roast") },
};

/**
 * A document that is deliberately NOT a submission — no pillars, no answers —
 * written straight into the collection, so reading it makes the page throw:
 * the one way left to exercise the product's error screen (REVIEW-02.md
 * R2-23) once CI has a Firestore that answers. Before the emulator, any
 * unknown id did it, because every read failed.
 */
export const MALFORMED_ID = "7d3c9e2a-0b1f-4c5d-8e6f-1a2b3c4d5e09";
