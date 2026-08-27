/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Next.js 16 otherwise auto-appends an "agent rules" block to CLAUDE.md on
  // every `next dev` run. CLAUDE.md here is a hand-maintained living doc
  // (see its own "Ce fichier est vivant" section) — keep it free of
  // build-tool-generated content.
  agentRules: false,
};

export default nextConfig;
