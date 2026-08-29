#!/usr/bin/env node
/**
 * utm-link.mjs — Tour de Growth
 *
 * Generates a ready-to-paste, UTM-tagged link for a given distribution
 * channel from the growth plan (growth-plan Phase 2026-08-29). Not part of
 * the Next.js app — this never runs in the browser or on Vercel, it's a
 * local convenience for whoever is about to post a link somewhere.
 *
 * Why this exists at all rather than just typing `?utm_source=...` by hand:
 * GoatCounter parses `utm_source`/`utm_campaign` (and the aliases `ref`,
 * `src`, `source`, `campaign`) straight off the query string of every
 * *pageview* hit, completely automatically — confirmed by reading
 * GoatCounter's own source (hit.go's `Defaults()`), not assumed. No app
 * code, no dashboard setting. So the only real risk is a messy, ad hoc
 * vocabulary (`Reddit_SaaS`, `reddit-saas-launch`, `redditSaaS`, ...) that
 * fragments the same channel into three rows in GoatCounter's Campaigns/
 * Referrers widgets. This script is just that fixed vocabulary, enforced.
 *
 * Usage:
 *   node scripts/utm-link.mjs <channel> [path]
 *   node scripts/utm-link.mjs reddit_saas
 *   node scripts/utm-link.mjs linkedin /glossary/aarrr
 *   node scripts/utm-link.mjs --list
 */

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://tourdegrowth.com").replace(/\/$/, "");

// utm_source: the exact channel/community — kept specific enough that two
// different subreddits or two different Slacks never collapse into one row.
// utm_campaign: the growth-plan phase/wave that channel belongs to — lets
// you later ask "did the whole launch week pay off" as one query, not
// fifteen. Both map directly onto the phases in the growth-plan artifact.
const CHANNELS = {
  // Phase 1 — launch window
  producthunt: { source: "producthunt", campaign: "launch_week" },
  hackernews: { source: "hackernews", campaign: "launch_week" },
  indiehackers: { source: "indiehackers", campaign: "launch_week" },
  reddit_saas: { source: "reddit_saas", campaign: "launch_week" },
  reddit_startups: { source: "reddit_startups", campaign: "launch_week" },
  reddit_growthhacking: { source: "reddit_growthhacking", campaign: "launch_week" },
  reddit_marketing: { source: "reddit_marketing", campaign: "launch_week" },
  linkedin: { source: "linkedin", campaign: "launch_week" },
  twitter: { source: "twitter", campaign: "launch_week" },
  network_dm: { source: "network_dm", campaign: "launch_week" },
  slack_demandcurve: { source: "slack_demandcurve", campaign: "launch_week" },
  slack_growthmakers: { source: "slack_growthmakers", campaign: "launch_week" },
  slack_revgenius: { source: "slack_revgenius", campaign: "launch_week" },

  // Phase 2 — compounding SEO / content
  guest_post: { source: "guest_post", campaign: "seo_content" },
  directory_listing: { source: "directory_listing", campaign: "seo_content" },

  // Phase 3 — seeding & partnerships
  influencer_dm: { source: "influencer_dm", campaign: "seeding" },
  podcast: { source: "podcast", campaign: "seeding" },
  newsletter_swap: { source: "newsletter_swap", campaign: "seeding" },

  // Phase 4 — paid (once it's actually turned on — see CLAUDE.md's flag)
  paid_linkedin: { source: "linkedin", campaign: "paid" },
  paid_reddit: { source: "reddit", campaign: "paid" },
  paid_google: { source: "google", campaign: "paid" },
};

function printList() {
  console.log("Available channels (utm_source → utm_campaign):\n");
  for (const [key, { source, campaign }] of Object.entries(CHANNELS)) {
    console.log(`  ${key.padEnd(22)} ${source} → ${campaign}`);
  }
  console.log("\nUsage: node scripts/utm-link.mjs <channel> [path]");
}

const [, , channelArg, pathArg] = process.argv;

if (!channelArg || channelArg === "--list" || channelArg === "-l") {
  printList();
  process.exit(channelArg ? 0 : 1);
}

const channel = CHANNELS[channelArg];
if (!channel) {
  console.error(`Unknown channel "${channelArg}".\n`);
  printList();
  process.exit(1);
}

const path = pathArg ? (pathArg.startsWith("/") ? pathArg : `/${pathArg}`) : "/";
const url = new URL(SITE_URL + path);
url.searchParams.set("utm_source", channel.source);
url.searchParams.set("utm_campaign", channel.campaign);

console.log(url.toString());
