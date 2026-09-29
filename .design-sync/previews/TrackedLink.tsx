import { ProseText, TrackedLink } from "tour-de-growth";

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

/** The footer's credit: small mono, muted, the link in the link colour. */
const credit = { font: "var(--meta-xs)", color: "var(--text-muted)", margin: 0 } as const;
const creditLink = { color: "var(--text-link)", textDecoration: "underline", textUnderlineOffset: 3 } as const;

/** The /about page's prose links. */
const proseLink = { color: "var(--text-link)", textDecoration: "underline", textUnderlineOffset: "0.15em" } as const;

/** The site footer's link to Antoine's CV — descriptive anchor text, on purpose: it is the only SEO lever this link has. */
export const FooterCredit = () => (
  <p style={credit}>
    A side project by{" "}
    <TrackedLink
      href="https://cv.antoine.berthaud.me/en/"
      target="_blank"
      rel="noopener"
      event="profile_click"
      detail="sitefooter_cv"
      style={creditLink}
    >
      Antoine Berthaud — Senior Growth PM
    </TrackedLink>
    .
  </p>
);

/** Inside running text: the contact line of the About page, two TrackedLinks (`about_linkedin`, `about_cv`) set as the page's prose links. */
export const AboutContact = () => (
  <div style={{ maxWidth: 760 }}>
    <ProseText>
      A question about the method, a score you disagree with, or a growth problem you&apos;d like an outside eye on:{" "}
      <TrackedLink
        href="https://www.linkedin.com/in/antoine-berthaud-pm/"
        target="_blank"
        rel="noopener"
        event="profile_click"
        detail="about_linkedin"
        style={proseLink}
      >
        message me on LinkedIn
      </TrackedLink>
      , or{" "}
      <TrackedLink
        href="https://cv.antoine.berthaud.me/en/"
        target="_blank"
        rel="noopener"
        event="profile_click"
        detail="about_cv"
        style={proseLink}
      >
        read my background
      </TrackedLink>
      .
    </ProseText>
  </div>
);

/**
 * `detail` is optional — without it the event is just its own name. No
 * TrackedLink in the product omits it today: `take_own_tour`, the one event
 * this shows, is fired by the shared result's primary Button, not by a link.
 */
export const NoDetail = () => (
  <p style={{ font: "var(--body-md)", color: "var(--text-body)", margin: 0 }}>
    <TrackedLink href="/quiz" event="take_own_tour" style={creditLink}>
      Take your own Tour →
    </TrackedLink>
  </p>
);
