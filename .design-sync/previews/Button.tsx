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
