/**
 * The domain shown on the OG share image (DESIGN-BRIEF.md §03) and used to
 * build absolute share URLs. SPEC.md §11 lists the real domain as not yet
 * chosen — reading it from an env var (falling back to the design's own
 * "tourdegrowth.com") means nothing here needs to change once it is.
 */
const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const SITE_URL = rawSiteUrl ? rawSiteUrl.replace(/\/$/, "") : "https://tourdegrowth.com";

/** Just the host, no protocol — what the OG image's bottom-right badge displays. */
export const SITE_DOMAIN_LABEL = SITE_URL.replace(/^https?:\/\//, "");
