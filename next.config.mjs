/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Next.js 16 otherwise auto-appends an "agent rules" block to CLAUDE.md on
  // every `next dev` run. CLAUDE.md here is a hand-maintained living doc
  // (see its own "Ce fichier est vivant" section) — keep it free of
  // build-tool-generated content.
  agentRules: false,

  /**
   * HTTP security headers — REVIEW-02.md R2-18. Until this block the app
   * shipped none of its own (only the HSTS header Vercel adds), so `/r/<id>`
   * — a public page with real actions on it — could be framed by any site.
   *
   * Static, so they cost nothing and don't touch the rendering mode: the 36
   * content pages stay prerendered (R-24). What is deliberately NOT here:
   *
   * - A `script-src` CSP. Next's inline bootstrap and RSC payload scripts
   *   carry per-request content, so a real `script-src` needs a nonce minted
   *   per request in `proxy.ts`, which would make every route dynamic again
   *   and undo R-24. That is a separate decision, to start in Report-Only.
   *   `frame-ancestors` alone is the clickjacking control and needs no nonce.
   * - `Strict-Transport-Security`: Vercel sets `max-age=63072000` on every
   *   response already; repeating it adds nothing, and `includeSubDomains`
   *   would be a commitment about subdomains nobody has decided on.
   *
   * And one value that must not be "hardened": `Referrer-Policy` stays at
   * `strict-origin-when-cross-origin`, never `no-referrer`. The credit links
   * to Antoine's CV are deliberately `noopener` without `noreferrer` so the
   * CV's analytics can attribute that traffic (CLAUDE.md, site footer
   * entry); a `no-referrer` policy would silently undo that.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          // The pre-CSP spelling of the same rule, for anything old enough to need it.
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },

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
