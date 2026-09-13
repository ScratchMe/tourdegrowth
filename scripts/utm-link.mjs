#!/usr/bin/env node
/**
 * utm-link.mjs — Tour de Growth
 *
 * Generates a ready-to-paste, UTM-tagged link for a channel of
 * GROWTH-PLAN.md. Not part of the Next.js app — this never runs in the
 * browser or on Vercel, it is a local convenience for whoever is about to
 * post a link somewhere. The vocabulary itself lives in `utm-channels.mjs`
 * (tested); this file is only the command line around it.
 *
 * Usage:
 *   node scripts/utm-link.mjs <channel> [path]
 *   node scripts/utm-link.mjs reddit_roastmystartup
 *   node scripts/utm-link.mjs directory:uneed /en
 *   node scripts/utm-link.mjs newsletter:growthunhinged /en/glossary/aarrr
 *   node scripts/utm-link.mjs --list
 */
import { buildUtmUrl, CHANNELS, DEFAULT_SITE_URL, DYNAMIC_PREFIXES, KNOWN_DIRECTORIES } from "./utm-channels.mjs";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL).replace(/\/$/, "");

function printList() {
  console.log("Fixed channels (key → utm_source → utm_campaign):\n");
  for (const [key, { source, campaign }] of Object.entries(CHANNELS)) {
    console.log(`  ${key.padEnd(24)} ${source} → ${campaign}`);
  }
  console.log("\nOpen families (key → utm_source → utm_campaign):\n");
  for (const [prefix, { campaign }] of Object.entries(DYNAMIC_PREFIXES)) {
    console.log(`  ${`${prefix}:<slug>`.padEnd(24)} ${prefix}_<slug> → ${campaign}`);
  }
  console.log(`\nDirectories named in GROWTH-PLAN.md: ${KNOWN_DIRECTORIES.map((d) => `directory:${d}`).join(", ")}`);
  console.log("\nUsage: node scripts/utm-link.mjs <channel> [path]");
}

const [, , channelArg, pathArg] = process.argv;

if (!channelArg || channelArg === "--list" || channelArg === "-l") {
  printList();
  process.exit(channelArg ? 0 : 1);
}

const url = buildUtmUrl(channelArg, pathArg ?? "/", SITE_URL);
if (!url) {
  console.error(`Unknown channel "${channelArg}".\n`);
  printList();
  process.exit(1);
}

console.log(url);
