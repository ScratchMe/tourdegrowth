# design-sync notes — Tour de Growth

Repo-specific gotchas for `/design-sync`. Read this before re-running.

## This repo is an app, not a component package

There is no `dist/`, no `exports`, no `main`, no Storybook. The design system
lives at `src/components/**` and is consumed only by the Next app in the same
repo. Consequences, all already encoded in `config.json`:

- **`--entry` must be given, and must NOT exist.** The converter derives
  `PKG_DIR` by walking up from `dirname(--entry)` to the nearest named
  `package.json`; without `--entry` it looks for `node_modules/tour-de-growth`
  and dies with `ENOENT`. But if `--entry` *resolves*, `resolveDistEntry`
  succeeds and the synth-from-src path never runs — you get
  `[ZERO_MATCH] no component exports` and a tokens-only bundle. So pass a
  deliberately absent path inside the repo:

  ```sh
  node .ds-sync/package-build.mjs --config .design-sync/config.json \
    --node-modules ./node_modules --entry ./dist/index.js --out ./ds-bundle
  ```

  The `[NO_DIST] --entry ./dist/index.js doesn't exist` line is expected, not
  a failure.
- **`srcDir` is `src/components`, not `src`.** Scanning all of `src/` sweeps
  in every page component (`ResultPage`, `RootShell`, `PreviewCard`, …). The
  five subdirectories become the five groups the repo already uses —
  `brand`, `core`, `glossary`, `quiz`, `result` — because `GENERIC_DIR` in
  `lib/source-kit.mjs` skips a `components/` level.
- **No build step to re-run.** `cfg.buildCmd` is deliberately absent: the
  converter reads `.tsx` sources directly. `npm run build` builds the *app*
  and produces nothing the converter uses.

## `next/link` is shimmed — this is the one that costs a whole afternoon

Six components render a Next `Link` when given an `href` (`Button`,
`WordmarkLink`, `LocaleSwitcher`, `SiteFooter`, `TrackedLink`, `LegalPage`).
Next's compiler replaces a dozen `process.env.__NEXT_*` constants inside that
module; plain esbuild leaves them as real reads, so the IIFE threw
`ReferenceError: process is not defined` **before assigning
`window.TourDeGrowth`**. Symptom: `[BUNDLE_EXPORT] 35/35 not a component`
plus `[RENDER_ERRORS]` on all 35 previews — one root cause, 36 error lines.

`.design-sync/shims/next-link.tsx` renders the `<a href>` that `next/link`
renders anyway; what it drops is client-side routing, which a design canvas
has no use for. Wired by `paths` in `.design-sync/tsconfig.ds.json`. Bundle
went 280 KB → 127 KB (the whole router graph left with it).

**`tsconfig.ds.json` must be standalone and must contain no `"//"` key.**
`tsconfigPathsPlugin` reads the file directly — it does not follow `extends`,
so the `@/*` alias has to be repeated there. And its comment-stripper
(`/(^|[^:])\/\/.*$/gm`) eats a `"//": "..."` documentation key, the JSON then
fails to parse, and the plugin returns `null` **silently**: no alias fires,
`next/link` comes back, and nothing in the log says why. Cost me one full
rebuild to spot.

## Tokens come in through the JS graph, not `cssEntry`

`cfg.cssEntry: src/app/globals.css` **appends** that file verbatim to
`_ds_bundle.css`, where its five `@import "../styles/tokens/*.css"` lines no
longer resolve — `[CSS_IMPORT_MISSING]` ×5 and 95 undefined custom
properties. `cfg.tokensGlob` cannot fix it either: `copyTokens` returns early
unless `cfg.tokensPkg` names a package under `node_modules`, and these tokens
live in the repo.

Fix: `.design-sync/shims/ds-styles.ts` imports `globals.css`, and is wired via
`cfg.extraEntries`. esbuild then resolves and inlines the whole `@import`
chain exactly as it does each component's `.module.css`. Result: 123 tokens
defined against 105 referenced.

## Fonts load from the font host, deliberately

`.design-sync/shims/ds-fonts.css` (imported first by `ds-styles.ts`) carries a
single Google Fonts `@import` for Inter 400/500/600/700, IBM Plex Mono
500/600 and Stardos Stencil 700 — exactly the weights `root-shell.tsx`
requests, so a design cannot use a weight the product cannot render.

The app self-hosts these through `next/font/google`, which binds
`--font-ui`/`--font-mono`/`--font-display` on `<body>` at build time. None of
that exists in a canvas, and `typography.css`'s `:root` fallback would have
rendered every design in system-ui, silently.

The five `.ttf` files in `src/lib/og/fonts/` are **not** usable here: they are
~230-glyph subsets cut for Satori's share images. Fine for that image's fixed
strings, a silent glyph hole for anything a designer types.

`"Impact"` also shows up in `[FONT_MISSING]` — it is the middle of
`--font-display: "Stardos Stencil", "Impact", sans-serif`, a system-font
fallback with nothing to ship. Expected, not actionable.

## Not synced to a project yet

`DesignSync` needs an authorization this environment cannot obtain:

> DesignSync needs design-system authorization, and /design-login cannot run
> in this non-interactive session. Ask the user to run /design-login once from
> an interactive Claude Code session on this machine — headless and SDK runs
> here then reuse that authorization. If this is claude.ai/code, ask them
> instead to use Claude Design's "Send to Claude Code Web" (which seeds the
> project into the workspace) or to provide the project files directly.

So `config.json` has **no `projectId`**, and nothing has been uploaded. The
bundle is built and validated locally. To finish, from an interactive session
on Antoine's machine: `/design-login`, then `/design-sync` — it will re-read
this config, rebuild deterministically, create the project and upload.

## Re-sync risks

- **The `--entry ./dist/index.js` trick breaks the day the repo gains a real
  `dist/`.** If a build is ever added, drop the flag and set `cfg.buildCmd`.
- **`next-link.tsx` mirrors an API surface that can drift.** If a component
  starts using a `next/link` prop the shim doesn't accept, TypeScript in the
  app stays happy and only the converter notices. Re-read it against
  `next/link`'s props on any Next major.
- **The font `@import` is a network dependency at render time.** It resolves
  from this sandbox (checked: HTTP 200), and the artifact CSP allows
  `fonts.googleapis.com` / `fonts.gstatic.com`. If either changes, ship real
  binaries via `cfg.extraFonts` — full-charset ones, not the Satori subsets.
- **Nothing pins the converter's own version.** `.ds-sync/` is re-copied from
  the skill on every run, so a future skill release can change the output
  contract under an unchanged config.
