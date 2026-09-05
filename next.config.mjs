/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Next.js 16 otherwise auto-appends an "agent rules" block to CLAUDE.md on
  // every `next dev` run. CLAUDE.md here is a hand-maintained living doc
  // (see its own "Ce fichier est vivant" section) — keep it free of
  // build-tool-generated content.
  agentRules: false,

  async rewrites() {
    return [
      /**
       * Legacy alias for the result OG image — REVIEW.md R-24.
       *
       * Moving the app routes into the `(app)` route group renamed this
       * metadata route: Next appends a hash to any `opengraph-image` whose
       * parent path contains a group segment, to keep two groups from
       * colliding (`next/dist/lib/metadata/get-metadata-route.js`,
       * `getMetadataRouteSuffix`). So `/r/<id>/opengraph-image` became
       * `/r/<id>/opengraph-image-1u74ed`.
       *
       * The `og:image` tag points at the new address, so every fresh scrape
       * is correct. This alias is for the shares already out there, scraped
       * before the rename — SPEC.md §12 is explicit that a URL dying months
       * after a share breaks the growth loop.
       *
       * The suffix is hard-coded because it is generated at build time. That
       * is only safe because a spec pins it: `e2e/locale-routing.spec.ts`
       * fetches this legacy path and requires a real PNG, so if Next ever
       * changes the hash the suite goes red instead of the alias silently
       * pointing at nothing.
       */
      {
        source: "/r/:id/opengraph-image",
        destination: "/r/:id/opengraph-image-1u74ed",
      },
    ];
  },
};

export default nextConfig;
