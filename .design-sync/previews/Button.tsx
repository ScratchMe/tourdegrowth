import { Button } from "tour-de-growth";

/* Labels are the product's own — `dictionary.ts`, the engine's and the game's
   copy — each on the variant it ships as, never `foo`/`test`: these cards are
   browsed by humans and imitated by the design agent. */

/** The three variants, in the order the system ranks them, with the landing's labels: its hero's two buttons (which ship `lg`) and a header link. */
export const Variants = () => (
  <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
    <Button variant="primary">Start your Tour →</Button>
    <Button variant="secondary">See a sample result</Button>
    <Button variant="quiet">How it works</Button>
  </div>
);

/**
 * `md` (15px, the default) — a shared result's "Take your own Tour →". `lg`
 * (17px) is the large CTA, and `fullWidth` stretches it across its column, as
 * the quiz's last step ships at every width.
 */
export const Sizes = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12, width: 320 }}>
    <Button variant="primary" size="md">
      Take your own Tour →
    </Button>
    <Button variant="primary" size="lg" fullWidth>
      Get your score →
    </Button>
  </div>
);

/**
 * `sm` — the smaller label (13px) and padding: the landing header's CTA,
 * set here as in that header, after its two quiet links. The page hides the
 * CTA and the links below 760px (R-21), an @media rule a still cannot show.
 * The engine's quiet actions beside its sliders are `sm` too (see Quiet).
 */
export const Small = () => (
  <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
    <Button variant="quiet" href="/en/glossary">
      Glossary
    </Button>
    <Button variant="quiet" href="/en/how-it-works">
      How it works
    </Button>
    <Button variant="primary" size="sm" href="/quiz">
      Start your Tour →
    </Button>
  </div>
);

/**
 * `quiet` is the system's one text button. Drawn as a line of text — 31px,
 * 29px at `sm`, which the growth engine uses for the small actions
 * beside its sliders and fields — and TAPPED on a 44px strip centred on it,
 * which moves nothing around it. Keep the room above and below: it is where
 * the taps land.
 */
export const Quiet = () => (
  <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
    <Button variant="quiet">How it works</Button>
    <Button variant="quiet" size="sm">
      Back to today
    </Button>
    <Button variant="quiet" size="sm">
      I only have the rate
    </Button>
  </div>
);

/**
 * Resting, `loading` and disabled, as the engine's slide deck shows them: at
 * rest; then while one slide's image is being made — that button `loading`
 * (full opacity, an ellipsis after the label: there is no spinner, the system
 * has no icons), the other export disabled (faded) until it is done. `loading`
 * sets `aria-busy` and `disabled` together so the request cannot be sent
 * twice. Buttons only: a link is never "loading".
 */
export const States = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Button variant="secondary">Image (PNG)</Button>
      <Button variant="quiet">Copy image</Button>
    </div>
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Button variant="secondary" loading>
        Image (PNG)
      </Button>
      <Button variant="quiet" disabled>
        Copy image
      </Button>
    </div>
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Button variant="secondary" disabled>
        Image (PNG)
      </Button>
      <Button variant="quiet" loading>
        Copy image
      </Button>
    </div>
  </div>
);

/**
 * Hover and press, live — a screenshot shows them at rest. Hover peels the
 * button up and to the left over a hard ink shadow; press flattens it back
 * onto the page. Neither happens on a touch screen, where a stuck hover would
 * read as a state. `quiet` has no box to lift: hover inks it and thickens its
 * underline, press draws the underline in against the letters. The game's
 * labels: its run button, and the replay and share pair of its last screen.
 */
export const HoverAndPress = () => (
  <div style={{ display: "flex", gap: 16, alignItems: "center", padding: 8 }}>
    <Button variant="primary">Run the quarter</Button>
    <Button variant="secondary">Replay the year</Button>
    <Button variant="quiet">Copy a link with your result</Button>
  </div>
);

/**
 * With `href` it renders an anchor instead of a button — same look. In the app
 * that is a Next `Link` (or a plain `<a>` with `hard`, for a link that crosses
 * a root layout); in the bundle it is the plain `<a href>` that Link renders
 * anyway (see `.design-sync/shims/next-link.tsx`).
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
