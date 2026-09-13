/**
 * utm-channels.mjs — Tour de Growth
 *
 * The fixed UTM vocabulary behind `scripts/utm-link.mjs`, kept in its own
 * module so a unit test (`src/__tests__/utm-channels.test.ts`) can import
 * it without running the CLI. It follows GROWTH-PLAN.md (2026-09-13) — the
 * plan written under two constraints, no LinkedIn and no name — and the
 * test is what keeps an excluded channel from quietly coming back.
 *
 * Why a fixed vocabulary at all: GoatCounter parses `utm_source` and
 * `utm_campaign` off every pageview automatically (its own `hit.go`, read,
 * not assumed), so the only real risk is an ad hoc spelling (`Reddit_SaaS`,
 * `reddit-saas`, `redditSaaS`) that splits one channel into three rows in
 * the Campaigns/Referrers widgets. `utm_source` names the exact community;
 * `utm_campaign` names the wave of the plan it belongs to, so "did the whole
 * launch pay off" is one query and not fifteen.
 */

/** The waves of GROWTH-PLAN.md §4 that a link can belong to. */
export const CAMPAIGNS = ["launch_week", "seo_content", "directories", "seeding", "paid"];

/**
 * Channels the plan excludes. A source or key containing one of these is
 * refused by the test — the vocabulary is where the constraint is enforced,
 * not a reminder in a document.
 */
export const EXCLUDED = ["linkedin", "podcast", "press", "network_dm"];

export const CHANNELS = {
  // Vague 1 — launch, one day, under the brand pseudonym
  hackernews: { source: "hackernews", campaign: "launch_week" },
  indiehackers: { source: "indiehackers", campaign: "launch_week" },
  reddit_sideproject: { source: "reddit_sideproject", campaign: "launch_week" },
  reddit_roastmystartup: { source: "reddit_roastmystartup", campaign: "launch_week" },
  reddit_imadethis: { source: "reddit_imadethis", campaign: "launch_week" },
  reddit_saas: { source: "reddit_saas", campaign: "launch_week" },
  reddit_startups: { source: "reddit_startups", campaign: "launch_week" },
  reddit_growthhacking: { source: "reddit_growthhacking", campaign: "launch_week" },
  reddit_entrepreneur: { source: "reddit_entrepreneur", campaign: "launch_week" },
  twitter: { source: "twitter", campaign: "launch_week" },
  bluesky: { source: "bluesky", campaign: "launch_week" },
  // Product Hunt without a declared maker (real names are mandatory there):
  // last in the plan, kept in the vocabulary so a listing is still tagged.
  producthunt: { source: "producthunt", campaign: "launch_week" },

  // Vague 2 — content that compounds
  guest_post: { source: "guest_post", campaign: "seo_content" },
  awesome_list: { source: "awesome_list", campaign: "seo_content" },

  // Vague 4 — seeding without a face
  newsletter_swap: { source: "newsletter_swap", campaign: "seeding" },
  reddit_answer: { source: "reddit_answer", campaign: "seeding" },

  // Vague 5 — paid, only on a signal, measured by UTM alone (no pixel)
  paid_reddit: { source: "reddit", campaign: "paid" },
  paid_google: { source: "google", campaign: "paid" },
};

/**
 * Open-ended families: `directory:<slug>` and `newsletter:<slug>`. One row
 * per directory or newsletter in GoatCounter, without listing every one of
 * them here in advance. The slug is lowercase alphanumeric only.
 */
export const DYNAMIC_PREFIXES = {
  directory: { campaign: "directories" },
  newsletter: { campaign: "seeding" },
};

/** The directories GROWTH-PLAN.md §3 names — the `--list` shows them as examples. */
export const KNOWN_DIRECTORIES = [
  "uneed",
  "fazier",
  "microlaunch",
  "peerlist",
  "saashub",
  "alternativeto",
  "betalist",
  "launchingnext",
  "devhunt",
  "smollaunch",
  "startupbase",
  "theresanaiforthat",
  "futurepedia",
  "toolify",
];

/** The canonical host (the apex 308s here and keeps the query string). */
export const DEFAULT_SITE_URL = "https://www.tourdegrowth.com";

/**
 * Resolves a channel key — fixed (`reddit_saas`) or dynamic
 * (`directory:uneed`) — to its `{ source, campaign }`, or `null`.
 */
export function resolveChannel(key) {
  if (Object.hasOwn(CHANNELS, key)) return CHANNELS[key];
  const match = /^([a-z]+):([a-z0-9]+)$/.exec(key);
  if (!match) return null;
  const family = DYNAMIC_PREFIXES[match[1]];
  if (!family) return null;
  return { source: `${match[1]}_${match[2]}`, campaign: family.campaign };
}

export function buildUtmUrl(key, path = "/", siteUrl = DEFAULT_SITE_URL) {
  const channel = resolveChannel(key);
  if (!channel) return null;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(siteUrl.replace(/\/$/, "") + normalizedPath);
  url.searchParams.set("utm_source", channel.source);
  url.searchParams.set("utm_campaign", channel.campaign);
  return url.toString();
}
