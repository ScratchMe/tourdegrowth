import { SEGMENT_MODELS, SEGMENT_STAGES, type SegmentModel, type SegmentStage } from "@/content/segments";

/**
 * Who a submission is comparable to — REVIEW-02.md R2-26.
 *
 * Pure and separate from both the screen and Firestore, because the two
 * things worth testing here are the id shape (it becomes a document id, and
 * a change to it silently orphans every aggregate already written) and the
 * rule that an incomplete answer produces no segment at all.
 */
export interface SegmentAnswers {
  stage: SegmentStage;
  model: SegmentModel;
}

const STAGES = new Set(SEGMENT_STAGES.map((o) => o.value));
const MODELS = new Set(SEGMENT_MODELS.map((o) => o.value));

export function isSegmentAnswers(value: unknown): value is SegmentAnswers {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return STAGES.has(v.stage as SegmentStage) && MODELS.has(v.model as SegmentModel);
}

/**
 * The aggregate document id for a segment, or `null` when either axis is
 * unanswered — a half-known segment is not a segment, and averaging
 * "B2B, stage unknown" would put a pre-launch prototype next to a scale-up,
 * which is the exact thing this feature exists to stop.
 *
 * Firestore document ids may not contain `/`, hence the `__` join rather
 * than a path-like separator.
 */
export function segmentId(segment: SegmentAnswers | null): string | null {
  if (!segment || segment.stage === "unknown" || segment.model === "unknown") return null;
  return `${segment.stage}__${segment.model}`;
}

/**
 * Which axes were actually answered, as the `segment_answered` event detail
 * (REVIEW-02.md R2-26). Both questions default to "rather not say", so this
 * is what tells us whether the extra screen is earning its place.
 */
export function segmentDetail(segment: SegmentAnswers): "both" | "stage" | "model" | "neither" {
  const hasStage = segment.stage !== "unknown";
  const hasModel = segment.model !== "unknown";
  if (hasStage && hasModel) return "both";
  if (hasStage) return "stage";
  if (hasModel) return "model";
  return "neither";
}
