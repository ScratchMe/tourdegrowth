import { Button, Disclaimer } from "tour-de-growth";

/*
 * The quiet line under a call to action. On the result screen it carries the
 * standing promise that this is a fast estimate rather than an audit, with
 * "How it works" as a real link into the page that explains the arithmetic.
 *
 * Not for error text: an error is a DetourCard.
 */

/** `left` sits under a desktop button row. */
export const Left = () => (
  <div style={{ maxWidth: 420, display: "flex", flexDirection: "column", gap: 12 }}>
    <div style={{ display: "flex", gap: 12 }}>
      <Button variant="primary">Take your own Tour →</Button>
      <Button variant="secondary">Share this result</Button>
    </div>
    <Disclaimer align="left">
      A quick estimate, not an audit — see <a href="/en/how-it-works">How it works</a>.
    </Disclaimer>
  </div>
);

/** `center` sits under stacked mobile buttons. */
export const Center = () => (
  <div style={{ maxWidth: 320, display: "flex", flexDirection: "column", gap: 12 }}>
    <Button variant="primary" fullWidth size="lg">Take your own Tour →</Button>
    <Disclaimer align="center">
      A quick estimate, not an audit — see <a href="/en/how-it-works">How it works</a>.
    </Disclaimer>
  </div>
);

/** In French, which runs a little longer and still holds one line on desktop. */
export const French = () => (
  <div style={{ maxWidth: 420 }}>
    <Disclaimer align="left">
      Estimation rapide, pas un audit — voir <a href="/fr/how-it-works">How it works</a>.
    </Disclaimer>
  </div>
);
