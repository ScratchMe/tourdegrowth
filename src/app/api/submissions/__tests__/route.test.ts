import { beforeEach, describe, expect, it, vi } from "vitest";
import { QUESTIONS } from "@/content/copy-library";
import type { Submission } from "@/lib/submissions/types";

const saveSubmission = vi.fn<(submission: Submission) => Promise<void>>(async () => {});
const submissionExists = vi.fn<(id: string) => Promise<boolean>>(async () => true);

vi.mock("@/lib/submissions/repository", () => ({
  saveSubmission: (submission: Submission) => saveSubmission(submission),
  submissionExists: (id: string) => submissionExists(id),
}));

const { POST } = await import("../route");

const REAL_REF = "8a2b1c3d-4e5f-4a6b-9c8d-0e1f2a3b4c5d";
const validAnswers = Object.fromEntries(QUESTIONS.map((q) => [q.id, 1]));

function call(body: unknown) {
  return POST(
    new Request("https://tourdegrowth.com/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

const validBody = { answers: validAnswers, tone: "neutral", locale: "en" };

/** REVIEW.md R-04 (payload contract, error surface) and R-03 (ref attribution). */
describe("POST /api/submissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    submissionExists.mockResolvedValue(true);
    saveSubmission.mockResolvedValue(undefined);
  });

  it("scores a valid submission and returns only the id and the owner token", async () => {
    const res = await call(validBody);
    const payload = await res.json();

    expect(res.status).toBe(201);
    expect(Object.keys(payload).sort()).toEqual(["id", "ownerToken"]);
    expect(typeof payload.ownerToken).toBe("string");
    expect(saveSubmission).toHaveBeenCalledTimes(1);
  });

  it("rejects an incomplete answer set instead of failing later in scoring", async () => {
    const [first] = QUESTIONS;
    const res = await call({ ...validBody, answers: { [first!.id]: 1 } });

    expect(res.status).toBe(400);
    expect(saveSubmission).not.toHaveBeenCalled();
  });

  it("rejects an unknown question id rather than storing it verbatim", async () => {
    const res = await call({ ...validBody, answers: { ...validAnswers, "not-a-question": 1 } });

    expect(res.status).toBe(400);
    expect(saveSubmission).not.toHaveBeenCalled();
  });

  it("rejects an out-of-range answer value", async () => {
    const [first] = QUESTIONS;
    const res = await call({ ...validBody, answers: { ...validAnswers, [first!.id]: 7 } });

    expect(res.status).toBe(400);
    expect(saveSubmission).not.toHaveBeenCalled();
  });

  it("keeps rejecting a bad tone or locale", async () => {
    expect((await call({ ...validBody, tone: "sarcastic" })).status).toBe(400);
    expect((await call({ ...validBody, locale: "de" })).status).toBe(400);
    expect(saveSubmission).not.toHaveBeenCalled();
  });

  it("attributes a ref that names a real submission", async () => {
    await call({ ...validBody, refId: REAL_REF });

    expect(submissionExists).toHaveBeenCalledWith(REAL_REF);
    expect(saveSubmission.mock.calls[0]?.[0].refId).toBe(REAL_REF);
  });

  it("drops a made-up ref without spending a lookup, and still scores", async () => {
    const res = await call({ ...validBody, refId: "hello" });

    expect(res.status).toBe(201);
    expect(submissionExists).not.toHaveBeenCalled();
    expect(saveSubmission.mock.calls[0]?.[0].refId).toBeNull();
  });

  it("drops a well-formed ref that names nothing, and still scores", async () => {
    submissionExists.mockResolvedValue(false);

    const res = await call({ ...validBody, refId: REAL_REF });

    expect(res.status).toBe(201);
    expect(saveSubmission.mock.calls[0]?.[0].refId).toBeNull();
  });

  it("never forwards an internal failure's message to the browser", async () => {
    saveSubmission.mockRejectedValue(new Error("7 PERMISSION_DENIED: Missing or insufficient permissions."));

    const res = await call(validBody);
    const payload = await res.json();

    expect(res.status).toBe(502);
    expect(payload).toEqual({ error: "SCORING_FAILED" });
    expect(JSON.stringify(payload)).not.toContain("PERMISSION_DENIED");
  });

  it("rejects a body that isn't JSON", async () => {
    const res = await POST(
      new Request("https://tourdegrowth.com/api/submissions", { method: "POST", body: "not json" }),
    );
    expect(res.status).toBe(400);
  });
});
