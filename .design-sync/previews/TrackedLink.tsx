import { TrackedLink } from "tour-de-growth";

/*
 * A plain link that also fires one GoatCounter event. It exists so a Server
 * Component page can carry an instrumented link without the whole page
 * becoming a Client Component — the site footer is a server component and
 * this ten-line island is the only client code in it.
 *
 * `event` and `detail` become the path `event/detail` in the dashboard. Those
 * names are read back by an exact-match list when the funnel is computed, so
 * a name invented here that is not in `lib/analytics/goatcounter.ts` is a
 * click the dashboard silently under-counts.
 *
 * IT SHIPS NO STYLES OF ITS OWN — it renders a bare <a> and inherits colour
 * from whatever contains it (SiteFooter's stylesheet paints it `--text-link`).
 * Rendered with nothing around it, it would fall back to the browser's default
 * blue, which is not what the product looks like anywhere; the link tokens are
 * therefore applied here the way the real containers apply them. When you
 * place one, style the surrounding block, not the link.
 */

const LINK = {
  color: "var(--text-link)",
  textDecoration: "underline",
  textUnderlineOffset: 3,
} as const;

const credit = { font: "13px/1.5 'IBM Plex Mono', monospace", margin: 0 } as const;

/** The site footer's link to Antoine's CV — descriptive anchor text, on purpose: it is the only SEO lever this link has. */
export const FooterCredit = () => (
  <p style={credit}>
    A side project by{" "}
    <TrackedLink
      href="https://cv.antoine.berthaud.me"
      event="profile_click"
      detail="sitefooter_cv"
      style={LINK}
    >
      Antoine Berthaud — Senior Growth PM
    </TrackedLink>
  </p>
);

/** The same component on the result screen's score-card credit line. */
export const ResultCredit = () => (
  <p style={credit}>
    Built by{" "}
    <TrackedLink
      href="https://cv.antoine.berthaud.me"
      event="profile_click"
      detail="footer_cv"
      style={LINK}
    >
      Antoine Berthaud
    </TrackedLink>
  </p>
);

/** `detail` is optional — without it the event is just its own name. */
export const NoDetail = () => (
  <p style={{ font: "15px/1.5 Inter, sans-serif", margin: 0 }}>
    <TrackedLink href="/quiz" event="take_own_tour" style={LINK}>
      Take your own Tour →
    </TrackedLink>
  </p>
);
