/*
 * What a failed request of the quiz or the Deep dive tells its reader
 * (CHANTIERS.md A15.4, 2026-10-01). Pure, and safe in the browser and on the
 * server alike: nothing here reads `window`.
 *
 * Two things the error screens got wrong, and one they got right:
 * - the sentence was the same for every failure — « try again in a moment »,
 *   even after the hourly limit, where the moment is up to an hour, and even
 *   when it was the reader's own connection that dropped;
 * - the "code" under it was whatever the request threw: `Failed to fetch`,
 *   `Request failed (504)`, or a route's English validation sentence;
 * - and REVIEW.md R-04 is kept: a short stable code stays on screen, in
 *   small mono, for support — never an internal message.
 */

export type RequestFailure =
  | { kind: "server"; code: string }
  | { kind: "offline"; code: "NETWORK" }
  | { kind: "rate-limited"; code: string; retryAfterMinutes: number };

/** A code our routes send on purpose (`SCORING_FAILED`, `RATE_LIMITED`…), as opposed to a sentence. */
const STABLE_CODE = /^[A-Z][A-Z0-9_]{2,39}$/;

/** The limit's window: what to say when a 429 comes without a usable `Retry-After`. */
const DEFAULT_WAIT_MINUTES = 60;

/** A response that is not ok, read into what the reader is told. */
export function failureFromResponse(status: number, body: unknown, retryAfter: string | null): RequestFailure {
  const raw = (body as { error?: unknown } | null)?.error;
  const code = typeof raw === "string" && STABLE_CODE.test(raw) ? raw : `HTTP_${status}`;
  if (status === 429) {
    const seconds = Number(retryAfter);
    const minutes = retryAfter !== null && Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds / 60) : DEFAULT_WAIT_MINUTES;
    return { kind: "rate-limited", code, retryAfterMinutes: minutes };
  }
  return { kind: "server", code };
}

/** Thrown by `requestOrFail`, so the page's `catch` knows the request failed rather than its own code. */
export class RequestFailedError extends Error {
  constructor(readonly failure: RequestFailure) {
    super(failure.code);
    this.name = "RequestFailedError";
  }
}

/**
 * `fetch`, failing with a `RequestFailedError` the page can word: `offline`
 * when no answer came back at all (`fetch` itself rejected), otherwise what
 * the response says.
 */
export async function requestOrFail(input: string, init: RequestInit): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(input, init);
  } catch {
    throw new RequestFailedError({ kind: "offline", code: "NETWORK" });
  }
  if (!res.ok) {
    const body: unknown = await res.json().catch(() => null);
    throw new RequestFailedError(failureFromResponse(res.status, body, res.headers.get("Retry-After")));
  }
  return res;
}

/** Whatever a page's `catch` received, as a failure: anything that is not ours is a server-side one. */
export function failureOf(err: unknown): RequestFailure {
  if (err instanceof RequestFailedError) return err.failure;
  return { kind: "server", code: "UNKNOWN" };
}

/**
 * The sentence under the error card's title. The words come from the page
 * (`UI_STRINGS.quiz`), so this module stays free of the dictionary; `{m}` is
 * the wait in minutes.
 */
export function failureSentence(
  failure: RequestFailure | null,
  words: { body: string; offline: string; rateLimited: string },
): string {
  if (failure?.kind === "offline") return words.offline;
  if (failure?.kind === "rate-limited") return words.rateLimited.replace("{m}", String(failure.retryAfterMinutes));
  return words.body;
}
