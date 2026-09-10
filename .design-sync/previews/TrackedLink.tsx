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
 */

/** The site footer's link to Antoine's CV — descriptive anchor text, on purpose: it is the only SEO lever this link has. */
export const FooterCredit = () => (
  <p style={{ font: "13px/1.5 'IBM Plex Mono', monospace", margin: 0 }}>
    A side project by{" "}
    <TrackedLink href="https://cv.antoine.berthaud.me" event="profile_click" detail="sitefooter_cv">
      Antoine Berthaud — Senior Growth PM
    </TrackedLink>
  </p>
);

/** The same component on the result screen's score-card credit line. */
export const ResultCredit = () => (
  <p style={{ font: "13px/1.5 'IBM Plex Mono', monospace", margin: 0 }}>
    Built by{" "}
    <TrackedLink href="https://cv.antoine.berthaud.me" event="profile_click" detail="footer_cv">
      Antoine Berthaud
    </TrackedLink>
  </p>
);

/** `detail` is optional — without it the event is just its own name. */
export const NoDetail = () => (
  <TrackedLink href="/quiz" event="take_own_tour">
    Take your own Tour →
  </TrackedLink>
);
