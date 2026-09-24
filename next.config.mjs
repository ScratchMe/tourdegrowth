/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Next.js 16 otherwise auto-appends an "agent rules" block to CLAUDE.md on
  // every `next dev` run. CLAUDE.md here is a hand-maintained living doc
  // (see its own "Ce fichier est vivant" section) — keep it free of
  // build-tool-generated content.
  agentRules: false,

  /**
   * The game's flag as it stood at build — GAME-BRIEF.md 13.1-13.2.
   *
   * The footer shows « Le jeu » only when the game is open, and the footer is
   * also rendered by the error boundaries, which are Client Components: they
   * cannot read a server variable, so the link would be missing on exactly
   * those pages (the dead end `/metrics` hit on 2026-09-07). `env` inlines a
   * value at build into both bundles. What is inlined is a derived "1"/"0",
   * never `GAME_ENABLED` itself, which stays server-only (13.1).
   *
   * The rule is written here and not imported from `src/lib/game/build-flag.ts`
   * because this file is plain ESM that Node loads before anything compiles
   * TypeScript. `src/__tests__/next-config.test.ts` holds the two to the same
   * answer for every value of the variable, so they cannot drift.
   */
  env: {
    TDG_GAME_OPEN_AT_BUILD: process.env.GAME_ENABLED === "true" ? "1" : "0",
  },

  /**
   * Keep `sharp` out of the serverless function — 2026-09-13.
   *
   * The Hobby plan caps "Functions Storage" — the summed size of the function
   * bundles of every retained deployment — at 10 GB, and this project stood at
   * 9.24 GB. Measured on a local production build, the traced function weighed
   * 62 MB, of which 48 MB was `sharp` and its two libvips builds
   * (`@img/sharp-libvips-linux-x64`, `-linuxmusl-x64`, plus a 9 MB wasm) — an
   * optional dependency Next traces in for `next/image`, which this app has
   * never used: the only images are static files, and the share picture is a
   * PNG rendered by `next/og`, whose rasteriser is resvg, not sharp.
   *
   * `images.unoptimized` states that intent (no `/_next/image` route to
   * serve), and the tracing exclude is what actually removes the bytes.
   * Measured with `vercel build` (the Build Output the platform stores):
   * one deployment is six functions, four of which each carried the full
   * 48 MB of sharp — 241 MB per deployment before, 48 MB after.
   * `src/__tests__/next-config.test.ts` pins both settings, so a later
   * `next/image` cannot be added without a decision.
   *
   * The third entry, added the same day: `@vercel/og` ships both a Node and
   * an Edge build of its renderer, and Next traces both into any function
   * that can reach it. Nothing in this app runs on the Edge runtime — the
   * test asserts that, because it is what makes the exclude safe — so the
   * Edge build is 734 KB of dead weight in four of the six functions.
   * 48.4 MB per deployment → 45.5 MB. Verified by moving the file out of
   * node_modules and serving the build: every page and all four share
   * images still answer with a valid 1200×630 PNG.
   *
   * What was tried and reverted, so nobody spends the afternoon again: the
   * rest of `@vercel/og` (3.2 MB of satori + resvg) sits in two functions
   * that render no image at all — the content pages and the app routes —
   * because Turbopack puts it in a chunk those pages share with the
   * `opengraph-image` route of their own segment. Excluding it per route
   * does not work: the keys of `outputFileTracingExcludes` are globs, so
   * `[id]` and `[locale]` read as character classes rather than literal
   * segments, and the first attempt silently stripped satori from the image
   * routes too — a build that passes every test and ships broken link
   * previews. Escaping the brackets did not fix it either. Leave it.
   */
  images: { unoptimized: true },
  outputFileTracingExcludes: {
    "*": [
      "./node_modules/sharp/**",
      "./node_modules/@img/**",
      "./node_modules/next/dist/compiled/@vercel/og/index.edge.js",
    ],
  },

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

  /**
   * Un terme de glossaire retiré garde son adresse vivante.
   *
   * `/glossary/activation-rate` a été publié le 2026-09-14 et soumis à
   * IndexNow le matin même ; il est coupé le soir comme quasi-doublon de
   * `/glossary/activation` (même formule, même forme d'exemple, deux
   * questions de FAQ identiques au mot près — décision d'Antoine). Sans
   * cette redirection l'URL renverrait 404, parce que `dynamicParams =
   * false` refuse tout segment qui n'est plus dans `generateStaticParams`.
   *
   * 308 et non 307 : la page ne reviendra pas, et c'est ce qui transfère le
   * signal au terme qui garde le contenu. L'adresse non préfixée
   * (`/glossary/activation-rate`) passe d'abord par la 308 du proxy vers sa
   * forme localisée, puis par celle-ci — deux sauts, dans ce que Google
   * tolère et ce que ce dépôt pratique déjà pour les URL d'avant R-13.
   */
  async redirects() {
    return [
      {
        source: "/:locale(en|fr)/glossary/activation-rate",
        destination: "/:locale/glossary/activation",
        permanent: true,
      },
    ];
  },

  async rewrites() {
    return [
      /**
       * The two addresses a result's share image has had, kept alive for the
       * shares already scraped under them — SPEC.md §12 is explicit that a
       * URL dying months after a share breaks the growth loop.
       *
       * `/r/<id>/opengraph-image` is from before the `(app)` route group
       * (REVIEW.md R-24); `/r/<id>/opengraph-image-1u74ed` is the hashed
       * name Next gave the metadata route inside the group (it appends a
       * hash to any `opengraph-image` whose parent path contains a group
       * segment — `next/dist/lib/metadata/get-metadata-route.js`). Since
       * 2026-09-14 the image is a route handler with a version token in its
       * path (`lib/og/share-image.ts`), and both old addresses map to the
       * `legacy` token, which renders the current picture and is cached for
       * an hour rather than as immutable, because its content can still
       * change. `e2e/locale-routing.spec.ts` requests both and expects a
       * PNG, so neither alias can rot silently.
       */
      { source: "/r/:id/opengraph-image", destination: "/r/:id/share/legacy.png" },
      { source: "/r/:id/opengraph-image-1u74ed", destination: "/r/:id/share/legacy.png" },
    ];
  },
};

export default nextConfig;
