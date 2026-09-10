import { ErrorScreen } from "tour-de-growth";

/*
 * The whole error page — a `fault` DetourCard plus the site footer, so a
 * reader who lands here still has somewhere to go.
 *
 * It is what Next's error boundaries render, which is why it takes an `Error`
 * and a `reset`: the button re-renders the segment that threw rather than
 * reloading the document.
 *
 * The technical message is never shown in place of the reassurance — Next's
 * `digest` prints small underneath, so support has something to search on
 * without the reader being handed a stack trace.
 */

const boom = () => {
  const e = new Error("SCORING_FAILED") as Error & { digest?: string };
  e.digest = "3491882057";
  return e;
};

/** As it ships. */
export const English = () => <ErrorScreen locale="en" error={boom()} reset={() => {}} />;

/** In French. */
export const French = () => <ErrorScreen locale="fr" error={boom()} reset={() => {}} />;

/** Without a digest — nothing prints under the card. */
export const NoDigest = () => (
  <ErrorScreen locale="en" error={new Error("Request failed (500)")} reset={() => {}} />
);
