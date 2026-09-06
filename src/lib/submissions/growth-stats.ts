import { getDb } from "@/lib/firebase/admin";
import type { Locale } from "@/lib/i18n/locale";
import type { Tone } from "@/lib/quiz/tone";
import type { Submission } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface GrowthStats {
  totalSubmissions: number;
  last7Days: number;
  last30Days: number;
  byTone: Record<Tone, number>;
  byLocale: Record<Locale, number>;
  averageScore: number;
  /** Completed a Deep dive at all. */
  deepDiveCompleted: number;
  deepDiveCompletionRate: number; // 0..1, of totalSubmissions
  /** Of the Deep dive completions, how many included the optional free-text context (SPEC-ADDENDUM-02.md §1). */
  freeContextProvided: number;
  freeContextRate: number; // 0..1, of deepDiveCompleted
  /** SPEC.md §7: the growth-loop numbers. */
  referredSubmissions: number; // has a non-null refId — a "new analysis attributed to a ref"
  /**
   * Distinct results whose link brought in at least one submission. This is
   * what the dashboard used to call "unique sharers", and it is not that: a
   * result that was shared and converted nobody is invisible to Firestore,
   * so it was never counted (REVIEW-02.md R2-01).
   */
  convertingResults: number;
  /**
   * K-factor — REVIEW-02.md R2-01: referred submissions ÷ ALL submissions,
   * the standard definition (new users generated per existing user; every
   * result is a potential sharer). It lives in [0, ∞) and, for a product
   * like this one, mostly between 0 and 1.
   *
   * The previous formula divided by `convertingResults`. Since every
   * converting result contributes at least one referred submission, that
   * ratio is ≥ 1 whenever it is defined at all — it could never take a
   * value in the one range a real early-stage viral coefficient lives in,
   * and it was the number SPEC.md §1 says the project exists to quote.
   */
  kFactor: number;
  /** The old ratio, kept under its honest name: how many submissions a result brings in once it brings in any. */
  referralsPerConvertingResult: number;
}

function isWithin(createdAt: string, msAgo: number, now: number): boolean {
  const t = new Date(createdAt).getTime();
  return Number.isFinite(t) && now - t <= msAgo;
}

/**
 * The numbers behind /admin/stats, as a pure function of the submissions —
 * REVIEW-02.md R2-10 split this out of the Firestore read so the arithmetic
 * (the K-factor above all) is unit-tested; until then this file was imported
 * by no test at all, which is how R2-01 went unnoticed for a week.
 *
 * `now` is a parameter for the same reason: the 7- and 30-day windows have
 * to be testable against fixed dates.
 */
export function summarizeSubmissions(submissions: readonly Submission[], now: number = Date.now()): GrowthStats {
  const byTone: Record<Tone, number> = { neutral: 0, roast: 0 };
  const byLocale: Record<Locale, number> = { en: 0, fr: 0 };
  const referredByIds = new Set<string>();

  let last7Days = 0;
  let last30Days = 0;
  let totalScore = 0;
  let deepDiveCompleted = 0;
  let freeContextProvided = 0;
  let referredSubmissions = 0;

  for (const s of submissions) {
    byTone[s.tone] += 1;
    byLocale[s.locale] += 1;
    totalScore += s.total;

    if (isWithin(s.createdAt, 7 * DAY_MS, now)) last7Days += 1;
    if (isWithin(s.createdAt, 30 * DAY_MS, now)) last30Days += 1;

    if (s.deepDive) {
      deepDiveCompleted += 1;
      if (s.deepDive.freeContext) freeContextProvided += 1;
    }

    if (s.refId) {
      referredSubmissions += 1;
      referredByIds.add(s.refId);
    }
  }

  const totalSubmissions = submissions.length;
  const convertingResults = referredByIds.size;

  return {
    totalSubmissions,
    last7Days,
    last30Days,
    byTone,
    byLocale,
    averageScore: totalSubmissions ? totalScore / totalSubmissions : 0,
    deepDiveCompleted,
    deepDiveCompletionRate: totalSubmissions ? deepDiveCompleted / totalSubmissions : 0,
    freeContextProvided,
    freeContextRate: deepDiveCompleted ? freeContextProvided / deepDiveCompleted : 0,
    referredSubmissions,
    convertingResults,
    kFactor: totalSubmissions ? referredSubmissions / totalSubmissions : 0,
    referralsPerConvertingResult: convertingResults ? referredSubmissions / convertingResults : 0,
  };
}

/**
 * The actual numbers SPEC.md §1's success criterion asks for ("pouvoir
 * citer en entretien des chiffres réels — nombre d'analyses, taux de
 * partage, coefficient viral") plus a few more product-health signals.
 * GoatCounter (pageviews + the custom events in lib/analytics/goatcounter.ts)
 * covers traffic and click-through — it has no idea which submission
 * referred which, so K-factor and the referral counts can only come from
 * here, a full read of the `submissions` collection. Expected volume for a
 * side project is low enough that reading the whole collection and
 * aggregating in memory is the right amount of engineering; a Firestore
 * `count()` aggregation per number would cost more code than it saves.
 *
 * What Firestore cannot give is the number of SHARES, so "conversion per
 * share" (referred submissions ÷ share events) is computed in the dashboard
 * from the GoatCounter window alongside these numbers, not here.
 */
export async function computeGrowthStats(): Promise<GrowthStats> {
  const snapshot = await getDb().collection("submissions").get();
  return summarizeSubmissions(snapshot.docs.map((doc) => doc.data() as Submission));
}
