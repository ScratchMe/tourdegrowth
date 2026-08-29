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
  uniqueSharers: number; // distinct refId values referenced by >=1 submission — "partageurs uniques"
  kFactor: number; // referredSubmissions / uniqueSharers, 0 when there are no sharers yet
}

function isWithin(createdAt: string, msAgo: number, now: number): boolean {
  const t = new Date(createdAt).getTime();
  return Number.isFinite(t) && now - t <= msAgo;
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
 * aggregating in memory (rather than maintaining separate counter
 * documents) is the right amount of engineering for this.
 */
export async function computeGrowthStats(): Promise<GrowthStats> {
  const snapshot = await getDb().collection("submissions").get();
  const submissions = snapshot.docs.map((doc) => doc.data() as Submission);

  const now = Date.now();
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
  const uniqueSharers = referredByIds.size;

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
    uniqueSharers,
    kFactor: uniqueSharers ? referredSubmissions / uniqueSharers : 0,
  };
}
