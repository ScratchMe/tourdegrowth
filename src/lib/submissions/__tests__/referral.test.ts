import { describe, expect, it, vi } from "vitest";
import { isValidSubmissionId, resolveRefId } from "../referral";

const REAL_ID = "3f1c2a7e-9b4d-4e21-a8c6-5d0f9e7b1234";
const OTHER_REAL_ID = "8a2b1c3d-4e5f-4a6b-9c8d-0e1f2a3b4c5d";

/** REVIEW.md R-03 — anything accepted here ends up in the K-factor. */
describe("isValidSubmissionId", () => {
  it("accepts an id of the shape crypto.randomUUID() produces", () => {
    expect(isValidSubmissionId(REAL_ID)).toBe(true);
    expect(isValidSubmissionId(crypto.randomUUID())).toBe(true);
  });

  it("rejects hand-typed or made-up refs", () => {
    expect(isValidSubmissionId("hello")).toBe(false);
    expect(isValidSubmissionId("sub_123")).toBe(false);
    expect(isValidSubmissionId("")).toBe(false);
    expect(isValidSubmissionId("../../etc/passwd")).toBe(false);
  });

  it("rejects a UUID that isn't v4", () => {
    // v1 (time-based): version nibble is 1, not 4.
    expect(isValidSubmissionId("3f1c2a7e-9b4d-1e21-a8c6-5d0f9e7b1234")).toBe(false);
  });

  it("rejects non-strings", () => {
    expect(isValidSubmissionId(undefined)).toBe(false);
    expect(isValidSubmissionId(null)).toBe(false);
    expect(isValidSubmissionId(42)).toBe(false);
    expect(isValidSubmissionId({ id: REAL_ID })).toBe(false);
  });
});

describe("resolveRefId", () => {
  it("keeps a well-formed ref that names a real submission", async () => {
    const exists = vi.fn(async () => true);
    expect(await resolveRefId(REAL_ID, exists)).toBe(REAL_ID);
    expect(exists).toHaveBeenCalledWith(REAL_ID);
  });

  it("drops a well-formed ref that names nothing", async () => {
    expect(await resolveRefId(OTHER_REAL_ID, async () => false)).toBeNull();
  });

  it("never spends a Firestore read on a malformed ref", async () => {
    const exists = vi.fn(async () => true);

    expect(await resolveRefId("hello", exists)).toBeNull();
    expect(await resolveRefId(null, exists)).toBeNull();
    expect(await resolveRefId(undefined, exists)).toBeNull();

    expect(exists).not.toHaveBeenCalled();
  });

  it("drops the ref rather than failing the submission when the lookup errors", async () => {
    const exists = async () => {
      throw new Error("Firestore unavailable");
    };
    await expect(resolveRefId(REAL_ID, exists)).resolves.toBeNull();
  });
});
