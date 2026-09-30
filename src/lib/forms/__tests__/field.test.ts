import { describe, expect, it } from "vitest";
import { COUNT_REVEAL, describedByIds, fieldStatus, shouldShowCount } from "../field";

describe("fieldStatus", () => {
  it("says nothing when there is nothing to say", () => {
    expect(fieldStatus({})).toBeUndefined();
    expect(fieldStatus({ error: "", missing: null })).toBeUndefined();
  });

  it("lets invalid win over missing: one blocks the save, the other does not", () => {
    expect(fieldStatus({ error: "That isn't a readable number.", missing: "Still to fill in" })).toBe("invalid");
    expect(fieldStatus({ missing: "Still to fill in" })).toBe("missing");
  });
});

describe("shouldShowCount (extension 04, Q5)", () => {
  it("shows a one-line field's count from 80% of its limit, and not before", () => {
    expect(COUNT_REVEAL).toBe(0.8);
    expect(shouldShowCount(47, 60)).toBe(false);
    expect(shouldShowCount(48, 60)).toBe(true);
    expect(shouldShowCount(75, 60)).toBe(true);
  });

  it("never shows « 0/60 » on an empty field, and nothing without a limit", () => {
    expect(shouldShowCount(0, 60)).toBe(false);
    expect(shouldShowCount(500, undefined)).toBe(false);
  });

  it("rounds the threshold up, so a short limit still waits for the last fifth", () => {
    // 80% of 7 is 5.6: the count shows at 6, not at 5.
    expect(shouldShowCount(5, 7)).toBe(false);
    expect(shouldShowCount(6, 7)).toBe(true);
  });
});

describe("describedByIds", () => {
  it("keeps the order it is given — message, hint, count — and drops what is missing", () => {
    expect(describedByIds("f-message", "f-hint", "f-count")).toBe("f-message f-hint f-count");
    expect(describedByIds(undefined, "f-hint", null, false, "")).toBe("f-hint");
  });

  it("is undefined rather than an empty attribute when nothing describes the control", () => {
    expect(describedByIds()).toBeUndefined();
    expect(describedByIds(undefined, "")).toBeUndefined();
  });
});
