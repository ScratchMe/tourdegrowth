import { Button, DetourCard } from "tour-de-growth";

/*
 * The detour family: one card for every screen where the reader did not get
 * what they came for. Two temperatures, and the difference is whose fault it
 * is — which is why a 404 is NEVER `fault`: the reader is lost, not broken,
 * and the red would blame them.
 *
 * The action always sits BELOW the card, never inside it.
 */

const body = { margin: 0, font: "15px/1.5 Inter, sans-serif" } as const;
const wrap = { maxWidth: 440, display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" } as const;

/** `wrongTurn` — ink on paper. An address that names nothing. */
export const WrongTurn = () => (
  <div style={wrap}>
    <DetourCard tone="wrongTurn" eyebrow="Detour" title="This page doesn't exist.">
      <p style={body}>
        The address may be mistyped, or the page may have moved. Everything else is still where
        you left it.
      </p>
    </DetourCard>
    <Button variant="primary" href="/en">Back to Tour de Growth →</Button>
  </div>
);

/** A shared result id that names nothing gets its own eyebrow, same tone. */
export const LostResult = () => (
  <div style={wrap}>
    <DetourCard tone="wrongTurn" eyebrow="Lost result" title="No result at this address.">
      <p style={body}>
        This link may have been mistyped, or the result it pointed to is gone. You can still run
        your own Tour — it takes three minutes.
      </p>
    </DetourCard>
    <Button variant="primary" href="/quiz">Start your Tour →</Button>
  </div>
);

/**
 * `fault` — the only red-shadowed card in the system, reserved for OUR
 * failures. It is also what receives focus when a flow fails (REVIEW.md R-19),
 * so pass a ref and `tabIndex={-1}` when you mount it in an error boundary.
 */
export const Fault = () => (
  <div style={wrap}>
    <DetourCard tone="fault" eyebrow="Detour" title={"Your results took\na wrong turn."} headingLevel="h2">
      <p style={body}>Something broke on our end — try again in a moment.</p>
    </DetourCard>
    <Button variant="primary">Try again</Button>
  </div>
);
