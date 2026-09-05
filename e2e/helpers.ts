import { expect, type Page, type Route } from "@playwright/test";

/**
 * Shared helpers for the critical-path specs.
 *
 * Every spec stubs `/api/submissions` rather than hitting the real one: CI
 * has no Firebase or Gemini credentials, and a test that depends on a live
 * Firestore write would be testing someone else's uptime. What these specs
 * exist to protect is the client flow — 15 answers in, a result page out,
 * answers never lost, attribution carried — all of which is entirely ours.
 */
export const QUESTION_COUNT = 15;

/** The stub's stand-in for a created submission. `/r/sample` is the one result page that renders without Firestore. */
export const CREATED_ID = "sample";
export const CREATED_OWNER_TOKEN = "e2e-owner-token";

export interface SubmissionCall {
  answers: Record<string, number>;
  tone: string;
  locale: string;
  refId: string | null;
}

/** Captures every POST /api/submissions and answers it with `status`. Returns the array the calls land in. */
export async function stubSubmissions(page: Page, status = 201): Promise<SubmissionCall[]> {
  const calls: SubmissionCall[] = [];
  await page.route("**/api/submissions", async (route: Route) => {
    calls.push(route.request().postDataJSON() as SubmissionCall);
    if (status !== 201) {
      await route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ error: "SCORING_FAILED" }) });
      return;
    }
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ id: CREATED_ID, ownerToken: CREATED_OWNER_TOKEN }),
    });
  });
  return calls;
}

/** Answers every remaining question by clicking its first option, leaving the flow on the tone selector. */
export async function answerAllQuestions(page: Page): Promise<void> {
  for (let i = 0; i < QUESTION_COUNT; i += 1) {
    await page.getByTestId("answer-option").first().click();
  }
  await page.getByTestId("get-score-cta").waitFor();
}

export async function readStoredAnswers(page: Page): Promise<Record<string, number>> {
  const raw = await page.evaluate(() => window.localStorage.getItem("tdg.quiz.answers.v1"));
  return raw ? (JSON.parse(raw) as Record<string, number>) : {};
}

export async function readStoredRefId(page: Page): Promise<string | null> {
  return page.evaluate(() => window.localStorage.getItem("tdg.quiz.refId.v1"));
}

/**
 * The landing captures `?ref=` in a `useEffect`, so it lands in localStorage
 * after hydration rather than on `load` — reading it straight after `goto()`
 * is a race. Poll instead of sleeping.
 */
export async function expectStoredRefId(page: Page, expected: string | null): Promise<void> {
  await expect.poll(() => readStoredRefId(page), { timeout: 5_000 }).toBe(expected);
}
