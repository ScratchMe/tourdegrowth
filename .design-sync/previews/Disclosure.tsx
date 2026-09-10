import { Disclosure, MetaLabel } from "tour-de-growth";

/*
 * A native <details>. The marker is a `+` / `−` glyph inside a mono bullet —
 * the bullet is the affordance, the glyph is the state — because this product
 * has no icon files at all (DESIGN-BRIEF.md, "Assets"). The glyph lives in a
 * ::before so a screen reader announces <details>'s own open state and not a
 * stray plus sign.
 *
 * Its one use in the product is the score breakdown, which is why `size="sm"`
 * exists: a top-level row opens onto nested rows one step quieter.
 *
 * `rule` DEFAULTS TO TRUE — a bare <Disclosure> draws the dashed line above
 * itself. Pass `rule={false}` to suppress it.
 */

const line = { margin: "8px 0 0", font: "15px/1.5 Inter, sans-serif" } as const;
const answer = { margin: "6px 0 0", font: "14px/1.5 Inter, sans-serif", color: "#57534e" } as const;

/** A top-level row: `rule` draws the dashed line above, so it reads as a quiet divider when closed. */
export const TopLevel = () => (
  <div style={{ maxWidth: 460 }}>
    <Disclosure rule summary="How this score is calculated">
      <p style={line}>Three questions per stage. Your answers, and what each one was worth.</p>
    </Disclosure>
  </div>
);

/*
 * Opened, which is the only way a static card can show what the panel holds
 * and what the marker looks like in its `−` state. `open` is the native
 * <details> attribute: DisclosureProps does not declare it — the browser owns
 * the open state — but it still reaches the element through the component's
 * `...rest`. In the product nobody passes it; the user clicks.
 */
export const Open = () => (
  <div style={{ maxWidth: 460 }}>
    <Disclosure rule summary="How this score is calculated" open>
      <p style={line}>Three questions per stage. Your answers, and what each one was worth.</p>
    </Disclosure>
  </div>
);

/**
 * Nested, which is the shape the breakdown actually ships: each pillar head
 * carries its own arithmetic, and the three answers behind it are `sm`.
 * Shown open so both levels are visible at once.
 */
export const Nested = () => (
  <div style={{ maxWidth: 460 }}>
    <Disclosure
      rule
      open
      summary={
        <span style={{ display: "flex", justifyContent: "space-between", width: "100%", gap: 12 }}>
          <span>Retention</span>
          <MetaLabel size="xs" tone="muted">27/60 → 9/20</MetaLabel>
        </span>
      }
    >
      <Disclosure size="sm" summary="Do you track a retention rate (D7/D30 or similar)?">
        <p style={answer}>We can pull it, but rarely look — 7 pts</p>
      </Disclosure>
      <Disclosure size="sm" summary="Do you know your main cause of churn?">
        <p style={answer}>A hunch, not confirmed — 7 pts</p>
      </Disclosure>
    </Disclosure>
  </div>
);

/** `rule={false}`, for a disclosure that sits inside something already framed. */
export const NoRule = () => (
  <div style={{ maxWidth: 460 }}>
    <Disclosure rule={false} summary="Only visible to you">
      <p style={line}>Your answers are stored on this device, never on the shared page.</p>
    </Disclosure>
  </div>
);
