import { Button } from "tour-de-growth";

/* Labels are the product's own, from `dictionary.ts` — never `foo`/`test`:
   these cards are browsed by humans and imitated by the design agent. */

/** The three variants, in the order the system ranks them. */
export const Variants = () => (
  <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
    <Button variant="primary">Start your Tour →</Button>
    <Button variant="secondary">See a sample result</Button>
    <Button variant="quiet">Switch to straight up</Button>
  </div>
);

/** `lg` is the mobile scale; `fullWidth` is how the hero CTA ships on a phone. */
export const Sizes = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 320 }}>
    <Button variant="primary" size="md">
      Take your own Tour →
    </Button>
    <Button variant="primary" size="lg" fullWidth>
      Start your Tour →
    </Button>
  </div>
);

/**
 * `compact` is the header CTA — smaller inline sizing, and the only place the
 * product uses it. Hidden below 760px (R-21), so it is a desktop-only shape.
 */
export const Compact = () => (
  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
    <Button variant="primary" compact>
      Start your Tour →
    </Button>
    <Button variant="secondary" compact>
      How it works
    </Button>
  </div>
);

/**
 * The three states a still can show: resting, `loading` and disabled.
 * `loading` sets `aria-busy` and `disabled` together so the request cannot be
 * sent twice, keeps full opacity (busy is not broken) and adds an ellipsis to
 * the label — there is no spinner, the system has no icons. Disabled fades
 * and never lifts. Buttons only: a link is never "loading".
 */
export const States = () => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, max-content)", gap: 12, alignItems: "center" }}>
    <Button variant="primary">Get my score</Button>
    <Button variant="primary" loading>
      Get my score
    </Button>
    <Button variant="primary" disabled>
      Get my score
    </Button>
    <Button variant="secondary">Try again</Button>
    <Button variant="secondary" loading>
      Try again
    </Button>
    <Button variant="secondary" disabled>
      Try again
    </Button>
  </div>
);

/**
 * Hover and press, live — a screenshot cannot show them. Hover peels the
 * button up and to the left over a hard ink shadow; press flattens it back
 * onto the page. Neither happens on a touch screen, where a stuck hover would
 * read as a state. `quiet` keeps its underline as its only affordance.
 */
export const HoverAndPress = () => (
  <div style={{ display: "flex", gap: 16, alignItems: "center", padding: 8 }}>
    <Button variant="primary">Run the quarter</Button>
    <Button variant="secondary">See the data</Button>
    <Button variant="quiet">Switch to straight up</Button>
  </div>
);

/**
 * With `href` it renders an anchor instead of a button — same look. In the app
 * that is a Next `Link`; in the bundle it is the plain `<a href>` that Link
 * renders anyway (see `.design-sync/shims/next-link.tsx`).
 */
export const AsLink = () => (
  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
    <Button variant="primary" href="/quiz">
      Start your Tour →
    </Button>
    <Button variant="quiet" href="/en/glossary">
      Glossary
    </Button>
  </div>
);
