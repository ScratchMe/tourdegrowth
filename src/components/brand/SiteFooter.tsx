"use client";

import Link from "next/link";
import { ANTOINE_LINKS, SITE_FOOTER_CREDIT } from "@/content/antoine-credit";
import { PROFILE_CLICK_DETAILS, trackEvent } from "@/lib/analytics/goatcounter";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import styles from "./SiteFooter.module.css";

const SITE_FOOTER_CV_DETAIL = PROFILE_CLICK_DETAILS[3];

export interface SiteFooterProps {
  locale: Locale;
  /**
   * Match the container the page itself uses, so the footer's rule and text
   * line up with the content above it: `wide` for the app shell (landing,
   * result), `reading` for the narrower prose column (How it works,
   * glossary).
   */
  width?: "wide" | "reading";
}

/**
 * The site footer — added on Antoine's request (2026-09-05), on an SEO
 * consultant's recommendation to link his CV from every page.
 *
 * There was no footer at all before this: the CV was only reachable from the
 * two credit placements on a result page (SPEC-ADDENDUM-02.md §2), so none of
 * the pages actually meant to be indexed (landing, How it works, the 15
 * glossary pages) linked to it. The link is a plain followable one — no
 * `nofollow` — since passing that signal is the entire point.
 *
 * The internal links are here for the same reason and not just as padding: a
 * footer that appears on every page gives crawlers a consistent path to How
 * it works and the glossary from anywhere on the site.
 *
 * Deliberately absent from `/quiz` and `/deep-dive/[id]`: those are the two
 * flows the product exists to get people through, and a footer full of exits
 * halfway down a 15-question funnel works against that. Neither is in the
 * sitemap either, so nothing is lost on the SEO side.
 *
 * A Client Component only because of `trackEvent`; it renders fine inside the
 * Server Components that use it.
 */
export function SiteFooter({ locale, width = "wide" }: SiteFooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.inner} ${styles[width]}`}>
        <nav className={styles.nav}>
          <Link href="/how-it-works" className={styles.navLink}>
            {tc(UI_STRINGS.nav.howItWorks, locale)}
          </Link>
          <Link href="/glossary" className={styles.navLink}>
            {tc(UI_STRINGS.nav.glossary, locale)}
          </Link>
        </nav>

        <p className={styles.credit}>
          {tc(SITE_FOOTER_CREDIT.prefix, locale)}
          <a
            className={styles.creditLink}
            href={ANTOINE_LINKS.cv}
            target="_blank"
            // `noopener` only, no `noreferrer`: the point of this link is
            // traffic to the CV site, and `noreferrer` would strip the
            // Referer header so that site's own analytics could never
            // attribute any of it back here. `noopener` alone already
            // closes the tabnabbing hole.
            rel="noopener"
            onClick={() => trackEvent("profile_click", SITE_FOOTER_CV_DETAIL)}
          >
            {tc(SITE_FOOTER_CREDIT.linkText, locale)}
          </a>
          {tc(SITE_FOOTER_CREDIT.suffix, locale)}
        </p>
      </div>
    </footer>
  );
}
