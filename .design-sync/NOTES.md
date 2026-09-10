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
- **`cfg.buildCmd` emits declarations, and it is load-bearing.** It runs
  `npx tsc -p .design-sync/tsconfig.dts.json`, which writes real `.d.ts` into
  `dist/types/`. That is where the emitted contracts come from — see
  "The emitted contracts come from `dist/types`" below for what happens
  without it. `npm run build` builds the *app* and produces nothing the
  converter uses.

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

## Fonts ship as files

`.design-sync/fonts/` holds four woff2 (104 KB total) and `brand-fonts.css`,
wired through `cfg.extraFonts`. The converter copies them to `ds-bundle/fonts/`
and rewrites the `src` paths.

The app self-hosts these through `next/font/google`, which binds
`--font-ui`/`--font-mono`/`--font-display` on `<body>` at build time. None of
that exists in a canvas, and `typography.css`'s `:root` fallback would have
rendered every design in system-ui, silently.

**Shipped rather than `@import`-ed from the font host**, which is what this
first did: a remote import makes every headless render wait on the network,
and the render check went from about two minutes to an estimated eighteen.

**Inter is ONE file, not four.** Google serves the latin subset as a variable
font and returns the same URL for all four weights — verified against the
css2 endpoint, not assumed. It is declared once as `font-weight: 100 900`,
which instantiates the wght axis; four single-weight faces shipped the same
48 KB four times. Plex Mono is not variable, so 500 and 600 are genuinely
different files. Verified in Chromium by measuring rendered text: Inter gives
four distinct widths across 400/500/600/700, and the two Plex Mono weights
render different pixels (a monospace font has one advance width, so width
alone proves nothing there).

Use `format("woff2")`, not `format("woff2-variations")` — the latter is
deprecated syntax that some parsers reject, and Google's own CSS uses the
plain form for this same variable file.

The five `.ttf` files in `src/lib/og/fonts/` are **not** usable here: they are
~230-glyph subsets cut for Satori's share images. Fine for that image's fixed
strings, a silent glyph hole for anything a designer types.

`"Impact"` shows up in `[FONT_MISSING]` and stays there — it is the middle of
`--font-display: "Stardos Stencil", "Impact", sans-serif`, a system-font
fallback. It is also a proprietary Microsoft face we have no right to
redistribute, so this warning is permanent and correct.

**Font debugging trap.** Fonts are always fetched in CORS mode, and
`page.setContent()` gives a page `origin: null` — so a harness built that way
reports every family falling back to the same substitute, which looks exactly
like broken `@font-face` rules. Serve the test page from the same origin as
the fonts. Three unrelated typefaces measuring identical widths is the tell.

## The emitted contracts come from `dist/types`

`findTypesRoot` prefers `dist/types` over the package root, and the ts-morph
project loads **only `.d.ts`, never `.tsx`**. If `dist/types/` is missing or
stale, the search falls back to the repo root — where the only `.d.ts` files
are the handoff bundles under `design/ds-extension-0{1,3}-return/`. Those
describe the API the design *asked for*, not the one that shipped, and the
converter will happily emit them: measured drift included `ScoreDisplay`
still carrying `verdict` (removed in extension 03), `PriorityMove` missing
`pillar`/`score`/`total`/`upgrade`, and `Button` missing `href`/`compact`.

Check the build log for `[DTS] parsed N .d.ts files from .../dist/types` — if
that path is not `dist/types`, the contracts are wrong.

`tsconfig.dts.json`'s `include` is narrowed to `../src/components/**/*` on
purpose. Widening it reaches `src/proxy.ts` and `lib/i18n/meta.ts`, which
import Next, which pulls in `@vercel/og`'s `declare module 'react'` — and a
Tailwind `tw?: string` prop then appears on 21 of the 34 contracts. Verify
with `grep -rl 'from "next' dist/types/` returning nothing.

`next-env.d.ts` is deliberately out of the graph (it drags in Next's global
JSX augmentation); `.design-sync/types/css-modules.d.ts` replaces the part
that is actually needed.

## `LegalPage` is excluded on purpose

`componentSrcMap: {"LegalPage": null}`. It is the only component with an
inline destructured prop type instead of a named `<Name>Props` interface, so
`propsBodyFor` finds nothing and emits `[key: string]: unknown` — a contract
that says nothing. It also imports a page-level CSS module. It renders whole
legal documents from data and is not a design primitive.

## The two standing validate warnings

Both are non-blocking and both are expected:

- `[FONT_MISSING] "Impact"` — the system-font fallback above.
- `[GRID_OVERFLOW] DefinitionPopover (Docked)` — the check is a **property**
  test, not a geometry one: `package-validate.mjs` flags any visible
  descendant with computed `position: fixed`, which the docked placement has
  by design. The suggested fix (`cardMode: "single"`) would show one story and
  hide the other three. The `Docked` story instead frames the sheet in a
  transformed, clipped 300×240 box that stands in for a phone viewport, which
  was **checked in the screenshot** and presents correctly. Keeping the grid
  also keeps the card under `compare.mjs`'s `[PORTAL?]` monitoring, which
  `single` would exempt it from.

## Previews are all repo-owned

All 34 live in `.design-sync/previews/` — none are generated. Copy is the
product's own, pulled from `dictionary.ts`, `copy-library.ts` and
`how-it-works.ts` rather than invented, so the cards read as the real product.

`ShareCard.tsx` imports `share-sample.png`, a real 1200×630 render of
`/r/sample` captured from a production build; esbuild inlines it as a data URI
via the same `.png` loader the bundler uses. **Do not** reuse the OG captures
in `design/ds-extension-03/` for this — they predate extension 03 and still
show the five pillar rows that release removed.

`PillarChip`'s `Stretch` story reproduces a real production defect (the row
spaces all four children apart instead of pairing the score). It is documented
in the story's own doc comment so the design agent does not copy it. The fix
belongs in the component's CSS, as its own change.

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
- **The shipped fonts are a snapshot.** They were downloaded from Google
  Fonts once. Nothing re-fetches them, which is the point — but if Inter's
  latin subset is ever re-cut upstream, this copy will not follow.
- **`dist/types/` is generated, not committed.** `cfg.buildCmd` regenerates
  it, but a run that skips the build step against a stale or missing
  `dist/types/` silently emits the wrong contracts (see above).
- **Nothing pins the converter's own version.** `.ds-sync/` is re-copied from
  the skill on every run, so a future skill release can change the output
  contract under an unchanged config.
