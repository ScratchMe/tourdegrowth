import { describe, expect, it } from "vitest";
import { isSegmentAnswers, segmentDetail, segmentId } from "../segment";

describe("segmentId (REVIEW-02.md R2-26)", () => {
  it("joins the two axes into a Firestore-safe document id", () => {
    expect(segmentId({ stage: "first-customers", model: "b2b" })).toBe("first-customers__b2b");
    expect(segmentId({ stage: "pre-launch", model: "marketplace" })).toBe("pre-launch__marketplace");
  });

  it("never contains a slash, which Firestore forbids in a document id", () => {
    for (const stage of ["pre-launch", "first-customers", "scaling", "established"] as const) {
      for (const model of ["b2b", "b2c", "marketplace"] as const) {
        expect(segmentId({ stage, model })).not.toContain("/");
      }
    }
  });

  it("refuses a half-known segment — averaging those defeats the point", () => {
    expect(segmentId({ stage: "unknown", model: "b2b" })).toBeNull();
    expect(segmentId({ stage: "scaling", model: "unknown" })).toBeNull();
    expect(segmentId({ stage: "unknown", model: "unknown" })).toBeNull();
    expect(segmentId(null)).toBeNull();
  });
});

describe("isSegmentAnswers", () => {
  it("accepts every real pair, including the explicit refusals", () => {
    expect(isSegmentAnswers({ stage: "scaling", model: "b2c" })).toBe(true);
    expect(isSegmentAnswers({ stage: "unknown", model: "unknown" })).toBe(true);
  });

  it("rejects anything that isn't one of the known values", () => {
    for (const bad of [null, undefined, "b2b", 3, {}, { stage: "scaling" }, { stage: "huge", model: "b2b" }, { stage: "scaling", model: "b2g" }]) {
      expect(isSegmentAnswers(bad), JSON.stringify(bad)).toBe(false);
    }
  });
});

/**
 * The detail on the `segment_answered` event — REVIEW-02.md R2-26. Both
 * questions default to "rather not say", so this is the only thing that will
 * say whether an extra screen in a flow sold as "3 minutes" is earning its
 * place, or whether everyone is clicking straight past it.
 */
describe("segmentDetail", () => {
  it("names exactly which axes were answered", () => {
    expect(segmentDetail({ stage: "scaling", model: "b2b" })).toBe("both");
    expect(segmentDetail({ stage: "scaling", model: "unknown" })).toBe("stage");
    expect(segmentDetail({ stage: "unknown", model: "b2c" })).toBe("model");
    expect(segmentDetail({ stage: "unknown", model: "unknown" })).toBe("neither");
  });
});
