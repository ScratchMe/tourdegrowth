import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DeepDiveResult } from "../types";

// REVIEW-02.md R2-21: the one concurrency guard on the Deep dive write. The
// Firestore client is faked at the `getDb` boundary — what is under test is
// the check-and-set inside the transaction, not the SDK.
const update = vi.fn();
let existingDeepDive: unknown = null;

vi.mock("@/lib/firebase/admin", () => ({
  getDb: () => ({
    collection: () => ({ doc: (id: string) => ({ id }) }),
    runTransaction: async (fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        get: async () => ({ data: () => ({ deepDive: existingDeepDive }) }),
        update,
      }),
  }),
}));

const DEEP_DIVE = { completed: true, freeContextProvided: false, verdicts: {} } as unknown as DeepDiveResult;

describe("saveDeepDive", () => {
  beforeEach(() => {
    update.mockClear();
    existingDeepDive = null;
  });

  it("writes when the submission has no Deep dive yet", async () => {
    const { saveDeepDive } = await import("../repository");
    await expect(saveDeepDive("sub_1", DEEP_DIVE)).resolves.toBe("saved");
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({ id: "sub_1" }, { deepDive: DEEP_DIVE });
  });

  it("refuses to overwrite a Deep dive that landed first, and says so", async () => {
    existingDeepDive = { completed: true };
    const { saveDeepDive } = await import("../repository");
    await expect(saveDeepDive("sub_1", DEEP_DIVE)).resolves.toBe("already-present");
    expect(update).not.toHaveBeenCalled();
  });
});
