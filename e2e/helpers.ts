import { expect, test as base, type APIRequestContext, type Page, type Route } from "@playwright/test";

/**
 * Every spec runs with GoatCounter's script replaced by a local stub that
 * records the events the app fires into `window.__tdgEvents`.
 *
 * Two reasons this is a fixture rather than per-spec setup. It keeps CI
 * offline — no spec ever reaches out to gc.zgo.at, so a CDN hiccup can't
 * slow or fail a run. And it makes analytics assertions real: the workflow
 * sets `NEXT_PUBLIC_GOATCOUNTER_CODE` at build time so the script tag is
 * actually rendered, without which `trackEvent` no-ops and any assertion
 * about it would pass while proving nothing (a trap already hit once while
 * verifying the site footer).
 */
const GOATCOUNTER_STUB = `
  window.__tdgEvents = [];
  window.goatcounter = { count: function (o) { window.__tdgEvents.push(o.path); } };
`;

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route("**/count.js", (route) =>
      route.fulfill({ status: 200, contentType: "application/javascript", body: GOATCOUNTER_STUB }),
    );
    await use(page);
  },
});

export { expect };

/** The GoatCounter event paths fired so far, in order. */
export async function trackedEvents(page: Page): Promise<string[]> {
  return page.evaluate(() => (window as unknown as { __tdgEvents?: string[] }).__tdgEvents ?? []);
}

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
/** The score the stub reports back — kept on the device so the landing can offer it again (REVIEW.md R-20). */
export const CREATED_TOTAL = 74;

export interface SubmissionCall {
  answers: Record<string, number>;
  tone: string;
  locale: string;
  refId: string | null;
  /** REVIEW-02.md R2-26 — stage and business model, both possibly "unknown". */
  segment: { stage: string; model: string } | null;
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
      body: JSON.stringify({ id: CREATED_ID, ownerToken: CREATED_OWNER_TOKEN, total: CREATED_TOTAL }),
    });
  });
  return calls;
}

/** Answers the 15 questions and stops on the context screen (REVIEW-02.md R2-26). */
export async function answerQuestionsOnly(page: Page): Promise<void> {
  for (let i = 0; i < QUESTION_COUNT; i += 1) {
    await page.getByTestId("answer-option").first().click();
  }
  await page.getByTestId("segment-screen").waitFor();
}

/**
 * Gets the flow from the first question to the tone selector, which is what
 * every spec that isn't about the context screen wants.
 *
 * Since R2-26 that means passing one screen the questionnaire does not own:
 * two optional context questions, both defaulting to "rather not say", so
 * pressing Continue without touching them is a complete answer. Specs that
 * need to assert on that screen use `answerQuestionsOnly` and drive it
 * themselves.
 */
export async function answerAllQuestions(page: Page): Promise<void> {
  await answerQuestionsOnly(page);
  await page.getByTestId("segment-continue").click();
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

/**
 * Marks this browser as the owner of a result, the way completing a Tour
 * would (REVIEW.md R-01). Needed by anything that exercises the Deep dive,
 * which redirects a non-owner away before rendering a single question.
 */
export async function seedOwnedResult(page: Page, id = CREATED_ID, total = CREATED_TOTAL): Promise<void> {
  await page.evaluate(
    ([resultId, score]) => {
      window.localStorage.setItem(
        "tdg.results.v1",
        JSON.stringify([
          { id: resultId, ownerToken: "e2e-owner-token", createdAt: "2026-09-05T10:00:00.000Z", total: score },
        ]),
      );
    },
    [id, total] as [string, number],
  );
}

/**
 * Captures every POST to the Deep dive route and answers it with `status`.
 *
 * Stubbed rather than called for real, like `/api/submissions`: CI has no
 * Gemini key, and a Deep dive is four real generations. What these specs
 * protect is the client's behaviour when that call fails — which is not
 * hypothetical, a live run has seen production return `DEEP_DIVE_FAILED`
 * because Gemini itself was returning 503s.
 */
export async function stubDeepDive(page: Page, status = 200): Promise<Record<string, unknown>[]> {
  const calls: Record<string, unknown>[] = [];
  await page.route("**/api/submissions/*/deep-dive", async (route: Route) => {
    calls.push(route.request().postDataJSON() as Record<string, unknown>);
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(status === 200 ? { id: CREATED_ID } : { error: "DEEP_DIVE_FAILED" }),
    });
  });
  return calls;
}


/**
 * The admin routes sit behind Basic Auth in `proxy.ts`, which FAILS CLOSED:
 * with no `ADMIN_DASHBOARD_PASSWORD` in the server's environment, every
 * `/admin/*` request is a 401 for everyone, by design (CLAUDE.md, 2026-08-29).
 *
 * So an admin spec can only be meaningful when the server under test has that
 * variable. CI sets it at the workflow level, like `NEXT_PUBLIC_GOATCOUNTER_CODE`.
 * Locally, without it, these specs SKIP with a message that says how to run
 * them — never falsely green (the R-11 trap, where an assertion passed while
 * proving nothing) and never falsely red (its R2-26 mirror, where a missing
 * build-time variable made healthy specs fail).
 */
export const ADMIN_PASSWORD = process.env.ADMIN_DASHBOARD_PASSWORD ?? "";

export const adminCredentials = { username: "admin", password: ADMIN_PASSWORD };

export const SKIP_ADMIN_REASON =
  "ADMIN_DASHBOARD_PASSWORD is not set — /admin/* is 401 for everyone (fail-closed). Build and start with it set to run these.";

/**
 * Opens the game or the engine — both ship closed — for ONE request context,
 * the owner's way: `POST /admin/preview?<feature>=on` with the admin password
 * (`lib/owner-preview.ts`, 2026-09-25). The proxy answers with a signed,
 * HttpOnly cookie, which lands in the jar of `request` — pass
 * `context.request` to open the feature for that browser context's pages.
 *
 * Replaces the public `?engine=preview` / `?game=preview` these specs used
 * to append: that parameter is inert now, and a spec that still relied on it
 * would 404 rather than pass on nothing. Needs `ADMIN_PASSWORD`, so a spec
 * that calls it skips with `SKIP_ADMIN_REASON` without one, like the admin
 * specs.
 */
export async function grantOwnerPreview(
  request: APIRequestContext,
  ...features: ("game" | "engine")[]
): Promise<void> {
  const query = features.map((feature) => `${feature}=on`).join("&");
  const res = await request.post(`/admin/preview?${query}`, {
    headers: { authorization: `Basic ${Buffer.from(`admin:${ADMIN_PASSWORD}`).toString("base64")}` },
    maxRedirects: 0,
  });
  expect(res.status(), "POST /admin/preview must answer 303 — is ADMIN_DASHBOARD_PASSWORD set on the server?").toBe(303);
}
